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
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-[#2A3547]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECF2FF] text-[#5D87FF] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5D87FF]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>CARBONLOOP NETWORK AUDIT & REVIEWER QUEUE</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Verification Queue Workspace
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Review technical evidence documents, gas chromatography purity reports, and industrial facility licenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-[#E5EAEF] text-[#2A3547] font-semibold text-xs rounded-lg hover:bg-[#ECF2FF] hover:text-[#5D87FF] transition shadow-xs cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5EAEF] pb-3">
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition cursor-pointer ${
                  selectedStatus === tab.value
                    ? 'bg-[#5D87FF] text-white shadow-xs'
                    : 'bg-[#F6F9FC] text-[#5A6A85] hover:bg-[#ECF2FF] hover:text-[#5D87FF] border border-[#E5EAEF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5A6A85]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#2A3547] focus:outline-none"
            >
              <option value="">All Verification Types</option>
              <option value="ORGANIZATION">Organization</option>
              <option value="FACILITY">Facility</option>
              <option value="CO2_PURITY">CO₂ Purity</option>
              <option value="TECHNICAL_SPECIFICATION">Technical Spec</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#5A6A85]">
          <span>Showing <strong className="text-[#2A3547]">{items.length}</strong> of <strong className="text-[#2A3547]">{total}</strong> queue entries</span>
          <span className="text-[10px] text-[#5A6A85]">Sorted by submission timestamp & status priority</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#5A6A85]">Loading reviewer queue...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-[#5D87FF]/40" />
            <p className="text-sm font-bold text-[#2A3547]">No verification requests found matching filter.</p>
            <p className="text-xs text-[#5A6A85]">Select another status tab to inspect processed history.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Target Entity / Org</th>
                  <th className="p-3.5">Verification Type</th>
                  <th className="p-3.5">Evidence Document</th>
                  <th className="p-3.5">Submitted Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#ECF2FF]/40 transition">
                    <td className="p-3.5 font-bold text-[#2A3547]">
                      <div>{item.organizationName || 'Organization'}</div>
                      {item.facilityName && (
                        <span className="text-[10px] font-normal text-[#5A6A85] block">
                          Facility: {item.facilityName}
                        </span>
                      )}
                      {item.listingCode && (
                        <span className="text-[10px] font-normal text-[#5D87FF] block">
                          Listing Code: {item.listingCode}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-bold text-[#5D87FF] uppercase text-[11px]">
                      {item.verificationType}
                    </td>

                    <td className="p-3.5 text-[#5A6A85]">
                      {item.documentName ? (
                        <span className="font-semibold text-[#2A3547]">{item.documentName}</span>
                      ) : (
                        <span className="text-[#5A6A85]/60 italic">No document attached</span>
                      )}
                    </td>

                    <td className="p-3.5 text-[#5A6A85]">
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
                        className="px-3.5 py-1.5 bg-[#5D87FF] text-white font-semibold text-xs rounded-lg hover:bg-[#4570EA] transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
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
