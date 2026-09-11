import React from 'react';
import { MetricCard } from '@/components/shared/MetricCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { TrendingUp, Factory, RotateCcw, Building2 } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/animations';

export const ImpactMetrics: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#F4F1EA] text-[#171A18] relative border-t border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <SectionHeading
          eyebrow="Platform Throughput Metrics"
          eyebrowIcon={TrendingUp}
          title="Quantifiable environmental &"
          highlightTitle="economic scale."
          description="Cumulative carbon circularity throughput logged across industrial emitters, off-take facilities, and logistics fleets."
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StaggerItem>
            <MetricCard
              label="CO₂ Capacity Listed"
              value={24820}
              suffix=" t/mo"
              subtext="Verified stack flow capacity onboarded"
              icon={Factory}
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="CO₂ Matched"
              value={18420}
              suffix=" t/mo"
              subtext="Active off-take pairings in execution"
              icon={RotateCcw}
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="CO₂ Sequestered"
              value={12840}
              suffix=" t/mo"
              subtext="Permanently bound in mineral products"
              icon={TrendingUp}
            />
          </StaggerItem>

          <StaggerItem>
            <MetricCard
              label="Connected Entities"
              value={184}
              suffix=" orgs"
              subtext="Emitters, Off-takers & Logistics Carriers"
              icon={Building2}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="text-center text-xs text-[#5C6560] font-mono">
          * Telemetry audit data synced with state pollution control board reports.
        </div>
      </div>
    </section>
  );
};
