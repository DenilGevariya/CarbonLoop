import { DocumentRepository } from './document.repository';
import { defaultStorageProvider } from '../../services/storage/storage.service';

export class DocumentService {
  private repo: DocumentRepository;

  constructor() {
    this.repo = new DocumentRepository();
  }

  public async uploadDocument(params: {
    organizationId: string;
    facilityId?: string;
    listingId?: string;
    uploadedBy: string;
    documentType: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    description?: string;
  }) {
    // 1. Upload to storage provider
    const fileResult = await defaultStorageProvider.uploadFile({
      fileName: params.fileName,
      mimeType: params.mimeType,
      buffer: params.buffer,
      organizationId: params.organizationId,
      documentType: params.documentType,
    });

    // 2. Insert record into database
    const doc = await this.repo.createDocument({
      organizationId: params.organizationId,
      facilityId: params.facilityId,
      uploadedBy: params.uploadedBy,
      documentType: params.documentType,
      fileName: fileResult.fileName,
      storageKey: fileResult.storageKey,
      mimeType: fileResult.mimeType,
      fileSize: fileResult.fileSize,
      checksum: fileResult.checksum,
      description: params.description,
    });

    // 3. Optional: Link to listing
    if (params.listingId) {
      await this.repo.linkDocumentToListing(params.listingId, doc.id);
    }

    return doc;
  }

  public async getById(id: string) {
    return this.repo.getById(id);
  }

  public async getByStorageKey(storageKey: string) {
    return this.repo.getByStorageKey(storageKey);
  }

  public async listByOrganization(organizationId: string) {
    return this.repo.listByOrganization(organizationId);
  }

  public async createQualityRecord(params: {
    listingId: string;
    documentId?: string;
    purityPercentage: number;
    measurementDate: string;
    laboratoryName: string;
    testMethod?: string;
    sampleReference?: string;
    notes?: string;
    verifiedBy?: string;
  }) {
    return this.repo.createQualityRecord(params);
  }

  public async getQualityRecordsByListing(listingId: string) {
    return this.repo.getQualityRecordsByListing(listingId);
  }
}
