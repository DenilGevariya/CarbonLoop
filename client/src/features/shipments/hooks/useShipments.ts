import { useState, useEffect, useCallback } from 'react';
import { shipmentApi } from '../api/shipmentApi';
import type { ShipmentItem } from '../api/shipmentApi';

export function useShipments(role: 'sent' | 'received' | 'all' = 'all', orderId?: string, status?: string) {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await shipmentApi.getShipments(role, orderId, status);
      setShipments(res?.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [role, orderId, status]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return { shipments, loading, error, refetch: fetchShipments };
}

export function useShipmentDetail(idOrNumber?: string) {
  const [shipment, setShipment] = useState<ShipmentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!idOrNumber) return;
    try {
      setLoading(true);
      setError(null);
      const res = await shipmentApi.getShipmentDetail(idOrNumber);
      setShipment(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load shipment tracking details');
    } finally {
      setLoading(false);
    }
  }, [idOrNumber]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { shipment, loading, error, refetch: fetchDetail };
}
