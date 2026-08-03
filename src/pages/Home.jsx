import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import styles from './Home.module.css';
import videoBg from '../assets/Video.mp4';
import { getEvents } from '../services/eventService';
import AnnouncementPopup from '../components/AnnouncementPopup';
import { getLiveStreamSettings } from '../services/settingsService';

export default function Home() {
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

  return (
    <>
      <AnnouncementPopup />
      {/* 1. Hero Section with Video */}
      <section className={styles.hero}>
        <video autoPlay loop muted playsInline className={styles.videoBg}>
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>
        
        <div className={`container ${styles.heroContent}`}>
          <h1 className="animate-fade-up">Jesus is <span className="script-accent">with us Church </span>, Salem</h1>
          <p className={`${styles.heroText} animate-fade-up delay-100`}>Together we build the kingdom of God through prayer, worship, and fellowship.</p>
          <div className={`${styles.heroActions} animate-fade-up delay-200`}>
            <Link to="/fellowship#form" className="btn btn-primary" style={{ textDecoration: 'none' }}>Join Us Sunday</Link>
            <a 
              href={liveSettings.is_active && liveSettings.link ? liveSettings.link : "#"}
              target={liveSettings.is_active && liveSettings.link ? "_blank" : "_self"}
              rel="noreferrer"
              className={`btn btn-secondary glass ${liveSettings.is_active ? styles.watchLiveActive : ''}`}
              data-tooltip={liveSettings.is_active ? liveSettings.tooltip : ''}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <PlayCircle className={styles.btnIcon} /> Watch Live
            </a>
          </div>
        </div>
      </section>

      {/* 2. Alternating About Sections */}
      <section className="light-section" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Block 1 */}
        <div style={{ background: '#ffffff', padding: '4rem 0' }}>
          <div className={`container ${styles.aboutBlock}`} style={{ margin: '0 auto', paddingTop: 0, paddingBottom: 0 }}>
            <div className={styles.aboutText}>
              <h2>Jesus is <span className="script-accent">with us Church</span></h2>
              <p>The ministry began in 1970 under Pastor Israel Raj. In 2021, Pastor Yoseppu took over the leadership of the ministry, with strong faith and commitment. We warmly welcome you to join us for worship, fellowship, and Biblical teaching.</p>
              <div className={styles.aboutActions}>
                <Link to="/contact#map" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}><MapPin size={16} className={styles.btnIcon}/> Location</Link>
                <Link to="/contact#contact-form" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}><Phone size={16} className={styles.btnIcon}/> Contact</Link>
              </div>
              <div className={styles.locationCard}>
                <div className={styles.locItem}>
                  <h4>Started At</h4>
                  <p>Salem, Tamil Nadu</p>
                </div>
                <div className={styles.locItem}>
                  <h4>Location</h4>
                  <p>Kollapatty, Sarkar Gollappatti, Tamil Nadu 636030</p>
                </div>
              </div>
            </div>
            <div className={styles.aboutImageRight}>
              <img src="src\assets\Church image.jpg" alt="Church" className={styles.roundedOrganic} />
            </div>
          </div>
        </div>

        {/* Block 2 */}
        <div style={{ background: '#f5f5f5', padding: '4rem 0' }}>
          <div className={`container ${styles.aboutBlock} ${styles.reverseBlock}`} style={{ margin: '0 auto', paddingTop: 0, paddingBottom: 0 }}>
            <div className={styles.aboutImageLeft}>
              <img src="src\assets\Israel Pastor.png" alt="Israel Pastor" className={styles.roundedOrganic} />
            </div>
            <div className={styles.aboutText}>
              <h2>Pastor <span className="script-accent">Israel Raj</span></h2>
              <p>Pastor Israel Raj serves as the Senior Pastor of JIWUM. His passion is to see lives transformed by the power of the Holy Spirit and to equip the next generation for ministry.</p>
              <div className={styles.miniVideoSlider}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.miniVideoCard}>
                    <img src={`https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&w=200&q=80`} alt="Video Thumbnail" />
                    <PlayCircle size={24} className={styles.playOverlay} />
                  </div>
                ))}
              </div>
              <div className={styles.socialLinks}>
                <a href="#">YouTube</a>
                <a href="#">Instagram</a>
                <a href="#">Facebook</a>
              </div>
            </div>
          </div>
        </div>

        {/* Block 3 */}
        <div style={{ background: '#ffffff', padding: '4rem 0' }}>
          <div className={`container ${styles.aboutBlock}`} style={{ margin: '0 auto', paddingTop: 0, paddingBottom: 0 }}>
            <div className={styles.aboutText}>
              <h2>Pastor <span className="script-accent">Yoseppu </span></h2>
              <p>Leading the worship ministry with a heart for authentic encounters with God. Through powerful worship sessions, many have experienced healing and breakthrough.</p>
              <div className={styles.miniVideoSlider}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={styles.miniVideoCard}>
                    <img src={`https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&w=200&q=80`} alt="Video Thumbnail" />
                    <PlayCircle size={24} className={styles.playOverlay} />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.aboutImageRight}>
              <img src="src\assets\Yoseppu.png"  alt="Davidsam Joyson" className={styles.roundedOrganic} />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Services Section */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesOverlay}></div>
        <div className={`container ${styles.servicesContent}`}>
          <h2>Our <span className="script-accent">Services</span></h2>
          <div className={styles.servicesList}>
            <p><strong>Sunday 1st Service:</strong> 6:00 AM - 8:00 AM</p>
            <p><strong>Sunday 2nd Service:</strong> 8:30 AM - 11:30 AM</p>
            <p><strong>Bible Study (Tuesday):</strong> 6:30 PM - 8:30 PM</p>
            <p><strong>Friday Fasting Prayer:</strong> 10:00 AM - 1:00 PM</p>
            <p><strong>Saturday Night Worship:</strong> 7:00 PM - 9:00 PM</p>
            <p className={styles.highlightService}>Free & Open to All - Join Us Live on YouTube!</p>
          </div>
        </div>
        {/* Floating Scatted Images */}
        <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&w=300&q=80" alt="Scatter" className={`${styles.scatterImg} ${styles.scatter1}`} />
        <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&w=300&q=80" alt="Scatter" className={`${styles.scatterImg} ${styles.scatter2}`} />
        <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&w=300&q=80" alt="Scatter" className={`${styles.scatterImg} ${styles.scatter3}`} />
        <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&w=300&q=80" alt="Scatter" className={`${styles.scatterImg} ${styles.scatter4}`} />
      </section>

      {/* 4. Next Upcoming */}
      <section className="light-section">
        <div className={`container ${styles.upcomingGrid}`}>
          <div className={styles.upcomingHeaderFull}>
            <h2>Next <span className="script-accent">Upcoming</span></h2>
          </div>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1', color: '#64748b' }}>No upcoming events scheduled.</div>
          ) : (
            <>
              {featuredEvent && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div 
                    className={styles.posterWrapper}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ touchAction: 'pan-y', cursor: 'grab', userSelect: 'none' }}
                  >
                    {featuredEvent.image_url ? (
                      <img src={featuredEvent.image_url} alt="Poster" className={styles.posterImg} draggable="false" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: '300px', background: '#e2e8f0', borderRadius: '16px' }}></div>
                    )}
                    <div className={styles.posterCaption}>
                      <h4>{featuredEvent.title}</h4>
                      {featuredEvent.learn_more_url && (
                        <a href={featuredEvent.learn_more_url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{textDecoration: 'none'}}>
                          <PlayCircle size={16} /> Learn More
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
                {upcomingEvents.map(event => (
                  <div key={event.id} className={styles.eventItem}>
                    {event.image_url ? (
                      <img src={event.image_url} alt="Event Thumb" />
                    ) : (
                      <div style={{ width: '100px', height: '80px', background: '#cbd5e1', borderRadius: '8px' }}></div>
                    )}
                    <div className={styles.eventInfo}>
                      <h4>{event.title}</h4>
                      <div className={styles.eventMeta}>
                        <span><Calendar size={14} /> {new Date(event.event_date).toLocaleDateString()}</span>
                        {event.event_time && <span>• {event.event_time}</span>}
                      </div>
                      {event.location && (
                        <div className={styles.eventMeta} style={{ marginTop: '0.25rem' }}>
                          <span><MapPin size={14} /> {event.location}</span>
                        </div>
                      )}
                      {event.description && !event.description.startsWith('<!--HIDDEN-->') && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                          {event.description.replace('<!--HIDDEN-->', '').substring(0, 80)}{event.description.length > 80 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 5. Sermons & Gallery Split */}
      <section className="gray-section">
        <div className={`container ${styles.splitGrid}`}>
          <div className={styles.splitColumn}>
            <h2><span className="script-accent">Latest</span> Sermons</h2>
            <div className={styles.stackedCards}>
              <img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 1" className={styles.stackItem1} />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 2" className={styles.stackItem2} />
              <img src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&w=400&q=80" alt="Sermon 3" className={styles.stackItem3} />
            </div>
            <p className={styles.splitDesc}>Explore a collection of life-changing messages from our Sunday services and special events.</p>
            <Link to="/resources" className={styles.viewAll}>View All Sermons <ArrowRight size={16} /></Link>
          </div>

          <div className={styles.splitColumn}>
            <h2><span className="script-accent">Photo</span> Gallery</h2>
            <div className={styles.stackedCards}>
              <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 1" className={styles.stackItem1} />
              <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 2" className={styles.stackItem2} />
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 3" className={styles.stackItem3} />
            </div>
              <p className={styles.splitDesc}>
                Get a glimpse of the vibrant life, worship, and fellowship at our church.
              </p>
              <Link to="/gallery" className={styles.viewAll}>
                View Full Gallery <ArrowRight size={16} />
              </Link>
          </div>
        </div>
      </section>
    </>
  );
}
