import React, { useState } from 'react';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { ShoppingBag, Eye, Filter, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const [role, setRole] = useState<'sent' | 'received' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: orders = [], isLoading } = useOrders(role, statusFilter);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-800 text-white font-semibold">CONFIRMED</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 border border-stone-300">CANCELLED</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-700">{s}</span>;
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
            <span className="font-mono text-xs text-[#8C827A]">Purchase Orders</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#171A18] tracking-tight font-medium mt-1">
            Industrial Orders Registry
          </h1>
          <p className="text-sm text-[#5C554E] mt-1 font-sans">
            Legally binding commercial purchase orders generated from accepted off-take offers.
          </p>
        </div>
      </div>

      {/* Control Bar */}
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
            All Orders
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
            Purchases (Buyer)
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
            Sales (Supplier)
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
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading industrial purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E2DDD5] bg-[#F7F5EF]/50 rounded-lg">
          <ShoppingBag className="w-8 h-8 text-[#8C827A] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-serif font-medium text-[#171A18]">No purchase orders found</h3>
          <p className="text-xs text-[#8C827A] mt-1 font-mono">
            Accept a commercial offer from an inquiry thread to generate a Purchase Order.
          </p>
        </div>
      ) : (
        <div className="border border-[#E2DDD5] bg-white rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5EF] border-b border-[#E2DDD5] text-[11px] font-mono uppercase tracking-wider text-[#5C554E]">
                <th className="p-3 pl-4">Order Number</th>
                <th className="p-3">Buyer Org</th>
                <th className="p-3">Seller Org</th>
                <th className="p-3">Volume</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD5] text-xs font-mono">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="p-3 pl-4">
                    <div className="font-mono font-bold text-[#171A18] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
                      {ord.order_number}
                    </div>
                    <div className="text-[10px] text-[#8C827A] font-mono">
                      {ord.listing_title || 'CO₂ Supply Order'}
                    </div>
                  </td>
                  <td className="p-3 text-[#171A18]">{ord.buyer_organization_name || 'Buyer'}</td>
                  <td className="p-3 text-[#171A18]">{ord.seller_organization_name || 'Seller'}</td>
                  <td className="p-3 font-semibold text-[#171A18]">{ord.quantity} t</td>
                  <td className="p-3 text-[#173D32]">₹{ord.unit_price}/t</td>
                  <td className="p-3 font-bold text-[#173D32]">
                    ₹{(ord.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">{getStatusBadge(ord.status)}</td>
                  <td className="p-3 text-[#8C827A]">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3 pr-4 text-right">
                    <Link
                      to={`/dashboard/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#F7F5EF] hover:bg-[#173D32] hover:text-white border border-[#E2DDD5] rounded text-xs font-mono transition-colors"
                    >
                      <Eye className="w-3 h-3" /> View PO
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

export default OrdersPage;
