import { NetworkObservation, RegionalBalanceRow, SupplyAnalytics, DemandAnalytics, LogisticsAnalytics } from './analytics.types';

export function generateNetworkObservations(
  regionalBalances: RegionalBalanceRow[],
  supply: SupplyAnalytics,
  demand: DemandAnalytics,
  logistics: LogisticsAnalytics
): NetworkObservation[] {
  const observations: NetworkObservation[] = [];

  // 1. Regional Supply Surplus / Deficit Observation
  if (regionalBalances.length > 0) {
    const sorted = [...regionalBalances].sort((a, b) => b.netBalanceTonnes - a.netBalanceTonnes);
    const topSurplus = sorted[0];
    if (topSurplus && topSurplus.netBalanceTonnes > 0) {
      observations.push({
        id: 'obs-regional-surplus',
        type: 'SUPPLY_SURPLUS',
        severity: 'INFO',
        title: `Regional Supply Surplus in ${topSurplus.region}`,
        description: `Current available supply exceeds outstanding demand by +${topSurplus.netBalanceTonnes.toLocaleString()} tonnes in ${topSurplus.region}.`,
        metricValue: `+${topSurplus.netBalanceTonnes} t`,
      });
    }

    const topDeficit = sorted[sorted.length - 1];
    if (topDeficit && topDeficit.netBalanceTonnes < 0) {
      observations.push({
        id: 'obs-regional-deficit',
        type: 'DEMAND_DEFICIT',
        severity: 'WARNING',
        title: `Unmet CO₂ Demand Deficit in ${topDeficit.region}`,
        description: `Outstanding demand exceeds available supply by ${Math.abs(topDeficit.netBalanceTonnes).toLocaleString()} tonnes in ${topDeficit.region}.`,
        metricValue: `${topDeficit.netBalanceTonnes} t`,
      });
    }
  }

  // 2. High-Purity Supply Observation
  const highPurityBands = supply.purityBands.filter((b) => b.band.includes('99.5%') || b.band.includes('99%'));
  const highPurityTonnes = highPurityBands.reduce((sum, b) => sum + b.totalTonnes, 0);
  if (supply.totalAvailableTonnes > 0 && highPurityTonnes > 0) {
    const pct = Math.round((highPurityTonnes / supply.totalAvailableTonnes) * 100);
    observations.push({
      id: 'obs-purity-high',
      type: 'PURITY_DISTRIBUTION',
      severity: 'SUCCESS',
      title: 'High-Purity Industrial Grade Concentration',
      description: `${pct}% of active CO₂ supply streams meet or exceed 99.0% purity standards, making them suitable for food & chemical synthesis.`,
      metricValue: `${pct}% High Purity`,
    });
  }

  // 3. Logistics Transport Dominance Observation
  if (logistics.transportModeBreakdown.length > 0) {
    const dominantMode = [...logistics.transportModeBreakdown].sort((a, b) => b.shipmentCount - a.shipmentCount)[0];
    if (dominantMode && dominantMode.shipmentCount > 0) {
      observations.push({
        id: 'obs-logistics-mode',
        type: 'LOGISTICS_DOMINANCE',
        severity: 'INFO',
        title: `Primary Transport Mode: ${dominantMode.mode.replace(/_/g, ' ')}`,
        description: `${dominantMode.mode.replace(/_/g, ' ')} accounts for ${dominantMode.shipmentCount} active shipments moving ${dominantMode.quantityTonnes.toLocaleString()} tonnes CO₂.`,
        metricValue: `${dominantMode.shipmentCount} Shipments`,
      });
    }
  }

  return observations;
}
