import { useState, useEffect } from 'react';
import { getSubscribers, deleteSubscriber } from '../../services/subscriberService';
import { Copy, Trash2, Mail } from 'lucide-react';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await getSubscribers();
      setSubscribers(data || []);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this subscriber?")) {
      try {
        await deleteSubscriber(id);
        fetchSubscribers();
      } catch (err) {
        console.error("Failed to delete subscriber", err);
      }
    }
  };

  const handleCopyAll = () => {
    const emails = subscribers.map(sub => sub.email).join(', ');
    navigator.clipboard.writeText(emails);
    alert("Copied all emails to clipboard!");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>Subscribers</h1>
          <p style={{ color: '#64748b' }}>People who have subscribed to your newsletter via the footer.</p>
        </div>
        <button 
          onClick={handleCopyAll}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          disabled={subscribers.length === 0}
        >
          <Copy size={18} /> Copy All Emails
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Email Address</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Subscribed On</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569', width: '80px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading subscribers...</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  <Mail size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  No one has subscribed yet.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{sub.email}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                    {new Date(sub.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(sub.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove Subscriber"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
