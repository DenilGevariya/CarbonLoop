import React, { useState } from 'react';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { ShipmentStatusBadge } from '@/features/shipments/components/ShipmentStatusBadge';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Filter, ArrowRight, MapPin, Calendar, Scale, ChevronRight } from 'lucide-react';
import { format as formatDate } from 'date-fns';

export const ShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { shipments, loading, error, refetch } = useShipments(role, undefined, statusFilter || undefined);

  const filteredShipments = shipments.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shipment_number?.toLowerCase().includes(q) ||
      s.tracking_reference?.toLowerCase().includes(q) ||
      s.provider_name?.toLowerCase().includes(q) ||
      s.order_number?.toLowerCase().includes(q) ||
      s.origin_city?.toLowerCase().includes(q) ||
      s.destination_city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5] p-6 border border-[#E2DDD5] rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#173D32] font-semibold tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>CARBONLOOP PHYSICAL LOGISTICS LAYER</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-[#171A18]">Shipment Tracking Dashboard</h1>
          <p className="text-xs font-mono text-[#55524D] mt-0.5">
            Monitor real-time status, planned corridor stops, and historical tracking events for active CO₂ transfers.
          </p>
        </div>

        {/* Role Segmented Filter */}
        <div className="flex items-center gap-1 bg-[#E2DDD5]/40 p-1 rounded-md border border-[#E2DDD5] text-xs font-mono">
          <button
            onClick={() => setRole('all')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              role === 'all' ? 'bg-[#173D32] text-white shadow-2xs' : 'text-[#55524D] hover:text-[#171A18]'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setRole('sent')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              role === 'sent' ? 'bg-[#173D32] text-white shadow-2xs' : 'text-[#55524D] hover:text-[#171A18]'
            }`}
          >
            Carrier / Sent
          </button>
          <button
            onClick={() => setRole('received')}
            className={`px-3 py-1.5 rounded font-medium transition ${
              role === 'received' ? 'bg-[#173D32] text-white shadow-2xs' : 'text-[#55524D] hover:text-[#171A18]'
            }`}
          >
            Buyer / Seller
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FAF8F5] p-4 border border-[#E2DDD5] rounded-lg text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-[#55524D]" />
          <input
            type="text"
            placeholder="Search by Shipment #, Tracking Ref, City, Provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-[#171A18] focus:outline-none focus:border-[#173D32]"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#55524D]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F5EF] border border-[#E2DDD5] rounded px-3 py-2 text-[#171A18] focus:outline-none focus:border-[#173D32]"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="PICKED_UP">PICKED UP</option>
            <option value="IN_TRANSIT">IN TRANSIT</option>
            <option value="ARRIVING">ARRIVING</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="EXCEPTION">EXCEPTION</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#173D32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#55524D]">Loading shipment movement records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-lg font-mono text-xs text-center">
          {error}
          <div className="mt-3">
            <button onClick={() => refetch()} className="px-3 py-1.5 bg-rose-700 text-white rounded">
              Retry
            </button>
          </div>
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-12 text-center">
          <Truck className="w-12 h-12 text-[#55524D] mx-auto mb-3 opacity-30" />
          <h3 className="text-sm font-mono font-bold text-[#171A18] uppercase">No Active Shipments Found</h3>
          <p className="text-xs font-mono text-[#55524D] max-w-md mx-auto mt-1">
            There are currently no shipment movements matching your selected criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shp) => (
            <div
              key={shp.id}
              onClick={() => navigate(`/dashboard/shipments/${shp.shipment_number}`)}
              className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 hover:border-[#173D32] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2DDD5]/60">
                <div className="flex items-center gap-3">
                  <ShipmentStatusBadge status={shp.status} size="md" />
                  <span className="font-mono text-lg font-bold text-[#171A18] group-hover:text-[#173D32] transition">
                    {shp.shipment_number}
                  </span>
                  <span className="text-xs font-mono text-[#55524D] bg-[#E2DDD5]/40 px-2 py-0.5 rounded">
                    REF: {shp.tracking_reference}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#173D32] font-semibold">
                  <span>View Interactive Tracking</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                <div>
                  <p className="text-[11px] uppercase text-[#55524D] mb-1">Corridor Route</p>
                  <p className="font-bold text-[#171A18] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#173D32]" />
                    {shp.origin_city || 'Ahmedabad'} <ArrowRight className="w-3 h-3 text-[#55524D]" /> {shp.destination_city || 'Vadodara'}
                  </p>
                  <p className="text-[10px] text-[#55524D] mt-0.5">
                    Provider: {shp.provider_name || 'CarbonRoute Freight'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-[#55524D] mb-1">Payload Volume</p>
                  <p className="font-bold text-[#171A18] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#173D32]" />
                    {shp.quantity} TONNES CO₂
                  </p>
                  <p className="text-[10px] text-[#55524D] mt-0.5">
                    Mode: {shp.transport_mode?.replace(/_/g, ' ')}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-[#55524D] mb-1">Scheduled / ETA</p>
                  <p className="font-semibold text-[#171A18] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#173D32]" />
                    {shp.estimated_delivery_at ? formatDate(new Date(shp.estimated_delivery_at), 'dd MMM, HH:mm') : 'Pending Schedule'}
                  </p>
                  <p className="text-[10px] text-[#55524D] mt-0.5">
                    Distance: {shp.distance_km || 120} km
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase text-[#55524D] mb-1">Commercial Order</p>
                  <p className="font-bold text-[#171A18]">
                    ORDER #{shp.order_number || shp.order_id?.substring(0, 8)}
                  </p>
                  <p className="text-[10px] text-[#55524D] mt-0.5">
                    Buyer: {shp.buyer_organization_name || 'CO2 Buyer Org'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
