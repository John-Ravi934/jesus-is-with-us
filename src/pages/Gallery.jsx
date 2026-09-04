import { useState, useEffect } from 'react';
import { getGalleryImages } from '../services/galleryService';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ImageWithBlurhash from '../components/ImageWithBlurhash';

export default function Gallery() {
  const { t, language } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImages();
      const visibleImages = (data || []).filter(img => img.status !== 'draft');
      setImages(visibleImages);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group images by title (which acts as the event/category)
  const groupedImages = images.reduce((acc, img) => {
    const category = img[`title_${language}`] || img.title_en || img.title || 'General';
    if (!acc[category]) acc[category] = [];
    if (acc[category].length < 5) {
      acc[category].push(img);
    }
    return acc;
  }, {});

  return (
    <>
      {/* 500px Hero Banner */}
      <section style={{
        height: '600px',
        background: 'linear-gradient(rgba(9, 11, 36, 0.5), rgba(9, 11, 36, 0.7)), url(/assets/photo-gallery.webp) center / 100% 100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        paddingTop: '80px' // for navbar
      }}>
        <div className="container" data-aos="fade-up">
          <h1 data-aos="fade-up" className="animate-fade-up delay-100" style={{ fontWeight: 800, margin: '0 0 1rem' }}>
            {t('gal_hero_title')}<span className="script-accent">{t('gal_hero_title_2')}</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            {t('gal_hero_desc')}
          </p>
        </div>
      </section>

      <div style={{ minHeight: '80vh', backgroundColor: '#F8F8FA', padding: '4rem 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>{t('gal_loading')}</div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p data-aos="fade-up">{t('gal_empty')}</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
            }}>
              {Object.entries(groupedImages).map(([category, catImages]) => (
                <div
                  key={category}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    aspectRatio: '4/3',
                    position: 'relative',
                    background: '#000'
                  }}
                  onClick={() => {
                    setSelectedAlbum({ name: category, photos: catImages });
                    setActivePhotoIndex(0);
                  }}
                  className="gallery-item"
                  data-aos="fade-up"
                >
                  {catImages.length > 0 && (
                    <ImageWithBlurhash
                      src={(catImages.find(p => p.status === 'published-cover') || catImages[0]).image_url}
                      hash={(catImages.find(p => p.status === 'published-cover') || catImages[0]).blurhash}
                      alt={category}
                      style={{
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.5s ease, opacity 0.5s ease',
                        opacity: 0.8
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.opacity = '0.8';
                      }}
                    />
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    padding: '40px 20px 20px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{category}</span>
                    <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{catImages.length}{t('gal_photos_count')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Album Lightbox */}
      {selectedAlbum && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedAlbum(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
          >
            <X size={32} />
          </button>

          <div style={{ color: 'white', position: 'absolute', top: '30px', fontSize: '1.2rem', fontWeight: 700 }}>
            {selectedAlbum.name} <span style={{ opacity: 0.5 }}>({activePhotoIndex + 1} / {selectedAlbum.photos.length})</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageWithBlurhash
              src={selectedAlbum.photos[activePhotoIndex].image_url}
              hash={selectedAlbum.photos[activePhotoIndex].blurhash}
              alt="Fullscreen View"
              style={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              imgStyle={{
                objectFit: 'contain'
              }}
            />

            {/* Nav Buttons */}
            {selectedAlbum.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => prev === 0 ? selectedAlbum.photos.length - 1 : prev - 1);
                  }}
                  style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => prev === selectedAlbum.photos.length - 1 ? 0 : prev + 1);
                  }}
                  style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
