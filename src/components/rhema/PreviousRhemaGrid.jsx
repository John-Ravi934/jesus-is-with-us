import styles from './RhemaComponents.module.css';
import PreviousRhemaCard from './PreviousRhemaCard';

export default function PreviousRhemaGrid({ words, onSelect }) {
  if (!words || words.length === 0) return null;

  return (
    <div className={styles.prevRhemaSection}>
      <h3 className={styles.prevRhemaTitle}>Previous Rhema Words</h3>
      <div className={styles.prevRhemaGrid}>
        {words.map((word) => (
          <PreviousRhemaCard 
            key={word.id} 
            word={word} 
            onClick={() => onSelect(word.id)} 
          />
        ))}
      </div>
    </div>
  );
}
