import { AnalyticsRepository } from './analytics.repository';
import { Timeframe, AnalyticsQueryFilters, ImpactAnalyticsReport } from './analytics.types';
import { parseTimeframeToDates, METHODOLOGY_DISCLAIMER } from './analytics.constants';
import { generateNetworkObservations } from './analytics.insights';

export class AnalyticsService {
  private repo = new AnalyticsRepository();

  async getOverview(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getOverviewKPIs(fromISO, toISO, filters.organizationId);
  }

  async getFunnel(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getCarbonFlowFunnel(fromISO, toISO, filters.organizationId);
  }

  async getSupply(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getSupplyAnalytics(fromISO, toISO, filters.organizationId);
  }

  async getDemand(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getDemandAnalytics(fromISO, toISO, filters.organizationId);
  }

  async getMatching(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getMatchingAnalytics(fromISO, toISO, filters.organizationId);
  }

  async getLogistics(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getLogisticsAnalytics(fromISO, toISO, filters.organizationId);
  }

  async getRegions(organizationId?: string) {
    return this.repo.getRegionalBalances(organizationId);
  }

  async getObservations(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    const [regions, supply, demand, logistics] = await Promise.all([
      this.repo.getRegionalBalances(filters.organizationId),
      this.repo.getSupplyAnalytics(fromISO, toISO, filters.organizationId),
      this.repo.getDemandAnalytics(fromISO, toISO, filters.organizationId),
      this.repo.getLogisticsAnalytics(fromISO, toISO, filters.organizationId),
    ]);

    return generateNetworkObservations(regions, supply, demand, logistics);
  }

  async getImpactReport(filters: AnalyticsQueryFilters): Promise<ImpactAnalyticsReport> {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    const [funnel, demand, logistics, overview] = await Promise.all([
      this.repo.getCarbonFlowFunnel(fromISO, toISO, filters.organizationId),
      this.repo.getDemandAnalytics(fromISO, toISO, filters.organizationId),
      this.repo.getLogisticsAnalytics(fromISO, toISO, filters.organizationId),
      this.repo.getOverviewKPIs(fromISO, toISO, filters.organizationId),
    ]);

    const pathways = demand.utilizationBreakdown.map((u) => ({
      pathway: u.pathway,
      tonnes: u.requestedTonnes,
      sharePercent: u.percentage,
    }));

    return {
      headlineMetrics: {
        co2ReusedTonnes: funnel.totalReusedTonnes,
        co2DeliveredTonnes: overview.flow.deliveredTonnes,
        activeCorridorsCount: 6,
        verifiedFacilitiesCount: overview.stock.activeFacilitiesCount,
        indicativeTransportEmissionsKg: logistics.estimatedTransportEmissionsKg,
      },
      funnel,
      utilizationPathways: pathways,
      methodology: {
        title: 'CarbonLoop Platform Throughput Methodology (v1.0)',
        version: '1.0.0-PROD',
        disclaimer: METHODOLOGY_DISCLAIMER,
        metricDefinitions: [
          {
            metric: 'CO₂ Reused',
            definition: 'Sum of confirmed physical delivered quantities that have completed custody transfer.',
            sourceTable: 'shipments / orders',
          },
          {
            metric: 'CO₂ Listed',
            definition: 'Sum of available tonnes listed by verified capture facilities during selected period.',
            sourceTable: 'co2_listings',
          },
          {
            metric: 'Estimated Transport Emissions',
            definition: 'Distance (km) × Quantity (t) × Mode Factor. Indicative development assumption.',
            sourceTable: 'shipments × TRANSPORT_EMISSION_FACTORS',
          },
        ],
      },
    };
  }

  async getPublicImpact() {
    return this.repo.getPublicImpactSummary();
  }

  async getPriceByPurity(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getPriceByPurity(fromISO, toISO, filters.organizationId);
  }

  async getTopPricePoints(filters: AnalyticsQueryFilters) {
    const { fromISO, toISO } = parseTimeframeToDates(filters.timeframe, filters.from, filters.to);
    return this.repo.getTopPricePoints(fromISO, toISO, filters.organizationId);
  }
}
