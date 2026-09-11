import { INDUSTRIAL_IMAGES } from '@/lib/images';

export const ProblemSection = () => {
  return (
    <section id="problem" className="py-20 md:py-28 bg-[#F7F5EF] dark:bg-[#121513] border-b border-[#E2DDD5] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          <div className="lg:col-span-5">
            <div className="font-mono text-xs tracking-widest text-[#5C625E] dark:text-[#949C96] uppercase mb-3">
              01 / THE INDUSTRIAL CHALLENGE
            </div>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold text-[#171A18] dark:text-[#F2F0EB] tracking-tight leading-tight">
              Carbon capture is only <br />
              <span className="text-[#173D32] dark:text-[#5C8A79]">the beginning.</span>
            </h2>
          </div>

          <div className="lg:col-span-7">
            <p className="text-base text-[#5C625E] dark:text-[#949C96] leading-relaxed mb-4">
              Capturing CO₂ at an industrial chimney or cement kiln solves only half the equation. 
              Without an active commercial buyer, compatible purity specifications, verified logistics, 
              and acceptable freight economics, captured carbon remains stranded on site.
            </p>
            <p className="text-base text-[#5C625E] dark:text-[#949C96] leading-relaxed">
              CarbonLoop bridges industrial emitters with downstream utilizers—turning captured emissions into a valuable commercial raw material.
            </p>
          </div>
        </div>

        {/* Real Industrial Image Panel */}
        <div className="mb-14 relative rounded-sm overflow-hidden border border-[#E2DDD5] dark:border-white/15 bg-[#EFECE4] dark:bg-[#1A1E1B]">
          <img
            src={INDUSTRIAL_IMAGES.steelPlant}
            alt="Steel Manufacturing Plant Flue Gas Capture"
            className="w-full h-[320px] sm:h-[420px] object-cover filter grayscale-[10%] contrast-[105%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171A18]/80 via-transparent to-transparent flex items-end p-6">
            <div className="text-[#F7F5EF] font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
              <span>HAZIRA STEEL & POWER HUB — SURAT, GUJARAT</span>
              <span className="text-[#8BA89C]">3,400 TONNES / MONTH PROCESS FLUE STREAM</span>
            </div>
          </div>
        </div>

        {/* Horizontal Process Chain: CAPTURE -> SPECIFY -> MATCH -> MOVE -> USE */}
        <div className="pt-8 border-t border-[#E2DDD5] dark:border-white/10">
          <div className="font-mono text-xs text-[#5C625E] uppercase tracking-widest mb-6">
            VALUE CHAIN INTEGRATION
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { step: '01', label: 'CAPTURE', desc: 'Flue gas or direct air capture at emitter plant' },
              { step: '02', label: 'SPECIFY', desc: 'Certify purity %, pressure, temperature & volume' },
              { step: '03', label: 'MATCH', desc: 'Algorithmic compatibility matching with buyers' },
              { step: '04', label: 'MOVE', desc: 'Pressurized ISO tanker freight & route tracking' },
              { step: '05', label: 'USE', desc: 'Feedstock conversion for concrete, e-fuels & bio' },
            ].map((item, idx) => (
              <div key={item.step} className="p-4 bg-[#FFFFFF] dark:bg-[#1A1E1B] border border-[#E2DDD5] dark:border-white/10 rounded-sm relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#173D32] dark:text-[#5C8A79]">{item.step}</span>
                  {idx < 4 && <span className="hidden md:inline font-mono text-xs text-[#5C625E]">→</span>}
                </div>
                <div className="font-mono text-xs font-bold text-[#171A18] dark:text-[#F2F0EB] tracking-wider mb-1">
                  {item.label}
                </div>
                <div className="text-[11px] text-[#5C625E] leading-snug">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
