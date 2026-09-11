import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { MarketplacePreview } from '@/components/landing/MarketplacePreview';
import { MatchingShowcase } from '@/components/landing/MatchingShowcase';
import { LogisticsShowcase } from '@/components/landing/LogisticsShowcase';
import { ImpactMetrics } from '@/components/landing/ImpactMetrics';
import { EcosystemSection } from '@/components/landing/EcosystemSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] flex flex-col selection:bg-[#173D32] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorks />
        <MarketplacePreview />
        <MatchingShowcase />
        <LogisticsShowcase />
        <ImpactMetrics />
        <EcosystemSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
