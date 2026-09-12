import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Key, UserX, UserCheck } from 'lucide-react';
import { useAdminUsers } from '../../features/admin/hooks/useAdmin';
import { adminApi } from '../../features/admin/api/adminApi';
import type { AdminUserListItem } from '../../features/admin/api/adminApi';

export const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { items, pagination, isLoading, error, refresh } = useAdminUsers({
    search,
    status,
    page,
    limit: 15,
  });

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (user: AdminUserListItem) => {
    try {
      setTogglingId(user.id);
      await adminApi.toggleUserActive(user.id, !user.isActive);
      await refresh();
    } catch (err) {
      console.error('Failed to toggle user active status', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#173D32]" /> User Access & Session Management
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Enforce role-based security permissions, account activation state, and revoke session tokens.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E2DDD5] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-[#FAF8F5] border border-[#E2DDD5] pl-9 pr-4 py-2 rounded-lg text-xs font-medium focus:outline-none focus:border-[#173D32]"
              placeholder="Search by user email, first name, or last name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <select
          className="bg-[#FAF8F5] border border-[#E2DDD5] px-3 py-2 rounded-lg text-xs font-medium focus:outline-none text-stone-700"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Account Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Deactivated Only</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
            Loading User Registry...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EA] border-b border-[#E2DDD5] text-stone-700 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Affiliated Organization</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]/60">
                {items.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/admin/users/${user.id}`} className="font-bold text-[#171A18] hover:text-[#173D32]">
                        {user.firstName} {user.lastName}
                      </Link>
                      <span className="block text-[11px] font-mono text-stone-500">{user.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap font-mono">
                        {(user.roles || ['USER']).map((r, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                              r.toLowerCase().includes('admin')
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700">
                      {user.organizationName || 'Platform Staff'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={togglingId === user.id}
                          className={`px-2.5 py-1 text-[11px] font-medium border rounded shadow-xs transition-colors ${
                            user.isActive
                              ? 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                              : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          {togglingId === user.id ? 'Processing...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="px-2 py-1 text-[11px] font-mono text-stone-700 bg-stone-100 border border-stone-200 hover:bg-stone-200 rounded flex items-center gap-1"
                        >
                          <Key className="w-3 h-3" /> Sessions
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E2DDD5] bg-[#F4F0EA] flex items-center justify-between font-mono text-xs text-stone-600">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-white border border-[#E2DDD5] rounded hover:bg-stone-100 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-white border border-[#E2DDD5] rounded hover:bg-stone-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
