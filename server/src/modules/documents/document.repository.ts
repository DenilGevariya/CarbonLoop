import { query } from '../../config/database';
import { DocumentRecord, CO2QualityRecord } from './document.types';

export class DocumentRepository {
  public async createDocument(params: {
    organizationId: string;
    facilityId?: string;
    uploadedBy: string;
    documentType: string;
    fileName: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
    checksum?: string;
    description?: string;
  }): Promise<DocumentRecord> {
    const sql = `
      INSERT INTO documents (
        organization_id, facility_id, uploaded_by, document_type,
        file_name, storage_key, mime_type, file_size, checksum, description, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'UPLOADED', NOW(), NOW())
      RETURNING 
        id,
        organization_id as "organizationId",
        facility_id as "facilityId",
        uploaded_by as "uploadedBy",
        document_type as "documentType",
        file_name as "fileName",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size as "fileSize",
        checksum,
        description,
        status,
        expires_at as "expiresAt",
        verified_at as "verifiedAt",
        created_at as "createdAt"
    `;

    const res = await query(sql, [
      params.organizationId,
      params.facilityId || null,
      params.uploadedBy,
      params.documentType,
      params.fileName,
      params.storageKey,
      params.mimeType,
      params.fileSize,
      params.checksum || null,
      params.description || null,
    ]);

    return res.rows[0];
  }

  public async linkDocumentToListing(listingId: string, documentId: string, documentRole: string = 'purity_proof'): Promise<void> {
    await query(
      `INSERT INTO co2_listing_documents (listing_id, document_id, document_role)
       VALUES ($1, $2, $3)
       ON CONFLICT (listing_id, document_id) DO NOTHING`,
      [listingId, documentId, documentRole]
    );
  }

  public async getById(id: string): Promise<DocumentRecord | null> {
    const sql = `
      SELECT 
        id,
        organization_id as "organizationId",
        facility_id as "facilityId",
        uploaded_by as "uploadedBy",
        document_type as "documentType",
        file_name as "fileName",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size as "fileSize",
        checksum,
        description,
        status,
        expires_at as "expiresAt",
        verified_at as "verifiedAt",
        created_at as "createdAt"
      FROM documents
      WHERE id = $1
    `;
    const res = await query(sql, [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  public async getByStorageKey(storageKey: string): Promise<DocumentRecord | null> {
    const sql = `
      SELECT 
        id,
        organization_id as "organizationId",
        facility_id as "facilityId",
        uploaded_by as "uploadedBy",
        document_type as "documentType",
        file_name as "fileName",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size as "fileSize",
        checksum,
        description,
        status,
        expires_at as "expiresAt",
        verified_at as "verifiedAt",
        created_at as "createdAt"
      FROM documents
      WHERE storage_key = $1
    `;
    const res = await query(sql, [storageKey]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  public async listByOrganization(organizationId: string): Promise<DocumentRecord[]> {
    const sql = `
      SELECT 
        id,
        organization_id as "organizationId",
        facility_id as "facilityId",
        uploaded_by as "uploadedBy",
        document_type as "documentType",
        file_name as "fileName",
        storage_key as "storageKey",
        mime_type as "mimeType",
        file_size as "fileSize",
        checksum,
        description,
        status,
        expires_at as "expiresAt",
        verified_at as "verifiedAt",
        created_at as "createdAt"
      FROM documents
      WHERE organization_id = $1
      ORDER BY created_at DESC
    `;
    const res = await query(sql, [organizationId]);
    return res.rows;
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
  }): Promise<CO2QualityRecord> {
    const sql = `
      INSERT INTO co2_quality_records (
        listing_id, document_id, purity_percentage, measurement_date, laboratory_name, test_method, sample_reference, notes, verified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id,
        listing_id as "listingId",
        document_id as "documentId",
        purity_percentage as "purityPercentage",
        measurement_date as "measurementDate",
        laboratory_name as "laboratoryName",
        test_method as "testMethod",
        sample_reference as "sampleReference",
        notes,
        verified_by as "verifiedBy",
        created_at as "createdAt"
    `;

    const res = await query(sql, [
      params.listingId,
      params.documentId || null,
      params.purityPercentage,
      params.measurementDate,
      params.laboratoryName,
      params.testMethod || null,
      params.sampleReference || null,
      params.notes || null,
      params.verifiedBy || null,
    ]);

    // Also update latest_verified_purity on listing
    await query(
      `UPDATE co2_listings SET latest_verified_purity = $2 WHERE id = $1`,
      [params.listingId, params.purityPercentage]
    );

    return res.rows[0];
  }

  public async getQualityRecordsByListing(listingId: string): Promise<CO2QualityRecord[]> {
    const sql = `
      SELECT 
        id,
        listing_id as "listingId",
        document_id as "documentId",
        purity_percentage as "purityPercentage",
        measurement_date as "measurementDate",
        laboratory_name as "laboratoryName",
        test_method as "testMethod",
        sample_reference as "sampleReference",
        notes,
        verified_by as "verifiedBy",
        created_at as "createdAt"
      FROM co2_quality_records
      WHERE listing_id = $1
      ORDER BY measurement_date DESC
    `;
    const res = await query(sql, [listingId]);
    return res.rows;
  }
}
