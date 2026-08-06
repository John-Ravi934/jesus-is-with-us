import { CheckCircle, Target, Eye, Users, PlayCircle, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AboutUs.module.css';

export default function AboutUs() {
  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Who We Are</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Our <span className="script-accent">Story</span></h1>
        </div>
      </section>

      {/* Alternating About Sections matching the Unique UI Design */}
      <section data-aos="fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Block 1: Our Story */}
        <div style={{ background: '#ffffff', padding: '4rem 0' }}>
          <div className={`container ${styles.aboutBlock}`} style={{ marginTop: 0, marginBottom: 0 }}>
            <div className={styles.aboutText}>
              <h2 data-aos="fade-up">A Legacy of <span className="script-accent">Faith</span> & Action</h2>
              <p data-aos="fade-up">What started as a small prayer group of 5 people in a living room has blossomed into a global movement reaching thousands every week. Our story is a testament to God's unfailing grace and the power of united prayer.</p>
              <p data-aos="fade-up">For over 15 years, Jesus Is With Us Ministries has been at the forefront of spiritual revival, community outreach, and raising a generation of passionate worshippers.</p>
            </div>
            <div className={styles.aboutImageRight}>
              <img data-aos="fade-up" src="src\assets\Church image.jpg" alt="Our Story" className={styles.roundedOrganic} />
            </div>
          </div>
        </div>

        {/* Block 2: Founder */}
        <div style={{ background: '#f5f5f5', padding: '4rem 0' }}>
          <div className={`container ${styles.aboutBlock} ${styles.reverseBlock}`} style={{ marginTop: 0, marginBottom: 0 }}>
            <div className={styles.aboutImageLeft}>
              <img data-aos="fade-up" src="src\assets\Israel Pastor.png" alt="Founder" className={styles.roundedOrganicAlt} />
            </div>
            <div className={styles.aboutText}>
              <span className="subheading">Founder's Message</span>
              <h2 data-aos="fade-up">Driven By <span className="script-accent">Compassion</span></h2>
              <blockquote className={styles.messageQuote}>
                "The church is not a building you go to, but a family you belong to. We are called to be the hands and feet of Jesus to a hurting world."
              </blockquote>
              <p data-aos="fade-up">Welcome to our family. We believe that no matter where you are in life, God has a unique purpose for you. Let's walk this journey of faith together.</p>
              
              <div className={styles.socialLinks}>
                <a data-aos="fade-up" href="#">YouTube</a>
                <a data-aos="fade-up" href="#">Instagram</a>
                <a data-aos="fade-up" href="#">Facebook</a>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Block 3: Mission & Vision (Dark Section) */}
      <section data-aos="fade-up" className="dark-section" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className={styles.missionVisionGrid}>
            <div className={styles.mvContent}>
              <Target size={40} className={styles.mvIcon} />
              <h3 data-aos="fade-up">Our <span className="script-accent">Mission</span></h3>
              <p data-aos="fade-up">To preach the Gospel of Jesus Christ to the ends of the earth, heal the brokenhearted, and set the captives free through the power of the Holy Spirit.</p>
            </div>
            
            <div className={styles.mvContent}>
              <Eye size={40} className={styles.mvIcon} />
              <h3 data-aos="fade-up">Our <span className="script-accent">Vision</span></h3>
              <p data-aos="fade-up">To see a global awakening where every community experiences the tangible presence of God and is transformed by His unconditional love.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Block 4: Milestones of Faith - Our Church Journey */}
      <section data-aos="fade-up" className="light-section" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className={styles.milestoneHeader}>
            <span className="subheading">Our Church Journey</span>
            <h2 data-aos="fade-up">Milestones of <span className="script-accent">Faith</span></h2>
            <p data-aos="fade-up">From humble beginnings to a global family, see how God has moved through the decades.</p>
          </div>
          
          <div className={styles.timeline} data-aos="fade-up">
            <div className={styles.timelineItem} data-aos="fade-up">
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContentWrapper}>
                <div className={styles.timelineContent}>
                  <h3 data-aos="fade-up">1970</h3>
                  <h4 data-aos="fade-up">The Humble Beginning</h4>
                  <p data-aos="fade-up">Started as a small prayer group in a living room with just 5 members under Pastor Israel Raj.</p>
                </div>
                <div className={styles.timelineImage}>
                  <img data-aos="fade-up" src="src\assets\Family Ministries.png" alt="Humble Beginning" className={styles.roundedOrganicAlt} />
                </div>
              </div>
            </div>
            
            <div className={styles.timelineItem} data-aos="fade-up">
              <div className={styles.timelineDot}></div>
              <div className={`${styles.timelineContentWrapper} ${styles.timelineReverse}`}>
                <div className={styles.timelineContent}>
                  <h3 data-aos="fade-up">1985</h3>
                  <h4 data-aos="fade-up">First Church Building</h4>
                  <p data-aos="fade-up">By God's grace, we moved into our first dedicated sanctuary, accommodating over 500 members.</p>
                </div>
                <div className={styles.timelineImage}>
                  <img data-aos="fade-up" src="src\assets\Family Ministries.png" alt="First Church" className={styles.roundedOrganic} />
                </div>
              </div>
            </div>
            
            <div className={styles.timelineItem} data-aos="fade-up">
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContentWrapper}>
                <div className={styles.timelineContent}>
                  <h3 data-aos="fade-up">2005</h3>
                  <h4 data-aos="fade-up">Global Outreach Launched</h4>
                  <p data-aos="fade-up">Initiated our first international mission trips and established community support programs.</p>
                </div>
                <div className={styles.timelineImage}>
                  <img data-aos="fade-up" src="src\assets\Family Ministries.png" alt="Global Outreach" className={styles.roundedOrganicAlt} />
                </div>
              </div>
            </div>
            
            <div className={styles.timelineItem} data-aos="fade-up">
              <div className={styles.timelineDot}></div>
              <div className={`${styles.timelineContentWrapper} ${styles.timelineReverse}`}>
                <div className={styles.timelineContent}>
                  <h3 data-aos="fade-up">2021</h3>
                  <h4 data-aos="fade-up">New Leadership Era</h4>
                  <p data-aos="fade-up">Pastor Yoseppu took over the leadership, bringing a renewed focus on youth ministry and digital evangelism.</p>
                </div>
                <div className={styles.timelineImage}>
                  <img data-aos="fade-up" src="src\assets\Family Ministries.png" alt="New Leadership" className={styles.roundedOrganic} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.ctaSection} data-aos="zoom-in">
        <div className={styles.ctaOverlay}></div>
        <div className={`container ${styles.ctaContent}`}>
          <h2 data-aos="fade-up">Need <span className="script-accent">Prayer?</span></h2>
          <p data-aos="fade-up">Our intercessory team is standing by to pray with you.</p>
          <Link data-aos="fade-up" to="/contact#prayer" className="btn btn-primary" style={{marginTop: '2rem', textDecoration: 'none'}}>Submit Prayer Request</Link>
        </div>
      </section>
    </>
  );
}
