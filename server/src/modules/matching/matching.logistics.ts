import { LOGISTICS_CONFIG } from './matching.constants';
import { LogisticsEstimate } from './matching.types';

export function estimateLogisticsCosts(
  distanceKm: number,
  quantityTons: number,
  sourcePricePerTon: number
): LogisticsEstimate {
  const dist = Number(distanceKm) || 0;
  const qty = Math.max(Number(quantityTons) || 1, 1);
  const price = Number(sourcePricePerTon) || 0;

  const baseFee = LOGISTICS_CONFIG.BASE_FEE_INR;
  const distanceCost = dist * LOGISTICS_CONFIG.DISTANCE_RATE_PER_KM_INR;
  const handlingCost = qty * LOGISTICS_CONFIG.HANDLING_RATE_PER_TONNE_INR;

  const totalTransportCost = Math.round(baseFee + distanceCost + handlingCost);
  const costPerTonne = Math.round((totalTransportCost / qty) * 100) / 100;
  const indicativeDeliveredCost = Math.round((price + costPerTonne) * 100) / 100;

  return {
    distanceKm: Math.round(dist * 10) / 10,
    estimatedTransportCost: totalTransportCost,
    estimatedCostPerTonne: costPerTonne,
    indicativeDeliveredCostPerTonne: indicativeDeliveredCost,
    assumption: LOGISTICS_CONFIG.DEFAULT_ASSUMPTION,
  };
}
