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
        <h4 className={styles.prevTitle}>
          {word.bible_reference ? (() => {
            if (word.bible_reference.includes('|')) {
              const parts = word.bible_reference.split('|');
              return (
                <>
                  <span style={{ fontWeight: 400 }}>{parts[0].trim()}</span>
                  <strong style={{ fontWeight: 'bold', margin: '0 4px', color: '#15a349' }}>|</strong>
                  <span style={{ fontWeight: 400 }}>{parts[1].trim()}</span>
                </>
              );
            }
            return <span style={{ fontWeight: 400 }}>{word.bible_reference}</span>;
          })() : word.title}
        </h4>
      </div>
    </div>
  );
}
