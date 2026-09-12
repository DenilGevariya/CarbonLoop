import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInquiry, useSendInquiryMessage } from '@/features/inquiries/hooks/useInquiries';
import { OfferComposerModal } from '@/features/offers/components/OfferComposerModal';
import { CounterOfferModal } from '@/features/offers/components/CounterOfferModal';
import { AcceptOfferDialog } from '@/features/orders/components/AcceptOfferDialog';
import {
  MessageSquare, Send, Building2, ArrowLeft, Handshake, CheckCircle2
} from 'lucide-react';

export const InquiryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: inquiry, isLoading, isError, error } = useInquiry(id);
  const sendMessageMutation = useSendInquiryMessage(id || '');

  const [messageText, setMessageText] = useState('');
  const [isOfferComposerOpen, setIsOfferComposerOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await sendMessageMutation.mutateAsync(messageText);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-[#8C827A] font-mono text-sm">Loading commercial workspace...</div>;
  }

  if (isError || !inquiry) {
    return (
      <div className="p-12 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded font-mono text-sm">
        {(error as any)?.message || 'Inquiry not found or access denied.'}
      </div>
    );
  }

  const currentOffer = inquiry.current_offer;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E2DDD5] pb-5 gap-4">
        <div>
          <Link
            to="/dashboard/inquiries"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5C554E] hover:text-[#173D32] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inquiries Inbox
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-medium text-[#171A18]">
              Inquiry CL-INQ-{inquiry.id.slice(0, 8).toUpperCase()}
            </h1>
            <span className="px-2.5 py-1 text-xs font-mono rounded font-semibold bg-[#173D32]/10 text-[#173D32] border border-[#173D32]/30">
              {inquiry.status}
            </span>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center gap-3">
          {!currentOffer && inquiry.status !== 'CLOSED' && (
            <button
              onClick={() => setIsOfferComposerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-all shadow-sm"
            >
              <Handshake className="w-3.5 h-3.5" />
              Create Commercial Offer
            </button>
          )}

          {currentOffer && (currentOffer.status === 'SENT' || currentOffer.status === 'PENDING') && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCounterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-white border border-[#E2DDD5] text-[#171A18] hover:bg-[#F7F5EF] rounded transition-colors"
              >
                Counter Offer
              </button>
              <button
                onClick={() => setIsAcceptDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono bg-[#173D32] text-white hover:bg-[#173D32]/90 rounded transition-colors font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Conversation Thread */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 space-y-4 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#173D32] uppercase font-semibold">
                <MessageSquare className="w-4 h-4" /> Commercial Negotiation Workspace
              </div>
              <span className="text-[11px] font-mono text-[#8C827A]">
                {inquiry.messages?.length || 0} messages
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {inquiry.messages && inquiry.messages.length > 0 ? (
                inquiry.messages.map((msg) => (
                  <div key={msg.id} className="p-3.5 bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#171A18] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#173D32]" />
                        {msg.sender_organization_name || 'Organization'}
                      </span>
                      <span className="text-[#8C827A] text-[11px]">
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C554E] font-mono leading-relaxed pt-1 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs font-mono text-[#8C827A]">
                  No message history recorded.
                </div>
              )}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="border-t border-[#E2DDD5] pt-3 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a commercial message..."
                className="flex-1 bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2 text-xs font-mono text-[#171A18] focus:outline-none focus:border-[#173D32]"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="px-4 py-2 bg-[#173D32] text-white rounded text-xs font-mono hover:bg-[#173D32]/90 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>

          {/* Current Active Commercial Offer Bar */}
          {currentOffer && (
            <div className="p-4 bg-[#F7F5EF] border border-[#173D32]/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-2">
                <span className="text-xs font-mono font-semibold text-[#173D32] uppercase">
                  Active Commercial Proposal: {currentOffer.offer_number || 'CL-OFR'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#173D32] text-white rounded font-bold">
                  {currentOffer.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Volume</span>
                  <span className="font-semibold text-[#171A18]">{currentOffer.quantity} t</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Unit Price</span>
                  <span className="font-semibold text-[#171A18]">₹{currentOffer.unit_price}/t</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Transport</span>
                  <span className="font-semibold text-[#171A18]">₹{currentOffer.delivery_cost || 0}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Estimated Total</span>
                  <span className="font-bold text-[#173D32]">₹{currentOffer.total_estimated_cost?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Transaction Context Panel */}
        <div className="space-y-4">
          <div className="bg-[#F7F5EF] border border-[#E2DDD5] rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#173D32] font-semibold border-b border-[#E2DDD5] pb-2">
              Transaction Context
            </h3>

            {/* Match Score Badge */}
            {inquiry.match_score !== null && inquiry.match_score !== undefined && (
              <div className="bg-white border border-[#E2DDD5] p-3 rounded-md flex items-center justify-between">
                <span className="text-xs font-mono text-[#5C554E]">Match Compatibility Score</span>
                <span className="text-sm font-mono font-bold text-[#173D32]">{inquiry.match_score} / 100</span>
              </div>
            )}

            {/* Requested Quantity Highlight */}
            <div className="bg-white border border-[#173D32]/30 p-3 rounded-md">
              <span className="text-[10px] font-mono uppercase text-[#8C827A]">Current Requested Volume</span>
              <div className="text-lg font-mono font-bold text-[#173D32] mt-0.5">
                {inquiry.requested_quantity} Tonnes
              </div>
            </div>

            {/* Supply Summary Card */}
            {inquiry.listing && (
              <div className="bg-white border border-[#E2DDD5] rounded-md p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-[#8C827A] uppercase font-semibold block">CO₂ Supply Source</span>
                <h4 className="text-sm font-serif font-medium text-[#171A18]">{inquiry.listing.title}</h4>
                <div className="space-y-1 text-xs font-mono text-[#5C554E]">
                  <div className="flex justify-between">
                    <span>Remaining Supply:</span>
                    <span className="font-semibold text-[#171A18]">{inquiry.listing.remaining_quantity} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purity:</span>
                    <span className="font-semibold text-[#173D32]">{inquiry.listing.purity_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Unit Price:</span>
                    <span className="font-semibold text-[#171A18]">₹{inquiry.listing.price_per_ton}/t</span>
                  </div>
                  {inquiry.listing.city && (
                    <div className="flex justify-between text-[11px] text-[#8C827A] pt-1 border-t border-[#E2DDD5]/60">
                      <span>Origin:</span>
                      <span>{inquiry.listing.city}, {inquiry.listing.state}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demand Summary Card */}
            {inquiry.requirement && (
              <div className="bg-white border border-[#E2DDD5] rounded-md p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-[#8C827A] uppercase font-semibold block">Buyer Demand Requirement</span>
                <h4 className="text-sm font-serif font-medium text-[#171A18]">{inquiry.requirement.title}</h4>
                <div className="space-y-1 text-xs font-mono text-[#5C554E]">
                  <div className="flex justify-between">
                    <span>Required Volume:</span>
                    <span className="font-semibold text-[#171A18]">{inquiry.requirement.required_quantity} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Required Purity:</span>
                    <span className="font-semibold text-[#173D32] font-mono">≥ {inquiry.requirement.required_purity_percentage}%</span>
                  </div>
                  {inquiry.requirement.location_city && (
                    <div className="flex justify-between text-[11px] text-[#8C827A] pt-1 border-t border-[#E2DDD5]/60">
                      <span>Destination:</span>
                      <span>{inquiry.requirement.location_city}, {inquiry.requirement.location_state}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Composer Modal */}
      {isOfferComposerOpen && inquiry.listing && (
        <OfferComposerModal
          isOpen={isOfferComposerOpen}
          onClose={() => setIsOfferComposerOpen(false)}
          inquiryId={inquiry.id}
          listing={inquiry.listing}
          requestedQuantity={inquiry.requested_quantity}
        />
      )}

      {/* Counter Offer Modal */}
      {isCounterModalOpen && currentOffer && (
        <CounterOfferModal
          isOpen={isCounterModalOpen}
          onClose={() => setIsCounterModalOpen(false)}
          parentOffer={currentOffer}
        />
      )}

      {/* Accept Offer Dialog */}
      {isAcceptDialogOpen && currentOffer && (
        <AcceptOfferDialog
          isOpen={isAcceptDialogOpen}
          onClose={() => setIsAcceptDialogOpen(false)}
          offer={currentOffer}
        />
      )}
    </div>
  );
};

export default InquiryDetailPage;
