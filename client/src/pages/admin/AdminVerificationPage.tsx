import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerificationQueue } from '@/features/verification/hooks/useVerification';
import { VerificationBadge } from '@/features/verification/components/VerificationBadge';
import { ShieldCheck, Filter, ArrowRight } from 'lucide-react';

export const AdminVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('SUBMITTED');
  const [selectedType, setSelectedType] = useState<string>('');

  const { items, total, loading, refetch } = useVerificationQueue(
    selectedStatus || undefined,
    selectedType || undefined
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#173D32]/10 text-[#173D32] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>CARBONLOOP NETWORK AUDIT & REVIEWER QUEUE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#171A18] tracking-tight">
            Verification Queue Workspace
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review technical evidence documents, gas chromatography purity reports, and industrial facility licenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] text-[#171A18] font-bold text-xs rounded hover:bg-[#F7F5EF] transition"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Pending Review', value: 'SUBMITTED' },
              { label: 'Under Review', value: 'UNDER_REVIEW' },
              { label: 'Changes Requested', value: 'CHANGES_REQUESTED' },
              { label: 'Verified', value: 'VERIFIED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'All Statuses', value: '' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded uppercase tracking-wider transition ${
                  selectedStatus === tab.value
                    ? 'bg-[#173D32] text-[#F7F5EF]'
                    : 'bg-[#F7F5EF] text-neutral-700 hover:bg-[#E2DDD5]/50 border border-[#E2DDD5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-1.5 text-xs font-bold text-[#171A18] focus:outline-none"
            >
              <option value="">All Verification Types</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="FACILITY">Facility</option>
              <option value="CO2_PURITY">CO₂ Purity</option>
              <option value="TECHNICAL_SPECIFICATION">Technical Spec</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-600">
          <span>Showing <strong>{items.length}</strong> of <strong>{total}</strong> queue entries</span>
          <span className="text-[10px] text-neutral-500">Sorted by submission timestamp & status priority</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading reviewer queue...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-[#173D32]/40" />
            <p className="text-sm font-bold text-[#171A18]">No verification requests found matching filter.</p>
            <p className="text-xs text-neutral-500">Select another status tab to inspect processed history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F7F5EF] border-b border-[#E2DDD5] text-neutral-600 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 font-bold">Target Entity / Org</th>
                  <th className="p-3.5 font-bold">Verification Type</th>
                  <th className="p-3.5 font-bold">Evidence Document</th>
                  <th className="p-3.5 font-bold">Submitted Date</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F5EF]/60 transition">
                    <td className="p-3.5 font-bold text-[#171A18]">
                      <div>{item.organizationName || 'Organization'}</div>
                      {item.facilityName && (
                        <span className="text-[10px] font-normal text-neutral-500 block">
                          Facility: {item.facilityName}
                        </span>
                      )}
                      {item.listingCode && (
                        <span className="text-[10px] font-normal text-[#173D32] block">
                          Listing Code: {item.listingCode}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-[#173D32] uppercase text-[11px]">
                      {item.verificationType}
                    </td>

                    <td className="p-3.5 text-neutral-700">
                      {item.documentName ? (
                        <span className="font-semibold">{item.documentName}</span>
                      ) : (
                        <span className="text-neutral-400 italic">No document attached</span>
                      )}
                    </td>

                    <td className="p-3.5 text-neutral-600">
                      {new Date(item.submittedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-3.5">
                      <VerificationBadge status={item.status} size="sm" showPopoverOnClick={false} />
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/verification/${item.id}`)}
                        className="px-3 py-1.5 bg-[#173D32] text-[#F7F5EF] font-bold text-xs rounded hover:bg-[#123027] transition inline-flex items-center gap-1.5"
                      >
                        <span>Review Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
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

export default AdminVerificationPage;
