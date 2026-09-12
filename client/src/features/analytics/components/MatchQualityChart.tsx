import React from 'react';
import type { MatchingAnalytics } from '../api/analyticsApi';
import { Cpu } from 'lucide-react';

interface Props {
  matching: MatchingAnalytics;
}

export const MatchQualityChart: React.FC<Props> = ({ matching }) => {
  return (
    <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 text-xs shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E5EAEF] pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#5D87FF]" />
            <span>Deterministic Match Score Distribution</span>
          </h3>
          <p className="text-[11px] text-[#5A6A85] mt-0.5">
            Algorithmically evaluated supply-demand pairings by score threshold
          </p>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-[#5D87FF]">{matching.averageMatchScore}</span>
          <span className="text-[10px] text-[#5A6A85] block font-semibold">Avg Match Score</span>
        </div>
      </div>

      {/* Score Bands Bar Chart List */}
      <div className="space-y-4 pt-2">
        {matching.qualityDistribution.map((band) => {
          let barColor = 'bg-[#13DEB9]';
          if (band.category === 'STRONG') barColor = 'bg-[#5D87FF]';
          if (band.category === 'GOOD') barColor = 'bg-[#FFAE1F]';
          if (band.category === 'POSSIBLE') barColor = 'bg-orange-400';
          if (band.category === 'WEAK') barColor = 'bg-[#FA896B]';

          return (
            <div key={band.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2A3547]">
                  {band.category} <span className="text-[10px] text-[#5A6A85] font-normal">({band.minScore}-{band.maxScore} pts)</span>
                </span>
                <span className="font-semibold text-[#2A3547]">
                  {band.matchCount} Matches ({band.percentage}%)
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-[#E5EAEF] h-2.5 rounded-full overflow-hidden flex">
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
