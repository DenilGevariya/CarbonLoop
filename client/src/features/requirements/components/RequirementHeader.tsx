import React from 'react';
import type { DemandStats } from '../types/requirement';
import { Factory, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RequirementHeaderProps {
  stats?: DemandStats;
  isLoading?: boolean;
}

export const RequirementHeader: React.FC<RequirementHeaderProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="bg-[#FAF8F5] border-b border-[#E2DDD5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-[#E2DDD5] space-y-2">
              <Skeleton className="h-4 w-20 bg-stone-200" />
              <Skeleton className="h-8 w-28 bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] border-b border-[#E2DDD5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-widest bg-[#EBE7DF] px-2 py-0.5 border border-[#DCD6C9] inline-block mb-2">
              CO₂ Demand Network
            </span>
            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#171A18] tracking-tight">
              Industrial CO₂ Requirements
            </h1>
            <p className="font-sans text-xs text-stone-600 max-w-2xl mt-1 leading-relaxed">
              Browse active off-take requirements from verified carbon utilizers across synthetic fuels, concrete mineralization, algae biomanufacturing, and chemical synthesis.
            </p>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Active Requirements
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <Factory className="w-4 h-4 text-[#173D32]" />
              <span className="text-2xl font-bold font-sans text-[#171A18]">
                {stats.activeRequirements}
              </span>
              <span className="text-[10px] text-stone-500">active buyer needs</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Requested Volume
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <Zap className="w-4 h-4 text-[#173D32]" />
              <span className="text-2xl font-bold font-sans text-[#173D32]">
                {stats.totalRequestedQuantity.toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-500">tonnes</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Average Min Purity
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <ShieldCheck className="w-4 h-4 text-[#173D32]" />
              <span className="text-2xl font-bold font-sans text-[#171A18]">
                {stats.averageMinimumPurity}%
              </span>
              <span className="text-[10px] text-stone-500">spec threshold</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD5] p-4 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">
              Active Regions
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <MapPin className="w-4 h-4 text-[#173D32]" />
              <span className="text-2xl font-bold font-sans text-[#171A18]">
                {stats.activeRegionsCount}
              </span>
              <span className="text-[10px] text-stone-500">states/hubs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
