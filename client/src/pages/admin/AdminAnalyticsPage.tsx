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
import { BarChart3, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  const { overview, loading: overviewLoading } = useAnalyticsOverview(timeframe);
  const { funnel } = useCarbonFlowFunnel(timeframe);
  const { demand } = useDemandAnalytics(timeframe);
  const { matching } = useMatchingAnalytics(timeframe);
  const { logistics } = useLogisticsAnalytics(timeframe);
  const { regions } = useRegionalBalances();
  const { observations } = useNetworkObservations(timeframe);

  const handleExportCSV = () => {
    if (!overview) {
      alert('No data available for export.');
      return;
    }
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
    link.setAttribute('download', `admin_carbonloop_analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-[#2A3547]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-[#E5EAEF] rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#5D87FF] text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              ADMIN REPORTS
            </Badge>
            <span className="text-xs font-semibold text-[#5A6A85]">Platform Stock & Flow Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-[#2A3547]">Reports & Platform Analytics</h1>
          <p className="text-xs text-[#5A6A85] mt-0.5">
            Macro-level metrics across supply declarations, demand requirements, pricing trends, and shipment throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-[#F6F9FC] p-1 rounded-lg border border-[#E5EAEF] text-xs">
            {(['7d', '30d', '90d', '12m', 'all'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  timeframe === tf ? 'bg-[#5D87FF] text-white shadow-xs' : 'text-[#5A6A85] hover:text-[#2A3547]'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="bg-white border-[#E5EAEF] text-[#2A3547] hover:bg-[#F6F9FC] text-xs font-semibold rounded-lg"
          >
            <Download className="size-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      {overviewLoading ? (
        <div className="bg-white border border-[#E5EAEF] rounded-xl p-10 text-center text-xs shadow-xs">
          <div className="w-6 h-6 border-2 border-[#5D87FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[#5A6A85]">Loading platform analytics metrics...</p>
        </div>
      ) : !overview ? (
        <div className="bg-white border border-[#E5EAEF] rounded-xl p-10 text-center text-xs shadow-xs">
          <BarChart3 className="size-8 text-[#5A6A85]/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#2A3547]">No data available for this period</p>
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

export default AdminAnalyticsPage;
