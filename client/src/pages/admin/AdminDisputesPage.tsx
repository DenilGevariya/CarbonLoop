import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Filter, Search, RefreshCw } from 'lucide-react';
import { adminApi } from '../../features/admin/api/adminApi';

export const AdminDisputesPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.listDisputes({
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: searchQuery || undefined,
      });
      if (res?.items) {
        setDisputes(res.items);
      }
    } catch (err: any) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const notes = window.prompt(`Notes for setting dispute status to ${newStatus}:`) || undefined;
    try {
      setActionId(id);
      await adminApi.updateDisputeStatus(id, newStatus, notes);
      await fetchDisputes();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update dispute status');
    } finally {
      setActionId(null);
    }
  };

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const reviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 font-sans text-[#2A3547] max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4 bg-white p-6 rounded-xl border">
        <div>
          <span className="text-xs font-bold text-[#FA896B] bg-[#FDEDE8] border border-[#FA896B]/20 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-2">
            ADMIN COMPLAINTS & DISPUTES COMMAND
          </span>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Complaints & Dispute Resolution
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Review, investigate, and resolve commercial disputes linked directly to platform transactions, listings, and shipments.
          </p>
        </div>
        <button
          onClick={() => fetchDisputes()}
          className="px-4 py-2 bg-[#F6F9FC] border border-[#E5EAEF] text-[#5A6A85] text-xs font-semibold rounded-lg hover:bg-[#ECF2FF] hover:text-[#5D87FF] flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Disputes</span>
        </button>
      </div>

      {/* Real DB Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setFilterStatus('OPEN')}
          className={`bg-white border p-5 rounded-xl shadow-xs cursor-pointer hover:border-[#FA896B] transition-all ${
            filterStatus === 'OPEN' ? 'border-[#FA896B] ring-2 ring-[#FA896B]/20' : 'border-[#E5EAEF]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Open Disputes</span>
            <AlertTriangle className="w-5 h-5 text-[#FA896B]" />
          </div>
          <p className="text-3xl font-bold text-[#FA896B] mt-2">
            {isLoading ? '...' : openCount}
          </p>
        </div>

        <div
          onClick={() => setFilterStatus('UNDER_REVIEW')}
          className={`bg-white border p-5 rounded-xl shadow-xs cursor-pointer hover:border-[#FFAE1F] transition-all ${
            filterStatus === 'UNDER_REVIEW' ? 'border-[#FFAE1F] ring-2 ring-[#FFAE1F]/20' : 'border-[#E5EAEF]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Under Review</span>
            <ShieldAlert className="w-5 h-5 text-[#FFAE1F]" />
          </div>
          <p className="text-3xl font-bold text-[#FFAE1F] mt-2">
            {isLoading ? '...' : reviewCount}
          </p>
        </div>

        <div
          onClick={() => setFilterStatus('RESOLVED')}
          className={`bg-white border p-5 rounded-xl shadow-xs cursor-pointer hover:border-[#13DEB9] transition-all ${
            filterStatus === 'RESOLVED' ? 'border-[#13DEB9] ring-2 ring-[#13DEB9]/20' : 'border-[#E5EAEF]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5A6A85] uppercase">Resolved</span>
            <CheckCircle2 className="w-5 h-5 text-[#13DEB9]" />
          </div>
          <p className="text-3xl font-bold text-[#13DEB9] mt-2">
            {isLoading ? '...' : resolvedCount}
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
              placeholder="Search by Dispute Code, Parties, Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5A6A85]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg px-3 py-2 text-xs font-semibold text-[#2A3547] focus:outline-none"
          >
            <option value="all">All Dispute Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Dispute Records Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85]">
            Loading Dispute Case Files...
          </div>
        ) : disputes.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-[#5A6A85] space-y-2">
            <ShieldAlert className="w-8 h-8 text-[#5A6A85] mx-auto opacity-40" />
            <p>No dispute records found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5EAEF]">
            {disputes.map((disp) => (
              <div key={disp.id} className="p-5 hover:bg-[#F6F9FC] transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#2A3547]">{disp.disputeCode || disp.id}</span>
                    <span className="px-2.5 py-0.5 bg-[#ECF2FF] text-[#5D87FF] text-[10px] font-bold rounded-full uppercase">
                      {disp.disputeType?.replace(/_/g, ' ') || 'COMMERCIAL DISPUTE'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                        disp.status === 'OPEN'
                          ? 'bg-[#FA896B]/15 text-[#FA896B]'
                          : disp.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#E6FFFA] text-[#13DEB9]'
                      }`}
                    >
                      {disp.status}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#5A6A85]">
                    Opened: {new Date(disp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#2A3547]">Parties: {disp.parties || `${disp.complainantName} vs. ${disp.respondentName}`}</p>
                  <p className="text-[#5A6A85]">{disp.description}</p>
                  {disp.evidenceNotes && (
                    <p className="text-[11px] text-[#5D87FF] font-semibold bg-[#ECF2FF]/60 p-2 rounded-lg">
                      Evidence: {disp.evidenceNotes}
                    </p>
                  )}
                  {disp.resolutionNotes && (
                    <p className="text-[11px] text-[#13DEB9] font-semibold bg-[#E6FFFA] p-2 rounded-lg">
                      Resolution: {disp.resolutionNotes}
                    </p>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {disp.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateStatus(disp.id, 'UNDER_REVIEW')}
                      disabled={actionId === disp.id}
                      className="px-3 py-1.5 bg-[#FFAE1F] text-white text-xs font-semibold rounded-lg hover:bg-amber-600 cursor-pointer disabled:opacity-50"
                    >
                      [Review]
                    </button>
                  )}

                  {disp.status !== 'RESOLVED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(disp.id, 'UNDER_REVIEW')}
                        disabled={actionId === disp.id}
                        className="px-3 py-1.5 border border-[#5D87FF] text-[#5D87FF] text-xs font-semibold rounded-lg hover:bg-[#ECF2FF] cursor-pointer disabled:opacity-50"
                      >
                        [Request Evidence]
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(disp.id, 'RESOLVED')}
                        disabled={actionId === disp.id}
                        className="px-3 py-1.5 bg-[#13DEB9] text-white text-xs font-bold rounded-lg hover:bg-[#0EBA9B] cursor-pointer disabled:opacity-50"
                      >
                        [Resolve]
                      </button>
                    </>
                  )}

                  {disp.status === 'RESOLVED' && (
                    <span className="text-xs text-[#13DEB9] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Resolved Case File (Retained)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
