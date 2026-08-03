import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { Plus, Edit2, Trash2, X, Bell, Copy, Check } from 'lucide-react';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this popup?")) {
      try {
        await deleteEvent(id);
        toast.success("Deleted successfully");
        fetchPopups();
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
    <div>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Manage Popups</h2>
          <p>Create and toggle announcements that pop up on the home page.</p>
        </div>
        <button className={`${styles.primaryBtn} ${styles.headerBtn}`} onClick={openModalForCreate}>
          <Plus size={18} /> Add Popup
        </button>
      </div>

      <div className="bg-white rounded shadow-sm" style={{ padding: '1rem', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading popups...</p>
        ) : popups.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No popups found.</p>
        ) : (
          <div style={{overflowX: "auto"}}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Popup Content</th>
                <th style={{ padding: '1rem' }}>ON/OFF Feature</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {popups.map((popup) => (
                <tr key={popup.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {popup.image_url ? (
                        <img src={popup.image_url} alt={popup.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '80px', height: '60px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bell size={20} color="#94a3b8" />
                        </div>
                      )}
                      <div>
                        <strong>{popup.title}</strong>
                        {popup.description && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{popup.description.replace('<!--NO_DETAILS-->', '').substring(0, 50)}...</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => toggleStatus(popup)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '50px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        background: popup.status === 'published' ? '#22c55e' : '#e2e8f0',
                        color: popup.status === 'published' ? '#fff' : '#64748b',
                        boxShadow: popup.status === 'published' ? '0 2px 10px rgba(34,197,94,0.3)' : 'none'
                      }}
                    >
                      {popup.status === 'published' ? 'ON (Active)' : 'OFF (Hidden)'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openModalForEdit(popup)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(popup.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingPopup ? 'Edit Popup' : 'Add New Popup'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Popup Title *</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                <div>
                  <label className="form-label">Learn More URL (Optional)</label>
                  <input type="url" className="form-control" placeholder="https://" value={learnMoreUrl} onChange={e => setLearnMoreUrl(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                </div>

                <div>
                  <label className="form-label">Popup Image / Poster</label>
                  {imagePreview && (
                    <div style={{ marginBottom: '1rem' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'block', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <strong>Popup Status</strong>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Turn on to show to visitors.</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 'auto' }}>
                      <input 
                        type="checkbox" 
                        checked={status === 'published'}
                        onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
                        style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                      />
                      <span style={{ marginLeft: '8px', fontWeight: 600, color: status === 'published' ? '#22c55e' : '#64748b' }}>
                        {status === 'published' ? 'ON' : 'OFF'}
                      </span>
                    </label>
                  </div>

                  <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                      <strong>Show Every Reload</strong>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>If unchecked, shows only once per visit.</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 'auto' }}>
                      <input 
                        type="checkbox" 
                        checked={showEveryTime}
                        onChange={(e) => setShowEveryTime(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                      />
                      <span style={{ marginLeft: '8px', fontWeight: 600, color: showEveryTime ? '#3b82f6' : '#64748b' }}>
                        {showEveryTime ? 'Always Show' : 'Show Once'}
                      </span>
                    </label>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="showDetails" 
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="showDetails" style={{ fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>
                    Show details section (title, date, description) at the bottom of the popup
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
