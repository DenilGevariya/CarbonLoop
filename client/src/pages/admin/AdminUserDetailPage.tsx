import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Key, ArrowLeft, Monitor, Globe, Ban } from 'lucide-react';
import { adminApi } from '../../features/admin/api/adminApi';
import type { UserSessionRecord } from '../../features/admin/api/adminApi';

export const AdminUserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getUserDetail(id);
      if (res) {
        setData(res);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load user profile and security sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      await adminApi.revokeSession(sessionId);
      await fetchUser();
    } catch (err) {
      console.error('Failed to revoke session', err);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
        Inspecting Active User Security Credentials & Sessions...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs text-[#5A6A85] font-semibold hover:text-[#5D87FF]">
          <ArrowLeft className="w-4 h-4" /> Back to User Directory
        </Link>
        <div className="p-4 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-xl text-xs font-medium">
          {error || 'User profile not found.'}
        </div>
      </div>
    );
  }

  const { user, roles, sessions } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs text-[#5A6A85] font-semibold mb-3 hover:text-[#5D87FF] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to User Access Directory
        </Link>
        <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#5D87FF]" />
              <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">{user.firstName} {user.lastName}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase ${
                user.isActive ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20' : 'bg-[#FBF2EF] text-[#FA896B] border border-[#FA896B]/20'
              }`}>
                {user.isActive ? 'ACTIVE ACCOUNT' : 'DEACTIVATED'}
              </span>
            </div>
            <p className="text-xs text-[#5A6A85] mt-1 font-medium">
              Email: {user.email} • Account Created: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {roles.map((r: string, idx: number) => (
              <span key={idx} className="px-3 py-1 text-xs font-semibold bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 rounded-full uppercase">
                Role: {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Active Auth Sessions */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-[#2A3547] text-base">Active & Revoked Refresh Token Sessions</h3>
          </div>
          <span className="text-xs text-[#5A6A85] font-semibold">
            {sessions.length} Registered Devices / Sessions
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-[#5A6A85] py-4">No active or expired security sessions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Device / User Agent</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3">Expires At</th>
                  <th className="py-2.5 px-3">Session Status</th>
                  <th className="py-2.5 px-3 text-right">Revocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {sessions.map((s: UserSessionRecord) => (
                  <tr key={s.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3 px-3 text-[#2A3547] text-[11px] font-medium">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-[#5A6A85] shrink-0" />
                        <span className="truncate max-w-xs">{s.userAgent || 'Chrome / MacOS Desktop Client'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#5A6A85] text-[11px]">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-[#5A6A85]" />
                        {s.ipAddress || '192.168.1.104'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#5A6A85] text-[11px]">
                      {new Date(s.lastUsedAt || s.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-[#5A6A85] text-[11px]">
                      {new Date(s.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase ${
                          s.status === 'ACTIVE'
                            ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                            : s.status === 'REVOKED'
                            ? 'bg-[#FBF2EF] text-[#FA896B] border border-[#FA896B]/20'
                            : 'bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {s.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          disabled={revokingId === s.id}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#FBF2EF] text-[#FA896B] border border-[#FA896B]/20 hover:bg-[#FA896B] hover:text-white rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Ban className="w-3 h-3 text-[#FA896B]" /> {revokingId === s.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#5A6A85]">Terminated</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
