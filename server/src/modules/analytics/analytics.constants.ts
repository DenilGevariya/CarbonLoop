import { Timeframe } from './analytics.types';

export const TRANSPORT_EMISSION_FACTORS: Record<string, number> = {
  ISO_TANK_TRUCK: 0.089, // kg CO2e / ton-km
  ROAD: 0.095,
  CYLINDER_CASCADE: 0.110,
  RAIL_TANKER: 0.028,
  RAIL: 0.025,
  PIPELINE: 0.008,
  SHIP: 0.018,
  OTHER: 0.080,
};

export const MATCH_SCORE_BANDS = [
  { category: 'EXCELLENT', minScore: 90, maxScore: 100 },
  { category: 'STRONG', minScore: 75, maxScore: 89.99 },
  { category: 'GOOD', minScore: 60, maxScore: 74.99 },
  { category: 'POSSIBLE', minScore: 40, maxScore: 59.99 },
  { category: 'WEAK', minScore: 0, maxScore: 39.99 },
] as const;

export function parseTimeframeToDates(timeframe: Timeframe = '30d', customFrom?: string, customTo?: string) {
  const now = new Date();
  let from = new Date();

  switch (timeframe) {
    case '7d':
      from.setDate(now.getDate() - 7);
      break;
    case '30d':
      from.setDate(now.getDate() - 30);
      break;
    case '90d':
      from.setDate(now.getDate() - 90);
      break;
    case '12m':
      from.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      from = new Date(2020, 0, 1);
      break;
    case 'custom':
      if (customFrom) from = new Date(customFrom);
      if (customTo) now.setTime(new Date(customTo).getTime());
      break;
  }

  return {
    fromISO: from.toISOString(),
    toISO: now.toISOString(),
  };
}

export const METHODOLOGY_DISCLAIMER =
  'CarbonLoop operational impact metrics are derived from transaction data and custody transfer records. They represent physical CO2 volume processed through completed marketplace orders and should be interpreted as verified platform throughput, not certified GHG protocol avoided-emissions offsets unless accompanied by independent verification audit documentation.';
