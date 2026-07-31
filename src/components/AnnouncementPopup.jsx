import { useState, useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';
import { getEvents } from '../services/eventService';

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Fetch only active announcements
        const events = await getEvents({ status: 'published', is_announcement: true });
        
        if (events && events.length > 0) {
          // Sort by date descending and pick the most recent one
          const latest = events.sort((a, b) => new Date(b.event_date) - new Date(a.event_date))[0];
          
          // Check if user has already dismissed the popup in this session
          const showAlways = latest.event_time === 'always';
          const hasSeen = sessionStorage.getItem('announcement_dismissed');
          
          if (!hasSeen || showAlways) {
            setAnnouncement(latest);
            
            // Slight delay before showing for smooth UX
            setTimeout(() => {
              setIsVisible(true);
            }, 1500);
          }
        }
      } catch (err) {
        console.error("Failed to load announcements", err);
      }
    };

    fetchAnnouncement();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement_dismissed', 'true');
  };

  if (!announcement || !isVisible) return null;

  const hideDetails = announcement.description?.startsWith('<!--NO_DETAILS-->');
  const displayDescription = announcement.description?.replace('<!--NO_DETAILS-->', '');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
      animation: 'fadeIn 0.4s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .popup-container {
          background-color: ${hideDetails ? 'transparent' : '#fff'};
          border-radius: 16px;
          width: ${hideDetails ? '800px' : '650px'}; /* Large width even without description */
          max-width: 95vw;
          height: auto; /* Natural height */
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: ${hideDetails ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'};
          position: relative;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          display: ${hideDetails ? 'inline-block' : 'flex'};
          flex-direction: column; /* Vertical layout */
        }

        .popup-image {
          width: 100%;
          height: auto; /* Natural aspect ratio, no cropping */
          max-height: ${hideDetails ? '85vh' : '65vh'};
          max-width: 100%;
          object-fit: contain; /* Guarantee no crop */
          display: block;
          border-radius: ${hideDetails ? '16px' : '16px 16px 0 0'};
          background-color: #f1f5f9; /* Subtle background if there's any empty space */
        }

        .popup-details {
          width: 100%;
          height: auto; /* Allow natural height based on content */
          padding: 24px 24px;
          display: flex;
          flex-direction: row; /* Split into two divisions horizontally */
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .popup-image {
            max-height: 400px;
          }
          .popup-details {
            flex-direction: column;
            padding: 20px;
          }
        }
      `}</style>
      
      <div className="popup-container">
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px', right: '12px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            color: '#fff',
            width: '36px', height: '36px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        {announcement.image_url ? (
          <img 
            src={announcement.image_url} 
            alt={announcement.title} 
            className="popup-image"
          />
        ) : (
          <div className="popup-image" style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' }}></div>
        )}

        {!hideDetails && (
          <div className="popup-details">
            
            <div style={{ textAlign: 'left', flex: 1, overflowY: 'auto', maxHeight: '100%' }}>
              <span style={{ 
                display: 'inline-block', padding: '4px 12px', 
                backgroundColor: '#fef3c7', color: '#b45309', 
                borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, 
                letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px'
              }}>
                Upcoming Event
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{announcement.title}</h2>
              <p style={{ color: '#3b82f6', fontWeight: 500, fontSize: '0.85rem', margin: '0 0 8px 0' }}>
                Date: {announcement.event_date ? new Date(announcement.event_date).toLocaleDateString() : 'TBA'}
                {announcement.event_time && announcement.event_time !== 'always' && announcement.event_time !== 'once' ? ` at ${announcement.event_time}` : ''}
              </p>
              {displayDescription && (
                <p style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.4, margin: '0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {displayDescription}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0, minWidth: '140px' }}>
              {announcement.learn_more_url && (
                <a 
                  href={announcement.learn_more_url}
                  target="_blank" rel="noreferrer"
                  className="btn"
                  style={{ 
                    background: 'linear-gradient(135deg, #f43f5e, #fb923c)', color: 'white', 
                    padding: '8px 16px', borderRadius: '50px', textDecoration: 'none', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    width: '100%', fontSize: '0.85rem'
                  }}
                  onClick={handleClose}
                >
                  <PlayCircle size={18} /> Learn More
                </a>
              )}
              <button 
                className="btn btn-outline"
                style={{ 
                  padding: '8px 16px', borderRadius: '50px', 
                  border: '1px solid #cbd5e1', color: '#475569',
                  background: 'transparent', fontWeight: 600, cursor: 'pointer',
                  width: '100%', fontSize: '0.85rem'
                }}
                onClick={handleClose}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
