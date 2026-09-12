import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  GitCompare,
  History,
  MapPin,
  Activity,
  Search,
  ShieldCheck,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { GlobalCommandSearch } from './GlobalCommandSearch';
import { useAdminOverview, useAdminAlerts } from '../hooks/useAdmin';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { health } = useAdminOverview();
  const { alerts } = useAdminAlerts(false);

  const navItems = [
    { label: 'Command Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Organizations', path: '/admin/organizations', icon: <Building2 className="w-4 h-4" /> },
    { label: 'User Access & Sessions', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Match Score Debugger', path: '/admin/matches', icon: <GitCompare className="w-4 h-4" /> },
    { label: 'Audit Log Trail', path: '/admin/audit-logs', icon: <History className="w-4 h-4" /> },
    { label: 'Network Geo Map', path: '/admin/network-map', icon: <MapPin className="w-4 h-4" /> },
    { label: 'System Health Diagnostics', path: '/admin/health', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col font-sans text-[#2A3547]">
      {/* Global Admin Header */}
      <header className="h-16 bg-white border-b border-[#E5EAEF] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5D87FF] flex items-center justify-center font-bold text-white tracking-widest text-xs shadow-xs">
            CL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#2A3547]">CARBONLOOP</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#ECF2FF] text-[#5D87FF] rounded-full border border-[#5D87FF]/20 uppercase">
                ADMIN COMMAND CENTER
              </span>
            </div>
            <span className="text-[10px] text-[#5A6A85] block -mt-0.5 font-medium">
              Industrial Network Operational Control Room
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-3">
          {/* Cmd+K Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 bg-[#F6F9FC] hover:bg-[#ECF2FF] text-[#5A6A85] px-3 py-1.5 rounded-lg border border-[#E5EAEF] transition-all text-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#5A6A85]" />
            <span className="hidden md:inline text-[#5A6A85]">Global Command Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-[#5A6A85] border border-[#E5EAEF] rounded">
              ⌘K
            </kbd>
          </button>

          {/* System Health Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#F6F9FC] border border-[#E5EAEF] rounded-lg text-xs font-semibold">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.databaseStatus === 'HEALTHY' ? 'bg-[#13DEB9] animate-pulse' : 'bg-[#FA896B]'
              }`}
            />
            <span className="text-[#5A6A85] text-[11px]">
              {health ? `DB Latency ${health.dbLatencyMs}ms` : 'Connecting...'}
            </span>
          </div>

          {/* Active Alerts Pill */}
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              alerts.length > 0
                ? 'bg-[#FA896B]/15 border-[#FA896B]/30 text-[#FA896B] hover:bg-[#FA896B]/25'
                : 'bg-[#13DEB9]/15 border-[#13DEB9]/30 text-[#0EAB8B]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{alerts.length} Alerts</span>
          </Link>

          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-1 text-xs text-[#5A6A85] hover:text-[#5D87FF] font-semibold transition-colors border border-[#E5EAEF] px-3 py-1 rounded-lg bg-[#F6F9FC]"
          >
            User App <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E5EAEF] flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5A6A85]">
              Admin Navigation
            </div>
            {navItems.map((item) => {
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#ECF2FF] text-[#5D87FF] shadow-xs'
                      : 'text-[#5A6A85] hover:bg-[#F6F9FC] hover:text-[#2A3547]'
                  }`}
                >
                  <span className={isActive ? 'text-[#5D87FF]' : 'text-[#5A6A85]'}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Footer Security Badge */}
          <div className="p-4 border-t border-[#E5EAEF] bg-[#F6F9FC] text-[11px] text-[#5A6A85] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2A3547]">
              <ShieldCheck className="w-4 h-4 text-[#5D87FF]" /> Strict Role Auth
            </div>
            <p className="text-[10px] text-[#5A6A85]">
              Authenticated Platform Admin Session. All status mutations are immutably audited.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation bar */}
        <div className="md:hidden bg-white border-b border-[#E5EAEF] p-2 flex overflow-x-auto gap-2 w-full">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                  isActive ? 'bg-[#5D87FF] text-white' : 'bg-[#F6F9FC] text-[#5A6A85]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F6F9FC]">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Modal */}
      <GlobalCommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
