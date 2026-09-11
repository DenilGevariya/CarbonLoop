import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Laptop, Trash2 } from 'lucide-react';
import { FadeUp } from '@/animations';

export const SecurityPage: React.FC = () => {
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    const res = await apiRequest('/auth/sessions');
    if (res.success && res.data) {
      setSessions(res.data);
    }
    setSessionsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError("New passwords don't match.");
      return;
    }

    setPassLoading(true);
    setPassMsg(null);
    setPassError(null);

    const res = await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    if (res.success) {
      setPassMsg('Password changed successfully. Your sessions have been revoked for security. Please sign in again.');
      setTimeout(async () => {
        await logout();
      }, 2500);
    } else {
      setPassError(res.error?.message || 'Failed to change password.');
    }
    setPassLoading(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    const res = await apiRequest(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
    if (res.success) {
      fetchSessions();
    }
  };

  return (
    <div className="space-y-8 bg-[#F7F5EF] text-[#171A18] max-w-5xl">
      
      {/* Change Password Form */}
      <FadeUp className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 space-y-6">
        <div className="border-b border-[#E2DDD5] pb-4 space-y-1">
          <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
            AUTHENTICATION SECURITY
          </span>
          <h2 className="text-2xl font-bold text-[#171A18] tracking-tight mt-2">
            Change Account Password
          </h2>
          <p className="text-xs text-[#5C6560] font-serif">
            Passwords must contain at least 8 characters, 1 uppercase letter, and 1 numeric digit.
          </p>
        </div>

        {passMsg && (
          <div className="p-3 bg-[#173D32]/10 border border-[#173D32] text-[#173D32] text-xs font-mono font-bold">
            ✓ {passMsg}
          </div>
        )}

        {passError && (
          <div className="p-3 bg-[#8C6D38]/10 border border-[#8C6D38] text-[#8C6D38] text-xs font-mono">
            ⚠️ {passError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono text-[#171A18] uppercase">Current Password</Label>
            <div className="relative">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-9 bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#171A18] uppercase">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#171A18] uppercase">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2DDD5] flex justify-end">
            <Button
              type="submit"
              disabled={passLoading}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase py-3 px-6 rounded-none border border-[#173D32]"
            >
              {passLoading ? 'Updating Password...' : 'Update Password & Revoke Sessions'}
            </Button>
          </div>
        </form>
      </FadeUp>

      {/* Active Sessions List */}
      <FadeUp delay={0.2} className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 space-y-6">
        <div className="border-b border-[#E2DDD5] pb-4 space-y-1">
          <h3 className="text-lg font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <Laptop className="size-4 text-[#173D32]" /> Active Authenticated Sessions
          </h3>
          <p className="text-xs text-[#5C6560] font-serif">
            Revoke any active session to log out unrecognised devices or old browser instances.
          </p>
        </div>

        {sessionsLoading ? (
          <div className="p-4 font-mono text-xs text-[#5C6560]">Loading active sessions...</div>
        ) : (
          <div className="divide-y divide-[#E2DDD5]">
            {sessions.map((s) => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171A18] font-mono">
                      {s.userAgent ? s.userAgent.substring(0, 65) : 'Unknown Device Agent'}
                    </span>
                    {s.isCurrent && (
                      <span className="bg-[#173D32] text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                        CURRENT SESSION
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[#5C6560]">
                    IP Address: <span className="text-[#171A18] font-bold">{s.ipAddress || '127.0.0.1'}</span> • Last Active: <span className="text-[#173D32]">{new Date(s.lastUsedAt).toLocaleString()}</span>
                  </p>
                </div>

                {!s.isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevokeSession(s.id)}
                    className="bg-[#EBE7DF] hover:bg-[#8C6D38] hover:text-white text-[#171A18] border-[#DCD6C9] font-mono text-xs uppercase rounded-none"
                  >
                    <Trash2 className="size-3.5 mr-1" /> Revoke Session
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </FadeUp>

    </div>
  );
};
