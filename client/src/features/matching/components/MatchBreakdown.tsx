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
      <h4 className="text-xs text-[#5A6A85] uppercase tracking-wider font-bold">
        Multi-Vector 8-Factor Score Breakdown
      </h4>

      <div className="space-y-3">
        {factors.map((item, index) => {
          const label = factorLabels[item.factor] || item.factor;
          const pctWeight = Math.round(item.weight * 100);

          return (
            <div key={index} className="p-3.5 rounded-xl bg-white border border-[#E5EAEF] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#2A3547] font-bold flex items-center gap-2">
                  {label}
                  <span className="text-[10px] text-[#5D87FF] bg-[#ECF2FF] px-2 py-0.5 rounded-full font-semibold border border-[#5D87FF]/20">
                    Weight: {pctWeight}%
                  </span>
                </span>
                <span className="text-[#5D87FF] font-extrabold">{item.score.toFixed(0)} / 100</span>
              </div>

              <Progress value={item.score} className="h-1.5 bg-[#F6F9FC] [&>div]:bg-[#5D87FF]" />

              <p className="text-[11px] text-[#5A6A85] font-sans leading-relaxed">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
