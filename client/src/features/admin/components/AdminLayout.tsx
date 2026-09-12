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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-[#171A18]">
      {/* Global Admin Header */}
      <header className="h-14 bg-[#171A18] text-white border-b border-[#2A2E2C] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#173D32] border border-emerald-500/40 flex items-center justify-center font-bold text-white tracking-widest text-xs font-mono shadow-sm">
            CL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">CARBONLOOP</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#173D32] text-emerald-300 rounded border border-emerald-500/30 uppercase">
                ADMIN COMMAND CENTER
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono block -mt-0.5">
              Industrial Network Operational Control Room
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-3">
          {/* Cmd+K Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 bg-[#242826] hover:bg-[#2F3431] text-stone-300 px-3 py-1.5 rounded-lg border border-[#383D3A] transition-all text-xs"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline text-stone-400">Global Command Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* System Health Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#242826] border border-[#383D3A] rounded-lg text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.databaseStatus === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span className="text-stone-300 text-[11px]">
              {health ? `DB Latency ${health.dbLatencyMs}ms` : 'Connecting...'}
            </span>
          </div>

          {/* Active Alerts Pill */}
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
              alerts.length > 0
                ? 'bg-rose-950/60 border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
                : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{alerts.length} Alerts</span>
          </Link>

          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-1 text-xs text-stone-300 hover:text-white transition-colors border border-stone-700 px-2.5 py-1 rounded-lg bg-stone-800/60"
          >
            User App <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-[#E2DDD5] flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#173D32] text-white shadow-sm font-semibold'
                      : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-[#171A18]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-stone-500'}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Footer Security Badge */}
          <div className="p-4 border-t border-[#E2DDD5] bg-[#FAF8F5] text-[11px] font-mono text-stone-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <ShieldCheck className="w-4 h-4 text-[#173D32]" /> Strict Role Auth
            </div>
            <p className="text-[10px] text-stone-500">
              Authenticated Platform Admin Session. All status mutations are immutably audited.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation bar */}
        <div className="md:hidden bg-white border-b border-[#E2DDD5] p-2 flex overflow-x-auto gap-2 w-full">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
                  isActive ? 'bg-[#173D32] text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Search Modal */}
      <GlobalCommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
