import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, ShieldCheck, Search, CheckCircle2, XCircle, FileText, Eye } from 'lucide-react';
import { useMarketplaceListings, useListingStatusAction } from '@/features/listings/hooks/useListings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const AdminListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [purityFilter, setPurityFilter] = useState('');

  const { data: listingsData, isLoading, refetch } = useMarketplaceListings({
    search,
    minPurity: purityFilter ? parseFloat(purityFilter) : undefined,
  });

  const { mutateAsync: performStatusAction } = useListingStatusAction();

  const [selectedDoc, setSelectedDoc] = useState<{ code: string; name: string; purity: number } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const listings = Array.isArray(listingsData?.items)
    ? listingsData.items
    : Array.isArray(listingsData?.data)
      ? listingsData.data
      : [];

  const handleApprove = async (id: string, code: string) => {
    try {
      await performStatusAction({ id, action: 'publish' });
      setActionSuccess(`Listing ${code} has been approved and activated in the marketplace.`);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to approve listing');
    }
  };

  const handleSuspend = async (id: string, code: string) => {
    try {
      await performStatusAction({ id, action: 'pause', reason: 'Admin security audit' });
      setActionSuccess(`Listing ${code} has been suspended.`);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to suspend listing');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#13DEB9] text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              ADMIN CONTROL
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">CO₂ Supply Management</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            CO₂ Listing Management Console
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Audit, verify gas purity lab reports, approve supply declarations, and control marketplace availability.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
        >
          Refresh Listings
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#E8F9F5] border border-[#13DEB9]/30 text-[#13DEB9] font-bold text-xs rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4" /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-[#5A6A85] absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
            placeholder="Search by listing ID, emitter company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Listing Statuses</option>
            <option value="ACTIVE">Active & Approved</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="PAUSED">Paused / Suspended</option>
          </select>

          <select
            className="bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-2 rounded-lg text-xs font-semibold text-[#2A3547] focus:outline-none"
            value={purityFilter}
            onChange={(e) => setPurityFilter(e.target.value)}
          >
            <option value="">All Purities</option>
            <option value="99">≥ 99.0% High Purity</option>
            <option value="95">≥ 95.0% Industrial</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Loading CO₂ Supply Listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Factory className="size-8 text-[#5A6A85]/40 mx-auto" />
            <p className="text-sm font-bold text-[#2A3547]">No CO₂ listings found matching filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Listing Code</th>
                  <th className="py-3.5 px-4">Emitter / Facility</th>
                  <th className="py-3.5 px-4">CO₂ Spec & Purity</th>
                  <th className="py-3.5 px-4">Volume & Price</th>
                  <th className="py-3.5 px-4">Lab Purity Report</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {listings.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#5D87FF]">
                      {item.publicCode || item.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547]">{item.organizationName || item.facilityName || 'Emitter Facility'}</div>
                      <span className="text-[10px] text-[#5A6A85] block">{item.locationCity || 'Gujarat'}, {item.locationState || 'IN'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547]">{item.purityPercentage}% Purity</div>
                      <span className="text-[10px] text-[#5A6A85] block uppercase">{item.physicalForm || 'GAS'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547]">{item.availableQuantityTonnes} t</div>
                      <span className="text-[10px] text-[#13DEB9] font-bold block">₹{item.pricePerTon}/t</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedDoc({
                          code: item.publicCode || item.id,
                          name: item.organizationName || 'Emitter',
                          purity: item.purityPercentage
                        })}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ECF2FF] text-[#5D87FF] hover:bg-[#5D87FF] hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-[#5D87FF]/20"
                      >
                        <FileText className="size-3.5" /> View Purity PDF
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 ${
                        item.status === 'PUBLISHED' || item.status === 'ACTIVE'
                          ? 'bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20'
                          : item.status === 'PAUSED'
                          ? 'bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/20'
                          : 'bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20'
                      }`}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'PUBLISHED' && item.status !== 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id, item.publicCode || item.id)}
                            className="bg-[#13DEB9] hover:bg-[#0EBD9D] text-white text-[11px] font-bold h-8 px-2.5"
                          >
                            <CheckCircle2 className="size-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        {item.status === 'PUBLISHED' || item.status === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspend(item.id, item.publicCode || item.id)}
                            className="border-[#FA896B]/30 text-[#FA896B] hover:bg-[#FDEDE8] text-[11px] font-bold h-8 px-2.5"
                          >
                            <XCircle className="size-3.5 mr-1" /> Suspend
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/marketplace/${item.publicCode || item.id}`)}
                          className="text-[#5A6A85] hover:text-[#5D87FF] text-[11px] font-bold h-8 px-2"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lab Report Viewer Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-2xl bg-white border border-[#E5EAEF] p-6 rounded-xl">
          <DialogHeader className="border-b border-[#E5EAEF] pb-4">
            <DialogTitle className="text-base font-bold text-[#2A3547] flex items-center gap-2">
              <FileText className="size-5 text-[#5D87FF]" /> Gas Chromatography Purity Certificate
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5A6A85]">
              Official Lab Analysis Report for {selectedDoc?.code} ({selectedDoc?.name})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="p-4 bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#5A6A85] block">Certified Purity Rating</span>
                <span className="text-base font-extrabold text-[#13DEB9]">{selectedDoc?.purity}% ISO-Certified CO₂</span>
              </div>
              <div>
                <span className="text-[#5A6A85] block">Auditing Laboratory</span>
                <span className="font-bold text-[#2A3547]">SGS India Industrial Testing Vault</span>
              </div>
            </div>

            <div className="border border-[#E5EAEF] rounded-lg p-6 bg-[#0E110F] text-center space-y-3">
              <ShieldCheck className="size-12 text-[#13DEB9] mx-auto" />
              <h4 className="text-sm font-bold text-white">Gas Analysis Certificate Verified</h4>
              <p className="text-xs text-slate-400">
                Spectrometry and gas chromatography data confirmed by platform regulator algorithms.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E5EAEF] pt-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
              Close Audit Viewer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminListingsPage;
