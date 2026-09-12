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
    <div className="min-h-screen bg-[#F7F5EF] p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5] p-6 border border-[#E2DDD5] rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#173D32] font-semibold tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>LOGISTICS & TRANSPORT NETWORK HUB</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-[#171A18]">Logistics & Carrier Network</h1>
          <p className="text-xs font-mono text-[#55524D] mt-0.5">
            Manage transport proposals, rate quotes, carrier profiles, and physical delivery operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#173D32] text-white text-xs font-mono font-semibold rounded-md hover:bg-[#173D32]/90 flex items-center gap-2 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Transport Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5] font-mono">
          <p className="text-[11px] uppercase text-[#55524D] font-semibold">Active Movements</p>
          <p className="text-2xl font-bold text-[#171A18] mt-1">{activeShipments.length}</p>
          <p className="text-[10px] text-[#55524D] mt-0.5">In Transit / Scheduled</p>
        </div>

        <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5] font-mono">
          <p className="text-[11px] uppercase text-[#55524D] font-semibold">Submitted Quotes</p>
          <p className="text-2xl font-bold text-[#171A18] mt-1">{quotes.length}</p>
          <p className="text-[10px] text-[#55524D] mt-0.5">Commercial Proposals</p>
        </div>

        <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5] font-mono">
          <p className="text-[11px] uppercase text-[#55524D] font-semibold">Verified Providers</p>
          <p className="text-2xl font-bold text-[#171A18] mt-1">{providers.length}</p>
          <p className="text-[10px] text-[#55524D] mt-0.5">Logistics Network Partners</p>
        </div>

        <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5] font-mono">
          <p className="text-[11px] uppercase text-rose-700 font-semibold">Exceptions Alerted</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">{exceptionShipments.length}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Action Required</p>
        </div>
      </div>

      {/* Active Movements Spotlight Panel */}
      {activeShipments.length > 0 && (
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#171A18] font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#173D32]" />
              <span>Active Physical Movements</span>
            </h3>
            <button
              onClick={() => navigate('/dashboard/shipments')}
              className="text-xs font-mono text-[#173D32] font-semibold hover:underline flex items-center gap-1"
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
                className="bg-[#F7F5EF] border border-[#E2DDD5] rounded p-4 hover:border-[#173D32] cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-[#171A18]">{s.shipment_number}</span>
                  <span className="px-2 py-0.5 bg-[#173D32] text-white text-[10px] font-mono rounded font-semibold uppercase">
                    {s.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#55524D]">
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
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#171A18] font-bold">
            Logistics Transport Quotes & Rate Proposals
          </h3>
          <div className="flex items-center gap-1 bg-[#E2DDD5]/40 p-1 rounded text-xs font-mono">
            <button
              onClick={() => setRole('all')}
              className={`px-2.5 py-1 rounded ${role === 'all' ? 'bg-[#173D32] text-white' : 'text-[#55524D]'}`}
            >
              All Quotes
            </button>
            <button
              onClick={() => setRole('sent')}
              className={`px-2.5 py-1 rounded ${role === 'sent' ? 'bg-[#173D32] text-white' : 'text-[#55524D]'}`}
            >
              Submitted
            </button>
            <button
              onClick={() => setRole('received')}
              className={`px-2.5 py-1 rounded ${role === 'received' ? 'bg-[#173D32] text-white' : 'text-[#55524D]'}`}
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
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#171A18] font-bold flex items-center gap-2">
          <Building className="w-4 h-4 text-[#173D32]" />
          <span>Qualified Logistics Network Carriers</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {providers.map((p) => (
            <div key={p.id} className="bg-[#F7F5EF] border border-[#E2DDD5] rounded p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#171A18] text-sm">{p.name}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-semibold">
                  {p.verification_status}
                </span>
              </div>
              <p className="text-[11px] text-[#55524D]">
                Region: {p.country || 'India'} | {p.city || 'Gujarat Corridor'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-[#173D32] font-semibold">
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
