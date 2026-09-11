import React from 'react';
import { ImpactMetrics } from '@/components/landing/ImpactMetrics';
import { LogisticsShowcase } from '@/components/landing/LogisticsShowcase';

export const ImpactPage: React.FC = () => {
  return (
    <div className="py-8 space-y-12">
      <ImpactMetrics />
      <LogisticsShowcase />
    </div>
  );
};
