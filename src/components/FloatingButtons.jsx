import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Heart, Music, Link as LinkIcon, Phone, Mail, MapPin, Globe, Plus, X } from 'lucide-react';
import styles from './FloatingButtons.module.css';
import { Link } from 'react-router-dom';
import { getQuickAccessSettings } from '../services/settingsService';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

const iconMap = {
  MessageCircle,
  Heart,
  Music,
  LinkIcon,
  Phone,
  Mail,
  MapPin,
  Globe
};

export default function FloatingButtons() {
  const [buttons, setButtons] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchButtons = useCallback(async () => {
    try {
      const data = await getQuickAccessSettings();
      if (data && Array.isArray(data)) {
        setButtons(data);
      }
    } catch (err) {
      console.error("Failed to load quick access buttons:", err);
    }
  }, []);

  useEffect(() => {
    fetchButtons();
  }, [fetchButtons]);

  useRealtimeSync('site_settings', fetchButtons, "setting_key=eq.quick_access_buttons");

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={styles.floatingContainer}>
      <div className={`${styles.buttonsWrapper} ${isOpen ? styles.open : ''}`}>
        {buttons.map((btn, index) => {
          const IconComponent = iconMap[btn.icon] || LinkIcon;
          const isGradient = btn.color?.includes('gradient');
          const styleObj = isGradient ? { background: btn.color } : { backgroundColor: btn.color };
          const delay = (buttons.length - index) * 0.05; // Stagger animation

          const btnContent = (
            <div className={styles.floatBtnInner} style={styleObj}>
              <IconComponent size={24} />
            </div>
          );

          return btn.isExternal || btn.link.startsWith('http') || btn.link.startsWith('mailto') || btn.link.startsWith('tel') ? (
            <a 
              key={btn.id}
              href={btn.link} 
              target={btn.link.startsWith('http') ? "_blank" : "_self"} 
              rel="noreferrer" 
              className={styles.floatBtnItem}
              style={{ transitionDelay: `${isOpen ? delay : 0}s` }}
              title={btn.tooltip}
              aria-label={btn.tooltip}
            >
              {btnContent}
            </a>
          ) : (
            <Link 
              key={btn.id}
              to={btn.link} 
              className={styles.floatBtnItem}
              style={{ transitionDelay: `${isOpen ? delay : 0}s` }}
              title={btn.tooltip}
              aria-label={btn.tooltip}
            >
              {btnContent}
            </Link>
          );
        })}
      </div>

      <button 
        className={`${styles.mainToggleBtn} ${isOpen ? styles.open : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle Quick Access Menu"
      >
        <Plus size={28} className={styles.toggleIcon} />
      </button>
    </div>
  );
}
