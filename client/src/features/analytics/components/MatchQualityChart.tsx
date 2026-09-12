import React from 'react';
import type { MatchingAnalytics } from '../api/analyticsApi';
import { Cpu } from 'lucide-react';

interface Props {
  matching: MatchingAnalytics;
}

export const MatchQualityChart: React.FC<Props> = ({ matching }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 font-mono text-xs shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E2DDD5]/60 pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#173D32]" />
            <span>Deterministic Match Score Distribution</span>
          </h3>
          <p className="text-[11px] text-[#55524D] mt-0.5">
            Algorithmically evaluated supply-demand pairings by score threshold
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-[#171A18]">{matching.averageMatchScore}</span>
          <span className="text-[10px] text-[#55524D] block">Avg Match Score</span>
        </div>
      </div>

      {/* Score Bands Bar Chart List */}
      <div className="space-y-4 pt-2">
        {matching.qualityDistribution.map((band) => {
          let barColor = 'bg-[#173D32]';
          if (band.category === 'STRONG') barColor = 'bg-[#2D6A4F]';
          if (band.category === 'GOOD') barColor = 'bg-[#52B788]';
          if (band.category === 'POSSIBLE') barColor = 'bg-amber-600';
          if (band.category === 'WEAK') barColor = 'bg-rose-600';

          return (
            <div key={band.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#171A18]">
                  {band.category} <span className="text-[10px] text-[#55524D] font-normal">({band.minScore}-{band.maxScore} pts)</span>
                </span>
                <span className="font-semibold text-[#171A18]">
                  {band.matchCount} Matches ({band.percentage}%)
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-[#E2DDD5]/40 h-3 rounded-xs overflow-hidden border border-[#E2DDD5]/60 flex">
                <div
                  className={`h-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.max(band.percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
