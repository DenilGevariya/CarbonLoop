import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, ShieldCheck, Eye } from 'lucide-react';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders = [], isLoading, refetch } = useOrders('all', statusFilter);

  const getLifecycleBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return <Badge className="bg-[#E6FFFA] text-[#13DEB9] border border-[#13DEB9]/20 text-[10px] font-bold">5. TRANSACTION CONFIRMED</Badge>;
      case 'IN_TRANSIT':
        return <Badge className="bg-[#EEF2FF] text-indigo-600 border border-indigo-200 text-[10px] font-bold">8. IN TRANSIT</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20 text-[10px] font-bold">9. DELIVERED</Badge>;
      case 'PENDING':
        return <Badge className="bg-[#FEF5E5] text-[#FFAE1F] border border-[#FFAE1F]/20 text-[10px] font-bold">3. SELLER ACCEPTED / AWAITING BUYER</Badge>;
      default:
        return <Badge className="bg-[#F6F9FC] text-[#5A6A85] border border-[#E5EAEF] text-[10px] font-bold">{s || 'MATCH CREATED'}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (o.order_number || '').toLowerCase().includes(term) ||
      (o.buyer_organization_name || '').toLowerCase().includes(term) ||
      (o.seller_organization_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              ADMIN AUDIT
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">Bilateral Deal Lifecycle</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Transaction Monitoring Console
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Audit bilateral commercial agreements between Carbon Emitters and Utilization Buyers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
        >
          Refresh Transactions
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-[#5A6A85] absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
            placeholder="Search transaction ID, buyer company, or seller company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-[#5A6A85]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg px-3 py-2 focus:outline-none focus:border-[#5D87FF]"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="CONFIRMED">Confirmed Deals</option>
            <option value="PENDING">Pending Bilateral Approval</option>
            <option value="CANCELLED">Cancelled Deals</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Loading Commercial Transactions...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShoppingBag className="size-8 text-[#5A6A85]/40 mx-auto" />
            <p className="text-sm font-bold text-[#2A3547]">No transactions found matching filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Buyer (Utilization Startup)</th>
                  <th className="py-3.5 px-4">Seller (Carbon Emitter)</th>
                  <th className="py-3.5 px-4">Volume & Price</th>
                  <th className="py-3.5 px-4">Total Contract Value</th>
                  <th className="py-3.5 px-4">Lifecycle Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {filteredOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547] flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-purple-600" />
                        {ord.order_number}
                      </div>
                      <span className="text-[10px] text-[#5A6A85]">Created {new Date(ord.created_at).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2A3547]">
                      {ord.buyer_organization_name || 'Carbon Utilization Buyer'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2A3547]">
                      {ord.seller_organization_name || 'Industrial Emitter'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547]">{ord.quantity} t</div>
                      <span className="text-[10px] text-[#5D87FF] font-semibold block">₹{ord.unit_price}/t</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-700">
                      ₹{(ord.total_amount || ord.quantity * ord.unit_price || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {getLifecycleBadge(ord.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/orders/${ord.id}`)}
                        className="bg-[#F5F0FF] border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white text-[11px] font-bold h-8 px-3"
                      >
                        <Eye className="size-3.5 mr-1" /> View Deal PO
                      </Button>
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

export default AdminTransactionsPage;
