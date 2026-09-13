import { apiClient } from '@/api/client';
import type { TransportMode } from '@/features/logistics/api/logisticsApi';

export type ShipmentStatus =
  | 'PLANNED'
  | 'SCHEDULED'
  | 'TRANSPORTER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'BUYER_CONFIRMED_RECEIPT'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'EXCEPTION';

export interface RouteStop {
  id: string;
  shipment_id: string;
  sequence_number: number;
  location_name: string;
  location_type: 'ORIGIN' | 'WAYPOINT' | 'DEPOT' | 'DESTINATION' | 'CHECKPOINT';
  latitude?: number;
  longitude?: number;
  arrival_estimate?: string;
  departure_estimate?: string;
  actual_arrival?: string;
  actual_departure?: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  status: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  occurred_at: string;
  created_at: string;
}

export interface ShipmentStatusHistory {
  id: string;
  shipment_id: string;
  from_status?: string;
  to_status: string;
  changed_by_name?: string;
  reason?: string;
  created_at: string;
}

export interface ShipmentItem {
  id: string;
  shipment_number: string;
  order_id: string;
  order_number?: string;
  logistics_provider_id: string;
  provider_name?: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  origin_facility_id?: string;
  origin_facility_name?: string;
  origin_city?: string;
  origin_state?: string;
  destination_facility_id?: string;
  destination_facility_name?: string;
  destination_city?: string;
  destination_state?: string;
  quantity: number;
  quantity_unit?: string;
  scheduled_pickup_at?: string;
  actual_pickup_at?: string;
  estimated_delivery_at?: string;
  actual_delivery_at?: string;
  distance_km: number;
  transport_mode: TransportMode;
  tracking_reference: string;
  status: ShipmentStatus;
  is_overdue?: boolean;
  delivery_deadline?: string;
  vehicle_availability_confirmed?: boolean;
  route_accepted?: boolean;
  exception_reason?: string;
  exception_notes?: string;
  destination_address?: string;
  created_at: string;
  updated_at: string;
  routes?: RouteStop[];
  events?: TrackingEvent[];
  status_history?: ShipmentStatusHistory[];
}

export const shipmentApi = {
  getShipments: (role: 'sent' | 'received' | 'all' = 'all', orderId?: string, status?: string) => {
    let url = `/shipments?role=${role}`;
    if (orderId) url += `&order_id=${orderId}`;
    if (status) url += `&status=${status}`;
    return apiClient.get<{ items: ShipmentItem[]; total: number }>(url);
  },
  getShipmentDetail: (idOrNumber: string) => apiClient.get<ShipmentItem>(`/shipments/${idOrNumber}`),
  scheduleShipment: (id: string, pickupAt?: string, deliveryAt?: string) =>
    apiClient.post<ShipmentItem>(`/shipments/${id}/schedule`, { scheduled_pickup_at: pickupAt, estimated_delivery_at: deliveryAt }),
  pickupShipment: (id: string, notes?: string) => apiClient.post<ShipmentItem>(`/shipments/${id}/pickup`, { notes }),
  departShipment: (id: string, notes?: string) => apiClient.post<ShipmentItem>(`/shipments/${id}/depart`, { notes }),
  arriveShipment: (id: string, notes?: string) => apiClient.post<ShipmentItem>(`/shipments/${id}/arrive`, { notes }),
  deliverShipment: (id: string, notes?: string) => apiClient.post<ShipmentItem>(`/shipments/${id}/deliver`, { notes }),
  confirmReceipt: (id: string, notes?: string) => apiClient.post<ShipmentItem>(`/shipments/${id}/confirm-receipt`, { notes }),
  reportException: (id: string, reason: string, notes?: string) =>
    apiClient.post<ShipmentItem>(`/shipments/${id}/report-exception`, { reason, notes }),
  addTrackingEvent: (id: string, event_type: string, location_name: string, latitude?: number, longitude?: number, notes?: string) =>
    apiClient.post<TrackingEvent>(`/shipments/${id}/events`, { event_type, location_name, latitude, longitude, notes }),
};
