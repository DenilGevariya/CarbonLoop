import React from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Cpu, CheckCircle2, Zap, ArrowRight, Check } from 'lucide-react';
import { FadeUp, ScaleIn } from '@/animations';

const matchMetrics = [
  { label: 'Purity Alignment (99.5% vs ≥99.0%)', score: '100%', pass: true },
  { label: 'Geographic Radius (112.5 km vs ≤200 km)', score: '96%', pass: true },
  { label: 'Target Strike Price (₹4,800 vs ≤₹5,000)', score: '95%', pass: true },
  { label: 'Volume Capacity (1,250t vs 500t min)', score: '92%', pass: true },
  { label: 'Pressure Compatibility (25 bar / 20 bar)', score: '90%', pass: true }
];

export const MatchingShowcase: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#173D32] text-white relative border-t border-[#255244]">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <SectionHeading
          dark
          eyebrow="Matchmaking Compatibility Engine"
          eyebrowIcon={Cpu}
          title="Algorithmic verification"
          highlightTitle="in real-time."
          description="CarbonLoop evaluates multi-vector stream physics, chemical composition, transportation radius, and pricing boundaries to calculate exact off-take suitability."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Buyer Requirement */}
          <FadeUp className="lg:col-span-4 flex">
            <div className="bg-[#FAF8F5] text-[#171A18] p-6 border border-white/20 flex flex-col justify-between w-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#173D32] text-white px-2 py-0.5">
                    BUYER REQUIREMENT
                  </span>
                  <span className="text-xs font-mono text-[#5C6560]">REQ-8821</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-[#171A18]">GreenForge Materials</h4>
                  <p className="text-xs font-mono text-[#3C6E5C]">Vadodara Mineralization Facility</p>
                </div>

                <div className="space-y-2 text-xs font-mono bg-[#EBE7DF]/80 p-4 border border-[#DCD6C9]">
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Required Purity:</span>
                    <span className="text-[#171A18] font-bold">≥ 99.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Required Volume:</span>
                    <span className="text-[#171A18] font-bold">500 t/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Max Transit Radius:</span>
                    <span className="text-[#171A18] font-bold">200 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Target Strike Price:</span>
                    <span className="text-[#173D32] font-bold">≤ ₹5,000/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Delivery State:</span>
                    <span className="text-[#171A18] font-bold">Liquid CO₂</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2DDD5] flex items-center gap-2 text-xs font-serif text-[#5C6560]">
                <Check className="size-4 text-[#173D32]" /> Direct off-take for concrete curing line
              </div>
            </div>
          </FadeUp>

          {/* Middle Column: Match Engine Matrix */}
          <ScaleIn className="lg:col-span-4 flex">
            <div className="bg-[#122E26] text-white p-6 border border-[#3C6E5C] flex flex-col justify-between w-full text-center relative overflow-hidden">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center justify-center gap-2 py-1 px-3 bg-white/10 text-[#A3B899] border border-white/15 mx-auto">
                  <Zap className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-widest font-semibold">Match Score</span>
                </div>

                <div>
                  <div className="text-6xl font-black font-mono tracking-tight text-white">
                    94.5<span className="text-2xl text-[#A3B899]">/100</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#A3B899] uppercase tracking-widest block mt-1">
                    HIGH PURITY STREAM COMPATIBILITY
                  </span>
                </div>

                {/* Vector Breakdown */}
                <div className="space-y-2 text-left pt-4 border-t border-white/15">
                  {matchMetrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#B0BAC3] truncate max-w-[210px]">{m.label}</span>
                      <span className="text-[#A3B899] font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> {m.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15">
                <a
                  href="/auth/register"
                  className="w-full bg-[#FAF8F5] hover:bg-white text-[#173D32] font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-colors border border-white"
                >
                  Generate Off-Take Proposal <ArrowRight className="size-3" />
                </a>
              </div>
            </div>
          </ScaleIn>

          {/* Right Column: Emitter Supply Match */}
          <FadeUp className="lg:col-span-4 flex">
            <div className="bg-[#FAF8F5] text-[#171A18] p-6 border border-white/20 flex flex-col justify-between w-full">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#3C6E5C] text-white px-2 py-0.5">
                    EMITTER STREAM
                  </span>
                  <span className="text-xs font-mono text-[#5C6560]">LST-1042</span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-[#171A18]">TerraCem Industries</h4>
                  <p className="text-xs font-mono text-[#3C6E5C]">Ahmedabad Cement Complex</p>
                </div>

                <div className="space-y-2 text-xs font-mono bg-[#EBE7DF]/80 p-4 border border-[#DCD6C9]">
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Actual Purity:</span>
                    <span className="text-[#173D32] font-bold">99.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Available Volume:</span>
                    <span className="text-[#171A18] font-bold">1,250 t/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Transit Distance:</span>
                    <span className="text-[#171A18] font-bold">112.5 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Off-Take Price:</span>
                    <span className="text-[#173D32] font-bold">₹4,800/t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6560]">Supply State:</span>
                    <span className="text-[#171A18] font-bold">Liquid CO₂</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2DDD5] flex items-center gap-2 text-xs font-serif text-[#5C6560]">
                <Check className="size-4 text-[#173D32]" /> Stack telematics synced 12 minutes ago
              </div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  );
};
