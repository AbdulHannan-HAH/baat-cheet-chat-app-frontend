import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.me();
        setUser(data.user);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      // Force redirect to login page
      window.location.href = '/login';
    }
  };

  const value = {
    user, setUser, loading,
    theme, toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);