export const MATCH_WEIGHTS = {
  quantity: 0.20,
  purity: 0.20,
  physicalForm: 0.10,
  availability: 0.15,
  price: 0.15,
  distance: 0.10,
  logistics: 0.05,
  utilization: 0.05,
} as const;

// Ensure weights sum to 1.0 at runtime load
const weightSum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
  throw new Error(`CRITICAL: MATCH_WEIGHTS must sum to 1.0 (current sum: ${weightSum})`);
}

export type MatchFactorKey = keyof typeof MATCH_WEIGHTS;

export const QUALITY_BANDS = {
  EXCELLENT: { min: 90.0, max: 100.0, label: 'EXCELLENT', description: 'Exceptional technical, economic, and geographic alignment' },
  STRONG: { min: 80.0, max: 89.99, label: 'STRONG', description: 'High compatibility across all primary off-take criteria' },
  GOOD: { min: 70.0, max: 79.99, label: 'GOOD', description: 'Viable off-take opportunity with minor trade-offs' },
  POSSIBLE: { min: 60.0, max: 69.99, label: 'POTENTIAL', description: 'Feasible match requiring commercial or schedule adjustments' },
  WEAK: { min: 0.0, max: 59.99, label: 'WEAK', description: 'Low compatibility; significant specification gaps' },
} as const;

export type MatchGrade = keyof typeof QUALITY_BANDS;

export const LOGISTICS_CONFIG = {
  BASE_FEE_INR: 5000,
  DISTANCE_RATE_PER_KM_INR: 20,
  HANDLING_RATE_PER_TONNE_INR: 40,
  DEFAULT_ASSUMPTION: 'Listing price is source price; logistics freight estimated separately.',
} as const;

export const MATCH_EXPIRATION_HOURS = 24;

export const NEAR_MATCH_PRICE_OVERAGE_MAX_RATIO = 1.20; // Allow up to 20% price overage for Near Match flagging
