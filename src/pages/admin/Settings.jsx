import { useState, useEffect, useRef } from 'react';
import { getAppStatistics, getStorageStats } from '../../services/statisticsService';
import { 
  getLiveStreamSettings, updateLiveStreamSettings, 
  getDonationSettings, updateDonationSettings,
  getEmailSettings, updateEmailSettings,
  getQuickAccessSettings, updateQuickAccessSettings
} from '../../services/settingsService';
import { uploadImage } from '../../services/storageService';
import {
  Settings as SettingsIcon, Database, Activity, ShieldCheck, Video, Save, Check, Copy,
  CreditCard, Upload, Link as LinkIcon, MessageCircle, Eye, Download, HardDrive,
  Building2, User, Hash, GitBranch, MapPin, Mail, FolderOpen, Lock, MoreVertical,
  Plus, PlusCircle, Trash2, Edit2, X, Clipboard, Calendar, Radio, HelpCircle, Monitor, Shield,
  Wand2, Cloud, ChevronUp, ChevronDown, CheckCircle2, Info, Lightbulb, Play, BarChart2,
  Users, Smartphone, IndianRupee, Phone, Globe, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

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

-- Insert default donation settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('donation_settings', '{"upiId": "jesusiswithus@upi", "upiNumber": "98765 43210", "qrCodeUrl": "", "bankName": "State Bank of India", "accountName": "Jesus Is With Us Ministries", "accountNumber": "123456789012", "ifscCode": "SBIN0001234", "branch": "Salem Main Branch"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create contact messages table for notifications
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  place TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage contact_messages" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');
`;

// ─── Shared Inline Styles ────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', marginBottom: '0.4rem',
  fontSize: '0.875rem', fontWeight: 600, color: '#334155'
};

const inputStyle = {
  width: '100%', padding: '0.75rem 0.9rem',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '0.9rem', color: '#1e293b', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
  transition: 'border-color 0.15s', fontFamily: 'inherit'
};

const cardStyle = {
  background: '#fff', border: '1px solid #e8edf2', borderRadius: '14px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden'
};

const greenBtnStyle = {
  width: '100%', padding: '0.9rem 1.5rem', border: 'none', borderRadius: '10px',
  background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: '#fff',
  fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  boxShadow: '0 4px 12px rgba(46,125,50,0.3)', transition: 'all 0.2s', fontFamily: 'inherit'
};

const outlineBtnStyle = {
  padding: '0.55rem 1rem', border: '1.5px solid #2e7d32', borderRadius: '8px',
  background: '#fff', color: '#2e7d32', fontWeight: 600, fontSize: '0.85rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
  transition: 'all 0.15s', fontFamily: 'inherit'
};

// ─── Mini Sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ color = '#2e7d32' }) {
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" style={{ opacity: 0.6 }}>
      <path d="M0 35 Q10 30 20 28 T40 20 T60 25 T80 15 T100 10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M0 35 Q10 30 20 28 T40 20 T60 25 T80 15 T100 10 V40 H0Z" fill={`${color}15`} />
    </svg>
  );
}

// ─── Decorative Floating Elements ────────────────────────────────────────────
function FloatingDecorations() {
  return (
    <>
      <span style={{ position: 'absolute', top: '15%', left: '-30px', fontSize: '1.2rem', color: '#2e7d32', opacity: 0.4, fontWeight: 700 }}>+</span>
      <span style={{ position: 'absolute', bottom: '20%', left: '-25px', fontSize: '0.9rem', color: '#2e7d32', opacity: 0.3 }}>✦</span>
      <span style={{ position: 'absolute', top: '10%', right: '-25px', fontSize: '0.9rem', color: '#2e7d32', opacity: 0.3 }}>✦</span>
      <span style={{ position: 'absolute', bottom: '30%', right: '-30px', fontSize: '1.2rem', color: '#2e7d32', opacity: 0.4, fontWeight: 700 }}>+</span>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Settings() {
  const [stats, setStats] = useState(null);
  const [storageBytes, setStorageBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  // Live Stream Settings
  const [liveActive, setLiveActive] = useState(false);
  const [liveShowInHero, setLiveShowInHero] = useState(false);
  const [liveLink, setLiveLink] = useState('');
  const [liveTooltip, setLiveTooltip] = useState('Live started in the youtube');
  const [savingLive, setSavingLive] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [copied, setCopied] = useState(false);

  const [donationSettings, setDonationSettings] = useState({
    upiSections: [
      { upiId: '', upiNumber: '', qrCodeUrl: '' }
    ],
    bankTransferSections: [
      { 
        bankDetails: [
          { label: 'Bank Name', value: '' },
          { label: 'Account Name', value: '' },
          { label: 'Account Number', value: '' },
          { label: 'IFSC Code', value: '' },
          { label: 'Branch Name', value: '' }
        ] 
      }
    ]
  });
  const [savingDonation, setSavingDonation] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const fileInputRef = useRef(null);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('live');

  // Deletion Modal State
  const [deleteContext, setDeleteContext] = useState(null);

  // UPI card menu state
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Bank edit state
  const [editingBankIndex, setEditingBankIndex] = useState(null);
  const [showUpiErrors, setShowUpiErrors] = useState(false);

  // Analytics date filter
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [statsLoading, setStatsLoading] = useState(false);

  // Email Integration Settings
  const [emailSettings, setEmailSettings] = useState({
    resendApiKey: '',
    fromEmail: 'noreply@yourdomain.com',
    replyToEmail: 'contact@yourdomain.com'
  });
  const [savingEmail, setSavingEmail] = useState(false);

  // Quick Access Settings
  const [quickAccessButtons, setQuickAccessButtons] = useState([]);
  const [savingQuickAccess, setSavingQuickAccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuIndex(null);
    if (openMenuIndex !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [openMenuIndex]);

  const loadData = async () => {
    try {
      const statData = await getAppStatistics();
      setStats(statData);
      
      const storageUsed = await getStorageStats();
      setStorageBytes(storageUsed);
      
      const liveData = await getLiveStreamSettings();
      setLiveActive(liveData.is_active || false);
      setLiveShowInHero(liveData.show_in_hero || false);
      setLiveLink(liveData.link || '');
      setLiveTooltip(liveData.tooltip || 'Live started in the youtube');
      
      const donationData = await getDonationSettings();
      if (donationData) {
        let newData = { ...donationData };
        // Migrate legacy flat structure
        if (!newData.upiSections) {
          newData.upiSections = [{
            upiId: newData.upiId || '',
            upiNumber: newData.upiNumber || '',
            qrCodeUrl: newData.qrCodeUrl || ''
          }];
          delete newData.upiId; delete newData.upiNumber; delete newData.qrCodeUrl;
        }
        if (!newData.bankTransferSections) {
          if (newData.bankDetails) {
            newData.bankTransferSections = [{ bankDetails: newData.bankDetails }];
            delete newData.bankDetails;
          } else if (newData.bankName) {
            newData.bankTransferSections = [{
              bankDetails: [
                { label: 'Bank Name', value: newData.bankName },
                { label: 'Account Name', value: newData.accountName || '' },
                { label: 'Account Number', value: newData.accountNumber || '' },
                { label: 'IFSC Code', value: newData.ifscCode || '' },
                { label: 'Branch Name', value: newData.branch || '' }
              ]
            }];
            delete newData.bankName; delete newData.accountName; 
            delete newData.accountNumber; delete newData.ifscCode; delete newData.branch;
          } else {
            newData.bankTransferSections = [{ bankDetails: [
              { label: 'Bank Name', value: '' }, { label: 'Account Name', value: '' },
              { label: 'Account Number', value: '' }, { label: 'IFSC Code', value: '' },
              { label: 'Branch Name', value: '' }
            ]}];
          }
        }
        setDonationSettings(newData);
      }

      const mailData = await getEmailSettings();
      if (mailData) {
        setEmailSettings(mailData);
      }

      const quickAccessData = await getQuickAccessSettings();
      if (quickAccessData) {
        setQuickAccessButtons(quickAccessData);
      }

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSaveLiveSettings = async () => {
    setSavingLive(true);
    try {
      await updateLiveStreamSettings({
        is_active: liveActive,
        show_in_hero: liveShowInHero,
        link: liveLink,
        tooltip: liveTooltip
      });
      toast.success('Live settings saved!');
    } catch (e) {
      toast.error('Failed to save live settings.');
    } finally {
      setSavingLive(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    setSavingEmail(true);
    try {
      await updateEmailSettings(emailSettings);
      toast.success('Email settings saved!');
    } catch (e) {
      toast.error('Failed to save email settings.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveDonationSettings = async () => {
    // Validate all UPI sections have at least UPI ID filled
    let hasError = false;
    for (let i = 0; i < donationSettings.upiSections.length; i++) {
      const sec = donationSettings.upiSections[i];
      if (!sec.upiId?.trim() || !sec.upiNumber?.trim()) {
        hasError = true;
        toast.error(`Please fill in the details for UPI Account ${i + 1}.`);
      }
    }
    if (hasError) {
      setShowUpiErrors(true);
      return;
    }
    setShowUpiErrors(false);
    setSavingDonation(true);
    try {
      await updateDonationSettings(donationSettings);
      toast.success("Donation settings updated!");
    } catch (e) {
      toast.error("Failed to update donation settings");
      console.error(e);
    } finally {
      setSavingDonation(false);
    }
  };

  const handleUpiDetailChange = (index, key, value) => {
    setShowUpiErrors(false);
    const newUpiSections = [...donationSettings.upiSections];
    newUpiSections[index][key] = value;
    setDonationSettings({ ...donationSettings, upiSections: newUpiSections });
  };

  const addUpiSection = () => {
    // Validate existing UPI sections before adding a new one
    const lastSection = donationSettings.upiSections[donationSettings.upiSections.length - 1];
    if (lastSection && (!lastSection.upiId?.trim() || !lastSection.upiNumber?.trim())) {
      setShowUpiErrors(true);
      toast.error('Please fill in the details for the current account before adding a new one.');
      return;
    }
    setShowUpiErrors(false);
    setDonationSettings({ 
      ...donationSettings, 
      upiSections: [...donationSettings.upiSections, { upiId: '', upiNumber: '', qrCodeUrl: '' }] 
    });
  };

  const requestRemoveUpiSection = (index) => {
    setDeleteContext({ type: 'upi', index });
  };

  const executeRemoveUpiSection = (index) => {
    const newUpiSections = [...donationSettings.upiSections];
    newUpiSections.splice(index, 1);
    setDonationSettings({ ...donationSettings, upiSections: newUpiSections });
  };

  const handleBankDetailChange = (sectionIndex, fieldIndex, key, value) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections[sectionIndex].bankDetails[fieldIndex][key] = value;
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const addBankField = (sectionIndex) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections[sectionIndex].bankDetails.push({ label: '', value: '' });
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const removeBankField = (sectionIndex, fieldIndex) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections[sectionIndex].bankDetails.splice(fieldIndex, 1);
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const addBankSection = () => {
    const newIndex = donationSettings.bankTransferSections.length;
    setDonationSettings({
      ...donationSettings,
      bankTransferSections: [...donationSettings.bankTransferSections, {
        title: '',
        bankDetails: [
          { label: 'Bank Name', value: '' },
          { label: 'Account Name', value: '' },
          { label: 'Account Number', value: '' },
          { label: 'IFSC Code', value: '' },
          { label: 'Branch Name', value: '' }
        ]
      }]
    });
    setEditingBankIndex(newIndex);
  };

  const handleBankTitleChange = (sectionIndex, newTitle) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections[sectionIndex].title = newTitle;
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const requestRemoveBankSection = (sectionIndex) => {
    setDeleteContext({ type: 'bank', index: sectionIndex });
  };

  const executeRemoveBankSection = (sectionIndex) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections.splice(sectionIndex, 1);
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const handleQrUpload = async (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    setUploadingQr(true);
    try {
      const publicUrl = await uploadImage(file, 'qrcodes');
      handleUpiDetailChange(index, 'qrCodeUrl', publicUrl);
      toast.success("QR Code uploaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to upload QR code");
    } finally {
      setUploadingQr(false);
    }
  };

  const confirmDelete = () => {
    if (deleteContext?.type === 'upi') {
      executeRemoveUpiSection(deleteContext.index);
    } else if (deleteContext?.type === 'bank') {
      executeRemoveBankSection(deleteContext.index);
    } else if (deleteContext?.type === 'quick_access') {
      executeRemoveQuickAccess(deleteContext.index);
    }
    setDeleteContext(null);
  };

  const executeRemoveQuickAccess = (index) => {
    const newBtns = quickAccessButtons.filter((_, i) => i !== index);
    setQuickAccessButtons(newBtns);
  };

  // Derived storage values
  const totalCapacityBytes = 2 * 1024 * 1024 * 1024; // 2GB
  const usedPercent = Math.round(((storageBytes || 0) / totalCapacityBytes) * 100);
  const freePercent = 100 - usedPercent;
  const usedGB = ((storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2);
  const freeGB = ((totalCapacityBytes - (storageBytes || 0)) / (1024 * 1024 * 1024)).toFixed(2);

  // Bank field icon mapper
  const getBankFieldIcon = (label) => {
    const l = label?.toLowerCase() || '';
    if (l.includes('bank name')) return <Building2 size={16} style={{ color: '#64748b' }} />;
    if (l.includes('account name')) return <User size={16} style={{ color: '#64748b' }} />;
    if (l.includes('account number') || l.includes('account no')) return <Hash size={16} style={{ color: '#64748b' }} />;
    if (l.includes('ifsc')) return <GitBranch size={16} style={{ color: '#64748b' }} />;
    if (l.includes('branch')) return <MapPin size={16} style={{ color: '#64748b' }} />;
    return <Database size={16} style={{ color: '#64748b' }} />;
  };

  // ─── DB Error Screen ─────────────────────────────────────────────────────────
  if (dbError) {
    return (
      <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #fecaca' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Setup Required</h2>
        <p style={{ marginBottom: '1rem', color: '#475569' }}>
          The <b>site_settings</b> table was not found. 
          Please copy the SQL script below and run it in your Supabase SQL Editor.
        </p>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={copySql} 
            style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy SQL'}
          </button>
          <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
            {SQL_SCRIPT}
          </pre>
        </div>
        <button onClick={loadData} style={{ ...greenBtnStyle, marginTop: '1.5rem', width: 'auto', padding: '0.8rem 1.5rem' }}>
          I have run the script, try again
        </button>
      </div>
    );
  }

  // ─── Tab Button Component ──────────────────────────────────────────────────
  const TabBtn = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '0.6rem 0.2rem', background: 'none', border: 'none',
        borderBottom: activeTab === id ? '2.5px solid #2e7d32' : '2.5px solid transparent',
        color: activeTab === id ? '#15803d' : '#64748b',
        fontWeight: activeTab === id ? 700 : 500,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
        fontSize: '0.9rem', fontFamily: 'inherit'
      }}
    >
      {icon} {label}
    </button>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '1050px', margin: '0 auto', width: '100%' }}>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e8edf2', marginBottom: '2.5rem', overflowX: 'auto', gap: '2rem', scrollbarWidth: 'none', paddingBottom: '0.1rem' }}>
        <TabBtn id="live" icon={<Video size={17} />} label="Live Stream" />
        <TabBtn id="donation" icon={<CreditCard size={17} />} label="Donation Page" />
        <TabBtn id="analytics" icon={<BarChart2 size={17} />} label="Analytics" />
        <TabBtn id="quick_access" icon={<PlusCircle size={17} />} label="Quick Access" />
        <TabBtn id="system" icon={<SettingsIcon size={17} />} label="System" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
           LIVE STREAM TAB
           ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'live' && (
        <div>
          {/* Section Title */}
          <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2940', margin: 0 }}>Live Stream Settings</h2>
              <p style={{ color: '#8898aa', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Manage your YouTube live stream and customize how it appears on your homepage.</p>
            </div>
            <button style={{ ...outlineBtnStyle, padding: '0.5rem 1rem', borderRadius: '20px', color: '#475569', fontSize: '0.85rem' }}>
              <HelpCircle size={15} /> Need Help?
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            {/* Left: Settings Form */}
            <div style={{ ...cardStyle, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Stream Configuration */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Radio size={20} style={{ color: '#15803d' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1a2940' }}>Stream Configuration</h3>
                    <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Set up your YouTube live stream and display preferences.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setLiveActive(!liveActive)}>
                  <div style={{
                    width: 44, height: 24, backgroundColor: liveActive ? '#2e7d32' : '#cbd5e1',
                    borderRadius: 24, position: 'relative', transition: 'background-color 0.2s', flexShrink: 0
                  }}>
                    <div style={{
                      width: 20, height: 20, backgroundColor: '#fff', borderRadius: '50%',
                      position: 'absolute', top: 2, left: liveActive ? 22 : 2,
                      transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a2940' }}>
                    Stream is {liveActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* YouTube Link */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.2rem' }}>YouTube Live Stream Link</label>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>Paste your YouTube live stream URL</p>
                <div style={{ position: 'relative' }}>
                  <LinkIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="url" value={liveLink} onChange={e => setLiveLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ ...inputStyle, paddingLeft: '2.4rem' }}
                    onFocus={e => e.target.style.borderColor = '#2e7d32'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#2e7d32' }}>
                    <Copy size={14} />
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.2rem' }}>Tooltip Hover Text</label>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>This text will appear when users hover over the live button</p>
                <div style={{ position: 'relative' }}>
                  <MessageCircle size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text" value={liveTooltip} onChange={e => setLiveTooltip(e.target.value)}
                    placeholder="Live started in the youtube"
                    maxLength={80}
                    style={{ ...inputStyle, paddingLeft: '2.4rem', paddingRight: '4rem' }}
                    onFocus={e => e.target.style.borderColor = '#2e7d32'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#94a3b8' }}>
                    {liveTooltip.length}/80
                  </span>
                </div>
              </div>

              {/* Tip Box */}
              <div style={{ background: '#f0fdf4', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Lightbulb size={16} style={{ color: '#15803d' }} />
                <span style={{ color: '#15803d', fontSize: '0.8rem', fontWeight: 600 }}>Tip: Keep your message short and engaging.</span>
              </div>

              {/* Showcase in Hero Toggle */}
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.2rem' }}>Showcase as Hero Background</label>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>Replaces the default home page video with the live YouTube stream.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setLiveShowInHero(!liveShowInHero)}>
                  <div style={{
                    width: 44, height: 24, backgroundColor: liveShowInHero ? '#2e7d32' : '#cbd5e1',
                    borderRadius: 24, position: 'relative', transition: '0.2s', flexShrink: 0
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: liveShowInHero ? 22 : 2,
                      width: 20, height: 20, backgroundColor: '#fff', borderRadius: '50%',
                      transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: liveShowInHero ? '#1a2940' : '#64748b' }}>
                    Show in Hero is {liveShowInHero ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <button onClick={handleSaveLiveSettings} disabled={savingLive} style={{ ...greenBtnStyle, opacity: savingLive ? 0.7 : 1, cursor: savingLive ? 'not-allowed' : 'pointer' }}>
                <Save size={18} /> {savingLive ? 'Saving...' : 'Save Live Stream Settings'}
              </button>
            </div>

            {/* Right: Homepage Preview */}
            <div style={{ ...cardStyle, padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Eye size={16} style={{ color: '#15803d' }} />
                </div>
                <div>
                  <h4 style={{ margin: '0', fontSize: '0.95rem', fontWeight: 700, color: '#1a2940' }}>Homepage Preview</h4>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>This is how it will appear on your homepage.</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e8edf2', overflow: 'hidden' }}>
                {/* Mock browser bar */}
                <div style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#fff', borderBottom: '1px solid #e8edf2' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></span>
                </div>
                {/* Preview content */}
                <div style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                      <Play size={24} style={{ color: '#fff', marginLeft: '4px', fill: '#fff' }} />
                    </div>
                    <span style={{ position: 'absolute', top: -10, right: -20, background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>LIVE</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#1a2940' }}>Join us live on YouTube</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>Experience the service in real-time</p>
                  </div>
                  <button style={{
                    background: '#ef4444', color: '#fff', border: 'none',
                    padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.8rem',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'default', marginTop: '0.25rem'
                  }}>
                    <Radio size={14} /> Watch Live
                  </button>
                  {/* Tooltip preview */}
                  <div style={{ background: '#334155', color: '#fff', fontSize: '0.72rem', padding: '0.4rem 0.85rem', borderRadius: '6px', position: 'relative' }}>
                    {liveTooltip || 'Live started in the youtube'}
                    <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '4px solid #334155' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Features Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '2rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e8edf2' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Monitor size={18} style={{ color: '#15803d' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: 700, color: '#1a2940' }}>Showcase Live</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Engage your audience by streaming live on YouTube.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={18} style={{ color: '#15803d' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: 700, color: '#1a2940' }}>Real-time Updates</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Keep your viewers informed with live status and alerts.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wand2 size={18} style={{ color: '#15803d' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.9rem', fontWeight: 700, color: '#1a2940' }}>Custom Experience</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>Personalize how the live stream appears on your homepage.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
           DONATION PAGE TAB
           ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'donation' && (
        <div>
          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'relative' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2940', margin: 0 }}>Donation Page Settings</h2>
              <p style={{ color: '#8898aa', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Manage UPI accounts and bank details for receiving donations.</p>
            </div>
            {/* Decorative card illustration */}
            <div style={{ position: 'relative', width: 80, height: 60, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, right: 10, width: 55, height: 38, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', borderRadius: '6px', transform: 'rotate(-8deg)', opacity: 0.8 }}></div>
              <div style={{ position: 'absolute', top: 8, right: 0, width: 55, height: 38, background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)', borderRadius: '6px', transform: 'rotate(5deg)' }}></div>
              <span style={{ position: 'absolute', bottom: -2, right: 20, fontSize: '1.1rem' }}>💚</span>
              <span style={{ position: 'absolute', top: -5, left: -5, fontSize: '0.8rem', color: '#2e7d32', opacity: 0.5, fontWeight: 700 }}>+</span>
            </div>
          </div>

          {/* ─── UPI Accounts ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1a2940' }}>UPI Accounts</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#8898aa' }}>Add and manage UPI accounts for donations.</p>
              </div>
              <button onClick={addUpiSection} style={{ ...outlineBtnStyle, padding: '0.5rem 1rem', borderRadius: '20px', color: '#15803d', borderColor: '#dcfce7' }}>
                <Plus size={15} /> Add UPI Account
              </button>
            </div>

            {donationSettings.upiSections?.map((section, index) => (
              <div key={index} style={{ ...cardStyle, marginBottom: '1.25rem', border: '1px solid #e8edf2' }}>
                {/* UPI Card Header */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {index === 0 && (
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Default</span>
                    )}
                    <span style={{ fontWeight: 600, color: '#1a2940', fontSize: '0.95rem' }}>UPI Account {index + 1}</span>
                  </div>
                  {donationSettings.upiSections.length > 1 && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: '#64748b' }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuIndex === index && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', overflow: 'hidden' }}>
                          <button
                            onClick={() => { setOpenMenuIndex(null); requestRemoveUpiSection(index); }}
                            style={{ width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#ef4444', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* UPI Card Body */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '2rem', marginBottom: '1.25rem' }}>
                    {/* QR Code */}
                    <div>
                      <label style={{ ...labelStyle, fontSize: '0.8rem' }}>QR Code</label>
                      <div style={{ width: 120, height: 120, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        {section.qrCodeUrl ? (
                          <img src={section.qrCodeUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>No QR</span>
                        )}
                      </div>
                      <input type="file" accept="image/*" id={`qr-upload-${index}`} onChange={(e) => handleQrUpload(index, e.target.files[0])} style={{ display: 'none' }} />
                      <button
                        onClick={() => document.getElementById(`qr-upload-${index}`).click()}
                        disabled={uploadingQr}
                        style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0 }}
                      >
                        <Upload size={14} /> {uploadingQr ? 'Uploading...' : 'Upload QR'}
                      </button>
                    </div>

                    {/* UPI Details */}
                    <div>
                      <div style={{ marginBottom: '0.9rem' }}>
                        <label style={{ ...labelStyle, fontSize: '0.8rem' }}>UPI ID</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text" value={section.upiId}
                            onChange={e => handleUpiDetailChange(index, 'upiId', e.target.value)}
                            placeholder="jesusiswithus@upi"
                            style={{ ...inputStyle, paddingRight: '2.5rem', fontSize: '0.88rem', borderColor: (showUpiErrors && !section.upiId?.trim()) ? '#ef4444' : '#e2e8f0' }}
                            onFocus={e => e.target.style.borderColor = '#2e7d32'}
                            onBlur={e => e.target.style.borderColor = (showUpiErrors && !section.upiId?.trim()) ? '#ef4444' : '#e2e8f0'}
                          />
                          <button onClick={() => copyToClipboard(section.upiId)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}>
                            <Clipboard size={15} />
                          </button>
                        </div>
                        {showUpiErrors && !section.upiId?.trim() && (
                          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>Please fill the details in the field.</div>
                        )}
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '0.8rem' }}>UPI Number</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text" value={section.upiNumber}
                            onChange={e => handleUpiDetailChange(index, 'upiNumber', e.target.value)}
                            placeholder="98765 43210"
                            style={{ ...inputStyle, paddingRight: '2.5rem', fontSize: '0.88rem', borderColor: (showUpiErrors && !section.upiNumber?.trim()) ? '#ef4444' : '#e2e8f0' }}
                            onFocus={e => e.target.style.borderColor = '#2e7d32'}
                            onBlur={e => e.target.style.borderColor = (showUpiErrors && !section.upiNumber?.trim()) ? '#ef4444' : '#e2e8f0'}
                          />
                          <button onClick={() => copyToClipboard(section.upiNumber)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}>
                            <Clipboard size={15} />
                          </button>
                        </div>
                        {showUpiErrors && !section.upiNumber?.trim() && (
                          <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', fontWeight: 500 }}>Please fill the details in the field.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

              {/* Add Another UPI */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <button onClick={addUpiSection} style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <Plus size={16} /> Add Another UPI Account
                </button>
              </div>

              {/* Save UPI */}
              <button onClick={handleSaveDonationSettings} disabled={savingDonation} style={{ ...greenBtnStyle, opacity: savingDonation ? 0.7 : 1, cursor: savingDonation ? 'not-allowed' : 'pointer' }}>
                <Save size={18} /> {savingDonation ? 'Saving...' : 'Save UPI Settings'}
              </button>
            </div>

          {/* ─── Bank Transfer Details ────────────────────────────────────────── */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1a2940' }}>Bank Transfer Details</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#8898aa' }}>Add and manage bank accounts for donations.</p>
              </div>
              <button onClick={addBankSection} style={{ ...outlineBtnStyle, padding: '0.5rem 1rem', borderRadius: '20px', color: '#15803d', borderColor: '#dcfce7' }}>
                <Plus size={15} /> Add Bank Account
              </button>
            </div>

            {donationSettings.bankTransferSections?.map((section, sIndex) => {
              const bankName = section.title || section.bankDetails?.find(d => d.label?.toLowerCase().includes('bank name'))?.value || `Bank Account ${sIndex + 1}`;
              const isEditing = editingBankIndex === sIndex;

              return (
                <div key={sIndex} style={{ ...cardStyle, marginBottom: '1.25rem', border: '1px solid #e8edf2' }}>
                  {/* Bank Header */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isEditing ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={22} style={{ color: '#15803d' }} />
                      </div>
                      {isEditing ? (
                        <input
                          type="text" value={section.title || ''} autoFocus
                          onChange={e => handleBankTitleChange(sIndex, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') setEditingBankIndex(null); }}
                          placeholder="Bank Name"
                          style={{ ...inputStyle, width: '200px', padding: '0.4rem 0.7rem', fontSize: '1.05rem', fontWeight: 700 }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a2940' }}>{bankName}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button onClick={() => setEditingBankIndex(isEditing ? null : sIndex)} style={{ ...outlineBtnStyle, padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#15803d', borderColor: '#bbf7d0', borderRadius: '20px' }}>
                        {isEditing ? <><Check size={13} style={{ marginRight: 4 }} /> Done</> : <><Edit2 size={13} style={{ marginRight: 4 }} /> Edit</>}
                      </button>
                      {donationSettings.bankTransferSections.length > 1 && (
                        <button onClick={() => requestRemoveBankSection(sIndex)}
                          style={{ ...outlineBtnStyle, padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#fecaca', borderRadius: '20px' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                      <ChevronUp size={20} style={{ color: '#64748b', marginLeft: '0.5rem', cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Bank Body - Detail Rows */}
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {section.bankDetails?.map((detail, fIndex) => (
                          <div key={fIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {getBankFieldIcon(detail.label)}
                            <input type="text" value={detail.label} onChange={e => handleBankDetailChange(sIndex, fIndex, 'label', e.target.value)}
                              placeholder="Label" style={{ ...inputStyle, width: '140px', padding: '0.45rem 0.7rem', fontSize: '0.85rem', fontWeight: 600 }} />
                            <input type="text" value={detail.value} onChange={e => handleBankDetailChange(sIndex, fIndex, 'value', e.target.value)}
                              placeholder="Value" style={{ ...inputStyle, flex: 1, padding: '0.45rem 0.7rem', fontSize: '0.85rem' }} />
                            <button onClick={() => removeBankField(sIndex, fIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}>
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                        <div>
                          <button onClick={() => addBankField(sIndex)} style={{ ...outlineBtnStyle, padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}>
                            <Plus size={13} /> Add Field
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', height: '1px', background: '#f1f5f9', marginBottom: '1.5rem' }}></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', rowGap: '1.5rem' }}>
                          {section.bankDetails?.map((detail, fIndex) => (
                            <div key={fIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                              <div style={{ color: '#94a3b8', marginTop: '0.1rem' }}>
                                {getBankFieldIcon(detail.label)}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.15rem' }}>{detail.label}</div>
                                <div style={{ fontSize: '0.88rem', color: '#1a2940', fontWeight: 600 }}>{detail.value || '—'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Save Bank */}
            <button onClick={handleSaveDonationSettings} disabled={savingDonation} style={{ ...greenBtnStyle, opacity: savingDonation ? 0.7 : 1, cursor: savingDonation ? 'not-allowed' : 'pointer' }}>
              <Save size={18} /> {savingDonation ? 'Saving...' : 'Save Bank Settings'}
            </button>
          </div>

          {/* Secure Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={20} style={{ color: '#15803d' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#15803d', fontSize: '0.9rem' }}>Secure & Trusted</p>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>Your donation information is secure and will not be shared with anyone.</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
           ANALYTICS TAB
           ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div>
          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2940', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={22} style={{ color: '#2e7d32' }} /> Platform Analytics
              </h2>
              <p style={{ color: '#8898aa', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Overview of platform usage and performance.</p>
            </div>
            <div style={{ position: 'relative' }}>
              <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <select
                value={analyticsFilter}
                onChange={async (e) => {
                  const val = e.target.value;
                  setAnalyticsFilter(val);
                  setStatsLoading(true);
                  try {
                    const data = await getAppStatistics(val);
                    setStats(data);
                  } catch (err) {
                    toast.error('Failed to load analytics');
                  } finally {
                    setStatsLoading(false);
                  }
                }}
                style={{
                  appearance: 'none', padding: '0.6rem 2.2rem 0.6rem 2.2rem',
                  border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem',
                  color: '#475569', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', fontWeight: 500
                }}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Activity size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
              Loading analytics...
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                {/* Views Card */}
                <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Eye size={26} style={{ color: '#15803d' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Poster Views</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{statsLoading ? '...' : (stats?.total_views?.toLocaleString() || '56')}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Views across all posters</p>
                    </div>
                  </div>
                  <Sparkline color="#22c55e" />
                </div>

                {/* Downloads Card */}
                <div style={{ ...cardStyle, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Download size={26} style={{ color: '#0ea5e9' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Poster Downloads</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{statsLoading ? '...' : (stats?.total_downloads?.toLocaleString() || '4')}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Downloads across all posters</p>
                    </div>
                  </div>
                  <Sparkline color="#3b82f6" />
                </div>
              </div>

              {/* Storage Section */}
              <div style={{ ...cardStyle, padding: '1.75rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1a2940' }}>Storage Overview</h3>
                <p style={{ color: '#8898aa', margin: '0.2rem 0 2rem', fontSize: '0.85rem' }}>Overview of your storage usage and remaining space.</p>

                <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Left: Usage Details */}
                  <div style={{ flex: 1, minWidth: '350px' }}>
                    {/* Used Space */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: 14, height: 14, borderRadius: '4px', background: '#22c55e', display: 'inline-block' }}></span>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Used Space</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '2rem' }}>{usedGB} GB</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.95rem' }}>{usedPercent}%</span>
                    </div>
                    {/* Free Space */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: 14, height: 14, borderRadius: '4px', background: '#cbd5e1', display: 'inline-block' }}></span>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Free Space</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '2rem' }}>{freeGB} GB</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{freePercent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, display: 'flex', overflow: 'hidden', marginBottom: '1.5rem' }}>
                      <div style={{ width: `${usedPercent}%`, background: '#22c55e' }}></div>
                    </div>

                    {/* Total Capacity */}
                    <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Total Capacity</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>2.00 GB</span>
                    </div>
                  </div>

                  {/* Right: Donut Chart */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                      width: 160, height: 160, borderRadius: '50%',
                      background: `conic-gradient(#22c55e 0% ${usedPercent}%, #f1f5f9 ${usedPercent}% 100%)`,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.04)', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        width: 110, height: 110, background: '#fff', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
                      }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>USED</span>
                        <span style={{ fontSize: '1.8rem', color: '#22c55e', fontWeight: 800, lineHeight: 1, margin: '0.2rem 0' }}>{usedPercent}%</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{usedGB} GB</span>
                      </div>
                    </div>
                    {/* Free Space Badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px',
                      padding: '0.75rem 1.25rem'
                    }}>
                      <HardDrive size={18} style={{ color: '#15803d' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: '#15803d' }}>{freePercent}% Free Space</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#22c55e' }}>{freeGB} GB available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={22} style={{ color: '#15803d' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>Secure & Reliable</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#4b5563' }}>All analytics data is stored securely in the database.</p>
                  </div>
                </div>
                <div style={{ opacity: 0.2 }}>
                  <Database size={40} style={{ color: '#15803d' }} />
                  <ShieldCheck size={24} style={{ color: '#15803d', position: 'absolute', transform: 'translate(20px, 10px)' }} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
           QUICK ACCESS TAB
           ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'quick_access' && (
        <div>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2940', margin: 0 }}>Quick Access Buttons</h2>
            <p style={{ color: '#8898aa', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Manage the floating action buttons displayed on the bottom right of the website.</p>
          </div>
          
          <div style={{ ...cardStyle, padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a2940' }}>Configure Buttons</h3>
              <button 
                onClick={() => setQuickAccessButtons([...quickAccessButtons, { id: Date.now(), icon: 'LinkIcon', link: '', color: '#3b82f6', tooltip: 'New Link', isExternal: false }])}
                style={{ ...outlineBtnStyle, padding: '0.5rem 1rem' }}
              >
                <Plus size={16} /> Add Button
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quickAccessButtons.map((btn, index) => (
                <div key={btn.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  
                  <div>
                    <label style={labelStyle}>Tooltip Label</label>
                    <input 
                      style={{...inputStyle, padding: '0.5rem'}} 
                      value={btn.tooltip} 
                      onChange={(e) => {
                        const newBtns = [...quickAccessButtons];
                        newBtns[index].tooltip = e.target.value;
                        setQuickAccessButtons(newBtns);
                      }} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Link URL</label>
                    <input 
                      style={{...inputStyle, padding: '0.5rem'}} 
                      value={btn.link} 
                      onChange={(e) => {
                        const newBtns = [...quickAccessButtons];
                        newBtns[index].link = e.target.value;
                        setQuickAccessButtons(newBtns);
                      }} 
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Color / Gradient</label>
                    <input 
                      style={{...inputStyle, padding: '0.5rem'}} 
                      value={btn.color} 
                      onChange={(e) => {
                        const newBtns = [...quickAccessButtons];
                        newBtns[index].color = e.target.value;
                        setQuickAccessButtons(newBtns);
                      }} 
                    />
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Icon Name</label>
                    <select 
                      style={{...inputStyle, padding: '0.5rem'}}
                      value={btn.icon}
                      onChange={(e) => {
                        const newBtns = [...quickAccessButtons];
                        newBtns[index].icon = e.target.value;
                        setQuickAccessButtons(newBtns);
                      }}
                    >
                      <option value="MessageCircle">Message (WhatsApp)</option>
                      <option value="Heart">Heart</option>
                      <option value="Music">Music</option>
                      <option value="LinkIcon">Link</option>
                      <option value="Phone">Phone</option>
                      <option value="Mail">Mail</option>
                      <option value="MapPin">Location</option>
                      <option value="Globe">Globe</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setDeleteContext({ type: 'quick_access', index })}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '1.5rem', padding: '0.5rem' }}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              ))}
              
              {quickAccessButtons.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No quick access buttons configured.</div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={async () => {
                  setSavingQuickAccess(true);
                  try {
                    await updateQuickAccessSettings(quickAccessButtons);
                    toast.success('Quick Access buttons saved!');
                  } catch (e) {
                    toast.error('Failed to save settings');
                  }
                  setSavingQuickAccess(false);
                }}
                disabled={savingQuickAccess}
                style={{ ...greenBtnStyle, width: 'auto', opacity: savingQuickAccess ? 0.7 : 1 }}
              >
                {savingQuickAccess ? 'Saving...' : 'Save Quick Access Settings'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ═══════════════════════════════════════════════════════════════════════
           SYSTEM TAB
           ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'system' && (
        <div>
          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', position: 'relative' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2940', margin: 0 }}>System Settings</h2>
              <p style={{ color: '#8898aa', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>Manage your application and system configuration.</p>
            </div>
            {/* Decorative Server illustration */}
            <div style={{ position: 'relative', flexShrink: 0, marginRight: '1rem' }}>
              <Monitor size={48} style={{ color: '#475569' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <SettingsIcon size={20} style={{ color: '#1a2940' }} />
              </div>
              <div style={{ position: 'absolute', bottom: -5, right: -10, width: 26, height: 26, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} style={{ color: '#fff' }} />
              </div>
            </div>
          </div>

          {/* Supabase Connection Status */}
          <div style={{ ...cardStyle, padding: '1.75rem 2rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={32} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Supabase Connection Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.4rem 0' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                    <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.85rem' }}>Connected & Secure</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Your application is successfully connected to your Supabase Project.</p>
                </div>
              </div>

              {/* Status icons */}
              <div style={{ display: 'flex', gap: '2rem' }}>
                {[
                  { icon: <Lock size={20} />, label: 'Authentication', sub: 'Active', color: '#22c55e' },
                  { icon: <Database size={20} />, label: 'Database', sub: 'Active', color: '#22c55e' },
                  { icon: <Cloud size={20} />, label: 'Storage', sub: 'Active', color: '#22c55e' },
                  { icon: <ShieldCheck size={20} />, label: 'Secure', sub: 'Enabled', color: '#22c55e' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      {item.icon}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{item.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Integration Settings */}
          <div style={{ ...cardStyle, padding: '1.75rem 2rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Email Integration (Resend)</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Configure your Resend API credentials for outgoing notifications.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '600px' }}>
              <div>
                <label style={labelStyle}>Resend API Key</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    placeholder="re_xxxxxxxxxxxxxxxxx"
                    value={emailSettings.resendApiKey}
                    onChange={e => setEmailSettings({ ...emailSettings, resendApiKey: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>From Email Address</label>
                  <input
                    type="email"
                    style={inputStyle}
                    placeholder="noreply@yourdomain.com"
                    value={emailSettings.fromEmail}
                    onChange={e => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Reply-To Address</label>
                  <input
                    type="email"
                    style={inputStyle}
                    placeholder="contact@yourdomain.com"
                    value={emailSettings.replyToEmail}
                    onChange={e => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <button
                  style={{ ...greenBtnStyle, maxWidth: '200px' }}
                  onClick={handleSaveEmailSettings}
                  disabled={savingEmail}
                >
                  {savingEmail ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* System Form Fields */}
          <div style={{ ...cardStyle, padding: '2rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Organization Name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={24} style={{ color: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
                  <div style={{ width: '250px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Organization Name</h4>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Your ministry or organization name.</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" value="Jesus Is With Us Ministries" disabled
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', background: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Project Name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderOpen size={24} style={{ color: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
                  <div style={{ width: '250px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Project Name</h4>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Name of your project or application.</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" value="Daily Rhema Management System" disabled
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', background: '#fff' }} />
                  </div>
                </div>
              </div>

              {/* Admin Email */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={24} style={{ color: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '2rem' }}>
                  <div style={{ width: '250px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Admin Email</h4>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Primary admin email for system access.</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" value="admin@jesusiswithus.org" disabled
                      style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', background: '#fff' }} />
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      To change passwords or manage users, please visit the <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 600, textDecoration: 'none' }}>Supabase Dashboard</a>.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>


        </div>
      )}
    </div>

    <ConfirmModal 
      isOpen={!!deleteContext}
      title="Remove Section"
      message={`Are you sure you want to remove this ${deleteContext?.type === 'upi' ? 'UPI' : deleteContext?.type === 'bank' ? 'Bank' : 'Quick Access'} section?`}
      onConfirm={confirmDelete}
      onCancel={() => setDeleteContext(null)}
    />
    </>
  );
}
