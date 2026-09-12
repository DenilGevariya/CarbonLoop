import React, { useState } from 'react';
import { useInquiries } from '@/features/inquiries/hooks/useInquiries';
import { MessageSquare, ArrowUpRight, ArrowDownLeft, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const InquiriesPage: React.FC = () => {
  const [role, setRole] = useState<'sent' | 'received' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: inquiries = [], isLoading } = useInquiries(role, statusFilter);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F7FF] text-[#49BEFF]">OPEN</span>;
      case 'RESPONDED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E5] text-[#FFAE1F]">RESPONDED</span>;
      case 'NEGOTIATING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECF2FF] text-[#5D87FF]">NEGOTIATING</span>;
      case 'CONVERTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FFFA] text-[#13DEB9]">CONVERTED</span>;
      case 'CLOSED':
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF]">CLOSED</span>;
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
            <span className="text-xs text-[#5A6A85]">Inquiry Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2A3547] tracking-tight font-bold mt-1">
            Commercial Inquiries
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Bilateral communication workspaces between CO₂ emitters and utilizers.
          </p>
        </div>
      </div>

      {/* Control Bar: Role Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5EAEF] p-3 rounded-xl shadow-xs">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRole('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              role === 'all'
                ? 'bg-[#5D87FF] text-white shadow-xs'
                : 'text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F6F9FC]'
            }`}
          >
            All Inquiries
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
            Received (Supply Requests)
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
            Sent (My Requests)
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
            <option value="OPEN">OPEN</option>
            <option value="RESPONDED">RESPONDED</option>
            <option value="NEGOTIATING">NEGOTIATING</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Inquiry Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#5A6A85] text-xs">Loading commercial inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5EAEF] bg-white rounded-xl shadow-xs">
          <MessageSquare className="w-8 h-8 text-[#5A6A85] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#2A3547]">No inquiries found</h3>
          <p className="text-xs text-[#5A6A85] mt-1">
            {role === 'received'
              ? 'No incoming supply requests received yet.'
              : role === 'sent'
              ? 'You have not submitted any supply requests.'
              : 'No commercial inquiries match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="border border-[#E5EAEF] bg-white rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-xs font-semibold uppercase tracking-wider text-[#5A6A85]">
                <th className="p-3.5 pl-5">Inquiry / Listing</th>
                <th className="p-3.5">Counterparty</th>
                <th className="p-3.5">Requested Vol</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAEF] text-xs">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#F6F9FC] transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-sm text-[#2A3547]">{inq.listing_title}</div>
                    <div className="text-[11px] text-[#5A6A85] font-medium">
                      Ref: CL-INQ-{inq.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-[#2A3547] font-semibold">
                      {inq.buyer_organization_name || inq.seller_organization_name}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-[#5D87FF]">
                    {inq.requested_quantity} t
                  </td>
                  <td className="p-3.5">{getStatusBadge(inq.status)}</td>
                  <td className="p-3.5 text-[#5A6A85]">
                    {new Date(inq.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Link
                      to={`/dashboard/inquiries/${inq.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Workspace
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

export default InquiriesPage;
