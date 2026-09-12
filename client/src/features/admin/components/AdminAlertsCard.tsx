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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#FA896B]/15 text-[#FA896B] border border-[#FA896B]/30 rounded-full uppercase">
            <AlertTriangle className="w-3 h-3 text-[#FA896B]" /> CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#FFAE1F]/15 text-amber-700 border border-[#FFAE1F]/30 rounded-full uppercase">
            <AlertCircle className="w-3 h-3 text-amber-600" /> WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 rounded-full uppercase">
            <Info className="w-3 h-3 text-[#5D87FF]" /> INFO
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs">
        <div className="h-6 w-40 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded animate-pulse" />
          <div className="h-16 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-[#E5EAEF] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#FA896B]" />
            <h3 className="font-bold text-[#2A3547] text-base">Operational System Alerts</h3>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-[#ECF2FF] text-[#5D87FF] rounded-full border border-[#5D87FF]/20">
            {alerts.length} Active
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-[#F6F9FC] rounded-xl border border-dashed border-[#E5EAEF]">
            <CheckCircle2 className="w-8 h-8 text-[#13DEB9] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#2A3547]">All System Controls Nominal</p>
            <p className="text-xs text-[#5A6A85] mt-1">No active critical exceptions, pressure violations, or expired permits reported.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl border border-[#E5EAEF] bg-[#F6F9FC] hover:bg-[#ECF2FF]/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-xs font-semibold text-[#5A6A85] uppercase">
                        [{alert.category}]
                      </span>
                      {alert.entityIdentifier && (
                        <span className="text-xs font-semibold bg-[#ECF2FF] text-[#5D87FF] px-2 py-0.5 rounded-full border border-[#5D87FF]/20">
                          {alert.entityIdentifier}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[#2A3547]">{alert.title}</h4>
                    <p className="text-xs text-[#5A6A85] leading-relaxed">{alert.message}</p>
                    <span className="text-[10px] text-[#5A6A85] block pt-1">
                      Reported: {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {onResolve && (
                    <div>
                      {selectedAlertId === alert.id ? (
                        <div className="mt-2 bg-white p-2.5 rounded-lg border border-[#E5EAEF] w-64 text-xs">
                          <label className="block font-semibold text-[#2A3547] mb-1">Resolution Note:</label>
                          <input
                            type="text"
                            className="w-full border border-[#E5EAEF] rounded-lg px-2 py-1 mb-2 text-xs focus:outline-none focus:border-[#5D87FF]"
                            placeholder="e.g. Verified by site engineer"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedAlertId(null)}
                              className="px-2 py-1 text-[11px] text-[#5A6A85] hover:bg-[#F6F9FC] rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResolveSubmit(alert.id)}
                              disabled={resolvingId === alert.id}
                              className="px-2 py-1 text-[11px] font-semibold bg-[#5D87FF] text-white rounded-lg hover:bg-[#4570EA] disabled:opacity-50"
                            >
                              {resolvingId === alert.id ? 'Saving...' : 'Confirm Resolve'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAlertId(alert.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white text-[#2A3547] border border-[#E5EAEF] hover:bg-[#ECF2FF] hover:text-[#5D87FF] rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
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
