import { apiClient } from '@/api/client';

export type Timeframe = '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

export interface StockMetrics {
  activeSupplyTonnes: number;
  activeDemandTonnes: number;
  netSupplyBalanceTonnes: number;
  activeListingsCount: number;
  activeRequirementsCount: number;
  activeShipmentsCount: number;
  activeOrganizationsCount: number;
  activeFacilitiesCount: number;
}

export interface FlowMetrics {
  listedTonnes: number;
  requestedTonnes: number;
  matchedTonnes: number;
  orderedTonnes: number;
  shippedTonnes: number;
  deliveredTonnes: number;
  reusedTonnes: number;
}

export interface NetworkOverviewKPIs {
  stock: StockMetrics;
  flow: FlowMetrics;
  comparison: {
    listedTonnesChangePercent: number | null;
    orderedTonnesChangePercent: number | null;
    deliveredTonnesChangePercent: number | null;
  };
}

export interface CarbonFlowStage {
  stage: 'LISTED' | 'MATCHED' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'REUSED';
  label: string;
  quantityTonnes: number;
  conversionPercent: number;
  funnelSharePercent: number;
}

export interface CarbonFlowFunnel {
  stages: CarbonFlowStage[];
  totalListedTonnes: number;
  totalReusedTonnes: number;
  overallFunnelEfficiencyPercent: number;
}

export interface SupplyAnalytics {
  totalAvailableTonnes: number;
  activeListingsCount: number;
  activeFacilitiesCount: number;
  averagePurityPercentage: number;
  medianPurityPercentage: number;
  averageObservedPricePerTon: number;
  medianObservedPricePerTon: number;
  purityBands: { band: string; listingsCount: number; totalTonnes: number }[];
  priceBands: { band: string; listingsCount: number }[];
  regionalSupply: { region: string; totalTonnes: number; activeListings: number }[];
}

export interface DemandAnalytics {
  totalRequestedTonnes: number;
  outstandingDemandTonnes: number;
  activeRequirementsCount: number;
  averageMinPurity: number;
  averageBudgetCeiling: number;
  utilizationBreakdown: {
    pathway: string;
    requestedTonnes: number;
    percentage: number;
    requirementsCount: number;
  }[];
  regionalDemand: { region: string; totalTonnes: number; activeRequirements: number }[];
}

export interface MatchQualityBand {
  category: 'EXCELLENT' | 'STRONG' | 'GOOD' | 'POSSIBLE' | 'WEAK';
  minScore: number;
  maxScore: number;
  matchCount: number;
  percentage: number;
}

export interface MatchingAnalytics {
  totalMatchesGenerated: number;
  averageMatchScore: number;
  medianMatchScore: number;
  qualityDistribution: MatchQualityBand[];
  conversionFunnel: {
    matchesGenerated: number;
    inquiriesCreated: number;
    offersSubmitted: number;
    ordersAccepted: number;
    matchToOrderConversionPercent: number;
  };
}

export interface TransportModeStat {
  mode: string;
  shipmentCount: number;
  quantityTonnes: number;
  averageCost: number;
  estimatedEmissionsKg: number;
}

export interface LogisticsAnalytics {
  activeShipmentsCount: number;
  totalShipmentsThisPeriod: number;
  deliveredShipmentsCount: number;
  totalDistanceMovedKm: number;
  averageTransitDistanceKm: number;
  averageDeliveryDurationMinutes: number;
  averageTransportCostPerTon: number;
  estimatedTransportEmissionsKg: number;
  transportModeBreakdown: TransportModeStat[];
  costByDistanceBands: { band: string; averageCostPerTon: number; shipmentCount: number }[];
}

export interface RegionalBalanceRow {
  region: string;
  supplyTonnes: number;
  demandTonnes: number;
  netBalanceTonnes: number;
  ordersCount: number;
  shipmentsCount: number;
}

export interface NetworkObservation {
  id: string;
  type: 'SUPPLY_SURPLUS' | 'DEMAND_DEFICIT' | 'MATCHING_EFFICIENCY' | 'LOGISTICS_DOMINANCE' | 'PURITY_DISTRIBUTION';
  severity: 'INFO' | 'SUCCESS' | 'WARNING';
  title: string;
  description: string;
  metricValue?: string;
}

export interface ImpactAnalyticsReport {
  headlineMetrics: {
    co2ReusedTonnes: number;
    co2DeliveredTonnes: number;
    activeCorridorsCount: number;
    verifiedFacilitiesCount: number;
    indicativeTransportEmissionsKg: number;
  };
  funnel: CarbonFlowFunnel;
  utilizationPathways: { pathway: string; tonnes: number; sharePercent: number }[];
  methodology: {
    title: string;
    version: string;
    disclaimer: string;
    metricDefinitions: { metric: string; definition: string; sourceTable: string }[];
  };
}

export interface PublicImpactSummary {
  co2ProcessedTonnes: number;
  completedTransactionsCount: number;
  activeRegionsCount: number;
  participatingOrganizationsCount: number;
  topUtilizationPathways: string[];
}

export const analyticsApi = {
  getOverview: (timeframe: Timeframe = '30d', from?: string, to?: string) =>
    apiClient.get<NetworkOverviewKPIs>(`/analytics/overview?timeframe=${timeframe}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`),
  getFunnel: (timeframe: Timeframe = '30d') => apiClient.get<CarbonFlowFunnel>(`/analytics/funnel?timeframe=${timeframe}`),
  getSupply: (timeframe: Timeframe = '30d') => apiClient.get<SupplyAnalytics>(`/analytics/supply?timeframe=${timeframe}`),
  getDemand: (timeframe: Timeframe = '30d') => apiClient.get<DemandAnalytics>(`/analytics/demand?timeframe=${timeframe}`),
  getMatching: (timeframe: Timeframe = '30d') => apiClient.get<MatchingAnalytics>(`/analytics/matching?timeframe=${timeframe}`),
  getLogistics: (timeframe: Timeframe = '30d') => apiClient.get<LogisticsAnalytics>(`/analytics/logistics?timeframe=${timeframe}`),
  getRegions: () => apiClient.get<RegionalBalanceRow[]>('/analytics/regions'),
  getObservations: (timeframe: Timeframe = '30d') => apiClient.get<NetworkObservation[]>(`/analytics/observations?timeframe=${timeframe}`),
  getImpactReport: (timeframe: Timeframe = '30d') => apiClient.get<ImpactAnalyticsReport>(`/analytics/impact?timeframe=${timeframe}`),
  getPublicImpact: () => apiClient.get<PublicImpactSummary>('/analytics/public'),
  getPriceByPurity: (timeframe: Timeframe = '30d') => apiClient.get<{ band: string; avgPrice: number; count: number }[]>(`/analytics/price-by-purity?timeframe=${timeframe}`),
  getTopPricePoints: (timeframe: Timeframe = '30d') => apiClient.get<{ date: string; price: number; purity: number; company: string }[]>(`/analytics/top-price-points?timeframe=${timeframe}`),
};
