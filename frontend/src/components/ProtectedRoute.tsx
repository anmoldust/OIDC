import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Route guard that checks authentication and optional role requirements.
 * Redirects to /login if unauthenticated, or /unauthorized if lacking required roles.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, isInitialized, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="spinner" aria-label="Loading..." />
        <p>Initializing secure connection...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
