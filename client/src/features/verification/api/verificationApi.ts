import { apiClient } from '@/api/client';

export type VerificationType = 'ORGANIZATION' | 'FACILITY' | 'CO2_PURITY' | 'TECHNICAL_SPECIFICATION';
export type VerificationStatus = 'UNVERIFIED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CHANGES_REQUESTED' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

export interface VerificationRequestItem {
  id: string;
  organizationId: string;
  organizationName?: string;
  facilityId?: string;
  facilityName?: string;
  listingId?: string;
  listingCode?: string;
  documentId?: string;
  documentName?: string;
  requestedBy?: string;
  requestedByName?: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  reason?: string;
  expiresAt?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface VerificationDetail {
  request: VerificationRequestItem;
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    status: string;
    verifiedAt?: string;
  }[];
  qualityRecords?: {
    id: string;
    purityPercentage: number;
    measurementDate: string;
    laboratoryName: string;
    testMethod?: string;
    sampleReference?: string;
    notes?: string;
  }[];
  history: {
    id: string;
    verificationRequestId: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: string | null;
    changedByName?: string;
    reason: string | null;
    notes: string | null;
    createdAt: string;
  }[];
  ruleCheck: {
    valid: boolean;
    missingDocumentTypes: string[];
    requiredDocumentTypes: string[];
  };
}

export interface SubmitVerificationPayload {
  organizationId: string;
  facilityId?: string;
  listingId?: string;
  documentId?: string;
  verificationType: VerificationType;
  notes?: string;
}

export interface ProcessReviewPayload {
  action: 'START' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
  reason?: string;
  expiryMonths?: number;
  latestVerifiedPurity?: number;
}

export const verificationApi = {
  submitRequest: (payload: SubmitVerificationPayload) =>
    apiClient.post<VerificationRequestItem>('/verification/requests', payload),

  listQueue: (status?: string, type?: string, organizationId?: string) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (type) query.append('type', type);
    if (organizationId) query.append('organizationId', organizationId);
    return apiClient.get<{ items: VerificationRequestItem[]; total: number }>(`/verification/requests?${query.toString()}`);
  },

  getById: (id: string) => apiClient.get<VerificationDetail>(`/verification/requests/${id}`),

  processReview: (id: string, payload: ProcessReviewPayload) =>
    apiClient.post<VerificationRequestItem>(`/verification/requests/${id}/review`, payload),
};
