import { ArrowRight, PlayCircle, MapPin, Phone, Mail } from 'lucide-react';
import styles from './Home.module.css';
import videoBg from '../assets/Video.mp4';

export default function Home() {
  return (
    <>
      {/* 1. Hero Section with Video */}
      <section className={styles.hero}>
        <video autoPlay loop muted playsInline className={styles.videoBg}>
          <source src={videoBg} type="video/mp4" />
        </video>
        <div className={styles.heroOverlay}></div>
        
        <div className={`container ${styles.heroContent}`}>
          <h1 className="animate-fade-up">Full Gospel <span className="script-accent">Pentecostal Church</span>, Nagercoil</h1>
          <p className={`${styles.heroText} animate-fade-up delay-100`}>Together we build the kingdom of God through prayer, worship, and fellowship.</p>
          <div className={`${styles.heroActions} animate-fade-up delay-200`}>
            <button className="btn btn-primary">Join Us Sunday</button>
            <button className="btn btn-secondary glass"><PlayCircle className={styles.btnIcon} /> Watch Live</button>
          </div>
        </div>
      </section>

      {/* 2. Alternating About Sections */}
      <section className="light-section">
        {/* Block 1 */}
        <div className={`container ${styles.aboutBlock}`}>
          <div className={styles.aboutText}>
            <h2>Full Gospel <span className="script-accent">Pentecostal Church</span></h2>
            <p>The ministry began in 1970 under Pastor Aruldaasan Samuel. In 2021, Pastor Joyson took over the leadership of the ministry, with strong faith and commitment. We warmly welcome you to join us for worship, fellowship, and Biblical teaching.</p>
            <div className={styles.aboutActions}>
              <button className="btn btn-secondary"><MapPin size={16} className={styles.btnIcon}/> Location</button>
              <button className="btn btn-secondary"><Phone size={16} className={styles.btnIcon}/> Contact</button>
            </div>
            <div className={styles.locationCard}>
              <div className={styles.locItem}>
                <h4>Started At</h4>
                <p>Nagercoil, Tamil Nadu</p>
              </div>
              <div className={styles.locItem}>
                <h4>Location</h4>
                <p>123 Main Street, Nagercoil</p>
              </div>
            </div>
          </div>
          <div className={styles.aboutImageRight}>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=600&q=80" alt="Pastor" className={styles.roundedOrganic} />
          </div>
        </div>

        {/* Block 2 */}
        <div className={`container ${styles.aboutBlock} ${styles.reverseBlock}`}>
          <div className={styles.aboutImageLeft}>
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&w=600&q=80" alt="Johnsam Joyson" className={styles.roundedOrganic} />
          </div>
          <div className={styles.aboutText}>
            <h2>Johnsam <span className="script-accent">Joyson</span></h2>
            <p>Pastor Johnsam Joyson serves as the Senior Pastor of FGPC. His passion is to see lives transformed by the power of the Holy Spirit and to equip the next generation for ministry.</p>
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

        {/* Block 3 */}
        <div className={`container ${styles.aboutBlock}`}>
          <div className={styles.aboutText}>
            <h2>Davidsam <span className="script-accent">Joyson</span></h2>
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
            <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&w=600&q=80" alt="Davidsam Joyson" className={styles.roundedOrganic} />
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
          
          <div className={styles.posterWrapper}>
            <img src="https://images.unsplash.com/photo-1511632765486-a01c80cb8ee5?ixlib=rb-4.0.3&w=800&q=80" alt="Poster" className={styles.posterImg} />
            <div className={styles.posterCaption}>
              <h4>Night of Worship & Prophecy</h4>
              <button className="btn btn-primary btn-sm"><PlayCircle size={16} /> Watch Live</button>
            </div>
          </div>
          
          <div className={styles.eventsList}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.eventItem}>
                <img src={`https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&w=150&q=80`} alt="Event Thumb" />
                <div className={styles.eventInfo}>
                  <h4>Holy Spirit Encounter 2026</h4>
                  <p>Aug 15th @ Main Auditorium</p>
                  <a href="#" className={styles.eventLink}>Learn More</a>
                </div>
              </div>
            ))}
          </div>
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
            <a href="#" className={styles.viewAll}>View All Sermons <ArrowRight size={16} /></a>
          </div>

          <div className={styles.splitColumn}>
            <h2><span className="script-accent">Photo</span> Gallery</h2>
            <div className={styles.stackedCards}>
              <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 1" className={styles.stackItem1} />
              <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 2" className={styles.stackItem2} />
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&w=400&q=80" alt="Gallery 3" className={styles.stackItem3} />
            </div>
            <p className={styles.splitDesc}>Get a glimpse of the vibrant life, worship, and fellowship at our church.</p>
            <a href="#" className={styles.viewAll}>View Full Gallery <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
