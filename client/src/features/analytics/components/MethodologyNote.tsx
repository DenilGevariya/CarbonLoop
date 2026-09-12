import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const MethodologyNote: React.FC = () => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs space-y-3 font-sans">
      <div className="flex items-center gap-2 border-b border-[#E5EAEF] pb-3">
        <ShieldCheck className="w-5 h-5 text-[#5D87FF]" />
        <div>
          <h4 className="font-bold text-[#2A3547] uppercase tracking-wider text-xs">
            Carbon Accounting & Data Integrity Methodology
          </h4>
          <span className="text-[10px] text-[#5A6A85]">Protocol Version 1.0.0-PROD</span>
        </div>
      </div>

      <p className="text-xs text-[#5A6A85] leading-relaxed">
        CarbonLoop operational impact metrics are derived strictly from platform transaction records, certified purity testing snapshots, and physical custody transfer logs. They represent verified physical CO₂ throughput processed through completed marketplace transactions.
      </p>

      <div className="p-3.5 bg-[#F6F9FC] border border-[#E5EAEF] rounded-xl text-[11px] text-[#2A3547] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[#5D87FF]">
          <Info className="w-3.5 h-3.5" />
          <span>Non-Greenwashing Transparency Standard</span>
        </div>
        <p className="text-[#5A6A85] text-[10px] leading-normal">
          Metrics displayed as "CO₂ Reused" reflect confirmed deliveries to utilization facilities. They must not be interpreted as certified GHG protocol scope offsets unless accompanied by independent carbon credit verification audit documentation. Transport emissions are calculated using indicative development-stage factors.
        </p>
      </div>
    </div>
  );
};
