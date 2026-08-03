import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist } from '../../services/playlistService';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check, Copy } from 'lucide-react';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';

const SQL_SCRIPT = `
-- Copy and paste this into your Supabase SQL Editor to run it

CREATE TABLE public.playlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  image_url text,
  link_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPopup] = useState(null);
  
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
    setEditingPopup(null);
    setTitle('');
    setCategory('Sermons');
    setLinkUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (playlist) => {
    setEditingPopup(playlist);
    setTitle(playlist.title);
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
        throw new Error("Storage bucket 'playlists' not found. Please run the SQL script to create it.");
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('playlists')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (!imagePreview && !imageFile) {
      toast.error('A cover image is required');
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = imagePreview;

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const playlistData = {
        title,
        category,
        link_url: linkUrl,
        image_url: finalImageUrl
      };

      if (editingPlaylist) {
        await updatePlaylist(editingPlaylist.id, playlistData);
        toast.success("Playlist updated!");
      } else {
        await createPlaylist(playlistData);
        toast.success("Playlist created!");
      }
      
      setIsModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      toast.error(err.message || "Failed to save playlist");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await deletePlaylist(id);
        toast.success("Deleted successfully");
        fetchPlaylists();
      } catch (err) {
        toast.error(err.message || "Failed to delete");
        console.error(err);
      }
    }
  };

  if (dbError) {
    return (
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Setup Required</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>
          The <b>playlists</b> table or storage bucket was not found in your Supabase project. 
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
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Media & Playlists</h2>
          <p>Manage your sermons, devotionals, and resources.</p>
        </div>
        <button className={`${styles.primaryBtn} ${styles.headerBtn}`} onClick={openModalForNew}>
          <Plus size={18} /> Add Playlist
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading playlists...</div>
      ) : playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #cbd5e1' }}>
          <ImageIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>No Playlists Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Add your first playlist to display on the Resources page.</p>
          <button className={styles.primaryBtn} onClick={openModalForNew}>Add Playlist</button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Cover & Title</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '1rem', fontWeight: 600 }}>Link</th>
                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {playlists.map(pl => (
                <tr key={pl.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {pl.image_url ? (
                        <img src={pl.image_url} alt={pl.title} style={{ width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '60px', height: '40px', borderRadius: '4px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={20} color="#94a3b8" />
                        </div>
                      )}
                      <div>
                        <strong>{pl.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Added {new Date(pl.created_at).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>
                      {pl.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#3b82f6' }}>
                    {pl.link_url ? (
                      <a href={pl.link_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'inherit' }}>
                        View Link
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No link</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => openModalForEdit(pl)}
                      style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '8px', marginRight: '4px' }}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(pl.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' 
        }}>
          <div style={{ 
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', 
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                {editingPlaylist ? 'Edit Playlist' : 'Add New Playlist'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              
              {/* Image Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Cover Image <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed #cbd5e1', borderRadius: '8px', padding: imagePreview ? '0' : '2rem', 
                    textAlign: 'center', cursor: 'pointer', background: '#f8fafc', position: 'relative',
                    overflow: 'hidden', height: imagePreview ? '200px' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <ImageIcon size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Click to upload an image</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>JPEG, PNG up to 5MB</div>
                    </div>
                  )}
                  {imagePreview && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '0.5rem', fontSize: '0.8rem' }}>
                      Click to change image
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                    Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Psalms Bible Study"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                    Category
                  </label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                  Playlist or Video Link (Optional)
                </label>
                <input 
                  type="url" 
                  value={linkUrl} 
                  onChange={e => setLinkUrl(e.target.value)} 
                  placeholder="e.g. https://youtube.com/playlist?list=..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingPlaylist ? 'Update Playlist' : 'Save Playlist')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
