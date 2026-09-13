import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Filter, MapPin, Eye } from 'lucide-react';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { ShipmentStatusBadge } from '@/features/shipments/components/ShipmentStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { shipments = [], loading, refetch } = useShipments('all', undefined, statusFilter || undefined);

  const filteredShipments = shipments.filter((s: any) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (s.shipment_number || '').toLowerCase().includes(term) ||
      (s.provider_name || '').toLowerCase().includes(term) ||
      (s.origin_city || '').toLowerCase().includes(term) ||
      (s.destination_city || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5EAEF] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              ADMIN MONITORING
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">Cryogenic Transport Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547] tracking-tight">
            Shipment Monitoring Console
          </h1>
          <p className="text-xs text-[#5A6A85] mt-1">
            Real-time status monitoring for active CO₂ cryogenic tanker movements and logistics compliance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
        >
          Refresh Movements
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="size-4 text-[#5A6A85] absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-[#F6F9FC] border border-[#E5EAEF] pl-9 pr-4 py-2 rounded-lg text-xs font-medium text-[#2A3547] focus:outline-none focus:border-[#5D87FF]"
            placeholder="Search shipment #, logistics provider, origin, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-[#5A6A85]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F6F9FC] border border-[#E5EAEF] text-xs font-semibold text-[#2A3547] rounded-lg px-3 py-2 focus:outline-none focus:border-[#5D87FF]"
          >
            <option value="">All Movement Statuses</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-semibold text-[#5A6A85] uppercase tracking-wider">
            Loading Cryogenic Shipments...
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Truck className="size-8 text-[#5A6A85]/40 mx-auto" />
            <p className="text-sm font-bold text-[#2A3547]">No active or historical shipments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F9FC] border-b border-[#E5EAEF] text-[#5A6A85] font-semibold text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Shipment # / Ref</th>
                  <th className="py-3.5 px-4">Logistics Carrier</th>
                  <th className="py-3.5 px-4">Corridor Route</th>
                  <th className="py-3.5 px-4">Volume & Tanker</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAEF]">
                {filteredShipments.map((shp: any) => (
                  <tr key={shp.id} className="hover:bg-[#F6F9FC] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547] flex items-center gap-1.5">
                        <Truck className="size-3.5 text-indigo-600" />
                        {shp.shipment_number}
                      </div>
                      <span className="text-[10px] text-[#5A6A85]">REF: {shp.tracking_reference || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2A3547]">
                      {shp.provider_name || 'CarbonRoute Freight'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547] flex items-center gap-1">
                        <MapPin className="size-3 text-[#5D87FF]" />
                        {shp.origin_city || 'Origin'} → {shp.destination_city || 'Destination'}
                      </div>
                      <span className="text-[10px] text-[#5A6A85] block">{shp.distance_km || 120} km corridor</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2A3547]">{shp.quantity} TONNES CO₂</div>
                      <span className="text-[10px] text-[#5A6A85] block uppercase">{shp.transport_mode || 'Cryogenic Tanker'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ShipmentStatusBadge status={shp.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/dashboard/shipments/${shp.shipment_number}`)}
                        className="bg-[#EEF2FF] border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white text-[11px] font-bold h-8 px-3"
                      >
                        <Eye className="size-3.5 mr-1" /> View Tracking
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShipmentsPage;
