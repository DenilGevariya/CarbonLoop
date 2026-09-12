export type VerificationStatus =
  | 'UNVERIFIED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export type VerificationType = 'ORGANIZATION' | 'FACILITY' | 'CO2_PURITY' | 'TECHNICAL_SPECIFICATION';

export interface VerificationRequestRecord {
  id: string;
  organizationId: string;
  organizationName?: string;
  facilityId?: string | null;
  facilityName?: string | null;
  listingId?: string | null;
  listingCode?: string | null;
  documentId?: string | null;
  documentName?: string | null;
  requestedBy?: string | null;
  requestedByName?: string | null;
  verificationType: VerificationType;
  status: VerificationStatus;
  reviewedBy?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  reason?: string | null;
  expiresAt?: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface VerificationHistoryRecord {
  id: string;
  verificationRequestId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  changedByName?: string | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
}

export interface VerificationDetailDTO {
  request: VerificationRequestRecord;
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    status: string;
    verifiedAt?: string | null;
  }[];
  qualityRecords?: {
    id: string;
    purityPercentage: number;
    measurementDate: string;
    laboratoryName: string;
    testMethod?: string | null;
    sampleReference?: string | null;
    notes?: string | null;
  }[];
  history: VerificationHistoryRecord[];
  ruleCheck: {
    valid: boolean;
    missingDocumentTypes: string[];
    requiredDocumentTypes: string[];
  };
}

export interface SubmitVerificationDTO {
  organizationId: string;
  facilityId?: string;
  listingId?: string;
  documentId?: string;
  verificationType: VerificationType;
  notes?: string;
}

export interface ProcessReviewDTO {
  action: 'START' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes?: string;
  reason?: string;
  expiryMonths?: number;
  latestVerifiedPurity?: number;
}
