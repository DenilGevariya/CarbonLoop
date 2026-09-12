import React, { useState } from 'react';
import { useOffers } from '@/features/offers/hooks/useOffers';
import { Handshake, ArrowDownLeft, ArrowUpRight, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OffersPage: React.FC = () => {
  const [role, setRole] = useState<'sent' | 'received' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: offers = [], isLoading } = useOffers(role, statusFilter);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SENT':
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7FF] text-[#49BEFF]">SENT</span>;
      case 'COUNTERED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E5] text-[#FFAE1F]">COUNTERED</span>;
      case 'ACCEPTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FFFA] text-[#13DEB9]">ACCEPTED</span>;
      case 'REJECTED':
      case 'DECLINED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDEDE8] text-[#FA896B]">REJECTED</span>;
      case 'WITHDRAWN':
      case 'EXPIRED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF]">EXPIRED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F9FC] text-[#5A6A85]">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5D87FF] uppercase font-semibold">Commercial Transactions</span>
            <span className="text-[#5A6A85]">•</span>
            <span className="text-xs text-[#5A6A85]">Bilateral Proposals</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2A3547] tracking-tight font-bold mt-1">
            Commercial Offers Inbox
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Formal price, volume, and transport proposals across participating organizations.
          </p>
        </div>
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
            <ArrowUpRight className="w-3.5 h-3.5 text-[#FFAE1F]" />
            Sent Proposals
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#5A6A85]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5D87FF]"
          >
            <option value="">All Statuses</option>
            <option value="SENT">SENT</option>
            <option value="COUNTERED">COUNTERED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="WITHDRAWN">WITHDRAWN</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#5A6A85] text-xs">Loading commercial offers...</div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5EAEF] bg-white rounded-xl shadow-xs">
          <Handshake className="w-8 h-8 text-[#5A6A85] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#2A3547]">No commercial offers found</h3>
          <p className="text-xs text-[#5A6A85] mt-1">
            {role === 'received' ? 'No offers received from suppliers yet.' : 'No sent offers recorded.'}
          </p>
        </div>
      ) : (
        <div className="border border-[#E5EAEF] bg-white rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-xs font-semibold uppercase tracking-wider text-[#5A6A85]">
                <th className="p-3.5 pl-5">Offer Ref / Version</th>
                <th className="p-3.5">Counterparty</th>
                <th className="p-3.5">Volume</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Estimated Total</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Valid Until</th>
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
                      Ver {off.version || 1} • {off.listing_title || 'CO₂ Supply'}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[#2A3547] font-semibold">
                      {off.buyer_organization_name || off.seller_organization_name}
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-[#2A3547]">{off.quantity} t</td>
                  <td className="p-3.5 text-[#5D87FF] font-semibold">₹{off.unit_price}/t</td>
                  <td className="p-3.5 font-bold text-[#5D87FF]">
                    ₹{(off.total_estimated_cost || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">{getStatusBadge(off.status)}</td>
                  <td className="p-3.5 text-[#5A6A85]">
                    {new Date(off.valid_until).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Link
                      to={`/dashboard/offers/${off.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
