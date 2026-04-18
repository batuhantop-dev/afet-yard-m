import React, { useState } from 'react';
import { Package, ArrowLeft, CheckCircle2 } from 'lucide-react';
import styles from './Form.module.css';

const SupplyRequestForm = ({ onBack, onSubmit }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    konum: '',
    kisiSayisi: '',
    ihtiyaclar: {
      su: false,
      gida: false,
      cadir: false,
      battaniye: false,
      isatici: false,
      bebek_bezi_mamasi: false,
      kadin_pedi: false
    },
    notlar: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      ihtiyaclar: { ...prev.ihtiyaclar, [name]: checked }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type: 'SUPPLY', data: formData, id: Date.now() });
    setIsSubmitted(true);
    setTimeout(() => onBack(), 2500);
  };

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.successMessage}>
            <CheckCircle2 size={64} />
            <h2>Talebiniz Alındı</h2>
            <p>Malzeme ihtiyacı koordinasyon merkezine iletildi.</p>
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
        <h2 className={styles.title}>İhtiyaç ve Malzeme Talebi</h2>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Talebin İstenilen Konum/Toplanma Alanı</label>
          <input required type="text" name="konum" value={formData.konum} onChange={handleChange} placeholder="Örn: 5 Nolu Çadırkent Alanı" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tahmini Kişi Sayısı</label>
          <input required type="number" min="1" name="kisiSayisi" value={formData.kisiSayisi} onChange={handleChange} placeholder="Kaç kişi için malzeme isteniyor?" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}><Package size={16} /> Gerekli Malzemeler</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="su" checked={formData.ihtiyaclar.su} onChange={handleCheckboxChange} /> İçme Suyu
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="gida" checked={formData.ihtiyaclar.gida} onChange={handleCheckboxChange} /> Hazır Gıda / Kumanya
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="cadir" checked={formData.ihtiyaclar.cadir} onChange={handleCheckboxChange} /> Çadır
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="battaniye" checked={formData.ihtiyaclar.battaniye} onChange={handleCheckboxChange} /> Battaniye / Uyku Tulumu
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="isatici" checked={formData.ihtiyaclar.isatici} onChange={handleCheckboxChange} /> Isıtıcı
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="bebek_bezi_mamasi" checked={formData.ihtiyaclar.bebek_bezi_mamasi} onChange={handleCheckboxChange} /> Bebek Bezi ve Maması
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="kadin_pedi" checked={formData.ihtiyaclar.kadin_pedi} onChange={handleCheckboxChange} /> Kadın Pedi / Hijyen Kiti
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ek Notlar</label>
          <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows="3" placeholder="Örn: Özellikle bebek maması çok acil..."></textarea>
        </div>

        <button type="submit" className={styles.submitButton}>
          Talebi Gönder
        </button>
      </form>
    </div>
  );
};

export default SupplyRequestForm;
