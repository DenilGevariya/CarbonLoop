import React from 'react';
import type { MarketplaceStatsDTO } from '../types/listing';
import { Factory, ShieldCheck, MapPin, Scale } from 'lucide-react';

interface Props {
  stats?: MarketplaceStatsDTO;
  isLoading?: boolean;
}

export const MarketplaceHeader: React.FC<Props> = ({ stats, isLoading }) => {
  return (
    <div className="border-b border-[#E2DDD5] bg-[#FAF8F5] pb-8 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173D32]/10 border border-[#173D32]/20 text-[#173D32] text-xs font-mono uppercase tracking-wider font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#173D32] animate-pulse" />
              CO₂ Industrial Supply Exchange
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#171A18] tracking-tight font-medium">
              CO₂ Marketplace
            </h1>
            <p className="mt-2 text-stone-600 text-sm max-w-2xl leading-relaxed">
              Available captured carbon streams direct from certified industrial facilities across the CarbonLoop network.
            </p>
          </div>

          {/* Aggregate Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F7F5EF] p-4 rounded-xl border border-[#E2DDD5] shadow-xs">
            <div className="flex items-center gap-3 pr-2 border-r border-[#E2DDD5]">
              <div className="p-2 rounded-lg bg-white border border-[#E2DDD5] text-[#173D32]">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Active Supply</p>
                <p className="text-lg font-mono font-bold text-[#171A18] tabular-nums">
                  {isLoading ? '...' : (stats?.activeListings ?? 0)}
                  <span className="text-xs font-normal text-stone-500 ml-1">streams</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2 sm:border-r border-[#E2DDD5]">
              <div className="p-2 rounded-lg bg-white border border-[#E2DDD5] text-[#173D32]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Available Volume</p>
                <p className="text-lg font-mono font-bold text-[#171A18] tabular-nums">
                  {isLoading ? '...' : (stats?.totalAvailableQuantity?.toLocaleString() ?? 0)}
                  <span className="text-xs font-normal text-stone-500 ml-1">tonnes</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2 border-r border-[#E2DDD5]">
              <div className="p-2 rounded-lg bg-white border border-[#E2DDD5] text-[#173D32]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Avg Purity</p>
                <p className="text-lg font-mono font-bold text-[#171A18] tabular-nums">
                  {isLoading ? '...' : `${stats?.averagePurity ?? 0}%`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-[#E2DDD5] text-[#173D32]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Active Regions</p>
                <p className="text-lg font-mono font-bold text-[#171A18] tabular-nums">
                  {isLoading ? '...' : (stats?.activeRegions ?? 0)}
                  <span className="text-xs font-normal text-stone-500 ml-1">states</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
