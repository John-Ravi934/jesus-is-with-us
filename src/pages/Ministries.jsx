import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Heart, BookOpen, Music, Home, Globe, X } from 'lucide-react';
import styles from './Ministries.module.css';

export default function Ministries() {
  const ministries = [
    { title: 'Gospel Outreach', icon: <Globe size={40} />, img: 'src/assets/Gospel Outreach.png', desc: 'Taking the message of hope across nations through mass crusades.' },
    { title: 'Village Ministries', icon: <Home size={40} />, img: 'src/assets/Village Ministries.png', desc: 'Supporting and uplifting remote communities with the love of Christ.' },
    { title: 'Children Ministries', icon: <Heart size={40} />, img: 'src/assets/Children Ministries.png', desc: 'Nurturing the faith of the next generation through Sunday School.' },
    { title: 'Youth Ministries', icon: <Users size={40} />, img: 'src/assets/Youth Meeting.png', desc: 'Empowering young adults to live passionately for Jesus.' },
    { title: 'Family Ministries', icon: <Users size={40} />, img: 'src/assets/Family Ministries.png', desc: 'Building strong, Christ-centered homes and marriages.' },
    { title: 'Worship Ministries', icon: <Music size={40} />, img: 'src/assets/Worship Ministries.png', desc: 'Creating an atmosphere for the Holy Spirit to move.' }
  ];

  const [selectedMinistry, setSelectedMinistry] = useState(null);

  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Get Involved</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Our <span className="script-accent">Ministries</span></h1>
        </div>
      </section>

      <section className="gray-section">
        <div className="container">
          <div className={styles.intro}>
            <span className="subheading">Serving Together</span>
            <h2 data-aos="fade-up">Find Your <span className="script-accent">Calling</span></h2>
            <p data-aos="fade-up">God has given each of us unique gifts to serve His kingdom. Explore our various ministries and find where you belong. We believe that everyone has a role to play in the body of Christ.</p>
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
                  <a href="#" className={styles.learnMore} onClick={(e) => {
                    e.preventDefault();
                    setSelectedMinistry(min);
                  }}>Learn More <ArrowRight size={16} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="dark-section">
        <div className={`container ${styles.impactContainer}`}>
          <div className={styles.impactText}>
            <span className="subheading">Our Impact</span>
            <h2 data-aos="fade-up">Changing Lives <span className="script-accent">Globally</span></h2>
            <p data-aos="fade-up">Through our various ministries, we have seen incredible testimonies of healing, restoration, and salvation. Your participation makes this possible.</p>
            <Link to="/fellowship#form" className="btn btn-primary" style={{marginTop: '2rem', textDecoration: 'none'}}>Volunteer With Us</Link>
          </div>
          <div className={styles.impactStats}>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">10K+</h3>
              <p data-aos="fade-up">Lives Touched</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">200+</h3>
              <p data-aos="fade-up">Active Volunteers</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">12</h3>
              <p data-aos="fade-up">Global Outreach Trips</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3 data-aos="fade-up">24/7</h3>
              <p data-aos="fade-up">Prayer Chain</p>
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
            <button 
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
                <p data-aos="fade-up" style={{ margin: '0 0 8px 0' }}><strong>Time:</strong> Weekly Meetings</p>
                <p data-aos="fade-up" style={{ margin: '0' }}><strong>Place:</strong> Main Church Campus</p>
              </div>

              <p data-aos="fade-up" style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                {selectedMinistry.desc} Join us in making a difference and discovering your God-given purpose. Everyone is welcome to participate and serve.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/fellowship#whatsapp" className="btn btn-primary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Get Involved Today</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
