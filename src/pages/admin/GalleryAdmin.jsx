import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '../../services/galleryService';
import { Plus, Trash2, X, Image as ImageIcon, MoreHorizontal, Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Calendar, UploadCloud, ImagePlus, Upload, Edit2, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  
  // Filter/Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('published');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
    if (!imageFile && !editingId) {
      alert("Please select an image");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (editingId) {
        const updates = { title, status };
        if (imageUrl) updates.image_url = imageUrl;
        const { updateGalleryImage } = await import('../../services/galleryService');
        await updateGalleryImage(editingId, updates);
      } else {
        await addGalleryImage(imageUrl, title, status);
      }
      
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      setTitle('');
      setStatus('published');
      setEditingId(null);
      setDbError(false);
      fetchImages();
    } catch (err) {
      console.error("Error saving image:", err);
      if (err.message?.includes('status')) {
        setDbError(true);
      } else {
        alert("Failed to save image. Make sure you have run the SQL script to create the gallery_images table and storage bucket.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (img) => {
    setEditingId(img.id);
    setTitle(img.title || '');
    setStatus(img.status || 'published');
    setImagePreview(img.image_url);
    setImageFile(null);
    setDbError(false);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGalleryImage(deleteId);
      fetchImages();
    } catch (err) {
      console.error("Error deleting image", err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleQuickStatusChange = async (img, newStatus) => {
    try {
      const { updateGalleryImage } = await import('../../services/galleryService');
      await updateGalleryImage(img.id, { status: newStatus });
      fetchImages();
    } catch (err) {
      console.error("Error updating status:", err);
      if (err.message?.includes('status')) {
        alert("Database Error: You need to add a 'status' column to the 'gallery_images' table. Run: ALTER TABLE gallery_images ADD COLUMN status text DEFAULT 'published';");
      } else {
        alert("Failed to update status.");
      }
    }
  };

  // Stats
  const totalPhotos = images.length;
  const visiblePhotos = images.filter(img => img.status !== 'draft').length;
  const hiddenPhotos = images.filter(img => img.status === 'draft').length;
  
  const lastUpdated = images.length > 0 
    ? new Date(Math.max(...images.map(i => new Date(i.created_at || new Date())))).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No photos yet';

  // Filter and Sort
  const filteredImages = images.filter(img => {
    const searchMatch = img.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'All' 
      ? true 
      : filterStatus === 'Visible' 
        ? img.status !== 'draft'
        : img.status === 'draft';
    return searchMatch && statusMatch;
  }).sort((a, b) => {
    if (sortBy === 'Latest') return new Date(b.created_at || new Date()) - new Date(a.created_at || new Date());
    if (sortBy === 'Oldest') return new Date(a.created_at || new Date()) - new Date(b.created_at || new Date());
    return 0;
  });

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
    <div className={styles.libraryContainer}>
      <div className={styles.libraryTopHeader} style={{ marginBottom: '0' }}>
        <div>
          <h2 className={styles.libraryTitle}>Photo Gallery</h2>
          <p className={styles.librarySubtitle}>Manage images for your public photo gallery.</p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setEditingId(null);
            setImageFile(null);
            setImagePreview('');
            setTitle('');
            setStatus('published');
          }} 
          className={styles.primaryBtnPremium}
          style={{width: 'auto', padding: '0.8rem 1.2rem'}}
        >
          <Plus size={18} strokeWidth={3} /> Add New Photo
        </button>
      </div>

      {/* Stats Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <ImageIcon size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Photos</p>
            <h3 className={styles.statValue}>{totalPhotos}</h3>
            <p className={styles.statSub}>All time</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <Eye size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Visible Photos</p>
            <h3 className={styles.statValue}>{visiblePhotos}</h3>
            <p className={styles.statSub}>Currently visible</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <Trash2 size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Hidden Photos</p>
            <h3 className={styles.statValue}>{hiddenPhotos}</h3>
            <p className={styles.statSub}>Currently hidden</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <Calendar size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Last Updated</p>
            <h3 className={styles.statValue} style={{fontSize: '1.4rem'}}>{lastUpdated}</h3>
            <p className={styles.statSub}>Recent activity</p>
          </div>
        </div>
      </div>

      <div className={styles.libraryGridContainer}>
        {/* Filter Bar */}
        <div className={styles.libraryFilterBar} style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div className={styles.filterLeft}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search photos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.dropdownWrapper}>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="All">All Status</option>
                <option value="Visible">Visible</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>
          
          <div className={styles.filterRight}>
            <div className={styles.sortWrapper}>
              <ArrowUpDown size={16} className={styles.sortIcon} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="Latest">Sort by: Latest</option>
                <option value="Oldest">Sort by: Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading gallery...</div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white' }}>
            <ImageIcon size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#334155', marginBottom: '0.5rem' }}>No photos yet</h3>
            <p style={{ color: '#64748b' }}>Upload your first photo to show it on the Gallery page.</p>
          </div>
        ) : (
          <>
            <div className={styles.galleryGrid}>
              {paginatedImages.map(img => (
                <div key={img.id} className={styles.galleryCard}>
                  <div className={styles.galleryCardImgWrapper}>
                    <img src={img.image_url} alt={img.title || "Gallery"} />
                    <div className={styles.galleryBadge} style={{ background: img.status === 'draft' ? '#64748b' : 'rgba(21, 163, 73, 0.9)' }}>
                      {img.status === 'draft' ? <EyeOff size={12} /> : <Eye size={12} />} 
                      {img.status === 'draft' ? 'Hidden' : 'Visible'}
                    </div>
                  </div>
                  <div className={styles.galleryCardBody}>
                    <div>
                      <div className={styles.galleryCardTitle}>{img.title || 'Untitled Photo'}</div>
                      <div className={styles.galleryCardSub}>
                        Added on {new Date(img.created_at || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button 
                        className={styles.galleryActionBtn} 
                        onClick={() => handleEdit(img)}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Row */}
            {filteredImages.length > 0 && (
              <div className={styles.paginationRow}>
                <div className={styles.paginationInfo}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredImages.length)} of {filteredImages.length} photo{filteredImages.length !== 1 ? 's' : ''}
                </div>
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.pageBtn} 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className={styles.pageBtn} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                  
                  <select className={styles.perPageSelect} disabled>
                    <option>10 / page</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className={styles.modalContainer} style={{ maxWidth: '480px', padding: '1.5rem' }}>
            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className={styles.modalPremiumHeader} style={{ marginBottom: '1rem' }}>
              <div className={styles.modalIconBadgeGreen} style={{ width: '48px', height: '48px' }}>
                <ImagePlus size={20} color="#15a349" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>{editingId ? 'Edit Photo' : 'Add Photo to Gallery'}</h3>
                <p style={{ fontSize: '0.85rem' }}>{editingId ? 'Update photo details.' : 'Upload a new photo.'}</p>
              </div>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div>
                  <label className={styles.modalLabel}>Photo Title / Caption (Optional)</label>
                  <input 
                    type="text" 
                    className={styles.modalInput} 
                    placeholder="e.g. Sunday Worship Service" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: '#0f172a', marginBottom: '0.15rem' }}>Visibility Status</label>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Show or hide this photo in the gallery</span>
                  </div>
                  <div 
                    className={`${styles.iosToggleModal} ${status !== 'draft' ? styles.active : ''}`}
                    onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                  >
                    <div className={styles.iosToggleHandleModal}></div>
                    <span className={styles.iosToggleTextInside}>
                      {status !== 'draft' ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {dbError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', marginBottom: '0.5rem', fontWeight: 600 }}>
                      <AlertTriangle size={18} /> Database Update Required
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '1rem', lineHeight: '1.4' }}>
                      To support photo visibility toggling, you need to add the <strong>status</strong> column to your database. Please run this command in your Supabase SQL Editor:
                    </p>
                    <div style={{ position: 'relative' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("ALTER TABLE gallery_images ADD COLUMN status text DEFAULT 'published';");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }} 
                        style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, color: '#0f172a' }} 
                      >
                        {copied ? <Check size={14} color="#15a349" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy SQL'}
                      </button>
                      <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.8rem', margin: 0, paddingTop: '1.2rem', paddingBottom: '1.2rem' }}>
                        ALTER TABLE gallery_images ADD COLUMN status text DEFAULT 'published';
                      </pre>
                    </div>
                  </div>
                )}

                <div>
                  <label className={styles.modalLabel} style={{ marginBottom: '0.25rem' }}>Upload Image File {editingId ? '(Optional)' : '*'}</label>
                  <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()} style={{ padding: '0.75rem' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      required={!imageFile && !editingId}
                    />
                    {imagePreview ? (
                      <div style={{ position: 'relative', width: '100%' }} className={styles.uploadImagePreviewContainer}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px' }} />
                        <div className={styles.uploadHoverOverlay}>
                          <span style={{ fontWeight: 600, color: '#15a349' }}>Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div className={styles.uploadCloudBox} style={{ width: '48px', height: '48px', marginBottom: '0' }}>
                          <UploadCloud size={24} color="#15a349" />
                        </div>
                        <p className={styles.uploadBoxText} style={{ margin: 0, fontSize: '0.9rem' }}>
                          <strong>Drag & drop</strong> an image here
                        </p>
                        <button type="button" className={styles.browseFilesBtn} style={{ background: '#ffffff', padding: '0.3rem 0.8rem' }}>Choose File</button>
                        <p style={{ margin: '0', fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG or WEBP. Max size 5MB.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                {editingId ? (
                  <button type="button" onClick={() => { setDeleteId(editingId); setIsModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 0' }}>
                    <Trash2 size={18} /> Delete
                  </button>
                ) : <div></div>}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={styles.modalBtnCancel}>Cancel</button>
                  <button type="submit" className={styles.modalBtnSave} disabled={uploading || (!imageFile && !editingId)}>
                    <Upload size={18} /> {uploading ? 'Uploading...' : 'Save Photo'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Photo"
      message="Are you sure you want to remove this image from the gallery?"
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
