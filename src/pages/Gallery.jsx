import { useState, useEffect } from 'react';
import { getGalleryImages } from '../services/galleryService';
import { Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImages();
      setImages(data || []);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ paddingTop: '120px', minHeight: '80vh', backgroundColor: '#F8F8FA' }}>
        <div className="container" style={{ paddingBottom: '4rem' }}>
          
          <div style={{ textAlign: "center", marginBottom: "3rem", paddingTop: "2rem" }} data-aos="fade-up">
            <h1 data-aos="fade-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#090b24', margin: 0 }}>
              Photo <span className="script-accent" style={{ display: 'inline' }}>Gallery</span>
            </h1>
            <p data-aos="fade-up" style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '1rem' }}>
              Get a glimpse of the vibrant life, worship, and fellowship at our church.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>Loading gallery...</div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p data-aos="fade-up">No photos have been added to the gallery yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
            }}>
              {images.map((img) => (
                <div 
                  key={img.id} 
                  style={{ 
                    cursor: 'pointer',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    aspectRatio: '1',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedImage(img)}
                  className="gallery-item"
                >
                  <img data-aos="fade-up" 
                    src={img.image_url} 
                    alt={img.title || "Gallery image"} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {img.title && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '20px 15px 15px',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img data-aos="fade-up" 
            src={selectedImage.image_url} 
            alt="Fullscreen View" 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          {selectedImage.title && (
            <div style={{ position: 'absolute', bottom: '30px', color: 'white', fontSize: '1.2rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '8px 24px', borderRadius: '50px' }}>
              {selectedImage.title}
            </div>
          )}
        </div>
      )}
    </>
  );
}
