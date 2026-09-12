import React, { useState } from 'react';
import { useCreateInquiry } from '../hooks/useInquiries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Building2, Send, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InquiryComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    remaining_quantity: number;
    price_per_ton: number;
    purity_percentage: number;
    organization_name?: string;
  };
  requirement?: {
    id: string;
    title?: string;
    required_quantity?: number;
  };
  matchScore?: number;
}

export const InquiryComposerModal: React.FC<InquiryComposerModalProps> = ({
  isOpen,
  onClose,
  listing,
  requirement,
  matchScore,
}) => {
  const navigate = useNavigate();
  const createInquiry = useCreateInquiry();

  const initialQty = requirement?.required_quantity
    ? Math.min(requirement.required_quantity, listing.remaining_quantity)
    : Math.min(100, listing.remaining_quantity);

  const [quantity, setQuantity] = useState<number>(initialQty);
  const [message, setMessage] = useState<string>(
    `Hello ${listing.organization_name || 'Team'}, we would like to open commercial discussion to request ${initialQty} tonnes of CO₂ from listing "${listing.title}".`
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0) {
      setErrorMsg('Requested quantity must be greater than 0 tonnes.');
      return;
    }

    if (quantity > listing.remaining_quantity) {
      setErrorMsg(`Requested quantity (${quantity} t) cannot exceed available supply (${listing.remaining_quantity} t).`);
      return;
    }

    if (!message || message.trim().length < 5) {
      setErrorMsg('Please include a short message (at least 5 characters).');
      return;
    }

    try {
      const result = await createInquiry.mutateAsync({
        listing_id: listing.id,
        requirement_id: requirement?.id,
        requested_quantity: quantity,
        message,
      });

      onClose();
      navigate(`/dashboard/inquiries/${result.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit supply request.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#FAF8F5] border-[#E2DDD5] text-[#171A18] p-6 shadow-2xl">
        <DialogHeader className="border-b border-[#E2DDD5] pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#173D32]">
            <Sparkles className="w-3.5 h-3.5" /> Commercial Transaction Layer
          </div>
          <DialogTitle className="text-xl font-serif text-[#171A18] font-medium mt-1">
            Request CO₂ Supply
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5C554E] font-sans">
            Initiate a bilateral inquiry thread with {listing.organization_name || 'the seller'}.
          </DialogDescription>
        </DialogHeader>

        {/* Commercial Context Summary Box */}
        <div className="bg-[#F7F5EF] border border-[#E2DDD5] rounded-lg p-4 my-2 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#8C827A] uppercase">Target Supply Listing</span>
              <h4 className="text-sm font-serif font-medium text-[#171A18]">{listing.title}</h4>
              <p className="text-xs text-[#5C554E] flex items-center gap-1.5 mt-0.5 font-mono">
                <Building2 className="w-3 h-3 text-[#173D32]" />
                {listing.organization_name || 'CO₂ Supplier'}
              </p>
            </div>
            {matchScore !== undefined && matchScore !== null && (
              <div className="text-right bg-white border border-[#E2DDD5] px-2.5 py-1 rounded">
                <span className="text-[10px] font-mono text-[#8C827A] uppercase block">Match Score</span>
                <span className="text-sm font-mono font-bold text-[#173D32]">{matchScore} / 100</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2DDD5]/60 text-xs font-mono">
            <div>
              <span className="text-[#8C827A] block text-[10px]">Available</span>
              <span className="font-semibold text-[#171A18]">{listing.remaining_quantity} t</span>
            </div>
            <div>
              <span className="text-[#8C827A] block text-[10px]">Base Price</span>
              <span className="font-semibold text-[#171A18]">₹{listing.price_per_ton.toLocaleString('en-IN')}/t</span>
            </div>
            <div>
              <span className="text-[#8C827A] block text-[10px]">Purity</span>
              <span className="font-semibold text-[#173D32]">{listing.purity_percentage}%</span>
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
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
              Requested Quantity (Tonnes) *
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
            <span className="text-[11px] font-mono text-[#8C827A] mt-1 block">
              Max available: {listing.remaining_quantity} tonnes
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554E] mb-1">
              Commercial Message *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-[#E2DDD5] rounded p-3 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32] leading-relaxed"
              required
            />
          </div>

          {/* Pre-submit Notice */}
          <div className="p-3 bg-[#173D32]/5 border border-[#173D32]/20 rounded text-xs font-mono text-[#173D32]">
            You're requesting <strong className="font-bold">{quantity} tonnes</strong> from{' '}
            <strong>{listing.organization_name || 'the seller'}</strong>.
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
              disabled={createInquiry.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-mono uppercase tracking-wider bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-all shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {createInquiry.isPending ? 'Sending Inquiry...' : 'Submit Supply Request'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
