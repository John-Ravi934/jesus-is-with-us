import React from 'react';
import { Users, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './SpecialMinistries.module.css';

export default function SpecialMinistries() {
  const { t } = useLanguage();

  return (
    <section data-aos="fade-up" className={styles.ministriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 data-aos="fade-up" style={{ color: '#ffffff' }}>{t('special_ministries_heading')}<span className="script-accent">{t('special_ministries_heading_2')}</span></h2>
          <p data-aos="fade-up" style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '1.1rem' }}>
            {t('special_ministries_sub')}
          </p>
        </div>

        <div className={styles.ministriesGrid}>
          {/* Card 1 */}
          <div data-aos="fade-up" className={styles.ministryCard} data-aos-delay="100">
            <div className={styles.cardContent}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#f43f5e' }}>
                <Users size={32} />
              </div>
              <h3>{t('min_gen_title')}</h3>
              <p>{t('min_gen_desc')}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div data-aos="fade-up" className={styles.ministryCard} data-aos-delay="200">
            <div className={styles.cardContent}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#eab308' }}>
                <Globe size={32} />
              </div>
              <h3>{t('min_evan_title')}</h3>
              <p>{t('min_evan_desc')}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div data-aos="fade-up" className={styles.ministryCard} data-aos-delay="300">
            <div className={styles.cardContent}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#3b82f6' }}>
                <Heart size={32} />
              </div>
              <h3>{t('min_social_title')}</h3>
              <p>{t('min_social_desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
