import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone } from 'lucide-react';
import { FadeUp } from '@/animations';

export const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);

    const res = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setMsg('User profile updated successfully.');
      await refetchUser();
    } else {
      setError(res.error?.message || 'Failed to update profile.');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 bg-[#F7F5EF] text-[#171A18] max-w-4xl">
      <FadeUp className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 space-y-6">
        <div className="border-b border-[#E2DDD5] pb-4 space-y-1">
          <span className="bg-[#EBE7DF] text-[#173D32] border border-[#DCD6C9] font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 inline-block">
            USER ACCOUNT MANAGEMENT
          </span>
          <h2 className="text-2xl font-bold text-[#171A18] tracking-tight mt-2">
            Personal Representative Profile
          </h2>
          <p className="text-xs text-[#5C6560] font-serif">
            Manage your authenticated user identity parameters and contact details.
          </p>
        </div>

        {msg && (
          <div className="p-3 bg-[#173D32]/10 border border-[#173D32] text-[#173D32] text-xs font-mono font-bold">
            ✓ {msg}
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#8C6D38]/10 border border-[#8C6D38] text-[#8C6D38] text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#171A18] uppercase">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-mono text-[#171A18] uppercase">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono text-[#171A18] uppercase">Work Email Address (Read-Only)</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
              <Input
                value={user?.email || ''}
                disabled
                className="pl-9 bg-[#E2DDD5]/60 border-[#DCD6C9] text-xs font-mono text-[#5C6560] rounded-none cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] font-mono text-[#5C6560]">
              * Email address changes require administrative identity re-verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono text-[#171A18] uppercase">Contact Phone Number</Label>
            <div className="relative">
              <Phone className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6560]" />
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98234 56789"
                className="pl-9 bg-[#EBE7DF] border-[#DCD6C9] text-xs font-mono rounded-none focus-visible:ring-[#173D32]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2DDD5] flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase py-3 px-6 rounded-none border border-[#173D32]"
            >
              {saving ? 'Updating Profile...' : 'Save User Profile'}
            </Button>
          </div>
        </form>
      </FadeUp>
    </div>
  );
};
