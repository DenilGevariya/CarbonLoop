import React from 'react';
import { motion } from 'framer-motion';
import { Factory, Cpu, Flame, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export const CarbonFlow: React.FC = () => {
  return (
    <div className="relative w-full aspect-square md:aspect-[16/10] max-w-4xl mx-auto bg-[#FAF8F5] p-6 md:p-8 border border-[#E2DDD5] overflow-hidden text-[#171A18]">
      
      {/* Title Tag */}
      <div className="relative z-10 flex items-center justify-between mb-6 border-b border-[#E2DDD5] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#173D32] uppercase font-bold">
          <span className="size-2 bg-[#173D32] rounded-full animate-ping" />
          <span>CARBONFLOW TELEMETRY NETWORK</span>
        </div>
        <span className="text-xs text-[#5C6560] font-mono">REAL-TIME STREAM ENGINE</span>
      </div>

      {/* Main Flow Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-4rem)] items-center">
        
        {/* Node 1: Captured CO2 Source */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3 p-4 bg-[#EBE7DF]/80 border border-[#DCD6C9] relative group hover:border-[#173D32] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#173D32] text-white">
              <Factory className="size-5" />
            </div>
            <span className="text-[10px] font-mono bg-[#173D32] text-white px-2 py-0.5 font-bold uppercase">
              CAPTURED STREAM
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171A18]">Ahmedabad Cement Plant</h4>
            <p className="text-xs font-mono text-[#5C6560]">Post-Combustion CO₂</p>
          </div>
          <div className="pt-2 border-t border-[#DCD6C9] flex items-center justify-between text-xs font-mono">
            <span className="text-[#5C6560]">Purity: 99.5%</span>
            <span className="text-[#173D32] font-bold">1,250 t/month</span>
          </div>
        </motion.div>

        {/* Node 2: CarbonLoop Matchmaking Engine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center justify-center p-6 bg-[#173D32] text-white border border-[#173D32] text-center"
        >
          <div className="p-3 bg-white/10 text-white border border-white/20 mb-3">
            <Cpu className="size-7" />
          </div>
          <h4 className="text-base font-bold tracking-tight">CarbonLoop Matcher</h4>
          <p className="text-xs font-serif text-[#C5D3C1] mt-0.5">Multi-Vector Physics Engine</p>
          
          <div className="mt-4 px-3 py-1 bg-[#FAF8F5] text-[#173D32] text-xs font-mono font-bold flex items-center gap-1.5 border border-white">
            <ShieldCheck className="size-3.5" />
            <span>94.5% MATCH SCORE</span>
          </div>
        </motion.div>

        {/* Node 3: Utilization Pathways */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          {/* Pathway A */}
          <div className="p-3.5 bg-[#EBE7DF]/80 border border-[#DCD6C9] hover:border-[#173D32] transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3C6E5C] text-white">
                <Building2 className="size-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171A18]">GreenForge Concrete</h5>
                <p className="text-[10px] font-mono text-[#5C6560]">Mineralization Curing</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-[#173D32]" />
          </div>

          {/* Pathway B */}
          <div className="p-3.5 bg-[#EBE7DF]/80 border border-[#DCD6C9] hover:border-[#173D32] transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#173D32] text-white">
                <Flame className="size-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#171A18]">CarbonArc E-Fuel</h5>
                <p className="text-[10px] font-mono text-[#5C6560]">Catalytic E-Methanol</p>
              </div>
            </div>
            <ArrowRight className="size-4 text-[#173D32]" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};
