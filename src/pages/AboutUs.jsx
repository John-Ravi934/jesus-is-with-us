import { CheckCircle, Target, Eye, Users, PlayCircle, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AboutUs.module.css';
import { useLanguage } from '../contexts/LanguageContext';
import { churchContent } from '../data/churchContent';
import DivineVision from '../components/DivineVision';
import PrayerCTA from '../components/PrayerCTA';

export default function AboutUs() {
  const { t, language } = useLanguage();
  const timelineEvents = churchContent[language]?.timeline_events || churchContent.en.timeline_events;

  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">{t('about_hero_label')}</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">{t('about_hero_title')}<span className="script-accent">{t('about_hero_title_2')}</span></h1>
        </div>
      </section>

      {/* 1. Foundation & Vision */}
      <section data-aos="fade-up" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div className={styles.sectionBgWhite}>
          <div className={`container ${styles.aboutBlock}`} style={{ marginTop: 0, marginBottom: 0 }}>
            <div className={styles.aboutText}>
              <h2 data-aos="fade-up">{t('about_foundation_heading')}<span className="script-accent">{t('about_foundation_heading_2')}</span></h2>
              <p data-aos="fade-up">{t('intro_desc_p1')}</p>
              <p data-aos="fade-up">{t('intro_desc_p2')}</p>
            </div>
            <div className={styles.aboutImageRight}>
              <img data-aos="fade-up" src="/assets/israel-pastor.png" alt="Pastor Israel Raj" className={styles.roundedOrganic} />
            </div>
          </div>
        </div>

        {/* 2. Church Dedication */}
        <div className={styles.sectionBgGray}>
          <div className={`container ${styles.aboutBlock} ${styles.reverseBlock}`} style={{ marginTop: 0, marginBottom: 0 }}>
            <div className={styles.aboutImageLeft}>
              <img data-aos="fade-up" src="/assets/church-image.png" alt="Church Dedication" className={styles.roundedOrganicAlt} />
            </div>
            <div className={styles.aboutText}>
              <h2 data-aos="fade-up">{t('about_dedication_heading')}<span className="script-accent">{t('about_dedication_heading_2')}</span></h2>
              <p data-aos="fade-up">{t('about_dedication_p1')}</p>
              <p data-aos="fade-up">{t('about_dedication_p2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Divine Vision */}
      <DivineVision />

      {/* 4. Milestones Timeline */}
      <section data-aos="fade-up" className={`light-section ${styles.timelineSection}`}>
        <div className="container">
          <div className={styles.milestoneHeader}>
            <span className="subheading">{t('about_timeline_label')}</span>
            <h2 data-aos="fade-up">{t('about_timeline_heading')}<span className="script-accent">{t('about_timeline_heading_2')}</span></h2>
            <p data-aos="fade-up">{t('about_timeline_desc')}</p>
          </div>

          <div className={styles.timeline} data-aos="fade-up">
            {timelineEvents.map((event, index) => (
              <div key={index} className={styles.timelineItem} data-aos="fade-up">
                <div className={styles.timelineDot}></div>
                <div className={`${styles.timelineContentWrapper} ${index % 2 !== 0 ? styles.timelineReverse : ''}`}>
                  <div className={styles.timelineContent}>
                    <h3 data-aos="fade-up">{event.year}</h3>
                    <h4 data-aos="fade-up">{event.title}</h4>
                    <p data-aos="fade-up">{event.description}</p>
                  </div>
                  <div className={styles.timelineImage}>
                    <img data-aos="fade-up" src={event.image} alt={event.title} className={index % 2 !== 0 ? styles.roundedOrganic : styles.roundedOrganicAlt} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Conclusion */}
      <section data-aos="fade-up" style={{ background: '#ffffff', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 data-aos="fade-up" style={{ marginBottom: '2rem', color: 'var(--color-brand-primary)' }}>{t('about_conclusion_heading')}<span className="script-accent">{t('about_conclusion_heading_2')}</span></h2>
            <p data-aos="fade-up" style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '1.5rem', color: '#475569' }}>
              {t('about_conclusion_p1')}
            </p>
            <p data-aos="fade-up" style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '1.5rem', color: '#475569', fontWeight: '500' }}>
              {t('about_conclusion_p2')}
            </p>
            <p data-aos="fade-up" style={{ fontSize: '1.4rem', color: 'var(--color-brand-accent)', fontStyle: 'italic', fontWeight: 'bold' }}>
              {t('about_conclusion_p3')}
            </p>
          </div>
        </div>
      </section>

      {/* Prayer CTA */}
      <PrayerCTA />
    </>
  );
}
