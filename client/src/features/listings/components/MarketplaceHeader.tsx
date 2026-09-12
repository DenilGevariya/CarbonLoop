import React from 'react';
import type { MarketplaceStatsDTO } from '../types/listing';
import { Factory, ShieldCheck, MapPin, Scale } from 'lucide-react';

interface Props {
  stats?: MarketplaceStatsDTO;
  isLoading?: boolean;
}

export const MarketplaceHeader: React.FC<Props> = ({ stats, isLoading }) => {
  return (
    <div className="border-b border-[#E5EAEF] bg-white pb-8 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs uppercase tracking-wider font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#5D87FF] animate-pulse" />
              CO₂ Industrial Supply Exchange
            </div>
            <h1 className="text-3xl sm:text-4xl text-[#2A3547] font-bold tracking-tight">
              CO₂ Marketplace
            </h1>
            <p className="mt-2 text-[#5A6A85] text-sm max-w-2xl font-medium leading-relaxed">
              Available captured carbon streams direct from certified industrial facilities across the CarbonLoop network.
            </p>
          </div>

          {/* Aggregate Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F6F9FC] p-4 rounded-xl border border-[#E5EAEF] shadow-xs">
            <div className="flex items-center gap-3 pr-2 border-r border-[#E5EAEF]">
              <div className="p-2.5 rounded-lg bg-white border border-[#E5EAEF] text-[#5D87FF]">
                <Factory className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#5A6A85] uppercase tracking-wider">Active Supply</p>
                <p className="text-lg font-bold text-[#2A3547] font-mono-tnum">
                  {isLoading ? '...' : (stats?.activeListings ?? 0)}
                  <span className="text-xs font-medium text-[#5A6A85] ml-1">streams</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2 sm:border-r border-[#E5EAEF]">
              <div className="p-2.5 rounded-lg bg-white border border-[#E5EAEF] text-[#5D87FF]">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#5A6A85] uppercase tracking-wider">Available Volume</p>
                <p className="text-lg font-bold text-[#2A3547] font-mono-tnum">
                  {isLoading ? '...' : (stats?.totalAvailableQuantity?.toLocaleString() ?? 0)}
                  <span className="text-xs font-medium text-[#5A6A85] ml-1">tonnes</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-2 border-r border-[#E5EAEF]">
              <div className="p-2.5 rounded-lg bg-white border border-[#E5EAEF] text-[#5D87FF]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#5A6A85] uppercase tracking-wider">Avg Purity</p>
                <p className="text-lg font-bold text-[#2A3547] font-mono-tnum">
                  {isLoading ? '...' : `${stats?.averagePurity ?? 0}%`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-white border border-[#E5EAEF] text-[#5D87FF]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#5A6A85] uppercase tracking-wider">Active Regions</p>
                <p className="text-lg font-bold text-[#2A3547] font-mono-tnum">
                  {isLoading ? '...' : (stats?.activeRegions ?? 0)}
                  <span className="text-xs font-medium text-[#5A6A85] ml-1">states</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
