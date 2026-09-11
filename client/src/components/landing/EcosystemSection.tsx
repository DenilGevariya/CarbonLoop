import React from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Factory, Building2, Truck, ShieldCheck, Users, ArrowUpRight } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/animations';

const stakeholders = [
  {
    icon: Factory,
    role: 'EMITTERS',
    title: 'Industrial Stack Emitters',
    description: 'Monetize captured flue gas streams, reduce compliance carbon liabilities, and sync real-time stack telematics.',
    action: 'Onboard Stack Stream'
  },
  {
    icon: Building2,
    role: 'OFF-TAKERS',
    title: 'Utilization & Off-Take Buyers',
    description: 'Procure high-purity, verified CO₂ feedstock for concrete mineralization, synthetic e-fuels, and chemical synth.',
    action: 'Post Volume Requirement'
  },
  {
    icon: Truck,
    role: 'LOGISTICS',
    title: 'Freight & Fleet Logistics',
    description: 'Operate specialized ISO-tank fleets and cryogenic transport corridors with automated dispatch booking.',
    action: 'Register Fleet Capability'
  },
  {
    icon: ShieldCheck,
    role: 'REGULATORS',
    title: 'Verifiers & Regulators',
    description: 'Audit purity certifications, verify mass balance transfer logs, and issue accredited carbon removal tokens.',
    action: 'Access Audit Portal'
  }
];

export const EcosystemSection: React.FC = () => {
  return (
    <section id="ecosystem" className="py-24 px-4 md:px-8 bg-[#F7F5EF] text-[#171A18] relative border-t border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <SectionHeading
          eyebrow="Multi-Stakeholder Architecture"
          eyebrowIcon={Users}
          title="Built for the entire"
          highlightTitle="carbon value chain."
          description="Connecting stack emitters, off-take buyers, specialized freight carriers, and climate auditors in one unified exchange."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stakeholders.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.role}>
                <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 flex flex-col justify-between h-full group hover:border-[#173D32] transition-colors relative">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                      <span className="font-mono text-[10px] font-bold text-[#173D32] uppercase tracking-widest bg-[#EBE7DF] px-2 py-0.5 border border-[#DCD6C9]">
                        {item.role}
                      </span>
                      <Icon className="size-4 text-[#173D32]" />
                    </div>

                    <h3 className="text-lg font-bold text-[#171A18] tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#5C6560] font-serif leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E2DDD5]">
                    <a
                      href="/auth/register"
                      className="text-xs font-mono text-[#173D32] font-bold uppercase tracking-wider flex items-center justify-between group-hover:text-[#255244] transition-colors"
                    >
                      <span>{item.action}</span>
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};
