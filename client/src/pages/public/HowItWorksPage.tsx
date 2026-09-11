import React from 'react';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { MatchingShowcase } from '@/components/landing/MatchingShowcase';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="py-8 space-y-12">
      <HowItWorks />
      <MatchingShowcase />
    </div>
  );
};
