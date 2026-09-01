import styles from './RhemaComponents.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import CategoryIcon from '../categories/CategoryIcon';

export default function PreviousRhemaCard({ word, categories = [], onClick }) {
  const { language } = useLanguage();

  const categoryData = categories.find(c => c.name === word.category || c.name_en === word.category);

  const translatedCategory = () => {
    if (language === 'ta' && categoryData && categoryData.name_ta) return categoryData.name_ta;
    return categoryData ? (categoryData.name_en || categoryData.name) : word.category;
  };

  if (!word) return null;

  const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');
  const thumbUrl = isValidUrl(word.tamil_poster_url) ? word.tamil_poster_url : (isValidUrl(word.poster_url) ? word.poster_url : '');

  return (
    <div className={styles.prevCard} onClick={onClick}>
      <img src={thumbUrl} alt={word[`bible_reference_${language}`] || word.bible_reference_en || word.bible_reference} className={styles.prevThumb} loading="lazy" />
      <div className={styles.prevInfo}>
        <div className={styles.prevDateCat}>
          <span>{new Date(word.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
          <span className={styles.prevCatBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {categoryData && categoryData.icon && (
              <CategoryIcon icon={categoryData.icon} color="#C8A646" size={12} iconSize={10} transparentBg={true} />
            )}
            {translatedCategory()}
          </span>
        </div>
        <h4 className={styles.prevTitle} style={{ fontWeight: 'normal' }}>
          {word[`bible_reference_${language}`] || word.bible_reference_en || word.bible_reference || 'Reference'}
        </h4>
      </div>
    </div>
  );
}
