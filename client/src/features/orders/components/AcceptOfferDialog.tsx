import React, { useState } from 'react';
import { useAcceptOffer } from '@/features/offers/hooks/useOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, ShieldCheck, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AcceptOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    offer_number: string;
    quantity: number;
    unit_price: number;
    delivery_cost: number;
    total_estimated_cost: number;
    seller_organization_name?: string;
    listing_title?: string;
  };
}

export const AcceptOfferDialog: React.FC<AcceptOfferDialogProps> = ({
  isOpen,
  onClose,
  offer,
}) => {
  const navigate = useNavigate();
  const acceptOffer = useAcceptOffer();

  const [destinationAddress, setDestinationAddress] = useState<string>('GIDC Industrial Estate, Vadodara, Gujarat');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const handleConfirmAccept = async () => {
    setErrorMsg(null);
    try {
      const order = await acceptOffer.mutateAsync({
        offerId: offer.id,
        destinationAddress,
      });

      setCreatedOrder(order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept commercial offer.');
    }
  };

  const unitPrice = offer.unit_price || 0;
  const quantity = offer.quantity || 0;
  const deliveryCost = offer.delivery_cost || 0;
  const totalCost = offer.total_estimated_cost || quantity * unitPrice + deliveryCost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#FAF8F5] border-[#E2DDD5] text-[#171A18] p-6 shadow-2xl">
        {!createdOrder ? (
          <>
            <DialogHeader className="border-b border-[#E2DDD5] pb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#173D32]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Commercial Binding Agreement
              </div>
              <DialogTitle className="text-xl font-serif text-[#171A18] font-medium mt-1">
                Accept Commercial Offer?
              </DialogTitle>
              <DialogDescription className="text-xs text-[#5C554E] font-sans">
                Accepting will generate an industrial Purchase Order and reserve the CO₂ volume.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Commercial Terms Summary */}
            <div className="bg-[#F7F5EF] border border-[#E2DDD5] rounded-lg p-4 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-2">
                <span className="text-[#8C827A] uppercase text-[10px]">Offer Ref</span>
                <span className="font-semibold text-[#171A18]">{offer.offer_number || 'CL-OFR'}</span>
              </div>

              <div className="space-y-1.5 text-[#5C554E]">
                <div className="flex justify-between">
                  <span>Reserved Volume:</span>
                  <span className="font-semibold text-[#171A18]">{quantity} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span>Agreed Unit Price:</span>
                  <span className="font-semibold text-[#171A18]">₹{unitPrice.toLocaleString('en-IN')}/t</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Transport:</span>
                  <span className="font-semibold text-[#171A18]">₹{deliveryCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2DDD5] flex items-center justify-between font-mono">
                <span className="font-bold text-[#171A18]">Total Order Cost:</span>
                <span className="text-base font-bold text-[#173D32]">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Destination Address Field */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Destination Address / Industrial Facility
              </label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
                placeholder="e.g. Plant 4, GIDC Estate, Vadodara"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2DDD5]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-[#5C554E] hover:text-[#171A18] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={acceptOffer.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-all shadow-sm disabled:opacity-50 font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {acceptOffer.isPending ? 'Processing Order...' : 'Accept & Create Order'}
              </button>
            </div>
          </>
        ) : (
          /* Order Creation Success Panel */
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-[#173D32] font-semibold uppercase tracking-wider">
                COMMERCIAL ORDER CREATED
              </span>
              <h2 className="text-2xl font-serif font-medium text-[#171A18]">
                {createdOrder.order_number}
              </h2>
              <p className="text-xs text-[#5C554E] font-mono">
                {quantity} Tonnes reserved at ₹{unitPrice}/tonne.
              </p>
            </div>

            <div className="p-3 bg-[#F7F5EF] border border-[#E2DDD5] rounded text-xs font-mono text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8C827A]">Total Amount:</span>
                <span className="font-bold text-[#173D32]">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-[#8C827A] pt-1 border-t border-[#E2DDD5]/60">
                Shipment planning will become available after commercial confirmation.
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2DDD5] flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/dashboard/orders/${createdOrder.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-mono bg-[#173D32] text-white rounded hover:bg-[#173D32]/90 font-semibold"
              >
                View Purchase Order <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
