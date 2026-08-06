import { Maximize2 } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function TodayPoster({ posters = [], activeIndex = 0, onChangeIndex }) {
  if (!posters || posters.length === 0) return null;

  const currentPosterUrl = posters[activeIndex] || posters[0];

  return (
    <>
      <div style={{position: 'relative', display: 'inline-block', width: '100%'}}>
        <img src={currentPosterUrl} alt="Today's Rhema Poster" className={styles.posterImg} />
        
        {posters.length > 1 && (
          <div style={{ 
            position: 'absolute', 
            bottom: '16px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '8px', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '8px 12px', 
            borderRadius: '20px',
            zIndex: 10
          }}>
            {posters.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChangeIndex) onChangeIndex(idx);
                }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: idx === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label={`View poster ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.zoomHint}>
        <Maximize2 size={20} />
        <span>Click to Zoom</span>
      </div>
    </>
  );
}
