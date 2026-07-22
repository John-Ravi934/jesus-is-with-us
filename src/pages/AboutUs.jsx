import { CheckCircle, Target, Eye, Users, PlayCircle, MapPin, Phone } from 'lucide-react';
import styles from './AboutUs.module.css';

export default function AboutUs() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Who We Are</span>
          <h1 className="animate-fade-up delay-100">Our <span className="script-accent">Story</span></h1>
        </div>
      </section>

      {/* Alternating About Sections matching the Unique UI Design */}
      <section className="light-section" style={{ paddingBottom: '2rem' }}>
        
        {/* Block 1: Our Story */}
        <div className={`container ${styles.aboutBlock}`}>
          <div className={styles.aboutText}>
            <h2>A Legacy of <span className="script-accent">Faith</span> & Action</h2>
            <p>What started as a small prayer group of 5 people in a living room has blossomed into a global movement reaching thousands every week. Our story is a testament to God's unfailing grace and the power of united prayer.</p>
            <p>For over 15 years, Jesus Is With Us Ministries has been at the forefront of spiritual revival, community outreach, and raising a generation of passionate worshippers.</p>
            
            <div className={styles.statsRow}>
              <div>
                <h3>15K+</h3>
                <span>Members</span>
              </div>
              <div>
                <h3>50+</h3>
                <span>Missions</span>
              </div>
              <div>
                <h3>100+</h3>
                <span>Groups</span>
              </div>
            </div>
          </div>
          <div className={styles.aboutImageRight}>
            <img src="https://images.unsplash.com/photo-1544605943-7f7f985064fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Our Story" className={styles.roundedOrganic} />
          </div>
        </div>

        {/* Block 2: Founder */}
        <div className={`container ${styles.aboutBlock} ${styles.reverseBlock}`}>
          <div className={styles.aboutImageLeft}>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Founder" className={styles.roundedOrganicAlt} />
          </div>
          <div className={styles.aboutText}>
            <span className="subheading">Founder's Message</span>
            <h2>Driven By <span className="script-accent">Compassion</span></h2>
            <blockquote className={styles.messageQuote}>
              "The church is not a building you go to, but a family you belong to. We are called to be the hands and feet of Jesus to a hurting world."
            </blockquote>
            <p>Welcome to our family. We believe that no matter where you are in life, God has a unique purpose for you. Let's walk this journey of faith together.</p>
            
            <div className={styles.socialLinks}>
              <a href="#">YouTube</a>
              <a href="#">Instagram</a>
              <a href="#">Facebook</a>
            </div>
          </div>
        </div>

      </section>

      {/* Block 3: Mission & Vision (Dark Section) */}
      <section className="dark-section" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className={styles.missionVisionGrid}>
            <div className={styles.mvContent}>
              <Target size={40} className={styles.mvIcon} />
              <h3>Our <span className="script-accent">Mission</span></h3>
              <p>To preach the Gospel of Jesus Christ to the ends of the earth, heal the brokenhearted, and set the captives free through the power of the Holy Spirit.</p>
            </div>
            
            <div className={styles.mvContent}>
              <Eye size={40} className={styles.mvIcon} />
              <h3>Our <span className="script-accent">Vision</span></h3>
              <p>To see a global awakening where every community experiences the tangible presence of God and is transformed by His unconditional love.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Block 4: Milestones of Faith - Our Church Journey */}
      <section className="light-section" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className={styles.milestoneHeader}>
            <span className="subheading">Our Church Journey</span>
            <h2>Milestones of <span className="script-accent">Faith</span></h2>
            <p>From humble beginnings to a global family, see how God has moved through the decades.</p>
          </div>
          
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3>1970</h3>
                <h4>The Humble Beginning</h4>
                <p>Started as a small prayer group in a living room with just 5 members under Pastor Aruldaasan Samuel.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3>1985</h3>
                <h4>First Church Building</h4>
                <p>By God's grace, we moved into our first dedicated sanctuary, accommodating over 500 members.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3>2005</h3>
                <h4>Global Outreach Launched</h4>
                <p>Initiated our first international mission trips and established community support programs.</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3>2021</h3>
                <h4>New Leadership Era</h4>
                <p>Pastor Joyson took over the leadership, bringing a renewed focus on youth ministry and digital evangelism.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className={styles.ctaSection}>
        <div className={styles.ctaOverlay}></div>
        <div className={`container ${styles.ctaContent}`}>
          <h2>Need <span className="script-accent">Prayer?</span></h2>
          <p>Our intercessory team is standing by to pray with you.</p>
          <button className="btn btn-primary" style={{marginTop: '2rem'}}>Submit Prayer Request</button>
        </div>
      </section>
    </>
  );
}
