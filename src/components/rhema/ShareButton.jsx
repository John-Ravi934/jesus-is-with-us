import { useState } from 'react';
import { Share2, X, Link2, Mail } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './RhemaComponents.module.css';

export default function ShareButton({ word }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleShareClick = async () => {
    if (!word) return;
    
    // Fallback share data (text only)
    const shareData = {
      title: `Daily Rhema: ${word.title || word.bible_reference}`,
      text: `"${word.bible_verse}" - ${word.bible_reference}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        
        let filesArray = [];
        try {
          // Attempt to fetch the image and convert it to a JPEG File object
          const response = await fetch(word.poster_url);
          const blob = await response.blob();
          
          // Convert WebP/PNG to JPEG using Canvas to ensure WhatsApp treats it as an image
          const imageBitmap = await createImageBitmap(blob);
          const canvas = document.createElement('canvas');
          canvas.width = imageBitmap.width;
          canvas.height = imageBitmap.height;
          const ctx = canvas.getContext('2d');
          
          // Fill white background in case of transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imageBitmap, 0, 0);
          
          const jpgBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
          const file = new File([jpgBlob], `Rhema-${word.bible_reference.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, { type: 'image/jpeg' });
          
          // Check if the browser can share this file
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            filesArray = [file];
          }
        } catch (fetchErr) {
          console.warn("Failed to fetch image for sharing, falling back to text only.", fetchErr);
        }

        // Attach files if we successfully created them and the browser allows it
        if (filesArray.length > 0) {
          shareData.files = filesArray;
        }

        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback to custom modal
        setModalOpen(true);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setModalOpen(true);
      }
    }
  };

  const shareText = `Daily Rhema: ${word?.title || word?.bible_reference} - ${window.location.href}`;
  const encodedText = encodeURIComponent(shareText);
  const currentUrl = encodeURIComponent(window.location.href);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
    setModalOpen(false);
  };

  return (
    <>
      <button className={styles.toolbarBtn} onClick={handleShareClick}>
        <Share2 size={20} /> Share
      </button>

      {modalOpen && (
        <div className={styles.shareDialogOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.shareDialog} onClick={e => e.stopPropagation()}>
            <div className={styles.shareHeader}>
              <h3>Share this Rhema</h3>
              <button className={styles.shareCloseBtn} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.shareGrid}>
              <a 
                className={styles.shareOption} 
                style={{textDecoration: 'none'}}
                href={`https://api.whatsapp.com/send?text=${encodedText}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
              >
                <div className={styles.shareIconWrapper} style={{background: '#25D366'}}>
                  <FaWhatsapp />
                </div>
                <span>WhatsApp</span>
              </a>
              
              <a 
                className={styles.shareOption} 
                style={{textDecoration: 'none'}}
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
              >
                <div className={styles.shareIconWrapper} style={{background: '#1877F2'}}>
                  <FaFacebookF />
                </div>
                <span>Facebook</span>
              </a>

              <a 
                className={styles.shareOption} 
                style={{textDecoration: 'none'}}
                href={`https://twitter.com/intent/tweet?text=${encodedText}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
              >
                <div className={styles.shareIconWrapper} style={{background: '#000000'}}>
                  <FaTwitter />
                </div>
                <span>X (Twitter)</span>
              </a>

              <a 
                className={styles.shareOption} 
                style={{textDecoration: 'none'}}
                href={`https://t.me/share/url?url=${currentUrl}&text=${encodeURIComponent(word?.title || word?.bible_reference)}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
              >
                <div className={styles.shareIconWrapper} style={{background: '#0088cc'}}>
                  <FaTelegramPlane />
                </div>
                <span>Telegram</span>
              </a>

              <a 
                className={styles.shareOption} 
                style={{textDecoration: 'none'}}
                href={`mailto:?subject=Daily Rhema: ${encodeURIComponent(word?.title || word?.bible_reference)}&body=${encodedText}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setModalOpen(false)}
              >
                <div className={styles.shareIconWrapper} style={{background: '#EA4335'}}>
                  <Mail size={24}/>
                </div>
                <span>Email</span>
              </a>

              <button className={styles.shareOption} onClick={copyLink}>
                <div className={styles.shareIconWrapper} style={{background: '#64748B'}}>
                  <Link2 size={24}/>
                </div>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
