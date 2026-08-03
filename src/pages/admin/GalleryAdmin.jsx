import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../../services/galleryService';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import styles from './AdminStyles.module.css';

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getGalleryImages();
      setImages(data || []);
    } catch (err) {
      console.error("Failed to load gallery images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImage(imageFile);
      await addGalleryImage(imageUrl, title);
      
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      setTitle('');
      fetchImages();
    } catch (err) {
      console.error("Error saving image:", err);
      alert("Failed to save image. Make sure you have run the SQL script to create the gallery_images table and storage bucket.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this image from the gallery?')) {
      try {
        await deleteGalleryImage(id);
        fetchImages();
      } catch (err) {
        console.error("Error deleting image", err);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Photo Gallery</h2>
          <p>Manage images for your public photo gallery.</p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setImageFile(null);
            setImagePreview('');
            setTitle('');
          }} 
          className={`${styles.primaryBtn} ${styles.headerBtn}`}
        >
          <Plus size={20} /> Add Photo
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading gallery...</div>
      ) : images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <ImageIcon size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#334155', marginBottom: '0.5rem' }}>No photos yet</h3>
          <p style={{ color: '#64748b' }}>Upload your first photo to show it on the Gallery page.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {images.map(img => (
            <div key={img.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', position: 'relative' }}>
              <div style={{ height: '200px', width: '100%' }}>
                <img src={img.image_url} alt={img.title || "Gallery"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                  {img.title || 'Untitled'}
                </span>
                <button 
                  onClick={() => handleDelete(img.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  title="Delete Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '500px', borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Photo to Gallery</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div>
                  <label className="form-label">Photo Title / Caption (Optional)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Sunday Worship Service" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>

                <div>
                  <label className="form-label">Upload Image File *</label>
                  {imagePreview && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'block', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={uploading || !imageFile}>
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
