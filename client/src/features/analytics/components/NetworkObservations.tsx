import React from 'react';
import type { NetworkObservation } from '../api/analyticsApi';
import { Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Props {
  observations: NetworkObservation[];
}

export const NetworkObservations: React.FC<Props> = ({ observations }) => {
  if (observations.length === 0) return null;

  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E5EAEF] pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#5D87FF]" />
            <span>Deterministic Network Observations</span>
          </h3>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">
            Rule-based algorithmic intelligence derived from live transaction metrics
          </p>
        </div>

        <span className="text-[10px] text-[#5D87FF] bg-[#ECF2FF] px-3 py-1 rounded-full font-bold uppercase border border-[#5D87FF]/20">
          Rule Engine v1.0
        </span>
      </div>

      <div className="space-y-3">
        {observations.map((obs) => {
          let bg = 'bg-[#F6F9FC] border-[#E5EAEF] text-[#2A3547]';
          let icon = <Info className="w-4 h-4 text-[#5D87FF]" />;

          if (obs.severity === 'SUCCESS') {
            bg = 'bg-[#13DEB9]/10 border-[#13DEB9]/30 text-[#0EAB8B]';
            icon = <CheckCircle className="w-4 h-4 text-[#13DEB9]" />;
          } else if (obs.severity === 'WARNING') {
            bg = 'bg-[#FA896B]/10 border-[#FA896B]/30 text-[#FA896B]';
            icon = <AlertTriangle className="w-4 h-4 text-[#FA896B]" />;
          }

          return (
            <div key={obs.id} className={`p-4 rounded-xl border ${bg} flex items-start justify-between gap-4`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div>
                  <span className="font-bold text-xs uppercase block">{obs.title}</span>
                  <p className="text-xs mt-0.5 opacity-90">{obs.description}</p>
                </div>
              </div>

              {obs.metricValue && (
                <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-white/80 border border-current shrink-0">
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
