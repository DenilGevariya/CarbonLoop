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
    <div className="space-y-4 font-mono text-xs">
      {/* Primary Stock KPIs (Current State) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            CURRENT NETWORK STOCK (ACTIVE INVENTORY & DEMAND)
          </span>
          <span className="text-[10px] text-[#55524D] bg-[#E2DDD5]/40 px-2 py-0.5 rounded border border-[#E2DDD5]">
            Snapshot Real-time
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Supply Stock */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#55524D] mb-1">
              <span className="text-[11px] uppercase">Active Supply Stock</span>
              <Factory className="w-4 h-4 text-[#173D32]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#171A18]">{stock.activeSupplyTonnes.toLocaleString()}</span>
              <span className="text-xs text-[#55524D]">t CO₂</span>
            </div>
            <p className="text-[10px] text-[#55524D] mt-1">
              Across {stock.activeListingsCount} active listings ({stock.activeFacilitiesCount} facilities)
            </p>
          </div>

          {/* Active Demand Stock */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#55524D] mb-1">
              <span className="text-[11px] uppercase">Outstanding Demand Stock</span>
              <Layers className="w-4 h-4 text-[#173D32]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#171A18]">{stock.activeDemandTonnes.toLocaleString()}</span>
              <span className="text-xs text-[#55524D]">t CO₂</span>
            </div>
            <p className="text-[10px] text-[#55524D] mt-1">
              Across {stock.activeRequirementsCount} open requirements
            </p>
          </div>

          {/* Net Regional Balance */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#55524D] mb-1">
              <span className="text-[11px] uppercase">Net Regional Balance</span>
              <Scale className="w-4 h-4 text-[#173D32]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-2xl font-bold ${stock.netSupplyBalanceTonnes >= 0 ? 'text-[#173D32]' : 'text-rose-700'}`}>
                {stock.netSupplyBalanceTonnes >= 0 ? `+${stock.netSupplyBalanceTonnes.toLocaleString()}` : stock.netSupplyBalanceTonnes.toLocaleString()}
              </span>
              <span className="text-xs text-[#55524D]">t Surplus</span>
            </div>
            <p className="text-[10px] text-[#55524D] mt-1">
              {stock.netSupplyBalanceTonnes >= 0 ? 'Surplus supply available' : 'Net demand deficit'}
            </p>
          </div>

          {/* Active Logistics Movements */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#55524D] mb-1">
              <span className="text-[11px] uppercase">Active Movements</span>
              <Truck className="w-4 h-4 text-[#173D32]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-[#171A18]">{stock.activeShipmentsCount}</span>
              <span className="text-xs text-[#55524D]">Shipments</span>
            </div>
            <p className="text-[10px] text-[#55524D] mt-1">
              {stock.activeOrganizationsCount} participating organizations
            </p>
          </div>
        </div>
      </div>

      {/* Period Flow Summary Strip */}
      <div className="bg-[#F7F5EF] border border-[#E2DDD5] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#E2DDD5]/60 pb-2">
          <span className="text-[11px] font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#173D32]" />
            PERIOD THROUGHPUT FLOW (SELECTED TIMEFRAME)
          </span>
          <span className="text-[10px] text-[#55524D]">Flow metrics measure activity within period</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-[#55524D] uppercase">Listed Flow</span>
            <p className="text-lg font-bold text-[#171A18]">{flow.listedTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#55524D] uppercase">Contracted Orders</span>
            <p className="text-lg font-bold text-[#171A18]">{flow.orderedTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#55524D] uppercase">Delivered Volume</span>
            <p className="text-lg font-bold text-[#171A18]">{flow.deliveredTonnes.toLocaleString()} t</p>
          </div>
          <div>
            <span className="text-[10px] text-[#55524D] uppercase">CO₂ Reused</span>
            <p className="text-lg font-bold text-[#173D32]">{flow.reusedTonnes.toLocaleString()} t</p>
          </div>
        </div>
      </div>
    </div>
  );
};
