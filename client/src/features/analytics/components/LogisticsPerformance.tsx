import React from 'react';
import type { LogisticsAnalytics } from '../api/analyticsApi';
import { Truck, Leaf } from 'lucide-react';

interface Props {
  logistics: LogisticsAnalytics;
}

export const LogisticsPerformance: React.FC<Props> = ({ logistics }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 font-mono text-xs shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2DDD5]/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#173D32]" />
            <span>Physical Logistics Telematics & Corridor Analytics</span>
          </h3>
          <p className="text-[11px] text-[#55524D] mt-0.5">
            Transport efficiency, distance metrics, and indicative transport emissions
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{logistics.estimatedTransportEmissionsKg.toLocaleString()} kg</span>
          <span className="text-[10px] text-emerald-700 font-normal">(Indicative CO₂e)</span>
        </div>
      </div>

      {/* KPI Sub-strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#F7F5EF] p-4 rounded border border-[#E2DDD5]/80">
        <div>
          <span className="text-[10px] text-[#55524D] uppercase">Active Movements</span>
          <p className="text-lg font-bold text-[#171A18]">{logistics.activeShipmentsCount}</p>
        </div>
        <div>
          <span className="text-[10px] text-[#55524D] uppercase">Total Distance Moved</span>
          <p className="text-lg font-bold text-[#171A18]">{logistics.totalDistanceMovedKm.toLocaleString()} km</p>
        </div>
        <div>
          <span className="text-[10px] text-[#55524D] uppercase">Avg Transit Distance</span>
          <p className="text-lg font-bold text-[#171A18]">{logistics.averageTransitDistanceKm} km</p>
        </div>
        <div>
          <span className="text-[10px] text-[#55524D] uppercase">Avg Freight Cost</span>
          <p className="text-lg font-bold text-[#173D32]">₹{logistics.averageTransportCostPerTon}/t</p>
        </div>
      </div>

      {/* Transport Mode Breakdown Cards */}
      <div>
        <h4 className="text-[11px] font-bold text-[#171A18] uppercase tracking-wide mb-3">
          Transport Mode Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {logistics.transportModeBreakdown.map((item) => (
            <div key={item.mode} className="bg-[#FAF8F5] border border-[#E2DDD5] p-3.5 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171A18] uppercase">{item.mode.replace(/_/g, ' ')}</span>
                <p className="text-[10px] text-[#55524D] mt-0.5">
                  {item.shipmentCount} Shipments | {item.quantityTonnes.toLocaleString()} Tonnes
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#173D32] block">₹{item.averageCost.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{item.estimatedEmissionsKg.toLocaleString()} kg CO₂e</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
