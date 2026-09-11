import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col items-center justify-between p-4 md:p-8 selection:bg-[#173D32] selection:text-white">
      
      {/* Editorial Top Brand Header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-[#E2DDD5] mb-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-8 bg-[#173D32] border border-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-xs group-hover:scale-105 transition-transform">
            C⟳
          </div>
          <span className="text-xl font-black text-[#171A18] tracking-tighter uppercase font-mono">
            CARBON<span className="text-[#3C6E5C] font-light">LOOP</span>
          </span>
        </Link>

        <span className="text-xs font-mono text-[#5C6560] uppercase tracking-widest hidden sm:block">
          INDUSTRIAL CARBON COMMODITY EXCHANGE
        </span>
      </header>

      {/* Main Outlet Container */}
      <main className="w-full max-w-5xl my-auto">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between py-4 border-t border-[#E2DDD5] mt-8 text-xs font-mono text-[#5C6560] gap-2">
        <span>© 2026 CARBONLOOP TECHNOLOGIES INC.</span>
        <span>SECURE AUTHENTICATION PROTOCOL</span>
      </footer>

    </div>
  );
};
