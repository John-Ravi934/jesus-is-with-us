import { Maximize2 } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function TodayPoster({ posterUrl }) {
  if (!posterUrl) return null;

  return (
    <>
      <img src={posterUrl} alt="Today's Rhema Poster" className={styles.posterImg} />
      <div className={styles.zoomHint}>
        <Maximize2 size={20} />
        <span>Click to Zoom</span>
      </div>
    </>
  );
}
