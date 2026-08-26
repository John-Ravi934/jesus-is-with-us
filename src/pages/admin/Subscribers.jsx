import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { getSubscribers, deleteSubscriber, updateSubscriberStatus } from '../../services/subscriberService';
import { Copy, Trash2, Mail, Users, Calendar, MoreHorizontal, Search, Clock, FileWarning, BarChart2, Activity, CheckCircle, Navigation, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

// Sparkline Mock Data
const subscriberSparkline = [ { value: 10 }, { value: 15 }, { value: 8 }, { value: 20 }, { value: 18 }, { value: 25 }, { value: 30 } ];
const newMonthSparkline = [ { value: 2 }, { value: 5 }, { value: 3 }, { value: 8 }, { value: 6 }, { value: 10 }, { value: 15 } ];
const emailsSentSparkline = [ { value: 100 }, { value: 50 }, { value: 200 }, { value: 150 }, { value: 300 }, { value: 250 }, { value: 400 } ];


export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dbError, setDbError] = useState(false);
  
  // Analytics State
  const [emails, setEmails] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [usage, setUsage] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // New Filter & Pagination State
  const [chartFilter, setChartFilter] = useState('Last 7 Days');
  const [emailFilter, setEmailFilter] = useState('All Time');
  const [emailCurrentPage, setEmailCurrentPage] = useState(1);
  const [confirmStatusId, setConfirmStatusId] = useState(null);
  const [confirmStatusValue, setConfirmStatusValue] = useState(null);
  const emailsPerPage = 15;

  const itemsPerPage = 10;

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSubscribers();
    fetchAnalytics();

    const channel = supabase
      .channel('subscribers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscribers' }, (payload) => {
        fetchSubscribersQuietly();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubscribersQuietly = async () => {
    try {
      const data = await getSubscribers();
      setSubscribers(data || []);
      setDbError(false);
    } catch (err) {
      if (err.message && err.message.includes('does not exist')) {
        setDbError(true);
      }
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await getSubscribers();
      setSubscribers(data || []);
      setDbError(false);
    } catch (err) {
      if (err.message && err.message.includes('does not exist')) {
        setDbError(true);
      } else {
        toast.error("Failed to load subscribers");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const { data, error } = await supabase.functions.invoke('resend-analytics', { method: 'GET' });
      if (error) throw error;
      if (data && data.success) {
        setEmails(data.emails);
        setMetrics(data.metrics);
        setUsage(data.usage || { transactional: { used: data.metrics.totalSent, limit: 3000 }, marketing: { used: 0, limit: 100 }});
        setGraphData(data.graphData);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return { bg: '#dcfce7', text: '#166534' };
      case 'opened': return { bg: '#dbeafe', text: '#1e40af' };
      case 'clicked': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'bounced': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubscriber(deleteId);
      toast.success("Deleted successfully");
      fetchSubscribers();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
      console.error("Failed to delete subscriber", err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setActiveDropdown(null);
      await updateSubscriberStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch(err) {
      console.error("Status update error:", err);
      // Supabase PGRST204 means column not found in schema cache
      if (err.code === 'PGRST204' || (err.message && err.message.includes('status'))) {
        setDbError(true);
      } else {
        // Fallback to showing db error just in case they haven't added the column yet
        setDbError(true); 
        toast.error("Failed to update status: " + (err.message || 'Unknown error'));
      }
      fetchSubscribers(); // Revert
    }
  };

  const handleCopyAll = () => {
    const emails = subscribers.map(sub => sub.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success("Copied all emails to clipboard!");
  };

  const copySql = () => {
    const sql = `ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';\nNOTIFY pgrst, 'reload schema';`;
    navigator.clipboard.writeText(sql);
    toast.success("SQL Copied to clipboard!");
  };

  // Stats
  const thisMonthCount = subscribers.filter(s => {
    const d = new Date(s.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  
  const lastAdded = subscribers.length > 0 ? new Date(subscribers[0].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  // Filter and paginate
  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All Time' || (s.status || 'Active') === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const paginatedSubscribers = filteredSubscribers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  // Filter Emails
  const filteredRecentEmails = emails.filter(email => {
    if (emailFilter === 'All Time') return true;
    
    const emailDate = new Date(email.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - emailDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (emailFilter === '7days') return diffDays <= 7;
    if (emailFilter === '15days') return diffDays <= 15;
    if (emailFilter === '30days') return diffDays <= 30;
    if (emailFilter === '3m') return diffDays <= 90;
    if (emailFilter === '6m') return diffDays <= 180;
    if (emailFilter === '1 year') return diffDays <= 365;
    return true;
  });

  const paginatedEmails = filteredRecentEmails.slice((emailCurrentPage - 1) * emailsPerPage, emailCurrentPage * emailsPerPage);
  const totalEmailPages = Math.ceil(filteredRecentEmails.length / emailsPerPage);

  // Filter Graph Data
  const generateGraphData = () => {
    let daysToShow = 7;
    if (chartFilter === 'Last 30 Days') daysToShow = 30;
    if (chartFilter === 'Last 3 Months') daysToShow = 90;
    if (chartFilter === 'Last 6 Months') daysToShow = 180;
    if (chartFilter === 'Last 1 Year') daysToShow = 365;

    const data = [];
    const now = new Date();
    
    // Create an array of the last N days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      data.push({ name: dayLabel, delivered: 0, opened: 0, clicked: 0 });
    }

    // Fill in the data from emails
    emails.forEach(email => {
      const emailDate = new Date(email.created_at);
      const diffTime = Math.abs(now - emailDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= daysToShow) {
        const dayLabel = emailDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const dataPoint = data.find(d => d.name === dayLabel);
        if (dataPoint) {
          const status = email.last_event || 'sent';
          if (status === 'delivered' || status === 'opened' || status === 'clicked') dataPoint.delivered++;
          if (status === 'opened' || status === 'clicked') dataPoint.opened++;
          if (status === 'clicked') dataPoint.clicked++;
        }
      }
    });

    return data;
  };
  const filteredGraphData = generateGraphData();

  if (dbError) {
    return (
      <div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '2rem', borderRadius: '12px', color: '#991b1b', maxWidth: '800px', margin: '2rem auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FileWarning size={32} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Database Schema Update Required</h2>
          </div>
          <p style={{ marginBottom: '1.5rem' }}>We've added a new 'status' column to manage subscriber states (Active/Deactive). Please run this SQL snippet in your Supabase SQL Editor:</p>
          <div style={{ background: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: '8px', position: 'relative', marginBottom: '1.5rem' }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
NOTIFY pgrst, 'reload schema';
            </pre>
            <button onClick={copySql} style={{ position: 'absolute', top: '10px', right: '10px', background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Copy SQL
            </button>
          </div>
          <button onClick={fetchSubscribers} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            I've run the SQL, Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Email & Subscribers</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Manage your subscribers and track email performance.</p>
        </div>
        <button 
          onClick={handleCopyAll}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', color: '#15a349', padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #15a349', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          disabled={subscribers.length === 0}
        >
          <Copy size={16} /> Copy All Emails
        </button>
      </div>

      {/* Stats Grid (4 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Total Subscribers */}
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem 1.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15a349' }}>
              <Users size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Subscribers</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.25rem' }}>{subscribers.length}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>All time</div>
          <div style={{ width: 'calc(100% + 3rem)', height: '40px', marginTop: 'auto', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriberSparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#22c55e" fillOpacity={1} fill="url(#colorSub)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New This Month */}
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem 1.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Calendar size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>New This Month</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.25rem' }}>{thisMonthCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>New subscribers</div>
          <div style={{ width: 'calc(100% + 3rem)', height: '40px', marginTop: 'auto', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={newMonthSparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emails Sent */}
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem 1.5rem 0 1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Mail size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Emails Sent</div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.25rem' }}>{metrics?.totalSent || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem' }}>All time</div>
          <div style={{ width: 'calc(100% + 3rem)', height: '40px', marginTop: 'auto', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emailsSentSparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={4}>
                <Bar dataKey="value" fill="#d8b4fe" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Last Added */}
        <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Clock size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Last Added</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: '0.25rem', marginTop: 'auto' }}>{lastAdded}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Most recent</div>
        </div>

      </div>

      {/* Subscribers Table Section */}
      <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Subscribers</h2>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search subscribers..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Calendar size={14} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                style={{ padding: '0.5rem 2rem 0.5rem 2.2rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a', appearance: 'none', background: 'white' }}
              >
                <option value="All Time">All Time</option>
                <option value="Active">Active</option>
                <option value="Deactive">Deactive</option>
              </select>
              <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>SUBSCRIBER</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>EMAIL ADDRESS</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>SUBSCRIBED ON</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading subscribers...</td>
              </tr>
            ) : paginatedSubscribers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                  <Mail size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  No subscribers found.
                </td>
              </tr>
            ) : (
              paginatedSubscribers.map((sub) => {
                const initial = sub.email.charAt(0).toUpperCase();
                const status = sub.status || 'Active';
                return (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                          {initial}
                        </div>
                        <strong style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{sub.email}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', color: '#475569', fontSize: '0.9rem' }}>
                      {sub.email}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(sub.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.8rem', borderRadius: '12px', background: status === 'Active' ? '#dcfce7' : '#fee2e2', color: status === 'Active' ? '#166534' : '#991b1b', fontSize: '0.75rem', fontWeight: 600 }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === sub.id ? null : sub.id)}
                        style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#94a3b8', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {activeDropdown === sub.id && (
                        <div ref={dropdownRef} style={{ position: 'absolute', top: '3.5rem', right: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10, width: '120px', overflow: 'hidden' }}>
                          <button onClick={() => { setConfirmStatusId(sub.id); setConfirmStatusValue('Active'); setActiveDropdown(null); }} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}>
                            Active
                          </button>
                          <button onClick={() => { setConfirmStatusId(sub.id); setConfirmStatusValue('Deactive'); setActiveDropdown(null); }} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a' }}>
                            Deactive
                          </button>
                          <button onClick={() => { setActiveDropdown(null); setDeleteId(sub.id); }} style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444' }}>
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {currentPage} of {totalPages || 1}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#94a3b8' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button style={{ padding: '0.4rem 0.8rem', border: 'none', background: '#15a349', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              {currentPage}
            </button>
            <button 
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', color: '#94a3b8' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Email Analytics Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>Email Metrics & Analytics</h2>
        
        {analyticsLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading analytics...</div>
        ) : (
          <>
            {/* Top Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Emails Sent</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.4rem' }}>{metrics?.totalSent || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>All time</div>
                </div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15a349' }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Deliverability Rate</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.4rem' }}>{metrics?.deliverabilityRate || 0}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#22c55e' }}>Excellent</div>
                </div>
              </div>
            </div>

            {/* Charts & Usage Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Graph Section */}
              <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Performance Overview</h3>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={chartFilter}
                      onChange={e => setChartFilter(e.target.value)}
                      style={{ padding: '0.4rem 2rem 0.4rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a', appearance: 'none', background: 'white' }}
                    >
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="Last 30 Days">Last 30 Days</option>
                      <option value="Last 3 Months">Last 3 Months</option>
                      <option value="Last 6 Months">Last 6 Months</option>
                      <option value="Last 1 Year">Last 1 Year</option>
                    </select>
                    <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                {filteredGraphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredGraphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#0f172a' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }}/>
                      <Line type="monotone" dataKey="clicked" name="Clicked" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#22c55e" strokeWidth={2} dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="opened" name="Opened" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
                    No graph data available for the selected period.
                  </div>
                )}
              </div>

              {/* Usage Stats Section */}
              <div style={{ background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: '400px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem', marginTop: 0 }}>Usage Limits</h3>
                
                {usage && (
                  <>
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Monthly limit</span>
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Free</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{usage.transactional.used.toLocaleString()}</span> <span style={{ color: '#94a3b8' }}>/ {usage.transactional.limit.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>Sending</span>
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{usage.transactional.used.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>Receiving</span>
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>0</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', position: 'relative' }}>
                        <div style={{ width: `${Math.max(Math.min((usage.transactional.used / usage.transactional.limit) * 100, 100), 2)}%`, height: '100%', background: '#3b82f6', borderRadius: '4px', position: 'absolute' }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Daily limit</span>
                        <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Free</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{usage.marketing.used.toLocaleString()}</span> <span style={{ color: '#94a3b8' }}>/ {usage.marketing.limit.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>Sending</span>
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>{usage.marketing.used.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>Receiving</span>
                        <span style={{ color: '#0f172a', fontWeight: 500 }}>0</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', position: 'relative' }}>
                        <div style={{ width: `${Math.max(Math.min((usage.marketing.used / usage.marketing.limit) * 100, 100), 2)}%`, height: '100%', background: '#10b981', borderRadius: '4px', position: 'absolute' }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Recent Emails Table */}
            <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Emails Sent</h3>
                
                <div style={{ position: 'relative' }}>
                  <select
                    value={emailFilter}
                    onChange={e => { setEmailFilter(e.target.value); setEmailCurrentPage(1); }}
                    style={{ padding: '0.5rem 2rem 0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#0f172a', appearance: 'none', background: 'white' }}
                  >
                    <option value="7days">7 days</option>
                    <option value="15days">15 days</option>
                    <option value="30days">30 days</option>
                    <option value="3m">3 months</option>
                    <option value="6m">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="All Time">All Time</option>
                  </select>
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TO</th>
                      <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>STATUS</th>
                      <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>SUBJECT</th>
                      <th style={{ padding: '1.2rem 1.5rem', fontWeight: 600, color: '#475569', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'right' }}>SENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmails.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No recent emails found.</td>
                      </tr>
                    ) : (
                      paginatedEmails.map((email) => {
                        const status = email.last_event || 'sent';
                        let statusColor = '#94a3b8';
                        let statusBg = '#f1f5f9';
                        
                        if (status === 'delivered') { statusColor = '#16a34a'; statusBg = '#dcfce7'; }
                        if (status === 'opened') { statusColor = '#2563eb'; statusBg = '#dbeafe'; }
                        if (status === 'clicked') { statusColor = '#9333ea'; statusBg = '#f3e8ff'; }
                        if (status === 'bounced' || status === 'complained') { statusColor = '#dc2626'; statusBg = '#fee2e2'; }
                        
                        return (
                          <tr key={email.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Mail size={14} color="#94a3b8" /> {email.to[0]}
                            </td>
                            <td style={{ padding: '1.2rem 1.5rem' }}>
                              <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '12px', background: statusBg, color: statusColor, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                {status}
                              </span>
                            </td>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#475569' }}>
                              {email.subject}
                            </td>
                            <td style={{ padding: '1.2rem 1.5rem', color: '#64748b', textAlign: 'right' }}>
                              {new Date(email.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Emails Pagination */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {emailCurrentPage} of {totalEmailPages || 1}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    disabled={emailCurrentPage === 1}
                    onClick={() => setEmailCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: emailCurrentPage === 1 ? 'not-allowed' : 'pointer', color: '#94a3b8' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button style={{ padding: '0.4rem 0.8rem', border: 'none', background: '#15a349', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                    {emailCurrentPage}
                  </button>
                  <button 
                    disabled={emailCurrentPage >= totalEmailPages || totalEmailPages === 0}
                    onClick={() => setEmailCurrentPage(prev => Math.min(prev + 1, totalEmailPages))}
                    style={{ padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: emailCurrentPage >= totalEmailPages || totalEmailPages === 0 ? 'not-allowed' : 'pointer', color: '#94a3b8' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Subscriber"
      message="Are you sure you want to permanently delete this subscriber?"
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    <ConfirmModal 
      isOpen={!!confirmStatusId}
      title={`Confirm Status Change`}
      message={`Are you sure you want to change the status to ${confirmStatusValue}?`}
      confirmText={confirmStatusValue}
      confirmColor={confirmStatusValue === 'Active' ? '#15a349' : '#ef4444'}
      iconBg={confirmStatusValue === 'Active' ? '#dcfce7' : '#fee2e2'}
      iconColor={confirmStatusValue === 'Active' ? '#15a349' : '#ef4444'}
      onConfirm={() => {
        handleStatusChange(confirmStatusId, confirmStatusValue);
        setConfirmStatusId(null);
        setConfirmStatusValue(null);
      }}
      onCancel={() => {
        setConfirmStatusId(null);
        setConfirmStatusValue(null);
      }}
    />
    </>
  );
}
