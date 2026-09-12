import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder, ORDERS_QUERY_KEY } from '@/features/orders/hooks/useOrders';
import { orderApi } from '@/features/orders/api/orderApi';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Edit3
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);
  const { activeOrg } = useAuth();
  const queryClient = useTanstackQueryClient();

  const [isConfirming, setIsConfirming] = useState(false);
  const [isUpdatingTerms, setIsUpdatingTerms] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Term edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editUnitPrice, setEditUnitPrice] = useState<number>(0);
  const [editDeliveryCost, setEditDeliveryCost] = useState<number>(0);

  // Receipt verification state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [verifiedPurityInput, setVerifiedPurityInput] = useState<number>(99.5);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#5A6A85] font-sans text-sm font-medium animate-pulse">
        Loading purchase order details...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-xl font-sans text-sm font-semibold">
        {(error as any)?.message || 'Order not found or access denied.'}
      </div>
    );
  }

  const snapshot = order.commercial_snapshot || {};
  const status = (order.status || '').toUpperCase();
  const activeOrgId = activeOrg?.organizationId;
  const activeOrgType = activeOrg?.orgType;

  const isSeller = activeOrgId === order.seller_organization_id || activeOrgType === 'EMITTER';
  const isBuyer = activeOrgId === order.buyer_organization_id || activeOrgType === 'UTILIZER';
  const isLogistics = activeOrgType === 'LOGISTICS_PROVIDER';

  const sellerConfirmed = !!order.seller_confirmed_at;
  const buyerConfirmed = !!order.buyer_confirmed_at;
  const logisticsConfirmed = !!order.logistics_confirmed_at;

  const userConfirmed = (isSeller && sellerConfirmed) || (isBuyer && buyerConfirmed) || (isLogistics && logisticsConfirmed);

  const handleConfirmHandshake = async () => {
    if (!id) return;
    setIsConfirming(true);
    setActionError(null);
    try {
      await orderApi.confirmHandshake(id);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm handshake.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditQuantity(order.quantity);
    setEditUnitPrice(order.unit_price);
    setEditDeliveryCost(order.delivery_cost || 0);
    setShowEditModal(true);
  };

  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsUpdatingTerms(true);
    setActionError(null);
    try {
      await orderApi.updateTerms(id, {
        quantity: editQuantity,
        unitPrice: editUnitPrice,
        deliveryCost: editDeliveryCost,
      });
      setShowEditModal(false);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update deal terms.');
    } finally {
      setIsUpdatingTerms(false);
    }
  };

  const handleConfirmReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsConfirmingReceipt(true);
    setActionError(null);
    try {
      await orderApi.confirmReceipt(id, { verifiedPurity: verifiedPurityInput });
      setShowReceiptModal(false);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    } catch (err: any) {
      setActionError(err.message || 'Failed to confirm receipt.');
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans text-[#2A3547]">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAEF] pb-5 gap-4">
        <div>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6A85] hover:text-[#5D87FF] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders Registry
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
              Purchase Order #{order.order_number}
            </h1>
            <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${
              status === 'CONFIRMED' ? 'bg-[#E8F7FF] text-[#5D87FF]' :
              status === 'COMPLETED' ? 'bg-[#E6FFFA] text-[#13DEB9]' :
              'bg-[#FEF5E5] text-[#FFAE1F]'
            }`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {order.reconfirmation_required && (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Reconfirmation Required
            </span>
          )}
          <span className="text-xs font-medium text-[#5A6A85] bg-[#F6F9FC] border border-[#E5EAEF] px-3 py-1.5 rounded-lg">
            Created: {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 3-WAY HANDSHAKE PROGRESS STEPPER CARD */}
      <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5D87FF]" />
            <h3 className="text-sm font-bold text-[#2A3547] tracking-tight">
              Three-Way Handshake Contract Status
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#5A6A85]">
            {sellerConfirmed && buyerConfirmed && logisticsConfirmed
              ? '✓ Fully Confirmed & Binding'
              : 'Awaiting Contractual Confirmations'}
          </span>
        </div>

        {/* Stepper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1: Emitter / Seller */}
          <div className={`p-4 rounded-xl border transition-all ${
            sellerConfirmed
              ? 'bg-[#E6FFFA]/40 border-[#13DEB9]/40 text-[#2A3547]'
              : 'bg-[#F6F9FC] border-[#E5EAEF] text-[#5A6A85]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6A85]">
                1. Seller Confirmation
              </span>
              {sellerConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" />
              ) : (
                <Clock className="w-4 h-4 text-[#FFAE1F]" />
              )}
            </div>
            <div className="text-xs font-bold text-[#2A3547]">
              {order.seller_organization_name || 'Emitter Organization'}
            </div>
            <div className="text-[11px] text-[#5A6A85] mt-1">
              {sellerConfirmed
                ? `Confirmed on ${new Date(order.seller_confirmed_at!).toLocaleDateString('en-IN')}`
                : 'Pending Seller Confirmation'}
            </div>
          </div>

          {/* Step 2: Utilizer / Buyer */}
          <div className={`p-4 rounded-xl border transition-all ${
            buyerConfirmed
              ? 'bg-[#E6FFFA]/40 border-[#13DEB9]/40 text-[#2A3547]'
              : 'bg-[#F6F9FC] border-[#E5EAEF] text-[#5A6A85]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6A85]">
                2. Buyer Confirmation
              </span>
              {buyerConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" />
              ) : (
                <Clock className="w-4 h-4 text-[#FFAE1F]" />
              )}
            </div>
            <div className="text-xs font-bold text-[#2A3547]">
              {order.buyer_organization_name || 'Utilizer Organization'}
            </div>
            <div className="text-[11px] text-[#5A6A85] mt-1">
              {buyerConfirmed
                ? `Confirmed on ${new Date(order.buyer_confirmed_at!).toLocaleDateString('en-IN')}`
                : 'Pending Buyer Confirmation'}
            </div>
          </div>

          {/* Step 3: Logistics Provider */}
          <div className={`p-4 rounded-xl border transition-all ${
            logisticsConfirmed
              ? 'bg-[#E6FFFA]/40 border-[#13DEB9]/40 text-[#2A3547]'
              : 'bg-[#F6F9FC] border-[#E5EAEF] text-[#5A6A85]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A6A85]">
                3. Logistics Provider
              </span>
              {logisticsConfirmed ? (
                <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" />
              ) : (
                <Clock className="w-4 h-4 text-[#FFAE1F]" />
              )}
            </div>
            <div className="text-xs font-bold text-[#2A3547]">
              Transport Fleet Partner
            </div>
            <div className="text-[11px] text-[#5A6A85] mt-1">
              {logisticsConfirmed
                ? `Confirmed on ${new Date(order.logistics_confirmed_at!).toLocaleDateString('en-IN')}`
                : 'Pending Fleet Confirmation'}
            </div>
          </div>
        </div>

        {/* Handshake Action Control Bar */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#E5EAEF] gap-3">
          <div className="text-xs font-medium text-[#5A6A85]">
            {!userConfirmed ? (
              <span className="text-amber-700 font-semibold">
                Action required: Confirm this contract on behalf of your organization.
              </span>
            ) : (
              <span className="text-[#13DEB9] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Your organization has confirmed this contract.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {(isSeller || isBuyer) && (
              <button
                onClick={handleOpenEditModal}
                className="px-4 py-2 border border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#5D87FF]" /> Modify Deal Terms
              </button>
            )}

            {!userConfirmed && (
              <button
                onClick={handleConfirmHandshake}
                disabled={isConfirming}
                className="px-5 py-2 bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#5D87FF]/20 disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isConfirming ? 'Confirming...' : 'Confirm Contract Handshake'}
              </button>
            )}

            {isBuyer && order.status === 'IN_TRANSIT' && !order.buyer_receipt_confirmed_at && (
              <button
                onClick={() => setShowReceiptModal(true)}
                className="px-5 py-2 bg-[#13DEB9] hover:bg-[#0ECA9B] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#13DEB9]/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Delivery Receipt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Industrial Purchase Order Summary Document */}
      <div className="bg-white border border-[#E5EAEF] rounded-2xl p-8 space-y-6 shadow-sm">
        {/* Document Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#5D87FF] pb-4 gap-4">
          <div>
            <span className="text-xs font-bold text-[#5D87FF] uppercase tracking-wider">
              CARBONLOOP INDUSTRIAL B2B MARKETPLACE
            </span>
            <h2 className="text-xl font-bold text-[#2A3547] mt-0.5 tracking-tight">
              OFF-TAKE PURCHASE ORDER SUMMARY
            </h2>
          </div>
          <div className="text-right text-xs text-[#5A6A85] font-mono">
            <div>PO REF: <strong className="text-[#2A3547]">{order.order_number}</strong></div>
            <div>STATUS: <strong className="text-[#5D87FF]">{status}</strong></div>
          </div>
        </div>

        {/* Contracting Parties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F6F9FC] border border-[#E5EAEF] p-5 rounded-xl text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#5A6A85] uppercase font-bold tracking-wider block">BUYER ORGANIZATION</span>
            <div className="text-sm font-bold text-[#2A3547] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#5D87FF]" />
              {order.buyer_organization_name || 'Buyer Enterprise'}
            </div>
            {order.destination_address && (
              <div className="text-[#5A6A85] flex items-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#5A6A85] shrink-0 mt-0.5" />
                <span>Destination: {order.destination_address}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-[#E5EAEF] pt-4 md:pt-0 md:pl-6">
            <span className="text-[10px] text-[#5A6A85] uppercase font-bold tracking-wider block">SELLER / SUPPLIER ORGANIZATION</span>
            <div className="text-sm font-bold text-[#2A3547] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#5D87FF]" />
              {order.seller_organization_name || 'Seller Enterprise'}
            </div>
            {snapshot.seller_location && (
              <div className="text-[#5A6A85] flex items-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#5A6A85] shrink-0 mt-0.5" />
                <span>Source Facility: {snapshot.seller_facility_name || 'Facility'} ({snapshot.seller_location})</span>
              </div>
            )}
          </div>
        </div>

        {/* Commercial Specifications & Totals Table */}
        <div className="border border-[#E5EAEF] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[10px] uppercase tracking-wider text-[#5A6A85] font-bold">
                <th className="p-3.5 pl-4">Item Specification</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Agreed Unit Price</th>
                <th className="p-3.5">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E5EAEF]">
                <td className="p-3.5 pl-4">
                  <div className="font-bold text-[#2A3547]">{order.listing_title || 'Industrial CO₂ Supply Batch'}</div>
                  <div className="text-[11px] text-[#5A6A85]">
                    Declared Purity: {order.declared_purity || snapshot.listing_purity_percentage || order.listing_purity || 99.5}%
                    {order.verified_purity && (
                      <span className="ml-2 font-semibold text-[#13DEB9]">
                        (Verified: {order.verified_purity}%)
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3.5 font-semibold text-[#2A3547]">{order.quantity} Tonnes</td>
                <td className="p-3.5 text-[#5D87FF] font-semibold">₹{order.unit_price}/tonne</td>
                <td className="p-3.5 font-bold text-[#2A3547]">
                  ₹{(order.subtotal_amount || order.quantity * order.unit_price).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-[#F6F9FC]/60 text-xs">
                <td colSpan={3} className="p-3.5 text-right font-semibold text-[#5A6A85]">Logistics & Transport Fee Component:</td>
                <td className="p-3.5 font-bold text-[#2A3547]">₹{(order.delivery_cost || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-[#ECF2FF] text-sm font-bold text-[#5D87FF]">
                <td colSpan={3} className="p-3.5 pl-4 text-right uppercase text-xs">Total Purchase Order Value:</td>
                <td className="p-3.5">₹{(order.total_amount || 0).toLocaleString('en-IN')} INR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Traceable Commercial History Timeline */}
        <div className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl p-5 space-y-3 text-xs">
          <span className="text-[10px] font-bold text-[#5D87FF] uppercase tracking-wider block border-b border-[#E5EAEF] pb-2">
            Commercial Traceability Audit Trail
          </span>
          <div className="space-y-2 font-medium">
            <div className="flex items-center gap-2 text-[#5A6A85]">
              <CheckCircle2 className="w-4 h-4 text-[#13DEB9] shrink-0" />
              <span>Commercial offer <strong className="text-[#2A3547]">{snapshot.offer_number || 'CL-OFR'}</strong> accepted on {new Date(snapshot.accepted_at || order.created_at).toLocaleString('en-IN')}.</span>
            </div>
            <div className="flex items-center gap-2 text-[#5A6A85]">
              <CheckCircle2 className="w-4 h-4 text-[#13DEB9] shrink-0" />
              <span>Purchase Order <strong className="text-[#2A3547]">#{order.order_number}</strong> generated with status <strong className="text-[#5D87FF]">{status}</strong>.</span>
            </div>
            {order.buyer_receipt_confirmed_at && (
              <div className="flex items-center gap-2 text-[#5A6A85]">
                <CheckCircle2 className="w-4 h-4 text-[#13DEB9] shrink-0" />
                <span>Delivery confirmed by buyer on {new Date(order.buyer_receipt_confirmed_at).toLocaleString('en-IN')}. Verified Purity: <strong className="text-[#2A3547]">{order.verified_purity}%</strong>.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT TERMS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-[#2A3547]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5EAEF] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
              <h3 className="text-base font-bold text-[#2A3547] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#5D87FF]" /> Modify Deal Terms
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#5A6A85] hover:text-[#2A3547] font-bold">✕</button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Modifying deal terms will reset all handshake confirmations and require reconfirmation from all 3 parties.</span>
            </div>

            <form onSubmit={handleSaveTerms} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#2A3547] font-bold mb-1">Quantity (Tonnes)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E5EAEF] rounded-xl focus:ring-2 focus:ring-[#5D87FF] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2A3547] font-bold mb-1">Unit Price (₹/tonne)</label>
                <input
                  type="number"
                  step="1"
                  value={editUnitPrice}
                  onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E5EAEF] rounded-xl focus:ring-2 focus:ring-[#5D87FF] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2A3547] font-bold mb-1">Delivery / Logistics Cost (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={editDeliveryCost}
                  onChange={(e) => setEditDeliveryCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E5EAEF] rounded-xl focus:ring-2 focus:ring-[#5D87FF] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAEF]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#E5EAEF] text-[#5A6A85] rounded-xl font-bold hover:bg-[#F6F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTerms}
                  className="px-5 py-2 bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-xl font-bold shadow-md shadow-[#5D87FF]/20 disabled:opacity-50"
                >
                  {isUpdatingTerms ? 'Updating...' : 'Save & Trigger Reconfirmation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT VERIFICATION MODAL */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-[#2A3547]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5EAEF] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
              <h3 className="text-base font-bold text-[#2A3547] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#13DEB9]" /> Confirm Delivery Receipt
              </h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-[#5A6A85] hover:text-[#2A3547] font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmReceiptSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[#2A3547] font-bold mb-1">Lab Verified Purity (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={verifiedPurityInput}
                  onChange={(e) => setVerifiedPurityInput(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-[#E5EAEF] rounded-xl focus:ring-2 focus:ring-[#13DEB9] outline-none font-bold"
                  required
                />
                <span className="text-[11px] text-[#5A6A85] mt-1 block">
                  Declared purity by seller: {order.declared_purity || snapshot.listing_purity_percentage || 99.5}%
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5EAEF]">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 border border-[#E5EAEF] text-[#5A6A85] rounded-xl font-bold hover:bg-[#F6F9FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConfirmingReceipt}
                  className="px-5 py-2 bg-[#13DEB9] hover:bg-[#0ECA9B] text-white rounded-xl font-bold shadow-md shadow-[#13DEB9]/20 disabled:opacity-50"
                >
                  {isConfirmingReceipt ? 'Submitting...' : 'Confirm Delivery & Accept Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
