import React, { useState } from 'react';
import { useLogisticsQuotes, useLogisticsProviders } from '@/features/logistics/hooks/useLogistics';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { logisticsApi } from '@/features/logistics/api/logisticsApi';
import type { LogisticsQuote } from '@/features/logistics/api/logisticsApi';
import { LogisticsQuoteTable } from '@/features/logistics/components/LogisticsQuoteTable';
import { QuoteRequestModal } from '@/features/logistics/components/QuoteRequestModal';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Building, ChevronRight } from 'lucide-react';

export const LogisticsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'all' | 'sent' | 'received'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const { quotes, refetch: refetchQuotes } = useLogisticsQuotes(role);
  const { shipments, refetch: refetchShipments } = useShipments(role);
  const { providers } = useLogisticsProviders();

  const activeShipments = shipments.filter(
    (s) => s.status === 'SCHEDULED' || s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT' || s.status === 'ARRIVING'
  );
  const exceptionShipments = shipments.filter((s) => s.status === 'EXCEPTION');

  const handleAcceptQuote = async (quote: LogisticsQuote) => {
    try {
      setAcceptingId(quote.id);
      const res = await logisticsApi.acceptQuote(quote.id);
      const createdShipment = res;
      await refetchQuotes();
      await refetchShipments();
      if (createdShipment?.shipment_number) {
        navigate(`/dashboard/shipments/${createdShipment.shipment_number}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to accept quote');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectQuote = async (quote: LogisticsQuote) => {
    try {
      await logisticsApi.rejectQuote(quote.id, 'Buyer rejected transport proposal');
      refetchQuotes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E5EAEF] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#5D87FF] tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>LOGISTICS & TRANSPORT NETWORK HUB</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547]">Logistics & Carrier Network</h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Manage transport proposals, rate quotes, carrier profiles, and physical delivery operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#5D87FF] text-white text-xs font-semibold rounded-lg hover:bg-[#4570EA] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Transport Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs uppercase text-[#5A6A85] font-semibold">Active Movements</p>
          <p className="text-2xl font-bold text-[#5D87FF] mt-1">{activeShipments.length}</p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">In Transit / Scheduled</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs uppercase text-[#5A6A85] font-semibold">Submitted Quotes</p>
          <p className="text-2xl font-bold text-[#FFAE1F] mt-1">{quotes.length}</p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Commercial Proposals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs uppercase text-[#5A6A85] font-semibold">Verified Providers</p>
          <p className="text-2xl font-bold text-[#13DEB9] mt-1">{providers.length}</p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Logistics Network Partners</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
          <p className="text-xs uppercase text-[#FA896B] font-semibold">Exceptions Alerted</p>
          <p className="text-2xl font-bold text-[#FA896B] mt-1">{exceptionShipments.length}</p>
          <p className="text-[11px] text-[#FA896B] mt-0.5">Action Required</p>
        </div>
      </div>

      {/* Active Movements Spotlight Panel */}
      {activeShipments.length > 0 && (
        <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-[#2A3547] font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#5D87FF]" />
              <span>Active Physical Movements</span>
            </h3>
            <button
              onClick={() => navigate('/dashboard/shipments')}
              className="text-xs text-[#5D87FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Movements</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeShipments.slice(0, 2).map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/dashboard/shipments/${s.shipment_number}`)}
                className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg p-4 hover:border-[#5D87FF] cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#2A3547]">{s.shipment_number}</span>
                  <span className="px-2.5 py-0.5 bg-[#5D87FF] text-white text-[10px] rounded-full font-semibold uppercase">
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-[#5A6A85]">
                  {s.origin_city || 'Ahmedabad'} → {s.destination_city || 'Vadodara'} ({s.quantity} Tonnes CO₂)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotes Comparison & Proposal Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-[#2A3547] font-bold">
            Logistics Transport Quotes & Rate Proposals
          </h3>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#E5EAEF]">
            <button
              onClick={() => setRole('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${role === 'all' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'}`}
            >
              All Quotes
            </button>
            <button
              onClick={() => setRole('sent')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${role === 'sent' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'}`}
            >
              Submitted
            </button>
            <button
              onClick={() => setRole('received')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${role === 'received' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'}`}
            >
              Received
            </button>
          </div>
        </div>

        <LogisticsQuoteTable
          quotes={quotes}
          onAccept={handleAcceptQuote}
          onReject={handleRejectQuote}
          acceptingId={acceptingId}
        />
      </div>

      {/* Logistics Providers Directory Card Grid */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-xs uppercase tracking-wider text-[#2A3547] font-bold flex items-center gap-2">
          <Building className="w-4 h-4 text-[#5D87FF]" />
          <span>Qualified Logistics Network Carriers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {providers.map((p) => (
            <div key={p.id} className="bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2A3547] text-sm">{p.name}</span>
                <span className="px-2.5 py-0.5 bg-[#E6FFFA] text-[#13DEB9] text-[10px] rounded-full font-bold">
                  {p.verification_status}
                </span>
              </div>
              <p className="text-[11px] text-[#5A6A85]">
                Region: {p.country || 'India'} | {p.city || 'Gujarat Corridor'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-[#5D87FF] font-semibold">
                <Truck className="w-3 h-3" />
                <span>ISO Tanker, Cylinder Cascade, Rail</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote Submission Modal */}
      <QuoteRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await logisticsApi.createQuote(data);
          refetchQuotes();
        }}
      />
    </div>
  );
};
