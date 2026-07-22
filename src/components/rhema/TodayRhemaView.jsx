import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RhemaComponents.module.css';
import { incrementViews } from '../../services/rhemaService';
import TodayPoster from './TodayPoster';
import PosterModal from './PosterModal';
import PosterMetadata from './PosterMetadata';
import PosterToolbar from './PosterToolbar';
import PreviousRhemaGrid from './PreviousRhemaGrid';

export default function TodayRhemaView({ 
  rhemaDatabase, 
  featuredIndex, 
  setFeaturedIndex 
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const featuredWord = rhemaDatabase[featuredIndex] || null;

  const handlePrev = () => {
    if (featuredIndex < rhemaDatabase.length - 1) {
      setFeaturedIndex(featuredIndex + 1); 
    }
  };

  const handleNext = () => {
    if (featuredIndex > 0) {
      setFeaturedIndex(featuredIndex - 1);
    }
  };

  const openLightbox = async () => {
    setLightboxOpen(true);
    if (featuredWord) {
      await incrementViews(featuredWord.id).catch(console.error);
    }
  };

  const handleSelectPrevious = (id) => {
    const idx = rhemaDatabase.findIndex(w => w.id === id);
    if (idx !== -1) {
      setFeaturedIndex(idx);
    }
  };

  if (!featuredWord) return null;

  // Filter out the currently featured word for the "Previous" grid
  const previousWords = rhemaDatabase.filter((_, idx) => idx !== featuredIndex);

  return (
    <>
      <PosterModal 
        open={lightboxOpen} 
        setOpen={setLightboxOpen} 
        posterUrl={featuredWord.poster_url} 
      />

      <div className={styles.showcaseCard}>
        <TodayPoster 
          posterUrl={featuredWord.poster_url} 
          onClick={openLightbox} 
        />

        <div className={styles.showcaseBody}>
          <PosterMetadata word={featuredWord} />
          <PosterToolbar word={featuredWord} />

          <div className={styles.segmentedNav}>
            <button 
              className={`${styles.segBtn} ${featuredIndex < rhemaDatabase.length - 1 ? '' : styles.disabled}`} 
              onClick={handlePrev} 
              disabled={featuredIndex === rhemaDatabase.length - 1}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button 
              className={`${styles.segBtn} ${styles.segBtnPrimary}`} 
              onClick={() => {
                const idx = rhemaDatabase.findIndex(d => d.featured);
                setFeaturedIndex(idx !== -1 ? idx : 0);
              }}
            >
              Today's Rhema
            </button>
            <button 
              className={`${styles.segBtn} ${featuredIndex > 0 ? '' : styles.disabled}`} 
              onClick={handleNext} 
              disabled={featuredIndex === 0}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <PreviousRhemaGrid 
        words={previousWords} 
        onSelect={handleSelectPrevious} 
      />
    </>
  );
}
