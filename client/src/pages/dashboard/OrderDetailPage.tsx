import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '@/features/orders/hooks/useOrders';
import {
  ArrowLeft, Building2, MapPin, Info, CheckCircle2
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error } = useOrder(id);

  if (isLoading) {
    return <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading purchase order details...</div>;
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded font-mono text-sm">
        {(error as any)?.message || 'Order not found or access denied.'}
      </div>
    );
  }

  const snapshot = order.commercial_snapshot || {};
  const status = (order.status || '').toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Back Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2DDD5] pb-5 gap-4">
        <div>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5C554E] hover:text-[#173D32] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders Registry
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-medium text-[#171A18]">
              Purchase Order {order.order_number}
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono rounded font-semibold bg-emerald-800 text-white">
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8C827A]">
            Created: {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
        </div>
      </div>

      {/* Industrial Purchase Order Summary Document */}
      <div className="bg-white border border-[#E2DDD5] rounded-lg p-8 space-y-6 shadow-sm">
        {/* Document Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#173D32] pb-4 gap-4">
          <div>
            <span className="font-mono text-xs font-bold text-[#173D32] uppercase tracking-wider">
              CARBONLOOP INDUSTRIAL B2B MARKETPLACE
            </span>
            <h2 className="text-xl font-serif font-medium text-[#171A18] mt-0.5">
              OFF-TAKE PURCHASE ORDER SUMMARY
            </h2>
          </div>
          <div className="text-right font-mono text-xs text-[#5C554E]">
            <div>PO REF: <strong className="text-[#171A18]">{order.order_number}</strong></div>
            <div>STATUS: <strong className="text-[#173D32]">{status}</strong></div>
          </div>
        </div>

        {/* Contracting Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF8F5] border border-[#E2DDD5] p-5 rounded-md font-mono text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#8C827A] uppercase font-bold block">BUYER ORGANIZATION</span>
            <div className="text-sm font-bold text-[#171A18] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#173D32]" />
              {order.buyer_organization_name || 'Buyer Enterprise'}
            </div>
            {order.destination_address && (
              <div className="text-[#5C554E] flex items-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#8C827A] shrink-0 mt-0.5" />
                <span>Destination: {order.destination_address}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#E2DDD5] pt-4 md:pt-0 md:pl-6">
            <span className="text-[10px] text-[#8C827A] uppercase font-bold block">SELLER / SUPPLIER ORGANIZATION</span>
            <div className="text-sm font-bold text-[#171A18] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#173D32]" />
              {order.seller_organization_name || 'Seller Enterprise'}
            </div>
            {snapshot.seller_location && (
              <div className="text-[#5C554E] flex items-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#8C827A] shrink-0 mt-0.5" />
                <span>Source Facility: {snapshot.seller_facility_name || 'Facility'} ({snapshot.seller_location})</span>
              </div>
            )}
          </div>
        </div>

        {/* Commercial Specifications & Totals Table */}
        <div className="border border-[#E2DDD5] rounded-md overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5EF] border-b border-[#E2DDD5] text-[10px] uppercase tracking-wider text-[#5C554E]">
                <th className="p-3 pl-4">Item Specification</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Agreed Unit Price</th>
                <th className="p-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E2DDD5]">
                <td className="p-3 pl-4">
                  <div className="font-bold text-[#171A18]">{order.listing_title || 'Industrial CO₂ Supply Batch'}</div>
                  <div className="text-[10px] text-[#8C827A]">Purity Guarantee: {snapshot.listing_purity_percentage || order.listing_purity || 99.5}%</div>
                </td>
                <td className="p-3 font-semibold text-[#171A18]">{order.quantity} Tonnes</td>
                <td className="p-3 text-[#173D32]">₹{order.unit_price}/tonne</td>
                <td className="p-3 font-semibold text-[#171A18]">
                  ₹{(order.subtotal_amount || order.quantity * order.unit_price).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-[#FAF8F5]/60 text-xs">
                <td colSpan={3} className="p-3 text-right font-medium text-[#5C554E]">Logistics & Transport Fee Component:</td>
                <td className="p-3 font-semibold text-[#171A18]">₹{(order.delivery_cost || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-[#173D32]/5 text-sm font-bold text-[#173D32]">
                <td colSpan={3} className="p-3 pl-4 text-right uppercase text-xs">Total Purchase Order Value:</td>
                <td className="p-3">₹{(order.total_amount || 0).toLocaleString('en-IN')} INR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Traceable Commercial History Timeline */}
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-md p-4 space-y-3 font-mono text-xs">
          <span className="text-[10px] font-bold text-[#173D32] uppercase tracking-wider block border-b border-[#E2DDD5] pb-1.5">
            Commercial Traceability Audit Trail
          </span>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#5C554E]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Commercial offer <strong className="text-[#171A18]">{snapshot.offer_number || 'CL-OFR'}</strong> accepted on {new Date(snapshot.accepted_at || order.created_at).toLocaleString('en-IN')}.</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C554E]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Purchase Order <strong className="text-[#171A18]">{order.order_number}</strong> generated with status <strong className="text-[#173D32]">{status}</strong>.</span>
            </div>
          </div>
        </div>

        {/* Operational Disclaimers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-md flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Financial Settlement Notice</strong>
              Payment processing will be available during financial settlement.
            </div>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-200 text-sky-900 rounded-md flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Next Phase Notice</strong>
              Shipment planning will become available after commercial confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
