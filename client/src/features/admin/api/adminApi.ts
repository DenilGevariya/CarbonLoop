import { apiClient } from '@/api/client';

export interface AdminOverviewKPIs {
  totalUsersCount: number;
  activeListingsCount: number;
  activeOrganizationsCount: number;
  activeFacilitiesCount: number;
  availableSupplyTonnes: number;
  requestedDemandTonnes: number;
  matchedVolumeTonnes: number;
  activeOrdersCount: number;
  activeShipmentsCount: number;
  pendingVerificationCount: number;
}

export interface NetworkHealthStatus {
  marketplaceStatus: 'HEALTHY' | 'WARNING' | 'UNAVAILABLE';
  matchingStatus: 'HEALTHY' | 'WARNING' | 'UNAVAILABLE';
  logisticsStatus: 'HEALTHY' | 'WARNING' | 'UNAVAILABLE';
  verificationPendingCount: number;
  apiStatus: 'HEALTHY' | 'DEGRADED';
  databaseStatus: 'HEALTHY' | 'UNHEALTHY';
  dbLatencyMs: number;
  postgresVersion?: string;
  uptimeSeconds: number;
}

export interface SystemAlertRecord {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: string;
  entityType?: string | null;
  entityId?: string | null;
  entityIdentifier?: string | null;
  message: string;
  isResolved: boolean;
  resolvedBy?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
}

export interface GlobalSearchResultItem {
  id: string;
  category: 'ORGANIZATION' | 'FACILITY' | 'LISTING' | 'REQUIREMENT' | 'ORDER' | 'SHIPMENT' | 'VERIFICATION';
  title: string;
  subtitle: string;
  status?: string;
  publicCode?: string;
  url: string;
}

export interface AdminOrgListItem {
  id: string;
  name: string;
  slug: string;
  orgType: string;
  verificationStatus: string;
  status: string;
  city?: string;
  state?: string;
  createdAt: string;
  facilitiesCount: number;
  activeListingsCount: number;
  activeRequirementsCount: number;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  roles: string[];
  organizationName?: string;
}

export interface AdminListingListItem {
  id: string;
  publicCode?: string | null;
  title: string;
  organizationName?: string | null;
  facilityName?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  purityPercentage: number;
  physicalForm?: string | null;
  availableQuantityTonnes: number;
  remainingQuantityTonnes: number;
  pricePerTon: number;
  verificationStatus?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  lastUsedAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface MatchExplainFactor {
  factor: string;
  score: number;
  weightPercent: number;
  weightedScore: number;
  explanation: string;
}

export interface MatchDebugDetail {
  matchId: string;
  overallScore: number;
  matchGrade: string;
  listingCode: string;
  requirementCode: string;
  supplierName: string;
  buyerName: string;
  quantityTonnes: number;
  pricePerTon: number;
  purityPercentage: number;
  distanceKm: number;
  verificationStatus: string;
  factors: MatchExplainFactor[];
  eligibilityWarnings: string[];
}

export interface AuditLogRecord {
  id: string;
  userId?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: any;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export const adminApi = {
  getOverview: () =>
    apiClient.get<{ kpis: AdminOverviewKPIs; health: NetworkHealthStatus }>('/admin/overview'),

  getHealth: () =>
    apiClient.get<NetworkHealthStatus>('/admin/health'),

  searchGlobal: (query: string) =>
    apiClient.get<GlobalSearchResultItem[]>(`/admin/search?q=${encodeURIComponent(query)}`),

  getAlerts: (resolved: boolean = false) =>
    apiClient.get<SystemAlertRecord[]>(`/admin/alerts?resolved=${resolved}`),

  resolveAlert: (alertId: string, notes?: string) =>
    apiClient.post<SystemAlertRecord>(`/admin/alerts/${alertId}/resolve`, { notes }),

  listOrganizations: (params?: { type?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return apiClient.get<{ data?: AdminOrgListItem[]; items?: AdminOrgListItem[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
      `/admin/organizations?${q.toString()}`
    );
  },

  getOrganizationDetail: (id: string) =>
    apiClient.get<any>(`/admin/organizations/${id}`),

  setOrganizationStatus: (id: string, status: string, reason?: string) =>
    apiClient.patch<any>(`/admin/organizations/${id}/status`, { status, reason }),

  listListings: (params?: { status?: string; search?: string; minPurity?: number; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.minPurity !== undefined) q.append('minPurity', String(params.minPurity));
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return apiClient.get<{ data?: AdminListingListItem[]; items?: AdminListingListItem[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
      `/admin/listings?${q.toString()}`
    );
  },

  listUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.role) q.append('role', params.role);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return apiClient.get<{ data?: AdminUserListItem[]; items?: AdminUserListItem[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
      `/admin/users?${q.toString()}`
    );
  },

  getUserDetail: (id: string) =>
    apiClient.get<{ user: AdminUserListItem; roles: string[]; sessions: UserSessionRecord[] }>(`/admin/users/${id}`),

  toggleUserActive: (userId: string, isActive: boolean) =>
    apiClient.patch<any>(`/admin/users/${userId}/active`, { isActive }),

  getUserSessions: (userId: string) =>
    apiClient.get<UserSessionRecord[]>(`/admin/users/${userId}/sessions`),

  revokeSession: (sessionId: string) =>
    apiClient.delete<{ success: boolean }>(`/admin/sessions/${sessionId}`),

  getMatchDebug: (matchId: string) =>
    apiClient.get<MatchDebugDetail>(`/admin/matches/${matchId}/debug`),

  listAuditLogs: (params?: { actorId?: string; organizationId?: string; entityType?: string; action?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.actorId) q.append('actorId', params.actorId);
    if (params?.organizationId) q.append('organizationId', params.organizationId);
    if (params?.entityType) q.append('entityType', params.entityType);
    if (params?.action) q.append('action', params.action);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return apiClient.get<{ data?: AuditLogRecord[]; items?: AuditLogRecord[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
      `/admin/audit-logs?${q.toString()}`
    );
  },

  listDisputes: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return apiClient.get<{ data?: any[]; items?: any[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
      `/admin/disputes?${q.toString()}`
    );
  },

  updateDisputeStatus: (id: string, status: string, resolutionNotes?: string) =>
    apiClient.patch<any>(`/admin/disputes/${id}/status`, { status, resolutionNotes }),
};
