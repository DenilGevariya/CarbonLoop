export type TransportMode =
  | 'ROAD'
  | 'RAIL'
  | 'PIPELINE'
  | 'SHIP'
  | 'OTHER'
  | 'ISO_TANK_TRUCK'
  | 'CYLINDER_CASCADE'
  | 'RAIL_TANKER';

export type QuoteStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface LogisticsProviderInfo {
  id: string;
  name: string;
  org_type: string;
  verification_status?: string;
  city?: string;
  state?: string;
  country?: string;
  transport_modes?: string[];
  contact_email?: string;
  contact_phone?: string;
}

export interface LogisticsQuote {
  id: string;
  order_id: string;
  provider_organization_id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  distance_km: number;
  estimated_duration_minutes: number;
  transport_mode: TransportMode;
  base_cost: number;
  fuel_surcharge: number;
  handling_cost: number;
  other_cost: number;
  total_cost: number;
  currency: string;
  estimated_co2e_kg: number;
  valid_until: string;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteDTO {
  order_id: string;
  origin_facility_id?: string;
  destination_facility_id?: string;
  transport_mode: TransportMode;
  base_cost: number;
  fuel_surcharge?: number;
  handling_cost?: number;
  other_cost?: number;
  currency?: string;
  valid_until: string;
  notes?: string;
}

export interface LogisticsQuoteDetail extends LogisticsQuote {
  provider_name?: string;
  order_number?: string;
  order_quantity?: number;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  origin_facility_name?: string;
  origin_city?: string;
  origin_state?: string;
  destination_facility_name?: string;
  destination_city?: string;
  destination_state?: string;
  decision_score?: number;
}

export interface SystemLogisticsEstimate {
  distance_km: number;
  estimated_duration_minutes: number;
  estimated_cost: number;
  estimated_co2e_kg: number;
  origin_city?: string;
  destination_city?: string;
}
