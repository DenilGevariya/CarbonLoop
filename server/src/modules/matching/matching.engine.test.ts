import { MATCH_WEIGHTS } from './matching.constants';
import { calculateHaversineDistance } from './matching.distance';
import { estimateLogisticsCosts } from './matching.logistics';
import { evaluateMatch } from './matching.engine';
import { CandidateListing, CandidateRequirement } from './matching.types';

function runTestSuite() {
  console.log('🧪 Running CarbonLoop Matching Engine Unit Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, failureDetail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${failureDetail}`);
      failed++;
    }
  }

  // TEST 1: Weight Summation
  const weightSum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
  assert(
    Math.abs(weightSum - 1.0) < 0.001,
    'MATCH_WEIGHTS sum exactly to 1.00 (100%)',
    `Sum was ${weightSum}`
  );

  // TEST 2: Haversine Calculation Accuracy
  const zeroDistance = calculateHaversineDistance(22.9583, 72.6369, 22.9583, 72.6369);
  assert(zeroDistance === 0, 'Haversine distance for identical coordinates is 0 km');

  // Known city pair: Ahmedabad (22.9583, 72.6369) to Vadodara (22.4110, 73.0890) ~ 75-80 km direct
  const ahmedabadToVadodara = calculateHaversineDistance(22.9583, 72.6369, 22.4110, 73.0890);
  assert(
    ahmedabadToVadodara >= 70 && ahmedabadToVadodara <= 90,
    `Haversine distance Ahmedabad to Vadodara is accurate (~${ahmedabadToVadodara} km)`
  );

  // TEST 3: Logistics Cost Calculation
  const logistics = estimateLogisticsCosts(100, 300, 4800);
  // Base 5000 + 100*20 (2000) + 300*40 (12000) = 19000 total. Cost/t = 19000/300 = 63.33. Delivered = 4863.33
  assert(
    logistics.estimatedTransportCost === 19000,
    `Logistics transport cost deterministic formula correct (₹${logistics.estimatedTransportCost})`
  );
  assert(
    logistics.indicativeDeliveredCostPerTonne === 4863.33,
    `Indicative delivered cost correct (₹${logistics.indicativeDeliveredCostPerTonne}/t)`
  );

  // Base Fixtures
  const mockListing: CandidateListing = {
    id: 'list-1',
    organization_id: 'org-1',
    facility_id: 'fac-1',
    title: 'High-Purity CO2',
    purity_percentage: 99.5,
    available_quantity_tons: 1250,
    remaining_quantity: 1250,
    minimum_order_tons: 20,
    price_per_ton: 4800,
    state_form: 'LIQUID',
    availability_start_date: '2026-09-01',
    availability_end_date: '2026-12-31',
    latitude: 22.9583,
    longitude: 72.6369,
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'ACTIVE',
  };

  const mockRequirement: CandidateRequirement = {
    id: 'req-1',
    organization_id: 'org-2',
    facility_id: 'fac-2',
    title: 'Concrete Curing Requirement',
    intended_use: 'Concrete Curing',
    required_purity_percentage: 99.0,
    preferred_state_form: 'LIQUID',
    required_quantity_tons: 500,
    target_price_per_ton: 5200,
    required_by_date: '2026-09-15',
    required_until_date: '2026-12-15',
    latitude: 22.4110,
    longitude: 73.0890,
    location_city: 'Vadodara',
    location_state: 'Gujarat',
    status: 'ACTIVE',
  };

  // TEST 4: Perfect/Strong Match Evaluation
  const matchResult = evaluateMatch(mockListing, mockRequirement);
  assert(matchResult.eligible === true, 'Ideal candidate pair is eligible');
  assert(
    matchResult.overallScore >= 90,
    `Ideal candidate overall score is EXCELLENT (Score: ${matchResult.overallScore})`
  );
  assert(matchResult.grade === 'EXCELLENT', `Grade is EXCELLENT (${matchResult.grade})`);

  // TEST 5: Hard Failure - Purity Below Minimum
  const lowPurityListing: CandidateListing = {
    ...mockListing,
    purity_percentage: 97.5,
  };
  const purityFailResult = evaluateMatch(lowPurityListing, mockRequirement);
  assert(
    purityFailResult.eligible === false,
    'Listing with purity below requirement minimum is INELIGIBLE'
  );
  assert(
    purityFailResult.ineligibilityReasons.some((r) => r.includes('purity')),
    'Ineligibility reason mentions purity failure'
  );

  // TEST 6: Hard Failure - Zero Remaining Quantity
  const zeroQtyListing: CandidateListing = {
    ...mockListing,
    remaining_quantity: 0,
  };
  const zeroQtyResult = evaluateMatch(zeroQtyListing, mockRequirement);
  assert(
    zeroQtyResult.eligible === false,
    'Listing with zero remaining quantity is INELIGIBLE'
  );

  // TEST 7: Hard Failure - Inactive Status
  const inactiveListing: CandidateListing = {
    ...mockListing,
    status: 'EXHAUSTED',
  };
  const inactiveResult = evaluateMatch(inactiveListing, mockRequirement);
  assert(
    inactiveResult.eligible === false,
    'Inactive listing status is INELIGIBLE'
  );

  // TEST 8: Near Match - Price Exceeds Ceiling Slightly (< 20%)
  const priceOverListing: CandidateListing = {
    ...mockListing,
    price_per_ton: 5800, // Target is 5200 (overage ~11.5%)
  };
  const priceOverResult = evaluateMatch(priceOverListing, mockRequirement);
  assert(
    priceOverResult.eligible === false && priceOverResult.isNearMatch === true,
    'Price slightly above ceiling is flagged as Near Match'
  );

  // TEST 9: Hard Failure - Price Exceeds Ceiling Significantly (> 20%)
  const extremePriceListing: CandidateListing = {
    ...mockListing,
    price_per_ton: 7500, // Target is 5200 (overage ~44%)
  };
  const extremePriceResult = evaluateMatch(extremePriceListing, mockRequirement);
  assert(
    extremePriceResult.eligible === false && extremePriceResult.isNearMatch === false,
    'Price >20% above ceiling is hard INELIGIBLE and not a Near Match'
  );

  // TEST 10: Factor Score Boundaries
  const factorKeys = Object.keys(matchResult.factorScores) as (keyof typeof MATCH_WEIGHTS)[];
  let boundsValid = true;
  for (const k of factorKeys) {
    const s = matchResult.factorScores[k].score;
    if (s < 0 || s > 100) boundsValid = false;
  }
  assert(boundsValid, 'All factor scores are strictly bounded between 0 and 100');

  console.log(`\n===================================================`);
  console.log(`📊 Unit Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
