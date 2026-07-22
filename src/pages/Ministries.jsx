import { ArrowRight, Users, Heart, BookOpen, Music, Home, Globe } from 'lucide-react';
import styles from './Ministries.module.css';

export default function Ministries() {
  const ministries = [
    { title: 'Gospel Outreach', icon: <Globe size={40} />, img: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Taking the message of hope across nations through mass crusades.' },
    { title: 'Village Ministries', icon: <Home size={40} />, img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Supporting and uplifting remote communities with the love of Christ.' },
    { title: 'Children Ministries', icon: <Heart size={40} />, img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Nurturing the faith of the next generation through Sunday School.' },
    { title: 'Youth Ministries', icon: <Users size={40} />, img: 'https://images.unsplash.com/photo-1511632765486-a01c80cb8ee5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Empowering young adults to live passionately for Jesus.' },
    { title: 'Family Ministries', icon: <Users size={40} />, img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Building strong, Christ-centered homes and marriages.' },
    { title: 'Worship Ministries', icon: <Music size={40} />, img: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', desc: 'Creating an atmosphere for the Holy Spirit to move.' }
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Get Involved</span>
          <h1 className="animate-fade-up delay-100">Our <span className="script-accent">Ministries</span></h1>
        </div>
      </section>

      <section className="gray-section">
        <div className="container">
          <div className={styles.intro}>
            <span className="subheading">Serving Together</span>
            <h2>Find Your <span className="script-accent">Calling</span></h2>
            <p>God has given each of us unique gifts to serve His kingdom. Explore our various ministries and find where you belong. We believe that everyone has a role to play in the body of Christ.</p>
          </div>

          <div className={styles.ministriesGrid}>
            {ministries.map((min, idx) => (
              <div key={idx} className={styles.ministryCard}>
                <div className={styles.cardImgWrapper}>
                  <img src={min.img} alt={min.title} />
                  <div className={styles.iconOverlay}>{min.icon}</div>
                </div>
                <div className={styles.cardContent}>
                  <h3>{min.title}</h3>
                  <p>{min.desc}</p>
                  <a href="#" className={styles.learnMore}>Learn More <ArrowRight size={16} /></a>
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
            <h2>Changing Lives <span className="script-accent">Globally</span></h2>
            <p>Through our various ministries, we have seen incredible testimonies of healing, restoration, and salvation. Your participation makes this possible.</p>
            <button className="btn btn-primary" style={{marginTop: '2rem'}}>Volunteer With Us</button>
          </div>
          <div className={styles.impactStats}>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3>10K+</h3>
              <p>Lives Touched</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3>500+</h3>
              <p>Active Volunteers</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3>12</h3>
              <p>Global Outreach Trips</p>
            </div>
            <div className={`glass-dark ${styles.statBox}`}>
              <h3>24/7</h3>
              <p>Prayer Chain</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
