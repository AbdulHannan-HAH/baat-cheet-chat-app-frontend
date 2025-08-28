import { useState } from 'react';
import { Link, NavLink } from "react-router-dom";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import ProfilePopup from "./ProfilePopup";

export default function Navbar() {
  const { user, logout, theme } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const navItem = "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2";
  const activeNavItem = "px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2";

  const mobileNavItem = "block px-4 py-3 text-base font-medium transition-all duration-200 flex items-center gap-3";
  const activeMobileNavItem = "block px-4 py-3 text-base font-medium flex items-center gap-3";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openProfilePopup = () => {
    setIsProfilePopupOpen(true);
  };

  const closeProfilePopup = () => {
    setIsProfilePopupOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg shadow-sm ${
        theme === 'dark' 
          ? 'border-gray-700 bg-gray-900/80' 
          : 'border-gray-200 bg-white/80'
      }`}>
        <nav className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
          {/* Logo and Hamburger */}
          <div className="flex items-center">
            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={toggleMenu}
              className="md:hidden mr-3 p-2 rounded-lg focus:outline-none transition-colors"
              aria-label="Toggle menu"
              style={{
                color: theme === 'dark' ? '#cccccc' : '#6b7280',
                backgroundColor: theme === 'dark' ? 'transparent' : 'transparent'
              }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.998 7V5a2 2 0 012-2h10a2 2 0 012 2v2h2a2 2 0 012 2v10a2 2 0 01-2 2h-14a2 2 0 01-2-2V9a2 2 0 012-2h2zm0 2h-2v10h14V9h-2v2a2 2 0 01-2 2h-6a2 2 0 01-2-2V9zm2-4v2h10V5h-10zm2 4v2h6V9h-6z"/>
                </svg>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BaatCheet
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive 
                ? `${activeNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                : `${navItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </NavLink>
            <NavLink 
              to="/chat" 
              className={({ isActive }) => isActive 
                ? `${activeNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                : `${navItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chats
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => isActive 
                ? `${activeNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                : `${navItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </NavLink>

            {/* Theme toggle */}
            <div className="px-2">
              <ThemeToggle />
            </div>

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {/* Clickable Avatar to open profile popup */}
                <button 
                  onClick={openProfilePopup} 
                  className="focus:outline-none transition-transform hover:scale-105"
                >
                  <div className="relative">
                    <Avatar name={user.name} src={user.avatarUrl} size={40} />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-800' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile Icons (Theme + Avatar) */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            {user && (
              <button onClick={openProfilePopup} className="focus:outline-none">
                <div className="relative">
                  <Avatar name={user.name} src={user.avatarUrl} size={36} />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t shadow-lg ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => isActive 
                  ? `${activeMobileNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                  : `${mobileNavItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) => isActive 
                  ? `${activeMobileNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                  : `${mobileNavItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chats
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => isActive 
                  ? `${activeMobileNavItem} ${theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}` 
                  : `${mobileNavItem} ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </NavLink>
            </div>
            <div className={`pt-4 pb-3 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <Avatar name={user.name} src={user.avatarUrl} size={44} />
                  </div>
                  <div className="ml-3">
                    <div className={`text-base font-medium ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                    }`}>
                      {user.name}
                    </div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <NavLink
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                  </NavLink>
                </div>
              )}
            </div>
            {user && (
              <div className={`pt-4 pb-3 border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="px-2 space-y-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Profile Popup */}
      <ProfilePopup 
        isOpen={isProfilePopupOpen} 
        onClose={closeProfilePopup} 
      />
    </>
  );
}