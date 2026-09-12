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
      <div className="bg-[#F6F9FC] border-b border-[#E5EAEF] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-[#E5EAEF] rounded-xl space-y-2">
              <Skeleton className="h-4 w-20 bg-slate-100" />
              <Skeleton className="h-8 w-28 bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F9FC] border-b border-[#E5EAEF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[#5D87FF] uppercase tracking-wider bg-[#ECF2FF] border border-[#5D87FF]/20 px-3 py-1 rounded-full inline-block mb-2">
              CO₂ Demand Network
            </span>
            <h1 className="font-bold text-2xl sm:text-3xl text-[#2A3547] tracking-tight">
              Industrial CO₂ Requirements
            </h1>
            <p className="text-xs text-[#5A6A85] max-w-2xl mt-1 leading-relaxed">
              Browse active off-take requirements from verified carbon utilizers across synthetic fuels, concrete mineralization, algae biomanufacturing, and chemical synthesis.
            </p>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wider block">
              Active Requirements
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <Factory className="w-4 h-4 text-[#5D87FF]" />
              <span className="text-2xl font-bold text-[#2A3547]">
                {stats.activeRequirements}
              </span>
              <span className="text-xs font-medium text-[#5A6A85]">active buyer needs</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wider block">
              Requested Volume
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <Zap className="w-4 h-4 text-[#5D87FF]" />
              <span className="text-2xl font-bold text-[#5D87FF]">
                {stats.totalRequestedQuantity.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-[#5A6A85]">tonnes</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wider block">
              Average Min Purity
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <ShieldCheck className="w-4 h-4 text-[#13DEB9]" />
              <span className="text-2xl font-bold text-[#2A3547]">
                {stats.averageMinimumPurity}%
              </span>
              <span className="text-xs font-medium text-[#5A6A85]">spec threshold</span>
            </div>
          </div>

          <div className="bg-white border border-[#E5EAEF] p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wider block">
              Active Regions
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <MapPin className="w-4 h-4 text-[#49BEFF]" />
              <span className="text-2xl font-bold text-[#2A3547]">
                {stats.activeRegionsCount}
              </span>
              <span className="text-xs font-medium text-[#5A6A85]">states/hubs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
