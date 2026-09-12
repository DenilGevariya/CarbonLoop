export interface AdminOverviewKPIs {
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
