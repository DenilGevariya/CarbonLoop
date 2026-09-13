import { query, pool } from '../../config/database';
import {
  BuyerRequirement,
  RequirementFilterParams,
  CreateRequirementInput,
  UpdateRequirementInput,
  RequirementStatus,
  UtilizationType,
  DemandStats,
} from './requirements.types';
import { ALLOWED_SORT_FIELDS } from './requirements.constants';

export class RequirementRepository {
  // Generate human-readable requirement code CL-REQ-XXXXXX
  static async generateRequirementCode(): Promise<string> {
    const { rows } = await query(`
      SELECT requirement_code 
      FROM buyer_requirements 
      WHERE requirement_code LIKE 'CL-REQ-%' 
      ORDER BY created_at DESC 
      LIMIT 1;
    `);

    if (rows.length === 0 || !rows[0].requirement_code) {
      return 'CL-REQ-000101';
    }

    const lastCode = rows[0].requirement_code;
    const match = lastCode.match(/CL-REQ-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `CL-REQ-${nextNum.toString().padStart(6, '0')}`;
    }

    return `CL-REQ-${Date.now().toString().slice(-6)}`;
  }

  // Map raw database row to view-friendly BuyerRequirement object
  private static mapRowToEntity(row: any): BuyerRequirement {
    return {
      id: row.id,
      organization_id: row.organization_id,
      requirement_code: row.requirement_code,
      title: row.title,
      description: row.description,
      required_quantity: parseFloat(row.required_quantity),
      quantity_unit: row.quantity_unit || 'tonne',
      minimum_purity: parseFloat(row.minimum_purity),
      maximum_purity: row.maximum_purity ? parseFloat(row.maximum_purity) : null,
      acceptable_physical_form: row.acceptable_physical_form,
      preferred_capture_method: row.preferred_capture_method,
      maximum_price_per_unit: row.maximum_price_per_unit ? parseFloat(row.maximum_price_per_unit) : null,
      currency: row.currency || 'INR',
      required_from: row.required_from,
      required_until: row.required_until,
      delivery_required: row.delivery_required ?? true,
      destination_facility_id: row.destination_facility_id,
      priority: (row.priority || 'normal').toLowerCase() as any,
      status: (row.status || 'DRAFT').toUpperCase() as RequirementStatus,
      created_by: row.created_by,
      utilization_type_id: row.utilization_type_id,
      intended_use: row.intended_use,
      location_city: row.location_city || row.facility_city,
      location_state: row.location_state || row.facility_state,
      created_at: row.created_at,
      updated_at: row.updated_at,

      organization: row.org_name
        ? {
            id: row.organization_id,
            name: row.org_name,
            slug: row.org_slug,
            organization_type: row.org_type,
            verification_status: row.org_verification_status,
          }
        : undefined,

      destination_facility: row.facility_name
        ? {
            id: row.destination_facility_id,
            name: row.facility_name,
            facility_code: row.facility_code,
            facility_type: row.facility_type,
            city: row.facility_city,
            state: row.facility_state,
            country: row.facility_country || 'India',
            address_line1: row.facility_address,
          }
        : undefined,

      utilization: row.util_code
        ? {
            id: row.utilization_type_id,
            code: row.util_code,
            name: row.util_name,
            description: row.util_description,
          }
        : undefined,

      creator: row.creator_name
        ? {
            id: row.created_by,
            full_name: row.creator_name,
            email: row.creator_email,
          }
        : undefined,
    };
  }

  // Find all public active/published requirements
  static async findAllPublic(filters: RequirementFilterParams) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["br.status IN ('PUBLISHED', 'ACTIVE', 'published', 'active')"];
    const values: any[] = [];
    let paramIdx = 1;

    if (filters.search) {
      conditions.push(
        `(br.title ILIKE $${paramIdx} OR br.description ILIKE $${paramIdx} OR br.requirement_code ILIKE $${paramIdx} OR o.name ILIKE $${paramIdx} OR f.city ILIKE $${paramIdx} OR br.location_city ILIKE $${paramIdx} OR u.name ILIKE $${paramIdx})`
      );
      values.push(`%${filters.search}%`);
      paramIdx++;
    }

    if (filters.utilization_code) {
      conditions.push(`u.code = $${paramIdx}`);
      values.push(filters.utilization_code);
      paramIdx++;
    }

    if (filters.utilization_type_id) {
      conditions.push(`br.utilization_type_id = $${paramIdx}`);
      values.push(filters.utilization_type_id);
      paramIdx++;
    }

    if (filters.physical_form) {
      conditions.push(`br.acceptable_physical_form = $${paramIdx}`);
      values.push(filters.physical_form);
      paramIdx++;
    }

    if (filters.priority) {
      conditions.push(`LOWER(br.priority) = LOWER($${paramIdx})`);
      values.push(filters.priority);
      paramIdx++;
    }

    if (filters.min_purity !== undefined) {
      conditions.push(`br.minimum_purity >= $${paramIdx}`);
      values.push(filters.min_purity);
      paramIdx++;
    }

    if (filters.max_price !== undefined) {
      conditions.push(`br.maximum_price_per_unit <= $${paramIdx}`);
      values.push(filters.max_price);
      paramIdx++;
    }

    if (filters.city) {
      conditions.push(`(f.city ILIKE $${paramIdx} OR br.location_city ILIKE $${paramIdx})`);
      values.push(`%${filters.city}%`);
      paramIdx++;
    }

    if (filters.state) {
      conditions.push(`(f.state ILIKE $${paramIdx} OR br.location_state ILIKE $${paramIdx})`);
      values.push(`%${filters.state}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortClause = ALLOWED_SORT_FIELDS[filters.sort || 'newest'] || 'br.created_at DESC';

    // Count Total
    const countSql = `
      SELECT COUNT(*) as total
      FROM buyer_requirements br
      JOIN organizations o ON br.organization_id = o.id
      LEFT JOIN facilities f ON br.destination_facility_id = f.id
      LEFT JOIN co2_utilization_types u ON br.utilization_type_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].total, 10);

    // Fetch Page Items
    const queryValues = [...values, limit, offset];
    const dataSql = `
      SELECT 
        br.*,
        o.name as org_name,
        o.slug as org_slug,
        o.org_type,
        o.verification_status as org_verification_status,
        f.name as facility_name,
        f.facility_code,
        f.facility_type,
        f.city as facility_city,
        f.state as facility_state,
        f.country as facility_country,
        f.address_line1 as facility_address,
        u.code as util_code,
        u.name as util_name,
        u.description as util_description,
        CONCAT(usr.first_name, ' ', usr.last_name) as creator_name,
        usr.email as creator_email
      FROM buyer_requirements br
      JOIN organizations o ON br.organization_id = o.id
      LEFT JOIN facilities f ON br.destination_facility_id = f.id
      LEFT JOIN co2_utilization_types u ON br.utilization_type_id = u.id
      LEFT JOIN users usr ON br.created_by = usr.id
      ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const dataResult = await query(dataSql, queryValues);
    const items = dataResult.rows.map((row) => this.mapRowToEntity(row));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // Find requirements belonging to an organization (all statuses)
  static async findByOrganization(orgId: string, filters: RequirementFilterParams) {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['br.organization_id = $1'];
    const values: any[] = [orgId];
    let paramIdx = 2;

    if (filters.status && filters.status !== 'all') {
      conditions.push(`UPPER(br.status) = UPPER($${paramIdx})`);
      values.push(filters.status);
      paramIdx++;
    } else {
      conditions.push(`UPPER(br.status) != 'ARCHIVED'`);
    }

    if (filters.search) {
      conditions.push(
        `(br.title ILIKE $${paramIdx} OR br.description ILIKE $${paramIdx} OR br.requirement_code ILIKE $${paramIdx})`
      );
      values.push(`%${filters.search}%`);
      paramIdx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const sortClause = ALLOWED_SORT_FIELDS[filters.sort || 'newest'] || 'br.created_at DESC';

    const countResult = await query(
      `SELECT COUNT(*) as total FROM buyer_requirements br ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const queryValues = [...values, limit, offset];
    const dataSql = `
      SELECT 
        br.*,
        o.name as org_name,
        o.slug as org_slug,
        o.org_type,
        o.verification_status as org_verification_status,
        f.name as facility_name,
        f.facility_code,
        f.facility_type,
        f.city as facility_city,
        f.state as facility_state,
        f.country as facility_country,
        f.address_line1 as facility_address,
        u.code as util_code,
        u.name as util_name,
        u.description as util_description,
        CONCAT(usr.first_name, ' ', usr.last_name) as creator_name,
        usr.email as creator_email
      FROM buyer_requirements br
      JOIN organizations o ON br.organization_id = o.id
      LEFT JOIN facilities f ON br.destination_facility_id = f.id
      LEFT JOIN co2_utilization_types u ON br.utilization_type_id = u.id
      LEFT JOIN users usr ON br.created_by = usr.id
      ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const dataResult = await query(dataSql, queryValues);
    const items = dataResult.rows.map((row) => this.mapRowToEntity(row));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // Find requirement by UUID or requirement_code
  static async findByIdOrCode(idOrCode: string): Promise<BuyerRequirement | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
    const whereClause = isUuid ? 'br.id = $1' : 'br.requirement_code = $1';

    const sql = `
      SELECT 
        br.*,
        o.name as org_name,
        o.slug as org_slug,
        o.org_type,
        o.verification_status as org_verification_status,
        f.name as facility_name,
        f.facility_code,
        f.facility_type,
        f.city as facility_city,
        f.state as facility_state,
        f.country as facility_country,
        f.address_line1 as facility_address,
        u.code as util_code,
        u.name as util_name,
        u.description as util_description,
        CONCAT(usr.first_name, ' ', usr.last_name) as creator_name,
        usr.email as creator_email
      FROM buyer_requirements br
      JOIN organizations o ON br.organization_id = o.id
      LEFT JOIN facilities f ON br.destination_facility_id = f.id
      LEFT JOIN co2_utilization_types u ON br.utilization_type_id = u.id
      LEFT JOIN users usr ON br.created_by = usr.id
      WHERE ${whereClause}
      LIMIT 1;
    `;

    const { rows } = await query(sql, [idOrCode]);
    return rows.length > 0 ? this.mapRowToEntity(rows[0]) : null;
  }

  // Create requirement
  static async create(
    orgId: string,
    userId: string,
    input: CreateRequirementInput
  ): Promise<BuyerRequirement> {
    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      const requirementCode = await this.generateRequirementCode();
      const status = (input.status || 'DRAFT').toUpperCase();

      const insertSql = `
        INSERT INTO buyer_requirements (
          organization_id, requirement_code, title, description,
          required_quantity, quantity_unit, minimum_purity, maximum_purity,
          acceptable_physical_form, preferred_capture_method, maximum_price_per_unit,
          currency, required_from, required_until, delivery_required,
          destination_facility_id, priority, status, created_by,
          intended_use, location_city, location_state, utilization_type_id
        )
        VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11,
          $12, $13::timestamptz, $14::timestamptz, $15,
          $16, $17, $18, $19,
          $20, $21, $22, $23
        )
        RETURNING id;
      `;

      const res = await db.query(insertSql, [
        orgId,
        requirementCode,
        input.title,
        input.description || null,
        input.required_quantity,
        input.quantity_unit || 'tonne',
        input.minimum_purity,
        input.maximum_purity || null,
        input.acceptable_physical_form || null,
        input.preferred_capture_method || null,
        input.maximum_price_per_unit || null,
        input.currency || 'INR',
        input.required_from || null,
        input.required_until || null,
        input.delivery_required ?? true,
        input.destination_facility_id || null,
        input.priority || 'normal',
        status,
        userId,
        input.intended_use || null,
        input.location_city || null,
        input.location_state || null,
        input.utilization_type_id || null,
      ]);

      const newId = res.rows[0].id;

      // Log status history
      await db.query(
        `INSERT INTO buyer_requirement_status_history (requirement_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason)
         VALUES ($1, 'DRAFT', 'DRAFT', $2, $2, $3, $3, 'Initial requirement declaration');`,
        [newId, status, userId]
      );

      await db.query('COMMIT');

      const entity = await this.findByIdOrCode(newId);
      return entity!;
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    } finally {
      db.release();
    }
  }

  // Update requirement details
  static async update(id: string, input: UpdateRequirementInput): Promise<BuyerRequirement> {
    const fields: string[] = [];
    const values: any[] = [id];
    let paramIdx = 2;

    if (input.title !== undefined) {
      fields.push(`title = $${paramIdx++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIdx++}`);
      values.push(input.description);
    }
    if (input.required_quantity !== undefined) {
      fields.push(`required_quantity = $${paramIdx++}`);
      values.push(input.required_quantity);
    }
    if (input.quantity_unit !== undefined) {
      fields.push(`quantity_unit = $${paramIdx++}`);
      values.push(input.quantity_unit);
    }
    if (input.minimum_purity !== undefined) {
      fields.push(`minimum_purity = $${paramIdx++}`);
      values.push(input.minimum_purity);
    }
    if (input.maximum_purity !== undefined) {
      fields.push(`maximum_purity = $${paramIdx++}`);
      values.push(input.maximum_purity);
    }
    if (input.acceptable_physical_form !== undefined) {
      fields.push(`acceptable_physical_form = $${paramIdx++}`);
      values.push(input.acceptable_physical_form);
    }
    if (input.preferred_capture_method !== undefined) {
      fields.push(`preferred_capture_method = $${paramIdx++}`);
      values.push(input.preferred_capture_method);
    }
    if (input.maximum_price_per_unit !== undefined) {
      fields.push(`maximum_price_per_unit = $${paramIdx++}`);
      values.push(input.maximum_price_per_unit);
    }
    if (input.currency !== undefined) {
      fields.push(`currency = $${paramIdx++}`);
      values.push(input.currency);
    }
    if (input.required_from !== undefined) {
      fields.push(`required_from = $${paramIdx++}::timestamptz`);
      values.push(input.required_from);
    }
    if (input.required_until !== undefined) {
      fields.push(`required_until = $${paramIdx++}::timestamptz`);
      values.push(input.required_until);
    }
    if (input.delivery_required !== undefined) {
      fields.push(`delivery_required = $${paramIdx++}`);
      values.push(input.delivery_required);
    }
    if (input.destination_facility_id !== undefined) {
      fields.push(`destination_facility_id = $${paramIdx++}`);
      values.push(input.destination_facility_id);
    }
    if (input.location_city !== undefined) {
      fields.push(`location_city = $${paramIdx++}`);
      values.push(input.location_city);
    }
    if (input.location_state !== undefined) {
      fields.push(`location_state = $${paramIdx++}`);
      values.push(input.location_state);
    }
    if (input.priority !== undefined) {
      fields.push(`priority = $${paramIdx++}`);
      values.push(input.priority);
    }
    if (input.intended_use !== undefined) {
      fields.push(`intended_use = $${paramIdx++}`);
      values.push(input.intended_use);
    }
    if (input.utilization_type_id !== undefined) {
      fields.push(`utilization_type_id = $${paramIdx++}`);
      values.push(input.utilization_type_id);
    }

    fields.push(`updated_at = NOW()`);

    const sql = `
      UPDATE buyer_requirements 
      SET ${fields.join(', ')} 
      WHERE id = $1 
      RETURNING id;
    `;

    await query(sql, values);
    const updated = await this.findByIdOrCode(id);
    return updated!;
  }

  // Status transition execution with transaction + audit logging
  static async updateStatus(
    id: string,
    newStatus: RequirementStatus,
    currentStatus: RequirementStatus,
    userId: string,
    reason?: string
  ): Promise<BuyerRequirement> {
    const db = await pool.connect();
    try {
      await db.query('BEGIN');

      await db.query(
        `UPDATE buyer_requirements 
         SET status = $1, updated_at = NOW() 
         WHERE id = $2;`,
        [newStatus, id]
      );

      await db.query(
        `INSERT INTO buyer_requirement_status_history (
          requirement_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason
         )
         VALUES ($1, $2, $2, $3, $3, $4, $4, $5);`,
        [id, currentStatus, newStatus, userId, reason || `Transitioned to ${newStatus}`]
      );

      await db.query('COMMIT');
      const updated = await this.findByIdOrCode(id);
      return updated!;
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    } finally {
      db.release();
    }
  }

  // Get Demand Aggregate Stats
  static async getStats(): Promise<DemandStats> {
    const activeStatsRes = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')) as active_count,
        COALESCE(SUM(required_quantity) FILTER (WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')), 0) as total_qty,
        COALESCE(AVG(minimum_purity) FILTER (WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')), 0) as avg_purity,
        COUNT(DISTINCT COALESCE(location_state, 'Gujarat')) FILTER (WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')) as active_regions
      FROM buyer_requirements;
    `);

    const row = activeStatsRes.rows[0];
    const activeCount = parseInt(row.active_count, 10);
    const totalQty = parseFloat(row.total_qty);
    const avgPurity = parseFloat(row.avg_purity);
    const activeRegions = parseInt(row.active_regions, 10);

    const utilBreakdownRes = await query(`
      SELECT 
        u.code,
        u.name,
        COUNT(br.id) as req_count,
        COALESCE(SUM(br.required_quantity), 0) as total_quantity
      FROM co2_utilization_types u
      LEFT JOIN buyer_requirements br ON br.utilization_type_id = u.id AND UPPER(br.status) IN ('PUBLISHED', 'ACTIVE')
      WHERE u.is_active = true
      GROUP BY u.id, u.code, u.name
      ORDER BY req_count DESC, total_quantity DESC;
    `);

    const utilizationBreakdown = utilBreakdownRes.rows.map((r) => {
      const cnt = parseInt(r.req_count, 10);
      return {
        code: r.code,
        name: r.name,
        count: cnt,
        totalQuantity: parseFloat(r.total_quantity),
        percentage: activeCount > 0 ? Math.round((cnt / activeCount) * 100) : 0,
      };
    });

    return {
      activeRequirements: activeCount,
      totalRequestedQuantity: Math.round(totalQty * 10) / 10,
      averageMinimumPurity: Math.round(avgPurity * 10) / 10,
      activeRegionsCount: activeRegions,
      utilizationBreakdown,
    };
  }

  // Get Utilization Categories
  static async getUtilizationTypes(): Promise<UtilizationType[]> {
    const { rows } = await query(`
      SELECT * FROM co2_utilization_types 
      WHERE is_active = true 
      ORDER BY name ASC;
    `);
    return rows;
  }

  // Automatically expire requirements where required_until < NOW()
  static async autoExpireExpiredRequirements(): Promise<number> {
    const { rowCount } = await query(`
      UPDATE buyer_requirements
      SET status = 'EXPIRED', updated_at = NOW()
      WHERE UPPER(status) IN ('PUBLISHED', 'ACTIVE')
        AND required_until IS NOT NULL
        AND required_until < NOW();
    `);
    return rowCount || 0;
  }
}
