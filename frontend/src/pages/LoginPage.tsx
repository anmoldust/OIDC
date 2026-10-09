import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, ChevronRight, Zap, Lock, Code } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <Shield size={40} />
        </div>
        <h1 className="login-title">OIDC Demo</h1>
        <p className="login-subtitle">
          Production-grade authentication powered by{' '}
          <strong>Spring Boot</strong> &amp; <strong>Keycloak</strong>
        </p>

        <div className="login-features">
          <div className="feature-item">
            <Lock size={16} />
            <span>OpenID Connect with PKCE</span>
          </div>
          <div className="feature-item">
            <Zap size={16} />
            <span>JWT with automatic refresh</span>
          </div>
          <div className="feature-item">
            <Code size={16} />
            <span>Role-Based Access Control</span>
          </div>
        </div>

        <button className="btn-primary-large" onClick={login} id="btn-keycloak-login">
          <Shield size={18} />
          Sign in with Keycloak
          <ChevronRight size={18} />
        </button>

        <p className="login-footer">
          Demo credentials: <code>admin/admin123</code> · <code>user/user123</code>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
