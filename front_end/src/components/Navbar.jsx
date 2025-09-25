import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar on auth pages
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>💰 MoneyHub</h2>
        {user && (
          <div className="user-info">
            <span className="welcome">Welcome, {user.username}!</span>
          </div>
        )}
      </div>
      
      <ul className="nav-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link to="/transactions" className={location.pathname === '/transactions' ? 'active' : ''}>
            💳 Transactions
          </Link>
        </li>
        <li>
          <Link to="/goals" className={location.pathname === '/goals' ? 'active' : ''}>
            🎯 Goals
          </Link>
        </li>
      </ul>
      
      <div className="nav-footer">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
        <p>Built with ❤️ using Flask + React</p>
      </div>
    </nav>
  );
};

export default Navbar;