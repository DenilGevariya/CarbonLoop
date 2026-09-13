import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, CheckCircle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { logisticsApi } from '@/features/logistics/api/logisticsApi';
import type { TransportRequest } from '@/features/logistics/api/logisticsApi';
import { CounterBidModal } from '@/features/logistics/components/CounterBidModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const TransportationRequestsPage: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [counterBidModalRequest, setCounterBidModalRequest] = useState<TransportRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await logisticsApi.getAvailableRequests({ seller_name: search || undefined });
      setRequests(Array.isArray(res?.items) ? res.items : []);
    } catch (err) {
      console.error('Error fetching transport requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (req: TransportRequest) => {
    if (!window.confirm(`Accept Transportation Request for ${req.co2_quantity} Tonnes CO₂?`)) return;
    setAcceptingId(req.order_id);
    try {
      await logisticsApi.acceptRequest(req.order_id);
      navigate('/logistics/shipments');
    } catch (err: any) {
      alert(err.message || 'Failed to accept transport request');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (req: TransportRequest) => {
    const reason = window.prompt('Reason for rejecting (Optional):') || undefined;
    try {
      await logisticsApi.rejectRequest(req.order_id, reason);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleCounterBidSubmit = async (data: { proposed_price: number; message?: string }) => {
    if (!counterBidModalRequest) return;
    await logisticsApi.counterBidRequest(counterBidModalRequest.order_id, data);
    fetchRequests();
    alert('Counter bid submitted successfully!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#5D87FF] text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              LOGISTICS QUEUE
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">Transportation Orders</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Transportation Requests
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Open transport requests auto-generated from confirmed bilateral CO₂ transactions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRequests()}
          className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-[#5A6A85] absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
            placeholder="Search by seller, buyer, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Request Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider bg-white rounded-xl border border-[#E5EAEF]">
          Loading Transportation Requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E5EAEF] space-y-2">
          <Truck className="size-10 text-[#5A6A85]/40 mx-auto" />
          <h3 className="text-sm font-bold text-[#2A3547]">No open transportation requests</h3>
          <p className="text-xs text-[#5A6A85]">
            Confirmed orders requiring transport will automatically appear here for logistics assignment.
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
                  Created: {new Date(req.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Emitter / Seller</p>
                  <p className="font-bold text-[#2A3547] mt-0.5">{req.seller_name}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Buyer / Utilizer</p>
                  <p className="font-bold text-[#2A3547] mt-0.5">{req.buyer_name}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">CO₂ Spec</p>
                  <p className="font-bold text-[#5D87FF] mt-0.5">{req.co2_quantity} t ({req.co2_purity}% Purity)</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Route</p>
                  <p className="font-bold text-[#2A3547] mt-0.5">{req.pickup_location} → {req.delivery_location}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Transport Price</p>
                  <p className="font-bold text-[#2A3547] mt-0.5">₹{req.proposed_transport_price?.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#5A6A85] uppercase font-semibold">Deadline</p>
                  <p className="font-bold text-[#2A3547] mt-0.5">{new Date(req.delivery_deadline).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5EAEF]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(req)}
                  className="border-[#FA896B] text-[#FA896B] hover:bg-[#FDEDE8] text-xs font-semibold"
                >
                  <XCircle className="size-3.5 mr-1" /> Reject
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCounterBidModalRequest(req)}
                  className="border-[#FFAE1F] text-[#FFAE1F] hover:bg-[#FEF5E5] text-xs font-semibold"
                >
                  <MessageSquare className="size-3.5 mr-1" /> Counter Bid
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleAccept(req)}
                  disabled={acceptingId === req.order_id}
                  className="bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-bold shadow-xs"
                >
                  <CheckCircle className="size-3.5 mr-1" /> Accept & Create Shipment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Bid Modal */}
      <CounterBidModal
        isOpen={!!counterBidModalRequest}
        request={counterBidModalRequest}
        onClose={() => setCounterBidModalRequest(null)}
        onSubmit={handleCounterBidSubmit}
      />
    </div>
  );
};

export default TransportationRequestsPage;
