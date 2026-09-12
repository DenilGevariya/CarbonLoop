import { apiClient } from '@/api/client';

export interface OrderItem {
  id: string;
  order_number: string;
  offer_id: string;
  listing_id: string;
  requirement_id?: string;
  buyer_organization_id: string;
  seller_organization_id: string;
  buyer_organization_name?: string;
  seller_organization_name?: string;
  listing_title?: string;
  listing_purity?: number;
  quantity: number;
  quantity_unit: string;
  unit_price: number;
  currency: string;
  subtotal_amount: number;
  delivery_cost: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PREPARATION' | 'READY_FOR_SHIPMENT' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  destination_address?: string;
  commercial_snapshot?: any;
  status_history?: any[];
  created_at: string;
  updated_at: string;
}

export const orderApi = {
  getOrders: (role: 'sent' | 'received' | 'all' = 'all', status?: string) =>
    apiClient.get<OrderItem[]>(`/orders?role=${role}${status ? `&status=${status}` : ''}`),
  getOrderDetail: (id: string) => apiClient.get<OrderItem>(`/orders/${id}`),
};
