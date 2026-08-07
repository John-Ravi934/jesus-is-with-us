import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '/assets/logo.png';

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
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>About Us</NavLink>
          <NavLink to="/ministries" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Ministries</NavLink>
          <NavLink to="/fellowship" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Fellowship</NavLink>
          <NavLink to="/rhema" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Rhema Words</NavLink>
          <NavLink to="/gallery" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Gallery</NavLink>
          <NavLink to="/resources" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Resources</NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => isActive ? styles.activeLink : ""}>Contact</NavLink>
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
