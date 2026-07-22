import { Tag, Globe, Eye, Download } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function PosterMetadata({ word }) {
  if (!word) return null;

  return (
    <div className={styles.infoHeader}>
      <div className={styles.infoEyebrow}>
        <span>Today's Rhema</span>
        <span className={styles.infoDate}>
          {new Date(word.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      
      <h2 className={styles.infoTitle}>{word.bible_reference}</h2>
      
      <div className={styles.badgesRow}>
        <span className={styles.badgeItem} title="Category">
          <Tag size={14} className={styles.badgeIcon} /> {word.category}
        </span>
        <span className={styles.badgeItem} title="Language">
          <Globe size={14} className={styles.badgeIcon} /> {word.language}
        </span>
        <span className={styles.badgeItem} title="Total Views">
          <Eye size={14} className={styles.badgeIcon} /> {word.views?.toLocaleString() || 0}
        </span>
        <span className={styles.badgeItem} title="Total Downloads">
          <Download size={14} className={styles.badgeIcon} /> {word.downloads?.toLocaleString() || 0}
        </span>
      </div>
    </div>
  );
}
