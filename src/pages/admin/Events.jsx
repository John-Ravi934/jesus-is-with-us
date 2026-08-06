import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { Plus, Edit2, Trash2, Calendar, MapPin, X, Copy, Check } from 'lucide-react';
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

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hideDescription, setHideDescription] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [learnMoreUrl, setLearnMoreUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setDbError(false);
      const data = await getEvents();
      // Only show non-announcement events here
      setEvents(data.filter(e => !e.is_announcement));
    } catch (err) {
      if (err.message && (err.message.includes('Could not find the table') || err.message.includes('relation "public.events" does not exist'))) {
        setDbError(true);
      } else {
        toast.error(err.message || "Failed to load events");
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
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setHideDescription(false);
    setEventDate('');
    setEventTime('');
    setLocation('');
    setLearnMoreUrl('');
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openModalForEdit = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    
    const desc = event.description || '';
    if (desc.startsWith('<!--HIDDEN-->')) {
      setDescription(desc.replace('<!--HIDDEN-->', ''));
      setHideDescription(true);
    } else {
      setDescription(desc);
      setHideDescription(false);
    }
    
    setEventDate(event.event_date);
    setEventTime(event.event_time || '');
    setLocation(event.location || '');
    setLearnMoreUrl(event.learn_more_url || '');
    setImageFile(null);
    setImagePreview(event.image_url || '');
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
    if (!title || !eventDate) {
      toast.error('Title and Date are required');
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = imagePreview; // keep existing if editing

    try {
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const eventData = {
        title,
        description: hideDescription ? `<!--HIDDEN-->${description}` : description,
        event_date: eventDate,
        event_time: eventTime,
        location,
        learn_more_url: learnMoreUrl,
        is_announcement: false,
        status: 'published',
        image_url: finalImageUrl
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success("Event updated!");
      } else {
        await createEvent(eventData);
        toast.success("Event created!");
      }
      
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || "Failed to save event");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvent(deleteId);
      toast.success("Event deleted");
      fetchEvents();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      console.error(err);
    } finally {
      setDeleteId(null);
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
        <button className={styles.primaryBtn} onClick={fetchEvents} style={{ marginTop: '1.5rem' }}>
          I have run the script, try again
        </button>
      </div>
    );
  }

  return (
    <>
    <div>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Manage Upcoming Events</h2>
          <p>Create upcoming events for the Home page.</p>
        </div>
        <button className={`${styles.primaryBtn} ${styles.headerBtn}`} onClick={openModalForCreate}>
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="bg-white rounded shadow-sm" style={{ padding: '1rem', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No events found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Event</th>
                <th style={{ padding: '1rem' }}>Date & Time</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '60px', height: '40px', background: '#f1f5f9', borderRadius: '4px' }}></div>
                      )}
                      <div>
                        <strong>{event.title}</strong>
                        {event.location && <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {event.location}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14}/> {new Date(event.event_date).toLocaleDateString('en-GB')}
                    </div>
                    {event.event_time && <div style={{ fontSize: '0.8rem' }}>{event.event_time}</div>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openModalForEdit(event)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '1rem' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setDeleteId(event.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Event Title *</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                
                <div>
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-control" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                </div>

                <div>
                  <label className="form-label">Time</label>
                  <input type="text" className="form-control" placeholder="e.g. 6:00 PM" value={eventTime} onChange={e => setEventTime(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" placeholder="e.g. Main Auditorium" value={location} onChange={e => setLocation(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Learn More URL</label>
                  <input type="url" className="form-control" placeholder="https://" value={learnMoreUrl} onChange={e => setLearnMoreUrl(e.target.value)} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                  <label style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>
                    <input 
                      type="checkbox" 
                      checked={!hideDescription}
                      onChange={(e) => setHideDescription(!e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Show this description on the Home Page
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Event Image / Poster</label>
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
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Event"
      message="Are you sure you want to delete this event?"
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
