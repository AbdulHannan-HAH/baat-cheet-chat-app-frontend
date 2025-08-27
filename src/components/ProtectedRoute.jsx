import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth → show nothing (prevents Navbar flash)
  if (loading) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        Loading...
      </div>
    );
  }

  // If user is not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has no avatar → redirect to avatar picker
  if (!user.avatarUrl && location.pathname !== "/avatar-picker") {
    return <Navigate to="/avatar-picker" replace />;
  }

  // Otherwise → allow access
  return children;
}
