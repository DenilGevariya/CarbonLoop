import { TransportMode, SystemLogisticsEstimate } from './logistics.types';

/**
 * Transport emission factors (kg CO2e per ton-km)
 * Note: These are indicative development assumptions for logistics estimation,
 * not regulatory-certified carbon accounting.
 */
export const EMISSION_FACTORS: Record<string, number> = {
  ROAD: 0.089,
  ISO_TANK_TRUCK: 0.089,
  RAIL: 0.028,
  RAIL_TANKER: 0.028,
  PIPELINE: 0.012,
  SHIP: 0.015,
  CYLINDER_CASCADE: 0.095,
  OTHER: 0.090,
};

/**
 * Average transit speed assumptions (km/h)
 */
export const TRANSPORT_SPEEDS_KMH: Record<string, number> = {
  ROAD: 45,
  ISO_TANK_TRUCK: 45,
  RAIL: 35,
  RAIL_TANKER: 35,
  PIPELINE: 60,
  SHIP: 25,
  CYLINDER_CASCADE: 40,
  OTHER: 40,
};

/**
 * Calculates Haversine geographic distance between two lat/lon coordinates in km.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Calculates indicative transit duration in minutes based on distance and transport mode.
 */
export function estimateTransitDurationMinutes(
  distanceKm: number,
  mode: TransportMode = 'ISO_TANK_TRUCK'
): number {
  const speed = TRANSPORT_SPEEDS_KMH[mode] || 45;
  const transitHours = distanceKm / speed;
  const handlingAllowanceMinutes = 120; // 2 hours for loading/unloading
  return Math.round(transitHours * 60 + handlingAllowanceMinutes);
}

/**
 * Calculates estimated CO2e emissions in kg for transport.
 */
export function calculateTransportEmissionsKg(
  distanceKm: number,
  quantityTons: number,
  mode: TransportMode = 'ISO_TANK_TRUCK'
): number {
  const factor = EMISSION_FACTORS[mode] || 0.089;
  const emissions = distanceKm * quantityTons * factor;
  return Math.round(emissions * 10) / 10;
}

/**
 * Calculates system baseline logistics cost estimate (CarbonLoop estimate).
 */
export function calculateBaselineLogisticsCost(
  distanceKm: number,
  quantityTons: number,
  mode: TransportMode = 'ISO_TANK_TRUCK'
): number {
  const baseFee = 5000; // Base dispatch fee in INR
  const perKmRate = mode === 'PIPELINE' ? 12 : 25; // per km rate
  const perTonHandling = 150; // per ton handling fee

  const total = baseFee + distanceKm * perKmRate + quantityTons * perTonHandling;
  return Math.round(total);
}

/**
 * Generates system logistics estimate object.
 */
export function getSystemLogisticsEstimate(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  quantityTons: number,
  mode: TransportMode = 'ISO_TANK_TRUCK'
): SystemLogisticsEstimate {
  const distance_km = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  const estimated_duration_minutes = estimateTransitDurationMinutes(distance_km, mode);
  const estimated_cost = calculateBaselineLogisticsCost(distance_km, quantityTons, mode);
  const estimated_co2e_kg = calculateTransportEmissionsKg(distance_km, quantityTons, mode);

  return {
    distance_km,
    estimated_duration_minutes,
    estimated_cost,
    estimated_co2e_kg,
  };
}

/**
 * Calculates a simple logistics decision comparison score (0-100) based on cost, duration, and emissions.
 * Separate from CO2 supply matching score.
 */
export function calculateLogisticsDecisionScore(
  cost: number,
  durationMinutes: number,
  emissionsKg: number,
  baselineCost: number,
  baselineDuration: number,
  baselineEmissions: number
): number {
  const costRatio = baselineCost > 0 ? Math.min(1.5, cost / baselineCost) : 1;
  const durationRatio = baselineDuration > 0 ? Math.min(1.5, durationMinutes / baselineDuration) : 1;
  const emissionsRatio = baselineEmissions > 0 ? Math.min(1.5, emissionsKg / baselineEmissions) : 1;

  // Weighted score: 50% cost, 25% duration, 25% emissions
  const weightedRatio = costRatio * 0.5 + durationRatio * 0.25 + emissionsRatio * 0.25;
  const score = Math.max(10, Math.min(100, Math.round(100 - (weightedRatio - 1) * 60)));

  return score;
}
