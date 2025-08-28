import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAuth();

  // Apply theme to entire document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === "light") {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#000000";
    } else {
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#f5f5f5";
    }
  }, [theme]);

  return (
    <button 
      onClick={toggleTheme} 
      title="Theme"
      style={{
        background: theme === "light" ? "#f0f0f0" : "#333",
        color: theme === "light" ? "#000" : "#fff",
        border: "1px solid #ccc",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "18px",
        transition: "all 0.3s ease"
      }}
    >
      {theme === 'light' ? '🌞' : '🌜'}
    </button>
  );
}