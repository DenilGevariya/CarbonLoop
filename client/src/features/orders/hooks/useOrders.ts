import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';

export const ORDERS_QUERY_KEY = ['orders'];

export function useOrders(role: 'sent' | 'received' | 'all' = 'all', status?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, role, status],
    queryFn: () => orderApi.getOrders(role, status),
  });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    queryFn: () => (id ? orderApi.getOrderDetail(id) : null),
    enabled: !!id,
    refetchInterval: 10000,
  });
}
