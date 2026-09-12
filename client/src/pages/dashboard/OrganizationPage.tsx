import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ShieldCheck, Users, Factory } from 'lucide-react';
import { FadeUp } from '@/animations';

export const OrganizationPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchOrgDetails = async () => {
    if (!activeOrg?.organizationId) return;
    setLoading(true);
    const res = await apiRequest(`/organizations/${activeOrg.organizationId}`);
    if (res.success && res.data) {
      setOrgData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrgDetails();
  }, [activeOrg?.organizationId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.organizationId) return;
    setSaving(true);
    setMsg(null);

    const res = await apiRequest(`/organizations/${activeOrg.organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(orgData),
    });

    if (res.success) {
      setMsg('Organization profile updated successfully.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-[#5C6560]">
        Loading organization details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#2A3547]">
      
      {/* Header Banner */}
      <FadeUp className="bg-white border border-[#E5EAEF] p-6 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#5D87FF] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              {orgData?.org_type || 'ORGANIZATION'}
            </span>
            <span className="bg-[#E6FFFA] text-[#13DEB9] border border-[#13DEB9]/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="size-3" /> VERIFICATION: {orgData?.verification_status || 'VERIFIED'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            {orgData?.name}
          </h2>
          <p className="text-xs text-[#5A6A85]">
            Legal Name: <span className="font-bold text-[#2A3547]">{orgData?.legal_name}</span> • Slug: <span>{orgData?.slug}</span>
          </p>
        </div>
      </FadeUp>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Editable Parameters Form */}
        <FadeUp className="lg:col-span-8">
          <div className="bg-white border border-[#E5EAEF] p-6 rounded-xl shadow-xs space-y-6">
            <div className="border-b border-[#E5EAEF] pb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#2A3547] flex items-center gap-2">
                <Building2 className="size-4 text-[#5D87FF]" /> Corporate Parameters & Contact Details
              </h3>
              {msg && <span className="text-xs text-[#13DEB9] font-bold">✓ {msg}</span>}
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Organization Name</Label>
                  <Input
                    value={orgData?.name || ''}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Legal Name</Label>
                  <Input
                    value={orgData?.legal_name || ''}
                    onChange={(e) => setOrgData({ ...orgData, legal_name: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Industry Sector</Label>
                  <Input
                    value={orgData?.industry || ''}
                    onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Website URL</Label>
                  <Input
                    value={orgData?.website || ''}
                    onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Corporate Phone</Label>
                  <Input
                    value={orgData?.phone || ''}
                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Corporate Email</Label>
                  <Input
                    value={orgData?.email || ''}
                    onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Street Address</Label>
                <Input
                  value={orgData?.address_line1 || ''}
                  onChange={(e) => setOrgData({ ...orgData, address_line1: e.target.value })}
                  className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">City</Label>
                  <Input
                    value={orgData?.city || ''}
                    onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">State</Label>
                  <Input
                    value={orgData?.state || ''}
                    onChange={(e) => setOrgData({ ...orgData, state: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#5A6A85] uppercase">Postal Code</Label>
                  <Input
                    value={orgData?.postal_code || ''}
                    onChange={(e) => setOrgData({ ...orgData, postal_code: e.target.value })}
                    className="bg-[#F6F9FC] border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5EAEF] flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold uppercase py-3 px-6 rounded-lg cursor-pointer shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Organization Profile'}
                </Button>
              </div>
            </form>
          </div>
        </FadeUp>

        {/* Right Column: Organization Members & Facilities Count */}
        <FadeUp delay={0.2} className="lg:col-span-4 space-y-6">
          
          {/* Facility Summary */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 space-y-3 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
              <span className="text-[#5A6A85] font-semibold uppercase flex items-center gap-2">
                <Factory className="size-4 text-[#5D87FF]" /> Facility Infrastructure
              </span>
              <span className="bg-[#ECF2FF] text-[#5D87FF] font-bold px-2.5 py-0.5 rounded-full">
                {orgData?.facilitiesCount || 0} UNITS
              </span>
            </div>
            <p className="text-xs text-[#5A6A85]">
              Operational industrial stacks, absorption units, or mineralization facilities registered to this entity.
            </p>
          </div>

          {/* Organization Members List */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#E5EAEF] pb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#2A3547] flex items-center gap-2">
                <Users className="size-4 text-[#5D87FF]" /> Active Members ({orgData?.members?.length || 0})
              </h4>
            </div>

            <div className="divide-y divide-[#E5EAEF]">
              {orgData?.members?.map((m: any) => (
                <div key={m.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2A3547]">{m.firstName} {m.lastName}</span>
                    {m.is_primary_contact && (
                      <span className="text-[10px] font-semibold bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 px-2 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5A6A85]">{m.email}</p>
                  <p className="text-[10px] text-[#5D87FF] font-semibold">{m.job_title || m.role}</p>
                </div>
              ))}
            </div>
          </div>

        </FadeUp>

      </div>
    </div>
  );
};
