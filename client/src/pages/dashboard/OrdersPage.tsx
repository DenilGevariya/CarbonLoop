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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FFFA] text-[#13DEB9]">CONFIRMED</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF5E5] text-[#FFAE1F]">PENDING</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDEDE8] text-[#FA896B]">CANCELLED</span>;
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
            <span className="text-xs text-[#5A6A85]">Purchase Orders</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-[#2A3547] tracking-tight font-bold mt-1">
            Industrial Orders Registry
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Legally binding commercial purchase orders generated from accepted off-take offers.
          </p>
        </div>
      </div>

      {/* Control Bar */}
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
            All Orders
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
            Purchases (Buyer)
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
            Sales (Supplier)
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
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#5A6A85] text-xs">Loading industrial purchase orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5EAEF] bg-white rounded-xl shadow-xs">
          <ShoppingBag className="w-8 h-8 text-[#5A6A85] mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-bold text-[#2A3547]">No purchase orders found</h3>
          <p className="text-xs text-[#5A6A85] mt-1">
            Accept a commercial offer from an inquiry thread to generate a Purchase Order.
          </p>
        </div>
      ) : (
        <div className="border border-[#E5EAEF] bg-white rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-xs font-semibold uppercase tracking-wider text-[#5A6A85]">
                <th className="p-3.5 pl-5">Order Number</th>
                <th className="p-3.5">Buyer Org</th>
                <th className="p-3.5">Seller Org</th>
                <th className="p-3.5">Volume</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAEF] text-xs">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#F6F9FC] transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-[#2A3547] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#5D87FF]" />
                      {ord.order_number}
                    </div>
                    <div className="text-[11px] text-[#5A6A85]">
                      {ord.listing_title || 'CO₂ Supply Order'}
                    </div>
                  </td>
                  <td className="p-3.5 text-[#2A3547] font-semibold">{ord.buyer_organization_name || 'Buyer'}</td>
                  <td className="p-3.5 text-[#2A3547] font-semibold">{ord.seller_organization_name || 'Seller'}</td>
                  <td className="p-3.5 font-bold text-[#2A3547]">{ord.quantity} t</td>
                  <td className="p-3.5 text-[#5D87FF] font-semibold">₹{ord.unit_price}/t</td>
                  <td className="p-3.5 font-bold text-[#5D87FF]">
                    ₹{(ord.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                  <td className="p-3.5 text-[#5A6A85]">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Link
                      to={`/dashboard/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ECF2FF] hover:bg-[#5D87FF] text-[#5D87FF] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View PO
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
