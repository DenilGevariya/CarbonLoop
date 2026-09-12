import React from 'react';
import type { RegionalBalanceRow } from '../api/analyticsApi';
import { MapPin } from 'lucide-react';

interface Props {
  regions: RegionalBalanceRow[];
}

export const RegionalBalanceTable: React.FC<Props> = ({ regions }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg overflow-hidden font-mono text-xs shadow-2xs">
      <div className="p-4 bg-[#F7F5EF] border-b border-[#E2DDD5] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#173D32]" />
          <span className="font-bold text-[#171A18] uppercase tracking-wider">Regional Carbon Balance Matrix</span>
        </div>
        <span className="text-[10px] text-[#55524D] bg-[#E2DDD5]/40 px-2 py-0.5 rounded">
          Supply vs Demand
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2DDD5] text-[#55524D] uppercase text-[10px] bg-[#FAF8F5]">
              <th className="py-3 px-4 font-semibold">Region / Corridor</th>
              <th className="py-3 px-4 font-semibold">Available Supply</th>
              <th className="py-3 px-4 font-semibold">Required Demand</th>
              <th className="py-3 px-4 font-semibold text-right">Net Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DDD5]/60">
            {regions.map((r) => {
              const isSurplus = r.netBalanceTonnes >= 0;
              return (
                <tr key={r.region} className="hover:bg-[#F7F5EF]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#171A18] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#173D32]" />
                    {r.region}
                  </td>
                  <td className="py-3 px-4 text-[#171A18] font-medium">
                    {r.supplyTonnes.toLocaleString()} t
                  </td>
                  <td className="py-3 px-4 text-[#55524D]">
                    {r.demandTonnes.toLocaleString()} t
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isSurplus
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isSurplus ? `+${r.netBalanceTonnes.toLocaleString()} t` : `${r.netBalanceTonnes.toLocaleString()} t`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
