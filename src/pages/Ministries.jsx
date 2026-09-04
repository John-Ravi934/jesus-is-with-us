import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Heart, BookOpen, Music, Home, Globe, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Ministries.module.css';

export default function Ministries() {
  const { t } = useLanguage();
  const ministries = [
    { title: t('min_list_gospel'), icon: <Globe size={40} />, img: '/assets/gospel-outreach.webp', desc: t('min_list_gospel_desc') },
    { title: t('min_list_village'), icon: <Home size={40} />, img: '/assets/village-ministries.webp', desc: t('min_list_village_desc') },
    { title: t('min_list_children'), icon: <Heart size={40} />, img: '/assets/children-ministries.webp', desc: t('min_list_children_desc') },
    { title: t('min_list_youth'), icon: <Users size={40} />, img: '/assets/youth-meeting.webp', desc: t('min_list_youth_desc') },
    { title: t('min_list_family'), icon: <Users size={40} />, img: '/assets/family-ministries.webp', desc: t('min_list_family_desc') },
    { title: t('min_list_worship'), icon: <Music size={40} />, img: '/assets/worship-ministries.webp', desc: t('min_list_worship_desc') }
  ];

  const [selectedMinistry, setSelectedMinistry] = useState(null);

  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">{t('min_hero_label')}</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">{t('min_hero_title')}<span className="script-accent">{t('min_hero_title_2')}</span></h1>
        </div>
      </section>

      <section data-aos="fade-up" className="gray-section">
        <div className="container">
          <div className={styles.intro}>
            <span className="subheading">{t('min_intro_label')}</span>
            <h2 data-aos="fade-up">{t('min_intro_title')}<span className="script-accent">{t('min_intro_title_2')}</span></h2>
            <p data-aos="fade-up">{t('min_intro_desc')}</p>
          </div>

          <div className={styles.ministriesGrid} data-aos="fade-up">
            {ministries.map((min, idx) => (
              <div data-aos="fade-up" key={idx} className={styles.ministryCard}>
                <div data-aos="fade-up" className={styles.cardImgWrapper}>
                  <img data-aos="fade-up" src={min.img} alt={min.title} />
                  <div className={styles.iconOverlay}>{min.icon}</div>
                </div>
                <div data-aos="fade-up" className={styles.cardContent}>
                  <h3 data-aos="fade-up">{min.title}</h3>
                  <p data-aos="fade-up">{min.desc}</p>
                  <a data-aos="fade-up" href="#" className={styles.learnMore} onClick={(e) => {
                    e.preventDefault();
                    setSelectedMinistry(min);
                  }}>{t('min_learn_more')} <ArrowRight size={16} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-aos="fade-up" className="dark-section">
        <div className={`container ${styles.impactContainer}`}>
          <div className={styles.impactText}>
            <span className="subheading">{t('min_impact_label')}</span>
            <h2 data-aos="fade-up">{t('min_impact_title')}<span className="script-accent">{t('min_impact_title_2')}</span></h2>
            <p data-aos="fade-up">{t('min_impact_desc')}</p>
            <Link data-aos="fade-up" to="/fellowship#form" className="btn btn-primary" style={{ marginTop: '2rem', textDecoration: 'none' }}>{t('min_impact_btn')}</Link>
          </div>
          <div className={styles.impactStats}>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">{t('min_stat_1_val')}</h3>
              <p data-aos="fade-up">{t('min_stat_1_label')}</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">{t('min_stat_2_val')}</h3>
              <p data-aos="fade-up">{t('min_stat_2_label')}</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">{t('min_stat_3_val')}</h3>
              <p data-aos="fade-up">{t('min_stat_3_label')}</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">{t('min_stat_4_val')}</h3>
              <p data-aos="fade-up">{t('min_stat_4_label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ministry Popup Modal */}
      {selectedMinistry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }} onClick={() => setSelectedMinistry(null)}>
          <div style={{
            background: '#fff', borderRadius: '16px', maxWidth: '850px', width: '100%',
            position: 'relative', animation: 'fadeIn 0.3s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'row', padding: '24px', gap: '32px'
          }} onClick={e => e.stopPropagation()} className={styles.popupModal}>
            <button data-aos="fade-up"
              onClick={() => setSelectedMinistry(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                background: '#f1f5f9', color: '#475569', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
              <X size={18} />
            </button>
            <div style={{ flex: '1', borderRadius: '12px', overflow: 'hidden', minHeight: '350px' }}>
              <img data-aos="fade-up" src={selectedMinistry.img} alt={selectedMinistry.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ color: '#f43f5e', background: '#fff1f2', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                  {selectedMinistry.icon}
                </div>
                <h2 data-aos="fade-up" style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>{selectedMinistry.title}</h2>
              </div>

              <div style={{ marginBottom: '16px', fontSize: '0.95rem', color: '#475569' }}>
                <p data-aos="fade-up" style={{ margin: '0 0 8px 0' }}><strong>{t('min_popup_time_label')}</strong> {t('min_popup_time')}</p>
                <p data-aos="fade-up" style={{ margin: '0' }}><strong>{t('min_popup_place_label')}</strong> {t('min_popup_place')}</p>
              </div>

              <p data-aos="fade-up" style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                {selectedMinistry.desc}{t('min_popup_desc_suffix')}
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link data-aos="fade-up" to="/fellowship#whatsapp" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>{t('min_popup_btn')}</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
