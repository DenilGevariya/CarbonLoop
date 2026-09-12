export interface DocumentRecord {
  id: string;
  organizationId: string;
  facilityId?: string | null;
  uploadedBy?: string | null;
  documentType: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  checksum?: string | null;
  description?: string | null;
  status: 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  expiresAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface CO2QualityRecord {
  id: string;
  listingId: string;
  documentId?: string | null;
  purityPercentage: number;
  measurementDate: string;
  laboratoryName: string;
  testMethod?: string | null;
  sampleReference?: string | null;
  notes?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
}
