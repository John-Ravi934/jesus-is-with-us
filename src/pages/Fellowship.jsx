import { Calendar, Clock, MapPin, Users, Heart } from 'lucide-react';
import styles from './Fellowship.module.css';

export default function Fellowship() {
  const groups = [
    { title: "Men's Fellowship", time: "Saturdays, 8:00 AM", location: "Main Hall", desc: "Building strong men of faith through brotherhood and the Word." },
    { title: "Women's Fellowship", time: "Saturdays, 10:00 AM", location: "Chapel", desc: "Empowering women to live out their God-given purpose." },
    { title: "Youth Fellowship", time: "Fridays, 6:30 PM", location: "Youth Center", desc: "A passionate community of young people seeking God." },
    { title: "Bible Study", time: "Wednesdays, 7:00 PM", location: "Online & In-Person", desc: "Deep diving into the scriptures to grow in wisdom." },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Do Life Together</span>
          <h1 className="animate-fade-up delay-100">Our <span className="script-accent">Fellowship</span></h1>
        </div>
      </section>

      <section className="light-section">
        <div className="container">
          <div className={styles.headerText}>
            <span className="subheading">Community Groups</span>
            <h2>Grow In <span className="script-accent">Faith</span> Together</h2>
            <p>We were not meant to walk this journey alone. Join a fellowship group to connect with others, study the Word, and experience authentic community.</p>
          </div>

          <div className={styles.groupsGrid}>
            {groups.map((group, idx) => (
              <div key={idx} className={styles.groupCard}>
                <div className={styles.cardHeader}>
                  <Users size={32} className={styles.groupIcon} />
                  <h3>{group.title}</h3>
                </div>
                <p className={styles.groupDesc}>{group.desc}</p>
                <div className={styles.groupMeta}>
                  <span><Clock size={16}/> {group.time}</span>
                  <span><MapPin size={16}/> {group.location}</span>
                </div>
                <button className="btn btn-secondary" style={{width: '100%', marginTop: '1.5rem'}}>Join Group</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gray-section">
        <div className={`container ${styles.joinContainer}`}>
          <div className={styles.joinForm}>
            <h3>Join A Fellowship</h3>
            <p>Fill out the form below and our team will connect you with a group.</p>
            <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
              <div className={styles.inputGroup}>
                <input type="text" placeholder="Full Name" required />
                <input type="email" placeholder="Email Address" required />
              </div>
              <input type="tel" placeholder="Phone Number" required />
              <select required>
                <option value="">Select Fellowship Interest</option>
                <option value="men">Men's Fellowship</option>
                <option value="women">Women's Fellowship</option>
                <option value="youth">Youth Fellowship</option>
                <option value="bible">Bible Study</option>
              </select>
              <button type="submit" className="btn btn-primary">Submit Request</button>
            </form>
          </div>
          <div className={`glass-dark ${styles.whatsappCard}`}>
            <Heart size={48} color="var(--color-golden-accent)" style={{marginBottom: '1rem'}} />
            <h3>Join Our WhatsApp Community</h3>
            <p>Get daily encouragements, prayer points, and stay updated with fellowship activities directly on your phone.</p>
            <button className="btn" style={{backgroundColor: '#25D366', color: '#fff', marginTop: '1.5rem'}}>Join WhatsApp Group</button>
          </div>
        </div>
      </section>
    </>
  );
}
