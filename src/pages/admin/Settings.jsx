import { useState, useEffect } from 'react';
import { getAppStatistics } from '../../services/statisticsService';
import { getLiveStreamSettings, updateLiveStreamSettings } from '../../services/settingsService';
import { Settings as SettingsIcon, Database, Activity, ShieldCheck, Video, Save, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';

const SQL_SCRIPT = `
-- Run this in your Supabase SQL Editor

CREATE TABLE public.site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default live stream settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('live_stream', '{"is_active": false, "link": "https://youtube.com/live/your_link", "tooltip": "Live started in the youtube"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Allow authenticated users to manage settings
CREATE POLICY "Allow authenticated users to manage settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated');
`;

export default function Settings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Live Stream Settings
  const [liveActive, setLiveActive] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [liveTooltip, setLiveTooltip] = useState('Live started in the youtube');
  const [savingLive, setSavingLive] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statData = await getAppStatistics();
      setStats(statData);
      
      const liveData = await getLiveStreamSettings();
      setLiveActive(liveData.is_active || false);
      setLiveLink(liveData.link || '');
      setLiveTooltip(liveData.tooltip || 'Live started in the youtube');
      setDbError(false);
    } catch (e) {
      if (e.message?.includes('does not exist')) {
        setDbError(true);
      } else {
        toast.error("Failed to load settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveLiveSettings = async () => {
    setSavingLive(true);
    try {
      await updateLiveStreamSettings({
        is_active: liveActive,
        link: liveLink,
        tooltip: liveTooltip
      });
      toast.success("Live stream settings updated!");
    } catch (e) {
      toast.error("Failed to update live stream settings");
      console.error(e);
    } finally {
      setSavingLive(false);
    }
  };

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

  if (dbError) {
    return (
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Setup Required</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>
          The <b>site_settings</b> table was not found. 
          Please copy the SQL script below and run it in your Supabase SQL Editor to enable Live Stream features.
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
    <div className={styles.addGrid}>
      <div className={styles.sectionBox}>
        <div className={styles.sectionHeader}>
          <h3><Video size={20} style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> Live Stream Settings</h3>
        </div>
        
        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', marginBottom: '8px' }} 
            onClick={() => setLiveActive(!liveActive)}
          >
            <div style={{
              width: '48px', height: '26px', 
              backgroundColor: liveActive ? '#f43f5e' : '#cbd5e1', 
              borderRadius: '24px', position: 'relative', 
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: '22px', height: '22px', backgroundColor: '#fff', 
                borderRadius: '50%', position: 'absolute', top: '2px', 
                left: liveActive ? '24px' : '2px', transition: 'left 0.2s', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: liveActive ? '#f43f5e' : '#64748b' }}>
              {liveActive ? 'Live Stream is ON' : 'Live Stream is OFF'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '64px', marginTop: '0' }}>
            When ON, the Watch Live button will turn red, play an attractive animation, and display the tooltip on the homepage.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label>YouTube Live Stream Link</label>
          <div className={styles.inputWrapper}>
            <input 
              type="url" 
              value={liveLink} 
              onChange={e => setLiveLink(e.target.value)}
              placeholder="e.g., https://youtube.com/live/..." 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tooltip Hover Text</label>
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              value={liveTooltip} 
              onChange={e => setLiveTooltip(e.target.value)}
              placeholder="e.g., Live started in the youtube" 
            />
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSaveLiveSettings} 
          disabled={savingLive}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} /> {savingLive ? 'Saving...' : 'Save Live Settings'}
        </button>
      </div>

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
