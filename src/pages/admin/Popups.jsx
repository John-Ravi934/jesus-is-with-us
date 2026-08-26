import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { Plus, Edit2, Trash2, X, Bell, Copy, Check, Search, ArrowUpDown, ChevronLeft, ChevronRight, Megaphone, Eye, Calendar, GripVertical, Quote, Link, ImagePlus, RefreshCw, Save } from 'lucide-react';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const SQL_SCRIPT = `
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  image_url TEXT,
  learn_more_url TEXT,
  is_announcement BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on events"
  ON public.events FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage events"
  ON public.events FOR ALL
  USING (auth.role() = 'authenticated');

-- Create storage bucket for events
INSERT INTO storage.buckets (id, name, public) 
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access for events bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events' );

CREATE POLICY "Auth Insert for events bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'events' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update for events bucket"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'events' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete for events bucket"
ON storage.objects FOR DELETE
USING ( bucket_id = 'events' AND auth.role() = 'authenticated' );
`;

export default function Popups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Filter/Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [learnMoreUrl, setLearnMoreUrl] = useState('');
  const [status, setStatus] = useState('published'); // 'published' = ON, 'draft' = OFF
  const [showEveryTime, setShowEveryTime] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      setDbError(false);
      const data = await getEvents();
      setPopups(data.filter(e => e.is_announcement));
    } catch (err) {
      if (err.message && (err.message.includes('Could not find the table') || err.message.includes('relation "public.events" does not exist'))) {
        setDbError(true);
      } else {
        toast.error(err.message || "Failed to load popups");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    toast.success("SQL Script copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openModalForCreate = () => {
    setEditingPopup(null);
    setTitle('');
    setDescription('');
    setLearnMoreUrl('');
    setStatus('published');
    setShowEveryTime(false);
    setShowDetails(true);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (popup) => {
    setEditingPopup(popup);
    setTitle(popup.title);
    setDescription(popup.description ? popup.description.replace('<!--NO_DETAILS-->', '') : '');
    setLearnMoreUrl(popup.learn_more_url || '');
    setStatus(popup.status);
    setShowEveryTime(popup.event_time === 'always');
    setShowDetails(!popup.description?.startsWith('<!--NO_DETAILS-->'));
    setImageFile(null);
    setImagePreview(popup.image_url || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('events')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found")) {
        throw new Error("Storage bucket 'events' not found. Please run the SQL script to create it.");
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = imagePreview;

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      // We use today's date for popups since they don't necessarily have a specific "event date"
      const finalDesc = showDetails ? description : `<!--NO_DETAILS-->${description}`;
      
      const eventData = {
        title,
        description: finalDesc,
        event_date: new Date().toISOString().split('T')[0], 
        event_time: showEveryTime ? 'always' : 'once',
        learn_more_url: learnMoreUrl,
        is_announcement: true,
        status,
        image_url: finalImageUrl
      };

      if (editingPopup) {
        await updateEvent(editingPopup.id, eventData);
        toast.success("Popup updated!");
      } else {
        await createEvent(eventData);
        toast.success("Popup created!");
      }
      
      setIsModalOpen(false);
      fetchPopups();
    } catch (err) {
      toast.error(err.message || "Failed to save popup");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (popup) => {
    const newStatus = popup.status === 'published' ? 'draft' : 'published';
    try {
      await updateEvent(popup.id, { status: newStatus });
      toast.success(newStatus === 'published' ? 'Popup turned ON' : 'Popup turned OFF');
      fetchPopups();
    } catch (err) {
      toast.error("Failed to change status");
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvent(deleteId);
      toast.success("Deleted successfully");
      fetchPopups();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  // Derived state for Stats
  const totalPopups = popups.length;
  const visiblePopups = popups.filter(p => p.status === 'published').length;
  const hiddenPopups = popups.filter(p => p.status === 'draft').length;

  // Filtered/Sorted Data
  const filteredData = popups.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
                          (filterStatus === 'Visible' && p.status === 'published') ||
                          (filterStatus === 'Hidden' && p.status === 'draft');
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'Latest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'Oldest') return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (dbError) {
    return (
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Setup Required</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>
          The <b>events</b> table or storage bucket was not found in your Supabase project. 
          Please copy the SQL script below and run it in your Supabase SQL Editor.
        </p>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={copySql} 
            style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} 
            className="btn btn-secondary btn-sm"
          >
            {copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy SQL'}
          </button>
          <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
            {SQL_SCRIPT}
          </pre>
        </div>
        <button className={styles.primaryBtn} onClick={fetchPopups} style={{ marginTop: '1.5rem' }}>
          I have run the script, try again
        </button>
      </div>
    );
  }

  return (
    <>
    <div className={styles.libraryContainer}>
      <div className={styles.libraryTopHeader} style={{ marginBottom: '0' }}>
        <div>
          <h2 className={styles.libraryTitle}>Manage Popups</h2>
          <p className={styles.librarySubtitle}>Create and toggle announcements that pop up on the home page.</p>
        </div>
        <button className={styles.primaryBtnPremium} onClick={openModalForCreate} style={{width: 'auto', padding: '0.8rem 1.2rem'}}>
          <Plus size={18} strokeWidth={3} /> Add Popup
        </button>
      </div>

      {/* Stats Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <Megaphone size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Popups</p>
            <h3 className={styles.statValue}>{totalPopups}</h3>
            <p className={styles.statSub}>Active items</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperOrange}>
            <Eye size={24} color="#d97706" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Visible Popups</p>
            <h3 className={styles.statValue}>{visiblePopups}</h3>
            <p className={styles.statSub}>Currently shown</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperPurple}>
            <Calendar size={24} color="#7c3aed" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Hidden Popups</p>
            <h3 className={styles.statValue}>{hiddenPopups}</h3>
            <p className={styles.statSub}>Currently hidden</p>
          </div>
        </div>
      </div>

      <div className={styles.libraryGridContainer}>
        <div className={styles.libraryFilterBar} style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div className={styles.filterLeft}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search popup content..." 
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
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading popups...</p>
        ) : (
          <>
            <div className={styles.popupGridHeader}>
              <div>POPUP CONTENT</div>
              <div>PREVIEW</div>
              <div style={{textAlign: 'center'}}>STATUS</div>
              <div style={{textAlign: 'center'}}>ACTIONS</div>
            </div>

            <div className={styles.libraryGridBody}>
              {paginatedData.map((popup) => (
                <div className={styles.popupGridRow} key={popup.id}>
                  
                  {/* Popup Content */}
                  <div className={styles.gridCellContent}>
                    <GripVertical size={20} color="#cbd5e1" style={{cursor: 'grab'}} />
                    {popup.image_url ? (
                      <img src={popup.image_url} alt={popup.title} className={styles.gridPopupThumb} />
                    ) : (
                      <div className={styles.gridPopupThumbPlaceholder}>
                        <Bell size={20} color="#94a3b8" />
                      </div>
                    )}
                    <div className={styles.gridPopupText}>
                      <div className={styles.gridPopupTitle}>{popup.title}</div>
                      <div className={styles.gridPopupSub}>{popup.description?.replace('<!--NO_DETAILS-->', '').substring(0, 30)}...</div>
                    </div>
                  </div>

                  {/* Preview Quote Block */}
                  <div className={styles.gridCellPreview}>
                    <div className={styles.quoteBlock}>
                      <Quote size={16} color="#94a3b8" className={styles.quoteIcon} />
                      <div className={styles.quoteText}>
                        {popup.description?.replace('<!--NO_DETAILS-->', '').substring(0, 70)}...
                      </div>
                      {popup.learn_more_url && (
                        <div className={styles.quoteLink}>
                          - Learn More
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className={styles.gridCellToggle}>
                    <div 
                      className={`${styles.iosToggle} ${popup.status === 'published' ? styles.active : ''}`}
                      onClick={() => toggleStatus(popup)}
                    >
                      <div className={styles.iosToggleHandle}></div>
                    </div>
                    <span className={styles.iosToggleLabel}>
                      {popup.status === 'published' ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.gridCellActions}>
                    <button className={styles.actionBtnCircle} onClick={() => openModalForEdit(popup)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className={`${styles.actionBtnCircle} ${styles.delete}`} onClick={() => setDeleteId(popup.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                </div>
              ))}
              
              {paginatedData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No popups found.</div>
              )}
            </div>
            
            {/* Pagination Row */}
            <div className={styles.paginationRow}>
              <div className={styles.paginationInfo}>
                Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} popups
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className={styles.modalContainer}>
            <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
              <X size={20} />
            </button>
            
            <div className={styles.modalPremiumHeader}>
              <div className={styles.modalIconBadgeGreen}>
                <Megaphone size={24} color="#15a349" />
              </div>
              <div>
                <h3>{editingPopup ? 'Edit Popup' : 'Create New Popup'}</h3>
                <p>Add an announcement popup to display on your website.</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className={styles.modalLabel}>Popup Title *</label>
                  <input type="text" className={styles.modalInput} placeholder="Enter popup title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                <div>
                  <label className={styles.modalLabel}>Learn More URL (Optional)</label>
                  <div className={styles.inputWithIconWrapper}>
                    <Link size={18} className={styles.inputIconLeft} />
                    <input type="url" className={`${styles.modalInput} ${styles.hasLeftIcon}`} placeholder="https://example.com" value={learnMoreUrl} onChange={e => setLearnMoreUrl(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={styles.modalLabel}>Description (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      className={styles.modalInput} 
                      rows="3" 
                      placeholder="Write a short description..." 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      maxLength={200}
                      style={{ paddingBottom: '2rem' }}
                    ></textarea>
                    <div className={styles.charCounter}>
                      {description.length} / 200
                    </div>
                  </div>
                </div>

                <div>
                  <label className={styles.modalLabel}>Popup Image / Poster</label>
                  <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    {imagePreview ? (
                      <div style={{ position: 'relative', width: '100%' }} className={styles.uploadImagePreviewContainer}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                        <div className={styles.uploadHoverOverlay}>
                          <span style={{ fontWeight: 600, color: '#15a349' }}>Click to change image</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px' }}>
                          <ImagePlus size={28} color="#15a349" />
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <p className={styles.uploadBoxText}><strong>Drag</strong> and drop <span style={{color: '#15a349'}}>your image here</span><br/>or <strong>click to browse</strong></p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>PNG, JPG, WEBP (Max 5MB)</p>
                        </div>
                        <button type="button" className={styles.browseFilesBtn}>Browse Files</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.settingsGrid}>
                  <div className={styles.settingCard}>
                    <div className={styles.settingIconBox} style={{ background: '#dcfce7' }}>
                      <Eye size={24} color="#15a349" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong>Popup Status</strong>
                      <p>Show or hide this popup on your website.</p>
                      <div 
                        className={`${styles.iosToggleModal} ${status === 'published' ? styles.active : ''}`}
                        onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                      >
                        <span className={styles.iosToggleTextInside}>{status === 'published' ? 'ON' : 'OFF'}</span>
                        <div className={styles.iosToggleHandleModal}></div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.settingCard}>
                    <div className={styles.settingIconBox} style={{ background: '#e0f2fe' }}>
                      <RefreshCw size={24} color="#0284c7" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong>Show Every Reload</strong>
                      <p>If unchecked, shows only once per visit.</p>
                      <label className={styles.customCheckboxLabel}>
                        <div className={styles.customCheckboxWrapper}>
                          <input 
                            type="checkbox" 
                            checked={showEveryTime}
                            onChange={(e) => setShowEveryTime(e.target.checked)}
                            className={styles.hiddenCheckbox}
                          />
                          <div className={`${styles.customCheckbox} ${showEveryTime ? styles.checked : ''}`}>
                            {showEveryTime && <Check size={14} color="#fff" strokeWidth={3} />}
                          </div>
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>Show Once</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className={styles.detailsBannerPurple}>
                  <label className={styles.customCheckboxLabel}>
                    <div className={styles.customCheckboxWrapper}>
                      <input 
                        type="checkbox" 
                        checked={showDetails}
                        onChange={(e) => setShowDetails(e.target.checked)}
                        className={styles.hiddenCheckbox}
                      />
                      <div className={`${styles.customCheckboxPurple} ${showDetails ? styles.checked : ''}`}>
                        {showDetails && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                    <span style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                      <strong>Show details section</strong> (title, date, description) at the bottom of the popup
                    </span>
                  </label>
                </div>
              </div>
              
              <div className={styles.modalFooterGrid}>
                <button type="button" className={styles.modalBtnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.modalBtnSave} disabled={isSubmitting}>
                  <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Popup"
      message="Are you sure you want to delete this popup? This cannot be undone."
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
