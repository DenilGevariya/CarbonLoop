import React, { useState } from 'react';
import { useCreateOffer } from '../hooks/useOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Handshake, AlertCircle, Calculator } from 'lucide-react';

interface OfferComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryId: string;
  listing: {
    id: string;
    title: string;
    price_per_ton: number;
    remaining_quantity: number;
  };
  requestedQuantity: number;
}

export const OfferComposerModal: React.FC<OfferComposerModalProps> = ({
  isOpen,
  onClose,
  inquiryId,
  listing,
  requestedQuantity,
}) => {
  const createOffer = useCreateOffer();

  // Default validity date: 7 days in future
  const defaultValidUntil = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [quantity, setQuantity] = useState<number>(Math.min(requestedQuantity, listing.remaining_quantity));
  const [unitPrice, setUnitPrice] = useState<number>(listing.price_per_ton);
  const [deliveryCost, setDeliveryCost] = useState<number>(25000);
  const [validUntilDate, setValidUntilDate] = useState<string>(defaultValidUntil);
  const [message, setMessage] = useState<string>('Formal commercial supply proposal issued by seller.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live client-side calculated values
  const subtotal = (quantity || 0) * (unitPrice || 0);
  const totalCost = subtotal + (deliveryCost || 0);
  const deliveredCostPerTon = quantity > 0 ? totalCost / quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0) {
      setErrorMsg('Offered quantity must be greater than 0.');
      return;
    }
    if (quantity > listing.remaining_quantity) {
      setErrorMsg(`Offered quantity (${quantity} t) cannot exceed available supply (${listing.remaining_quantity} t).`);
      return;
    }
    if (unitPrice < 0) {
      setErrorMsg('Unit price cannot be negative.');
      return;
    }
    if (!validUntilDate) {
      setErrorMsg('Please select a valid expiration date.');
      return;
    }

    try {
      await createOffer.mutateAsync({
        inquiry_id: inquiryId,
        quantity,
        unit_price: unitPrice,
        delivery_cost: deliveryCost,
        currency: 'INR',
        valid_until: new Date(validUntilDate + 'T23:59:59Z').toISOString(),
        message,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit commercial offer.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#FAF8F5] border-[#E2DDD5] text-[#171A18] p-6 shadow-2xl">
        <DialogHeader className="border-b border-[#E2DDD5] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#173D32]">
            <Handshake className="w-3.5 h-3.5" /> Bilateral Procurement Workflow
          </div>
          <DialogTitle className="text-xl font-serif text-[#171A18] font-medium mt-1">
            Issue Commercial Offer
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5C554E] font-sans">
            Formal commercial terms proposal for "{listing.title}".
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Volume (Tonnes) *
              </label>
              <input
                type="number"
                min={1}
                max={listing.remaining_quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-sm font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Unit Price (₹/tonne) *
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-sm font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Transport Cost (₹)
              </label>
              <input
                type="number"
                min={0}
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-sm font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Offer Expiration Date *
              </label>
              <input
                type="date"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-sm font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
                required
              />
            </div>
          </div>

          {/* Recalculated Financial Breakdown Card */}
          <div className="bg-[#F7F5EF] border border-[#173D32]/30 rounded-lg p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#173D32] font-semibold flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" /> Automatic Server-Recalculated Totals
            </span>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2DDD5]/60 text-xs font-mono">
              <div>
                <span className="text-[#8C827A] block text-[10px]">CO₂ Subtotal</span>
                <span className="font-semibold text-[#171A18]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[#8C827A] block text-[10px]">Logistics Component</span>
                <span className="font-semibold text-[#171A18]">₹{deliveryCost.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[#8C827A] block text-[10px]">Indicative Delivered / t</span>
                <span className="font-bold text-[#173D32]">₹{Math.round(deliveredCostPerTon).toLocaleString('en-IN')}/t</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E2DDD5]/60 flex items-center justify-between font-mono">
              <span className="text-xs font-semibold text-[#171A18]">Estimated Total Transaction Cost:</span>
              <span className="text-base font-bold text-[#173D32]">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
              Proposal Message / Delivery Terms
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-[#E2DDD5] rounded p-3 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
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
              type="submit"
              disabled={createOffer.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-all shadow-sm disabled:opacity-50 font-semibold"
            >
              {createOffer.isPending ? 'Issuing Offer...' : 'Issue Commercial Offer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
