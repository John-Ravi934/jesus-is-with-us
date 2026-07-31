import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Library, Tags, 
  Image as ImageIcon, Settings, LogOut, Menu, X, User, Calendar, Bell, Users, PlaySquare
} from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import styles from './AdminLayout.module.css';

import { adminLogout } from '../services/authService';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <Toaster position="top-right" />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.brandAccent}>Daily</span> Rhema
          </div>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          <p className={styles.navLabel}>MAIN MENU</p>
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/rhema/add" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <PlusCircle size={20} /> Add New Rhema
          </NavLink>
          <NavLink to="/admin/rhema/library" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Library size={20} /> Rhema Library
          </NavLink>
          <NavLink to="/admin/categories" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Tags size={20} /> Categories
          </NavLink>
          <NavLink to="/admin/popups" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <Bell size={20} /> Announcement Popups
          </NavLink>
          <NavLink to="/admin/gallery" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <ImageIcon size={20} /> Photo Gallery
          </NavLink>
          <NavLink to="/admin/playlists" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <PlaySquare size={20} /> Media & Playlists
          </NavLink>
          <NavLink to="/admin/subscribers" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <Users size={20} /> Subscribers
          </NavLink>
          <NavLink to="/admin/media" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => setSidebarOpen(false)}>
            <ImageIcon size={20} /> Media Library
          </NavLink>
          <NavLink to="/admin/events" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Calendar size={20} /> Upcoming Events
          </NavLink>

          <p className={styles.navLabel} style={{marginTop: '2rem'}}>SYSTEM</p>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} onClick={() => setSidebarOpen(false)}>
            <Settings size={20} /> Settings
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
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
          
          <div className={styles.headerRight}>
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
