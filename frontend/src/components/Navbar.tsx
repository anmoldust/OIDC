import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Shield, LayoutDashboard, Users, ChevronRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, login, logout, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Shield className="brand-icon" size={22} />
        <span className="brand-text">OIDC<span className="brand-accent">Demo</span></span>
      </div>

      {isAuthenticated && (
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          {hasAnyRole(['ADMIN', 'MANAGER']) && (
            <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
              <Users size={16} />
              Users
            </Link>
          )}
          {hasRole('ADMIN') && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <Shield size={16} />
              Admin
            </Link>
          )}
        </div>
      )}

      <div className="navbar-actions">
        {isAuthenticated && user ? (
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="user-details">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <div className="user-roles">
                  {user.roles.map((role) => (
                    <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={logout} className="btn-logout" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={login} className="btn-login">
            Sign In
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
