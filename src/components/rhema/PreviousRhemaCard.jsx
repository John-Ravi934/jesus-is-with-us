import styles from './RhemaComponents.module.css';

export default function PreviousRhemaCard({ word, onClick }) {
  if (!word) return null;

  const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');
  const thumbUrl = isValidUrl(word.tamil_poster_url) ? word.tamil_poster_url : (isValidUrl(word.poster_url) ? word.poster_url : '');

  return (
    <div className={styles.prevCard} onClick={onClick}>
      <img src={thumbUrl} alt={word.bible_reference} className={styles.prevThumb} loading="lazy" />
      <div className={styles.prevInfo}>
        <div className={styles.prevDateCat}>
          <span>{new Date(word.date).toLocaleDateString('en-GB', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
          <span className={styles.prevCatBadge}>{word.category}</span>
        </div>
        <h4 className={styles.prevTitle}>{word.bible_reference}</h4>
      </div>
    </div>
  );
}
