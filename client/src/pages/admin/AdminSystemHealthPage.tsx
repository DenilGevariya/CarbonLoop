import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../features/admin/api/adminApi';
import type { NetworkHealthStatus } from '../../features/admin/api/adminApi';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<NetworkHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getHealth();
      if (res) {
        setHealth(res);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to query system health status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#173D32]" /> System Health & Infrastructure Diagnostics
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Real-time telemetry monitoring PostgreSQL pool connection latency, API response times, process uptime, and background queues.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-3 py-1.5 text-xs font-mono font-semibold bg-[#173D32] text-white rounded hover:bg-[#173D32]/90 shadow-xs"
        >
          Re-Run Diagnostics
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center font-mono text-xs text-stone-500 uppercase tracking-widest">
          Polling Database & API Microservices Latency...
        </div>
      ) : (
        health && (
          <div className="space-y-6">
            {/* 4 Infrastructure Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-[#E2DDD5] rounded-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">Database Service</span>
                  <Database className="w-5 h-5 text-[#173D32]" />
                </div>
                <div className="text-xl font-bold font-mono text-[#171A18]">
                  {health.databaseStatus}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Latency: <strong className="text-stone-800">{health.dbLatencyMs}ms</strong>
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2DDD5] rounded-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">Marketplace Engine</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-xl font-bold font-mono text-[#171A18]">
                  {health.marketplaceStatus}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Matching Engine: <strong className="text-stone-800">{health.matchingStatus}</strong>
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2DDD5] rounded-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">Logistics Pipeline</span>
                  <Activity className="w-5 h-5 text-amber-700" />
                </div>
                <div className="text-xl font-bold font-mono text-[#171A18]">
                  {health.logisticsStatus}
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Active Exceptions Monitored
                </div>
              </div>

              <div className="p-5 bg-white border border-[#E2DDD5] rounded-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">Server Process Uptime</span>
                  <Clock className="w-5 h-5 text-purple-700" />
                </div>
                <div className="text-xl font-bold font-mono text-[#171A18]">
                  {Math.floor(health.uptimeSeconds / 3600)}h {Math.floor((health.uptimeSeconds % 3600) / 60)}m
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Express + TypeScript Engine
                </div>
              </div>
            </div>

            {/* PostgreSQL Engine Info Box */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="font-semibold text-[#171A18] text-base flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
                <Server className="w-5 h-5 text-[#173D32]" /> Database & Node.js Server Environment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                  <span className="text-stone-400 text-[10px] uppercase block">PostgreSQL Engine Version</span>
                  <span className="font-bold text-stone-800">{health.postgresVersion || 'PostgreSQL 16.x'}</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                  <span className="text-stone-400 text-[10px] uppercase block">Pending Verification Queue</span>
                  <span className="font-bold text-amber-800">{health.verificationPendingCount} Pending Audits</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded border border-[#E2DDD5]">
                  <span className="text-stone-400 text-[10px] uppercase block">API Gateway Status</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {health.apiStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
