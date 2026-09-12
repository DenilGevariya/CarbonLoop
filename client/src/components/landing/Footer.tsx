import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5EAEF] bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#5A6A85] font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/images/logo.png"
              alt="CarbonLoop Logo"
              className="size-8 rounded-lg object-contain bg-[#0E110F] p-1 border border-[#E5EAEF] shadow-xs shrink-0"
            />
            <span className="font-bold text-base text-[#2A3547] tracking-tight">
              CARBON<span className="text-[#5D87FF]">LOOP</span>
            </span>
          </Link>
          <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
            The premier B2B circular carbon infrastructure network connecting industrial CO₂ stack emitters directly with utilization off-takers.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F9F5] border border-[#13DEB9]/30 text-[#13DEB9] text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> ISO 14064 Verified
            </span>
          </div>
        </div>

        {/* Column 1: Platform */}
        <div>
          <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Platform Exchange</h4>
          <ul className="space-y-2 font-medium">
            <li><Link to="/marketplace" className="hover:text-[#5D87FF] transition-colors">Supply Marketplace</Link></li>
            <li><Link to="/requirements" className="hover:text-[#5D87FF] transition-colors">Demand Network</Link></li>
            <li><Link to="/how-it-works" className="hover:text-[#5D87FF] transition-colors">Matchmaking Engine</Link></li>
            <li><Link to="/impact" className="hover:text-[#5D87FF] transition-colors">Impact Analytics</Link></li>
          </ul>
        </div>

        {/* Column 2: Solutions */}
        <div>
          <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Industries & Logistics</h4>
          <ul className="space-y-2 font-medium">
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Cement & Lime Stack Capture</span></li>
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Petrochemical & Refineries</span></li>
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Concrete Mineralization</span></li>
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Cryogenic Tanker Fleet</span></li>
          </ul>
        </div>

        {/* Column 3: Compliance & Admin */}
        <div>
          <h4 className="font-bold text-[#2A3547] text-xs uppercase tracking-wider mb-3">Compliance & Governance</h4>
          <ul className="space-y-2 font-medium">
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">ISO 14064 Standard</span></li>
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">GC Chromatography Assays</span></li>
            <li><span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Audit Ledger Vault</span></li>
            <li><Link to="/dashboard" className="hover:text-[#5D87FF] transition-colors">Console Dashboard</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#E5EAEF] flex flex-col sm:flex-row items-center justify-between gap-4 font-medium text-xs">
        <span>© {new Date().getFullYear()} CarbonLoop Industrial Network Inc. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-[#5D87FF] transition-colors cursor-pointer">Security Protocol</span>
        </div>
      </div>
    </footer>
  );
};
