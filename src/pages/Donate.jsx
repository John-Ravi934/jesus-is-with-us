import { useState, useEffect } from 'react';
import { User, Copy, Phone, Heart, Globe, BookOpen, ShieldCheck, CreditCard, Landmark, QrCode, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDonationSettings } from '../services/settingsService';
import styles from './Donate.module.css';

export default function Donate() {
  const [settings, setSettings] = useState({
    upiSections: [{ upiId: 'jesusiswithus@upi', upiNumber: '98765 43210', qrCodeUrl: '' }],
    bankTransferSections: [{
      bankDetails: [
        { label: 'Bank Name', value: 'State Bank of India' },
        { label: 'Account Name', value: 'Jesus Is With Us Ministries' },
        { label: 'Account Number', value: '123456789012' },
        { label: 'IFSC Code', value: 'SBIN0001234' },
        { label: 'Branch Name', value: 'Salem Main Branch' }
      ]
    }]
  });

  const handleCopy = (text, type = 'Text') => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  useEffect(() => {
    getDonationSettings().then(data => {
      if (data) {
        let newData = { ...data };
        if (!newData.upiSections) {
          newData.upiSections = [{
            upiId: newData.upiId || '',
            upiNumber: newData.upiNumber || '',
            qrCodeUrl: newData.qrCodeUrl || ''
          }];
        }
        if (!newData.bankTransferSections) {
          if (newData.bankDetails) {
            newData.bankTransferSections = [{ bankDetails: newData.bankDetails }];
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
          } else {
            newData.bankTransferSections = [{ bankDetails: [] }];
          }
        }
        setSettings(newData);
      }
    }).catch(err => console.error(err));
  }, []);
  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Partner With Us</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Make An <span className="script-accent">Impact</span></h1>
        </div>
      </section>

      <section className="gray-section">
        <div className="container">
          <div className={styles.introHeader}>
            <span className="subheading">Why Give?</span>
            <h2 data-aos="fade-up">Your Giving Changes <span className="script-accent">Lives</span></h2>
            <p data-aos="fade-up">Every seed you sow goes directly towards advancing the Gospel, helping those in need, and supporting our various outreach programs. Together, we can make a difference.</p>
          </div>

          <div className={styles.impactGrid}>
            <div data-aos="fade-up" className={styles.impactCard}>
              <Globe size={40} className={styles.impactIcon} />
              <h4 data-aos="fade-up">Global Missions</h4>
              <p data-aos="fade-up">Funding crusades and church planting in remote areas.</p>
            </div>
            <div data-aos="fade-up" className={styles.impactCard}>
              <Heart size={40} className={styles.impactIcon} />
              <h4 data-aos="fade-up">Community Outreach</h4>
              <p data-aos="fade-up">Feeding the hungry and providing shelter for the homeless.</p>
            </div>
            <div data-aos="fade-up" className={styles.impactCard}>
              <BookOpen size={40} className={styles.impactIcon} />
              <h4 data-aos="fade-up">Next Generation</h4>
              <p data-aos="fade-up">Equipping youth and children with educational resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="light-section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', alignItems: 'stretch' }}>
            
            {/* Left Column: Scan to Pay */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {settings.upiSections && settings.upiSections.map((section, idx) => (
                <div data-aos="fade-up" key={idx} className={styles.premiumCard}>
                  
                  <div className={styles.shieldIconContainer}>
                    <ShieldCheck size={28} color="#fff" />
                  </div>
                  
                  <h3 data-aos="fade-up" className={styles.cardTitle}>Scan to Pay</h3>
                  <p data-aos="fade-up" className={styles.cardSubtitle}>
                    <span style={{ color: '#00B9F1' }}>Fast.</span>{' '}
                    <span style={{ color: '#10B981' }}>Secure.</span>{' '}
                    <span style={{ color: '#5f259f' }}>Instant.</span>
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', margin: '1.5rem 0 2.5rem' }}>
                    <span className={styles.appBadge}>
                      <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#EA4335' }}>P</span><span style={{ color: '#FBBC04' }}>a</span><span style={{ color: '#34A853' }}>y</span>
                    </span>
                    <span className={styles.appBadge} style={{ color: '#00B9F1' }}>Paytm</span>
                    <span className={styles.appBadge} style={{ color: '#5f259f' }}>PhonePe</span>
                    <span className={styles.appBadge} style={{ color: '#f97316' }}>BHIM</span>
                  </div>

                  <div className={styles.qrContainerWrapper}>
                    <div className={styles.qrContainer}>
                      {section.qrCodeUrl ? (
                        <img data-aos="fade-up" src={section.qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', position: 'relative', zIndex: 1 }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', zIndex: 1 }}>
                          <QrCode size={40} />
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>QR Code Here</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.scanBadge}>
                      <ShieldCheck size={16} /> Scan with any UPI app
                    </div>
                  </div>
                  
                  <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={styles.detailPill}>
                      <div className={styles.detailIconBox} style={{ background: '#3b82f6', color: '#fff' }}>
                        <User size={18} />
                      </div>
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>UPI ID</span>
                        <span className={styles.detailValue}>{section.upiId}</span>
                      </div>
                      <button className={styles.copyBtn} onClick={() => handleCopy(section.upiId, 'UPI ID')}>
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className={styles.detailPill}>
                      <div className={styles.detailIconBox} style={{ background: '#10b981', color: '#fff' }}>
                        <Phone size={18} />
                      </div>
                      <div className={styles.detailText}>
                        <span className={styles.detailLabel}>UPI NUMBER</span>
                        <span className={styles.detailValue}>{section.upiNumber}</span>
                      </div>
                      <button className={styles.copyBtn} onClick={() => handleCopy(section.upiNumber, 'UPI Number')}>
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.securityBanner}>
                    <ShieldCheck size={24} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem' }}>Use any UPI app (GPay, Paytm, PhonePe, BHIM) to scan and give securely.</span>
                    <Check size={24} style={{ flexShrink: 0, opacity: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Bank Transfer */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 data-aos="fade-up" style={{ marginBottom: '2rem', color: 'var(--color-dark-bg)', textAlign: 'center', fontSize: '1.8rem', fontWeight: 800 }}>Other Ways To Give</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
                {settings.bankTransferSections && settings.bankTransferSections.map((section, idx) => (
                  <div data-aos="fade-up" key={idx} className={styles.bankCard}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Landmark size={32} color="#ff8c42" />
                      <h4 data-aos="fade-up" style={{ margin: '0 0 0 12px', fontSize: '1.4rem', color: '#fff' }}>
                        {section.title || `Bank Transfer ${settings.bankTransferSections.length > 1 ? `#${idx + 1}` : ''}`}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {section.bankDetails && section.bankDetails.map((detail, fIndex) => (
                        <div className={styles.bankRow} key={fIndex}>
                          <span className={styles.bankLabel}>{detail.label}</span>
                          <span className={styles.bankValue}>{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
