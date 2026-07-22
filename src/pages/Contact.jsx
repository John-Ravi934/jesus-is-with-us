import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Get In Touch</span>
          <h1 className="animate-fade-up delay-100">Contact <span className="script-accent">Us</span></h1>
        </div>
      </section>

      <section className="light-section">
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactInfo}>
            <span className="subheading">We'd Love To Hear From You</span>
            <h2>Reach Out To Our <span className="script-accent">Team</span></h2>
            <p className={styles.introText}>Whether you have a question, a prayer request, or you're planning a visit, we are here for you.</p>

            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <MapPin className={styles.icon} size={32} />
                <div>
                  <h4>Visit Us</h4>
                  <p>123 Faith Avenue, Heaven City, HC 12345</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <Phone className={styles.icon} size={32} />
                <div>
                  <h4>Call Us</h4>
                  <p>+1 (234) 567-8900<br/>+1 (987) 654-3210</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <Mail className={styles.icon} size={32} />
                <div>
                  <h4>Email Us</h4>
                  <p>contact@jesusiswithus.org<br/>prayer@jesusiswithus.org</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <Clock className={styles.icon} size={32} />
                <div>
                  <h4>Office Hours</h4>
                  <p>Mon-Fri: 9:00 AM - 5:00 PM<br/>Sun: 8:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactFormWrapper}>
            <div className={styles.formToggle}>
              <button className={`${styles.toggleBtn} ${styles.active}`}>General Inquiry</button>
              <button className={styles.toggleBtn}>Prayer Request</button>
            </div>
            
            <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
              <div className={styles.inputGroup}>
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
              </div>
              <input type="text" placeholder="Subject" required />
              <textarea placeholder="Your Message" rows="6" required></textarea>
              <button type="submit" className="btn btn-primary"><Send size={18} style={{marginRight: '8px'}}/> Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        {/* Placeholder for Google Maps iframe */}
        <div className={styles.mapPlaceholder}>
          <p>Google Maps Integration Here</p>
        </div>
      </section>
    </>
  );
}
