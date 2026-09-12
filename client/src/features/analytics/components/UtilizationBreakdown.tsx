import React from 'react';
import type { DemandAnalytics } from '../api/analyticsApi';
import { Layers } from 'lucide-react';

interface Props {
  demand: DemandAnalytics;
}

export const UtilizationBreakdown: React.FC<Props> = ({ demand }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 font-mono text-xs shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E2DDD5]/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#173D32]" />
            <span>CO₂ Utilization Pathway Demand</span>
          </h3>
          <p className="text-[11px] text-[#55524D] mt-0.5">
            Requested volumes grouped by industrial off-take application
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-[#171A18]">{demand.totalRequestedTonnes.toLocaleString()} t</span>
          <span className="text-[10px] text-[#55524D] block">Total Demand</span>
        </div>
      </div>

      <div className="space-y-4">
        {demand.utilizationBreakdown.map((item) => (
          <div key={item.pathway} className="bg-[#F7F5EF] border border-[#E2DDD5]/80 p-3.5 rounded">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#171A18] text-xs uppercase">{item.pathway}</span>
              <span className="font-bold text-[#173D32] text-xs">
                {item.requestedTonnes.toLocaleString()} tonnes ({item.percentage}%)
              </span>
            </div>

            <div className="w-full bg-[#E2DDD5]/40 h-2.5 rounded-xs overflow-hidden border border-[#E2DDD5]/60">
              <div
                className="h-full bg-[#173D32] transition-all duration-300"
                style={{ width: `${Math.max(item.percentage, 3)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#55524D] mt-2">
              <span>{item.requirementsCount} Active Requirements</span>
              <span>Off-take Priority Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
