import { MessageCircle, Heart, Music } from 'lucide-react';
import styles from './FloatingButtons.module.css';
import { Link } from 'react-router-dom';

export default function FloatingButtons() {
  return (
    <div className={styles.floatingContainer}>
      <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className={`${styles.floatBtn} ${styles.whatsapp}`} aria-label="WhatsApp AI chat">
        <MessageCircle size={24} />
      </a>
      <Link to="/rhema?tab=favorites" className={`${styles.floatBtn} ${styles.prayer}`} aria-label="Favorite Rhema Words">
        <Heart size={24} />
      </Link>
      <button className={`${styles.floatBtn} ${styles.worship}`} aria-label="Live Worship">
        <Music size={24} />
      </button>
    </div>
  );
}
