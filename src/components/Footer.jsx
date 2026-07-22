import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brandCol}>
          <h2 className={styles.logo}>Jesus Is With Us</h2>
          <p className={styles.tagline}>Transforming Lives Through Worship, Prayer & Gospel Outreach</p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon}><FaFacebook size={20} /></a>
            <a href="#" className={styles.socialIcon}><FaInstagram size={20} /></a>
            <a href="#" className={styles.socialIcon}><FaYoutube size={20} /></a>
            <a href="#" className={styles.socialIcon}><FaTwitter size={20} /></a>
          </div>
        </div>

        <div className={styles.linksCol}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/about">About Ministry</Link></li>
            <li><Link to="/ministries">Our Ministries</Link></li>
            <li><Link to="/fellowship">Join Fellowship</Link></li>
            <li><Link to="/rhema">Rhema Words</Link></li>
            <li><Link to="/donate">Donate</Link></li>
          </ul>
        </div>

        <div className={styles.contactCol}>
          <h3>Contact Us</h3>
          <ul>
            <li><MapPin size={18} /> 123 Faith Avenue, Heaven City, HC 12345</li>
            <li><Phone size={18} /> +1 (234) 567-8900</li>
            <li><Mail size={18} /> contact@jesusiswithus.org</li>
          </ul>
        </div>

        <div className={styles.newsletterCol}>
          <h3>Stay Connected</h3>
          <p>Subscribe to our newsletter for updates and daily devotions.</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your Email Address" required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Jesus Is With Us Ministries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
