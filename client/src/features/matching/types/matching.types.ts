export type MatchGrade = 'EXCELLENT' | 'STRONG' | 'GOOD' | 'POSSIBLE' | 'WEAK';

export interface FactorScoreResult {
  factor: 'quantity' | 'purity' | 'physicalForm' | 'availability' | 'price' | 'distance' | 'logistics' | 'utilization';
  score: number;
  weight: number;
  explanation: string;
}

export interface LogisticsEstimate {
  distanceKm: number;
  estimatedTransportCost: number;
  estimatedCostPerTonne: number;
  indicativeDeliveredCostPerTonne: number;
  assumption: string;
}

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
  price_per_ton: number;
  currency?: string;
  state_form: string;
  availability_start_date?: string;
  availability_end_date?: string;
  city?: string;
  state?: string;
  status: string;
}

export interface CandidateRequirement {
  id: string;
  organization_id: string;
  organization_name?: string;
  title: string;
  intended_use: string;
  required_purity_percentage: number;
  preferred_state_form?: string;
  required_quantity_tons: number;
  target_price_per_ton?: number;
  max_distance_km?: number;
  location_city: string;
  location_state: string;
  status: string;
}

export interface MatchRecord {
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
  explanations?: FactorScoreResult[];
  warnings?: string[];
  generated_at?: string;
  expires_at?: string;
  listing?: CandidateListing;
  requirement?: CandidateRequirement;
}
