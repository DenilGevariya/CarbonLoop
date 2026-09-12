import React from 'react';
import type { CarbonFlowFunnel as CarbonFlowFunnelType } from '../api/analyticsApi';
import { Filter, ShieldCheck } from 'lucide-react';

interface Props {
  funnel: CarbonFlowFunnelType;
}

export const CarbonFlowFunnel: React.FC<Props> = ({ funnel }) => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-[#E5EAEF] pb-4">
        <div>
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#5D87FF]" />
            <span>Carbon Throughput Conversion Funnel</span>
          </h3>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">
            Physical progression from available supply to delivered productive reuse
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#ECF2FF] border border-[#5D87FF]/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#5D87FF]" />
          <span className="text-xs font-bold text-[#5D87FF]">
            Overall Efficiency: {funnel.overallFunnelEfficiencyPercent}%
          </span>
        </div>
      </div>

      {/* Funnel Stage Cards Flow */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
        {funnel.stages.map((stage, i) => {
          const isLast = i === funnel.stages.length - 1;
          const isFirst = i === 0;

          return (
            <div
              key={stage.stage}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 relative transition-all ${
                isLast
                  ? 'bg-[#5D87FF] text-white border-[#5D87FF] shadow-xs'
                  : isFirst
                  ? 'bg-[#F6F9FC] border-[#E5EAEF] text-[#2A3547]'
                  : 'bg-white border-[#E5EAEF] text-[#2A3547]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#5A6A85] mb-1">
                  <span className={isLast ? 'text-[#13DEB9]' : 'text-[#5A6A85]'}>STAGE 0{i + 1}</span>
                  <span className={isLast ? 'text-white/80' : ''}>{stage.funnelSharePercent}% Share</span>
                </div>

                <p className={`font-bold text-xs ${isLast ? 'text-white' : 'text-[#2A3547]'}`}>
                  {stage.label}
                </p>
              </div>

              <div>
                <p className={`text-xl font-bold ${isLast ? 'text-white' : 'text-[#5D87FF]'}`}>
                  {stage.quantityTonnes.toLocaleString()}
                </p>
                <span className={`text-[10px] ${isLast ? 'text-white/70' : 'text-[#5A6A85]'}`}>
                  TONNES CO₂
                </span>
              </div>

              {/* Conversion indicator */}
              <div className={`pt-2 border-t text-[10px] flex items-center justify-between ${isLast ? 'border-white/20 text-white/80' : 'border-[#E5EAEF] text-[#5A6A85]'}`}>
                <span>Conversion:</span>
                <span className="font-bold">{stage.conversionPercent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
