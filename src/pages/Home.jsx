import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, MapPin, Phone, Mail, Calendar, Quote, Flame, Church, Users, HeartHandshake, Globe, UserCircle } from 'lucide-react';
import styles from './Home.module.css';
import { getEvents } from '../services/eventService';
import AnnouncementPopup from '../components/AnnouncementPopup';
import { getLiveStreamSettings } from '../services/settingsService';
import { useLanguage } from '../contexts/LanguageContext';
import SpecialMinistries from '../components/SpecialMinistries';
import PrayerCTA from '../components/PrayerCTA';

export default function Home() {
  const { t, setIsLiveHeroActive, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [liveSettings, setLiveSettings] = useState({ is_active: false, link: '', tooltip: 'Live started in the youtube' });

  // Swipe & Mouse Drag logic
  const touchStartX = useRef(null);
  const isDragging = useRef(false);

  const handleDragStart = (clientX) => {
    touchStartX.current = clientX;
    isDragging.current = true;
  };

  const handleDragEnd = (clientX) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const diff = touchStartX.current - clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) setActiveEventIndex(prev => (prev + 1) % events.length);
      else setActiveEventIndex(prev => (prev - 1 + events.length) % events.length);
    }

    touchStartX.current = null;
    isDragging.current = false;
  };

  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => handleDragEnd(e.changedTouches[0].clientX);

  const handleMouseDown = (e) => handleDragStart(e.clientX);
  const handleMouseUp = (e) => handleDragEnd(e.clientX);
  const handleMouseLeave = (e) => {
    if (isDragging.current) handleDragEnd(e.clientX);
  };

  useEffect(() => {
    const fetchHomeEvents = async () => {
      try {
        const data = await getEvents({ status: 'published', is_announcement: false });
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLiveSettings = async () => {
      try {
        const data = await getLiveStreamSettings();
        if (data) setLiveSettings(data);
      } catch (err) {
        console.error("Error fetching live settings:", err);
      }
    };

    fetchHomeEvents();
    fetchLiveSettings();
  }, []);

  // Separate the active event as featured, and next 3 as list
  const featuredEvent = events.length > 0 ? events[activeEventIndex] : null;
  const upcomingEvents = events.filter((_, i) => i !== activeEventIndex).slice(0, 3);
  const liveVideoId = liveSettings.link?.split('v=')[1]?.split('&')[0];
  const showLiveHero = liveSettings.is_active && liveSettings.show_in_hero && liveVideoId;

  useEffect(() => {
    setIsLiveHeroActive(showLiveHero);
    return () => setIsLiveHeroActive(false);
  }, [showLiveHero, setIsLiveHeroActive]);

  return (
    <>
      <AnnouncementPopup />
      {/* 1. Hero Section with Video */}
      <section className={`${styles.hero} ${showLiveHero ? styles.liveHeroContainer : ''}`} data-aos="fade-in">
        {showLiveHero ? (
          <iframe
            className={styles.videoBg}
            src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&loop=1&playlist=${liveVideoId}&controls=1&showinfo=0`}
            title="YouTube Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video autoPlay loop muted playsInline className={styles.videoBg}>
            <source src="/assets/heaven-video.mp4" type="video/mp4" />
          </video>
        )}

        {!showLiveHero && (
          <>
            <div className={styles.heroOverlay}></div>

            <div className={`container ${styles.heroContent}`}>
              <h1 data-aos="fade-up" className="animate-fade-up">{t('hero_title_1')} <span className="script-accent">{t('hero_title_2')}</span>{t('hero_title_3')}</h1>
              <p data-aos="fade-up" className={`${styles.heroText} animate-fade-up delay-100`}>{t('hero_desc')}</p>
              <div className={`${styles.heroActions} animate-fade-up delay-200`}>
                <Link data-aos="fade-up" to="/fellowship#form" className="btn btn-primary" style={{ textDecoration: 'none' }}>{t('hero_btn_join')}</Link>
                <a data-aos="fade-up"
                  href={liveSettings.is_active && liveSettings.link ? liveSettings.link : "#"}
                  target={liveSettings.is_active && liveSettings.link ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`btn btn-secondary glass ${liveSettings.is_active ? styles.watchLiveActive : ''}`}
                  data-tooltip={liveSettings.is_active ? liveSettings.tooltip : ''}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  <PlayCircle className={styles.btnIcon} /> {t('hero_btn_live')}
                </a>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 2. Church Introduction */}
      <section data-aos="fade-up" className="light-section" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#ffffff' }}>
          <div className={`container ${styles.aboutBlock}`} style={{ margin: '0 auto', alignItems: 'stretch' }}>
            <div className={styles.aboutText} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div>
                <h2 data-aos="fade-up" style={{ marginTop: 0 }}>{t('intro_title_1')} <span className="script-accent">{t('intro_title_2')}</span></h2>
                <p data-aos="fade-up">{t('intro_desc_p1')}</p>
                <p data-aos="fade-up">{t('intro_desc_p2')}</p>
              </div>
              <div className={styles.aboutActions} style={{ marginTop: 'auto' }}>
                <Link data-aos="fade-up" to="/contact#map" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}><MapPin size={16} className={styles.btnIcon} /> {t('intro_btn_loc')}</Link>
                <Link data-aos="fade-up" to="/contact#contact-form" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}><Phone size={16} className={styles.btnIcon} /> {t('intro_btn_contact')}</Link>
              </div>
            </div>
            <div data-aos="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}>
              <img 
                src="/assets/churchimage.webp"
                alt="Jesus Is With Us Church"
                style={{ width: '100%', maxWidth: '500px', display: 'block', margin: '-3rem auto -2rem auto', position: 'relative', zIndex: 1 }}
              />
              <div className={styles.locationCard} style={{ width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 2 }}>
                <div className={styles.locItem}>
                  <h4 data-aos="fade-up">{t('intro_started')}</h4>
                  <p data-aos="fade-up">{t('intro_started_val')}</p>
                </div>
                <div className={styles.locItem}>
                  <h4 data-aos="fade-up">{t('intro_loc')}</h4>
                  <p data-aos="fade-up">{t('intro_loc_val')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pastor's Welcome Message */}
      <section className={styles.pastorSection}>
        <div className="container">
          <div className={styles.pastorGrid}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
              {/* Pastor Top Card */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Pastor Image without background */}
                <div style={{ position: 'relative', width: '100%', padding: '0', display: 'flex', justifyContent: 'center' }}>
                  <img data-aos="zoom-in" data-aos-duration="1000" src="/assets/israel-pastor.png" alt="Pastor Israel Raj" style={{ width: '100%', maxWidth: '500px', height: 'auto', display: 'block' }} />
                </div>

                {/* Content below image */}
                <div data-aos="fade-up" data-aos-delay="200" style={{ padding: '1rem 0 0 0', position: 'relative', textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem', fontSize: '1.1rem', textAlign: 'center', fontStyle: 'italic', fontWeight: 'bold', color: '#0f172a' }}>
                    {t('pastor_closing')}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#475569', fontSize: '0.9rem' }}>{t('pastor_signature_1')}</p>
                  <p style={{ margin: '0.25rem 0', fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{t('pastor_signature_2')}</p>
                  <p style={{ margin: '0.25rem 0', color: '#475569', fontSize: '0.85rem' }}>{t('pastor_signature_3')}</p>
                </div>
              </div>

              {/* Posters / Videos Section */}
              <div style={{ marginTop: 'auto' }}>
                <div data-aos="fade-up" data-aos-delay="300" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <a href="https://www.youtube.com/@jesusiswithusministries7844/featured" target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src="/assets/pastor-poster1.webp" alt="Message 1" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <PlayCircle size={32} color="#ffffff" />
                    </div>
                  </a>
                  <a href="https://www.youtube.com/@jesusiswithusministries7844/featured" target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src="/assets/pastor-poster2.webp" alt="Message 2" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <PlayCircle size={32} color="#ffffff" />
                    </div>
                  </a>
                  <a href="https://www.youtube.com/@jesusiswithusministries7844/featured" target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src="/assets/pastor-poster3.webp" alt="Message 3" style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <PlayCircle size={32} color="#ffffff" />
                    </div>
                  </a>
                </div>
                <div data-aos="fade-up" data-aos-delay="400" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href="https://www.youtube.com/@jesusiswithusministries7844/featured" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>{t('social_youtube')}</a>
                  <a href="https://www.instagram.com/jiwcministries?igsh=MXBqN2U3cHdrOWZjZg==" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>{t('social_instagram')}</a>
                  <a href="https://www.facebook.com/share/1BqSmZKf3S/" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>{t('social_facebook')}</a>
                  <a href="https://sharechat.com/profile/1894693559?d=n" target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>{t('social_sharechat')}</a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div style={{ padding: '1rem 0 0 0', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div data-aos="fade-left" data-aos-delay="100" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777' }}>
                  <UserCircle size={18} />
                </div>
                <span style={{ color: '#db2777', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {t('pastor_section_label')}
                </span>
              </div>

              <h2 data-aos="fade-left" data-aos-delay="200" style={{ fontSize: 'clamp(2rem, 3.5vw, 3.5rem)', lineHeight: '1.2', color: '#0f172a', marginBottom: '0.5rem', fontWeight: '800' }}>
                <span style={{ whiteSpace: 'nowrap' }}>{t('pastor_welcome_title_1')}</span><br />
                <span>{t('pastor_welcome_title_2')} </span>
                <span className="script-accent" style={{ color: 'var(--color-golden-accent)', display: 'inline-block', marginTop: '0.5rem', fontSize: 'clamp(3rem, 4.5vw, 4rem)' }}>{t('pastor_welcome_title_3')}</span>
              </h2>

              <div data-aos="fade-up" data-aos-delay="300" style={{ background: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', gap: '1rem', alignItems: 'flex-start', margin: '2.5rem 0', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: '#f43f5e', borderRadius: '0 4px 4px 0' }}></div>
                <Quote size={28} color="#f43f5e" style={{ flexShrink: 0, marginTop: '4px' }} />
                <p style={{ fontStyle: 'italic', color: '#334155', fontWeight: '600', fontSize: '1.1rem', margin: 0, lineHeight: '1.6' }}>
                  {t('pastor_welcome_verse')}
                </p>
              </div>

              <p data-aos="fade-up" data-aos-delay="400" style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>{t('pastor_welcome_p1')}</p>
              <p data-aos="fade-up" data-aos-delay="500" style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '3rem' }}>{t('pastor_welcome_p2')}</p>

              <div data-aos="zoom-in-up" data-aos-delay="600" style={{ background: '#0f172a', borderRadius: '16px', padding: '2.5rem', color: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Flame size={28} color="#eab308" />
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff', fontWeight: '800' }}>
                    {t('pastor_revival_heading')}
                  </h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.8', margin: 0 }}>{t('pastor_revival_p1')}</p>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Section (Features) */}
          <div className="container" style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
              <div style={{ height: '2px', background: 'var(--gradient-primary)', flex: 1, maxWidth: '100px' }}></div>
              <h3 data-aos="fade-up" style={{ fontWeight: '700', fontSize: '1.5rem', color: 'var(--color-dark-bg)', margin: 0 }}>
                {t('pastor_revival_list_heading')}
              </h3>
              <div style={{ height: '2px', background: 'var(--gradient-primary)', flex: 1, maxWidth: '100px' }}></div>
            </div>

            <div data-aos="fade-up" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              paddingTop: '3rem'
            }}>
              {/* Feature 1 */}
              <div className={styles.featureCard}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-white)', boxShadow: 'var(--shadow-elegant)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)', margin: '0 auto 1.5rem auto' }}>
                  <Church size={32} />
                </div>
                <h4 style={{ color: 'var(--color-dark-bg)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>{t('pastor_revival_list_title_1')}</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{t('pastor_revival_list_1')}</p>
              </div>

              {/* Feature 2 */}
              <div className={styles.featureCard}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-white)', boxShadow: 'var(--shadow-elegant)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)', margin: '0 auto 1.5rem auto' }}>
                  <Users size={32} />
                </div>
                <h4 style={{ color: 'var(--color-dark-bg)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>{t('pastor_revival_list_title_2')}</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{t('pastor_revival_list_2')}</p>
              </div>

              {/* Feature 3 */}
              <div className={styles.featureCard}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-white)', boxShadow: 'var(--shadow-elegant)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)', margin: '0 auto 1.5rem auto' }}>
                  <HeartHandshake size={32} />
                </div>
                <h4 style={{ color: 'var(--color-dark-bg)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>{t('pastor_revival_list_title_3')}</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{t('pastor_revival_list_3')}</p>
              </div>

              {/* Feature 4 */}
              <div className={styles.featureCard}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-white)', boxShadow: 'var(--shadow-elegant)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)', margin: '0 auto 1.5rem auto' }}>
                  <Globe size={32} />
                </div>
                <h4 style={{ color: 'var(--color-dark-bg)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700' }}>{t('pastor_revival_list_title_4')}</h4>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{t('pastor_revival_list_4')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 4. Special Ministries */}
      <SpecialMinistries />


      {/* 4. Next Upcoming */}
      <section data-aos="fade-up" className="light-section">
        <div className={`container ${styles.upcomingGrid}`}>
          <div className={styles.upcomingHeaderFull}>
            <h2 data-aos="fade-up">{t('upcoming_title')} <span className="script-accent">{t('upcoming_title_2')}</span></h2>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>{t('upcoming_loading')}</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1', color: '#64748b' }}>{t('upcoming_empty')}</div>
          ) : (
            <>
              {featuredEvent && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    id="featured-event-poster"
                    className={styles.posterWrapper}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ touchAction: 'pan-y', cursor: 'grab', userSelect: 'none' }}
                  >
                    {featuredEvent.image_url ? (
                      <img data-aos="fade-up" src={featuredEvent.image_url} alt="Poster" className={styles.posterImg} draggable="false" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: '300px', background: '#e2e8f0', borderRadius: '16px' }}></div>
                    )}
                    <div className={styles.posterCaption}>
                      <h4 data-aos="fade-up">{featuredEvent[`title_${language}`] || featuredEvent.title_en || featuredEvent.title}</h4>
                      {featuredEvent.learn_more_url && (
                        <a data-aos="fade-up" href={featuredEvent.learn_more_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                          <PlayCircle size={16} /> {t('upcoming_btn_more')}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Dots Navigation */}
                  {events.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                      {events.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveEventIndex(idx)}
                          style={{
                            width: '10px', height: '10px', borderRadius: '50%', border: 'none',
                            background: activeEventIndex === idx ? '#007bff' : '#cbd5e1',
                            cursor: 'pointer', transition: 'background 0.3s'
                          }}
                          aria-label={`Show event ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.eventsList}>
                {upcomingEvents.map((event, index) => {
                  const displayDescription = event[`description_${language}`] || event.description_en || event.description;
                  return (
                    <div
                      key={event.id}
                      className={styles.eventItem}
                      data-aos="fade-left"
                      data-aos-duration="1200"
                      data-aos-delay={index * 100}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      onClick={() => {
                        const originalIndex = events.findIndex(e => e.id === event.id);
                        if (originalIndex !== -1) setActiveEventIndex(originalIndex);
                        const el = document.getElementById('featured-event-poster');
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }}
                    >
                      {event.image_url ? (
                        <img src={event.image_url} alt="Event Thumb" />
                      ) : (
                        <div style={{ width: '100px', height: '80px', background: '#cbd5e1', borderRadius: '8px' }}></div>
                      )}
                      <div className={styles.eventInfo}>
                        <h4>{event[`title_${language}`] || event.title_en || event.title}</h4>
                        <div className={styles.eventMeta}>
                          <span><Calendar size={14} /> {new Date(event.event_date).toLocaleDateString('en-GB')}</span>
                          {event.event_time && <span>• {event.event_time}</span>}
                        </div>
                        {(event.location || event.location_en || event.location_ta) && (
                          <div className={styles.eventMeta} style={{ marginTop: '0.25rem' }}>
                            <span><MapPin size={14} /> {language === 'ta' && event.location_ta ? event.location_ta : (event.location_en || event.location)}</span>
                          </div>
                        )}
                        {displayDescription && !displayDescription.startsWith('<!--HIDDEN-->') && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            {displayDescription.replace('<!--HIDDEN-->', '').substring(0, 80)}{displayDescription.length > 80 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4.5. Our Services Section */}
      <section data-aos="fade-up" className={styles.servicesSection}>
        <div className={styles.servicesOverlay}></div>

        {/* Scattered Images (hidden on mobile) */}
        <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=500&q=80" alt="Service 1" className={`${styles.scatterImg} ${styles.scatter1}`} />
        <img src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80" alt="Service 2" className={`${styles.scatterImg} ${styles.scatter2}`} />
        <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80" alt="Service 3" className={`${styles.scatterImg} ${styles.scatter3}`} />
        <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80" alt="Service 4" className={`${styles.scatterImg} ${styles.scatter4}`} />

        <div className={styles.servicesContent} data-aos="zoom-in" data-aos-duration="1000">
          <h2>{t('services_title')} <span className="script-accent" style={{ color: 'var(--color-golden-accent)', fontSize: '1.2em' }}>{t('services_title_2')}</span></h2>
          <div className={styles.servicesList}>
            <p><strong>{t('service_1')}</strong> 6:00 AM - 8:00 AM</p>
            <p><strong>{t('service_2')}</strong> 8:30 AM - 11:30 AM</p>
            <p><strong>{t('service_3')}</strong> 6:30 PM - 8:30 PM</p>
            <p><strong>{t('service_4')}</strong> 10:00 AM - 1:00 PM</p>
            <p><strong>{t('service_5')}</strong> 7:00 PM - 9:00 PM</p>
            <p className={styles.highlightService} style={{ color: '#db2777', border: 'none', fontWeight: 'bold' }}>
              {t('service_highlight')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Sermons & Gallery Split */}
      <section data-aos="fade-up" className="gray-section">
        <div className={`container ${styles.splitGrid}`}>
          <div className={styles.splitColumn}>
            <h2 data-aos="fade-up"><span className="script-accent">{t('sermons_title')}</span> {t('sermons_title_2')}</h2>
            <div data-aos="fade-up" className={styles.stackedCards}>
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 1" className={styles.stackItem1} />
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 2" className={styles.stackItem2} />
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 3" className={styles.stackItem3} />
            </div>
            <p data-aos="fade-up" className={styles.splitDesc}>{t('sermons_desc')}</p>
            <Link data-aos="fade-up" to="/resources" className={styles.viewAll}>{t('sermons_btn')} <ArrowRight size={16} /></Link>
          </div>

          <div className={styles.splitColumn}>
            <h2 data-aos="fade-up"><span className="script-accent">{t('gallery_title')}</span> {t('gallery_title_2')}</h2>
            <div data-aos="fade-up" className={styles.stackedCards}>
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 1" className={styles.stackItem1} />
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 2" className={styles.stackItem2} />
              <img data-aos="fade-up" src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 3" className={styles.stackItem3} />
            </div>
            <p data-aos="fade-up" className={styles.splitDesc}>
              {t('gallery_desc')}
            </p>
            <Link data-aos="fade-up" to="/gallery" className={styles.viewAll}>
              {t('gallery_btn')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      {/* Prayer CTA */}
      <PrayerCTA />
    </>
  );
}
