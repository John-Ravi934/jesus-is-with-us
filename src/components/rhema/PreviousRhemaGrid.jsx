import styles from './RhemaComponents.module.css';
import PreviousRhemaCard from './PreviousRhemaCard';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PreviousRhemaGrid({ words, categories = [], onSelect }) {
  const { t } = useLanguage();
  if (!words || words.length === 0) return null;

  return (
    <div className={styles.prevRhemaSection}>
      <h3 className={styles.prevRhemaTitle}>{t('rhema_prev_words') || 'Previous Rhema Words'}</h3>
      <div className={styles.prevRhemaGrid}>
        {words.map((word) => (
          <PreviousRhemaCard 
            key={word.id} 
            word={word} 
            categories={categories}
            onClick={() => onSelect(word.id)} 
          />
        ))}
      </div>
    </div>
  );
}
