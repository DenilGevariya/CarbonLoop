import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INDUSTRIAL_IMAGES } from '@/lib/images';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#F7F5EF] dark:bg-[#121513] border-b border-[#E2DDD5] dark:border-white/10 overflow-hidden">
      {/* Subtle industrial grid overlay */}
      <div className="absolute inset-0 industrial-grid opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Editorial Content (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Small Eyebrow Annotation */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#173D32] dark:bg-[#3C6E5C]" />
              <span className="font-mono text-xs tracking-widest text-[#5C625E] dark:text-[#949C96] uppercase">
                CARBON INFRASTRUCTURE NETWORK
              </span>
              <span className="text-[#E2DDD5] dark:text-white/20">|</span>
              <span className="font-mono text-[11px] text-[#3C6E5C] dark:text-[#8BA89C]">
                VERIFIED CO₂ EXCHANGE
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-[#171A18] dark:text-[#F2F0EB] leading-[1.1] mb-6">
              Making captured carbon <br className="hidden sm:inline" />
              <span className="text-[#173D32] dark:text-[#5C8A79] underline decoration-[#E2DDD5] dark:decoration-white/20 underline-offset-8">
                commercially useful.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#5C625E] dark:text-[#949C96] leading-relaxed max-w-2xl mb-8">
              A B2B industrial marketplace matching captured CO₂ emitters with commercial utilizers. 
              Standardized purities, verified logistics, and transparent delivered pricing across regional industrial clusters.
            </p>

            {/* Primary Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-[#173D32] hover:bg-[#133027] text-[#F7F5EF] font-sans font-semibold text-sm px-6 py-3.5 rounded-sm border border-[#173D32] transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="bg-[#EFECE4] hover:bg-[#EAE6DF] text-[#171A18] dark:bg-white/5 dark:hover:bg-white/10 dark:text-[#F2F0EB] border-[#E2DDD5] dark:border-white/15 font-mono text-xs tracking-wider uppercase px-6 py-3.5 rounded-sm"
              >
                List CO₂ Supply
              </Button>
            </div>

            {/* Infrastructure Key Specs */}
            <div className="pt-6 border-t border-[#E2DDD5] dark:border-white/10 grid grid-cols-3 gap-4">
              <div>
                <div className="font-mono text-lg font-bold text-[#171A18] dark:text-[#F2F0EB]">
                  24,820 t
                </div>
                <div className="font-mono text-[11px] text-[#5C625E] uppercase tracking-wider">
                  Active Supply
                </div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-[#173D32] dark:text-[#5C8A79]">
                  99.5%
                </div>
                <div className="font-mono text-[11px] text-[#5C625E] uppercase tracking-wider">
                  Max Purity
                </div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-[#171A18] dark:text-[#F2F0EB]">
                  112 km
                </div>
                <div className="font-mono text-[11px] text-[#5C625E] uppercase tracking-wider">
                  Avg Transit Radius
                </div>
              </div>
            </div>
          </div>

          {/* Right Large Industrial Photography (5 Columns) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-sm overflow-hidden border border-[#E2DDD5] dark:border-white/15 bg-[#EFECE4] dark:bg-[#1A1E1B] shadow-md group">
              <img
                src={INDUSTRIAL_IMAGES.heroFacility}
                alt="Ahmedabad Carbon Capture Plant Infrastructure"
                className="w-full h-[420px] sm:h-[480px] object-cover object-center filter grayscale-[15%] contrast-[105%] transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Data Annotation Overlay Badge Top Right */}
              <div className="absolute top-4 right-4 bg-[#171A18]/90 backdrop-blur-sm text-[#F7F5EF] px-3 py-1.5 rounded-sm border border-white/15 font-mono text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3C6E5C] animate-pulse" />
                <span>ONLINE · 1,250 t/month</span>
              </div>

              {/* Data Annotation Overlay Badge Bottom Left */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#F7F5EF]/95 dark:bg-[#121513]/95 backdrop-blur-sm border border-[#E2DDD5] dark:border-white/15 p-3 rounded-sm">
                <div className="flex items-center justify-between font-mono text-xs text-[#171A18] dark:text-[#F2F0EB] mb-1">
                  <span className="font-semibold uppercase tracking-wider">FAC-TC-001</span>
                  <span className="text-[#3C6E5C] font-bold">99.50% Purity</span>
                </div>
                <div className="text-[11px] text-[#5C625E] font-sans flex items-center justify-between">
                  <span>Ahmedabad Mega Cement Plant</span>
                  <span className="font-mono text-[10px]">₹4,800 / tonne</span>
                </div>
              </div>
            </div>

            {/* Editorial Image Caption */}
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#5C625E] px-1">
              <span>FIG 1.0 — POST-COMBUSTION AMINE CAPTURE UNIT</span>
              <span>GUJARAT, INDIA</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
