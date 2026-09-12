import React from 'react';
import type { NetworkOverviewKPIs } from '../api/analyticsApi';
import { Scale, Factory, Layers, Truck, TrendingUp } from 'lucide-react';

interface Props {
  kpis: NetworkOverviewKPIs;
}

export const KpiStrip: React.FC<Props> = ({ kpis }) => {
  const stock = kpis.stock;
  const flow = kpis.flow;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Primary Stock KPIs (Current State) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#13DEB9]" />
            CURRENT NETWORK STOCK (ACTIVE INVENTORY & DEMAND)
          </span>
          <span className="text-[10px] text-[#5D87FF] bg-[#ECF2FF] px-2.5 py-0.5 rounded-full border border-[#5D87FF]/20 font-semibold">
            Snapshot Real-time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Supply Stock */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#5A6A85] mb-1">
              <span className="text-xs font-semibold uppercase">Active Supply Stock</span>
              <Factory className="w-4 h-4 text-[#5D87FF]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#2A3547]">{stock.activeSupplyTonnes.toLocaleString()}</span>
              <span className="text-xs text-[#5A6A85]">t CO₂</span>
            </div>
            <p className="text-[10px] text-[#5A6A85] mt-1">
              Across {stock.activeListingsCount} active listings ({stock.activeFacilitiesCount} facilities)
            </p>
          </div>

          {/* Active Demand Stock */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#5A6A85] mb-1">
              <span className="text-xs font-semibold uppercase">Outstanding Demand Stock</span>
              <Layers className="w-4 h-4 text-[#5D87FF]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#2A3547]">{stock.activeDemandTonnes.toLocaleString()}</span>
              <span className="text-xs text-[#5A6A85]">t CO₂</span>
            </div>
            <p className="text-[10px] text-[#5A6A85] mt-1">
              Across {stock.activeRequirementsCount} open requirements
            </p>
          </div>

          {/* Net Regional Balance */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#5A6A85] mb-1">
              <span className="text-xs font-semibold uppercase">Net Regional Balance</span>
              <Scale className="w-4 h-4 text-[#5D87FF]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-2xl font-bold ${stock.netSupplyBalanceTonnes >= 0 ? 'text-[#13DEB9]' : 'text-rose-500'}`}>
                {stock.netSupplyBalanceTonnes >= 0 ? `+${stock.netSupplyBalanceTonnes.toLocaleString()}` : stock.netSupplyBalanceTonnes.toLocaleString()}
              </span>
              <span className="text-xs text-[#5A6A85]">t Surplus</span>
            </div>
            <p className="text-[10px] text-[#5A6A85] mt-1">
              {stock.netSupplyBalanceTonnes >= 0 ? 'Surplus supply available' : 'Net demand deficit'}
            </p>
          </div>

          {/* Active Logistics Movements */}
          <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-[#5A6A85] mb-1">
              <span className="text-xs font-semibold uppercase">Active Movements</span>
              <Truck className="w-4 h-4 text-[#5D87FF]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#2A3547]">{stock.activeShipmentsCount}</span>
              <span className="text-xs text-[#5A6A85]">Shipments</span>
            </div>
            <p className="text-[10px] text-[#5A6A85] mt-1">
              {stock.activeOrganizationsCount} participating organizations
            </p>
          </div>
        </div>
      </div>

      {/* Period Flow Summary Strip */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#E5EAEF] pb-2">
          <span className="text-[11px] font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#5D87FF]" />
            PERIOD THROUGHPUT FLOW (SELECTED TIMEFRAME)
          </span>
          <span className="text-[10px] text-[#5A6A85]">Flow metrics measure activity within period</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Listed Flow</span>
            <p className="text-lg font-bold text-[#2A3547]">{flow.listedTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Contracted Orders</span>
            <p className="text-lg font-bold text-[#2A3547]">{flow.orderedTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">Delivered Volume</span>
            <p className="text-lg font-bold text-[#2A3547]">{flow.deliveredTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#5A6A85] uppercase font-semibold">CO₂ Reused</span>
            <p className="text-lg font-bold text-[#5D87FF]">{flow.reusedTonnes.toLocaleString()} t</p>
          </div>
        </div>
      </div>
    </div>
  );
};
