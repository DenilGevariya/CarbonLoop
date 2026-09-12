import { apiClient } from '@/api/client';

export interface DocumentItem {
  id: string;
  organizationId: string;
  facilityId?: string;
  uploadedBy?: string;
  documentType: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  checksum?: string;
  description?: string;
  status: string;
  expiresAt?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface CO2QualityRecordItem {
  id: string;
  listingId: string;
  documentId?: string;
  purityPercentage: number;
  measurementDate: string;
  laboratoryName: string;
  testMethod?: string;
  sampleReference?: string;
  notes?: string;
  verifiedBy?: string;
  createdAt: string;
}

export const documentApi = {
  uploadBase64: (payload: {
    organizationId: string;
    facilityId?: string;
    listingId?: string;
    documentType: string;
    fileName: string;
    fileBase64: string;
    mimeType?: string;
    description?: string;
  }) => apiClient.post<DocumentItem>('/documents/upload', payload),

  listByOrganization: (organizationId: string) =>
    apiClient.get<DocumentItem[]>(`/documents/organization/${organizationId}`),

  getById: (id: string) => apiClient.get<DocumentItem>(`/documents/${id}`),

  getQualityRecords: (listingId: string) =>
    apiClient.get<CO2QualityRecordItem[]>(`/documents/listings/${listingId}/quality-records`),

  createQualityRecord: (listingId: string, payload: {
    purityPercentage: number;
    measurementDate: string;
    laboratoryName: string;
    documentId?: string;
    testMethod?: string;
    sampleReference?: string;
    notes?: string;
  }) => apiClient.post<CO2QualityRecordItem>(`/documents/listings/${listingId}/quality-records`, payload),
};
