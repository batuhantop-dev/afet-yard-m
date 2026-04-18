import React from 'react';
import { Building2, Navigation, HeartPulse, Package } from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = ({ onNavigate }) => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeSection}>
        <h2>Acil Durum Bildirimleri</h2>
        <p>Lütfen sahadaki durumu en hızlı ve doğru şekilde merkeze iletin.</p>
      </div>

      <div className={styles.grid}>
        <button className={`${styles.card} ${styles.buildingCard}`} onClick={() => onNavigate('building')}>
          <div className={styles.iconWrapper}>
            <Building2 size={32} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Bina Hasar Durumu</h3>
            <p className={styles.cardDesc}>Yıkılan veya ağır hasarlı binaları, enkaz durumunu bildirin.</p>
          </div>
        </button>

        <button className={`${styles.card} ${styles.roadCard}`} onClick={() => onNavigate('road')}>
          <div className={styles.iconWrapper}>
            <Navigation size={32} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Kapanan Yollar</h3>
            <p className={styles.cardDesc}>Enkaz veya çökme nedeniyle ulaşıma kapanan yolları bildirin.</p>
          </div>
        </button>

        <button className={`${styles.card} ${styles.medicalCard}`} onClick={() => onNavigate('medical')}>
          <div className={styles.iconWrapper}>
            <HeartPulse size={32} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Yaralı Bildirimi</h3>
            <p className={styles.cardDesc}>Ağır yaralı sayısını ve acil tıbbi müdahale gereksinimini bildirin.</p>
          </div>
        </button>

        <button className={`${styles.card} ${styles.supplyCard}`} onClick={() => onNavigate('supply')}>
          <div className={styles.iconWrapper}>
            <Package size={32} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Malzeme Talebi</h3>
            <p className={styles.cardDesc}>Su, çadır, battaniye ve gıda gibi acil ihtiyaçları talep edin.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
