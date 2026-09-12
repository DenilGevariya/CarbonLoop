export type ShipmentStatus =
  | 'PLANNED'
  | 'SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXCEPTION';

export interface RouteStop {
  id: string;
  shipment_id: string;
  sequence_number: number;
  location_name: string;
  location_type: 'ORIGIN' | 'WAYPOINT' | 'DEPOT' | 'DESTINATION';
  latitude?: number | null;
  longitude?: number | null;
  arrival_estimate?: string | null;
  departure_estimate?: string | null;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  status?: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  occurred_at: string;
  created_at: string;
}

export interface Shipment {
  id: string;
  shipment_number: string;
  order_id: string;
  logistics_provider_id: string;
  quote_id?: string | null;
  origin_facility_id?: string | null;
  destination_facility_id?: string | null;
  quantity: number;
  quantity_unit: string;
  scheduled_pickup_at?: string | null;
  actual_pickup_at?: string | null;
  estimated_delivery_at?: string | null;
  actual_delivery_at?: string | null;
  distance_km: number;
  transport_mode: string;
  tracking_reference: string;
  destination_address?: string | null;
  exception_reason?: string | null;
  exception_notes?: string | null;
  notes?: string | null;
  status: ShipmentStatus;
  created_at: string;
  updated_at: string;
}

export interface ShipmentDetail extends Shipment {
  provider_name?: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  order_number?: string;
  listing_title?: string;
  listing_purity?: number;
  origin_facility_name?: string;
  origin_city?: string;
  origin_state?: string;
  destination_facility_name?: string;
  destination_city?: string;
  destination_state?: string;
  routes?: RouteStop[];
  events?: TrackingEvent[];
  status_history?: any[];
}
