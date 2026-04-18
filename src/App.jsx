import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BuildingReportForm from './components/BuildingReportForm';
import RoadReportForm from './components/RoadReportForm';
import MedicalReportForm from './components/MedicalReportForm';
import SupplyRequestForm from './components/SupplyRequestForm';
import InteractiveMap from './components/InteractiveMap';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Simulate connection status changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleSubmit = (data) => {
    console.log('Sending data via LoRa Mesh:', data);
    // Here we would typically interface with the LoRa module or local DB
  };

  return (
    <>
      <Header connectionStatus={connectionStatus} />
      
      <main>
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {(currentView === 'building' || currentView === 'road') && <InteractiveMap onBack={handleBackToDashboard} />}
        {currentView === 'medical' && <MedicalReportForm onBack={handleBackToDashboard} onSubmit={handleSubmit} />}
        {currentView === 'supply' && <SupplyRequestForm onBack={handleBackToDashboard} onSubmit={handleSubmit} />}
      </main>
    </>
  );
}

export default App;
