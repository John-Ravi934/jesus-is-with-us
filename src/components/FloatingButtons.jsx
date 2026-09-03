import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Music, Link as LinkIcon, Phone, Mail, MapPin, Globe, Plus, X } from 'lucide-react';
import styles from './FloatingButtons.module.css';
import { Link } from 'react-router-dom';
import { getQuickAccessSettings } from '../services/settingsService';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    fetchButtons();

    const channel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: "setting_key=eq.quick_access_buttons" }, () => {
        fetchButtons();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchButtons = async () => {
    try {
      const data = await getQuickAccessSettings();
      if (data) {
        setButtons(data);
      }
    } catch (e) {
      console.error('Failed to fetch floating buttons', e);
    }
  };

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
