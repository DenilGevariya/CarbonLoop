export type Timeframe = '7d' | '30d' | '90d' | '12m' | 'all' | 'custom';

export interface AnalyticsQueryFilters {
  timeframe?: Timeframe;
  from?: string;
  to?: string;
  organizationId?: string;
  region?: string;
}

export interface NetworkOverviewKPIs {
  stock: {
    activeSupplyTonnes: number;
    activeDemandTonnes: number;
    netSupplyBalanceTonnes: number;
    activeListingsCount: number;
    activeRequirementsCount: number;
    activeShipmentsCount: number;
    activeOrganizationsCount: number;
    activeFacilitiesCount: number;
  };
  flow: {
    listedTonnes: number;
    requestedTonnes: number;
    matchedTonnes: number;
    orderedTonnes: number;
    shippedTonnes: number;
    deliveredTonnes: number;
    reusedTonnes: number;
  };
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
  conversionPercent: number; // Conversion rate relative to previous stage
  funnelSharePercent: number; // Conversion rate relative to LISTED
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
  purityBands: {
    band: string;
    listingsCount: number;
    totalTonnes: number;
  }[];
  priceBands: {
    band: string;
    listingsCount: number;
  }[];
  regionalSupply: {
    region: string;
    totalTonnes: number;
    activeListings: number;
  }[];
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
  regionalDemand: {
    region: string;
    totalTonnes: number;
    activeRequirements: number;
  }[];
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

export interface LogisticsAnalytics {
  activeShipmentsCount: number;
  totalShipmentsThisPeriod: number;
  deliveredShipmentsCount: number;
  totalDistanceMovedKm: number;
  averageTransitDistanceKm: number;
  averageDeliveryDurationMinutes: number;
  averageTransportCostPerTon: number;
  estimatedTransportEmissionsKg: number;
  transportModeBreakdown: {
    mode: string;
    shipmentCount: number;
    quantityTonnes: number;
    averageCost: number;
    estimatedEmissionsKg: number;
  }[];
  costByDistanceBands: {
    band: string;
    averageCostPerTon: number;
    shipmentCount: number;
  }[];
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
  utilizationPathways: {
    pathway: string;
    tonnes: number;
    sharePercent: number;
  }[];
  methodology: {
    title: string;
    version: string;
    disclaimer: string;
    metricDefinitions: {
      metric: string;
      definition: string;
      sourceTable: string;
    }[];
  };
}

export interface PublicImpactSummary {
  co2ProcessedTonnes: number;
  completedTransactionsCount: number;
  activeRegionsCount: number;
  participatingOrganizationsCount: number;
  topUtilizationPathways: string[];
}
