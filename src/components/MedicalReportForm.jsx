import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';
import styles from './Form.module.css';

const MedicalReportForm = ({ onBack, onSubmit }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    konum: '',
    yaraliSayisi: '1',
    durumAciliyeti: 'kirmizi', // Kırmızı (Kritik), Sarı (Orta), Yeşil (Hafif)
    gereksinim: 'ambulans',
    notlar: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: 'MEDICAL', data: formData, id: Date.now() });
    setIsSubmitted(true);
    setTimeout(() => onBack(), 2500);
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.successMessage}>
            <CheckCircle2 size={64} />
            <h2>Rapor İletildi</h2>
            <p>Ağır yaralı durumu merkeze başarıyla iletildi.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} type="button">
          <ArrowLeft size={20} />
        </button>
        <h2 className={styles.title}>Yaralı / Sağlık Bildirimi</h2>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Bulunulan Konum</label>
          <input required type="text" name="konum" value={formData.konum} onChange={handleChange} placeholder="Örn: 2 Nolu Toplanma Alanı veya Bina Önü" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><UserPlus size={16} /> Yaralı Sayısı</label>
          <input required type="number" min="1" name="yaraliSayisi" value={formData.yaraliSayisi} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><HeartPulse size={16} /> Trijaj (Aciliyet Durumu)</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel} style={{borderColor: formData.durumAciliyeti === 'kirmizi' ? '#f44336' : ''}}>
              <input type="radio" name="durumAciliyeti" value="kirmizi" checked={formData.durumAciliyeti === 'kirmizi'} onChange={handleChange} />
              Kırmızı (Çok Kritik / Hayati)
            </label>
            <label className={styles.radioLabel} style={{borderColor: formData.durumAciliyeti === 'sari' ? '#ffeb3b' : ''}}>
              <input type="radio" name="durumAciliyeti" value="sari" checked={formData.durumAciliyeti === 'sari'} onChange={handleChange} />
              Sarı (Acil Ama Bekleyebilir)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Öncelikli İhtiyaç</label>
          <select name="gereksinim" value={formData.gereksinim} onChange={handleChange}>
            <option value="ambulans">Ambulans / Tahliye</option>
            <option value="ilk_yardim_uzmani">İlk Yardım Uzmanı</option>
            <option value="tibbi_malzeme">Tıbbi Malzeme / İlaç</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Yaralıların Durumu / Notlar</label>
          <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows="3" placeholder="Örn: Kanama var, turnike yapıldı..."></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Acil Durumu Bildir
        </button>
      </form>
    </div>
  );
};

export default MedicalReportForm;
