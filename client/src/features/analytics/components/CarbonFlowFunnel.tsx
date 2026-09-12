import React from 'react';
import type { CarbonFlowFunnel as CarbonFlowFunnelType } from '../api/analyticsApi';
import { Filter, ShieldCheck } from 'lucide-react';

interface Props {
  funnel: CarbonFlowFunnelType;
}

export const CarbonFlowFunnel: React.FC<Props> = ({ funnel }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 font-mono text-xs shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 border-b border-[#E2DDD5]/60 pb-4">
        <div>
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#173D32]" />
            <span>Carbon Throughput Conversion Funnel</span>
          </h3>
          <p className="text-[11px] text-[#55524D] mt-0.5">
            Physical progression from available supply to delivered productive reuse
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#173D32]/10 border border-[#173D32]/20 px-3 py-1.5 rounded">
          <ShieldCheck className="w-4 h-4 text-[#173D32]" />
          <span className="text-xs font-bold text-[#173D32]">
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
              className={`p-4 rounded-md border flex flex-col justify-between space-y-3 relative transition-all ${
                isLast
                  ? 'bg-[#173D32] text-white border-[#173D32] shadow-sm'
                  : isFirst
                  ? 'bg-[#F7F5EF] border-[#E2DDD5] text-[#171A18]'
                  : 'bg-[#FAF8F5] border-[#E2DDD5]/80 text-[#171A18]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#55524D] mb-1">
                  <span className={isLast ? 'text-[#A3E635]' : 'text-[#55524D]'}>STAGE 0{i + 1}</span>
                  <span>{stage.funnelSharePercent}% Share</span>
                </div>

                <p className={`font-bold text-xs ${isLast ? 'text-white' : 'text-[#171A18]'}`}>
                  {stage.label}
                </p>
              </div>

              <div>
                <p className={`text-xl font-bold font-mono ${isLast ? 'text-[#A3E635]' : 'text-[#173D32]'}`}>
                  {stage.quantityTonnes.toLocaleString()}
                </p>
                <span className={`text-[10px] ${isLast ? 'text-emerald-200' : 'text-[#55524D]'}`}>
                  TONNES CO₂
                </span>
              </div>

              {/* Conversion indicator */}
              <div className={`pt-2 border-t text-[10px] flex items-center justify-between ${isLast ? 'border-emerald-700/60 text-emerald-200' : 'border-[#E2DDD5]/60 text-[#55524D]'}`}>
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
