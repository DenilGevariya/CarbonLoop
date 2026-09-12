import React from 'react';
import type { LogisticsAnalytics } from '../api/analyticsApi';
import { Truck, Leaf } from 'lucide-react';

interface Props {
  logistics: LogisticsAnalytics;
}

export const LogisticsPerformance: React.FC<Props> = ({ logistics }) => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#5D87FF]" />
            <span>Physical Logistics Telematics & Corridor Analytics</span>
          </h3>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">
            Transport efficiency, distance metrics, and indicative transport emissions
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[#0EAB8B] bg-[#13DEB9]/15 border border-[#13DEB9]/30 px-3 py-1 rounded-full">
          <Leaf className="w-4 h-4 text-[#13DEB9]" />
          <span className="font-bold">{logistics.estimatedTransportEmissionsKg.toLocaleString()} kg</span>
          <span className="text-[10px] opacity-80 font-normal">(Indicative CO₂e)</span>
        </div>
      </div>

      {/* KPI Sub-strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#F6F9FC] p-4 rounded-xl border border-[#E5EAEF]">
        <div>
          <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Active Movements</span>
          <p className="text-lg font-bold text-[#2A3547]">{logistics.activeShipmentsCount}</p>
        </div>
        <div>
          <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Total Distance Moved</span>
          <p className="text-lg font-bold text-[#2A3547]">{logistics.totalDistanceMovedKm.toLocaleString()} km</p>
        </div>
        <div>
          <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Avg Transit Distance</span>
          <p className="text-lg font-bold text-[#2A3547]">{logistics.averageTransitDistanceKm} km</p>
        </div>
        <div>
          <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Avg Freight Cost</span>
          <p className="text-lg font-bold text-[#5D87FF]">₹{logistics.averageTransportCostPerTon}/t</p>
        </div>
      </div>

      {/* Transport Mode Breakdown Cards */}
      <div>
        <h4 className="text-[11px] font-bold text-[#2A3547] uppercase tracking-wide mb-3">
          Transport Mode Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {logistics.transportModeBreakdown.map((item) => (
            <div key={item.mode} className="bg-[#F6F9FC] border border-[#E5EAEF] p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#2A3547] uppercase">{item.mode.replace(/_/g, ' ')}</span>
                <p className="text-[10px] text-[#5A6A85] mt-0.5">
                  {item.shipmentCount} Shipments | {item.quantityTonnes.toLocaleString()} Tonnes
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#5D87FF] block">₹{item.averageCost.toLocaleString()}</span>
                <span className="text-[10px] text-[#13DEB9] font-semibold">{item.estimatedEmissionsKg.toLocaleString()} kg CO₂e</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
