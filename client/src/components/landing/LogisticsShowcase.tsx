import React from 'react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Truck, Shield, Compass, Navigation, ArrowRight } from 'lucide-react';
import { INDUSTRIAL_IMAGES } from '@/lib/images';
import { FadeUp, ScaleIn } from '@/animations';

export const LogisticsShowcase: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#F7F5EF] text-[#171A18] relative border-t border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <SectionHeading
          eyebrow="Logistics Infrastructure & Dispatch"
          eyebrowIcon={Compass}
          title="Optimized freight &"
          highlightTitle="landed cost transparency."
          description="Integrated ISO-tank dispatch and pipeline telematics continuously track transit temperature, pressure stability, and exact landed economics."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Logistics Dispatch Unit */}
          <ScaleIn className="lg:col-span-8 flex">
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] flex flex-col justify-between w-full overflow-hidden">
              
              {/* Photo & Route Header */}
              <div className="relative h-64 overflow-hidden border-b border-[#E2DDD5]">
                <img
                  src={INDUSTRIAL_IMAGES.isoTanker}
                  alt="ISO Tanker Logistics Fleet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171A18]/90 via-[#171A18]/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-[#173D32] text-white font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-wider flex items-center gap-2">
                    <Truck className="size-3.5" /> DISPATCH #SHP-9904 (ISO-TANKER)
                  </span>
                  <span className="bg-[#EBE7DF] text-[#171A18] font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-wider border border-[#DCD6C9]">
                    TELEMETRY ACTIVE
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-mono text-[#A3B899] uppercase tracking-widest block">
                    TRANSIT CORRIDOR
                  </span>
                  <h4 className="text-xl font-bold font-mono">
                    AHMEDABAD CEMENT HUB ➔ VADODARA MINERALIZATION PLANT
                  </h4>
                </div>
              </div>

              {/* Node-to-Node Waypoints */}
              <div className="p-6 bg-[#EBE7DF]/80 border-b border-[#E2DDD5] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[#173D32] text-white flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#5C6560] uppercase block">ORIGIN STACK</span>
                    <span className="text-sm font-bold text-[#171A18]">TerraCem Ahmedabad</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center py-2 px-3 bg-[#FAF8F5] border border-[#DCD6C9]">
                  <span className="text-[10px] font-mono text-[#173D32] font-bold uppercase flex items-center gap-1">
                    <Navigation className="size-3" /> 112.5 KM DISTANCE
                  </span>
                  <span className="text-xs font-mono text-[#5C6560] mt-0.5">EST. TRANSIT: 2H 40M</span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#5C6560] uppercase block">DESTINATION PLANT</span>
                    <span className="text-sm font-bold text-[#171A18]">GreenForge Vadodara</span>
                  </div>
                  <div className="size-10 bg-[#3C6E5C] text-white flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                </div>

              </div>

              {/* Landed Economic Breakdown */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-[#FAF8F5]">
                <div className="p-3 bg-[#EBE7DF]/60 border border-[#DCD6C9]">
                  <span className="text-[10px] text-[#5C6560] block uppercase">BASE STREAM PRICE</span>
                  <span className="text-sm font-bold text-[#171A18]">₹4,800 / ton</span>
                </div>
                <div className="p-3 bg-[#EBE7DF]/60 border border-[#DCD6C9]">
                  <span className="text-[10px] text-[#5C6560] block uppercase">FREIGHT & HAULAGE</span>
                  <span className="text-sm font-bold text-[#173D32]">₹420 / ton</span>
                </div>
                <div className="p-3 bg-[#EBE7DF]/60 border border-[#DCD6C9]">
                  <span className="text-[10px] text-[#5C6560] block uppercase">PLATFORM CLEARING</span>
                  <span className="text-sm font-bold text-[#171A18]">₹80 / ton</span>
                </div>
                <div className="p-3 bg-[#173D32] text-white border border-[#173D32]">
                  <span className="text-[10px] text-[#A3B899] block font-bold uppercase">LANDED COST</span>
                  <span className="text-sm font-black">₹5,300 / ton</span>
                </div>
              </div>

            </div>
          </ScaleIn>

          {/* Telematics & Compliance Panel */}
          <FadeUp className="lg:col-span-4 flex">
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] p-6 flex flex-col justify-between w-full">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
                  <h4 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                    <Shield className="size-4 text-[#173D32]" /> IoT Cryogenic Telematics
                  </h4>
                  <span className="size-2 bg-[#173D32] rounded-full animate-ping" />
                </div>

                <p className="text-xs text-[#5C6560] font-serif leading-relaxed">
                  Continuous sensor integration monitors thermal degradation, pressure release, and GPS position every 30 seconds throughout transit.
                </p>

                {/* Telematics Indicators */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-[#EBE7DF]/80 border border-[#DCD6C9] flex justify-between items-center">
                    <span className="text-[#5C6560]">TANK PRESSURE</span>
                    <span className="font-bold text-[#171A18]">22.4 BAR (STABLE)</span>
                  </div>
                  <div className="p-3 bg-[#EBE7DF]/80 border border-[#DCD6C9] flex justify-between items-center">
                    <span className="text-[#5C6560]">INTERNAL TEMP</span>
                    <span className="font-bold text-[#173D32]">-28.5 °C (LIQUID)</span>
                  </div>
                  <div className="p-3 bg-[#EBE7DF]/80 border border-[#DCD6C9] flex justify-between items-center">
                    <span className="text-[#5C6560]">HAZMAT REGISTRATION</span>
                    <span className="font-bold text-[#171A18]">GUJ-HAZ-2026</span>
                  </div>
                  <div className="p-3 bg-[#EBE7DF]/80 border border-[#DCD6C9] flex justify-between items-center">
                    <span className="text-[#5C6560]">GPS TELEMETRY</span>
                    <span className="font-bold text-[#173D32]">LIVE SYNC</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2DDD5]">
                <a
                  href="/auth/register"
                  className="w-full bg-[#173D32] hover:bg-[#255244] text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-colors border border-[#173D32]"
                >
                  Track Logistics Fleets <ArrowRight className="size-3" />
                </a>
              </div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  );
};
