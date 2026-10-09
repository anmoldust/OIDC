import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { User, Shield, CheckCircle, Clock, Activity } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Fetch the authenticated user's profile from the API
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: () => apiClient.get('/users/me').then((r) => r.data),
  });

  const statCards = [
    {
      icon: <User size={20} />,
      label: 'Account Status',
      value: profile?.status ?? '—',
      color: 'var(--color-success)',
    },
    {
      icon: <Shield size={20} />,
      label: 'Roles Assigned',
      value: user?.roles.length ?? 0,
      color: 'var(--color-accent)',
    },
    {
      icon: <CheckCircle size={20} />,
      label: 'Session',
      value: 'Active',
      color: 'var(--color-success)',
    },
    {
      icon: <Clock size={20} />,
      label: 'Member Since',
      value: profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString()
        : '—',
      color: 'var(--color-primary)',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Welcome back, <span className="text-gradient">{user?.firstName}</span> 👋
          </h1>
          <p className="page-subtitle">
            Your session is authenticated via Keycloak OIDC
          </p>
        </div>
        <div className="status-pill">
          <Activity size={14} />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-body">
              <span className="stat-value">{isLoading ? '…' : card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Token info panel */}
      <div className="card">
        <h2 className="card-title">
          <Shield size={18} />
          JWT Token Claims
        </h2>
        <div className="token-claims">
          <ClaimRow label="Subject (sub)" value={user?.id ?? '—'} />
          <ClaimRow label="Username" value={user?.username ?? '—'} />
          <ClaimRow label="Email" value={user?.email ?? '—'} />
          <ClaimRow label="Roles" value={user?.roles.join(', ') ?? '—'} />
        </div>
      </div>

      {/* Admin notice */}
      {hasRole('ADMIN') && (
        <div className="admin-banner">
          <Shield size={16} />
          <span>You have <strong>ADMIN</strong> privileges. Visit the Admin panel for advanced controls.</span>
        </div>
      )}
    </div>
  );
};

const ClaimRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="claim-row">
    <span className="claim-label">{label}</span>
    <code className="claim-value">{value}</code>
  </div>
);

export default DashboardPage;
