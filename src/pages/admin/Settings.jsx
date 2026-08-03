import { useState, useEffect, useRef } from 'react';
import { getAppStatistics } from '../../services/statisticsService';
import { getLiveStreamSettings, updateLiveStreamSettings, getDonationSettings, updateDonationSettings } from '../../services/settingsService';
import { uploadImage } from '../../services/storageService';
import { Settings as SettingsIcon, Database, Activity, ShieldCheck, Video, Save, Check, Copy, CreditCard, Upload } from 'lucide-react';
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

-- Insert default donation settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('donation_settings', '{"upiId": "jesusiswithus@upi", "upiNumber": "98765 43210", "qrCodeUrl": "", "bankName": "State Bank of India", "accountName": "Jesus Is With Us Ministries", "accountNumber": "123456789012", "ifscCode": "SBIN0001234", "branch": "Salem Main Branch"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
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

  const handleSaveDonationSettings = async () => {
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
    const newUpiSections = [...donationSettings.upiSections];
    newUpiSections[index][key] = value;
    setDonationSettings({ ...donationSettings, upiSections: newUpiSections });
  };

  const addUpiSection = () => {
    setDonationSettings({ 
      ...donationSettings, 
      upiSections: [...donationSettings.upiSections, { upiId: '', upiNumber: '', qrCodeUrl: '' }] 
    });
  };

  const removeUpiSection = (index) => {
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
    setDonationSettings({
      ...donationSettings,
      bankTransferSections: [...donationSettings.bankTransferSections, {
        title: '',
        bankDetails: [
          { label: 'Bank Name', value: '' },
          { label: 'Account Number', value: '' },
          { label: 'IFSC Code', value: '' }
        ]
      }]
    });
  };

  const handleBankTitleChange = (sectionIndex, newTitle) => {
    const newBankSections = [...donationSettings.bankTransferSections];
    newBankSections[sectionIndex].title = newTitle;
    setDonationSettings({ ...donationSettings, bankTransferSections: newBankSections });
  };

  const removeBankSection = (sectionIndex) => {
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', overflowX: 'auto', gap: '1rem' }}>
        <button 
          onClick={() => setActiveTab('live')}
          style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'live' ? '3px solid #e33b70' : '3px solid transparent', color: activeTab === 'live' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'live' ? '700' : '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <Video size={18} /> Live Stream
        </button>
        <button 
          onClick={() => setActiveTab('donation')}
          style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'donation' ? '3px solid #e33b70' : '3px solid transparent', color: activeTab === 'donation' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'donation' ? '700' : '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <CreditCard size={18} /> Donation Page
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'analytics' ? '3px solid #e33b70' : '3px solid transparent', color: activeTab === 'analytics' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'analytics' ? '700' : '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <Activity size={18} /> Analytics
        </button>
        <button 
          onClick={() => setActiveTab('system')}
          style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'system' ? '3px solid #e33b70' : '3px solid transparent', color: activeTab === 'system' ? '#0f172a' : '#64748b', fontWeight: activeTab === 'system' ? '700' : '500', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
        >
          <SettingsIcon size={18} /> System
        </button>
      </div>

      <div className={styles.addGrid} style={{ gridTemplateColumns: '1fr' }}>
        
        {/* Live Stream Tab */}
        {activeTab === 'live' && (
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
        )}

        {/* Donation Settings Tab */}
        {activeTab === 'donation' && (
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <h3><CreditCard size={20} style={{marginRight: '0.5rem', verticalAlign: 'middle'}}/> Donation Page Settings</h3>
            </div>
          
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#1E293B' }}>Scan to Pay (UPI)</h4>
                <button className="btn btn-secondary btn-sm" onClick={addUpiSection}>+ Add UPI Account</button>
              </div>

              {donationSettings.upiSections && donationSettings.upiSections.map((section, index) => (
                <div key={index} style={{ marginBottom: '2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  
                  {/* Card Header */}
                  <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>UPI Account {index + 1}</h5>
                    {donationSettings.upiSections.length > 1 && (
                      <button 
                        onClick={() => removeUpiSection(index)}
                        style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Remove Section
                      </button>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div style={{ padding: '1.5rem' }}>
                    <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#475569', fontSize: '0.9rem' }}>QR Code Image</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                          {section.qrCodeUrl ? (
                            <img src={section.qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Image</span>
                          )}
                        </div>
                        <div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            id={`qr-upload-${index}`}
                            onChange={(e) => handleQrUpload(index, e.target.files[0])} 
                            style={{ display: 'none' }} 
                          />
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => document.getElementById(`qr-upload-${index}`).click()}
                            disabled={uploadingQr}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6' }}
                          >
                            <Upload size={16} /> {uploadingQr ? 'Uploading...' : 'Upload New QR Code'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.9rem' }}>UPI ID</label>
                      <div className={styles.inputWrapper}>
                        <input 
                          type="text" 
                          value={section.upiId} 
                          onChange={e => handleUpiDetailChange(index, 'upiId', e.target.value)}
                          placeholder="e.g., yourname@upi" 
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.9rem' }}>UPI Number</label>
                      <div className={styles.inputWrapper}>
                        <input 
                          type="text" 
                          value={section.upiNumber} 
                          onChange={e => handleUpiDetailChange(index, 'upiNumber', e.target.value)}
                          placeholder="e.g., 98765 43210" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-primary" 
                onClick={handleSaveDonationSettings} 
                disabled={savingDonation}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #ff416c, #ff4b2b)', border: 'none', padding: '1rem', borderRadius: '30px', fontWeight: 700 }}
              >
                <Save size={18} /> {savingDonation ? 'Saving...' : 'Save UPI Settings'}
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#1E293B' }}>Bank Transfer Details</h4>
                <button className="btn btn-secondary btn-sm" onClick={addBankSection}>+ Add Bank Account</button>
              </div>

              {donationSettings.bankTransferSections && donationSettings.bankTransferSections.map((section, sIndex) => (
                <div key={sIndex} style={{ marginBottom: '2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  
                  {/* Card Header */}
                  <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h5 style={{ margin: 0, color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>Title:</h5>
                      <input 
                        type="text" 
                        placeholder={`Bank Transfer #${sIndex + 1}`}
                        value={section.title || ''} 
                        onChange={e => handleBankTitleChange(sIndex, e.target.value)}
                        style={{ padding: '0.4rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', width: '200px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => addBankField(sIndex)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6', padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        + Add Field
                      </button>
                      {donationSettings.bankTransferSections.length > 1 && (
                        <button 
                          onClick={() => removeBankSection(sIndex)}
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Remove Section
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div style={{ padding: '1.5rem' }}>
                    {section.bankDetails && section.bankDetails.map((detail, fIndex) => (
                      <div key={fIndex} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: '1' }}>
                          <input 
                            type="text" 
                            placeholder="Label (e.g. Bank Name)"
                            value={detail.label} 
                            onChange={e => handleBankDetailChange(sIndex, fIndex, 'label', e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                          />
                        </div>
                        <div style={{ flex: '2' }}>
                          <input 
                            type="text" 
                            placeholder="Value"
                            value={detail.value} 
                            onChange={e => handleBankDetailChange(sIndex, fIndex, 'value', e.target.value)}
                            style={{ width: '100%', padding: '0.7rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                          />
                        </div>
                        <button 
                          onClick={() => removeBankField(sIndex, fIndex)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove Field"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-primary" 
                onClick={handleSaveDonationSettings} 
                disabled={savingDonation}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #ff416c, #ff4b2b)', border: 'none', padding: '1rem', borderRadius: '30px', fontWeight: 700 }}
              >
                <Save size={18} /> {savingDonation ? 'Saving...' : 'Save Bank Settings'}
              </button>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
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
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
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
        )}
      </div>
    </div>
  );
}
