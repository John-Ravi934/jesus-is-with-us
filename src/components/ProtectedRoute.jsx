import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F1F5F9'}}>Loading session...</div>;
  }

  if (!session) {
    // Redirect to login if unauthenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
