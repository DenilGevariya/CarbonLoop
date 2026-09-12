import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#2A3547] flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#5D87FF] selection:text-white">
      
      {/* Brand Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-[#E5EAEF] mb-6 sm:mb-8">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo.png"
            alt="CarbonLoop Logo"
            className="size-9 object-contain bg-[#0E110F] p-1 rounded-xl border border-[#5D87FF] shadow-xs group-hover:border-[#4570EA] transition-all"
          />
          <span className="text-xl font-bold text-[#2A3547] tracking-tight">
            CARBON<span className="text-[#5D87FF]">LOOP</span>
          </span>
        </Link>

        <span className="text-xs font-semibold text-[#5A6A85] uppercase tracking-wider hidden sm:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E5EAEF]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#13DEB9]" /> Enterprise CO₂ Exchange Protocol
        </span>
      </header>

      {/* Main Outlet Container */}
      <main className="w-full max-w-5xl my-auto py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between py-4 border-t border-[#E5EAEF] mt-6 sm:mt-8 text-xs text-[#5A6A85] font-medium gap-2">
        <span>© {new Date().getFullYear()} CarbonLoop Industrial Network Inc.</span>
        <span>Secure TLS 1.3 Encryption • ISO 14064 Compliant</span>
      </footer>

    </div>
  );
};
