import React, { useState } from 'react';
import { useImpactAnalyticsReport } from '@/features/analytics/hooks/useAnalytics';
import type { Timeframe } from '@/features/analytics/api/analyticsApi';
import { CarbonFlowFunnel } from '@/features/analytics/components/CarbonFlowFunnel';
import { MethodologyNote } from '@/features/analytics/components/MethodologyNote';
import { Layers, ArrowLeft, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImpactReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const { report, loading } = useImpactAnalyticsReport(timeframe);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-[#F6F9FC] p-8 flex items-center justify-center text-xs text-[#5A6A85]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#5D87FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Generating Carbon Impact Intelligence Report...</p>
        </div>
      </div>
    );
  }

  const { headlineMetrics, funnel, utilizationPathways, methodology } = report;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-[#2A3547]">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/analytics')}
          className="inline-flex items-center gap-1.5 text-xs text-[#5A6A85] hover:text-[#5D87FF] font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#5D87FF] bg-[#ECF2FF] border border-[#5D87FF]/20 px-3 py-1 rounded-full font-bold uppercase">
            {methodology.version}
          </span>
        </div>
      </div>

      {/* Editorial Executive Hero Report Cover */}
      <div className="bg-[#1A2537] text-white rounded-xl p-8 md:p-10 border border-[#2A3547] shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase text-[#49BEFF] font-bold tracking-widest mb-1">
              <Award className="w-4 h-4" />
              <span>CARBONLOOP INDUSTRIAL NETWORK REPORT</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Carbon Impact & Utilization Intelligence</h1>
            <p className="text-xs text-[#5A6A85]/80 max-w-2xl mt-1 leading-relaxed">
              Audited operational throughput metrics detailing captured industrial CO₂ volume matched, contracted, transported, and verified for productive circular reuse.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['30d', '90d', '12m', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition cursor-pointer ${
                  timeframe === tf ? 'bg-[#5D87FF] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Headline Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div className="bg-white/5 p-5 rounded-lg border border-white/10">
            <span className="text-[11px] uppercase text-white/60 block mb-1">Primary Impact Metric</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#13DEB9]">{headlineMetrics.co2ReusedTonnes.toLocaleString()}</span>
              <span className="text-xs text-white/60">t CO₂</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1">Reused in completed transactions</p>
          </div>

          <div className="bg-white/5 p-5 rounded-lg border border-white/10">
            <span className="text-[11px] uppercase text-white/60 block mb-1">Physical Delivery Volume</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{headlineMetrics.co2DeliveredTonnes.toLocaleString()}</span>
              <span className="text-xs text-white/60">t CO₂</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1">Custody transfer completed</p>
          </div>

          <div className="bg-white/5 p-5 rounded-lg border border-white/10">
            <span className="text-[11px] uppercase text-white/60 block mb-1">Active Corridors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#49BEFF]">{headlineMetrics.activeCorridorsCount}</span>
              <span className="text-xs text-white/60">Regions</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1">
              {headlineMetrics.verifiedFacilitiesCount} verified facilities
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-lg border border-white/10">
            <span className="text-[11px] uppercase text-white/60 block mb-1">Indicative Freight Footprint</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#FFAE1F]">{headlineMetrics.indicativeTransportEmissionsKg.toLocaleString()}</span>
              <span className="text-xs text-white/60">kg CO₂e</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1">Transport emissions estimate</p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <CarbonFlowFunnel funnel={funnel} />

      {/* Utilization Pathways Report Breakdown */}
      <div className="bg-white border border-[#E5EAEF] rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-[#2A3547] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5D87FF]" />
          <span>Productive Utilization Pathways</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {utilizationPathways.map((path) => (
            <div key={path.pathway} className="bg-[#F6F9FC] border border-[#E5EAEF] p-4 rounded-lg space-y-2">
              <span className="font-bold text-[#2A3547] block uppercase text-xs">{path.pathway}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#5D87FF]">{path.tonnes.toLocaleString()} t</span>
                <span className="text-xs text-[#5A6A85]">{path.sharePercent}% Share</span>
              </div>
              <div className="w-full bg-[#E5EAEF] h-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#5D87FF]" style={{ width: `${path.sharePercent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Non-Greenwashing Methodology & Audit Disclaimer */}
      <MethodologyNote />
    </div>
  );
};

export default ImpactReportPage;
