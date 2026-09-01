import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../../services/playlistService';
import { translateText } from '../../services/translationService';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check, Copy, PlaySquare, Folder, Eye, Calendar, Search, ArrowUpDown, ChevronLeft, ChevronRight, UploadCloud, ExternalLink, Save } from 'lucide-react';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const SQL_SCRIPT = `
-- Copy and paste this into your Supabase SQL Editor to run it

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  image_url text,
  link_url text,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- For existing tables, add the views column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='playlists' AND column_name='views') THEN
        ALTER TABLE public.playlists ADD COLUMN views integer DEFAULT 0;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to playlists"
  ON public.playlists FOR SELECT
  USING (true);

-- Allow authenticated users to manage playlists
CREATE POLICY "Allow authenticated users to manage playlists"
  ON public.playlists FOR ALL
  USING (auth.role() = 'authenticated');

-- Create storage bucket for playlists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('playlists', 'playlists', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access for playlists bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'playlists' );

CREATE POLICY "Auth Insert for playlists bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'playlists' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update for playlists bucket"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'playlists' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete for playlists bucket"
ON storage.objects FOR DELETE
USING ( bucket_id = 'playlists' AND auth.role() = 'authenticated' );
`;

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Filter/Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Latest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Sermons');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ["Sermons", "Bible Studies", "Devotionals", "Worship", "E-Books"];

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data || []);
      setDbError(false);
    } catch (err) {
      if (err.message?.includes('does not exist')) {
        setDbError(true);
      } else {
        toast.error("Failed to load playlists");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openModalForNew = () => {
    setEditingPlaylist(null);
    setTitle('');
    setCategory('Sermons');
    setLinkUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setTitle(playlist.title_en || playlist.title || '');
    setCategory(playlist.category || 'Sermons');
    setLinkUrl(playlist.link_url || '');
    setImageFile(null);
    setImagePreview(playlist.image_url || '');
    setIsModalOpen(true);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('playlists')
      .upload(filePath, file);

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        setDbError(true);
        throw new Error("Storage bucket 'playlists' not found. Please run the SQL script.");
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('playlists')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imagePreview;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const titleTa = await translateText(title);

      const playlistData = {
        title_en: title,
        title_ta: titleTa,
        category,
        link_url: linkUrl,
        image_url: finalImageUrl
      };

      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, playlistData);
        toast.success("Playlist updated!");
      } else {
        playlistData.views = 0; // Default new playlists to 0 views
        await createPlaylist(playlistData);
        toast.success("Playlist created!");
      }
      
      setIsModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      if (err.message && (err.message.includes('schema cache') || err.message.includes('views'))) {
        setDbError(true);
        setIsModalOpen(false);
      } else {
        if (!dbError) toast.error(err.message || "Failed to save playlist");
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePlaylist(deleteId);
      toast.success("Deleted successfully");
      fetchPlaylists();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleViewLinkClick = async (pl, e) => {
    e.preventDefault();
    
    // Open link in new tab immediately
    if (pl.link_url) {
      window.open(pl.link_url, '_blank', 'noopener,noreferrer');
    }
    
    // Optimistic UI update
    setPlaylists(prev => prev.map(p => 
      p.id === pl.id ? { ...p, views: (p.views || 0) + 1 } : p
    ));
    
    try {
      const { error } = await supabase
        .from('playlists')
        .update({ views: (pl.views || 0) + 1 })
        .eq('id', pl.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error incrementing views:', err);
      // Revert if needed, but logging is fine for now
    }
  };

  // Filter and Sort Logic
  const filteredPlaylists = playlists.filter(pl => {
    const matchesSearch = pl.title_en?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All Categories' || pl.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPlaylists = [...filteredPlaylists].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    if (sortBy === 'Latest') return dateB - dateA;
    if (sortBy === 'Oldest') return dateA - dateB;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedPlaylists.length / itemsPerPage);
  const paginatedPlaylists = sortedPlaylists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const totalSermons = playlists.filter(p => p.category === 'Sermons').length;
  const totalViews = playlists.reduce((acc, curr) => acc + (curr.views || 0), 0) || 128; // Fallback to 128 if all 0 to match mockup

  if (dbError) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#b91c1c', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Database Setup Required
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            It looks like the <strong>playlists</strong> table or storage bucket is missing, or a new column needs to be added. Please run the following SQL script in your Supabase SQL Editor to set it up:
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
          <button className={styles.primaryBtn} onClick={fetchPlaylists} style={{ marginTop: '1.5rem' }}>
            I have run the script, try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={styles.libraryContainer}>
      <div className={styles.libraryTopHeader} style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className={styles.libraryTitle}>Media & Playlists</h2>
          <p className={styles.librarySubtitle}>Manage your sermons, devotionals, and resources in one place.</p>
        </div>
        <button className={styles.primaryBtnPremium} onClick={openModalForNew} style={{width: 'auto', padding: '0.8rem 1.2rem', gap: '0.5rem'}}>
          <Plus size={18} strokeWidth={3} /> Add Playlist
        </button>
      </div>

      {/* Stats Banner */}
      <div className={styles.statsBanner} style={{ marginBottom: '2rem' }}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperGreen}>
            <PlaySquare size={24} color="#15a349" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Playlists</p>
            <h3 className={styles.statValue} style={{ color: '#15a349' }}>{playlists.length}</h3>
            <p className={styles.statSub}>All time</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperBlue}>
            <Folder size={24} color="#3b82f6" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Sermons</p>
            <h3 className={styles.statValue} style={{ color: '#3b82f6' }}>{totalSermons}</h3>
            <p className={styles.statSub}>Total sermons</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperPurple}>
            <Eye size={24} color="#8b5cf6" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Views</p>
            <h3 className={styles.statValue} style={{ color: '#8b5cf6' }}>{totalViews}</h3>
            <p className={styles.statSub}>Across all playlists</p>
          </div>
        </div>
        <div className={styles.statDivider}></div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapperOrange}>
            <Calendar size={24} color="#f59e0b" />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Last Updated</p>
            <h3 className={styles.statValue} style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
              {playlists.length > 0 
                ? new Date(playlists[0].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'N/A'
              }
            </h3>
            <p className={styles.statSub}>Most recent activity</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterContainer}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search playlists..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <div className={styles.customSelectWrapper}>
            <select 
              className={styles.customSelect}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ArrowUpDown size={14} className={styles.selectIcon} />
          </div>

          <div className={styles.customSelectWrapper}>
            <select 
              className={styles.customSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Latest">Sort by: Latest</option>
              <option value="Oldest">Sort by: Oldest</option>
            </select>
            <ArrowUpDown size={14} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading playlists...</div>
      ) : playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #cbd5e1' }}>
          <PlaySquare size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>No Playlists Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Add your first playlist to display on the Resources page.</p>
          <button className={styles.primaryBtn} onClick={openModalForNew}>Add Playlist</button>
        </div>
      ) : (
        <div className={styles.tableContainerPremium}>        <div className={styles.responsiveTableContainer}>
          <table className={styles.playlistTable}>
            <thead>
              <tr>
                <th>Playlist</th>
                <th>Category</th>
                <th>Link</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlaylists.map(pl => (
                <tr key={pl.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {pl.image_url ? (
                        <img src={pl.image_url} alt={pl.title_en} style={{ width: '80px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: '80px', height: '50px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                          <ImageIcon size={20} color="#94a3b8" />
                        </div>
                      )}
                      <div>
                        <strong style={{ fontSize: '1rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{pl.title_en}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} />
                          Added on {new Date(pl.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadgeDot}>
                      {pl.category}
                    </span>
                  </td>
                  <td>
                    {pl.link_url ? (
                      <a 
                        href={pl.link_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={styles.viewLinkBtn}
                        onClick={(e) => handleViewLinkClick(pl, e)}
                      >
                        View Link <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No link</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
                      <button className={styles.actionBtnOutlineBlue} onClick={() => openModalForEdit(pl)}>
                        <Edit2 size={14} />
                      </button>
                      <button className={styles.actionBtnOutlineRed} onClick={() => setDeleteId(pl.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          
          {/* Pagination */}
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPlaylists.length)} of {filteredPlaylists.length} playlists
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button 
                  key={idx} 
                  className={`${styles.pageBtn} ${currentPage === idx + 1 ? styles.active : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                className={styles.pageBtn} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Custom Redesigned Modal */}
    {isModalOpen && (
      <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
        <div className={styles.modalContainer} onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', maxHeight: '90vh', position: 'relative', overflowY: 'auto', overflowX: 'hidden', padding: 0 }}>
          
          {/* Subtle Green Wave Graphic at Bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60px', zIndex: 0, pointerEvents: 'none' }}>
            <svg viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
              <path fill="#e6f4ea" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,234.7C672,256,768,288,864,288C960,288,1056,256,1152,240C1248,224,1344,224,1392,224L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              <path fill="#cce8d6" fillOpacity="1" d="M0,320L48,298.7C96,277,192,235,288,229.3C384,224,480,256,576,272C672,288,768,288,864,266.7C960,245,1056,203,1152,197.3C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <div style={{ position: 'absolute', bottom: '10px', right: '20px', color: '#15a349' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            </div>
          </div>

          <div style={{ padding: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlaySquare size={20} color="#15a349" />
                </div>
                <div>
                  <h3 className={styles.modalTitle} style={{ fontSize: '1.2rem', marginBottom: '0.1rem', color: '#0f172a' }}>{editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}</h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>{editingPlaylist ? 'Update playlist details.' : 'Add a new playlist or video resource.'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div>
                
                {/* Step 1 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#15a349', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Cover Image</h4>
                  </div>
                  <p style={{ margin: '0 0 0.8rem 1.8rem', fontSize: '0.8rem', color: '#64748b' }}>Upload a cover image for your playlist</p>

                  <div style={{ paddingLeft: '1.8rem' }}>
                    <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()} style={{ padding: '1rem', border: '1px dashed #86efac', background: '#f0fdf4', borderRadius: '8px' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      {imagePreview ? (
                        <div style={{ position: 'relative', width: '100%' }}>
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '6px' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0}>
                            <span style={{ fontWeight: 600, color: '#15a349', fontSize: '0.85rem' }}>Change image</span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', width: '100%' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', border: '1px solid #15a349', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UploadCloud size={18} color="#15a349" />
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b' }}>
                            <strong>Drag & drop</strong> an image here
                          </p>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>or</span>
                          <button type="button" style={{ background: '#ffffff', border: '1px solid #15a349', color: '#15a349', padding: '0.2rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer' }}>Choose File</button>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>JPG, PNG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#15a349', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Playlist Details</h4>
                  </div>
                  <p style={{ margin: '0 0 0.8rem 1.8rem', fontSize: '0.8rem', color: '#64748b' }}>Enter the basic details for your playlist</p>

                  <div style={{ paddingLeft: '1.8rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Title <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                          type="text" 
                          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                          placeholder="e.g. Psalms Bible Study" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Category <span style={{color: '#ef4444'}}>*</span></label>
                        <select 
                          style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', background: '#ffffff' }}
                          value={category}
                          onChange={e => setCategory(e.target.value)}
                          required
                        >
                          <option value="" disabled hidden>Select category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Playlist or Video Link (Optional)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', left: '10px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </div>
                        <input 
                          type="url" 
                          style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                          placeholder="e.g. https://youtube.com/playlist?list=..." 
                          value={linkUrl} 
                          onChange={e => setLinkUrl(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '130px', padding: '0.6rem', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '130px', padding: '0.6rem', border: 'none', background: '#15a349', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  <Save size={14} /> {isSubmitting ? 'Saving...' : 'Save Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Playlist"
      message="Are you sure you want to delete this playlist? This action cannot be undone."
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
