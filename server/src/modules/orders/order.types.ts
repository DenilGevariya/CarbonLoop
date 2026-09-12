export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PREPARATION'
  | 'READY_FOR_SHIPMENT'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CommercialSnapshot {
  offer_number: string;
  offer_id: string;
  inquiry_id?: string;
  version: number;
  accepted_at: string;
  accepted_by_user_id: string;
  listing_title: string;
  listing_purity_percentage: number;
  seller_facility_name?: string;
  seller_location?: string;
  buyer_location?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  delivery_cost: number;
  total_amount: number;
  currency: string;
}

export interface Order {
  id: string;
  order_number: string;
  offer_id: string;
  listing_id: string;
  requirement_id?: string | null;
  buyer_organization_id: string;
  seller_organization_id: string;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  currency: string;
  subtotal_amount: number;
  delivery_cost: number;
  total_amount: number;
  status: OrderStatus;
  destination_address?: string | null;
  commercial_snapshot: CommercialSnapshot;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  requirement_title?: string;
  status_history?: any[];
}
