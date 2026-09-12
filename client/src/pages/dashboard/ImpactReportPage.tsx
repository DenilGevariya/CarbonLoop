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
      <div className="min-h-screen bg-[#F7F5EF] p-8 flex items-center justify-center font-mono text-xs">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#173D32] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#55524D]">Generating Carbon Impact Intelligence Report...</p>
        </div>
      </div>
    );
  }

  const { headlineMetrics, funnel, utilizationPathways, methodology } = report;

  return (
    <div className="min-h-screen bg-[#F7F5EF] p-6 space-y-8 font-mono">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/analytics')}
          className="inline-flex items-center gap-1.5 text-xs text-[#55524D] hover:text-[#171A18] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#173D32] bg-[#173D32]/10 border border-[#173D32]/20 px-3 py-1 rounded font-bold uppercase">
            {methodology.version}
          </span>
        </div>
      </div>

      {/* Editorial Executive Hero Report Cover */}
      <div className="bg-[#171A18] text-[#F7F5EF] rounded-lg p-8 md:p-10 border border-neutral-800 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase text-[#A3E635] font-bold tracking-widest mb-1">
              <Award className="w-4 h-4" />
              <span>CARBONLOOP INDUSTRIAL NETWORK REPORT</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Carbon Impact & Utilization Intelligence</h1>
            <p className="text-xs text-neutral-400 max-w-2xl mt-1 leading-relaxed">
              Audited operational throughput metrics detailing captured industrial CO₂ volume matched, contracted, transported, and verified for productive circular reuse.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(['30d', '90d', '12m', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition ${
                  timeframe === tf ? 'bg-[#A3E635] text-[#171A18]' : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Headline Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div className="bg-neutral-900/80 p-5 rounded border border-neutral-800">
            <span className="text-[11px] uppercase text-neutral-400 block mb-1">Primary Impact Metric</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#A3E635]">{headlineMetrics.co2ReusedTonnes.toLocaleString()}</span>
              <span className="text-xs text-neutral-400">t CO₂</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Reused in completed transactions</p>
          </div>

          <div className="bg-neutral-900/80 p-5 rounded border border-neutral-800">
            <span className="text-[11px] uppercase text-neutral-400 block mb-1">Physical Delivery Volume</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{headlineMetrics.co2DeliveredTonnes.toLocaleString()}</span>
              <span className="text-xs text-neutral-400">t CO₂</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Custody transfer completed</p>
          </div>

          <div className="bg-neutral-900/80 p-5 rounded border border-neutral-800">
            <span className="text-[11px] uppercase text-neutral-400 block mb-1">Active Corridors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{headlineMetrics.activeCorridorsCount}</span>
              <span className="text-xs text-neutral-400">Regions</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {headlineMetrics.verifiedFacilitiesCount} verified facilities
            </p>
          </div>

          <div className="bg-neutral-900/80 p-5 rounded border border-neutral-800">
            <span className="text-[11px] uppercase text-neutral-400 block mb-1">Indicative Freight Footprint</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400">{headlineMetrics.indicativeTransportEmissionsKg.toLocaleString()}</span>
              <span className="text-xs text-neutral-400">kg CO₂e</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Transport emissions estimate</p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <CarbonFlowFunnel funnel={funnel} />

      {/* Utilization Pathways Report Breakdown */}
      <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#173D32]" />
          <span>Productive Utilization Pathways</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {utilizationPathways.map((path) => (
            <div key={path.pathway} className="bg-[#F7F5EF] border border-[#E2DDD5] p-4 rounded space-y-2">
              <span className="font-bold text-[#171A18] block uppercase text-xs">{path.pathway}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#173D32]">{path.tonnes.toLocaleString()} t</span>
                <span className="text-xs text-[#55524D]">{path.sharePercent}% Share</span>
              </div>
              <div className="w-full bg-[#E2DDD5]/40 h-2 rounded-xs overflow-hidden">
                <div className="h-full bg-[#173D32]" style={{ width: `${path.sharePercent}%` }} />
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
