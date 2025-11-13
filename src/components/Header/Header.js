import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="HomeHero Logo" className="logo-img" />
            <h1>HomeHero</h1>
          </Link>

          <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            
            {user && (
              <>
                <Link to="/my-services" onClick={() => setMobileMenuOpen(false)}>My Services</Link>
                <Link to="/add-service" onClick={() => setMobileMenuOpen(false)}>Add Service</Link>
                <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              </>
            )}

            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <button onClick={handleSignOut} className="btn btn-secondary">Logout</button>
            )}
          </nav>

          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

