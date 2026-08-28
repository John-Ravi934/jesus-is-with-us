import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Library, Tags,
  Image as ImageIcon, Settings, LogOut, Menu, X, User, Calendar, Bell, Users, PlaySquare, BookOpen, Check, Clock, Mail, ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadMessages, markAsRead } from '../services/messageService';
import styles from './AdminLayout.module.css';

import { adminLogout } from '../services/authService';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const messages = await getUnreadMessages();
      setUnreadMessages(messages);
    } catch (e) {
      console.warn("Could not fetch messages", e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setUnreadMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.warn("Failed to mark as read");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={styles.adminContainer}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Logout Modal Overlay */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <LogOut size={32} />
            </div>
            <h3 className={styles.modalTitle}>Confirm Logout</h3>
            <p className={styles.modalText}>Are you sure you want to end your session?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={cancelLogout}>Cancel</button>
              <button className={styles.confirmBtn} onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandAccent}>Church</span> Admin
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          <p className={styles.navLabel}>MAIN MENU</p>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/rhema/add" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <PlusCircle size={20} /> Add New Rhema
          </NavLink>
          <NavLink to="/admin/rhema/library" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Library size={20} /> Rhema Library
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Tags size={20} /> Categories
          </NavLink>
          <NavLink to="/admin/popups" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <Bell size={20} /> Announcement Popups
          </NavLink>
          <NavLink to="/admin/gallery" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <ImageIcon size={20} /> Photo Gallery
          </NavLink>
          <NavLink to="/admin/playlists" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <PlaySquare size={20} /> Media & Playlists
          </NavLink>
          <NavLink to="/admin/subscribers" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <Users size={20} /> Subscribers
          </NavLink>
          <NavLink to="/admin/media" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <ImageIcon size={20} /> Media Library
          </NavLink>
          <NavLink to="/admin/events" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Calendar size={20} /> Upcoming Events
          </NavLink>

          <p className={styles.navLabel} style={{ marginTop: '2rem' }}>SYSTEM</p>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Settings size={20} /> Settings
          </NavLink>
          <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Bell size={20} /> Notifications
          </NavLink>
          <NavLink to="/admin/manual" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <BookOpen size={20} /> User Manual
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogoutClick}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className={styles.pageTitle}>
              {location.pathname === '/admin/dashboard' ? 'Dashboard' :
                location.pathname === '/admin/rhema/add' ? 'Publish Rhema' :
                  location.pathname === '/admin/rhema/library' ? 'Library' : 'Admin'}
            </h2>
          </div>

          <div className={styles.headerRight} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Bell size={20} />
                {unreadMessages.length > 0 && (
                  <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: 400, background: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#e6f4ea', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Notifications</h4>
                          <span style={{ background: '#e6f4ea', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '20px' }}>
                            {unreadMessages.length} New
                          </span>
                        </div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>You have new updates and messages.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {unreadMessages.length === 0 ? (
                      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        No new notifications
                      </div>
                    ) : (
                      unreadMessages.map(msg => {
                        const isPrayer = msg.form_type === 'Prayer Request';
                        const colorCode = isPrayer ? '#8b5cf6' : '#16a34a';
                        const bgLight = isPrayer ? '#f5f3ff' : '#e6f4ea';

                        return (
                          <div key={msg.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: `4px solid ${colorCode}`, position: 'relative' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: bgLight, color: colorCode, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={20} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorCode }}></div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>New {msg.form_type}</div>
                              </div>
                              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                <strong style={{ color: colorCode }}>{msg.full_name}</strong> {isPrayer ? 'submitted a prayer request.' : 'sent a message.'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={14} /> 
                                  {/* Just a mock time logic for UI sake based on created_at */}
                                  {Math.max(1, Math.floor((new Date() - new Date(msg.created_at)) / 60000))} minutes ago
                                </span>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <button onClick={() => handleMarkAsRead(msg.id)} style={{ background: 'none', border: 'none', color: colorCode, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Mail size={14} /> Mark as read
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/admin/notifications');
                      }}
                      style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}
                    >
                      View all notifications <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.profileDropdown}>
              <div className={styles.avatar}>
                <User size={20} />
              </div>
              <span className={styles.adminName}>Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
