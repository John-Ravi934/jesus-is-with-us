import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './PrayerCTA.module.css';

export default function PrayerCTA() {
  const { t } = useLanguage();

  return (
    <section className={styles.ctaSection} data-aos="zoom-in">
      <div className={styles.ctaOverlay}></div>
      <div className={`container ${styles.ctaContent}`}>
        <h2 data-aos="fade-up">{t('prayer_cta_heading')}</h2>
        <p data-aos="fade-up">{t('prayer_cta_desc')}</p>
        <Link data-aos="fade-up" to="/contact#prayer" className="btn btn-primary" style={{marginTop: '2rem', textDecoration: 'none'}}>
          {t('prayer_cta_btn')}
        </Link>
      </div>
    </section>
  );
}
