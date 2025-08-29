// App.jsx - Updated
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import AvatarPicker from "./pages/AvatarPicker";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import Profile from "./pages/ProfilePage";

// ek wrapper banate hain taki useLocation access ho jaye
function AppRoutes() {
  const location = useLocation();
  const { user, loading } = useAuth();

  // agar user login/register/verify-email page pe hai → navbar hide
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/verify-email";

  // Redirect root path to appropriate page based on auth status
  if (location.pathname === "/") {
    if (loading) {
      return <div>Loading...</div>;
    }
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/avatar-picker"
          element={
            <ProtectedRoute>
              <AvatarPicker />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}