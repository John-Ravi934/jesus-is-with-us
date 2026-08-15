import { useRef, useEffect } from 'react';
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RhemaComponents.module.css';

export default function TodayPoster({ posters = [], activeIndex = 0, onChangeIndex }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const targetScrollLeft = activeIndex * container.clientWidth;
      if (Math.abs(container.scrollLeft - targetScrollLeft) > 10) {
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const handleScroll = (e) => {
    if (!onChangeIndex) return;
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < posters.length) {
      onChangeIndex(newIndex);
    }
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    if (activeIndex < posters.length - 1 && onChangeIndex) {
      onChangeIndex(activeIndex + 1);
    }
  };
  
  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeIndex > 0 && onChangeIndex) {
      onChangeIndex(activeIndex - 1);
    }
  };

  if (!posters || posters.length === 0) return null;

  return (
    <>
      <div style={{position: 'relative', display: 'flex', width: '100%', overflow: 'hidden'}}>
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        
        {posters.length > 1 && activeIndex > 0 && (
          <button 
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
            touchAction: 'pan-x'
          }}
        >
          {posters.map((posterUrl, idx) => (
            <img 
              key={idx}
              src={posterUrl} 
              alt={`Today's Rhema Poster ${idx + 1}`} 
              className={styles.posterImg}
              draggable={false}
              style={{
                width: '100%',
                flexShrink: 0,
                scrollSnapAlign: 'center',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            />
          ))}
        </div>
        
        {posters.length > 1 && activeIndex < posters.length - 1 && (
          <button 
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div className={styles.zoomHint}>
        <Maximize2 size={20} />
        <span>Click to Zoom</span>
      </div>
    </>
  );
}
