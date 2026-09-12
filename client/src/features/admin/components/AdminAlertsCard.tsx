import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { SystemAlertRecord } from '../api/adminApi';

interface AdminAlertsCardProps {
  alerts: SystemAlertRecord[];
  isLoading?: boolean;
  onResolve?: (alertId: string, notes?: string) => Promise<any>;
}

export const AdminAlertsCard: React.FC<AdminAlertsCardProps> = ({ alerts, isLoading, onResolve }) => {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const handleResolveSubmit = async (alertId: string) => {
    if (!onResolve) return;
    try {
      setResolvingId(alertId);
      await onResolve(alertId, resolutionNotes || 'Alert acknowledged and resolved by operator.');
      setSelectedAlertId(null);
      setResolutionNotes('');
    } catch (err) {
      console.error('Failed to resolve alert', err);
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 rounded uppercase">
            <AlertTriangle className="w-3 h-3 text-rose-700" /> CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded uppercase">
            <AlertCircle className="w-3 h-3 text-amber-700" /> WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 rounded uppercase">
            <Info className="w-3 h-3 text-blue-700" /> INFO
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
        <div className="h-6 w-40 bg-stone-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
          <div className="h-16 bg-stone-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-[#E2DDD5] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h3 className="font-semibold text-[#171A18] text-base">Operational System Alerts</h3>
          </div>
          <span className="px-2 py-0.5 text-xs font-mono font-bold bg-stone-100 text-stone-700 rounded border border-stone-200">
            {alerts.length} Active
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF8F5] rounded-lg border border-dashed border-[#E2DDD5]">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">All System Controls Nominal</p>
            <p className="text-xs text-stone-500 mt-1">No active critical exceptions, pressure violations, or expired permits reported.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F4F0EA] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs font-mono font-bold text-stone-500 uppercase">
                        [{alert.category}]
                      </span>
                      {alert.entityIdentifier && (
                        <span className="text-xs font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-700">
                          {alert.entityIdentifier}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#171A18]">{alert.title}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] font-mono text-stone-400 block pt-1">
                      Reported: {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {onResolve && (
                    <div>
                      {selectedAlertId === alert.id ? (
                        <div className="mt-2 bg-white p-2.5 rounded border border-stone-300 w-64 text-xs">
                          <label className="block font-medium text-stone-700 mb-1">Resolution Note:</label>
                          <input
                            type="text"
                            className="w-full border border-stone-300 rounded px-2 py-1 mb-2 text-xs focus:outline-none focus:border-[#173D32]"
                            placeholder="e.g. Verified by site engineer"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedAlertId(null)}
                              className="px-2 py-1 text-[11px] text-stone-600 hover:bg-stone-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResolveSubmit(alert.id)}
                              disabled={resolvingId === alert.id}
                              className="px-2 py-1 text-[11px] font-semibold bg-[#173D32] text-white rounded hover:bg-[#173D32]/90 disabled:opacity-50"
                            >
                              {resolvingId === alert.id ? 'Saving...' : 'Confirm Resolve'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAlertId(alert.id)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 rounded shadow-xs transition-colors shrink-0"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
