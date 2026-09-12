import React from 'react';
import type { DemandAnalytics } from '../api/analyticsApi';
import { Layers } from 'lucide-react';

interface Props {
  demand: DemandAnalytics;
}

export const UtilizationBreakdown: React.FC<Props> = ({ demand }) => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E5EAEF] pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5D87FF]" />
            <span>CO₂ Utilization Pathway Demand</span>
          </h3>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">
            Requested volumes grouped by industrial off-take application
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-[#5D87FF]">{demand.totalRequestedTonnes.toLocaleString()} t</span>
          <span className="text-[10px] text-[#5A6A85] block font-semibold">Total Demand</span>
        </div>
      </div>

      <div className="space-y-4">
        {demand.utilizationBreakdown.map((item) => (
          <div key={item.pathway} className="bg-[#F6F9FC] border border-[#E5EAEF] p-3.5 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[#2A3547] text-xs uppercase">{item.pathway}</span>
              <span className="font-bold text-[#5D87FF] text-xs">
                {item.requestedTonnes.toLocaleString()} tonnes ({item.percentage}%)
              </span>
            </div>

            <div className="w-full bg-[#E5EAEF] h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5D87FF] transition-all duration-300"
                style={{ width: `${Math.max(item.percentage, 3)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#5A6A85] mt-2">
              <span>{item.requirementsCount} Active Requirements</span>
              <span>Off-take Priority Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
