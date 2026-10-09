import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Shield, Users, FileText, Activity } from 'lucide-react';

interface AdminDashboard {
  adminUser: string;
  message: string;
  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingApprovals: number;
  };
}

interface AuditEntry {
  event: string;
  timestamp: string;
  user: string;
}

const AdminPage: React.FC = () => {
  const { data: dashboard, isLoading: dashLoading } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient.get('/admin/dashboard').then((r) => r.data),
  });

  const { data: auditLog, isLoading: auditLoading } = useQuery<AuditEntry[]>({
    queryKey: ['admin-audit'],
    queryFn: () => apiClient.get('/admin/audit-log').then((r) => r.data),
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Shield size={24} />
            Admin Panel
          </h1>
          <p className="page-subtitle">
            Restricted to <span className="role-badge role-admin">ADMIN</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-value">
              {dashLoading ? '…' : dashboard?.stats.totalUsers}
            </span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-success)' }}>
            <Activity size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-value">
              {dashLoading ? '…' : dashboard?.stats.activeUsers}
            </span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-warning)' }}>
            <FileText size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-value">
              {dashLoading ? '…' : dashboard?.stats.pendingApprovals}
            </span>
            <span className="stat-label">Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="card">
        <h2 className="card-title">
          <FileText size={18} />
          Audit Log
        </h2>
        {auditLoading ? (
          <div className="text-muted">Loading audit log…</div>
        ) : (
          <div className="audit-list">
            {auditLog?.map((entry, i) => (
              <div className="audit-entry" key={i}>
                <div className="audit-event">
                  <span className="audit-badge">{entry.event}</span>
                  <span className="audit-user">{entry.user}</span>
                </div>
                <span className="audit-time text-sm text-muted">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
