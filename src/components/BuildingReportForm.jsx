import React, { useState } from 'react';
import { Building2, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import styles from './Form.module.css';

const BuildingReportForm = ({ onBack, onSubmit }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    mahalle: '',
    sokak: '',
    binaNo: '',
    durum: 'hasarli',
    insanVar: 'bilinmiyor',
    notlar: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    onSubmit({ type: 'BUILDING', data: formData, id: Date.now() });
    setIsSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2500);
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.successMessage}>
            <CheckCircle2 size={64} />
            <h2>Rapor İletildi</h2>
            <p>Bina hasar durumu LoRa ağına başarıyla gönderildi.</p>
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
        <h2 className={styles.title}>Bina Hasar Bildirimi</h2>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mahalle</label>
          <input required type="text" name="mahalle" value={formData.mahalle} onChange={handleChange} placeholder="Örn: Cumhuriyet Mah." />
        </div>
        
        <div className={styles.formGroup}>
          <div style={{display: 'flex', gap: '1rem'}}>
            <div style={{flex: 2}}>
              <label className={styles.label}>Sokak/Cadde</label>
              <input required type="text" name="sokak" value={formData.sokak} onChange={handleChange} placeholder="Örn: 1045. Sokak" />
            </div>
            <div style={{flex: 1}}>
              <label className={styles.label}>Bina No</label>
              <input required type="text" name="binaNo" value={formData.binaNo} onChange={handleChange} placeholder="Örn: 12" />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Building2 size={16} /> Bina Durumu</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" name="durum" value="yikildi" checked={formData.durum === 'yikildi'} onChange={handleChange} />
              Tamamen Yıkılmış
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="durum" value="agir_hasarli" checked={formData.durum === 'agir_hasarli'} onChange={handleChange} />
              Ağır Hasarlı
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="durum" value="hasarli" checked={formData.durum === 'hasarli'} onChange={handleChange} />
              Hasarlı (Ayakta)
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><AlertTriangle size={16} /> Enkazda İnsan Var mı?</label>
          <div className={styles.radioGroup}>
             <label className={styles.radioLabel}>
              <input type="radio" name="insanVar" value="evet" checked={formData.insanVar === 'evet'} onChange={handleChange} />
              Evet, Ses/Belirti Var
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" name="insanVar" value="hayir" checked={formData.insanVar === 'hayir'} onChange={handleChange} />
              Hayır / Boş
            </label>
            <label className={styles.radioLabel} style={{gridColumn: '1 / -1'}}>
              <input type="radio" name="insanVar" value="bilinmiyor" checked={formData.insanVar === 'bilinmiyor'} onChange={handleChange} />
              Bilinmiyor / Kontrol Edilemedi
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ek Notlar (İsteğe Bağlı)</label>
          <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows="3" placeholder="Örn: Binada yangın tehlikesi var..."></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Durumu Merkeze İlet
        </button>
      </form>
    </div>
  );
};

export default BuildingReportForm;
