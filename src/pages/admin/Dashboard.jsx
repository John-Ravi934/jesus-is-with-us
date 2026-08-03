import { useState, useEffect } from 'react';
import { getRhemaWords } from '../../services/rhemaService';
import { FileText, Eye, Download, PlusCircle, Tags, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './AdminStyles.module.css';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, views: 0, downloads: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a full implementation, you'd fetch the total stats from `app_statistics` table
      // Here we just aggregate what we have from `rhema_words`
      const data = await getRhemaWords({ limit: 5 });
      setRecent(data);
      
      // We will pull the real stats if we had a statisticService, 
      // but for now let's just show the aggregated sum of recent for display.
      setStats({
        total: data.length, // Typically you'd do a count(*) query
        views: data.reduce((acc, curr) => acc + (curr.views || 0), 0),
        downloads: data.reduce((acc, curr) => acc + (curr.downloads || 0), 0)
      });
    } catch (e) {
      toast.error(e.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.dashboardGrid}>
        <div className={`${styles.statCard} ${styles.primary}`}>
          <div className={styles.statIcon}><FileText size={24} /></div>
          <div className={styles.statInfo}>
            <h3>{stats.total}+</h3>
            <p>Total Published</p>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statIcon}><Eye size={24} /></div>
          <div className={styles.statInfo}>
            <h3>{stats.views.toLocaleString()}</h3>
            <p>Total Views</p>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statIcon}><Download size={24} /></div>
          <div className={styles.statInfo}>
            <h3>{stats.downloads.toLocaleString()}</h3>
            <p>Total Downloads</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardLayout}>
        <div className={styles.dashboardMain}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <h3>Recent Rhema Words</h3>
              <Link to="/admin/rhema/library" className={styles.viewAllBtn}>View All</Link>
            </div>
            
            <div style={{overflowX: 'auto'}}>
              {loading ? <p style={{padding: '1rem'}}>Loading...</p> : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>Bible Reference</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td>
                          <img src={r.poster_url} alt="thumb" style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 6}} />
                        </td>
                        <td><strong>{r.bible_reference}</strong></td>
                        <td>{r.category}</td>
                        <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                        <td><span className={`${styles.statusBadge} ${styles[r.status]}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {recent.length === 0 && <tr><td colSpan="5">No data available in Supabase</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.dashboardSidebar}>
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <h3>Quick Actions</h3>
            </div>
            <div className={styles.actionList}>
              <Link to="/admin/rhema/add" className={styles.actionItem}>
                <div className={styles.actionIcon} style={{background: '#dcfce7', color: '#16a34a'}}><PlusCircle size={20} /></div>
                <div className={styles.actionText}>
                  <h4>Publish New Rhema</h4>
                  <p>Create a new daily word</p>
                </div>
              </Link>
              <Link to="/admin/categories" className={styles.actionItem}>
                <div className={styles.actionIcon} style={{background: '#fef9c3', color: '#ca8a04'}}><Tags size={20} /></div>
                <div className={styles.actionText}>
                  <h4>Manage Categories</h4>
                  <p>Add or edit tags</p>
                </div>
              </Link>
              <Link to="/admin/settings" className={styles.actionItem}>
                <div className={styles.actionIcon} style={{background: '#e0e7ff', color: '#4f46e5'}}><Settings size={20} /></div>
                <div className={styles.actionText}>
                  <h4>System Settings</h4>
                  <p>Configure platform</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
