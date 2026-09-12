import React from 'react';
import type { RegionalBalanceRow } from '../api/analyticsApi';
import { MapPin } from 'lucide-react';

interface Props {
  regions: RegionalBalanceRow[];
}

export const RegionalBalanceTable: React.FC<Props> = ({ regions }) => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl overflow-hidden text-xs shadow-xs">
      <div className="p-4 bg-[#F6F9FC] border-b border-[#E5EAEF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#5D87FF]" />
          <span className="font-bold text-[#2A3547] uppercase tracking-wider">Regional Carbon Balance Matrix</span>
        </div>
        <span className="text-[10px] text-[#5D87FF] bg-[#ECF2FF] px-2.5 py-0.5 rounded-full border border-[#5D87FF]/20 font-semibold">
          Supply vs Demand
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5EAEF] text-[#5A6A85] uppercase text-[10px] bg-[#F6F9FC] font-semibold">
              <th className="py-3 px-4">Region / Corridor</th>
              <th className="py-3 px-4">Available Supply</th>
              <th className="py-3 px-4">Required Demand</th>
              <th className="py-3 px-4 text-right">Net Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAEF]">
            {regions.map((r) => {
              const isSurplus = r.netBalanceTonnes >= 0;
              return (
                <tr key={r.region} className="hover:bg-[#ECF2FF]/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#2A3547] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5D87FF]" />
                    {r.region}
                  </td>
                  <td className="py-3 px-4 text-[#2A3547] font-medium">
                    {r.supplyTonnes.toLocaleString()} t
                  </td>
                  <td className="py-3 px-4 text-[#5A6A85]">
                    {r.demandTonnes.toLocaleString()} t
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isSurplus
                          ? 'bg-[#13DEB9]/15 text-[#0EAB8B] border border-[#13DEB9]/30'
                          : 'bg-[#FA896B]/15 text-[#FA896B] border border-[#FA896B]/30'
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
