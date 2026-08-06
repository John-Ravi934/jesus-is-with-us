import { useState, useEffect } from 'react';
import { getSubscribers, deleteSubscriber } from '../../services/subscriberService';
import { Copy, Trash2, Mail } from 'lucide-react';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

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

  const handleCopyAll = () => {
    const emails = subscribers.map(sub => sub.email).join(', ');
    navigator.clipboard.writeText(emails);
    toast.success("Copied all emails to clipboard!");
  };

  return (
    <>
    <div>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Subscribers</h2>
          <p>People who have subscribed to your newsletter via the footer.</p>
        </div>
        <button 
          onClick={handleCopyAll}
          className={`${styles.primaryBtn} ${styles.headerBtn}`}
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
                    {new Date(sub.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setDeleteId(sub.id)}
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
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Remove Subscriber"
      message="Are you sure you want to remove this subscriber?"
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
