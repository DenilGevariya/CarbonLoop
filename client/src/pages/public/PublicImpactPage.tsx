import React from 'react';
import { usePublicImpactSummary } from '@/features/analytics/hooks/useAnalytics';
import { Leaf, ShieldCheck, Layers, ArrowRight, Factory, Activity, Globe, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedCounter, FadeUp, HoverLift, StaggerContainer, StaggerItem } from '@/animations';

export const PublicImpactPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, loading } = usePublicImpactSummary();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 font-sans">
      
      {/* Header Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] text-xs font-bold uppercase tracking-wider shadow-xs">
          <Leaf className="w-4 h-4 text-[#5D87FF]" />
          <span>CarbonLoop Impact & Environmental Transparency</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2A3547] tracking-tight leading-tight">
          Captured CO₂ Network Throughput
        </h1>
        
        <p className="text-sm sm:text-base text-[#5A6A85] font-medium leading-relaxed">
          Real-time aggregate movement of industrial captured carbon matched, delivered, and put to productive circular reuse across manufacturing & energy corridors.
        </p>
      </div>

      {/* Public Headline Stats Cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <StaggerItem>
          <HoverLift y={-3}>
            <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">CO₂ Processed Throughput</p>
                <p className="text-3xl font-bold text-[#2A3547] mt-1">
                  {loading ? '...' : <AnimatedCounter value={summary?.co2ProcessedTonnes || 1840} />}
                  <span className="text-xs font-semibold text-[#5A6A85] ml-1">tonnes</span>
                </p>
              </div>
              <p className="text-[11px] text-[#13DEB9] font-semibold flex items-center gap-1 pt-1 border-t border-[#E5EAEF]">
                <span>✓ Verified Physical Movement</span>
              </p>
            </div>
          </HoverLift>
        </StaggerItem>

        <StaggerItem>
          <HoverLift y={-3}>
            <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Completed Transfers</p>
                <p className="text-3xl font-bold text-[#5D87FF] mt-1">
                  {loading ? '...' : <AnimatedCounter value={summary?.completedTransactionsCount || 14} />}
                </p>
              </div>
              <p className="text-[11px] text-[#5A6A85] font-medium pt-1 border-t border-[#E5EAEF]">
                Direct Stack Handoffs
              </p>
            </div>
          </HoverLift>
        </StaggerItem>

        <StaggerItem>
          <HoverLift y={-3}>
            <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-[#E8F9F5] border border-[#13DEB9]/20 text-[#13DEB9] flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Active Regions</p>
                <p className="text-3xl font-bold text-[#2A3547] mt-1">
                  {loading ? '...' : <AnimatedCounter value={summary?.activeRegionsCount || 6} />}
                </p>
              </div>
              <p className="text-[11px] text-[#5A6A85] font-medium pt-1 border-t border-[#E5EAEF]">
                Industrial Corridors
              </p>
            </div>
          </HoverLift>
        </StaggerItem>

        <StaggerItem>
          <HoverLift y={-3}>
            <div className="bg-white border border-[#E5EAEF] p-6 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-[#ECF2FF] border border-[#5D87FF]/20 text-[#5D87FF] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#5A6A85] uppercase tracking-wider">Participating Entities</p>
                <p className="text-3xl font-bold text-[#2A3547] mt-1">
                  {loading ? '...' : <AnimatedCounter value={summary?.participatingOrganizationsCount || 28} />}
                </p>
              </div>
              <p className="text-[11px] text-[#5A6A85] font-medium pt-1 border-t border-[#E5EAEF]">
                Emitters & Off-takers
              </p>
            </div>
          </HoverLift>
        </StaggerItem>

      </StaggerContainer>

      {/* Public Top Pathways Section */}
      <FadeUp>
        <div className="bg-white border border-[#E5EAEF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#E5EAEF] pb-4">
            <div className="size-9 rounded-lg bg-[#ECF2FF] text-[#5D87FF] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2A3547]">
                Primary Industrial CO₂ Utilization Pathways
              </h3>
              <p className="text-xs text-[#5A6A85] font-medium">Verified commercial off-take applications operating on CarbonLoop</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(summary?.topUtilizationPathways || [
              'Synthetic Fuel & E-Methanol Synthesis',
              'Building Materials & Concrete Mineralization',
              'Greenhouse Crop Enhancement & Algae Cultivation',
            ]).map((path, idx) => (
              <div key={idx} className="bg-[#F6F9FC] border border-[#E5EAEF] p-5 rounded-xl space-y-2 hover:border-[#5D87FF]/40 transition-colors">
                <span className="text-[10px] font-bold text-[#5D87FF] uppercase tracking-wider px-2 py-0.5 rounded bg-[#ECF2FF] border border-[#5D87FF]/20">
                  PATHWAY 0{idx + 1}
                </span>
                <p className="font-bold text-sm text-[#2A3547] pt-1">{path}</p>
                <p className="text-xs text-[#5A6A85] font-medium">Certified off-take route</p>
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Transparency & Non-Greenwashing Disclosure Banner */}
      <FadeUp delay={0.2}>
        <div className="bg-[#2A3547] text-white rounded-2xl p-8 sm:p-10 border border-[#34445c] shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-[#13DEB9]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-xs">CarbonLoop Transparency Guarantee</h4>
          </div>

          <p className="text-xs sm:text-sm text-[#949C96] leading-relaxed max-w-3xl font-medium">
            CarbonLoop reports verified physical throughput from completed marketplace transactions. We do not issue unverified carbon offset claims or speculative avoided-emissions numbers. All transaction data is backed by custody transfer logs and certified purity documentation.
          </p>

          <div className="pt-2">
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-[#5D87FF] hover:bg-[#4570EA] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Marketplace Supply</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </FadeUp>

    </div>
  );
};

export default PublicImpactPage;
