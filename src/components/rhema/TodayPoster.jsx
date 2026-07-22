import { Maximize2 } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function TodayPoster({ posterUrl, onClick }) {
  if (!posterUrl) return null;

  return (
    <div className={styles.showcaseImageWrapper} onClick={onClick}>
      <img src={posterUrl} alt="Today's Rhema Poster" className={styles.showcaseImg} />
      <div className={styles.zoomHint}>
        <Maximize2 size={20} />
        <span>Click to Zoom</span>
      </div>
    </div>
  );
}
