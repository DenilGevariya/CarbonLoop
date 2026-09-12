import React, { useState } from 'react';
import type { Timeframe } from '@/features/analytics/api/analyticsApi';
import {
  useAnalyticsOverview,
  useCarbonFlowFunnel,
  useDemandAnalytics,
  useMatchingAnalytics,
  useLogisticsAnalytics,
  useRegionalBalances,
  useNetworkObservations,
} from '@/features/analytics/hooks/useAnalytics';
import { KpiStrip } from '@/features/analytics/components/KpiStrip';
import { CarbonFlowFunnel } from '@/features/analytics/components/CarbonFlowFunnel';
import { MatchQualityChart } from '@/features/analytics/components/MatchQualityChart';
import { UtilizationBreakdown } from '@/features/analytics/components/UtilizationBreakdown';
import { RegionalBalanceTable } from '@/features/analytics/components/RegionalBalanceTable';
import { LogisticsPerformance } from '@/features/analytics/components/LogisticsPerformance';
import { NetworkObservations } from '@/features/analytics/components/NetworkObservations';
import { MethodologyNote } from '@/features/analytics/components/MethodologyNote';
import { BarChart3, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  const { overview, loading: overviewLoading } = useAnalyticsOverview(timeframe);
  const { funnel } = useCarbonFlowFunnel(timeframe);
  const { demand } = useDemandAnalytics(timeframe);
  const { matching } = useMatchingAnalytics(timeframe);
  const { logistics } = useLogisticsAnalytics(timeframe);
  const { regions } = useRegionalBalances();
  const { observations } = useNetworkObservations(timeframe);

  const handleExportCSV = () => {
    if (!overview) return;
    const csvContent = `Metric,Value,Unit\n` +
      `Active Supply Stock,${overview.stock.activeSupplyTonnes},Tonnes CO2\n` +
      `Active Demand Stock,${overview.stock.activeDemandTonnes},Tonnes CO2\n` +
      `Listed Flow (Period),${overview.flow.listedTonnes},Tonnes CO2\n` +
      `Ordered Volume (Period),${overview.flow.orderedTonnes},Tonnes CO2\n` +
      `Delivered Volume (Period),${overview.flow.deliveredTonnes},Tonnes CO2\n` +
      `Reused Volume (Period),${overview.flow.reusedTonnes},Tonnes CO2\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `carbonloop_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] p-6 space-y-6 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5] p-6 border border-[#E2DDD5] rounded-lg shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#173D32] font-semibold tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>CARBONLOOP NETWORK ANALYTICS & INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold font-mono text-[#171A18]">Network Analytics Console</h1>
          <p className="text-xs font-mono text-[#55524D] mt-0.5">
            Operational view of supply stock, demand flow, matching distributions, and physical movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[#E2DDD5]/40 p-1 rounded-md border border-[#E2DDD5] text-xs font-mono">
            {(['7d', '30d', '90d', '12m', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  timeframe === tf ? 'bg-[#173D32] text-white shadow-2xs' : 'text-[#55524D] hover:text-[#171A18]'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2DDD5] text-[#171A18] text-xs font-semibold rounded hover:bg-[#E2DDD5]/40 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/dashboard/impact')}
            className="px-3.5 py-1.5 bg-[#173D32] text-white text-xs font-semibold rounded hover:bg-[#173D32]/90 flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Impact Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      {overviewLoading || !overview ? (
        <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-10 text-center text-xs">
          <div className="w-6 h-6 border-2 border-[#173D32] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[#55524D]">Computing network stock & flow aggregations...</p>
        </div>
      ) : (
        <KpiStrip kpis={overview} />
      )}

      {/* Carbon Flow Conversion Funnel */}
      {funnel && <CarbonFlowFunnel funnel={funnel} />}

      {/* Deterministic Network Observations Engine */}
      {observations.length > 0 && <NetworkObservations observations={observations} />}

      {/* Two Column Grid: Demand Utilization & Regional Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {demand && <UtilizationBreakdown demand={demand} />}
        {regions.length > 0 && <RegionalBalanceTable regions={regions} />}
      </div>

      {/* Two Column Grid: Matching Distribution & Logistics Telematics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matching && <MatchQualityChart matching={matching} />}
        {logistics && <LogisticsPerformance logistics={logistics} />}
      </div>

      {/* Carbon Accounting Methodology Disclaimer */}
      <MethodologyNote />
    </div>
  );
};

export default AnalyticsPage;
