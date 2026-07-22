import styles from './RhemaComponents.module.css';

export default function PreviousRhemaCard({ word, onClick }) {
  if (!word) return null;

  return (
    <div className={styles.prevCard} onClick={onClick}>
      <img src={word.poster_url} alt={word.bible_reference} className={styles.prevThumb} loading="lazy" />
      <div className={styles.prevInfo}>
        <div className={styles.prevDateCat}>
          <span>{new Date(word.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
          <span className={styles.prevCatBadge}>{word.category}</span>
        </div>
        <h4 className={styles.prevTitle}>{word.bible_reference}</h4>
      </div>
    </div>
  );
}
