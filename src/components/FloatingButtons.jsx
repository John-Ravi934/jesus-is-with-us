import { MessageCircle, Heart, Music } from 'lucide-react';
import styles from './FloatingButtons.module.css';

export default function FloatingButtons() {
  return (
    <div className={styles.floatingContainer}>
      <button className={`${styles.floatBtn} ${styles.whatsapp}`} aria-label="WhatsApp">
        <MessageCircle size={24} />
      </button>
      <button className={`${styles.floatBtn} ${styles.prayer}`} aria-label="Prayer Request">
        <Heart size={24} />
      </button>
      <button className={`${styles.floatBtn} ${styles.worship}`} aria-label="Live Worship">
        <Music size={24} />
      </button>
    </div>
  );
}
