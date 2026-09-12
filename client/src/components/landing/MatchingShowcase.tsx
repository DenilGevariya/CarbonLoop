import React from 'react';
import { Cpu, CheckCircle2, Zap, ArrowRight, Check } from 'lucide-react';
import { FadeUp, ScaleIn } from '@/animations';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const matchMetrics = [
  { label: 'Purity Alignment (99.5% vs ≥99.0%)', score: '100%', pass: true },
  { label: 'Geographic Radius (112.5 km vs ≤200 km)', score: '96%', pass: true },
  { label: 'Target Strike Price (₹4,800 vs ≤₹5,000)', score: '95%', pass: true },
  { label: 'Volume Capacity (1,250t vs 500t min)', score: '92%', pass: true },
  { label: 'Pressure Compatibility (25 bar / 20 bar)', score: '90%', pass: true }
];

export const MatchingShowcase: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-[#5D87FF]" />
          Matchmaking Compatibility Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2A3547] tracking-tight">
          Algorithmic Verification in Real-Time
        </h2>
        <p className="text-sm text-[#5A6A85] font-medium leading-relaxed">
          CarbonLoop evaluates multi-vector stream physics, chemical composition, transportation radius, and pricing boundaries to calculate exact off-take suitability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Buyer Requirement */}
        <FadeUp className="lg:col-span-4 flex">
          <div className="bg-white text-[#2A3547] p-6 rounded-2xl border border-[#E5EAEF] shadow-xs flex flex-col justify-between w-full space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ECF2FF] text-[#5D87FF] border border-[#5D87FF]/20 px-2.5 py-1 rounded-md">
                  BUYER REQUIREMENT
                </span>
                <span className="text-xs font-bold text-[#5A6A85]">REQ-8821</span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#2A3547]">GreenForge Materials</h4>
                <p className="text-xs font-semibold text-[#5D87FF]">Vadodara Mineralization Facility</p>
              </div>

              <div className="space-y-2.5 text-xs font-medium bg-[#F6F9FC] p-4 rounded-xl border border-[#E5EAEF]">
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Required Purity:</span>
                  <span className="text-[#2A3547] font-bold">≥ 99.0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Required Volume:</span>
                  <span className="text-[#2A3547] font-bold">500 t/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Max Transit Radius:</span>
                  <span className="text-[#2A3547] font-bold">200 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Target Strike Price:</span>
                  <span className="text-[#5D87FF] font-bold">≤ ₹5,000/t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Delivery State:</span>
                  <span className="text-[#2A3547] font-bold">Liquid CO₂</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAEF] flex items-center gap-2 text-xs text-[#5A6A85] font-medium">
              <Check className="w-4 h-4 text-[#13DEB9]" /> Direct off-take for concrete curing line
            </div>
          </div>
        </FadeUp>

        {/* Middle Column: Match Engine Matrix */}
        <ScaleIn className="lg:col-span-4 flex">
          <div className="bg-[#2A3547] text-white p-6 rounded-2xl border border-[#34445c] shadow-lg flex flex-col justify-between w-full text-center relative overflow-hidden space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center gap-2 py-1 px-3.5 bg-white/10 text-[#13DEB9] border border-white/15 rounded-full mx-auto">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider font-bold">Match Score Matrix</span>
              </div>

              <div>
                <div className="text-5xl font-bold tracking-tight text-white">
                  94.5<span className="text-2xl text-[#13DEB9]"> / 100</span>
                </div>
                <span className="text-[11px] font-bold text-[#13DEB9] uppercase tracking-wider block mt-1">
                  HIGH PURITY STREAM COMPATIBILITY
                </span>
              </div>

              {/* Vector Breakdown */}
              <div className="space-y-2 text-left pt-4 border-t border-white/15">
                {matchMetrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[#949C96] truncate max-w-[210px]">{m.label}</span>
                    <span className="text-[#13DEB9] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {m.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Generate Off-Take Proposal</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ScaleIn>

        {/* Right Column: Emitter Supply Match */}
        <FadeUp className="lg:col-span-4 flex">
          <div className="bg-white text-[#2A3547] p-6 rounded-2xl border border-[#E5EAEF] shadow-xs flex flex-col justify-between w-full space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5EAEF] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E8F9F5] text-[#13DEB9] border border-[#13DEB9]/20 px-2.5 py-1 rounded-md">
                  EMITTER STREAM
                </span>
                <span className="text-xs font-bold text-[#5A6A85]">LST-1042</span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#2A3547]">TerraCem Industries</h4>
                <p className="text-xs font-semibold text-[#13DEB9]">Ahmedabad Cement Complex</p>
              </div>

              <div className="space-y-2.5 text-xs font-medium bg-[#F6F9FC] p-4 rounded-xl border border-[#E5EAEF]">
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Actual Purity:</span>
                  <span className="text-[#13DEB9] font-bold">99.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Available Volume:</span>
                  <span className="text-[#2A3547] font-bold">1,250 t/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Transit Distance:</span>
                  <span className="text-[#2A3547] font-bold">112.5 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Off-Take Price:</span>
                  <span className="text-[#5D87FF] font-bold">₹4,800/t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6A85]">Supply State:</span>
                  <span className="text-[#2A3547] font-bold">Liquid CO₂</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5EAEF] flex items-center gap-2 text-xs text-[#5A6A85] font-medium">
              <Check className="w-4 h-4 text-[#13DEB9]" /> Stack telematics synced 12 minutes ago
            </div>
          </div>
        </FadeUp>

      </div>
    </section>
  );
};
