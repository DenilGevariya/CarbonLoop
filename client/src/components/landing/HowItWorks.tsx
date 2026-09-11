import React from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { StaggerContainer, StaggerItem } from '@/animations';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    code: 'SPECIFICATION',
    title: 'Stream Onboarding',
    subtitle: 'Stack Telematics & Chemical Fingerprinting',
    description: 'Emitters register verified stack parameters — mass flow rate (t/mo), purity %, pressure, temperature, and availability windows.',
    specs: ['99.5% Purity Standard', 'Liquefaction Specs', 'Telemetry Sync'],
    image: INDUSTRIAL_IMAGES.cementPlant
  },
  {
    step: '02',
    code: 'OPTIMIZATION',
    title: 'Algorithmic Matching',
    subtitle: 'Distance & Quality Compatibility Engine',
    description: 'CarbonLoop evaluates chemical suitability, haulage radius, pressure differential, and strike price bounds for optimal pairing.',
    specs: ['Radius Bounds <150km', 'Pressure Differential', 'Purity Thresholds'],
    image: INDUSTRIAL_IMAGES.controlRoom
  },
  {
    step: '03',
    code: 'OFF-TAKE',
    title: 'Bilateral Contracting',
    subtitle: 'Automated Off-Take Agreements',
    description: 'Bilateral negotiations produce legally binding digital off-take contracts with strict purity guarantees and volume commitments.',
    specs: ['Automated Escrow', 'Quality Guarantees', 'Spot & Long-Term'],
    image: INDUSTRIAL_IMAGES.refineryPipes
  },
  {
    step: '04',
    code: 'DISPATCH',
    title: 'Logistics Scheduling',
    subtitle: 'ISO Tank Fleet Telematics & Routing',
    description: 'Dynamic dispatch of ISO-tank fleets or dedicated pipeline hookups with continuous temperature, pressure, and GPS telematics.',
    specs: ['GPS Telematics', 'Pressure Monitoring', 'Hazmat Compliance'],
    image: INDUSTRIAL_IMAGES.isoTanker
  },
  {
    step: '05',
    code: 'SEQUESTRATION',
    title: 'Productive Reuse',
    subtitle: 'Permanent Industrial Mineralization & E-Fuels',
    description: 'CO₂ is permanently sequestered into green concrete, synthetic e-fuels, specialty chemicals, or greenhouse enrichment.',
    specs: ['Mineral Sequestration', 'Verified Carbon Credits', 'Audit Trail'],
    image: INDUSTRIAL_IMAGES.greenConcrete
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#F4F1EA] border-t border-[#E2DDD5] text-[#171A18] relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <SectionHeading
          eyebrow="Operational Architecture"
          eyebrowIcon={CheckCircle2}
          title="From stack capture to"
          highlightTitle="industrial off-take."
          description="A continuous, telemetry-verified workflow connecting emitters directly with off-takers and freight logistics."
        />

        {/* Editorial Steps Grid */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {steps.map((item) => (
            <StaggerItem key={item.step}>
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 rounded-none flex flex-col justify-between h-full group hover:border-[#173D32] transition-colors relative">
                {/* Step Header */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                    <span className="font-mono text-2xl font-black text-[#173D32]">
                      {item.step}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-[#5C6560] uppercase">
                      {item.code}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-[#171A18] mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-[#3C6E5C]">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-[#5C6560] leading-relaxed mt-2 font-serif">
                    {item.description}
                  </p>
                </div>

                {/* Specs List */}
                <div className="mt-6 pt-4 border-t border-[#E2DDD5]/60 flex flex-col gap-1.5">
                  {item.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-[11px] font-mono text-[#2B302C]">
                      <span className="size-1 bg-[#173D32] rounded-full inline-block" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Process Infrastructure Image Banner */}
        <div className="bg-[#173D32] text-white p-8 md:p-12 border border-[#173D32] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-2xl relative z-10">
            <span className="font-mono text-xs text-[#A3B899] uppercase tracking-widest">
              COMMERCIAL INTEGRATION
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Ready to plug your industrial stack into the CarbonLoop exchange?
            </h3>
            <p className="text-sm font-serif text-[#C5D3C1]">
              Whether you generate 500 t/month or 50,000 t/month, our automated matchmaker connects your stream with verified commercial buyers.
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10 whitespace-nowrap">
            <a
              href="/auth/register"
              className="bg-[#FAF8F5] hover:bg-white text-[#173D32] font-bold text-sm px-6 py-3.5 rounded-none transition-colors border border-white flex items-center gap-2"
            >
              Onboard Facility <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
