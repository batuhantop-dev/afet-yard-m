import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { Source, Layer, Popup, Marker } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowLeft, Route, Activity } from 'lucide-react';
import styles from './InteractiveMap.module.css';

// HARDCODED ORS API KEY
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ5MzlkMmFjOTZhOTQ5YTQ4ZTc0NTg4OGYxYjFmYWY1IiwiaCI6Im11cm11cjY0In0=";

// Carto Positron (Clean, colorless basemap)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// ZEYTINBURNU REGION CONFIGURATION
const ZEYTINBURNU_CENTER = {
  longitude: 28.9050, 
  latitude: 40.9900,
  zoom: 13.5
};

const ASSEMBLY_POINT = { 
  name: 'Zeytinburnu Meydanı Toplanma Alanı', 
  coordinates: [28.9050, 40.9900] 
};

const MEDICAL_FACILITIES = [
  { id: 'h1', name: 'Yedikule Göğüs Hastalıkları Hastanesi', coordinates: [28.9180, 40.9950] },
  { id: 'h2', name: 'Balıklı Rum Hastanesi', coordinates: [28.9130, 40.9930] },
  { id: 'h3', name: 'Zeytinburnu Devlet Hastanesi', coordinates: [28.9040, 40.9880] },
];

// Zeytinburnu Polygon Geometry
const ZEYTINBURNU_COORDS = [
  [28.890, 40.983],
  [28.928, 40.985],
  [28.932, 41.015],
  [28.915, 41.025],
  [28.895, 41.000],
  [28.890, 40.983]
];

// Boundary for Zeytinburnu
const ZEYTINBURNU_POLYGON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ZEYTINBURNU_COORDS]
      }
    }
  ]
};

// Helper to create a 20x20m virtual box exactly at the clicked coordinate
const createVirtualBuilding = (lng, lat) => {
  const dLng = 0.00015;
  const dLat = 0.00015;
  return {
    type: 'Polygon',
    coordinates: [[
      [lng - dLng, lat - dLat],
      [lng + dLng, lat - dLat],
      [lng + dLng, lat + dLat],
      [lng - dLng, lat + dLat],
      [lng - dLng, lat - dLat]
    ]]
  };
};

const InteractiveMap = ({ onBack }) => {
  const [viewState, setViewState] = useState({
    longitude: ZEYTINBURNU_CENTER.longitude, 
    latitude: ZEYTINBURNU_CENTER.latitude,
    zoom: ZEYTINBURNU_CENTER.zoom,
    pitch: 60, 
    bearing: -20
  });

  const [reports, setReports] = useState({});
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Routing State
  const [routeMode, setRouteMode] = useState('idle'); 
  const [activeNearestMode, setActiveNearestMode] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  // Normal left click is for manual routing
  const onClick = useCallback(event => {
    // If routing mode is active, handle manual point selection
    if (routeMode === 'selectStart') {
      setStartPoint([event.lngLat.lng, event.lngLat.lat]);
      setRouteMode('selectEnd');
      return;
    }
    if (routeMode === 'selectEnd') {
      setEndPoint([event.lngLat.lng, event.lngLat.lat]);
      setRouteMode('idle');
      return;
    }
    
    // Close building popup if clicking on map
    setSelectedFeature(null);
  }, [routeMode]);

  // Right click places a virtual building box exactly where clicked
  const onContextMenu = useCallback(event => {
    event.preventDefault(); // Prevent browser context menu
    
    // Create an individual virtual box so we don't select the whole aggregated block
    const virtualGeometry = createVirtualBuilding(event.lngLat.lng, event.lngLat.lat);
    
    setSelectedFeature({
      id: `virtual-${Date.now()}`, 
      properties: { render_height: 30, render_min_height: 0 },
      geometry: virtualGeometry,
      lngLat: event.lngLat
    });
  }, []);

  const onHover = useCallback(event => {
    if (routeMode !== 'idle') {
      if (event.target.getCanvas) event.target.getCanvas().style.cursor = 'crosshair';
      setHoverInfo(null);
      return;
    }

    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    });
    if (event.target.getCanvas) event.target.getCanvas().style.cursor = 'context-menu'; // Hint right-click
  }, [routeMode]);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const status = e.target.status.value;
    const notes = e.target.notes.value;
    
    setReports(prev => ({
      ...prev,
      [selectedFeature.id]: { 
        status, 
        notes,
        geometry: selectedFeature.geometry,
        properties: selectedFeature.properties
      }
    }));
    
    setSelectedFeature(null);
  };

  // Helper to fetch a route from OpenRouteService API with exclusions
  const fetchRoute = async (startCoords, endCoords) => {
      const polygons = [];
      Object.values(reports).forEach(report => {
         if (report.status === 'yol_kapali' || report.status === 'yikildi') {
             if (report.geometry && report.geometry.type === 'Polygon') {
                 polygons.push(report.geometry.coordinates);
             }
         }
      });
      
      const body = {
          coordinates: [startCoords, endCoords]
      };
      
      if (polygons.length > 0) {
          body.options = {
              avoid_polygons: {
                  type: 'MultiPolygon',
                  coordinates: polygons
              }
          };
      }

      const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
          method: 'POST',
          headers: {
              'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
              'Content-Type': 'application/json',
              'Authorization': ORS_API_KEY
          },
          body: JSON.stringify(body)
      });
      
      if (!res.ok) {
          console.error("API Error Response:", await res.text());
          throw new Error("ORS API Error");
      }
      return await res.json();
  };

  // Main routing effect
  useEffect(() => {
    if (activeNearestMode) {
      const findBest = async () => {
         setIsRouting(true);
         try {
           const promises = MEDICAL_FACILITIES.map(async (fac) => {
               const data = await fetchRoute(ASSEMBLY_POINT.coordinates, fac.coordinates);
               return { fac, data };
           });
           const results = await Promise.all(promises);
           let bestRoute = null;
           let bestDuration = Infinity;
           
           results.forEach(res => {
              if (res.data && res.data.features && res.data.features.length > 0) {
                 const feature = res.data.features[0];
                 const duration = feature.properties?.summary?.duration || Infinity;
                 if (duration < bestDuration) {
                    bestDuration = duration;
                    bestRoute = { geometry: feature.geometry, facility: res.fac };
                 }
              }
           });
           
           if (bestRoute) {
              setStartPoint(ASSEMBLY_POINT.coordinates);
              setEndPoint(bestRoute.facility.coordinates);
              setRouteData(bestRoute.geometry);
           } else {
              console.warn("No valid route found to any hospital!");
              setRouteData(null);
           }
         } catch (err) {
           console.error("Routing error:", err);
         }
         setIsRouting(false);
      };
      findBest();

    } else if (startPoint && endPoint) {
      const findManual = async () => {
         setIsRouting(true);
         try {
           const data = await fetchRoute(startPoint, endPoint);
           if (data.features && data.features.length > 0) {
              setRouteData(data.features[0].geometry);
           } else {
              setRouteData(null);
           }
         } catch (err) {
           console.error("Routing error:", err);
         }
         setIsRouting(false);
      };
      findManual();
    }
  }, [startPoint, endPoint, activeNearestMode, reports]);

  const onMapLoad = useCallback((e) => {
    const map = e.target;
    const layers = map.getStyle().layers;

    // 1. Extract Building Source from Carto
    let buildingSource = null;
    let buildingSourceLayer = null;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].id.includes('building')) {
        buildingSource = layers[i].source;
        buildingSourceLayer = layers[i]['source-layer'];
        break;
      }
    }

    // 2. Add 3D Buildings Back with a FIXED Height!
    // Carto doesn't provide building heights, so we simulate 3D by giving all buildings a 15m height
    if (buildingSource) {
      map.addLayer({
        'id': '3d-buildings',
        'source': buildingSource,
        'source-layer': buildingSourceLayer,
        'type': 'fill-extrusion',
        'minzoom': 14,
        'paint': {
          'fill-extrusion-color': '#e0e0e0', // Professional clean gray
          'fill-extrusion-height': 15, // Fixed 15 meters for all buildings to make it 3D without Mapbox key
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.6
        }
      });
    }
  }, []);

  const reportedBuildingsGeoJSON = useMemo(() => {
    const features = Object.entries(reports).map(([id, report]) => {
      let color = '#ffeb3b';
      if (report.status === 'yikildi') color = '#f44336';
      if (report.status === 'agir_hasarli') color = '#ff9800';
      if (report.status === 'yol_kapali') color = '#e91e63';

      return {
        type: 'Feature',
        geometry: report.geometry,
        properties: {
          ...report.properties,
          color,
          height: report.properties.render_height || 20,
          min_height: report.properties.render_min_height || 0
        }
      };
    });
    
    return { type: 'FeatureCollection', features };
  }, [reports]);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.topBar}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className={styles.backButton} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className={styles.title}>3D Hasar ve Yol Bildirim Haritası (Zeytinburnu)</h2>
        </div>
        
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <button 
            onClick={() => {
              setRouteMode('idle');
              setActiveNearestMode(true);
            }}
            style={{
              padding: '6px 12px', 
              background: '#4caf50', 
              color: 'white', 
              borderRadius: '4px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toplanma alanından en yakın ve güvenli hastaneyi bulur."
          >
            <Activity size={16} />
            {isRouting && activeNearestMode ? 'Hesaplanıyor...' : 'En Yakın Hastane'}
          </button>

          <button 
            onClick={() => {
              setActiveNearestMode(false);
              if (routeMode === 'idle') {
                setRouteMode('selectStart');
                setStartPoint(null); setEndPoint(null); setRouteData(null);
              } else {
                setRouteMode('idle');
              }
            }}
            style={{
              padding: '6px 12px', 
              background: routeMode !== 'idle' ? '#f44336' : '#2196f3', 
              color: 'white', 
              borderRadius: '4px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Route size={16} />
            {routeMode === 'idle' ? 'Serbest Rota' : 'İptal'}
          </button>
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          mapLib={maplibregl}
          interactiveLayerIds={['3d-buildings']}
          onClick={onClick}
          onContextMenu={onContextMenu}
          onMouseMove={onHover}
          onLoad={onMapLoad}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Zeytinburnu Boundary Line */}
          <Source id="zeytinburnu-boundary" type="geojson" data={ZEYTINBURNU_POLYGON}>
             <Layer
                id="zeytinburnu-fill"
                type="fill"
                paint={{
                   'fill-color': '#9c27b0',
                   'fill-opacity': 0.1
                }}
             />
             <Layer
                id="zeytinburnu-line"
                type="line"
                paint={{
                   'line-color': '#9c27b0',
                   'line-width': 3,
                   'line-dasharray': [2, 2]
                }}
             />
          </Source>

          {/* Route Layer */}
          {routeData && (
            <Source id="route-source" type="geojson" data={{ type: 'Feature', geometry: routeData }}>
              <Layer 
                id="route-layer-shadow" 
                type="line" 
                paint={{
                  'line-color': '#000',
                  'line-width': 10,
                  'line-opacity': 0.4,
                  'line-blur': 4
                }} 
              />
              <Layer 
                id="route-layer" 
                type="line" 
                paint={{
                  'line-color': '#2196f3',
                  'line-width': 6,
                  'line-opacity': 1
                }} 
              />
            </Source>
          )}

          {/* Assembly Point Marker */}
          <Marker longitude={ASSEMBLY_POINT.coordinates[0]} latitude={ASSEMBLY_POINT.coordinates[1]} anchor="bottom">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#4caf50', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Toplanma Alanı
              </div>
              <div style={{ background: '#4caf50', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </Marker>

          {/* Medical Facilities Markers */}
          {MEDICAL_FACILITIES.map(facility => (
            <Marker key={facility.id} longitude={facility.coordinates[0]} latitude={facility.coordinates[1]} anchor="center">
              <div 
                style={{ background: 'white', border: '3px solid #e91e63', color: '#e91e63', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} 
                title={facility.name}
              >
                H
              </div>
            </Marker>
          ))}

          {/* Start and End Markers (For manual routing) */}
          {startPoint && !activeNearestMode && (
            <Source id="start-marker" type="geojson" data={{ type: 'Feature', geometry: { type: 'Point', coordinates: startPoint }}}>
              <Layer id="start-circle-bg" type="circle" paint={{ 'circle-color': '#fff', 'circle-radius': 10 }} />
              <Layer id="start-circle" type="circle" paint={{ 'circle-color': '#4caf50', 'circle-radius': 8 }} />
            </Source>
          )}
          {endPoint && !activeNearestMode && (
            <Source id="end-marker" type="geojson" data={{ type: 'Feature', geometry: { type: 'Point', coordinates: endPoint }}}>
              <Layer id="end-circle-bg" type="circle" paint={{ 'circle-color': '#fff', 'circle-radius': 10 }} />
              <Layer id="end-circle" type="circle" paint={{ 'circle-color': '#f44336', 'circle-radius': 8 }} />
            </Source>
          )}

          {/* Overlay for Reported Buildings */}
          <Source id="reported-buildings" type="geojson" data={reportedBuildingsGeoJSON}>
            <Layer
              id="reported-buildings-layer"
              type="fill-extrusion"
              paint={{
                'fill-extrusion-color': ['get', 'color'],
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.9
              }}
            />
          </Source>

          {hoverInfo && !selectedFeature && routeMode === 'idle' && (
            <Popup
              longitude={hoverInfo.longitude}
              latitude={hoverInfo.latitude}
              closeButton={false}
              className={styles.hoverPopup}
            >
              <div style={{ color: '#333', fontSize: '14px', padding: '4px' }}>
                <strong>Bina Bilgisi</strong>
                <br />
                <em>Raporlamak için SAĞ TIKLAYIN</em>
              </div>
            </Popup>
          )}

          {selectedFeature && (
            <Popup
              longitude={selectedFeature.lngLat.lng}
              latitude={selectedFeature.lngLat.lat}
              anchor="top"
              onClose={() => setSelectedFeature(null)}
              closeOnClick={false}
              className={styles.actionPopup}
            >
              <form onSubmit={handleReportSubmit} className={styles.popupForm}>
                <h3 style={{ color: '#000', marginBottom: '0.5rem', fontSize: '1rem', marginTop: 0 }}>Durum Bildir</h3>
                
                <label style={{ color: '#333', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Hasar Durumu</label>
                <select name="status" defaultValue="hasarli" className={styles.select} style={{width: '100%', padding: '6px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc'}}>
                  <option value="yikildi">Tamamen Yıkılmış (Kırmızı)</option>
                  <option value="agir_hasarli">Ağır Hasarlı (Turuncu)</option>
                  <option value="hasarli">Hasarlı (Sarı)</option>
                  <option value="yol_kapali">Yol Kapalı (Pembe)</option>
                </select>

                <label style={{ color: '#333', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Etiketler / Notlar</label>
                <textarea name="notes" rows="2" className={styles.textarea} placeholder="Örn: İçeride mahsur kalan var..." style={{width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px'}}></textarea>

                <button type="submit" className={styles.submitBtn} style={{width: '100%', padding: '8px', background: '#e91e63', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                  Kaydet & Rotayı Güncelle
                </button>
              </form>
            </Popup>
          )}
        </Map>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={styles.colorBox} style={{background: '#f44336'}}></span> Yıkılmış</div>
        <div className={styles.legendItem}><span className={styles.colorBox} style={{background: '#ff9800'}}></span> Ağır Hasarlı</div>
        <div className={styles.legendItem}><span className={styles.colorBox} style={{background: '#ffeb3b'}}></span> Hasarlı</div>
        <div className={styles.legendItem}><span className={styles.colorBox} style={{background: '#e91e63'}}></span> Yol Kapalı</div>
      </div>
    </div>
  );
};

export default InteractiveMap;
