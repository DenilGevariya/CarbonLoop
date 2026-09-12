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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5D87FF]" /> User Access & Session Management
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1 font-medium">
            Enforce role-based security permissions, account activation state, and revoke session tokens.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
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
          className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
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
        <div className="p-4 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Loading User Registry...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Assigned Roles</th>
                  <th className="py-3 px-4">Affiliated Organization</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {items.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/admin/users/${user.id}`} className="font-bold text-[#2A3547] hover:text-[#5D87FF]">
                        {user.firstName} {user.lastName}
                      </Link>
                      <span className="block text-[11px] text-[#5A6A85]">{user.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(user.roles || ['USER']).map((r, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                              r.toLowerCase().includes('admin')
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85]">
                      {user.organizationName || 'Platform Staff'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                          user.isActive
                            ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                            : 'bg-[#FBF2EF] text-[#FA896B] border border-[#FA896B]/20'
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
                          className={`px-2.5 py-1 text-[11px] font-semibold border rounded-lg shadow-xs transition-colors ${
                            user.isActive
                              ? 'bg-[#FBF2EF] text-[#FA896B] border-[#FA896B]/30 hover:bg-[#FA896B] hover:text-white'
                              : 'bg-[#E8F9F5] text-[#13DEB9] border-[#13DEB9]/30 hover:bg-[#13DEB9] hover:text-white'
                          }`}
                        >
                          {togglingId === user.id ? 'Processing...' : user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#5A6A85] bg-[#F6F9FC] border border-[#E5EAEF] hover:bg-[#E5EAEF] rounded-lg flex items-center gap-1 transition-colors"
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
        <div className="px-4 py-3 border-t border-[#E5EAEF] bg-[#F6F9FC] flex items-center justify-between text-xs text-[#5A6A85] font-semibold">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-white border border-[#E5EAEF] rounded-lg hover:bg-[#F6F9FC] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-white border border-[#E5EAEF] rounded-lg hover:bg-[#F6F9FC] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
