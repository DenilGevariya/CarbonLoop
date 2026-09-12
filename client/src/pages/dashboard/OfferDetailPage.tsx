import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOffer, useRejectOffer } from '@/features/offers/hooks/useOffers';
import { CounterOfferModal } from '@/features/offers/components/CounterOfferModal';
import { AcceptOfferDialog } from '@/features/orders/components/AcceptOfferDialog';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: offer, isLoading, isError, error } = useOffer(id);

  const rejectOfferMutation = useRejectOffer();

  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (isLoading) {
    return <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading commercial proposal...</div>;
  }

  if (isError || !offer) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded font-mono text-sm">
        {(error as any)?.message || 'Offer not found or access denied.'}
      </div>
    );
  }

  const handleReject = async () => {
    try {
      await rejectOfferMutation.mutateAsync({ offerId: offer.id, reason: rejectReason });
      setIsRejecting(false);
    } catch (err) {
      console.error(err);
    }
  };

  const status = (offer.status || '').toUpperCase();
  const isPending = status === 'SENT' || status === 'PENDING';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back Link & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2DDD5] pb-5 gap-4">
        <div>
          <Link
            to="/dashboard/offers"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5C554E] hover:text-[#173D32] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Offers Inbox
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-medium text-[#171A18]">
              Proposal {offer.offer_number || `CL-OFR-${offer.id.slice(0, 6)}`}
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono rounded font-semibold bg-[#173D32] text-white">
              Ver {offer.version || 1} • {status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCounterModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-mono bg-white border border-[#E2DDD5] text-[#171A18] hover:bg-[#F7F5EF] rounded transition-colors"
            >
              Counter Proposal
            </button>
            <button
              onClick={() => setIsRejecting(true)}
              className="px-3.5 py-1.5 text-xs font-mono bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => setIsAcceptDialogOpen(true)}
              className="px-4 py-1.5 text-xs font-mono bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-colors font-semibold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Order
            </button>
          </div>
        )}
      </div>

      {/* Main Commercial Summary Card */}
      <div className="bg-[#F7F5EF] border border-[#E2DDD5] rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
          <span className="text-xs font-mono text-[#173D32] uppercase tracking-wider font-semibold">
            Commercial Summary Breakdown
          </span>
          <span className="text-xs font-mono text-[#8C827A]">
            Issued: {new Date(offer.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-white p-3.5 rounded border border-[#E2DDD5]">
            <span className="text-[#8C827A] text-[10px] uppercase block">Contract Volume</span>
            <span className="text-lg font-bold text-[#171A18] mt-0.5 block">{offer.quantity} tonnes</span>
          </div>

          <div className="bg-white p-3.5 rounded border border-[#E2DDD5]">
            <span className="text-[#8C827A] text-[10px] uppercase block">Unit Price</span>
            <span className="text-lg font-bold text-[#173D32] mt-0.5 block">₹{offer.unit_price}/tonne</span>
          </div>

          <div className="bg-white p-3.5 rounded border border-[#E2DDD5]">
            <span className="text-[#8C827A] text-[10px] uppercase block">Transport Fee</span>
            <span className="text-lg font-bold text-[#171A18] mt-0.5 block">₹{(offer.delivery_cost || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="bg-[#173D32] text-white p-3.5 rounded border border-[#173D32]">
            <span className="text-emerald-200 text-[10px] uppercase block">Estimated Total</span>
            <span className="text-lg font-bold mt-0.5 block">₹{(offer.total_estimated_cost || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {offer.message && (
          <div className="bg-white p-4 rounded border border-[#E2DDD5] text-xs font-mono space-y-1">
            <span className="text-[10px] text-[#8C827A] uppercase block">Terms / Note</span>
            <p className="text-[#5C554E] leading-relaxed whitespace-pre-wrap">{offer.message}</p>
          </div>
        )}
      </div>

      {/* Version History Timeline */}
      {offer.version_history && offer.version_history.length > 0 && (
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#173D32] font-semibold border-b border-[#E2DDD5] pb-2">
            Negotiation Chronology Timeline
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {offer.version_history.map((hist) => (
              <div key={hist.id} className="flex items-start gap-4 p-3 bg-[#FAF8F5] border border-[#E2DDD5] rounded">
                <div className="w-8 h-8 rounded bg-[#173D32]/10 text-[#173D32] font-bold flex items-center justify-center text-xs shrink-0">
                  V{hist.version}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#171A18]">{hist.offer_number}</span>
                    <span className="text-[11px] text-[#8C827A]">{new Date(hist.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="text-[#5C554E] flex items-center gap-4">
                    <span>{hist.quantity} tonnes</span>
                    <span>₹{hist.unit_price}/tonne</span>
                    <span className="font-semibold text-[#173D32]">Total: ₹{(hist.total_estimated_cost || 0).toLocaleString('en-IN')}</span>
                    <span className="px-1.5 py-0.5 bg-[#E2DDD5] text-[#171A18] rounded text-[10px]">{hist.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Reason Form Modal */}
      {isRejecting && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded space-y-3">
          <h4 className="text-xs font-mono uppercase font-semibold text-rose-800">Decline Commercial Offer</h4>
          <textarea
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Optional reason for declining proposal..."
            className="w-full bg-white border border-rose-300 rounded p-2 text-xs font-mono text-[#171A18]"
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setIsRejecting(false)} className="px-3 py-1 text-xs font-mono text-[#5C554E]">Cancel</button>
            <button onClick={handleReject} className="px-4 py-1 text-xs font-mono bg-rose-700 text-white rounded font-semibold">Confirm Decline</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCounterModalOpen && (
        <CounterOfferModal
          isOpen={isCounterModalOpen}
          onClose={() => setIsCounterModalOpen(false)}
          parentOffer={offer}
        />
      )}

      {isAcceptDialogOpen && (
        <AcceptOfferDialog
          isOpen={isAcceptDialogOpen}
          onClose={() => setIsAcceptDialogOpen(false)}
          offer={offer}
        />
      )}
    </div>
  );
};

export default OfferDetailPage;
