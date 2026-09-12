import { MatchGrade, MatchFactorKey } from './matching.constants';

export interface CandidateListing {
  id: string;
  organization_id: string;
  organization_name?: string;
  facility_id: string;
  facility_name?: string;
  title: string;
  purity_percentage: number;
  available_quantity_tons: number;
  remaining_quantity?: number;
  minimum_order_tons?: number;
  price_per_ton: number;
  currency?: string;
  state_form: string; // 'GASEOUS', 'LIQUID', 'SUPERCRITICAL', 'SOLID_DRY_ICE'
  availability_start_date?: string | Date | null;
  availability_end_date?: string | Date | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  state?: string;
  status: string; // 'PUBLISHED' | 'ACTIVE'
  capture_technology?: string;
  capture_source?: string;
}

export interface CandidateRequirement {
  id: string;
  organization_id: string;
  organization_name?: string;
  facility_id?: string | null;
  title: string;
  intended_use: string;
  required_purity_percentage: number;
  maximum_purity_percentage?: number | null;
  preferred_state_form?: string | null;
  required_quantity_tons: number;
  target_price_per_ton?: number | null;
  max_distance_km?: number | null;
  required_by_date?: string | Date | null;
  required_until_date?: string | Date | null;
  latitude?: number | null;
  longitude?: number | null;
  location_city: string;
  location_state: string;
  status: string; // 'PUBLISHED' | 'ACTIVE'
  utilization_type_code?: string;
}

export interface FactorScoreResult {
  factor: MatchFactorKey;
  score: number; // 0 - 100
  weight: number;
  explanation: string;
}

export interface HardConstraintStatus {
  statusActive: boolean;
  quantityAvailable: boolean;
  puritySatisfied: boolean;
  availabilityOverlap: boolean;
  physicalFormCompatible: boolean;
  priceBudgetFeasible: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  isNearMatch: boolean;
  hardConstraints: HardConstraintStatus;
  reasons: string[];
}

export interface LogisticsEstimate {
  distanceKm: number;
  estimatedTransportCost: number;
  estimatedCostPerTonne: number;
  indicativeDeliveredCostPerTonne: number;
  assumption: string;
}

export interface EngineMatchOutput {
  listingId: string;
  requirementId: string;
  eligible: boolean;
  isNearMatch: boolean;
  overallScore: number;
  grade: MatchGrade;
  factorScores: Record<MatchFactorKey, FactorScoreResult>;
  logistics: LogisticsEstimate;
  summaryReason: string;
  positives: string[];
  warnings: string[];
  ineligibilityReasons: string[];
}

export interface StoredMatch {
  id: string;
  listing_id: string;
  requirement_id: string;
  status: string;
  overall_score: number;
  grade: MatchGrade;
  quantity_score: number;
  purity_score: number;
  physical_form_score: number;
  availability_score: number;
  price_score: number;
  distance_score: number;
  logistics_score: number;
  utilization_score: number;
  estimated_distance_km: number;
  estimated_transport_cost: number;
  estimated_delivered_cost: number;
  matching_reason: string;
  explanations: FactorScoreResult[];
  warnings: string[];
  generated_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  listing?: CandidateListing;
  requirement?: CandidateRequirement;
}
