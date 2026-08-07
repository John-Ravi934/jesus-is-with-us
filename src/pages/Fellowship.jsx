import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './Fellowship.module.css';
import heroBg from '/assets/Youth Meeting.png';
import { supabase } from '../lib/supabase'; 

export default function Fellowship() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#form' || window.location.hash === '#join-form') {
      const section = document.getElementById('form');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash === '#whatsapp') {
      const section = document.getElementById('whatsapp');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const groups = [
    { title: "Men's Fellowship", time: "Saturdays, 8:00 AM", location: "Main Hall", desc: "Building strong men of faith through brotherhood and the Word." },
    { title: "Women's Fellowship", time: "Saturdays, 10:00 AM", location: "Chapel", desc: "Empowering women to live out their God-given purpose." },
    { title: "Youth Fellowship", time: "Fridays, 6:30 PM", location: "Youth Center", desc: "A passionate community of young people seeking God." },
    { title: "Bible Study", time: "Wednesdays, 7:00 PM", location: "Online & In-Person", desc: "Deep diving into the scriptures to grow in wisdom." },
  ];

  return (
    <>
      <section data-aos="fade-up" className={styles.hero} style={{ backgroundImage: `url("${heroBg}")` }}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Do Life Together</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Our <span className="script-accent">Fellowship</span></h1>
        </div>
      </section>

      <section data-aos="fade-up" className="light-section">
        <div className="container">
          <div className={styles.headerText}>
            <span className="subheading">Community Groups</span>
            <h2 data-aos="fade-up">Grow In <span className="script-accent">Faith</span> Together</h2>
            <p data-aos="fade-up">We were not meant to walk this journey alone. Join a fellowship group to connect with others, study the Word, and experience authentic community.</p>
          </div>

          <div className={styles.groupsGrid} data-aos="fade-up">
            {groups.map((group, idx) => (
              <div data-aos="fade-up" key={idx} className={styles.groupCard}>
                <div data-aos="fade-up" className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Users size={32} className={styles.groupIcon} />
                  </div>
                  <h3 data-aos="fade-up">{group.title}</h3>
                </div>
                <p data-aos="fade-up" className={styles.groupDesc}>{group.desc}</p>
                <div className={styles.groupMeta}>
                  <span><Clock size={16} /> {group.time}</span>
                  <span><MapPin size={16} /> {group.location}</span>
                </div>
                <a
                  href="#join-form"
                  className={`btn btn-secondary ${styles.joinGroupBtn}`}
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                  onClick={(e) => {
                    // Smooth scroll
                    e.preventDefault();
                    document.getElementById('join-form').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join Group
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-aos="fade-up" className="gray-section">
        <div className={`container ${styles.joinContainer}`} id="form">
          <div className={styles.joinForm}>
            <h3 data-aos="fade-up">Join A Fellowship</h3>
            <p data-aos="fade-up">Fill out the form below and our team will connect you with a group.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                try {
                  // Send data to our secure Edge Function
                  const { data, error } = await supabase.functions.invoke('send-email', {
                    body: {
                      fullName: e.target[0].value,
                      email: e.target[1].value,
                      phone: e.target[2].value,
                      interest: e.target[3].value,
                      message: e.target[4].value
                    }
                  });
                  
                  if (error) {
                    toast.error('Failed to send request. Please try again.');
                  } else {
                    toast.success('Thank you, we will reach you soon!');
                    e.target.reset();
                  }
                } catch (err) {
                  toast.error('An unexpected error occurred.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className={styles.form}
            >
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
                <option value="volunteer">Volunteer</option>
                <option value="sunday">Join as sunday</option>
              </select>
              <textarea placeholder="Your Message (Optional)" rows="4" style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
              <button data-aos="fade-up" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
          <div data-aos="fade-up" className={styles.whatsappCard} id="whatsapp">
            <Heart size={48} color="#fff" style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }} />
            <h3 data-aos="fade-up">Join Our WhatsApp Community</h3>
            <p data-aos="fade-up">Get daily encouragements, prayer points, and stay updated with fellowship activities directly on your phone.</p>
            <a data-aos="fade-up" href="https://chat.whatsapp.com/your-invite-link" target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
              Join WhatsApp Group
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
