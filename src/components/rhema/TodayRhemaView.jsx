import { useState, useEffect } from 'react';
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
  const [activeLangIndex, setActiveLangIndex] = useState(0);
  const featuredWord = rhemaDatabase[featuredIndex] || null;

  // Reset language index when featured word changes
  useEffect(() => {
    setActiveLangIndex(0);
  }, [featuredIndex]);

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

  const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');

  const posters = [];
  if (isValidUrl(featuredWord.tamil_poster_url)) posters.push(featuredWord.tamil_poster_url);
  if (isValidUrl(featuredWord.poster_url)) posters.push(featuredWord.poster_url);
  const currentPosterUrl = posters[activeLangIndex] || posters[0];

  // Filter out the currently featured word for the "Previous" grid
  const previousWords = rhemaDatabase.filter((_, idx) => idx !== featuredIndex);

  return (
    <>
      <PosterModal 
        open={lightboxOpen} 
        setOpen={setLightboxOpen} 
        posterUrl={currentPosterUrl} 
      />

      <div className={styles.galleryContainer}>
        {/* LEFT COLUMN: POSTER */}
        <div className={styles.posterColumn} onClick={openLightbox}>
          <TodayPoster 
            posters={posters} 
            activeIndex={activeLangIndex}
            onChangeIndex={(idx) => {
              setActiveLangIndex(idx);
            }}
          />
        </div>

        {/* RIGHT COLUMN: INFORMATION PANEL */}
        <div className={styles.infoColumn}>
          <PosterMetadata word={featuredWord} />
          
          <div className={styles.divider}></div>
          
          <PosterToolbar word={featuredWord} />
          
          <div className={styles.divider}></div>

          <div className={styles.segmentedNav}>
            <button 
              className={styles.segBtn} 
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
              className={styles.segBtn} 
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
