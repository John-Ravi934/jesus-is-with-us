import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { translateText } from '../../services/translationService';
import adminStyles from './AdminStyles.module.css';
import {
  Plus, Edit2, Trash2, Calendar, MapPin, X, Copy, Check,
  Search, ChevronDown, ChevronLeft, ChevronRight, Upload, Clock,
  Users, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

const SQL_SCRIPT = `
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  image_url TEXT,
  learn_more_url TEXT,
  is_announcement BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage events" ON public.events FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Access for events bucket" ON storage.objects FOR SELECT USING ( bucket_id = 'events' );
CREATE POLICY "Auth Insert for events bucket" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'events' AND auth.role() = 'authenticated' );
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getNextEvent(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter(e => new Date(e.event_date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  return upcoming[0] || null;
}

function getUniqueLocations(events) {
  return [...new Set(events.map(e => e.location_en || e.location).filter(Boolean))];
}

function getThisMonthCount(events) {
  const now = new Date();
  return events.filter(e => {
    const d = new Date(e.event_date + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

const ITEMS_PER_PAGE = 6;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value, sub, highlight }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8edf2', borderRadius: '14px',
      padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center',
      gap: '1rem', flex: '1 1 180px', minWidth: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{ width: 52, height: 52, borderRadius: '12px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', color: '#8898aa', fontWeight: 600, marginBottom: '0.2rem' }}>{label}</div>
        <div style={{ fontSize: highlight ? '1.3rem' : '1.75rem', fontWeight: 700, color: highlight ? '#e67e22' : '#1a2940', lineHeight: 1.1 }}>{value}</div>
        {sub && <div style={{ fontSize: '0.76rem', color: '#8898aa', marginTop: '0.2rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Shared inline styles ─────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', marginBottom: '0.4rem',
  fontSize: '0.875rem', fontWeight: 600, color: '#334155'
};

const inputStyle = {
  width: '100%', padding: '0.7rem 0.9rem',
  border: '1.5px solid #e2e8f0', borderRadius: '9px',
  fontSize: '0.9rem', color: '#1e293b', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
  transition: 'border-color 0.15s', fontFamily: 'inherit'
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hideDescription, setHideDescription] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [learnMoreUrl, setLearnMoreUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setDbError(false);
      const data = await getEvents();
      setEvents(data.filter(e => !e.is_announcement));
    } catch (err) {
      if (err.message && (err.message.includes('Could not find the table') || err.message.includes('relation "public.events" does not exist'))) {
        setDbError(true);
      } else {
        toast.error(err.message || 'Failed to load events');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    toast.success('SQL Script copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const allLocations = getUniqueLocations(events);
  const nextEvent = getNextEvent(events);
  const thisMonth = getThisMonthCount(events);
  const uniqueLocCount = getUniqueLocations(events).length;

  const filtered = events
    .filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.title_en?.toLowerCase().includes(q) || (e.location_en || e.location)?.toLowerCase().includes(q);
      const matchLoc = !filterLocation || (e.location_en || e.location) === filterLocation;
      const matchStatus = !filterStatus || e.status === filterStatus;
      return matchSearch && matchLoc && matchStatus;
    })
    .sort((a, b) => {
      const diff = new Date(a.event_date) - new Date(b.event_date);
      return sortOrder === 'asc' ? diff : -diff;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetForm = () => {
    setTitle(''); setDescription(''); setHideDescription(false);
    setEventDate(''); setEventTime(''); setLocation('');
    setLearnMoreUrl(''); setImageFile(null); setImagePreview('');
  };

  const openModalForCreate = () => { setEditingEvent(null); resetForm(); setIsModalOpen(true); };

  const openModalForEdit = (event) => {
    setEditingEvent(event);
    setTitle(event.title_en || event.title || '');
    const desc = event.description_en || event.description || '';
    if (desc.startsWith('<!--HIDDEN-->')) {
      setDescription(desc.replace('<!--HIDDEN-->', ''));
      setHideDescription(true);
    } else {
      setDescription(desc);
      setHideDescription(false);
    }
    setEventDate(event.event_date);
    setEventTime(event.event_time || '');
    setLocation(event.location_en || event.location || '');
    setLearnMoreUrl(event.learn_more_url || '');
    setImageFile(null);
    setImagePreview(event.image_url || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageChange(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('events').upload(fileName, file);
    if (uploadError) {
      if (uploadError.message.includes('Bucket not found'))
        throw new Error("Storage bucket 'events' not found. Please run the SQL script.");
      throw uploadError;
    }
    const { data } = supabase.storage.from('events').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate) { toast.error('Title and Date are required'); return; }
    setIsSubmitting(true);
    let finalImageUrl = imagePreview;
    try {
      if (imageFile) finalImageUrl = await uploadImage(imageFile);
      
      const [titleTa, descTa, locTa] = await Promise.all([
        translateText(title),
        translateText(hideDescription ? `<!--HIDDEN-->${description}` : description),
        location ? translateText(location) : Promise.resolve('')
      ]);

      const eventData = {
        title_en: title,
        title_ta: titleTa,
        description_en: hideDescription ? `<!--HIDDEN-->${description}` : description,
        description_ta: descTa,
        event_date: eventDate, event_time: eventTime, location_en: location, location_ta: locTa,
        learn_more_url: learnMoreUrl, is_announcement: false,
        status: 'published', image_url: finalImageUrl
      };
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success('Event updated!');
      } else {
        await createEvent(eventData);
        toast.success('Event created!');
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEvent(deleteId);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  if (dbError) {
    return (
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Setup Required</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>
          The <b>events</b> table was not found. Please run the SQL script below in your Supabase SQL Editor.
        </p>
        <div style={{ position: 'relative' }}>
          <button onClick={copySql} style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy SQL'}
          </button>
          <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>{SQL_SCRIPT}</pre>
        </div>
        <button onClick={fetchEvents} style={{ marginTop: '1.5rem', background: '#2e7d32', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          I have run the script, try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#1a2940', margin: 0, marginBottom: '0.3rem' }}>Upcoming Events</h1>
            <p style={{ color: '#8898aa', margin: 0, fontSize: '0.9rem' }}>Create and manage events that appear on the Home page.</p>
            <div style={{ width: 36, height: 3, background: '#2e7d32', borderRadius: 2, marginTop: '0.5rem' }} />
          </div>
          <button
            id="add-event-btn"
            onClick={openModalForCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2e7d32', color: '#fff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(46,125,50,0.25)', transition: 'all 0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1b5e20'}
            onMouseLeave={e => e.currentTarget.style.background = '#2e7d32'}
          >
            <Plus size={18} /> Add New Event
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <StatCard icon={<Calendar size={24} />} iconBg="rgba(46,125,50,0.1)" iconColor="#2e7d32" label="Total Events" value={events.length} sub="All upcoming events" />
          <StatCard icon={<Clock size={24} />} iconBg="rgba(59,130,246,0.1)" iconColor="#3b82f6" label="This Month" value={thisMonth} sub="Events this month" />
          <StatCard icon={<MapPin size={24} />} iconBg="rgba(139,92,246,0.1)" iconColor="#8b5cf6" label="Locations" value={uniqueLocCount} sub="Unique locations" />
          <StatCard icon={<Users size={24} />} iconBg="rgba(245,158,11,0.1)" iconColor="#f59e0b" label="Next Event" value={nextEvent ? formatDate(nextEvent.event_date) : 'None'} sub={nextEvent ? (nextEvent.event_time || 'All Day') : ''} highlight={!!nextEvent} />
        </div>

        {/* Filter Bar */}
        <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '14px', padding: '1.1rem 1.25rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 220px', position: 'relative', minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input id="event-search" type="text" placeholder="Search events..." value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                style={{ width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.4rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#1e293b', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <select id="filter-location" value={filterLocation} onChange={e => { setFilterLocation(e.target.value); setCurrentPage(1); }}
                style={{ appearance: 'none', padding: '0.65rem 2.2rem 0.65rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: '150px', fontFamily: 'inherit' }}>
                <option value="">All Locations</option>
                {allLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value)}
                style={{ appearance: 'none', padding: '0.65rem 2.2rem 0.65rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                <option value="asc">Sort by: Date (Soonest)</option>
                <option value="desc">Sort by: Date (Latest)</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
              Loading events...
            </div>
          ) : paginated.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 0.5rem' }}>No events found</p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Try adjusting filters or add a new event.</p>
            </div>
          ) : (          <div className={adminStyles.responsiveTableContainer}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#fafbfc' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>EVENT</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>DATE &amp; TIME</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>LOCATION</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((event, idx) => (
                  <tr key={event.id}
                    style={{ borderBottom: idx < paginated.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title_en} style={{ width: 72, height: 50, objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 72, height: 50, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Calendar size={20} style={{ color: '#cbd5e1' }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a2940', fontSize: '0.95rem' }}>{event.title_en}</div>
                          {event.description_en && !event.description_en.startsWith('<!--HIDDEN-->') && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {event.description_en}
                            </div>
                          )}
                          {!event.description_en && event.description && !event.description.startsWith('<!--HIDDEN-->') && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1a2940', fontWeight: 500, fontSize: '0.9rem' }}>
                        <Calendar size={15} style={{ color: '#2e7d32', flexShrink: 0 }} />
                        {formatDate(event.event_date)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', paddingLeft: '1.2rem' }}>{event.event_time || 'All Day'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {(event.location_en || event.location) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.9rem' }}>
                          <MapPin size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          {event.location_en || event.location}
                        </div>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button id={`edit-event-${event.id}`} onClick={() => openModalForEdit(event)}
                          style={{ width: 34, height: 34, border: '1.5px solid #dbeafe', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                          title="Edit"><Edit2 size={15} /></button>
                        <button id={`delete-event-${event.id}`} onClick={() => setDeleteId(event.id)}
                          style={{ width: 34, height: 34, border: '1.5px solid #fecaca', background: '#fef2f2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                          title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    style={{ width: 32, height: 32, border: 'none', borderRadius: '8px', background: page === currentPage ? '#2e7d32' : 'transparent', color: page === currentPage ? '#fff' : '#475569', fontWeight: page === currentPage ? 700 : 400, cursor: 'pointer', fontSize: '0.9rem' }}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === totalPages ? '#cbd5e1' : '#475569' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'modalIn 0.25s ease', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="eventsModal">
            <style>{`
              @keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
              .eventsModal::-webkit-scrollbar { display: none; }
            `}</style>
            <div style={{ padding: '1.75rem 1.75rem 0', position: 'relative' }}>
              <button id="close-modal-btn" onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                <X size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(46,125,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={26} style={{ color: '#2e7d32' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1a2940' }}>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Fill in the details to {editingEvent ? 'update the' : 'create a new'} event.</p>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '1.25rem 0 0' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem 1.75rem' }}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={labelStyle}>Event Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input id="event-title-input" type="text" placeholder="e.g. Sunday Holy Communion Service" value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div>
                  <label style={labelStyle}>Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input id="event-date-input" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                      onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input id="event-time-input" type="text" placeholder="e.g. 06:00 PM" value={eventTime} onChange={e => setEventTime(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                      onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input id="event-location-input" type="text" placeholder="e.g. Main Auditorium" value={location} onChange={e => setLocation(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                      onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Learn More URL</label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <input id="event-url-input" type="url" placeholder="e.g. https://yourwebsite.com" value={learnMoreUrl} onChange={e => setLearnMoreUrl(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }}
                      onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea id="event-description-input" placeholder="Add a short description about the event..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  onFocus={e => e.target.style.borderColor = '#2e7d32'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                  <input type="checkbox" checked={!hideDescription} onChange={e => setHideDescription(!e.target.checked)} style={{ accentColor: '#2e7d32', width: 15, height: 15 }} />
                  Show this description on the Home Page
                </label>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Event Image / Poster</label>
                {imagePreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                    style={{ border: `2px dashed ${isDragging ? '#2e7d32' : '#c8d8c8'}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(46,125,50,0.05)' : 'rgba(46,125,50,0.02)', transition: 'all 0.2s' }}>
                    <Upload size={32} style={{ color: '#2e7d32', margin: '0 auto 0.75rem', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Drag &amp; drop an image here</p>
                    <p style={{ margin: '0.3rem 0 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>or</p>
                    <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      style={{ border: '1.5px solid #2e7d32', background: '#fff', color: '#2e7d32', padding: '0.5rem 1.4rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.15s', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#2e7d32'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2e7d32'; }}>
                      Choose File
                    </button>
                    <p style={{ margin: '0.6rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={e => handleImageChange(e.target.files?.[0])} style={{ display: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                <button type="button" id="cancel-event-btn" onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.85rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  Cancel
                </button>
                <button type="submit" id="save-event-btn" disabled={isSubmitting}
                  style={{ padding: '0.85rem', border: 'none', borderRadius: '10px', background: isSubmitting ? '#86a888' : '#2e7d32', color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s', boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(46,125,50,0.3)', fontFamily: 'inherit' }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#1b5e20'; }}
                  onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#2e7d32'; }}>
                  <Calendar size={17} />
                  {isSubmitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

