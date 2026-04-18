import React, { useState } from 'react';
import { Map, ArrowLeft, CheckCircle2, Navigation } from 'lucide-react';
import styles from './Form.module.css';

const RoadReportForm = ({ onBack, onSubmit }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    konum: '',
    durum: 'kapanmis',
    engelTuru: 'enkaz',
    notlar: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: 'ROAD', data: formData, id: Date.now() });
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
            <p>Yol kapanma durumu merkeze başarıyla iletildi.</p>
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
        <h2 className={styles.title}>Yol Durumu Bildirimi</h2>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}><Navigation size={16} /> Kapalı Yol/Sokak Konumu</label>
          <input required type="text" name="konum" value={formData.konum} onChange={handleChange} placeholder="Örn: İstiklal Caddesi, 3. Sokak kesişimi" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Map size={16} /> Yol Durumu</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="durum" value="kapanmis" checked={formData.durum === 'kapanmis'} onChange={handleChange} />
              Tamamen Kapalı (Araç Geçemez)
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="durum" value="kismen_acik" checked={formData.durum === 'kismen_acik'} onChange={handleChange} />
              Kısmen Açık (Sadece Yaya)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Engel Türü</label>
          <div className={styles.radioGroup}>
             <label className={styles.radioLabel}>
              <input type="radio" name="engelTuru" value="enkaz" checked={formData.engelTuru === 'enkaz'} onChange={handleChange} />
              Bina Enkazı
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="engelTuru" value="yol_cokmesi" checked={formData.engelTuru === 'yol_cokmesi'} onChange={handleChange} />
              Yol Çökmesi / Yarık
            </label>
             <label className={styles.radioLabel} style={{gridColumn: '1 / -1'}}>
              <input type="radio" name="engelTuru" value="diger" checked={formData.engelTuru === 'diger'} onChange={handleChange} />
              Diğer (Kopuk Kablo, Ağaç, Su Baskını vb.)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ek Notlar (İsteğe Bağlı)</label>
          <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows="3" placeholder="Örn: İş makinesi gerekiyor..."></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Durumu Merkeze İlet
        </button>
      </form>
    </div>
  );
};

export default RoadReportForm;
