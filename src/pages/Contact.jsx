import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import styles from './Contact.module.css';

export default function Contact() {
  const [formType, setFormType] = useState('General Inquiry');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#prayer') {
      setFormType('Prayer Request');
      const formSection = document.getElementById('contact-form-section');
      if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash === '#contact-form') {
      const formSection = document.getElementById('contact-form-section');
      if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.hash === '#map') {
      const mapSection = document.getElementById('map');
      if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Get In Touch</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Contact <span className="script-accent">Us</span></h1>
        </div>
      </section>

      <section data-aos="fade-up" className="light-section">
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactInfo}>
            <span className="subheading">We'd Love To Hear From You</span>
            <h2 data-aos="fade-up">Reach Out To Our <span className="script-accent">Team</span></h2>
            <p data-aos="fade-up" className={styles.introText}>Whether you have a question, a prayer request, or you're planning a visit, we are here for you.</p>

            <div data-aos="fade-up" className={styles.infoCards}>
              <div data-aos="fade-up" className={styles.infoCard}>
                <MapPin className={styles.icon} size={32} />
                <div>
                  <h4 data-aos="fade-up">Visit Us</h4>
                  <p data-aos="fade-up">Jesus Is With Us Church
                    M3FC+8C9, Kollapatty,
                    Salem, <br></br>Tamil Nadu 636030</p>
                </div>
              </div>
              <div data-aos="fade-up" className={styles.infoCard}>
                <Phone className={styles.icon} size={32} />
                <div>
                  <h4 data-aos="fade-up">Call Us</h4>
                  <p data-aos="fade-up">+1 (234) 567-8900<br />+1 (987) 654-3210</p>
                </div>
              </div>
              <div data-aos="fade-up" className={styles.infoCard}>
                <Mail className={styles.icon} size={32} />
                <div>
                  <h4 data-aos="fade-up">Email Us</h4>
                  <p data-aos="fade-up"> jiwcministry033@gmail.com <br />prayer@jesusiswithus.org</p>
                </div>
              </div>
              <div data-aos="fade-up" className={styles.infoCard}>
                <Clock className={styles.icon} size={32} />
                <div>
                  <h4 data-aos="fade-up">Church Hours</h4>
                  <p data-aos="fade-up">Mon-Fri: 9:00 AM - 5:00 PM<br />Sun: 8:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactFormWrapper} id="contact-form-section">
            <div className={styles.formToggle}>
              <button 
                className={`${styles.toggleBtn} ${formType === 'General Inquiry' ? styles.active : ''}`}
                onClick={() => setFormType('General Inquiry')}
                type="button"
              >
                General Inquiry
              </button>
              <button 
                className={`${styles.toggleBtn} ${formType === 'Prayer Request' ? styles.active : ''}`}
                onClick={() => setFormType('Prayer Request')}
                type="button"
              >
                Prayer Request
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                
                const formData = new FormData(e.target);
                const payload = {
                  formType,
                  fullName: formData.get('fullName'),
                  email: formData.get('email'),
                  subject: formData.get('subject'),
                  phone: formData.get('phone'),
                  place: formData.get('place'),
                  message: formData.get('message')
                };

                try {
                  const { error } = await supabase.functions.invoke('send-email', {
                    body: payload
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
              {formType === 'General Inquiry' ? (
                <>
                  <div className={styles.inputGroup}>
                    <input type="text" name="fullName" placeholder="Your Name" required />
                    <input type="email" name="email" placeholder="Your Email" required />
                  </div>
                  <input type="text" name="subject" placeholder="Subject" required />
                  <textarea name="message" placeholder="Text or Testimony" rows="6" required></textarea>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" name="fullName" placeholder="Your Name" required />
                  <input type="email" name="email" placeholder="Your Email" required />
                  <input type="tel" name="phone" placeholder="Phone Number" required />
                  <input type="text" name="place" placeholder="Place" required />
                  <textarea name="message" placeholder="Your Prayer Request" rows="6" required></textarea>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><Send size={18} style={{ marginRight: '8px' }} /> Send Message</>}
              </button>
            </form>

            <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
              <h4 data-aos="fade-up" style={{ marginBottom: '1.5rem', color: '#666', fontSize: '1.1rem' }}>Connect With Us</h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <a data-aos="fade-up" href="https://www.facebook.com/share/1BqSmZKf3S/"  target="_blank" rel="noopener noreferrer" className={styles.socialIcon} style={{ padding: '0.8rem', background: '#f5f5f5', borderRadius: '50%', color: 'var(--color-primary-blue)', display: 'inline-flex', transition: 'all 0.3s ease' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a data-aos="fade-up" href="https://www.instagram.com/jiwcministries?igsh=MXBqN2U3cHdrOWZjZg=="  target="_blank" rel="noopener noreferrer" className={styles.socialIcon} style={{ padding: '0.8rem', background: '#f5f5f5', borderRadius: '50%', color: 'var(--color-primary-pink)', display: 'inline-flex', transition: 'all 0.3s ease' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a data-aos="fade-up" href="https://www.youtube.com/@jesusiswithusministries7844/featured"  target="_blank" rel="noopener noreferrer" className={styles.socialIcon} style={{ padding: '0.8rem', background: '#f5f5f5', borderRadius: '50%', color: '#ff0000', display: 'inline-flex', transition: 'all 0.3s ease' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </a>
                <a data-aos="fade-up" href="#" className={styles.socialIcon} style={{ padding: '0.8rem', background: '#f5f5f5', borderRadius: '50%', color: '#1da1f2', display: 'inline-flex', transition: 'all 0.3s ease' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-aos="fade-up" className={styles.mapSection} id="map">
        <div className={styles.mapPlaceholder} style={{ padding: 0, overflow: 'hidden', display: 'flex', height: '500px' }}>
          <iframe 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            loading="lazy" 
            allowFullScreen 
            src="https://maps.google.com/maps?q=Jesus%20Is%20With%20Us%20Church,%20M3FC+8C9,%20Kollapatty,%20Salem,%20Tamil%20Nadu%20636030&t=&z=15&ie=UTF8&iwloc=&output=embed"
            title="Google Maps"
          ></iframe>
        </div>
      </section>
    </>
  );
}
