import { Book, Shield, Search, ChevronDown, MonitorPlay, Headphones, Mail, Users, PlusCircle, Folder, LayoutGrid, Settings, Radio } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function UserManual() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { id: 1, question: 'How do I add a new Rhema?', answer: 'Navigate to "Add New Rhema" in the sidebar, fill out the form with the message details, and click publish.' },
    { id: 2, question: 'How do I manage categories?', answer: 'Go to the Categories page to add, edit, or delete message categories.' },
    { id: 3, question: 'How can I upload media or images?', answer: 'Use the Media Library to upload and organize all your files.' },
    { id: 4, question: 'How do I enable live stream on homepage?', answer: 'Go to Settings > Live Stream and paste your YouTube Live URL.' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>User Manual</h1>
          <p style={{ color: '#64748b', margin: '0.4rem 0 0', fontSize: '1rem' }}>Learn how to use Daily Rhema platform effectively.</p>
        </div>
        
        {/* Decorative Illustration (Simulated with CSS) */}
        <div style={{ position: 'relative', width: 140, height: 80 }}>
          <div style={{ position: 'absolute', right: 20, top: 10, width: 90, height: 60, background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', transform: 'rotate(-5deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: '2px', background: '#cbd5e1', position: 'absolute', top: '30%' }}></div>
            <div style={{ width: '60%', height: '2px', background: '#cbd5e1', position: 'absolute', top: '50%' }}></div>
            <div style={{ width: '70%', height: '2px', background: '#cbd5e1', position: 'absolute', top: '70%' }}></div>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#e2e8f0' }}></div>
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: 0, width: 40, height: 40, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)' }}>
            <MonitorPlay size={20} />
          </div>
          <div style={{ position: 'absolute', left: 10, top: 30, color: '#86efac', transform: 'rotate(-15deg)' }}>✦</div>
          <div style={{ position: 'absolute', right: -10, top: 0, color: '#86efac', fontSize: '1.2rem' }}>✦</div>
        </div>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Website Guide */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Book size={28} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Website User Guide</h3>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Learn how to explore and use the website as a visitor.</p>
            <a href="#website-guide" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Guide &rarr;
            </a>
          </div>
        </div>

        {/* Admin Guide */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={28} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Admin User Guide</h3>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Learn how to manage content, users and settings as an admin.</p>
            <a href="#admin-guide" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Guide &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Middle Section: Search & FAQ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Search */}
        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Search the Manual</h3>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search topics, features, and help articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', color: '#1e293b', outline: 'none', background: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Popular:</span>
            {['Add Rhema', 'Categories', 'Live Stream', 'Media Library'].map(tag => (
              <span key={tag} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Frequently Asked Questions</h3>
            <a href="#" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>View All</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map(faq => (
              <div key={faq.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '0.75rem 0', color: '#334155', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  {faq.question}
                  <ChevronDown size={16} style={{ transform: openFaq === faq.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
                </button>
                {openFaq === faq.id && (
                  <div style={{ padding: '0 0 1rem', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Website User Journey */}
      <div id="website-guide" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Website User – How to Use</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>A quick visual guide for website visitors.</p>
          </div>
          <a href="#" style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View Full Guide &rarr;</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          
          {/* Step 1 */}
          <div style={{ flex: '1 0 200px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>1</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Visit Website</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>Open Daily Rhema website in your browser.</p>
              </div>
            </div>
            {/* Mockup */}
            <div style={{ height: 100, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
               <div style={{ height: 12, background: '#e2e8f0', display: 'flex', alignItems: 'center', padding: '0 6px', gap: '4px' }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></div>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308' }}></div>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></div>
                 <div style={{ flex: 1, height: 6, background: '#fff', borderRadius: '3px', marginLeft: '4px' }}></div>
               </div>
               <div style={{ padding: '8px', textAlign: 'center' }}>
                 <div style={{ width: 40, height: 4, background: '#cbd5e1', margin: '0 auto 8px', borderRadius: '2px' }}></div>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '10px' }}>
                    <div style={{ width: 20, height: 20, background: '#dcfce7', borderRadius: '4px' }}></div>
                    <div style={{ width: 40, height: 20, background: '#e2e8f0', borderRadius: '4px' }}></div>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                   {/* trees */}
                   <div style={{ width: 12, height: 20, background: '#86efac', borderRadius: '50% 50% 0 0', position: 'relative' }}></div>
                   <div style={{ width: 16, height: 24, background: '#4ade80', borderRadius: '50% 50% 0 0', position: 'relative' }}></div>
                 </div>
               </div>
            </div>
            <div style={{ position: 'absolute', right: '-0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>&rarr;</div>
          </div>

          {/* Step 2 */}
          <div style={{ flex: '1 0 200px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>2</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Explore Content</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>Browse Rhemas, categories, sermons and resources.</p>
              </div>
            </div>
            <div style={{ height: 100, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1, height: 30, background: '#e2e8f0', borderRadius: '4px' }}></div>
                  <div style={{ flex: 1, height: 30, background: '#e2e8f0', borderRadius: '4px' }}></div>
                  <div style={{ flex: 1, height: 30, background: '#dcfce7', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 2, height: 45, background: '#e2e8f0', borderRadius: '4px' }}></div>
                  <div style={{ flex: 1, height: 45, background: '#e2e8f0', borderRadius: '4px' }}></div>
                </div>
            </div>
            <div style={{ position: 'absolute', right: '-0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>&rarr;</div>
          </div>

          {/* Step 3 */}
          <div style={{ flex: '1 0 200px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>3</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Watch / Listen</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>Watch videos or listen to audio messages.</p>
              </div>
            </div>
            <div style={{ height: 100, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '80%', height: '70%', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MonitorPlay size={12} style={{ marginLeft: '2px' }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 4, left: '10%', right: '10%', height: 4, background: '#cbd5e1', borderRadius: '2px' }}>
                  <div style={{ width: '40%', height: '100%', background: '#16a34a', borderRadius: '2px' }}></div>
                </div>
            </div>
            <div style={{ position: 'absolute', right: '-0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>&rarr;</div>
          </div>

          {/* Step 4 */}
          <div style={{ flex: '1 0 200px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>4</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Subscribe</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>Subscribe to stay updated with latest content.</p>
              </div>
            </div>
            <div style={{ height: 100, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 10px', gap: '8px' }}>
                <Mail size={24} color="#94a3b8" />
                <div style={{ width: '100%', display: 'flex', gap: '4px' }}>
                  <div style={{ flex: 1, height: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '8px', color: '#cbd5e1', display: 'flex', alignItems: 'center', padding: '0 4px' }}>Email</div>
                  <div style={{ width: 40, height: 20, background: '#16a34a', borderRadius: '4px', color: '#fff', fontSize: '7px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Subscribe</div>
                </div>
            </div>
            <div style={{ position: 'absolute', right: '-0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>&rarr;</div>
          </div>

          {/* Step 5 */}
          <div style={{ flex: '1 0 200px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>5</div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Stay Connected</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>Follow on social media and stay connected.</p>
              </div>
            </div>
            <div style={{ height: 100, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b5998', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>f</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ff0000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>▶</div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>IG</div>
            </div>
          </div>

        </div>
      </div>

      {/* Admin Quick Access */}
      <div id="admin-guide" style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Admin User – Quick Access</h2>
        <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>Jump to important admin sections.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <Link to="/admin/add-rhema" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Add New Rhema</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Create and publish new Rhema messages.</p>
            </div>
          </Link>

          <Link to="/admin/categories" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LayoutGrid size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Manage Categories</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Add, edit and organize content categories.</p>
            </div>
          </Link>

          <Link to="/admin/media" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#faf5ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Folder size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Media Library</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Upload and manage media files and documents.</p>
            </div>
          </Link>

          <Link to="/admin/settings" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Radio size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Live Stream Settings</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Configure YouTube live stream on homepage.</p>
            </div>
          </Link>

          <Link to="/admin/settings" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Settings size={18} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>System Settings</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>Manage general platform settings and preferences.</p>
            </div>
          </Link>
          
        </div>
      </div>

    </div>
  );
}
