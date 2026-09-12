import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Factory, Package, FileText, Users, ArrowLeft, ShieldCheck, AlertOctagon } from 'lucide-react';
import { adminApi } from '../../features/admin/api/adminApi';

export const AdminOrganizationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminApi.getOrganizationDetail(id);
        if (res) {
          setData(res);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load organization detail.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-stone-500 uppercase tracking-widest">
        Loading Organization Deep-Dive Profile...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Link to="/admin/organizations" className="inline-flex items-center gap-1.5 text-xs text-stone-600 font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Organizations
        </Link>
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
          {error || 'Organization profile not found.'}
        </div>
      </div>
    );
  }

  const { organization: org, facilities, listings, requirements, members } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Navigation & Header */}
      <div>
        <Link to="/admin/organizations" className="inline-flex items-center gap-1.5 text-xs text-stone-600 font-mono mb-3 hover:text-stone-900">
          <ArrowLeft className="w-4 h-4" /> Back to Organization Registry
        </Link>
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#173D32]" />
              <h1 className="text-2xl font-bold text-[#171A18] tracking-tight">{org.name}</h1>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200 rounded uppercase">
                {org.org_type}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-mono font-bold rounded uppercase ${
                  org.status === 'SUSPENDED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {org.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Slug: /{org.slug} • Location: {org.city || 'Dahej'}, {org.state || 'Gujarat'} • Registration Date: {new Date(org.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Trust Rating: VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Suspension Alert banner if suspended */}
      {org.status === 'SUSPENDED' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
            <AlertOctagon className="w-4 h-4 text-rose-700" /> Organization Currently Suspended
          </span>
          <p className="text-rose-800 font-mono">
            Reason: {org.suspension_reason || 'Compliance audit pending by admin.'}
          </p>
        </div>
      )}

      {/* Facilities Grid */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
        <h3 className="font-semibold text-[#171A18] text-base mb-4 flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
          <Factory className="w-5 h-5 text-amber-700" /> Associated Facilities ({facilities.length})
        </h3>
        {facilities.length === 0 ? (
          <p className="text-xs text-stone-500 font-mono">No physical facility sites attached.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {facilities.map((fac: any) => (
              <div key={fac.id} className="p-3.5 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] space-y-1">
                <span className="font-bold text-xs text-[#171A18] block">{fac.name}</span>
                <span className="text-[11px] text-stone-500 block">{fac.city}, {fac.state}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold inline-block mt-1">
                  {fac.verification_status || 'VERIFIED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listings & Requirements Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Listings */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-[#171A18] text-base flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
            <Package className="w-5 h-5 text-[#173D32]" /> Active CO₂ Supply Listings ({listings.length})
          </h3>
          {listings.length === 0 ? (
            <p className="text-xs text-stone-500 font-mono">No active supply listings.</p>
          ) : (
            <div className="space-y-2">
              {listings.map((l: any) => (
                <div key={l.id} className="p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#171A18]">{l.listing_code} - {l.title}</span>
                    <span className="block text-[11px] text-stone-500 font-mono mt-0.5">
                      Purity: {l.purity_percentage}% • Volume: {l.remaining_quantity} t
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demand Requirements */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-[#171A18] text-base flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
            <FileText className="w-5 h-5 text-blue-700" /> Buyer Requirements ({requirements.length})
          </h3>
          {requirements.length === 0 ? (
            <p className="text-xs text-stone-500 font-mono">No active buyer demand requirements.</p>
          ) : (
            <div className="space-y-2">
              {requirements.map((r: any) => (
                <div key={r.id} className="p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#171A18]">{r.requirement_code || 'REQ'} - {r.title}</span>
                    <span className="block text-[11px] text-stone-500 font-mono mt-0.5">
                      Requested Quantity: {r.required_quantity_tons} t
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Organization Members */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-semibold text-[#171A18] text-base flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
          <Users className="w-5 h-5 text-purple-700" /> Organization Members & Access Roles ({members.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m: any) => (
            <div key={m.id} className="p-3.5 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5]">
              <span className="font-bold text-xs text-[#171A18] block">{m.first_name} {m.last_name}</span>
              <span className="text-[11px] font-mono text-stone-500 block">{m.email}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 text-stone-800 font-bold rounded uppercase inline-block mt-2">
                Role: {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
