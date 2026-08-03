import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Layout & Pages
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Ministries from './pages/Ministries';
import Fellowship from './pages/Fellowship';
import RhemaWords from './pages/RhemaWords';
import Gallery from './pages/Gallery';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Donate from './pages/Donate';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AddRhema from './pages/admin/AddRhema';
import RhemaLibrary from './pages/admin/RhemaLibrary';
import Categories from './pages/admin/Categories';
import MediaLibrary from './pages/admin/MediaLibrary';
import Settings from './pages/admin/Settings';
import Events from './pages/admin/Events';
import Popups from './pages/admin/Popups';
import GalleryAdmin from './pages/admin/GalleryAdmin';
import Subscribers from './pages/admin/Subscribers';
import Playlists from './pages/admin/Playlists';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          
          {/* Public Website Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="ministries" element={<Ministries />} />
            <Route path="fellowship" element={<Fellowship />} />
            <Route path="rhema" element={<RhemaWords />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="resources" element={<Resources />} />
            <Route path="contact" element={<Contact />} />
            <Route path="donate" element={<Donate />} />
          </Route>

          {/* Admin Login Route (Unprotected) */}
          <Route path="/admin/login" element={<Login />} />
          
          {/* Admin Dashboard Routes (Protected) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rhema/add" element={<AddRhema />} />
            <Route path="rhema/edit/:id" element={<AddRhema />} />
            <Route path="rhema/library" element={<RhemaLibrary />} />
            <Route path="categories" element={<Categories />} />
            <Route path="events" element={<Events />} />
            <Route path="popups" element={<Popups />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="playlists" element={<Playlists />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
