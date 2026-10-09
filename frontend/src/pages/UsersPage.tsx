import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import { Users, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

interface PageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch } = useQuery<PageResponse>({
    queryKey: ['users', page],
    queryFn: () =>
      apiClient
        .get(`/users?page=${page}&size=10&sort=createdAt,desc`)
        .then((r) => r.data),
  });

  const statusColor = (status: string) =>
    status === 'ACTIVE' ? 'status-active' : status === 'INACTIVE' ? 'status-inactive' : 'status-suspended';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} />
            User Management
          </h1>
          <p className="page-subtitle">
            {data?.totalElements ?? 0} users registered
          </p>
        </div>
        <button className="btn-icon" onClick={() => refetch()} title="Refresh" disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} />
        <input
          id="users-search"
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton" /></td>
                    <td><div className="skeleton" /></td>
                    <td><div className="skeleton skeleton-sm" /></td>
                    <td><div className="skeleton" /></td>
                  </tr>
                ))
              : data?.content
                  .filter(
                    (u) =>
                      !search ||
                      `${u.firstName} ${u.lastName} ${u.email}`
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="text-muted">{user.email}</td>
                      <td>
                        <span className={`status-badge ${statusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            id="users-prev-page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="page-info">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            className="btn-page"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            id="users-next-page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
