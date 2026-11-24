import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, Clock, ShieldCheck, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span className="brand-name">StudyBuddy</span>
          <span className="brand-tag">AI</span>
        </Link>

        {user && (
          <nav className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <BookOpen size={17} />
              <span>My Notes</span>
            </Link>
            <Link to="/ai-history" className={`nav-link ${isActive('/ai-history') ? 'active' : ''}`}>
              <Clock size={17} />
              <span>AI History</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <ShieldCheck size={17} />
                <span>Admin Analytics</span>
              </Link>
            )}
          </nav>
        )}

        <div className="nav-actions">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-badge-container">
                <div className="user-avatar">
                  <User size={15} />
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className={`user-role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Log out">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
