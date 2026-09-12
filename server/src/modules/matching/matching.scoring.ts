import { MATCH_WEIGHTS, NEAR_MATCH_PRICE_OVERAGE_MAX_RATIO } from './matching.constants';
import {
  CandidateListing,
  CandidateRequirement,
  EligibilityResult,
  FactorScoreResult,
  HardConstraintStatus,
} from './matching.types';

export function checkEligibility(
  listing: CandidateListing,
  requirement: CandidateRequirement
): EligibilityResult {
  const reasons: string[] = [];

  // 1. Status Check
  const validListingStatuses = ['ACTIVE', 'PUBLISHED'];
  const validReqStatuses = ['ACTIVE', 'PUBLISHED'];

  const statusActive =
    validListingStatuses.includes(listing.status.toUpperCase()) &&
    validReqStatuses.includes(requirement.status.toUpperCase());

  if (!statusActive) {
    reasons.push(
      `Status constraint failed: Listing (${listing.status}) and Requirement (${requirement.status}) must both be active/published.`
    );
  }

  // 2. Quantity Check
  const availableQty = listing.remaining_quantity ?? listing.available_quantity_tons;
  const quantityAvailable = availableQty > 0;

  if (!quantityAvailable) {
    reasons.push('Supply listing has zero remaining available quantity.');
  }

  // 3. Purity Check
  const puritySatisfied =
    listing.purity_percentage >= requirement.required_purity_percentage;

  if (!puritySatisfied) {
    reasons.push(
      `Supply purity (${listing.purity_percentage}%) is below the buyer's minimum required purity (${requirement.required_purity_percentage}%).`
    );
  }

  // 4. Availability Window Check
  let availabilityOverlap = true;
  if (
    listing.availability_start_date &&
    requirement.required_by_date &&
    listing.availability_end_date
  ) {
    const listStart = new Date(listing.availability_start_date).getTime();
    const listEnd = new Date(listing.availability_end_date).getTime();
    const reqStart = new Date(requirement.required_by_date).getTime();

    if (listEnd < reqStart) {
      availabilityOverlap = false;
      reasons.push(
        `Availability timeline mismatch: Supply window ends before requirement start date.`
      );
    }
  }

  // 5. Physical Form Check
  let physicalFormCompatible = true;
  if (
    requirement.preferred_state_form &&
    requirement.preferred_state_form.toUpperCase() !== 'ANY'
  ) {
    const reqForm = requirement.preferred_state_form.toUpperCase();
    const listForm = listing.state_form.toUpperCase();

    if (reqForm === 'SOLID_DRY_ICE' && listForm !== 'SOLID_DRY_ICE') {
      physicalFormCompatible = false;
      reasons.push(
        `Physical form incompatibility: Buyer strictly requires ${reqForm}, but supply is ${listForm}.`
      );
    }
  }

  // 6. Price Budget Check
  let priceBudgetFeasible = true;
  let isNearMatchPrice = false;
  if (requirement.target_price_per_ton && requirement.target_price_per_ton > 0) {
    const maxBudget = requirement.target_price_per_ton;
    const sourcePrice = listing.price_per_ton;

    if (sourcePrice > maxBudget) {
      priceBudgetFeasible = false;
      if (sourcePrice <= maxBudget * NEAR_MATCH_PRICE_OVERAGE_MAX_RATIO) {
        isNearMatchPrice = true;
        reasons.push(
          `Source price (₹${sourcePrice}/t) exceeds target budget (₹${maxBudget}/t) slightly within 20% negotiation buffer.`
        );
      } else {
        reasons.push(
          `Source price (₹${sourcePrice}/t) exceeds target budget (₹${maxBudget}/t) by over 20%.`
        );
      }
    }
  }

  const hardConstraints: HardConstraintStatus = {
    statusActive,
    quantityAvailable,
    puritySatisfied,
    availabilityOverlap,
    physicalFormCompatible,
    priceBudgetFeasible,
  };

  const eligible =
    statusActive &&
    quantityAvailable &&
    puritySatisfied &&
    availabilityOverlap &&
    physicalFormCompatible &&
    priceBudgetFeasible;

  const isNearMatch = !eligible && isNearMatchPrice && puritySatisfied && quantityAvailable;

  return {
    eligible,
    isNearMatch,
    hardConstraints,
    reasons,
  };
}

// ----------------------------------------------------
// Factor Scoring Functions (0 - 100)
// ----------------------------------------------------

export function scoreQuantity(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  const availableQty = listing.remaining_quantity ?? listing.available_quantity_tons;
  const requiredQty = requirement.required_quantity_tons;

  let score = 100;
  let explanation = '';

  if (availableQty >= requiredQty) {
    const ratio = availableQty / Math.max(requiredQty, 1);
    if (ratio <= 2.5) {
      score = 100;
      explanation = `${availableQty.toLocaleString()} tonnes available cleanly satisfies requested ${requiredQty.toLocaleString()} tonnes.`;
    } else {
      score = Math.max(80, Math.round(100 - (ratio - 2.5) * 4));
      explanation = `${availableQty.toLocaleString()} tonnes available provides large surplus over requested ${requiredQty.toLocaleString()} tonnes.`;
    }
  } else {
    score = Math.min(100, Math.max(0, Math.round((availableQty / requiredQty) * 100)));
    explanation = `${availableQty.toLocaleString()} tonnes available satisfies ${score}% of requested ${requiredQty.toLocaleString()} tonnes.`;
  }

  return {
    factor: 'quantity',
    score,
    weight: MATCH_WEIGHTS.quantity,
    explanation,
  };
}

export function scorePurity(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  const supPurity = listing.purity_percentage;
  const reqMin = requirement.required_purity_percentage;
  const margin = supPurity - reqMin;

  let score = 90;
  let explanation = '';

  if (margin < 0) {
    score = 0;
    explanation = `Purity of ${supPurity}% fails buyer minimum threshold of ${reqMin}%.`;
  } else if (margin === 0) {
    score = 90;
    explanation = `Purity of ${supPurity}% exactly matches requested minimum of ${reqMin}%.`;
  } else {
    score = Math.min(100, Math.round(90 + margin * 20));
    explanation = `Purity of ${supPurity}% exceeds requested minimum of ${reqMin}% by ${margin.toFixed(1)}%.`;
  }

  return {
    factor: 'purity',
    score,
    weight: MATCH_WEIGHTS.purity,
    explanation,
  };
}

export function scorePhysicalForm(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  const listForm = listing.state_form.toUpperCase();
  const reqForm = (requirement.preferred_state_form || 'ANY').toUpperCase();

  let score = 100;
  let explanation = '';

  if (reqForm === 'ANY' || listForm === reqForm) {
    score = 100;
    explanation = `${listForm} physical form matches buyer requirement.`;
  } else if (
    (listForm === 'LIQUID' && reqForm === 'GASEOUS') ||
    (listForm === 'GASEOUS' && reqForm === 'LIQUID')
  ) {
    score = 80;
    explanation = `${listForm} supply can be converted to ${reqForm} via onsite vaporization/compression.`;
  } else {
    score = 40;
    explanation = `${listForm} supply differs from preferred ${reqForm} form.`;
  }

  return {
    factor: 'physicalForm',
    score,
    weight: MATCH_WEIGHTS.physicalForm,
    explanation,
  };
}

export function scoreAvailability(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  let score = 95;
  let explanation = 'Supply timeline aligns with requirement dates.';

  if (listing.availability_start_date && requirement.required_by_date) {
    const listStart = new Date(listing.availability_start_date).getTime();
    const reqStart = new Date(requirement.required_by_date).getTime();
    const diffDays = Math.round((listStart - reqStart) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      score = 100;
      explanation = 'Supply availability start date covers the entire required timeframe.';
    } else if (diffDays <= 14) {
      score = 85;
      explanation = `Supply availability starts ${diffDays} days after preferred start date.`;
    } else {
      score = 65;
      explanation = `Supply availability delayed by ${diffDays} days from preferred start date.`;
    }
  }

  return {
    factor: 'availability',
    score,
    weight: MATCH_WEIGHTS.availability,
    explanation,
  };
}

export function scorePrice(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  const sourcePrice = listing.price_per_ton;
  const targetPrice = requirement.target_price_per_ton;

  let score = 90;
  let explanation = `Listed source price of ₹${sourcePrice.toLocaleString()}/tonne.`;

  if (targetPrice && targetPrice > 0) {
    if (sourcePrice <= targetPrice * 0.85) {
      score = 100;
      explanation = `Source price of ₹${sourcePrice.toLocaleString()}/t is significantly below target budget of ₹${targetPrice.toLocaleString()}/t.`;
    } else if (sourcePrice <= targetPrice) {
      score = Math.round(100 - ((sourcePrice - 0.85 * targetPrice) / (0.15 * targetPrice)) * 20);
      explanation = `Source price of ₹${sourcePrice.toLocaleString()}/t fits within target budget of ₹${targetPrice.toLocaleString()}/t.`;
    } else if (sourcePrice <= targetPrice * NEAR_MATCH_PRICE_OVERAGE_MAX_RATIO) {
      score = Math.round(80 - ((sourcePrice - targetPrice) / (0.2 * targetPrice)) * 40);
      explanation = `Source price of ₹${sourcePrice.toLocaleString()}/t slightly exceeds target budget of ₹${targetPrice.toLocaleString()}/t.`;
    } else {
      score = 20;
      explanation = `Source price of ₹${sourcePrice.toLocaleString()}/t exceeds target budget of ₹${targetPrice.toLocaleString()}/t.`;
    }
  }

  return {
    factor: 'price',
    score,
    weight: MATCH_WEIGHTS.price,
    explanation,
  };
}

export function scoreDistance(distanceKm: number): FactorScoreResult {
  let score = 100;
  let explanation = '';

  if (distanceKm <= 50) {
    score = 100;
    explanation = `Geographic distance of ${distanceKm} km provides optimal regional logistics.`;
  } else if (distanceKm <= 150) {
    score = Math.round(100 - (distanceKm - 50) * 0.2);
    explanation = `Geographic distance of ${distanceKm} km represents short regional transport.`;
  } else if (distanceKm <= 300) {
    score = Math.round(80 - (distanceKm - 150) * 0.2);
    explanation = `Geographic distance of ${distanceKm} km represents medium-range transport.`;
  } else if (distanceKm <= 500) {
    score = Math.round(50 - (distanceKm - 300) * 0.1);
    explanation = `Geographic distance of ${distanceKm} km requires long-distance freight transit.`;
  } else {
    score = Math.max(10, Math.round(30 - (distanceKm - 500) * 0.03));
    explanation = `Geographic distance of ${distanceKm} km is high for cryogenic road transport.`;
  }

  return {
    factor: 'distance',
    score,
    weight: MATCH_WEIGHTS.distance,
    explanation,
  };
}

export function scoreLogistics(distanceKm: number, stateForm: string): FactorScoreResult {
  let score = 90;
  let explanation = 'Freight transport appears commercially practical.';

  const form = stateForm.toUpperCase();
  if (distanceKm <= 150 && (form === 'LIQUID' || form === 'GASEOUS')) {
    score = 95;
    explanation = `Short-haul transport of ${form} stream is standard via ISO-tankers/pipeline.`;
  } else if (distanceKm <= 300) {
    score = 85;
    explanation = `Transport via road ISO cryogenic tanker is commercially feasible.`;
  } else {
    score = 65;
    explanation = `Longer transport distance increases freight handling complexity.`;
  }

  return {
    factor: 'logistics',
    score,
    weight: MATCH_WEIGHTS.logistics,
    explanation,
  };
}

export function scoreUtilization(
  listing: CandidateListing,
  requirement: CandidateRequirement
): FactorScoreResult {
  let score = 90;
  let explanation = `Supply stream characteristics support ${requirement.intended_use || 'industrial off-take'}.`;

  const purity = listing.purity_percentage;
  if (purity >= 99.5) {
    score = 100;
    explanation = `Ultra-high purity (${purity}%) supports sensitive chemical or mineralization off-take.`;
  }

  return {
    factor: 'utilization',
    score,
    weight: MATCH_WEIGHTS.utilization,
    explanation,
  };
}
