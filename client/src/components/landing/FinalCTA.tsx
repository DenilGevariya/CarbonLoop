import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FadeUp } from '@/animations';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { ArrowRight, PlusCircle } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 md:px-8 bg-[#FAF8F5] text-[#171A18] relative border-t border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto">
        <FadeUp>
          <div className="bg-[#173D32] text-white p-10 md:p-16 border border-[#173D32] relative overflow-hidden flex flex-col items-start justify-between gap-10">
            
            {/* Background image overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
              <img
                src={INDUSTRIAL_IMAGES.steelPlant}
                alt="Industrial Facility"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-4 max-w-3xl relative z-10">
              <span className="font-mono text-xs text-[#A3B899] uppercase tracking-widest font-semibold">
                COMMERCIAL CARBON EXCHANGE & INFRASTRUCTURE
              </span>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
                CLOSE THE INDUSTRIAL <span className="text-[#A3B899] font-normal italic">CARBON LOOP.</span>
              </h2>

              <p className="text-base md:text-xl font-serif text-[#C5D3C1] leading-relaxed">
                Transform captured industrial CO₂ from a regulatory compliance cost into a verified, high-purity commercial commodity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full sm:w-auto">
              <Button
                size="lg"
                onClick={() => navigate('/marketplace')}
                className="bg-[#FAF8F5] hover:bg-white text-[#173D32] font-bold text-sm px-8 py-6 rounded-none flex items-center justify-center gap-2 border border-white w-full sm:w-auto"
              >
                Browse Active Marketplace <ArrowRight className="size-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth/register')}
                className="bg-transparent hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider px-8 py-6 rounded-none border border-white/30 w-full sm:w-auto"
              >
                <PlusCircle className="size-4 mr-2 text-[#A3B899]" />
                Onboard Facility Stream
              </Button>
            </div>

          </div>
        </FadeUp>
      </div>
    </section>
  );
};
