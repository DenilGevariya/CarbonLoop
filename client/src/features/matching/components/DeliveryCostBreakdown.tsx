import React from 'react';
import type { MatchRecord } from '../types/matching.types';
import { Truck, Info } from 'lucide-react';

interface DeliveryCostBreakdownProps {
  match: MatchRecord;
}

export const DeliveryCostBreakdown: React.FC<DeliveryCostBreakdownProps> = ({ match }) => {
  const listing = match.listing;
  const sourcePrice = listing ? listing.price_per_ton : 4800;
  const distKm = match.estimated_distance_km;
  const transportTotal = match.estimated_transport_cost;
  const deliveredCostPerTon = match.estimated_delivered_cost;
  const freightPerTon = Math.round((deliveredCostPerTon - sourcePrice) * 100) / 100;

  return (
    <div className="p-4.5 rounded-2xl bg-white border border-[#E2DDD5] shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171A18] uppercase tracking-wider">
          <Truck className="size-4 text-[#173D32]" /> Commercial Freight & Delivered Cost Estimate
        </div>
        <span className="text-[10px] text-stone-500 font-mono bg-[#F7F5EF] px-2.5 py-0.5 rounded border border-[#E2DDD5] font-semibold">
          Est. Distance: {distKm} km
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#E2DDD5] space-y-1">
          <span className="text-stone-500 text-[10px] uppercase font-mono font-semibold block">SOURCE UNIT PRICE</span>
          <span className="text-[#171A18] font-extrabold text-sm">₹{sourcePrice.toLocaleString()}/t</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#E2DDD5] space-y-1">
          <span className="text-stone-500 text-[10px] uppercase font-mono font-semibold block">EST. FREIGHT FEE</span>
          <span className="text-[#173D32] font-extrabold text-sm">
            +₹{freightPerTon.toLocaleString()}/t
          </span>
          <span className="text-[10px] text-stone-500 block font-sans">
            (₹{transportTotal.toLocaleString()} total batch transport)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#173D32]/10 border border-[#173D32]/30 space-y-1">
          <span className="text-[#173D32] text-[10px] font-bold uppercase font-mono block">INDICATIVE DELIVERED COST</span>
          <span className="text-[#171A18] font-black text-base">₹{deliveredCostPerTon.toLocaleString()}/t</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-sans">
        <Info className="size-3.5 text-[#173D32] shrink-0" />
        <span>
          Indicative delivered cost estimate based on regional cryogenic freight rates. Final freight terms confirmed during logistics planning.
        </span>
      </div>
    </div>
  );
};
