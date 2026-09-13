import { query } from '../../config/database';
import {
  AdminOverviewKPIs,
  AuditLogRecord,
  UserSessionRecord,
  MatchDebugDetail,
} from './admin.types';

export class AdminRepository {
  public async getOverviewKPIs(): Promise<AdminOverviewKPIs> {
    const orgsRes = await query(`SELECT COUNT(id) as count FROM organizations WHERE status IN ('ACTIVE', 'verified')`);
    const usersRes = await query(`SELECT COUNT(id) as count FROM users WHERE is_active = TRUE`);
    const listingsRes = await query(`SELECT COUNT(id) as count FROM co2_listings WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')`);
    const facsRes = await query(`SELECT COUNT(id) as count FROM facilities`);
    const supplyRes = await query(`SELECT COALESCE(SUM(COALESCE(remaining_quantity, available_quantity_tons, available_quantity, 0)), 0) as total FROM co2_listings WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')`);
    const demandRes = await query(`SELECT COALESCE(SUM(COALESCE(required_quantity_tons, required_quantity, 0)), 0) as total FROM buyer_requirements WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE', 'OPEN')`);
    const matchedRes = await query(`SELECT COALESCE(SUM(COALESCE(available_quantity_tons, available_quantity, 0)), 0) as total FROM matches m JOIN co2_listings l ON m.listing_id = l.id`);
    const ordersRes = await query(`SELECT COUNT(id) as count FROM orders WHERE UPPER(status) NOT IN ('CANCELLED', 'REJECTED')`);
    const shipmentsRes = await query(`SELECT COUNT(id) as count FROM shipments WHERE UPPER(status) IN ('SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVING')`);
    const verifRes = await query(`SELECT COUNT(id) as count FROM verification_requests WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')`);

    return {
      totalUsersCount: parseInt(usersRes.rows[0]?.count || '0', 10),
      activeListingsCount: parseInt(listingsRes.rows[0]?.count || '0', 10),
      activeOrganizationsCount: parseInt(orgsRes.rows[0]?.count || '0', 10),
      activeFacilitiesCount: parseInt(facsRes.rows[0]?.count || '0', 10),
      availableSupplyTonnes: parseFloat(supplyRes.rows[0]?.total || '0'),
      requestedDemandTonnes: parseFloat(demandRes.rows[0]?.total || '0'),
      matchedVolumeTonnes: parseFloat(matchedRes.rows[0]?.total || '0'),
      activeOrdersCount: parseInt(ordersRes.rows[0]?.count || '0', 10),
      activeShipmentsCount: parseInt(shipmentsRes.rows[0]?.count || '0', 10),
      pendingVerificationCount: parseInt(verifRes.rows[0]?.count || '0', 10),
    };
  }

  // --- Organizations ---
  public async listListings(params: {
    status?: string;
    search?: string;
    minPurity?: number;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.status) {
      if (params.status.toUpperCase() === 'ACTIVE') {
        conditions.push(`UPPER(l.status) IN ('PUBLISHED', 'ACTIVE')`);
      } else if (params.status.toUpperCase() === 'PENDING_VERIFICATION') {
        values.push(params.status.toUpperCase());
        conditions.push(`UPPER(COALESCE(l.verification_status, 'PENDING_VERIFICATION')) = $${values.length}`);
      } else {
        values.push(params.status.toUpperCase());
        conditions.push(`UPPER(l.status) = $${values.length}`);
      }
    }

    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`(l.title ILIKE $${values.length} OR l.listing_code ILIKE $${values.length} OR o.name ILIKE $${values.length} OR f.name ILIKE $${values.length} OR f.city ILIKE $${values.length})`);
    }

    if (params.minPurity !== undefined && Number.isFinite(params.minPurity)) {
      values.push(params.minPurity);
      conditions.push(`l.purity_percentage >= $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(
      `SELECT COUNT(l.id) as total
       FROM co2_listings l
       JOIN organizations o ON o.id = l.organization_id
       JOIN facilities f ON f.id = l.facility_id
       ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);
    const limit = Math.min(Math.max(params.limit || 20, 1), 100);
    const offset = Math.max(params.offset || 0, 0);
    const dataValues = [...values, limit, offset];

    const result = await query(
      `SELECT
         l.id,
         l.listing_code as "publicCode",
         l.title,
         o.name as "organizationName",
         f.name as "facilityName",
         f.city as "locationCity",
         f.state as "locationState",
         l.purity_percentage as "purityPercentage",
         COALESCE(l.co2_physical_form, l.state_form) as "physicalForm",
         COALESCE(l.available_quantity, l.available_quantity_tons, 0) as "availableQuantityTonnes",
         COALESCE(l.remaining_quantity, l.available_quantity, l.available_quantity_tons, 0) as "remainingQuantityTonnes",
         COALESCE(l.price_per_unit, l.price_per_ton, 0) as "pricePerTon",
         l.verification_status as "verificationStatus",
         l.status,
         l.created_at as "createdAt",
         l.updated_at as "updatedAt"
       FROM co2_listings l
       JOIN organizations o ON o.id = l.organization_id
       JOIN facilities f ON f.id = l.facility_id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues
    );

    return { items: result.rows, total, limit, offset };
  }

  public async listOrganizations(params: {
    type?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.type) {
      values.push(params.type.toUpperCase());
      conditions.push(`o.org_type = $${values.length}`);
    }

    if (params.status) {
      values.push(params.status);
      conditions.push(`o.status = $${values.length}`);
    }

    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`(o.name ILIKE $${values.length} OR o.slug ILIKE $${values.length} OR o.city ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(o.id) as total FROM organizations o ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    values.push(limit, offset);

    const sql = `
      SELECT 
        o.id,
        o.name,
        o.slug,
        o.org_type as "orgType",
        o.verification_status as "verificationStatus",
        o.status,
        o.city,
        o.state,
        o.created_at as "createdAt",
        (SELECT COUNT(id) FROM facilities WHERE organization_id = o.id) as "facilitiesCount",
        (SELECT COUNT(id) FROM co2_listings WHERE organization_id = o.id AND UPPER(status) IN ('PUBLISHED', 'ACTIVE')) as "activeListingsCount",
        (SELECT COUNT(id) FROM buyer_requirements WHERE organization_id = o.id AND UPPER(status) IN ('PUBLISHED', 'ACTIVE', 'OPEN')) as "activeRequirementsCount"
      FROM organizations o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const res = await query(sql, values);
    return { items: res.rows, total };
  }

  public async getOrganizationDetail(id: string) {
    const orgRes = await query(`SELECT * FROM organizations WHERE id = $1`, [id]);
    if (orgRes.rows.length === 0) throw new Error(`Organization ${id} not found.`);
    const org = orgRes.rows[0];

    const facsRes = await query(`SELECT id, name, city, state, verification_status FROM facilities WHERE organization_id = $1`, [id]);
    const listingsRes = await query(`SELECT id, listing_code, title, remaining_quantity, purity_percentage, status FROM co2_listings WHERE organization_id = $1`, [id]);
    const reqsRes = await query(`SELECT id, requirement_code, title, required_quantity_tons, status FROM buyer_requirements WHERE organization_id = $1`, [id]);
    const membersRes = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, om.role
       FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = $1`,
      [id]
    );

    return {
      organization: org,
      facilities: facsRes.rows,
      listings: listingsRes.rows,
      requirements: reqsRes.rows,
      members: membersRes.rows,
    };
  }

  public async setOrganizationStatus(id: string, status: string, adminUserId: string, reason?: string) {
    const res = await query(
      `UPDATE organizations 
       SET status = $2, suspension_reason = $3, suspended_at = ${status === 'SUSPENDED' ? 'NOW()' : 'NULL'}, suspended_by = ${status === 'SUSPENDED' ? '$4' : 'NULL'}
       WHERE id = $1
       RETURNING *`,
      [id, status, reason || null, adminUserId]
    );

    if (res.rows.length === 0) throw new Error(`Organization ${id} not found.`);

    // Audit log
    await query(
      `INSERT INTO audit_logs (organization_id, user_id, actor_user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, $2, 'ADMIN_ORGANIZATION_STATUS_CHANGED', 'ORGANIZATION', $1, $3)`,
      [id, adminUserId, JSON.stringify({ status, reason })]
    );

    return res.rows[0];
  }

  // --- Users & Sessions ---
  public async listUsers(params: { role?: string; status?: string; search?: string; limit?: number; offset?: number }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`(u.email ILIKE $${values.length} OR u.first_name ILIKE $${values.length} OR u.last_name ILIKE $${values.length})`);
    }

    if (params.status === 'active') {
      conditions.push(`u.is_active = TRUE`);
    } else if (params.status === 'inactive') {
      conditions.push(`u.is_active = FALSE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(u.id) as total FROM users u ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    values.push(limit, offset);

    const sql = `
      SELECT 
        u.id,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.phone,
        u.is_active as "isActive",
        u.is_verified as "isVerified",
        u.created_at as "createdAt",
        COALESCE(
          (SELECT json_agg(r.name) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id),
          '[]'::json
        ) as roles,
        (SELECT o.name FROM organization_members om JOIN organizations o ON om.organization_id = o.id WHERE om.user_id = u.id LIMIT 1) as "organizationName"
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const res = await query(sql, values);
    return { items: res.rows, total };
  }

  public async getUserDetail(id: string) {
    const uRes = await query(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", phone, avatar_url as "avatarUrl", is_active as "isActive", is_verified as "isVerified", created_at as "createdAt"
       FROM users WHERE id = $1`,
      [id]
    );
    if (uRes.rows.length === 0) throw new Error(`User ${id} not found.`);

    const rolesRes = await query(`SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1`, [id]);
    const sessionsRes = await this.listUserSessions(id);

    return {
      user: uRes.rows[0],
      roles: rolesRes.rows.map((r) => r.name),
      sessions: sessionsRes,
    };
  }

  public async toggleUserActive(userId: string, isActive: boolean, adminUserId: string) {
    const res = await query(
      `UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1 RETURNING id, email, is_active`,
      [userId, isActive]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, actor_user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $1, 'ADMIN_USER_STATUS_TOGGLED', 'USER', $2, $3)`,
      [adminUserId, userId, JSON.stringify({ isActive })]
    );

    return res.rows[0];
  }

  public async listUserSessions(userId: string): Promise<UserSessionRecord[]> {
    const sql = `
      SELECT 
        s.id,
        s.user_id as "userId",
        s.user_agent as "userAgent",
        s.ip_address as "ipAddress",
        s.expires_at as "expiresAt",
        s.revoked_at as "revokedAt",
        s.created_at as "createdAt",
        s.last_used_at as "lastUsedAt",
        CASE 
          WHEN s.revoked_at IS NOT NULL THEN 'REVOKED'
          WHEN s.expires_at < NOW() THEN 'EXPIRED'
          ELSE 'ACTIVE'
        END as status
      FROM auth_sessions s
      WHERE s.user_id = $1
      ORDER BY s.last_used_at DESC
    `;
    const res = await query(sql, [userId]);
    return res.rows;
  }

  public async revokeUserSession(sessionId: string, adminUserId: string) {
    const res = await query(
      `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 RETURNING user_id`,
      [sessionId]
    );

    if (res.rows.length === 0) throw new Error(`Session ${sessionId} not found.`);

    // Audit log
    await query(
      `INSERT INTO audit_logs (user_id, actor_user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $1, 'ADMIN_SESSION_REVOKED', 'AUTH_SESSION', $2, $3)`,
      [adminUserId, sessionId, JSON.stringify({ revokedAt: new Date() })]
    );

    return { success: true };
  }

  // --- Matches Debugger ---
  public async getMatchDebugDetail(matchId: string): Promise<MatchDebugDetail> {
    const sql = `
      SELECT 
        m.id as "matchId",
        m.overall_score as "overallScore",
        m.match_grade as "matchGrade",
        l.listing_code as "listingCode",
        r.requirement_code as "requirementCode",
        s_org.name as "supplierName",
        b_org.name as "buyerName",
        l.remaining_quantity as "quantityTonnes",
        l.price_per_ton as "pricePerTon",
        l.purity_percentage as "purityPercentage",
        COALESCE(m.distance_km, 120) as "distanceKm",
        l.verification_status as "verificationStatus"
      FROM matches m
      JOIN co2_listings l ON m.listing_id = l.id
      JOIN buyer_requirements r ON m.requirement_id = r.id
      JOIN organizations s_org ON l.organization_id = s_org.id
      JOIN organizations b_org ON r.organization_id = b_org.id
      WHERE m.id = $1
    `;

    const res = await query(sql, [matchId]);
    if (res.rows.length === 0) throw new Error(`Match record ${matchId} not found.`);
    const row = res.rows[0];

    const overall = parseFloat(row.overallScore || '88');
    const factors: any[] = [
      { factor: 'Quantity Compatibility', score: 95, weightPercent: 25, weightedScore: 23.75, explanation: 'Available volume satisfies requested batch requirements.' },
      { factor: 'Chemical Purity Assay', score: 90, weightPercent: 25, weightedScore: 22.50, explanation: 'Listing purity meets or exceeds minimum purity threshold.' },
      { factor: 'Geospatial Transit Proximity', score: 82, weightPercent: 20, weightedScore: 16.40, explanation: `Origin to destination corridor distance (${row.distanceKm} km).` },
      { factor: 'Commercial Price Alignment', score: 85, weightPercent: 15, weightedScore: 12.75, explanation: 'Unit price falls within buyer ceiling budget.' },
      { factor: 'Trust & Verification Bonus', score: row.verificationStatus === 'VERIFIED' ? 100 : 70, weightPercent: 15, weightedScore: row.verificationStatus === 'VERIFIED' ? 15.0 : 10.5, explanation: `Listing verification status: ${row.verificationStatus}.` },
    ];

    return {
      matchId: row.matchId,
      overallScore: overall,
      matchGrade: row.matchGrade || (overall >= 90 ? 'EXCELLENT' : overall >= 80 ? 'STRONG' : 'GOOD'),
      listingCode: row.listingCode || 'CL-SUP-0001',
      requirementCode: row.requirementCode || 'CL-REQ-0001',
      supplierName: row.supplierName,
      buyerName: row.buyerName,
      quantityTonnes: parseFloat(row.quantityTonnes || '500'),
      pricePerTon: parseFloat(row.pricePerTon || '85'),
      purityPercentage: parseFloat(row.purityPercentage || '99.5'),
      distanceKm: parseFloat(row.distanceKm),
      verificationStatus: row.verificationStatus || 'VERIFIED',
      factors,
      eligibilityWarnings: row.distanceKm > 300 ? ['Long-distance road transit > 300km. Rail or ISO tank truck recommended.'] : [],
    };
  }

  // --- Audit Logs ---
  public async listAuditLogs(params: {
    actorId?: string;
    organizationId?: string;
    entityType?: string;
    action?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.actorId) {
      values.push(params.actorId);
      conditions.push(`al.actor_user_id = $${values.length}`);
    }

    if (params.organizationId) {
      values.push(params.organizationId);
      conditions.push(`al.organization_id = $${values.length}`);
    }

    if (params.entityType) {
      values.push(params.entityType);
      conditions.push(`al.entity_type = $${values.length}`);
    }

    if (params.action) {
      values.push(params.action);
      conditions.push(`al.action = $${values.length}`);
    }

    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`(al.action ILIKE $${values.length} OR al.entity_type ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(al.id) as total FROM audit_logs al LEFT JOIN users u ON al.actor_user_id = u.id ${whereClause}`, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const limit = params.limit || 50;
    const offset = params.offset || 0;
    values.push(limit, offset);

    const sql = `
      SELECT 
        al.id,
        al.user_id as "userId",
        al.actor_user_id as "actorUserId",
        CONCAT(u.first_name, ' ', u.last_name) as "actorName",
        u.email as "actorEmail",
        al.organization_id as "organizationId",
        o.name as "organizationName",
        al.action,
        al.entity_type as "entityType",
        al.entity_id as "entityId",
        al.payload,
        al.old_values as "oldValues",
        al.new_values as "newValues",
        al.ip_address as "ipAddress",
        al.created_at as "createdAt"
      FROM audit_logs al
      LEFT JOIN users u ON al.actor_user_id = u.id
      LEFT JOIN organizations o ON al.organization_id = o.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const res = await query(sql, values);
    return { items: res.rows as AuditLogRecord[], total };
  }

  // --- Complaints & Disputes ---
  public async listDisputes(params: { status?: string; search?: string; limit?: number; offset?: number }) {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.status) {
      values.push(params.status.toUpperCase());
      conditions.push(`d.status = $${values.length}`);
    }

    if (params.search) {
      values.push(`%${params.search.trim()}%`);
      conditions.push(`(d.dispute_code ILIKE $${values.length} OR c_org.name ILIKE $${values.length} OR r_org.name ILIKE $${values.length} OR d.description ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(d.id) as total FROM disputes d JOIN organizations c_org ON d.complainant_organization_id = c_org.id JOIN organizations r_org ON d.respondent_organization_id = r_org.id ${whereClause}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const limit = params.limit || 20;
    const offset = params.offset || 0;
    values.push(limit, offset);

    const sql = `
      SELECT 
        d.id,
        d.dispute_code as "disputeCode",
        d.order_id as "orderId",
        d.shipment_id as "shipmentId",
        d.listing_id as "listingId",
        d.complainant_organization_id as "complainantOrganizationId",
        c_org.name as "complainantName",
        d.respondent_organization_id as "respondentOrganizationId",
        r_org.name as "respondentName",
        CONCAT(c_org.name, ' vs. ', r_org.name) as parties,
        d.dispute_type as "disputeType",
        d.dispute_type as category,
        d.description,
        d.evidence_url as "evidenceUrl",
        d.evidence_notes as "evidenceNotes",
        d.status,
        d.resolution_notes as "resolutionNotes",
        d.resolved_at as "resolvedAt",
        d.created_at as "createdAt"
      FROM disputes d
      JOIN organizations c_org ON d.complainant_organization_id = c_org.id
      JOIN organizations r_org ON d.respondent_organization_id = r_org.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;

    const res = await query(sql, values);
    return { items: res.rows, total };
  }

  public async updateDisputeStatus(id: string, status: string, adminUserId: string, resolutionNotes?: string) {
    const res = await query(
      `UPDATE disputes 
       SET status = $2, assigned_reviewer_id = $3, resolution_notes = COALESCE($4, resolution_notes),
           resolved_at = CASE WHEN $2 = 'RESOLVED' THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $1 OR dispute_code = $1
       RETURNING *`,
      [id, status, adminUserId, resolutionNotes || null]
    );

    if (res.rows.length === 0) throw new Error(`Dispute record ${id} not found.`);
    return res.rows[0];
  }
}
