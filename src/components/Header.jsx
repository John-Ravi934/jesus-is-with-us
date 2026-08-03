import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '../assets/logo.png';

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${(isScrolled || !isHomePage) ? styles.scrolled : ''}`}>
      <div className={`container ${styles.headerContainer}`}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="Jesus is with us Logo" className={styles.logoImg} />
        </Link>
        
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/ministries" onClick={() => setMobileMenuOpen(false)}>Ministries</Link>
          <Link to="/fellowship" onClick={() => setMobileMenuOpen(false)}>Fellowship</Link>
          <Link to="/rhema" onClick={() => setMobileMenuOpen(false)}>Rhema Words</Link>
          <Link to="/gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
          <Link to="/resources" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link to="/donate" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Donate</Link>
        </nav>

        <div className={styles.actions}>
          <button className={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
}
