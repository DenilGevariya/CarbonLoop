import React from 'react';
import type { ShipmentItem } from '../api/shipmentApi';
import { ShipmentStatusBadge } from './ShipmentStatusBadge';
import { ArrowRight, MapPin, Calendar, Scale, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  shipment: ShipmentItem;
  onRefresh?: () => void;
}

export const ShipmentHeader: React.FC<Props> = ({ shipment }) => {
  const originCity = shipment.origin_city || shipment.origin_facility_name || 'Ahmedabad';
  const destCity = shipment.destination_city || shipment.destination_facility_name || shipment.destination_address || 'Vadodara';

  const etaDisplay = shipment.estimated_delivery_at
    ? format(new Date(shipment.estimated_delivery_at), 'dd MMM yyyy · HH:mm')
    : 'Pending Scheduling';

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 shadow-sm mb-6">
      {/* Top Bar: Status + Shipment Number + Tracking Reference */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E2DDD5]/60">
        <div className="flex items-center gap-3">
          <ShipmentStatusBadge status={shipment.status} size="lg" />
          <span className="font-mono text-xl font-bold text-[#171A18] tracking-tight">
            {shipment.shipment_number}
          </span>
          <span className="bg-[#E2DDD5]/50 text-[#55524D] font-mono text-xs px-2.5 py-1 rounded border border-[#E2DDD5]">
            REF: {shipment.tracking_reference}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#55524D]">
          <FileText className="w-4 h-4 text-[#173D32]" />
          <span>ORDER #{shipment.order_number || shipment.order_id?.substring(0, 8)}</span>
        </div>
      </div>

      {/* Main Grid Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
        {/* Origin -> Destination Route */}
        <div className="md:col-span-2">
          <p className="text-xs font-mono uppercase tracking-wider text-[#55524D] mb-1">Transport Route</p>
          <div className="flex items-center space-x-3 text-lg font-semibold text-[#171A18]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#173D32]" />
              {originCity}
            </span>
            <ArrowRight className="w-5 h-5 text-[#55524D]" />
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {destCity}
            </span>
          </div>
          <p className="text-xs text-[#55524D] mt-1 font-mono">
            Provider: <span className="font-semibold text-[#171A18]">{shipment.provider_name || 'CarbonRoute Express'}</span>
          </p>
        </div>

        {/* Payload Volume */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#55524D] mb-1">Payload Volume</p>
          <div className="flex items-baseline space-x-1.5">
            <Scale className="w-4 h-4 text-[#173D32]" />
            <span className="text-2xl font-bold font-mono text-[#171A18]">{shipment.quantity}</span>
            <span className="text-sm font-mono text-[#55524D]">TONNES CO₂</span>
          </div>
          <p className="text-xs text-[#55524D] mt-1 font-mono">
            Mode: <span className="uppercase text-[#171A18]">{shipment.transport_mode?.replace(/_/g, ' ')}</span>
          </p>
        </div>

        {/* Estimated / Actual Delivery */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#55524D] mb-1">
            {shipment.status === 'DELIVERED' || shipment.status === 'COMPLETED' ? 'Delivered At' : 'Estimated Arrival (ETA)'}
          </p>
          <div className="flex items-center space-x-2 text-sm font-mono font-semibold text-[#171A18]">
            <Calendar className="w-4 h-4 text-[#173D32]" />
            <span>{etaDisplay}</span>
          </div>
          <p className="text-xs text-[#55524D] mt-1 font-mono">
            Distance: <span className="font-semibold text-[#171A18]">{shipment.distance_km || 120} km</span> (Est. Geographic)
          </p>
        </div>
      </div>

      {/* Operational Exception Banner if status === 'EXCEPTION' */}
      {shipment.status === 'EXCEPTION' && (
        <div className="mt-5 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-900">
          <div className="flex items-start gap-2.5">
            <span className="p-1 bg-rose-100 rounded text-rose-700 font-bold">⚠️</span>
            <div>
              <p className="font-semibold text-sm font-mono uppercase tracking-wide">Operational Exception Reported</p>
              <p className="text-xs text-rose-800 mt-0.5">{shipment.exception_reason || 'Transportation delay reported'}</p>
              {shipment.exception_notes && (
                <p className="text-xs text-rose-700 mt-1 italic">"{shipment.exception_notes}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
