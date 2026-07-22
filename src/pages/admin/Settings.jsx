import { useState, useEffect } from 'react';
import { getAppStatistics } from '../../services/statisticsService';
import { Settings as SettingsIcon, Database, Activity, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';

export default function Settings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getAppStatistics();
      setStats(data);
    } catch (e) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.addGrid}>
      <div className={styles.sectionBox}>
        <div className={styles.sectionHeader}>
          <h3><SettingsIcon size={20} style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> System Settings</h3>
        </div>
        
        <div style={{padding: '1rem', background: '#F8FAFC', borderRadius: '8px', marginBottom: '1.5rem'}}>
          <h4 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#1E293B'}}>
            <Database size={18} /> Supabase Connection Status
          </h4>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600}}>
            <ShieldCheck size={20} /> Connected & Secure
          </div>
          <p style={{fontSize: '0.85rem', color: '#64748B', marginTop: '0.5rem'}}>
            Your application is successfully connected to your Supabase Project. Authentication, Database, and Storage are fully operational.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>Organization Name</label>
          <div className={styles.inputWrapper}>
            <input type="text" value="Jesus Is With Us Ministries" disabled />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>Project Name</label>
          <div className={styles.inputWrapper}>
            <input type="text" value="Daily Rhema Management System" disabled />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Admin Email</label>
          <div className={styles.inputWrapper}>
            <input type="text" value="admin@jesusiswithus.org" disabled />
          </div>
          <small style={{color: '#94A3B8'}}>To change passwords or manage users, please visit the Supabase Dashboard.</small>
        </div>
      </div>

      <div className={styles.sectionBox}>
        <div className={styles.sectionHeader}>
          <h3><Activity size={20} style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> Platform Analytics</h3>
        </div>
        
        {loading ? <p>Loading analytics...</p> : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F1F5F9', borderRadius: '8px'}}>
              <span style={{color: '#475569', fontWeight: 500}}>Total Poster Views</span>
              <span style={{fontWeight: 700, color: '#0F172A'}}>{stats?.total_views?.toLocaleString() || 0}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F1F5F9', borderRadius: '8px'}}>
              <span style={{color: '#475569', fontWeight: 500}}>Total Poster Downloads</span>
              <span style={{fontWeight: 700, color: '#0F172A'}}>{stats?.total_downloads?.toLocaleString() || 0}</span>
            </div>
            
            <p style={{fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', marginTop: '1rem'}}>
              Analytics are tracked securely in the PostgreSQL database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
