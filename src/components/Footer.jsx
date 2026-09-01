import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useState } from 'react';
import { subscribeEmail } from '../services/subscriberService';
import styles from './Footer.module.css';
import logo from '/assets/logo.png';
import { FaSharechat } from './FaSharechat';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      await subscribeEmail(email);
      setStatus('success');
      setMessage(t('footer_subscribe_success'));
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.aboutCol}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '-5px' }}>
            <img src={logo} alt="Jesus Is With Us Logo" style={{ height: '110px', objectFit: 'contain' }} />
            <h2 className={styles.logoText} style={{ margin: 0, color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', lineHeight: '1.2' }}>{t('hero_title_1')}<br /><span className="script-accent" style={{ color: 'var(--color-golden-accent)', fontSize: '1.8rem', fontWeight: 'normal' }}>{t('hero_title_2')}</span></h2>
          </div>
          <p className={styles.tagline}>{t('footer_tagline')}</p>
          <div className={styles.socials} style={{ paddingBottom: '5px' }}>
            <a href="https://www.facebook.com/share/1BqSmZKf3S/" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaFacebook size={20} /></a>
            <a href="https://www.instagram.com/jiwcministries?igsh=MXBqN2U3cHdrOWZjZg==" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaInstagram size={20} /></a>
            <a href="https://www.youtube.com/@jesusiswithusministries7844/featured" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaYoutube size={20} /></a>
            <a href="https://sharechat.com/profile/1894693559?d=n" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}><FaSharechat size={20} /></a>
          </div>
        </div>

        <div className={styles.linksCol}>
          <h3>{t('footer_links')}</h3>
          <ul>
            <li><Link to="/about">{t('footer_links_about')}</Link></li>
            <li><Link to="/ministries">{t('footer_links_ministries')}</Link></li>
            <li><Link to="/fellowship">{t('footer_links_fellowship')}</Link></li>
            <li><Link to="/rhema">{t('footer_links_rhema')}</Link></li>
            <li><Link to="/donate">{t('footer_links_donate')}</Link></li>
          </ul>
        </div>

        <div className={styles.contactCol}>
          <h3>{t('footer_contact')}</h3>
          <ul>
            <li><MapPin size={18} /> {t('footer_address')}</li>
            <li><Phone size={18} /> +91 1234567890 </li>
            <li><Mail size={18} /> jiwcministry033@gmail.com </li>
          </ul>
        </div>

        <div className={styles.newsletterCol}>
          <h3>{t('footer_subscribe')}</h3>
          <p>{t('footer_subscribe_desc')}</p>
          <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
            <input
              type="email"
              placeholder={t('footer_subscribe_placeholder')}
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              required
            />
            <button
              type="submit"
              className={styles.subscribeBtn}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? t('footer_subscribe_loading') : t('footer_subscribe_btn')}
            </button>
          </form>
          {status === 'success' && (
            <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> {message}
            </p>
          )}
          {status === 'error' && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{message}</p>
          )}
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {t('footer_copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
