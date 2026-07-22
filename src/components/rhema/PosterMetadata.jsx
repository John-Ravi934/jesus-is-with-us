import { Calendar, Tag, Globe, Eye, Download } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function PosterMetadata({ word }) {
  if (!word) return null;

  return (
    <div className={styles.metadataRow}>
      <span className={styles.metaItem} title="Date Published">
        <Calendar size={16} /> {new Date(word.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
      <span className={styles.metaItem} title="Bible Reference">
        <strong>{word.bible_reference}</strong>
      </span>
      <span className={styles.metaItem} title="Category">
        <Tag size={16} /> {word.category}
      </span>
      <span className={styles.metaItem} title="Language">
        <Globe size={16} /> {word.language}
      </span>
      <span className={styles.metaItem} title="Total Views">
        <Eye size={16} /> {word.views?.toLocaleString() || 0}
      </span>
      <span className={styles.metaItem} title="Total Downloads">
        <Download size={16} /> {word.downloads?.toLocaleString() || 0}
      </span>
    </div>
  );
}
