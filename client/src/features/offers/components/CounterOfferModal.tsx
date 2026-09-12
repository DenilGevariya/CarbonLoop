import React, { useState } from 'react';
import { useCounterOffer } from '../hooks/useOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertCircle, ArrowRightLeft } from 'lucide-react';

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentOffer: {
    id: string;
    offer_number: string;
    quantity: number;
    unit_price: number;
    delivery_cost: number;
    total_estimated_cost: number;
  };
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
  isOpen,
  onClose,
  parentOffer,
}) => {
  const counterMutation = useCounterOffer(parentOffer.id);

  const defaultValidUntil = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [unitPrice, setUnitPrice] = useState<number>(parentOffer.unit_price);
  const [quantity, setQuantity] = useState<number>(parentOffer.quantity);
  const [deliveryCost, setDeliveryCost] = useState<number>(parentOffer.delivery_cost || 0);
  const [validUntilDate, setValidUntilDate] = useState<string>(defaultValidUntil);
  const [message, setMessage] = useState<string>('Revised counter proposal submitted.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculated differences
  const priceDiffPct =
    parentOffer.unit_price > 0
      ? (((unitPrice - parentOffer.unit_price) / parentOffer.unit_price) * 100).toFixed(2)
      : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (unitPrice < 0) {
      setErrorMsg('Unit price cannot be negative.');
      return;
    }

    try {
      await counterMutation.mutateAsync({
        quantity,
        unit_price: unitPrice,
        delivery_cost: deliveryCost,
        valid_until: new Date(validUntilDate + 'T23:59:59Z').toISOString(),
        message,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit counter offer.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#FAF8F5] border-[#E2DDD5] text-[#171A18] p-6 shadow-2xl">
        <DialogHeader className="border-b border-[#E2DDD5] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#173D32]">
            <ArrowRightLeft className="w-3.5 h-3.5" /> Bilateral Counter Proposal
          </div>
          <DialogTitle className="text-xl font-serif text-[#171A18] font-medium mt-1">
            Submit Counter Offer
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5C554E] font-sans">
            Revising terms for offer {parentOffer.offer_number}.
          </DialogDescription>
        </DialogHeader>

        {/* Side-by-Side Comparison Panel */}
        <div className="grid grid-cols-2 gap-3 bg-[#F7F5EF] border border-[#E2DDD5] p-3.5 rounded-lg text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8C827A] uppercase block font-semibold">Previous Offer ({parentOffer.offer_number})</span>
            <div className="text-sm font-bold text-[#171A18]">₹{parentOffer.unit_price}/t</div>
            <div className="text-[11px] text-[#5C554E]">{parentOffer.quantity} tonnes</div>
            <div className="text-[11px] text-[#5C554E]">Total: ₹{parentOffer.total_estimated_cost?.toLocaleString('en-IN')}</div>
          </div>

          <div className="space-y-1 border-l border-[#E2DDD5] pl-3">
            <span className="text-[10px] text-[#173D32] uppercase block font-semibold">Your Proposal</span>
            <div className="text-sm font-bold text-[#173D32]">₹{unitPrice}/t</div>
            <div className="text-[11px] text-[#5C554E]">{quantity} tonnes</div>
            <div className="text-[11px] font-bold text-[#173D32]">
              Variance: {parseFloat(priceDiffPct) >= 0 ? `+${priceDiffPct}%` : `${priceDiffPct}%`}
            </div>
          </div>
        </div>

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
                Counter Unit Price (₹/tonne) *
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
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
                Volume (Tonnes)
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2DDD5] rounded px-3 py-2 text-sm font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
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
                Valid Until *
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

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
              Counter Proposal Justification
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
              disabled={counterMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-all shadow-sm disabled:opacity-50 font-semibold"
            >
              {counterMutation.isPending ? 'Sending Counter...' : 'Send Counter Offer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
