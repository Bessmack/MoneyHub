import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar on auth pages
  }

  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: '📊',
      description: 'Overview & Analytics'
    },
    { 
      path: '/transactions', 
      label: 'Transactions', 
      icon: '💳',
      description: 'Track your spending'
    },
    { 
      path: '/goals', 
      label: 'Goals', 
      icon: '🎯',
      description: 'Financial targets'
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <nav className="navbar desktop">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-logo">
                <span className="logo-icon">💰</span>
                <h2>MoneyHub</h2>
              </div>
              {user && (
                <div className="user-info">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="username">{user.username}</span>
                    <span className="user-role">Personal Account</span>
                  </div>
                </div>
              )}
            </div>
            
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <div className="nav-text">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="nav-footer">
              <button 
                onClick={handleLogout} 
                className={`logout-btn ${isLoggingOut ? 'logging-out' : ''}`}
                disabled={isLoggingOut}
              >
                <span className="logout-icon">
                  {isLoggingOut ? '⏳' : '🚪'}
                </span>
                <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
              </button>
              <div className="footer-info">
                <p>Built with ❤️</p>
                <p>Flask + React</p>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <>
          <nav className="navbar mobile">
            <div className="mobile-nav-content">
              <div className="mobile-brand">
                <span className="mobile-logo">💰</span>
                <h2>MoneyHub</h2>
              </div>
              
              <div className="mobile-nav-right">
                {user && (
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                <button 
                  className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Overlay */}
          <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
            <div className="mobile-menu">
              <div className="mobile-menu-header">
                <div className="mobile-user-profile">
                  <div className="mobile-profile-avatar">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="mobile-profile-info">
                    <span className="mobile-username">{user?.username}</span>
                    <span className="mobile-user-email">Personal Account</span>
                  </div>
                </div>
                <button className="close-menu" onClick={closeMenu}>
                  ✕
                </button>
              </div>

              <ul className="mobile-nav-links">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={location.pathname === item.path ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      <div className="mobile-nav-text">
                        <span className="mobile-nav-label">{item.label}</span>
                        <span className="mobile-nav-description">{item.description}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mobile-menu-footer">
                <button 
                  onClick={handleLogout} 
                  className={`mobile-logout-btn ${isLoggingOut ? 'logging-out' : ''}`}
                  disabled={isLoggingOut}
                >
                  <span className="mobile-logout-icon">
                    {isLoggingOut ? '⏳' : '🚪'}
                  </span>
                  <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
                </button>
                
                <div className="mobile-footer-info">
                  <p>Built with ❤️ using Flask + React</p>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          {isMenuOpen && <div className="mobile-backdrop" onClick={closeMenu}></div>}
        </>
      )}
    </>
  );
};

export default Navbar;