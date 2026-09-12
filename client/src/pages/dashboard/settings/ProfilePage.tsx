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
    <div className="space-y-8 text-[#2A3547] max-w-4xl">
      <FadeUp className="bg-white border border-[#E5EAEF] rounded-xl p-6 space-y-6 shadow-xs">
        <div className="border-b border-[#E5EAEF] pb-4 space-y-1">
          <span className="bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
            USER ACCOUNT MANAGEMENT
          </span>
          <h2 className="text-2xl font-bold text-[#2A3547] tracking-tight mt-2">
            Personal Representative Profile
          </h2>
          <p className="text-xs text-[#5A6A85]">
            Manage your authenticated user identity parameters and contact details.
          </p>
        </div>

        {msg && (
          <div className="p-3 bg-[#13DEB9]/15 border border-[#13DEB9]/30 text-[#0EAB8B] text-xs font-semibold rounded-lg">
            ✓ {msg}
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#FA896B]/15 border border-[#FA896B]/30 text-[#FA896B] text-xs font-semibold rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#2A3547] uppercase">First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#2A3547] uppercase">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#2A3547] uppercase">Work Email Address (Read-Only)</Label>
            <div className="relative">
              <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
              <Input
                value={user?.email || ''}
                disabled
                className="pl-9 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#5A6A85] rounded-lg cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-[#5A6A85]">
              * Email address changes require administrative identity re-verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#2A3547] uppercase">Contact Phone Number</Label>
            <div className="relative">
              <Phone className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98234 56789"
                className="pl-9 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg focus-visible:ring-[#5D87FF]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5EAEF] flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold uppercase py-2.5 px-6 rounded-lg shadow-xs"
            >
              {saving ? 'Updating Profile...' : 'Save User Profile'}
            </Button>
          </div>
        </form>
      </FadeUp>
    </div>
  );
};
