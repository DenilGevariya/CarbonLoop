import React from 'react';
import type { FactorScoreResult, MatchRecord } from '../types/matching.types';
import { Progress } from '@/components/ui/progress';

interface MatchBreakdownProps {
  match: MatchRecord;
}

export const MatchBreakdown: React.FC<MatchBreakdownProps> = ({ match }) => {
  const defaultFactors: FactorScoreResult[] = [
    { factor: 'quantity', score: match.quantity_score, weight: 0.20, explanation: 'Quantity compatibility evaluation.' },
    { factor: 'purity', score: match.purity_score, weight: 0.20, explanation: 'Purity concentration threshold alignment.' },
    { factor: 'physicalForm', score: match.physical_form_score, weight: 0.10, explanation: 'CO2 physical state form compatibility.' },
    { factor: 'availability', score: match.availability_score, weight: 0.15, explanation: 'Supply and requirement schedule window overlap.' },
    { factor: 'price', score: match.price_score, weight: 0.15, explanation: 'Source unit price vs target budget.' },
    { factor: 'distance', score: match.distance_score, weight: 0.10, explanation: 'Geographic proximity between facility coordinates.' },
    { factor: 'logistics', score: match.logistics_score, weight: 0.05, explanation: 'Cryogenic freight transport feasibility.' },
    { factor: 'utilization', score: match.utilization_score, weight: 0.05, explanation: 'Process feedstock suitability.' },
  ];

  const factors = match.explanations && match.explanations.length > 0 ? match.explanations : defaultFactors;

  const factorLabels: Record<string, string> = {
    quantity: 'Quantity Capacity',
    purity: 'Purity Specification',
    physicalForm: 'Physical Form',
    availability: 'Schedule Availability',
    price: 'Price Alignment',
    distance: 'Geographic Distance',
    logistics: 'Logistics Feasibility',
    utilization: 'Utilization Process',
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-mono text-stone-500 uppercase tracking-wider font-bold">
        Multi-Vector 8-Factor Score Breakdown
      </h4>

      <div className="space-y-3">
        {factors.map((item, index) => {
          const label = factorLabels[item.factor] || item.factor;
          const pctWeight = Math.round(item.weight * 100);

          return (
            <div key={index} className="p-3.5 rounded-xl bg-white border border-[#E2DDD5] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#171A18] font-bold flex items-center gap-2">
                  {label}
                  <span className="text-[10px] text-stone-600 bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#E2DDD5]">
                    Weight: {pctWeight}%
                  </span>
                </span>
                <span className="text-[#173D32] font-extrabold">{item.score.toFixed(0)} / 100</span>
              </div>

              <Progress value={item.score} className="h-1.5 bg-[#EFECE4] [&>div]:bg-[#173D32]" />

              <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
