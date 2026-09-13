import React, { useState, useEffect, useCallback } from 'react';
import { useLogisticsQuotes, useLogisticsProviders } from '@/features/logistics/hooks/useLogistics';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { logisticsApi } from '@/features/logistics/api/logisticsApi';
import type { LogisticsQuote, TransportRequest, LogisticsDashboardStats } from '@/features/logistics/api/logisticsApi';
import { LogisticsQuoteTable } from '@/features/logistics/components/LogisticsQuoteTable';
import { QuoteRequestModal } from '@/features/logistics/components/QuoteRequestModal';
import { CounterBidModal } from '@/features/logistics/components/CounterBidModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Building,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const LogisticsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'requests';

  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'providers'>(initialTab as any);
  const [quoteRole, setQuoteRole] = useState<'all' | 'sent' | 'received'>('all');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Transportation Requests State
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [counterBidModalRequest, setCounterBidModalRequest] = useState<TransportRequest | null>(null);

  // Dashboard Stats State
  const [stats, setStats] = useState<LogisticsDashboardStats>({
    availableRequestsCount: 0,
    activeShipmentsCount: 0,
    completedShipmentsCount: 0,
    overdueShipmentsCount: 0,
    activeProposalsCount: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Search & Filter State for Transportation Requests
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filterPickup, setFilterPickup] = useState('');
  const [filterDelivery, setFilterDelivery] = useState('');
  const [filterMinQty, setFilterMinQty] = useState('');

  const { quotes, refetch: refetchQuotes } = useLogisticsQuotes(quoteRole);
  const { refetch: refetchShipments } = useShipments('all');
  const { providers } = useLogisticsProviders();

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await logisticsApi.getDashboardStats();
      if (res) setStats(res);
    } catch {
      // Fallback calculation from client arrays if endpoint fails
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setIsRequestsLoading(true);
      const queryObj: Record<string, string> = {};
      if (searchQuery) queryObj.seller_name = searchQuery;
      if (filterPickup) queryObj.pickup_location = filterPickup;
      if (filterDelivery) queryObj.delivery_location = filterDelivery;
      if (filterMinQty) queryObj.min_quantity = filterMinQty;

      const res = await logisticsApi.getAvailableRequests(queryObj);
      if (res?.items) setRequests(res.items);
    } catch (err: any) {
      console.error('Failed to load available transport requests:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  }, [searchQuery, filterPickup, filterDelivery, filterMinQty]);

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [fetchStats, fetchRequests]);

  const handleAcceptRequest = async (req: TransportRequest) => {
    if (!window.confirm(`Accept Transportation Request ${req.request_id} for ${req.co2_quantity} tonnes?`)) return;
    try {
      setAcceptingId(req.order_id);
      await logisticsApi.acceptRequest(req.order_id);
      await fetchStats();
      await fetchRequests();
      await refetchShipments();
      navigate('/dashboard/shipments');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to accept transport request');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (req: TransportRequest) => {
    const reason = window.prompt('Reason for rejecting this transport request (Optional):') || undefined;
    try {
      await logisticsApi.rejectRequest(req.order_id, reason);
      await fetchStats();
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to reject request');
    }
  };

  const handleCounterBidSubmit = async (data: { proposed_price: number; message?: string; estimated_delivery_time?: string; conditions?: string }) => {
    if (!counterBidModalRequest) return;
    await logisticsApi.counterBidRequest(counterBidModalRequest.order_id, data);
    await fetchStats();
    await fetchRequests();
    await refetchQuotes();
    alert('Counter bid submitted successfully! Order participants have been notified.');
  };

  const handleAcceptQuote = async (quote: LogisticsQuote) => {
    try {
      setAcceptingId(quote.id);
      const res = await logisticsApi.acceptQuote(quote.id);
      await refetchQuotes();
      await refetchShipments();
      if (res?.shipment_number) {
        navigate(`/dashboard/shipments/${res.shipment_number}`);
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
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E5EAEF] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#5D87FF] tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>LOGISTICS & TRANSPORTATION COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547]">Logistics Provider Operations</h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            View open transport requests from confirmed CarbonCupboard transactions, submit bids, and manage physical dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchRequests();
              refetchQuotes();
              refetchShipments();
            }}
            className="px-3 py-2 bg-[#F6F9FC] border border-[#E5EAEF] text-[#5A6A85] text-xs font-semibold rounded-lg hover:bg-[#ECF2FF] hover:text-[#5D87FF] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-2 bg-[#5D87FF] text-white text-xs font-semibold rounded-lg hover:bg-[#4570EA] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Transport Quote</span>
          </button>
        </div>
      </div>

      {/* 5 Real DB Counter KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Available Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className={`bg-white p-4 rounded-xl border ${activeTab === 'requests' ? 'border-[#5D87FF] ring-2 ring-[#5D87FF]/20' : 'border-[#E5EAEF]'} shadow-xs hover:border-[#5D87FF] cursor-pointer transition-all`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#5A6A85]">Available Requests</span>
            <div className="p-1.5 bg-blue-50 text-[#5D87FF] rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#5D87FF] mt-2">
            {isStatsLoading ? '...' : stats.availableRequestsCount}
          </p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Confirmed Orders Needing Carrier</p>
        </div>

        {/* Active Shipments */}
        <div
          onClick={() => navigate('/dashboard/shipments?status=active')}
          className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs hover:border-[#5D87FF] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#5A6A85]">Active Shipments</span>
            <div className="p-1.5 bg-emerald-50 text-[#13DEB9] rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#13DEB9] mt-2">
            {isStatsLoading ? '...' : stats.activeShipmentsCount}
          </p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Assigned / In Transit</p>
        </div>

        {/* Completed */}
        <div
          onClick={() => navigate('/dashboard/shipments?status=completed')}
          className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs hover:border-[#5D87FF] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#5A6A85]">Completed</span>
            <div className="p-1.5 bg-[#ECF2FF] text-[#5D87FF] rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#2A3547] mt-2">
            {isStatsLoading ? '...' : stats.completedShipmentsCount}
          </p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Buyer Receipt Confirmed</p>
        </div>

        {/* Overdue */}
        <div
          onClick={() => navigate('/dashboard/shipments?status=overdue')}
          className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs hover:border-[#FA896B] cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#FA896B]">Overdue</span>
            <div className="p-1.5 bg-[#FA896B]/10 text-[#FA896B] rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-[#FA896B]">
              {isStatsLoading ? '...' : stats.overdueShipmentsCount}
            </p>
            {stats.overdueShipmentsCount > 0 && (
              <span className="px-2 py-0.5 bg-[#FA896B] text-white text-[9px] font-extrabold uppercase rounded-full animate-pulse">
                OVERDUE
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#FA896B] mt-0.5">Deadline Exceeded</p>
        </div>

        {/* Active Inquiries/Offers */}
        <div
          onClick={() => setActiveTab('quotes')}
          className={`bg-white p-4 rounded-xl border ${activeTab === 'quotes' ? 'border-[#5D87FF] ring-2 ring-[#5D87FF]/20' : 'border-[#E5EAEF]'} shadow-xs hover:border-[#5D87FF] cursor-pointer transition-all`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#5A6A85]">Active Offers</span>
            <div className="p-1.5 bg-amber-50 text-[#FFAE1F] rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#FFAE1F] mt-2">
            {isStatsLoading ? '...' : stats.activeProposalsCount}
          </p>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">Counter Bids & Proposals</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b border-[#E5EAEF] flex items-center gap-4 bg-white px-4 pt-2 rounded-t-xl">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'requests'
              ? 'border-[#5D87FF] text-[#5D87FF]'
              : 'border-transparent text-[#5A6A85] hover:text-[#2A3547]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Available Transportation Requests</span>
          <span className="ml-1 px-2 py-0.5 bg-[#ECF2FF] text-[#5D87FF] text-[10px] rounded-full font-bold">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'quotes'
              ? 'border-[#5D87FF] text-[#5D87FF]'
              : 'border-transparent text-[#5A6A85] hover:text-[#2A3547]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Rate Quotes & Counter Proposals</span>
          <span className="ml-1 px-2 py-0.5 bg-amber-50 text-[#FFAE1F] text-[10px] rounded-full font-bold">
            {quotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'providers'
              ? 'border-[#5D87FF] text-[#5D87FF]'
              : 'border-transparent text-[#5A6A85] hover:text-[#2A3547]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Logistics Carrier Directory</span>
          <span className="ml-1 px-2 py-0.5 bg-emerald-50 text-[#13DEB9] text-[10px] rounded-full font-bold">
            {providers.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Transportation Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Search & Filtering Control Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#E5EAEF] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5A6A85] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Seller, Buyer, Location or Order #..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5EAEF] rounded-lg focus:border-[#5D87FF] focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#5A6A85] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </span>
                <input
                  type="text"
                  value={filterPickup}
                  onChange={(e) => setFilterPickup(e.target.value)}
                  placeholder="Pickup (e.g. Gujarat)"
                  className="px-2.5 py-1.5 text-xs border border-[#E5EAEF] rounded-lg w-32 focus:border-[#5D87FF]"
                />
                <input
                  type="text"
                  value={filterDelivery}
                  onChange={(e) => setFilterDelivery(e.target.value)}
                  placeholder="Delivery location"
                  className="px-2.5 py-1.5 text-xs border border-[#E5EAEF] rounded-lg w-32 focus:border-[#5D87FF]"
                />
                <input
                  type="number"
                  value={filterMinQty}
                  onChange={(e) => setFilterMinQty(e.target.value)}
                  placeholder="Min Tonnes"
                  className="px-2.5 py-1.5 text-xs border border-[#E5EAEF] rounded-lg w-24 focus:border-[#5D87FF]"
                />
              </div>
            </div>
          </div>

          {/* Requests Content Table / List */}
          {isRequestsLoading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#E5EAEF]">
              <div className="animate-spin w-6 h-6 border-2 border-[#5D87FF] border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-xs text-[#5A6A85]">Loading open transportation requests from confirmed transactions...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-[#E5EAEF] space-y-2">
              <Truck className="w-10 h-10 text-[#5A6A85] mx-auto" />
              <h3 className="text-sm font-bold text-[#2A3547]">No open transportation requests currently available.</h3>
              <p className="text-xs text-[#5A6A85] max-w-md mx-auto">
                Transportation requests are automatically generated once a buyer confirms an accepted deal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.order_id}
                  className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs hover:border-[#5D87FF] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5EAEF] pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-[#5D87FF] text-white text-xs font-bold rounded-lg uppercase tracking-wide">
                        {req.request_id}
                      </span>
                      <span className="text-xs text-[#5A6A85] font-semibold">
                        Order #{req.order_number}
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#E6FFFA] text-[#13DEB9] text-[10px] font-bold rounded-full uppercase">
                        {req.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#5A6A85]">
                      Created: {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Specification & Route Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Seller</p>
                      <p className="font-bold text-[#2A3547] mt-0.5 truncate">{req.seller_name}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Buyer</p>
                      <p className="font-bold text-[#2A3547] mt-0.5 truncate">{req.buyer_name}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">CO₂ Volume & Purity</p>
                      <p className="font-bold text-[#5D87FF] mt-0.5">
                        {req.co2_quantity} Tonnes ({req.co2_purity}% Purity)
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Route & Distance</p>
                      <p className="font-bold text-[#2A3547] mt-0.5 truncate">
                        {req.pickup_location} → {req.delivery_location} ({req.distance_km} km)
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Proposed Transport Price</p>
                      <p className="font-bold text-[#2A3547] mt-0.5">
                        ₹{req.proposed_transport_price?.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Delivery Deadline</p>
                      <p className="font-bold text-[#2A3547] mt-0.5">
                        {new Date(req.delivery_deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAEF]">
                    <button
                      onClick={() => handleRejectRequest(req)}
                      className="px-3.5 py-1.5 border border-[#FA896B] text-[#FA896B] text-xs font-semibold rounded-lg hover:bg-[#FA896B]/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => setCounterBidModalRequest(req)}
                      className="px-3.5 py-1.5 border border-[#FFAE1F] text-[#FFAE1F] text-xs font-semibold rounded-lg hover:bg-amber-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Counter Bid</span>
                    </button>

                    <button
                      onClick={() => handleAcceptRequest(req)}
                      disabled={acceptingId === req.order_id}
                      className="px-4 py-1.5 bg-[#5D87FF] text-white text-xs font-semibold rounded-lg hover:bg-[#4570EA] flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{acceptingId === req.order_id ? 'Assigning...' : 'Accept Request'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rate Quotes & Counter Proposals */}
      {activeTab === 'quotes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wider text-[#2A3547] font-bold">
              Logistics Transport Quotes & Rate Proposals
            </h3>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-[#E5EAEF]">
              <button
                onClick={() => setQuoteRole('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  quoteRole === 'all' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                All Quotes
              </button>
              <button
                onClick={() => setQuoteRole('sent')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  quoteRole === 'sent' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                Submitted
              </button>
              <button
                onClick={() => setQuoteRole('received')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  quoteRole === 'received' ? 'bg-[#5D87FF] text-white' : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
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
      )}

      {/* Tab 3: Qualified Logistics Carriers */}
      {activeTab === 'providers' && (
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
                  <span className="px-2.5 py-0.5 bg-[#E6FFFA] text-[#13DEB9] text-[10px] rounded-full font-bold uppercase">
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
      )}

      {/* Counter Bid Modal */}
      <CounterBidModal
        isOpen={!!counterBidModalRequest}
        request={counterBidModalRequest}
        onClose={() => setCounterBidModalRequest(null)}
        onSubmit={handleCounterBidSubmit}
      />

      {/* Quote Submission Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSubmit={async (data) => {
          await logisticsApi.createQuote(data);
          refetchQuotes();
        }}
      />
    </div>
  );
};
