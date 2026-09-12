import { useState, useEffect, useCallback } from 'react';
import { verificationApi, type VerificationRequestItem, type VerificationDetail } from '../api/verificationApi';
import { documentApi, type DocumentItem, type CO2QualityRecordItem } from '../api/documentApi';

export function useVerificationQueue(status?: string, type?: string, organizationId?: string) {
  const [items, setItems] = useState<VerificationRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await verificationApi.listQueue(status, type, organizationId);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  }, [status, type, organizationId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { items, total, loading, error, refetch: fetchQueue };
}

export function useVerificationDetail(id?: string) {
  const [detail, setDetail] = useState<VerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verificationApi.getById(id);
      setDetail(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refetch: fetchDetail };
}

export function useOrganizationDocuments(organizationId?: string) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await documentApi.listByOrganization(organizationId);
      setDocuments(res || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { documents, loading, refetch: fetchDocs };
}

export function useListingQualityRecords(listingId?: string) {
  const [records, setRecords] = useState<CO2QualityRecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await documentApi.getQualityRecords(listingId);
      setRecords(res || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, refetch: fetchRecords };
}
