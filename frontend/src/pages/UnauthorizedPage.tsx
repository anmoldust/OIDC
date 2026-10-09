import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <ShieldOff size={64} className="error-icon" />
      <h1>Access Denied</h1>
      <p>You don't have the required role to view this page.</p>
      <button className="btn-primary-large" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
