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
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200">OPEN</span>;
      case 'RESPONDED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">RESPONDED</span>;
      case 'NEGOTIATING':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">NEGOTIATING</span>;
      case 'CONVERTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900 text-white font-semibold">CONVERTED</span>;
      case 'CLOSED':
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-300">CLOSED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-700">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2DDD5] pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#173D32] tracking-wider uppercase font-semibold">Commercial Transactions</span>
            <span className="text-[#8C827A]">•</span>
            <span className="font-mono text-xs text-[#8C827A]">Inquiry Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#171A18] tracking-tight font-medium mt-1">
            Commercial Inquiries
          </h1>
          <p className="text-sm text-[#5C554E] mt-1 font-sans">
            Bilateral communication workspaces between CO₂ emitters and utilizers.
          </p>
        </div>
      </div>

      {/* Control Bar: Role Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F5EF] border border-[#E2DDD5] p-3 rounded-lg">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRole('all')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              role === 'all'
                ? 'bg-[#173D32] text-white font-medium shadow-xs'
                : 'text-[#5C554E] hover:text-[#171A18] hover:bg-[#E2DDD5]/50'
            }`}
          >
            All Inquiries
          </button>
          <button
            onClick={() => setRole('received')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
              role === 'received'
                ? 'bg-[#173D32] text-white font-medium shadow-xs'
                : 'text-[#5C554E] hover:text-[#171A18] hover:bg-[#E2DDD5]/50'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            Received (Supply Requests)
          </button>
          <button
            onClick={() => setRole('sent')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
              role === 'sent'
                ? 'bg-[#173D32] text-white font-medium shadow-xs'
                : 'text-[#5C554E] hover:text-[#171A18] hover:bg-[#E2DDD5]/50'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            Sent (My Requests)
          </button>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8C827A]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#E2DDD5] text-xs font-mono text-[#171A18] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#173D32]"
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
        <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading commercial inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E2DDD5] bg-[#F7F5EF]/50 rounded-lg">
          <MessageSquare className="w-8 h-8 text-[#8C827A] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-serif font-medium text-[#171A18]">No inquiries found</h3>
          <p className="text-xs text-[#8C827A] mt-1 font-mono">
            {role === 'received'
              ? 'No incoming supply requests received yet.'
              : role === 'sent'
              ? 'You have not submitted any supply requests.'
              : 'No commercial inquiries match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="border border-[#E2DDD5] bg-white rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5EF] border-b border-[#E2DDD5] text-[11px] font-mono uppercase tracking-wider text-[#5C554E]">
                <th className="p-3 pl-4">Inquiry / Listing</th>
                <th className="p-3">Counterparty</th>
                <th className="p-3">Requested Vol</th>
                <th className="p-3">Status</th>
                <th className="p-3">Updated</th>
                <th className="p-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD5] text-xs font-mono">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-3 pl-4">
                    <div className="font-serif font-medium text-sm text-[#171A18]">{inq.listing_title}</div>
                    <div className="text-[11px] text-[#8C827A] font-mono">
                      Ref: CL-INQ-{inq.id.slice(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-[#171A18] font-medium">
                      {inq.buyer_organization_name || inq.seller_organization_name}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-[#173D32]">
                    {inq.requested_quantity} t
                  </td>
                  <td className="p-3">{getStatusBadge(inq.status)}</td>
                  <td className="p-3 text-[#8C827A]">
                    {new Date(inq.updated_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <Link
                      to={`/dashboard/inquiries/${inq.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#F7F5EF] hover:bg-[#173D32] hover:text-white border border-[#E2DDD5] rounded text-xs font-mono transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Workspace
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
