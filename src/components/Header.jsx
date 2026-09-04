import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Header.module.css';

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t, isLiveHeroActive } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${(isScrolled || !isHomePage) ? styles.scrolled : ''} ${isLiveHeroActive ? styles.liveHeader : ''}`}>
      <div className={`container ${styles.headerContainer}`}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/logo.webp" alt="Jesus is with us Logo" className={styles.logoImg} />
        </Link>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''} ${language === 'en' ? styles.navEn : ''}`}>
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_home')}</NavLink>
          <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_about')}</NavLink>
          <NavLink to="/ministries" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_ministries')}</NavLink>
          <NavLink to="/fellowship" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_fellowship')}</NavLink>
          <NavLink to="/rhema" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_rhema')}</NavLink>
          <NavLink to="/gallery" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_gallery')}</NavLink>
          <NavLink to="/resources" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_resources')}</NavLink>
          <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => isActive ? styles.activeLink : ""}>{t('nav_contact')}</NavLink>
          <Link to="/donate" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>{t('nav_donate')}</Link>
        </nav>

        <div className={styles.actions}>
          <div className={styles.langSelector}>
            <select className={styles.langSelect} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">EN</option>
              <option value="ta">TA</option>
            </select>
          </div>
          <button className={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
}
