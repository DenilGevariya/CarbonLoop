import React from 'react';
import { StaggerContainer, StaggerItem, HoverLift } from '@/animations';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { CheckCircle2, ArrowRight, Activity, ShieldCheck, Cpu, Truck, Factory } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: '01',
    code: 'SPECIFICATION',
    title: 'Stream Onboarding',
    subtitle: 'Stack Telematics & Fingerprinting',
    description: 'Emitters register verified stack parameters — mass flow rate (t/mo), purity %, pressure, temperature, and availability windows.',
    specs: ['99.5% Purity Standard', 'Liquefaction Specs', 'Telemetry Sync'],
    icon: Factory,
    image: INDUSTRIAL_IMAGES.cementPlant
  },
  {
    step: '02',
    code: 'OPTIMIZATION',
    title: 'Algorithmic Matching',
    subtitle: 'Distance & Quality Engine',
    description: 'CarbonLoop evaluates chemical suitability, haulage radius, pressure differential, and strike price bounds for optimal pairing.',
    specs: ['Radius Bounds <150km', 'Pressure Differential', 'Purity Thresholds'],
    icon: Cpu,
    image: INDUSTRIAL_IMAGES.controlRoom
  },
  {
    step: '03',
    code: 'OFF-TAKE',
    title: 'Bilateral Contracting',
    subtitle: 'Automated Off-Take Agreements',
    description: 'Bilateral negotiations produce legally binding digital off-take contracts with strict purity guarantees and volume commitments.',
    specs: ['Automated Escrow', 'Quality Guarantees', 'Spot & Long-Term'],
    icon: ShieldCheck,
    image: INDUSTRIAL_IMAGES.refineryPipes
  },
  {
    step: '04',
    code: 'DISPATCH',
    title: 'Logistics Scheduling',
    subtitle: 'ISO Tank Fleet & Routing',
    description: 'Dynamic dispatch of ISO-tank fleets or dedicated pipeline hookups with continuous temperature, pressure, and GPS telematics.',
    specs: ['GPS Telematics', 'Pressure Monitoring', 'Hazmat Compliance'],
    icon: Truck,
    image: INDUSTRIAL_IMAGES.isoTanker
  },
  {
    step: '05',
    code: 'SEQUESTRATION',
    title: 'Productive Reuse',
    subtitle: 'Mineralization & Synthetic Fuels',
    description: 'CO₂ is permanently sequestered into green concrete, synthetic e-fuels, specialty chemicals, or greenhouse enrichment.',
    specs: ['Mineral Sequestration', 'Verified Carbon Credits', 'Audit Trail'],
    icon: Activity,
    image: INDUSTRIAL_IMAGES.greenConcrete
  }
];

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5D87FF]" />
          Operational Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2A3547] tracking-tight">
          From Stack Capture to Industrial Off-Take
        </h2>
        <p className="text-sm text-[#5A6A85] font-medium leading-relaxed">
          A continuous, telemetry-verified workflow connecting emitters directly with off-takers and freight logistics.
        </p>
      </div>

      {/* Steps Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {steps.map((item) => {
          return (
            <StaggerItem key={item.step}>
              <HoverLift y={-3}>
                <div className="bg-white border border-[#E5EAEF] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-full hover:shadow-md hover:border-[#5D87FF]/40 transition-all space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
                      <span className="size-9 rounded-xl bg-[#ECF2FF] text-[#5D87FF] font-bold flex items-center justify-center text-sm border border-[#5D87FF]/20">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider">
                        {item.code}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#2A3547]">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#5D87FF]">
                      {item.subtitle}
                    </p>

                    <p className="text-xs text-[#5A6A85] font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5EAEF] space-y-1.5">
                    {item.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5 text-[11px] font-medium text-[#2A3547]">
                        <span className="size-1.5 bg-[#5D87FF] rounded-full inline-block" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Modern Banner */}
      <div className="bg-gradient-to-r from-[#2A3547] to-[#1E2735] text-white p-8 sm:p-10 rounded-3xl border border-[#34445c] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold text-[#49BEFF] uppercase tracking-wider">
            COMMERCIAL INTEGRATION
          </span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ready to plug your industrial stack into the CarbonLoop exchange?
          </h3>
          <p className="text-xs sm:text-sm text-[#949C96] font-medium">
            Whether you generate 500 t/month or 50,000 t/month, our automated matchmaker connects your stream with verified commercial buyers.
          </p>
        </div>

        <div className="whitespace-nowrap shrink-0">
          <Button
            onClick={() => navigate('/register')}
            className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-6 py-3 h-12 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Onboard Facility</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
