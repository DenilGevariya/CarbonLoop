import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, Send, AlertTriangle } from 'lucide-react';
import type { TransportRequest } from '../api/logisticsApi';

interface CounterBidModalProps {
  isOpen: boolean;
  request: TransportRequest | null;
  onClose: () => void;
  onSubmit: (data: { proposed_price: number; message?: string; estimated_delivery_time?: string; conditions?: string }) => Promise<void>;
}

export const CounterBidModal: React.FC<CounterBidModalProps> = ({
  isOpen,
  request,
  onClose,
  onSubmit,
}) => {
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(proposedPrice);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid proposed transport price.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        proposed_price: priceNum,
        message: message || undefined,
        estimated_delivery_time: estimatedDeliveryTime || undefined,
        conditions: conditions || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit counter bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-[#E5EAEF] shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E5EAEF] bg-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5D87FF]">
              TRANSPORTATION PROPOSAL
            </span>
            <h3 className="text-lg font-bold text-[#2A3547]">Submit Counter Bid</h3>
            <p className="text-xs text-[#5A6A85]">
              Request #{request.request_id} ({request.seller_name} → {request.buyer_name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#5A6A85] hover:bg-[#F6F9FC] hover:text-[#2A3547] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FA896B]/15 border border-[#FA896B]/30 text-[#FA896B] rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Request Overview Box */}
          <div className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg p-3 text-xs space-y-1 text-[#2A3547]">
            <div className="flex justify-between">
              <span className="text-[#5A6A85]">CO₂ Volume:</span>
              <span className="font-semibold">{request.co2_quantity} Tonnes ({request.co2_purity}% Purity)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6A85]">Route:</span>
              <span className="font-semibold">{request.pickup_location} → {request.delivery_location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A6A85]">Original Proposed Price:</span>
              <span className="font-semibold text-[#5D87FF]">₹{request.proposed_transport_price?.toLocaleString()}</span>
            </div>
          </div>

          {/* Proposed Transport Price */}
          <div>
            <label className="block text-xs font-semibold text-[#2A3547] mb-1">
              Proposed Transportation Price (₹ / Tonne or Total) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
              <input
                type="number"
                step="any"
                required
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder={`e.g. ${request.proposed_transport_price || 1500}`}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5EAEF] rounded-lg focus:border-[#5D87FF] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Estimated Delivery Time */}
          <div>
            <label className="block text-xs font-semibold text-[#2A3547] mb-1">
              Estimated Delivery Date / Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
              <input
                type="datetime-local"
                value={estimatedDeliveryTime}
                onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5EAEF] rounded-lg focus:border-[#5D87FF] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-xs font-semibold text-[#2A3547] mb-1">
              Message to Counterparties
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain pricing adjustments, fleet specifications, ISO tanker availability..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5EAEF] rounded-lg focus:border-[#5D87FF] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Conditions */}
          <div>
            <label className="block text-xs font-semibold text-[#2A3547] mb-1">
              Optional Transport Conditions
            </label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Special cryogenic insulation required, toll surcharges apply..."
              className="w-full px-3 py-2 text-xs border border-[#E5EAEF] rounded-lg focus:border-[#5D87FF] focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAEF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5EAEF] text-[#5A6A85] text-xs font-semibold rounded-lg hover:bg-[#F6F9FC] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#5D87FF] text-white text-xs font-semibold rounded-lg hover:bg-[#4570EA] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Counter Bid'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
