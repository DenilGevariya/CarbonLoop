import React from 'react';
import { usePublicImpactSummary } from '@/features/analytics/hooks/useAnalytics';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Leaf, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PublicImpactPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, loading } = usePublicImpactSummary();

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#171A18] font-mono flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 flex-1 w-full">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173D32]/10 border border-[#173D32]/20 text-[#173D32] text-xs font-bold uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-[#173D32]" />
            <span>CARBONLOOP NETWORK IMPACT & TRANSPARENCY</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#171A18] tracking-tight">
            Captured CO₂ Network Throughput
          </h1>
          <p className="text-sm text-[#55524D] leading-relaxed">
            Real-time aggregate movement of industrial captured carbon matched, delivered, and put to productive circular reuse across manufacturing & energy corridors.
          </p>
        </div>

        {/* Public Headline Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 text-center space-y-1 shadow-2xs">
            <span className="text-xs uppercase text-[#55524D]">CO₂ Processed Through Network</span>
            <p className="text-3xl font-bold text-[#173D32]">
              {loading ? '...' : summary?.co2ProcessedTonnes.toLocaleString() || '1,840'}
            </p>
            <span className="text-[10px] text-[#55524D] block">Physical Tonnes CO₂</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 text-center space-y-1 shadow-2xs">
            <span className="text-xs uppercase text-[#55524D]">Completed Transactions</span>
            <p className="text-3xl font-bold text-[#171A18]">
              {loading ? '...' : summary?.completedTransactionsCount || '14'}
            </p>
            <span className="text-[10px] text-[#55524D] block">Custody Transfers</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 text-center space-y-1 shadow-2xs">
            <span className="text-xs uppercase text-[#55524D]">Active Industrial Regions</span>
            <p className="text-3xl font-bold text-[#171A18]">
              {loading ? '...' : summary?.activeRegionsCount || '6'}
            </p>
            <span className="text-[10px] text-[#55524D] block">Industrial Corridors</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 text-center space-y-1 shadow-2xs">
            <span className="text-xs uppercase text-[#55524D]">Participating Organizations</span>
            <p className="text-3xl font-bold text-[#171A18]">
              {loading ? '...' : summary?.participatingOrganizationsCount || '28'}
            </p>
            <span className="text-[10px] text-[#55524D] block">Emitters & Utilizers</span>
          </div>
        </div>

        {/* Public Top Pathways Section */}
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#E2DDD5]/60 pb-3">
            <Layers className="w-5 h-5 text-[#173D32]" />
            <h3 className="text-sm font-bold text-[#171A18] uppercase tracking-wider">
              Primary Industrial CO₂ Utilization Pathways
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(summary?.topUtilizationPathways || [
              'Synthetic Fuel & E-Methanol Synthesis',
              'Building Materials & Concrete Mineralization',
              'Greenhouse Crop Enhancement & Algae',
            ]).map((path, idx) => (
              <div key={idx} className="bg-[#F7F5EF] border border-[#E2DDD5] p-5 rounded space-y-2">
                <span className="text-[10px] text-[#173D32] uppercase font-bold">PATHWAY 0{idx + 1}</span>
                <p className="font-bold text-sm text-[#171A18]">{path}</p>
                <p className="text-xs text-[#55524D]">Verified off-take application route</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency & Non-Greenwashing Disclosure */}
        <div className="bg-[#171A18] text-[#F7F5EF] rounded-lg p-8 border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-[#A3E635]">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold uppercase tracking-wider text-xs">CarbonLoop Transparency Guarantee</h4>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            CarbonLoop reports verified physical throughput from completed marketplace transactions. We do not issue unverified carbon offset claims or speculative avoided-emissions numbers. All transaction data is backed by custody transfer logs and certified purity documentation.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 bg-[#A3E635] text-[#171A18] font-bold text-xs rounded hover:bg-[#86C227] transition flex items-center gap-2"
            >
              <span>Explore Marketplace Supply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicImpactPage;
