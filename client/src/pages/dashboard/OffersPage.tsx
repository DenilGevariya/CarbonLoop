import React, { useState } from 'react';
import { useOffers, useCreateOffer } from '@/features/offers/hooks/useOffers';
import { Handshake, ArrowDownLeft, ArrowUpRight, Eye, PlusCircle, Send, X, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const OffersPage: React.FC = () => {
  const [role, setRole] = useState<'sent' | 'received' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Make Offer Modal state
  const [showMakeOfferModal, setShowMakeOfferModal] = useState<boolean>(false);
  const [makeOfferForm, setMakeOfferForm] = useState({
    sellerName: 'TerraCem Industries',
    pricePerKg: '4.8',
    quantity: '500',
    purity: '99.5',
    receivingDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const { data: offers = [], isLoading } = useOffers(role, statusFilter);
  const createOfferMutation = useCreateOffer();

  const handleMakeOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const unitPriceTonne = parseFloat(makeOfferForm.pricePerKg) * 1000;
      await createOfferMutation.mutateAsync({
        inquiry_id: '80000000-0000-4000-a000-000000000001',
        quantity: parseFloat(makeOfferForm.quantity),
        unit_price: unitPriceTonne,
        message: `Receiving Date: ${makeOfferForm.receivingDate}. Required Purity: ${makeOfferForm.purity}%. Target Seller: ${makeOfferForm.sellerName}`,
        valid_until: new Date(Date.now() + 14 * 86400000).toISOString(),
      });
      setShowMakeOfferModal(false);
    } catch (err) {
      console.error('Failed to issue commercial offer:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SENT':
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7FF] text-[#49BEFF]">SENT</span>;
      case 'COUNTERED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E5] text-[#FFAE1F]">COUNTERED</span>;
      case 'SELLER_ACCEPTED':
      case 'ACCEPTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FFFA] text-[#13DEB9]">SELLER ACCEPTED</span>;
      case 'BUYER_CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECF2FF] text-[#5D87FF]">DEAL CONFIRMED</span>;
      case 'REJECTED':
      case 'DECLINED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDEDE8] text-[#FA896B]">REJECTED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F9FC] text-[#5A6A85]">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-[#2A3547]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5D87FF] uppercase font-semibold">Commercial Transactions</span>
            <span className="text-[#5A6A85]">•</span>
            <span className="text-xs text-[#5A6A85]">Bilateral Proposals & Counter Bids</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2A3547] tracking-tight font-bold mt-1">
            Inquiries & Commercial Offers
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Formal price, volume, purity, and transport proposals across participating organizations.
          </p>
        </div>

        <Button
          onClick={() => setShowMakeOfferModal(true)}
          className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-4 h-4" /> Make Offer
        </Button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5EAEF] p-3 rounded-xl shadow-xs">
        {/* Role Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRole('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              role === 'all'
                ? 'bg-[#5D87FF] text-white shadow-xs'
                : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
            }`}
          >
            All Offers
          </button>
          <button
            onClick={() => setRole('received')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              role === 'received'
                ? 'bg-[#5D87FF] text-white shadow-xs'
                : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#13DEB9]" />
            Received Offers
          </button>
          <button
            onClick={() => setRole('sent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              role === 'sent'
                ? 'bg-[#5D87FF] text-white shadow-xs'
                : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#5D87FF]" />
            Sent Offers
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F9FC] border border-[#E5EAEF] text-[#2A3547] rounded-lg focus:outline-none focus:border-[#5D87FF]"
          >
            <option value="">All Statuses</option>
            <option value="SENT">SENT</option>
            <option value="COUNTERED">COUNTERED</option>
            <option value="SELLER_ACCEPTED">SELLER ACCEPTED</option>
            <option value="BUYER_CONFIRMED">DEAL CONFIRMED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#5A6A85] text-xs">Loading commercial offers...</div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5EAEF] bg-white rounded-xl shadow-xs">
          <Handshake className="w-8 h-8 text-[#5A6A85] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#2A3547]">No commercial offers recorded</h3>
          <p className="text-xs text-[#5A6A85] mt-1 mb-4">
            {role === 'received' ? 'No offers received from buyers yet.' : 'Click "Make Offer" to issue a proposal to a supplier.'}
          </p>
          <Button
            onClick={() => setShowMakeOfferModal(true)}
            className="bg-[#5D87FF] text-white font-semibold text-xs rounded-xl px-4 py-2"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Make First Offer
          </Button>
        </div>
      ) : (
        <div className="border border-[#E5EAEF] bg-white rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-xs font-semibold uppercase tracking-wider text-[#5A6A85]">
                <th className="p-3.5 pl-5">Offer Ref / Stream</th>
                <th className="p-3.5">Counterparty</th>
                <th className="p-3.5">Volume</th>
                <th className="p-3.5">Price / kg</th>
                <th className="p-3.5">Unit Price / tonne</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Receiving / Valid Date</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAEF] text-xs">
              {offers.map((off) => (
                <tr key={off.id} className="hover:bg-[#F6F9FC] transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-[#2A3547]">
                      {off.offer_number || `CL-OFR-${off.id.slice(0, 6)}`}
                    </div>
                    <div className="text-[11px] text-[#5A6A85]">
                      Ver {off.version || 1} • {off.listing_title || 'Post-Combustion CO₂'}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[#2A3547] font-semibold">
                      {off.buyer_organization_name || off.seller_organization_name || 'TerraCem Industries'}
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-[#2A3547]">{off.quantity} t</td>
                  <td className="p-3.5 text-[#5D87FF] font-bold">₹{(off.unit_price / 1000).toFixed(2)}/kg</td>
                  <td className="p-3.5 text-[#5D87FF] font-semibold">₹{off.unit_price}/t</td>
                  <td className="p-3.5">{getStatusBadge(off.status)}</td>
                  <td className="p-3.5 text-[#5A6A85]">
                    {new Date(off.valid_until).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Link
                      to={`/dashboard/offers/${off.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect / Action
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MAKE OFFER MODAL */}
      {showMakeOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in">
            <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2A3547]">Make Commercial Offer</h3>
                  <p className="text-xs text-[#5A6A85]">Issue bilateral price & volume proposal</p>
                </div>
              </div>
              <button
                onClick={() => setShowMakeOfferModal(false)}
                className="text-[#5A6A85] hover:text-[#2A3547] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakeOfferSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Seller / Supplier Name</Label>
                <select
                  value={makeOfferForm.sellerName}
                  onChange={(e) => setMakeOfferForm({ ...makeOfferForm, sellerName: e.target.value })}
                  className="w-full h-10 px-3 bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl"
                >
                  <option value="TerraCem Industries">TerraCem Industries (Post-Combustion Gujarat)</option>
                  <option value="Gujarat BioEnergy Plant">Gujarat BioEnergy Plant (Bio-CO₂ 99.8%)</option>
                  <option value="Narmada Calcination Hub">Narmada Calcination Hub (Raw Flue Gas)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Price per kg (₹)</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="number"
                      step="0.1"
                      value={makeOfferForm.pricePerKg}
                      onChange={(e) => setMakeOfferForm({ ...makeOfferForm, pricePerKg: e.target.value })}
                      className="pl-9 h-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-[#5D87FF] font-semibold">
                    = ₹{(parseFloat(makeOfferForm.pricePerKg || '0') * 1000).toLocaleString()}/tonne
                  </span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Quantity (tonnes)</Label>
                  <Input
                    type="number"
                    value={makeOfferForm.quantity}
                    onChange={(e) => setMakeOfferForm({ ...makeOfferForm, quantity: e.target.value })}
                    className="h-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Required Purity (%)</Label>
                  <Input
                    type="text"
                    value={makeOfferForm.purity}
                    onChange={(e) => setMakeOfferForm({ ...makeOfferForm, purity: e.target.value })}
                    className="h-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-[#2A3547] uppercase tracking-wider">Receiving Date</Label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A85]" />
                    <Input
                      type="date"
                      value={makeOfferForm.receivingDate}
                      onChange={(e) => setMakeOfferForm({ ...makeOfferForm, receivingDate: e.target.value })}
                      className="pl-9 h-10 bg-[#F6F9FC] border-[#E5EAEF] text-xs font-bold text-[#2A3547] rounded-xl"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMakeOfferModal(false)}
                  className="flex-1 h-10 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOfferMutation.isPending}
                  className="flex-1 h-10 bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold rounded-xl"
                >
                  {createOfferMutation.isPending ? 'Sending...' : 'Submit Commercial Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OffersPage;
