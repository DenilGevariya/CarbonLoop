import { MATCH_WEIGHTS, QUALITY_BANDS, MatchGrade, MatchFactorKey } from './matching.constants';
import { getEstimatedGeographicDistance } from './matching.distance';
import { estimateLogisticsCosts } from './matching.logistics';
import {
  checkEligibility,
  scoreQuantity,
  scorePurity,
  scorePhysicalForm,
  scoreAvailability,
  scorePrice,
  scoreDistance,
  scoreLogistics,
  scoreUtilization,
} from './matching.scoring';
import {
  CandidateListing,
  CandidateRequirement,
  EngineMatchOutput,
  FactorScoreResult,
} from './matching.types';

export function evaluateMatch(
  listing: CandidateListing,
  requirement: CandidateRequirement
): EngineMatchOutput {
  // 1. Eligibility Check
  const eligibility = checkEligibility(listing, requirement);

  // 2. Geographic Distance Calculation
  const distanceRes = getEstimatedGeographicDistance(
    listing.latitude,
    listing.longitude,
    listing.city,
    requirement.latitude,
    requirement.longitude,
    requirement.location_city
  );

  // 3. Logistics Cost Estimation
  const availableQty = listing.remaining_quantity ?? listing.available_quantity_tons;
  const matchQty = Math.min(availableQty, requirement.required_quantity_tons);
  const logisticsEstimate = estimateLogisticsCosts(
    distanceRes.distanceKm,
    matchQty > 0 ? matchQty : requirement.required_quantity_tons,
    listing.price_per_ton
  );

  // 4. Calculate Factor Scores
  const factorScores: Record<MatchFactorKey, FactorScoreResult> = {
    quantity: scoreQuantity(listing, requirement),
    purity: scorePurity(listing, requirement),
    physicalForm: scorePhysicalForm(listing, requirement),
    availability: scoreAvailability(listing, requirement),
    price: scorePrice(listing, requirement),
    distance: scoreDistance(distanceRes.distanceKm),
    logistics: scoreLogistics(distanceRes.distanceKm, listing.state_form),
    utilization: scoreUtilization(listing, requirement),
  };

  // 5. Compute Weighted Overall Score
  let rawWeightedSum = 0;
  for (const key of Object.keys(factorScores) as MatchFactorKey[]) {
    const factorRes = factorScores[key];
    rawWeightedSum += factorRes.score * factorRes.weight;
  }

  const overallScore = Math.round(rawWeightedSum * 10) / 10;

  // 6. Determine Quality Grade
  let grade: MatchGrade = 'WEAK';
  if (!eligibility.eligible && !eligibility.isNearMatch) {
    grade = 'WEAK';
  } else if (overallScore >= QUALITY_BANDS.EXCELLENT.min) {
    grade = 'EXCELLENT';
  } else if (overallScore >= QUALITY_BANDS.STRONG.min) {
    grade = 'STRONG';
  } else if (overallScore >= QUALITY_BANDS.GOOD.min) {
    grade = 'GOOD';
  } else if (overallScore >= QUALITY_BANDS.POSSIBLE.min) {
    grade = 'POSSIBLE';
  } else {
    grade = 'WEAK';
  }

  // 7. Human-readable Summaries, Positives & Warnings
  const positives: string[] = [];
  const warnings: string[] = [];

  for (const key of Object.keys(factorScores) as MatchFactorKey[]) {
    const f = factorScores[key];
    if (f.score >= 85) {
      positives.push(f.explanation);
    } else if (f.score < 70 && eligibility.eligible) {
      warnings.push(f.explanation);
    }
  }

  if (distanceRes.isFallback) {
    warnings.push('Distance calculated using regional city pair fallback coordinates.');
  }

  if (
    requirement.target_price_per_ton &&
    listing.price_per_ton > requirement.target_price_per_ton
  ) {
    warnings.push(
      `Source unit price (₹${listing.price_per_ton}/t) exceeds target budget (₹${requirement.target_price_per_ton}/t).`
    );
  }

  let summaryReason = '';
  if (!eligibility.eligible) {
    summaryReason = `Ineligible match: ${eligibility.reasons.join(' ')}`;
  } else {
    summaryReason = `${grade} match (${overallScore}/100) driven by ${factorScores.purity.explanation} and ${factorScores.quantity.explanation}`;
  }

  return {
    listingId: listing.id,
    requirementId: requirement.id,
    eligible: eligibility.eligible,
    isNearMatch: eligibility.isNearMatch,
    overallScore,
    grade,
    factorScores,
    logistics: logisticsEstimate,
    summaryReason,
    positives,
    warnings,
    ineligibilityReasons: eligibility.reasons,
  };
}
