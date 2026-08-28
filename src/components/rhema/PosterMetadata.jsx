import { Tag, Globe, Eye, Download, Book, Cross, Heart, Star, Sparkles, Flame, Shield, Sun } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function PosterMetadata({ word }) {
  if (!word) return null;

  const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');

  const getCategoryIcon = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('faith')) return <Sparkles size={14} className={styles.badgeIcon} />;
    if (c.includes('healing')) return <Cross size={14} className={styles.badgeIcon} />;
    if (c.includes('grace')) return <Sun size={14} className={styles.badgeIcon} />;
    if (c.includes('peace')) return <Star size={14} className={styles.badgeIcon} />;
    if (c.includes('love')) return <Heart size={14} className={styles.badgeIcon} />;
    if (c.includes('holy spirit')) return <Flame size={14} className={styles.badgeIcon} />;
    if (c.includes('protection')) return <Shield size={14} className={styles.badgeIcon} />;
    if (c.includes('praise')) return <Star size={14} className={styles.badgeIcon} />;
    return <Tag size={14} className={styles.badgeIcon} />;
  };

  return (
    <div className={styles.infoHeader}>
      <div className={styles.infoEyebrow}>
        <span>Today's Rhema</span>
        <span className={styles.infoDate}>
          {new Date(word.date).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      
      <h2 className={styles.infoTitle} style={{ fontSize: '25px', marginTop: '1.5rem' }}>
        {word.bible_reference ? (() => {
          const ref = word.bible_reference.replace(/[\[\]]/g, '').trim();
          if (ref.includes('|')) {
            const parts = ref.split('|');
            return (
              <>
                <span style={{ fontWeight: 400 }}>{parts[0].trim()}</span>
                <strong style={{ fontWeight: 'bold', margin: '0 8px', color: '#15a349' }}>|</strong>
                <span style={{ fontWeight: 400 }}>{parts[1].trim()}</span>
              </>
            );
          }
          return <span style={{ fontWeight: 400 }}>{ref}</span>;
        })() : `${word.tamil_title || 'தமிழ்'} | ${word.title}`}
      </h2>
      
      {word.bible_verse && (
        <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6, fontSize: '1.05rem', borderLeft: '3px solid #C8A646', paddingLeft: '1rem' }}>
          "{word.bible_verse}"
        </p>
      )}

      <div className={styles.badgesRow}>
        <span className={styles.badgeItem} title="Category">
          {getCategoryIcon(word.category)} {word.category}
        </span>
        {isValidUrl(word.tamil_poster_url) && (
          <span className={styles.badgeItem} title="Language">
            <Globe size={14} className={styles.badgeIcon} /> Tamil
          </span>
        )}
        {isValidUrl(word.poster_url) && (
          <span className={styles.badgeItem} title="Language">
            <Globe size={14} className={styles.badgeIcon} /> English
          </span>
        )}
        {!isValidUrl(word.tamil_poster_url) && !isValidUrl(word.poster_url) && (
          <span className={styles.badgeItem} title="Language">
            <Globe size={14} className={styles.badgeIcon} /> {word.language}
          </span>
        )}
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
