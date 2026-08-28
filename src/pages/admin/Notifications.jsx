import { useState, useEffect } from 'react';
import { getAllMessages, markAsRead, deleteMessage } from '../../services/messageService';
import { Search, ChevronDown, Calendar, Trash2, MailOpen, Filter, ShieldCheck, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function Notifications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Viewer Modal
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessages();
      setMessages(data || []);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (e) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(deleteId);
      setMessages(messages.filter(m => m.id !== deleteId));
      toast.success('Message deleted');
      if (selectedMessage && selectedMessage.id === deleteId) {
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error('Failed to delete message');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || m.form_type === filterType;
    const matchesStatus = filterStatus === 'All' || 
                         (filterStatus === 'New' && m.status === 'unread') ||
                         (filterStatus === 'Read' && m.status === 'read');
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;
  const paginatedMessages = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const getTypeColor = (type) => {
    if (type === 'Prayer Request') return { bg: '#fdf4ff', text: '#d946ef' };
    if (type === 'Fellowship') return { bg: '#f0fdf4', text: '#22c55e' };
    return { bg: '#eff6ff', text: '#3b82f6' }; // General Inquiry
  };

  return (
    <div style={{ padding: '0 0 3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Notifications</h1>
          <div style={{ width: '32px', height: '4px', background: '#22c55e', borderRadius: '2px', margin: '0.4rem 0' }}></div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>View and manage contact form submissions.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>{unreadCount} Unread Messages</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{unreadCount === 0 ? "You're all caught up!" : "You have new inquiries."}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search messages, names, emails..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', color: '#1e293b', outline: 'none', background: '#fff', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#22c55e'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
              style={{ appearance: 'none', padding: '0.75rem 2.5rem 0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: '160px', fontWeight: 500, fontFamily: 'inherit' }}>
              <option value="All">All Types</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Prayer Request">Prayer Request</option>
              <option value="Fellowship">Fellowship</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              style={{ appearance: 'none', padding: '0.75rem 2.5rem 0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none', minWidth: '140px', fontWeight: 500, fontFamily: 'inherit' }}>
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Read">Read</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sender</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type / Subject</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>Loading messages...</td>
              </tr>
            ) : paginatedMessages.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>No messages found matching your criteria.</td>
              </tr>
            ) : (
              paginatedMessages.map(msg => {
                const colors = getTypeColor(msg.form_type);
                return (
                  <tr key={msg.id} 
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === 'unread') handleMarkAsRead(msg.id);
                      }}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s', background: msg.status === 'unread' ? '#fff' : '#fafbfc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = msg.status === 'unread' ? '#fff' : '#fafbfc'}
                  >
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors.bg, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                          {msg.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{msg.full_name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', background: colors.bg, color: colors.text }}>
                        {msg.form_type}
                      </span>
                      <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>
                        {msg.subject || 'No Subject'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontWeight: 500 }}>
                        <Calendar size={16} style={{ color: '#94a3b8' }} />
                        {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem', marginLeft: '1.4rem' }}>
                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {msg.status === 'unread' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>
                          New
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7' }}>
                          Read
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(msg.id); }} title="Delete"
                        style={{ background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'inline-flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Showing {filteredMessages.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length} messages
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              &lt;
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ width: 36, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Stay Organized Footer Banner */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 1 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>Stay Organized</h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: '#15803d' }}>All your messages and inquiries are securely stored and easy to manage.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1, opacity: 0.9 }}>
          <div style={{ width: 80, height: 60, position: 'relative' }}>
            {/* Simple CSS Illustration for Mail */}
            <div style={{ position: 'absolute', bottom: 0, left: 10, width: 60, height: 40, background: '#4ade80', borderRadius: '4px' }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 10, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '25px solid #22c55e' }}></div>
            <div style={{ position: 'absolute', bottom: 15, left: 10, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderTop: '25px solid #86efac' }}></div>
            <div style={{ position: 'absolute', bottom: 20, right: -5, width: 24, height: 24, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>
        </div>
        {/* Decorative background shapes */}
        <div style={{ position: 'absolute', top: -20, right: 40, color: '#bbf7d0', opacity: 0.5 }}>✦</div>
        <div style={{ position: 'absolute', bottom: 10, right: 120, color: '#bbf7d0', opacity: 0.5 }}>✦</div>
      </div>

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedMessage(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Message Details</h3>
              <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: getTypeColor(selectedMessage.form_type).bg, color: getTypeColor(selectedMessage.form_type).text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                  {selectedMessage.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{selectedMessage.full_name}</h4>
                  <a href={`mailto:${selectedMessage.email}`} style={{ color: '#3b82f6', fontSize: '0.95rem', textDecoration: 'none', fontWeight: 500 }}>{selectedMessage.email}</a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Type</div>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{selectedMessage.form_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Date Received</div>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{new Date(selectedMessage.created_at).toLocaleString()}</div>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Phone</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{selectedMessage.phone}</div>
                  </div>
                )}
                {selectedMessage.place && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>Location</div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{selectedMessage.place}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedMessage.subject || 'Message'}
                </h5>
                <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteId(selectedMessage.id)} 
                   style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                   onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <Trash2 size={18} /> Delete
                </button>
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || selectedMessage.form_type}`} 
                   style={{ background: '#16a34a', color: '#fff', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                   onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                   onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                >
                  <Mail size={18} /> Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
