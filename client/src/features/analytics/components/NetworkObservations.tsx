import React from 'react';
import type { NetworkObservation } from '../api/analyticsApi';
import { Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Props {
  observations: NetworkObservation[];
}

export const NetworkObservations: React.FC<Props> = ({ observations }) => {
  if (observations.length === 0) return null;

  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 font-mono text-xs shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E2DDD5]/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#173D32]" />
            <span>Deterministic Network Observations</span>
          </h3>
          <p className="text-[11px] text-[#55524D] mt-0.5">
            Rule-based algorithmic intelligence derived from live transaction metrics
          </p>
        </div>

        <span className="text-[10px] text-[#173D32] bg-[#173D32]/10 px-2.5 py-1 rounded font-bold uppercase border border-[#173D32]/20">
          Rule Engine v1.0
        </span>
      </div>

      <div className="space-y-3">
        {observations.map((obs) => {
          let bg = 'bg-[#F7F5EF] border-[#E2DDD5] text-[#171A18]';
          let icon = <Info className="w-4 h-4 text-[#173D32]" />;

          if (obs.severity === 'SUCCESS') {
            bg = 'bg-emerald-50 border-emerald-200 text-emerald-950';
            icon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
          } else if (obs.severity === 'WARNING') {
            bg = 'bg-rose-50 border-rose-200 text-rose-950';
            icon = <AlertTriangle className="w-4 h-4 text-rose-600" />;
          }

          return (
            <div key={obs.id} className={`p-4 rounded-md border ${bg} flex items-start justify-between gap-4`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div>
                  <span className="font-bold text-xs uppercase block">{obs.title}</span>
                  <p className="text-xs mt-0.5 opacity-90">{obs.description}</p>
                </div>
              </div>

              {obs.metricValue && (
                <span className="px-2.5 py-1 rounded font-bold text-xs bg-white/80 border border-current shrink-0">
                  {obs.metricValue}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
