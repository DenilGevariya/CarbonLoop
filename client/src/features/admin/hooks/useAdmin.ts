import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import type {
  AdminOverviewKPIs,
  NetworkHealthStatus,
  SystemAlertRecord,
  AdminOrgListItem,
  AdminUserListItem,
  AuditLogRecord,
} from '../api/adminApi';

export function useAdminOverview() {
  const [kpis, setKpis] = useState<AdminOverviewKPIs | null>(null);
  const [health, setHealth] = useState<NetworkHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getOverview();
      if (res?.kpis) setKpis(res.kpis);
      if (res?.health) setHealth(res.health);
    } catch (err: any) {
      setError(err?.message || 'Failed to load command center overview.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { kpis, health, isLoading, error, refresh: fetchOverview };
}

export function useAdminAlerts(resolved: boolean = false) {
  const [alerts, setAlerts] = useState<SystemAlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getAlerts(resolved);
      // Alerts returns { data: [...] } after apiClient fix, or plain array
      const alertData = Array.isArray(res) ? res : ((res as any)?.data || []);
      setAlerts(alertData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load system alerts.');
    } finally {
      setIsLoading(false);
    }
  }, [resolved]);

  const resolveAlert = async (alertId: string, notes?: string) => {
    const res = await adminApi.resolveAlert(alertId, notes);
    await fetchAlerts();
    return res;
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, isLoading, error, refresh: fetchAlerts, resolveAlert };
}

export function useAdminOrganizations(params?: { type?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const [items, setItems] = useState<AdminOrgListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.listOrganizations(params);
      // Backend returns { data: [...], pagination } — apiClient now preserves this shape
      const orgData = (res as any)?.data || (res as any)?.items || (Array.isArray(res) ? res : []);
      const paginationData = (res as any)?.pagination;
      if (Array.isArray(orgData)) setItems(orgData);
      if (paginationData) setPagination(paginationData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load organizations.');
    } finally {
      setIsLoading(false);
    }
  }, [params?.type, params?.status, params?.search, params?.page, params?.limit]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  return { items, pagination, isLoading, error, refresh: fetchOrgs };
}

export function useAdminUsers(params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.listUsers(params);
      // Backend returns { data: [...], pagination } — apiClient now preserves this shape
      const userData = (res as any)?.data || (res as any)?.items || (Array.isArray(res) ? res : []);
      const paginationData = (res as any)?.pagination;
      if (Array.isArray(userData)) setItems(userData);
      if (paginationData) setPagination(paginationData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [params?.role, params?.status, params?.search, params?.page, params?.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { items, pagination, isLoading, error, refresh: fetchUsers };
}

export function useAdminAuditLogs(params?: { actorId?: string; organizationId?: string; entityType?: string; action?: string; search?: string; page?: number; limit?: number }) {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.listAuditLogs(params);
      // Backend returns { data: [...], pagination } — apiClient now preserves this shape
      const logData = (res as any)?.data || (res as any)?.items || (Array.isArray(res) ? res : []);
      const paginationData = (res as any)?.pagination;
      if (Array.isArray(logData)) setItems(logData);
      if (paginationData) setPagination(paginationData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [params?.actorId, params?.organizationId, params?.entityType, params?.action, params?.search, params?.page, params?.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { items, pagination, isLoading, error, refresh: fetchLogs };
}
