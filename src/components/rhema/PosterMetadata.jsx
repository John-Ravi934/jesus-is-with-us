import { Globe, Eye, Download, Book, Cross, Heart, Star, Sparkles, Flame, Shield, Sun } from 'lucide-react';
import { LuTag } from 'react-icons/lu';
import CategoryIcon from '../categories/CategoryIcon';
import styles from './RhemaComponents.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PosterMetadata({ word, categories = [] }) {
  const { t, language } = useLanguage();
  if (!word) return null;

  const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');

  const categoryData = categories.find(c => c.name === word.category || c.name_en === word.category);

  const translatedCategory = () => {
    if (language === 'ta' && categoryData && categoryData.name_ta) return categoryData.name_ta;
    return categoryData ? (categoryData.name_en || categoryData.name) : word.category;
  };

  return (
    <div className={styles.infoHeader}>
      <div className={styles.infoEyebrow}>
        <span>{t('rhema_today_label')}</span>
        <span className={styles.infoDate}>
          {new Date(word.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      
      <h2 className={styles.infoTitle} style={{ fontSize: '25px', marginTop: '1.5rem', fontWeight: 'normal' }}>
        {word[`bible_reference_${language}`] || word.bible_reference_en || word.bible_reference || 'Reference'}
      </h2>
      
      {(word.bible_verse_ta || word.bible_verse || word.bible_verse_en) && (
        <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6, fontSize: '1.05rem', borderLeft: '3px solid #C8A646', paddingLeft: '1rem' }}>
          "{word[`bible_verse_${language}`] || word.bible_verse_ta || word.bible_verse_en || word.bible_verse}"
        </p>
      )}

      <div className={styles.badgesRow}>
        <span className={styles.badgeItem} title="Category" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {categoryData && categoryData.icon ? (
            <CategoryIcon icon={categoryData.icon} color={categoryData.color} size={14} iconSize={12} transparentBg={true} />
          ) : (
            <LuTag size={14} className={styles.badgeIcon} />
          )}
          {translatedCategory()}
        </span>
        {isValidUrl(word.tamil_poster_url) && (
          <span className={styles.badgeItem} title="Language">
            <Globe size={14} className={styles.badgeIcon} /> {t('rhema_lang_ta')}
          </span>
        )}
        {isValidUrl(word.poster_url) && (
          <span className={styles.badgeItem} title="Language">
            <Globe size={14} className={styles.badgeIcon} /> {t('rhema_lang_en')}
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
