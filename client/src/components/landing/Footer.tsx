import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#171A18] border-t border-[#2B302C] pt-16 pb-12 px-4 md:px-8 text-sm text-[#9BA39E]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#2B302C]">
        
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 bg-[#173D32] border border-[#3C6E5C] text-[#FAF8F5] flex items-center justify-center font-mono font-bold text-sm">
              C⟳
            </div>
            <span className="text-xl font-black text-[#FAF8F5] tracking-tighter uppercase font-mono">
              CARBON<span className="text-[#A3B899] font-light">LOOP</span>
            </span>
          </Link>

          <p className="text-xs text-[#9BA39E] font-serif leading-relaxed max-w-sm">
            CarbonLoop is an industrial CO₂ commodity exchange and logistics dispatch engine connecting stack emitters directly with utilization off-takers.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <span className="text-[11px] font-mono text-[#A3B899] uppercase tracking-widest flex items-center gap-1.5 bg-white/5 px-2.5 py-1 border border-white/10">
              <ShieldCheck className="size-3.5" /> ISO 14064 Compliance Ready
            </span>
          </div>
        </div>

        {/* Column 1: Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-mono text-[#FAF8F5] font-bold uppercase tracking-widest">Platform Exchange</h4>
          <ul className="space-y-2 text-xs font-mono">
            <li><Link to="/marketplace" className="hover:text-white transition-colors">Supply Directory</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">Matchmaking Engine</Link></li>
            <li><Link to="/impact" className="hover:text-white transition-colors">Logistics Telematics</Link></li>
            <li><Link to="/impact" className="hover:text-white transition-colors">Impact Analytics</Link></li>
          </ul>
        </div>

        {/* Column 2: Solutions */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-mono text-[#FAF8F5] font-bold uppercase tracking-widest">Industries</h4>
          <ul className="space-y-2 text-xs font-mono">
            <li><a href="#ecosystem" className="hover:text-white transition-colors">Cement & Lime Stack</a></li>
            <li><a href="#ecosystem" className="hover:text-white transition-colors">Steel & Power Hubs</a></li>
            <li><a href="#ecosystem" className="hover:text-white transition-colors">Concrete Mineralization</a></li>
            <li><a href="#ecosystem" className="hover:text-white transition-colors">Synthetic E-Fuels</a></li>
          </ul>
        </div>

        {/* Column 3: Regional Hubs */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-mono text-[#FAF8F5] font-bold uppercase tracking-widest">Regional Hubs</h4>
          <ul className="space-y-2 text-xs font-mono text-[#9BA39E]">
            <li>Ahmedabad Industrial Zone</li>
            <li>Hazira Coastal Corridor</li>
            <li>Vadodara Petrochemical Hub</li>
            <li>Dahej Refinery Complex</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6E7772] gap-4">
        <span>© 2026 CARBONLOOP TECHNOLOGIES INC. ALL RIGHTS RESERVED.</span>
        <span>CAPTURE. MATCH. REUSE.</span>
      </div>
    </footer>
  );
};
