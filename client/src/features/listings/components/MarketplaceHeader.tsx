import React from 'react';
import type { MarketplaceStatsDTO } from '../types/listing';
import { Factory, ShieldCheck, MapPin, Scale } from 'lucide-react';

interface Props {
  stats?: MarketplaceStatsDTO;
  isLoading?: boolean;
}

export const MarketplaceHeader: React.FC<Props> = ({ stats, isLoading }) => {
  return (
    <div className="border-b border-[#E5EAEF] bg-white pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title & Description Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs uppercase tracking-wider font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#5D87FF] animate-pulse" />
            CO₂ Industrial Supply Exchange
          </div>
          <h1 className="text-3xl sm:text-4xl text-[#2A3547] font-bold tracking-tight">
            CO₂ Supply Marketplace
          </h1>
          <p className="text-[#5A6A85] text-sm font-medium leading-relaxed">
            Browse verified captured carbon streams direct from certified industrial facilities across regional manufacturing corridors.
          </p>
        </div>

        {/* Aggregate Metrics Grid (Full-width 4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-white p-4.5 rounded-xl border border-[#E5EAEF] shadow-xs flex items-center gap-4 hover:border-[#5D87FF]/40 transition-colors">
            <div className="p-3 rounded-lg bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] shrink-0">
              <Factory className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#5A6A85] uppercase tracking-wider">Active Supply</p>
              <p className="text-2xl font-bold text-[#2A3547] flex items-baseline gap-1 mt-0.5">
                {isLoading ? '...' : (stats?.activeListings ?? 0)}
                <span className="text-xs font-semibold text-[#5A6A85]">streams</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-[#E5EAEF] shadow-xs flex items-center gap-4 hover:border-[#5D87FF]/40 transition-colors">
            <div className="p-3 rounded-lg bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#5A6A85] uppercase tracking-wider">Available Volume</p>
              <p className="text-2xl font-bold text-[#2A3547] flex items-baseline gap-1 mt-0.5">
                {isLoading ? '...' : (stats?.totalAvailableQuantity?.toLocaleString() ?? 0)}
                <span className="text-xs font-semibold text-[#5A6A85]">tonnes</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-[#E5EAEF] shadow-xs flex items-center gap-4 hover:border-[#13DEB9]/40 transition-colors">
            <div className="p-3 rounded-lg bg-[#E8F9F5] border border-[#13DEB9]/20 text-[#13DEB9] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#5A6A85] uppercase tracking-wider">Average Purity</p>
              <p className="text-2xl font-bold text-[#2A3547] flex items-baseline gap-1 mt-0.5">
                {isLoading ? '...' : `${stats?.averagePurity ?? 0}%`}
                <span className="text-xs font-semibold text-[#13DEB9]">spec</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-xl border border-[#E5EAEF] shadow-xs flex items-center gap-4 hover:border-[#5D87FF]/40 transition-colors">
            <div className="p-3 rounded-lg bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#5A6A85] uppercase tracking-wider">Active Regions</p>
              <p className="text-2xl font-bold text-[#2A3547] flex items-baseline gap-1 mt-0.5">
                {isLoading ? '...' : (stats?.activeRegions ?? 0)}
                <span className="text-xs font-semibold text-[#5A6A85]">states</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
