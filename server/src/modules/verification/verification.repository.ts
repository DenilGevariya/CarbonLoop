import { query, pool } from '../../config/database';
import {
  VerificationRequestRecord,
  VerificationHistoryRecord,
  VerificationDetailDTO,
  SubmitVerificationDTO,
} from './verification.types';
import { validateRequiredDocuments } from './verification.rules';

export class VerificationRepository {
  public async submitRequest(
    userId: string,
    dto: SubmitVerificationDTO
  ): Promise<VerificationRequestRecord> {
    const res = await query(
      `INSERT INTO verification_requests (
        organization_id, facility_id, listing_id, document_id, requested_by,
        request_type, verification_type, status, notes, submitted_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $6, 'SUBMITTED', $7, NOW(), NOW())
      RETURNING *`,
      [
        dto.organizationId,
        dto.facilityId || null,
        dto.listingId || null,
        dto.documentId || null,
        userId,
        dto.verificationType,
        dto.notes || null,
      ]
    );

    const rec = res.rows[0];

    // Log history
    await query(
      `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
       VALUES ($1, NULL, 'SUBMITTED', $2, $3)`,
      [rec.id, userId, dto.notes || 'Verification request submitted by organization.']
    );

    return this.getById(rec.id);
  }

  public async getById(id: string): Promise<VerificationRequestRecord> {
    const sql = `
      SELECT 
        vr.id,
        vr.organization_id as "organizationId",
        o.name as "organizationName",
        vr.facility_id as "facilityId",
        f.name as "facilityName",
        vr.listing_id as "listingId",
        l.listing_code as "listingCode",
        vr.document_id as "documentId",
        d.file_name as "documentName",
        vr.requested_by as "requestedBy",
        CONCAT(u1.first_name, ' ', u1.last_name) as "requestedByName",
        vr.verification_type as "verificationType",
        vr.status,
        vr.reviewed_by as "reviewedBy",
        CONCAT(u2.first_name, ' ', u2.last_name) as "reviewedByName",
        vr.reviewed_at as "reviewedAt",
        vr.review_notes as "reviewNotes",
        vr.reason,
        vr.expires_at as "expiresAt",
        vr.submitted_at as "submittedAt",
        vr.updated_at as "updatedAt"
      FROM verification_requests vr
      JOIN organizations o ON vr.organization_id = o.id
      LEFT JOIN facilities f ON vr.facility_id = f.id
      LEFT JOIN co2_listings l ON vr.listing_id = l.id
      LEFT JOIN documents d ON vr.document_id = d.id
      LEFT JOIN users u1 ON vr.requested_by = u1.id
      LEFT JOIN users u2 ON vr.reviewed_by = u2.id
      WHERE vr.id = $1
    `;

    const res = await query(sql, [id]);
    if (res.rows.length === 0) {
      throw new Error(`Verification request with ID ${id} not found.`);
    }

    return res.rows[0];
  }

  public async getDetailById(id: string): Promise<VerificationDetailDTO> {
    const request = await this.getById(id);

    // Fetch documents linked to Organization, Facility, or Listing
    const docSql = `
      SELECT 
        d.id,
        d.document_type as "documentType",
        d.file_name as "fileName",
        d.file_size as "fileSize",
        d.mime_type as "mimeType",
        d.created_at as "uploadedAt",
        d.status,
        d.verified_at as "verifiedAt"
      FROM documents d
      WHERE d.organization_id = $1
        OR ($2::uuid IS NOT NULL AND d.facility_id = $2::uuid)
        OR ($3::uuid IS NOT NULL AND d.id IN (SELECT document_id FROM co2_listing_documents WHERE listing_id = $3::uuid))
        OR ($4::uuid IS NOT NULL AND d.id = $4::uuid)
    `;

    const docsRes = await query(docSql, [
      request.organizationId,
      request.facilityId || null,
      request.listingId || null,
      request.documentId || null,
    ]);

    const docs = docsRes.rows;

    // Fetch quality records if listing exists
    let qualityRecords: any[] = [];
    if (request.listingId) {
      const qRes = await query(
        `SELECT 
           id,
           purity_percentage as "purityPercentage",
           measurement_date as "measurementDate",
           laboratory_name as "laboratoryName",
           test_method as "testMethod",
           sample_reference as "sampleReference",
           notes
         FROM co2_quality_records
         WHERE listing_id = $1
         ORDER BY measurement_date DESC`,
        [request.listingId]
      );
      qualityRecords = qRes.rows;
    }

    // Fetch history
    const histRes = await query(
      `SELECT 
         vh.id,
         vh.verification_request_id as "verificationRequestId",
         vh.from_status as "fromStatus",
         vh.to_status as "toStatus",
         vh.changed_by as "changedBy",
         CONCAT(u.first_name, ' ', u.last_name) as "changedByName",
         vh.reason,
         vh.notes,
         vh.created_at as "createdAt"
       FROM verification_history vh
       LEFT JOIN users u ON vh.changed_by = u.id
       WHERE vh.verification_request_id = $1
       ORDER BY vh.created_at ASC`,
      [id]
    );

    const docTypes = docs.map((d: any) => d.documentType);
    const ruleCheck = validateRequiredDocuments(request.verificationType, docTypes);

    return {
      request,
      documents: docs,
      qualityRecords,
      history: histRes.rows,
      ruleCheck: {
        valid: ruleCheck.valid,
        missingDocumentTypes: ruleCheck.missingDocumentTypes,
        requiredDocumentTypes: [],
      },
    };
  }

  public async listQueue(params: {
    status?: string;
    type?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: VerificationRequestRecord[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.status) {
      values.push(params.status.toUpperCase());
      conditions.push(`vr.status = $${values.length}`);
    }

    if (params.type) {
      values.push(params.type.toUpperCase());
      conditions.push(`vr.verification_type = $${values.length}`);
    }

    if (params.organizationId) {
      values.push(params.organizationId);
      conditions.push(`vr.organization_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(vr.id) as total FROM verification_requests vr ${whereClause}`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const sql = `
      SELECT 
        vr.id,
        vr.organization_id as "organizationId",
        o.name as "organizationName",
        vr.facility_id as "facilityId",
        f.name as "facilityName",
        vr.listing_id as "listingId",
        l.listing_code as "listingCode",
        vr.document_id as "documentId",
        d.file_name as "documentName",
        vr.requested_by as "requestedBy",
        CONCAT(u1.first_name, ' ', u1.last_name) as "requestedByName",
        vr.verification_type as "verificationType",
        vr.status,
        vr.reviewed_by as "reviewedBy",
        CONCAT(u2.first_name, ' ', u2.last_name) as "reviewedByName",
        vr.reviewed_at as "reviewedAt",
        vr.review_notes as "reviewNotes",
        vr.reason,
        vr.expires_at as "expiresAt",
        vr.submitted_at as "submittedAt",
        vr.updated_at as "updatedAt"
      FROM verification_requests vr
      JOIN organizations o ON vr.organization_id = o.id
      LEFT JOIN facilities f ON vr.facility_id = f.id
      LEFT JOIN co2_listings l ON vr.listing_id = l.id
      LEFT JOIN documents d ON vr.document_id = d.id
      LEFT JOIN users u1 ON vr.requested_by = u1.id
      LEFT JOIN users u2 ON vr.reviewed_by = u2.id
      ${whereClause}
      ORDER BY 
        CASE vr.status
          WHEN 'SUBMITTED' THEN 1
          WHEN 'UNDER_REVIEW' THEN 2
          WHEN 'CHANGES_REQUESTED' THEN 3
          ELSE 4
        END,
        vr.submitted_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const res = await query(sql, values);
    return { items: res.rows, total };
  }

  public async startReview(requestId: string, reviewerId: string): Promise<VerificationRequestRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockRes = await client.query(
        `SELECT * FROM verification_requests WHERE id = $1 FOR UPDATE`,
        [requestId]
      );
      if (lockRes.rows.length === 0) {
        throw new Error(`Verification request ${requestId} not found.`);
      }

      const req = lockRes.rows[0];
      const fromStatus = req.status;

      await client.query(
        `UPDATE verification_requests 
         SET status = 'UNDER_REVIEW', reviewed_by = $2, updated_at = NOW()
         WHERE id = $1`,
        [requestId, reviewerId]
      );

      await client.query(
        `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
         VALUES ($1, $2, 'UNDER_REVIEW', $3, 'Reviewer started verification assessment.')`,
        [requestId, fromStatus, reviewerId]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getById(requestId);
  }

  public async approveRequest(
    requestId: string,
    reviewerId: string,
    notes?: string,
    expiryMonths: number = 12,
    latestVerifiedPurity?: number
  ): Promise<VerificationRequestRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockRes = await client.query(
        `SELECT * FROM verification_requests WHERE id = $1 FOR UPDATE`,
        [requestId]
      );
      if (lockRes.rows.length === 0) {
        throw new Error(`Verification request ${requestId} not found.`);
      }

      const req = lockRes.rows[0];
      const fromStatus = req.status;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

      // 1. Update request
      await client.query(
        `UPDATE verification_requests 
         SET status = 'VERIFIED', reviewed_by = $2, reviewed_at = NOW(), review_notes = $3, expires_at = $4, updated_at = NOW()
         WHERE id = $1`,
        [requestId, reviewerId, notes || 'Verified after technical documentation review.', expiresAt]
      );

      // 2. Update target entity
      if (req.verification_type === 'ORGANIZATION') {
        await client.query(
          `UPDATE organizations 
           SET verification_status = 'VERIFIED', verified_at = NOW(), verification_expires_at = $2, verified_by = $3
           WHERE id = $1`,
          [req.organization_id, expiresAt, reviewerId]
        );
      } else if (req.verification_type === 'FACILITY' && req.facility_id) {
        await client.query(
          `UPDATE facilities 
           SET verification_status = 'VERIFIED', verified_at = NOW(), verification_expires_at = $2, verified_by = $3
           WHERE id = $1`,
          [req.facility_id, expiresAt, reviewerId]
        );
      } else if (req.listing_id) {
        await client.query(
          `UPDATE co2_listings 
           SET verification_status = 'VERIFIED', verified_at = NOW(), verification_expires_at = $2, verified_by = $3
               ${latestVerifiedPurity !== undefined ? `, latest_verified_purity = ${latestVerifiedPurity}` : ''}
           WHERE id = $1`,
          [req.listing_id, expiresAt, reviewerId]
        );

        if (latestVerifiedPurity !== undefined) {
          await client.query(
            `INSERT INTO co2_quality_records (listing_id, document_id, purity_percentage, measurement_date, laboratory_name, notes, verified_by)
             VALUES ($1, $2, $3, CURRENT_DATE, 'Certified Network Laboratory', $4, $5)`,
            [req.listing_id, req.document_id || null, latestVerifiedPurity, notes || 'Verified lab assay result', reviewerId]
          );
        }
      }

      // 3. Update documents to VERIFIED
      if (req.document_id) {
        await client.query(
          `UPDATE documents SET status = 'VERIFIED', verified_at = NOW(), verified_by = $2 WHERE id = $1`,
          [req.document_id, reviewerId]
        );
      } else {
        await client.query(
          `UPDATE documents SET status = 'VERIFIED', verified_at = NOW(), verified_by = $2 WHERE organization_id = $1`,
          [req.organization_id, reviewerId]
        );
      }

      // 4. Log history
      await client.query(
        `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
         VALUES ($1, $2, 'VERIFIED', $3, $4)`,
        [requestId, fromStatus, reviewerId, notes || 'Verification evidence approved.']
      );

      // 5. Audit Log & Notification
      await client.query(
        `INSERT INTO audit_logs (organization_id, user_id, actor_user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, $2, 'VERIFICATION_APPROVED', 'VERIFICATION_REQUEST', $3, $4)`,
        [req.organization_id, reviewerId, requestId, JSON.stringify({ type: req.verification_type, expiresAt })]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getById(requestId);
  }

  public async rejectRequest(
    requestId: string,
    reviewerId: string,
    notes: string,
    reason?: string
  ): Promise<VerificationRequestRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockRes = await client.query(
        `SELECT * FROM verification_requests WHERE id = $1 FOR UPDATE`,
        [requestId]
      );
      if (lockRes.rows.length === 0) {
        throw new Error(`Verification request ${requestId} not found.`);
      }

      const req = lockRes.rows[0];
      const fromStatus = req.status;

      await client.query(
        `UPDATE verification_requests 
         SET status = 'REJECTED', reviewed_by = $2, reviewed_at = NOW(), review_notes = $3, reason = $4, updated_at = NOW()
         WHERE id = $1`,
        [requestId, reviewerId, notes, reason || 'Evidence failed verification criteria.']
      );

      if (req.verification_type === 'ORGANIZATION') {
        await client.query(`UPDATE organizations SET verification_status = 'REJECTED' WHERE id = $1`, [req.organization_id]);
      } else if (req.facility_id) {
        await client.query(`UPDATE facilities SET verification_status = 'REJECTED' WHERE id = $1`, [req.facility_id]);
      } else if (req.listing_id) {
        await client.query(`UPDATE co2_listings SET verification_status = 'REJECTED' WHERE id = $1`, [req.listing_id]);
      }

      await client.query(
        `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, reason, notes)
         VALUES ($1, $2, 'REJECTED', $3, $4, $5)`,
        [requestId, fromStatus, reviewerId, reason || null, notes]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getById(requestId);
  }

  public async requestChanges(
    requestId: string,
    reviewerId: string,
    notes: string
  ): Promise<VerificationRequestRecord> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockRes = await client.query(`SELECT * FROM verification_requests WHERE id = $1 FOR UPDATE`, [requestId]);
      if (lockRes.rows.length === 0) throw new Error(`Verification request ${requestId} not found.`);

      const req = lockRes.rows[0];
      const fromStatus = req.status;

      await client.query(
        `UPDATE verification_requests 
         SET status = 'CHANGES_REQUESTED', reviewed_by = $2, reviewed_at = NOW(), review_notes = $3, updated_at = NOW()
         WHERE id = $1`,
        [requestId, reviewerId, notes]
      );

      if (req.verification_type === 'ORGANIZATION') {
        await client.query(`UPDATE organizations SET verification_status = 'CHANGES_REQUESTED' WHERE id = $1`, [req.organization_id]);
      } else if (req.facility_id) {
        await client.query(`UPDATE facilities SET verification_status = 'CHANGES_REQUESTED' WHERE id = $1`, [req.facility_id]);
      } else if (req.listing_id) {
        await client.query(`UPDATE co2_listings SET verification_status = 'CHANGES_REQUESTED' WHERE id = $1`, [req.listing_id]);
      }

      await client.query(
        `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
         VALUES ($1, $2, 'CHANGES_REQUESTED', $3, $4)`,
        [requestId, fromStatus, reviewerId, notes]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return this.getById(requestId);
  }
}
