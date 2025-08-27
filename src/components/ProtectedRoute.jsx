import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        Loading...
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  if (!user.avatarUrl && location.pathname !== "/avatar-picker")
    return <Navigate to="/avatar-picker" replace />;

  return children;
}
