import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface MatchReasonsProps {
  reasons: string[];
}

export const MatchReasons: React.FC<MatchReasonsProps> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/25 space-y-2 shadow-xs">
      <div className="flex items-center gap-2 text-xs font-bold text-[#5D87FF] uppercase tracking-wider">
        <CheckCircle2 className="size-4" /> Primary Match Compatibility Drivers
      </div>
      <ul className="space-y-1.5 text-xs text-[#2A3547] font-sans">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[#5D87FF] font-bold">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface MatchWarningsProps {
  warnings: string[];
}

export const MatchWarnings: React.FC<MatchWarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">
        <AlertTriangle className="size-4 text-amber-700" /> Trade-offs & Operational Caveats
      </div>
      <ul className="space-y-1.5 text-xs text-amber-950 font-sans font-medium">
        {warnings.map((w, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-amber-700 font-bold">⚠️</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
