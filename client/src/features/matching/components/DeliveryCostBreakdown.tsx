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
    <div className="p-4.5 rounded-xl bg-white border border-[#E5EAEF] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#2A3547] uppercase tracking-wider">
          <Truck className="size-4 text-[#5D87FF]" /> Commercial Freight & Delivered Cost Estimate
        </div>
        <span className="text-[10px] text-[#5D87FF] bg-[#ECF2FF] px-2.5 py-0.5 rounded-full border border-[#5D87FF]/20 font-semibold">
          Est. Distance: {distKm} km
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E5EAEF] space-y-1">
          <span className="text-[#5A6A85] text-[10px] uppercase font-semibold block">SOURCE UNIT PRICE</span>
          <span className="text-[#2A3547] font-extrabold text-sm">₹{sourcePrice.toLocaleString()}/t</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E5EAEF] space-y-1">
          <span className="text-[#5A6A85] text-[10px] uppercase font-semibold block">EST. FREIGHT FEE</span>
          <span className="text-[#5D87FF] font-extrabold text-sm">
            +₹{freightPerTon.toLocaleString()}/t
          </span>
          <span className="text-[10px] text-[#5A6A85] block">
            (₹{transportTotal.toLocaleString()} total batch transport)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/30 space-y-1">
          <span className="text-[#5D87FF] text-[10px] font-bold uppercase block">INDICATIVE DELIVERED COST</span>
          <span className="text-[#2A3547] font-extrabold text-base">₹{deliveredCostPerTon.toLocaleString()}/t</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-[#5A6A85]">
        <Info className="size-3.5 text-[#5D87FF] shrink-0" />
        <span>
          Indicative delivered cost estimate based on regional cryogenic freight rates. Final freight terms confirmed during logistics planning.
        </span>
      </div>
    </div>
  );
};
