import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GitCompare, Activity, ArrowRight, History } from 'lucide-react';
import { useAdminOverview, useAdminAlerts, useAdminAuditLogs } from '../../features/admin/hooks/useAdmin';
import { AdminOverviewKPIsComponent } from '../../features/admin/components/AdminOverviewKPIs';
import { AdminAlertsCard } from '../../features/admin/components/AdminAlertsCard';

export const AdminOverviewPage: React.FC = () => {
  const { kpis, isLoading: isOverviewLoading, error: overviewError } = useAdminOverview();
  const { alerts, isLoading: isAlertsLoading, resolveAlert } = useAdminAlerts(false);
  const { items: auditLogs, isLoading: isLogsLoading } = useAdminAuditLogs({ limit: 8 });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#171A18] tracking-tight">
            Operational Command Center
          </h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Real-time multi-tenant intelligence across CO₂ emitters, buyers, logistics, and verification audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/organizations"
            className="px-3.5 py-2 text-xs font-semibold bg-[#173D32] text-white rounded-lg hover:bg-[#173D32]/90 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Manage Organizations
          </Link>
        </div>
      </div>

      {overviewError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
          {overviewError}
        </div>
      )}

      {/* 8 Headline Metric Cards */}
      {kpis && <AdminOverviewKPIsComponent kpis={kpis} isLoading={isOverviewLoading} />}

      {/* Operational Alerts & Quick Actions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminAlertsCard alerts={alerts} isLoading={isAlertsLoading} onResolve={resolveAlert} />
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-[#171A18] text-sm mb-3 border-b border-[#E2DDD5] pb-2 font-mono uppercase text-stone-600">
              Admin Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/organizations"
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F4F0EA] transition-colors text-xs font-medium text-stone-800"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#173D32]" /> Verify & Suspend Orgs
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/matches"
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F4F0EA] transition-colors text-xs font-medium text-stone-800"
              >
                <span className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-blue-700" /> Debug Match Score Factors
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F4F0EA] transition-colors text-xs font-medium text-stone-800"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> User Access & Sessions
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/health"
                className="flex items-center justify-between p-3 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F4F0EA] transition-colors text-xs font-medium text-stone-800"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-700" /> Infrastructure Diagnostics
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Audit Trail Stream */}
      <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#173D32]" />
            <h3 className="font-semibold text-[#171A18] text-base">Recent Platform Security Audit Trail</h3>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-mono text-[#173D32] hover:underline flex items-center gap-1 font-semibold"
          >
            View All Logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLogsLoading ? (
          <div className="py-8 text-center text-xs font-mono text-stone-500">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F0EA] border-b border-[#E2DDD5] text-stone-700 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor / Admin</th>
                  <th className="py-2.5 px-3">Action Performed</th>
                  <th className="py-2.5 px-3">Entity Scope</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD5]/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-stone-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-800">
                      {log.actorName || log.actorEmail || 'System Process'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-600 text-[11px]">
                      {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) : 'N/A'})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-500 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
