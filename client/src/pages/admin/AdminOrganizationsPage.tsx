import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAdminOrganizations } from '../../features/admin/hooks/useAdmin';
import { adminApi } from '../../features/admin/api/adminApi';
import type { AdminOrgListItem } from '../../features/admin/api/adminApi';

export const AdminOrganizationsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { items, pagination, isLoading, error, refresh } = useAdminOrganizations({
    search,
    type,
    status,
    page,
    limit: 15,
  });

  const [selectedOrg, setSelectedOrg] = useState<AdminOrgListItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>('SUSPENDED');
  const [suspensionReason, setSuspensionReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleStatusChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    if (newStatus === 'SUSPENDED' && !suspensionReason.trim()) {
      setUpdateError('A non-empty suspension reason is required when suspending an organization.');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);
      await adminApi.setOrganizationStatus(selectedOrg.id, newStatus, suspensionReason);
      setSelectedOrg(null);
      setSuspensionReason('');
      await refresh();
    } catch (err: any) {
      setUpdateError(err?.message || 'Failed to update organization status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#5D87FF]" /> Organization Management Registry
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1 font-medium">
            Global directory of CO₂ emitters, industrial utilizers, logistics providers, and verified entities.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
              placeholder="Search by company name, slug, or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Org Types</option>
            <option value="EMITTER">CO₂ Emitter</option>
            <option value="BUYER">CO₂ Buyer / Utilizer</option>
            <option value="LOGISTICS">Logistics Provider</option>
            <option value="VERIFIER">Third-Party Verifier</option>
            <option value="ADMIN">Platform Operator</option>
          </select>

          <select
            className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Organizations Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Fetching Organization Registry Records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Organization Name</th>
                  <th className="py-3 px-4">Org Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Trust Verification</th>
                  <th className="py-3 px-4">Facilities / Listings</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {items.map((org) => (
                  <tr key={org.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/admin/organizations/${org.id}`} className="font-bold text-[#2A3547] hover:text-[#5D87FF]">
                        {org.name}
                      </Link>
                      <span className="block text-[11px] text-[#5A6A85]">/{org.slug}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#ECF2FF] text-[#5D87FF] rounded uppercase">
                        {org.orgType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85]">
                      {org.city || 'Gujarat'}, {org.state || 'India'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                          org.verificationStatus === 'VERIFIED'
                            ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                            : 'bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/20'
                        }`}
                      >
                        {org.verificationStatus === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                        {org.verificationStatus || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#5A6A85]">
                      {org.facilitiesCount} Facs • {org.activeListingsCount} Supply / {org.activeRequirementsCount} Req
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                          org.status === 'SUSPENDED'
                            ? 'bg-[#FBF2EF] text-[#FA896B] border border-[#FA896B]/20'
                            : org.status === 'ACTIVE'
                            ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                            : 'bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF]'
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrg(org);
                            setNewStatus(org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white text-[#2A3547] border border-[#E5EAEF] hover:bg-[#F6F9FC] rounded-lg shadow-xs transition-colors"
                        >
                          {org.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <Link
                          to={`/admin/organizations/${org.id}`}
                          className="p-1 text-[#5A6A85] hover:text-[#5D87FF] transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-[#E5EAEF] bg-[#F6F9FC] flex items-center justify-between text-xs text-[#5A6A85] font-semibold">
          <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total organizations)</span>
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

      {/* Suspension / Status Change Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A3547]/50 backdrop-blur-xs">
          <div className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
              <h3 className="font-bold text-[#2A3547] text-base">Modify Organization Status</h3>
              <button onClick={() => setSelectedOrg(null)} className="text-[#5A6A85] hover:text-[#2A3547]">✕</button>
            </div>

            <form onSubmit={handleStatusChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A6A85] uppercase mb-1">
                  Target Organization
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedOrg.name}
                  className="w-full bg-[#E5EAEF]/50 border border-[#E5EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#2A3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A6A85] uppercase mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-[#E5EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#2A3547]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              {newStatus === 'SUSPENDED' && (
                <div>
                  <label className="block text-xs font-semibold text-[#FA896B] uppercase mb-1">
                    Suspension Reason (Required for Audit Trail)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="Enter compliance breach or payment default rationale..."
                    className="w-full bg-white border border-[#FA896B]/50 rounded-lg p-2.5 text-xs text-[#2A3547] focus:outline-none focus:border-[#FA896B]"
                  />
                </div>
              )}

              {updateError && (
                <div className="p-3 bg-[#FBF2EF] border border-[#FA896B]/30 text-[#FA896B] rounded-lg text-xs font-medium">
                  {updateError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAEF]">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="px-4 py-2 text-xs text-[#5A6A85] hover:bg-[#E5EAEF]/50 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold bg-[#5D87FF] text-white rounded-lg hover:bg-[#4570EA] disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Confirm Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
