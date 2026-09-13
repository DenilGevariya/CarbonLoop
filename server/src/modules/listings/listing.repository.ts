import { pool } from '../../config/database';
import { 
  ListingDTO, 
  ListingFilterParams, 
  MarketplaceStatsDTO, 
  EmitterSupplyStatsDTO, 
  CreateListingInput, 
  UpdateListingInput, 
  ListingStatusHistoryDTO 
} from './listing.types';
import { SORT_FIELDS_WHITELIST } from './listing.constants';

export class ListingRepository {
  /**
   * Helper mapper to transform DB joined row into clean API DTO
   */
  private mapRowToDTO(row: any): ListingDTO {
    return {
      id: row.id,
      listingCode: row.listing_code || `CL-SUP-${row.id.substring(0, 6).toUpperCase()}`,
      title: row.title,
      description: row.description,
      organization: {
        id: row.org_id,
        name: row.org_name,
        slug: row.org_slug,
        orgType: row.org_type,
        verificationStatus: row.org_verification_status,
        logoUrl: row.org_logo_url || null,
      },
      facility: {
        id: row.facility_id,
        name: row.facility_name,
        facilityCode: row.facility_code || null,
        city: row.facility_city,
        state: row.facility_state,
        country: row.facility_country || 'India',
      },
      quantity: {
        available: parseFloat(row.available_quantity || row.available_quantity_tons || 0),
        remaining: parseFloat(row.remaining_quantity || row.available_quantity || 0),
        minimumOrder: parseFloat(row.minimum_order_quantity || row.minimum_order_tons || 1),
        unit: row.quantity_unit || 'tonne',
      },
      purityPercentage: parseFloat(row.purity_percentage || 0),
      physicalForm: row.co2_physical_form || row.state_form || 'liquid',
      captureMethod: row.capture_method || null,
      captureSource: row.capture_source || null,
      temperatureCelsius: row.temperature_c !== null ? parseFloat(row.temperature_c) : null,
      pressureBar: row.pressure_bar !== null ? parseFloat(row.pressure_bar) : null,
      price: {
        amount: parseFloat(row.price_per_unit || row.price_per_ton || 0),
        currency: row.currency || 'INR',
      },
      availability: {
        from: row.available_from ? new Date(row.available_from).toISOString() : new Date(row.availability_start_date).toISOString(),
        until: row.available_until ? new Date(row.available_until).toISOString() : (row.availability_end_date ? new Date(row.availability_end_date).toISOString() : null),
      },
      deliveryAvailable: row.delivery_available !== false,
      pickupAvailable: row.pickup_available !== false,
      verificationStatus: row.verification_status || 'PENDING_VERIFICATION',
      labReportUrl: row.lab_report_url || null,
      labReportFilename: row.lab_report_filename || null,
      verificationNotes: row.verification_notes || null,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  /**
   * Search and filter published supply listings for public marketplace
   */
  async findMarketplaceListings(params: ListingFilterParams): Promise<{ items: ListingDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;

    const conditions: string[] = ["l.status IN ('PUBLISHED', 'active', 'ACTIVE')"];
    const values: any[] = [];
    let paramIndex = 1;

    // Search filter across title, description, code, org name, facility name, city, state
    if (params.search && params.search.trim() !== '') {
      const searchPattern = `%${params.search.trim()}%`;
      conditions.push(`(
        l.title ILIKE $${paramIndex} OR 
        l.description ILIKE $${paramIndex} OR 
        l.listing_code ILIKE $${paramIndex} OR 
        o.name ILIKE $${paramIndex} OR 
        f.name ILIKE $${paramIndex} OR 
        f.city ILIKE $${paramIndex} OR 
        f.state ILIKE $${paramIndex}
      )`);
      values.push(searchPattern);
      paramIndex++;
    }

    if (params.location && params.location.trim() !== '') {
      conditions.push(`(f.city ILIKE $${paramIndex} OR f.state ILIKE $${paramIndex})`);
      values.push(`%${params.location.trim()}%`);
      paramIndex++;
    }

    if (params.organizationId) {
      conditions.push(`l.organization_id = $${paramIndex}`);
      values.push(params.organizationId);
      paramIndex++;
    }

    if (params.facilityId) {
      conditions.push(`l.facility_id = $${paramIndex}`);
      values.push(params.facilityId);
      paramIndex++;
    }

    if (params.minQuantity !== undefined) {
      conditions.push(`COALESCE(l.available_quantity, l.available_quantity_tons) >= $${paramIndex}`);
      values.push(params.minQuantity);
      paramIndex++;
    }

    if (params.maxQuantity !== undefined) {
      conditions.push(`COALESCE(l.available_quantity, l.available_quantity_tons) <= $${paramIndex}`);
      values.push(params.maxQuantity);
      paramIndex++;
    }

    if (params.minPurity !== undefined) {
      conditions.push(`l.purity_percentage >= $${paramIndex}`);
      values.push(params.minPurity);
      paramIndex++;
    }

    if (params.maxPurity !== undefined) {
      conditions.push(`l.purity_percentage <= $${paramIndex}`);
      values.push(params.maxPurity);
      paramIndex++;
    }

    if (params.minPrice !== undefined) {
      conditions.push(`COALESCE(l.price_per_unit, l.price_per_ton) >= $${paramIndex}`);
      values.push(params.minPrice);
      paramIndex++;
    }

    if (params.maxPrice !== undefined) {
      conditions.push(`COALESCE(l.price_per_unit, l.price_per_ton) <= $${paramIndex}`);
      values.push(params.maxPrice);
      paramIndex++;
    }

    if (params.physicalForm && params.physicalForm.trim() !== '') {
      conditions.push(`(l.co2_physical_form ILIKE $${paramIndex} OR l.state_form ILIKE $${paramIndex})`);
      values.push(params.physicalForm.trim());
      paramIndex++;
    }

    if (params.deliveryAvailable !== undefined) {
      conditions.push(`l.delivery_available = $${paramIndex}`);
      values.push(params.deliveryAvailable);
      paramIndex++;
    }

    if (params.pickupAvailable !== undefined) {
      conditions.push(`l.pickup_available = $${paramIndex}`);
      values.push(params.pickupAvailable);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const sortClause = SORT_FIELDS_WHITELIST[params.sort || 'newest'] || 'l.created_at DESC';

    // Count Total
    const countSql = `
      SELECT COUNT(*) 
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE ${whereClause}
    `;
    const countRes = await pool.query(countSql, values);
    const total = parseInt(countRes.rows[0].count, 10);

    // Select Data
    const dataSql = `
      SELECT 
        l.*,
        o.id as org_id, o.name as org_name, o.slug as org_slug, o.org_type, o.verification_status as org_verification_status, o.logo_url as org_logo_url,
        f.id as facility_id, f.name as facility_name, f.facility_code, f.city as facility_city, f.state as facility_state, f.country as facility_country
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataRes = await pool.query(dataSql, [...values, limit, offset]);
    const items = dataRes.rows.map((row) => this.mapRowToDTO(row));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Calculate public aggregate statistics for the marketplace header
   */
  async getMarketplaceStats(): Promise<MarketplaceStatsDTO> {
    const sql = `
      SELECT 
        COUNT(*)::int as active_listings,
        COALESCE(SUM(COALESCE(available_quantity, available_quantity_tons)), 0)::float as total_volume,
        COALESCE(AVG(purity_percentage), 0)::float as avg_purity,
        COUNT(DISTINCT f.state)::int as active_regions
      FROM co2_listings l
      JOIN facilities f ON l.facility_id = f.id
      WHERE l.status IN ('PUBLISHED', 'active', 'ACTIVE');
    `;
    const res = await pool.query(sql);
    const row = res.rows[0];
    return {
      activeListings: row.active_listings || 0,
      totalAvailableQuantity: Math.round(row.total_volume || 0),
      averagePurity: Math.round((row.avg_purity || 0) * 10) / 10,
      activeRegions: row.active_regions || 0,
    };
  }

  /**
   * Find listing by code or UUID (includes documents and status history)
   */
  async findByCodeOrId(identifier: string): Promise<ListingDTO | null> {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);
    const columnCondition = isUuid ? 'l.id = $1' : 'l.listing_code = $1';

    const sql = `
      SELECT 
        l.*,
        o.id as org_id, o.name as org_name, o.slug as org_slug, o.org_type, o.verification_status as org_verification_status, o.logo_url as org_logo_url,
        f.id as facility_id, f.name as facility_name, f.facility_code, f.city as facility_city, f.state as facility_state, f.country as facility_country
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE ${columnCondition}
      LIMIT 1;
    `;

    const res = await pool.query(sql, [identifier]);
    if (res.rows.length === 0) return null;

    const dto = this.mapRowToDTO(res.rows[0]);

    // Fetch associated documents
    const docSql = `
      SELECT 
        d.id, d.file_name, d.document_type, d.mime_type, d.file_size, d.description, d.verification_status, d.created_at
      FROM co2_listing_documents cld
      JOIN documents d ON cld.document_id = d.id
      WHERE cld.listing_id = $1;
    `;
    const docRes = await pool.query(docSql, [dto.id]);
    dto.documents = docRes.rows.map((d: any) => ({
      id: d.id,
      name: d.file_name,
      type: d.document_type,
      mimeType: d.mime_type,
      fileSize: parseInt(d.file_size, 10) || 0,
      description: d.description,
      verificationStatus: d.verification_status,
      uploadedAt: new Date(d.created_at).toISOString(),
    }));

    // Fetch status history
    dto.statusHistory = await this.getStatusHistory(dto.id);

    return dto;
  }

  /**
   * Fetch listings owned by a specific organization (Emitter console)
   */
  async findOrgListings(organizationId: string, params: ListingFilterParams): Promise<{ items: ListingDTO[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['l.organization_id = $1'];
    const values: any[] = [organizationId];
    let paramIndex = 2;

    if (params.status && params.status !== 'ALL') {
      conditions.push(`l.status = $${paramIndex}`);
      values.push(params.status);
      paramIndex++;
    }

    if (params.search && params.search.trim() !== '') {
      conditions.push(`(l.title ILIKE $${paramIndex} OR l.listing_code ILIKE $${paramIndex} OR f.name ILIKE $${paramIndex})`);
      values.push(`%${params.search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const countSql = `
      SELECT COUNT(*) 
      FROM co2_listings l
      JOIN facilities f ON l.facility_id = f.id
      WHERE ${whereClause}
    `;
    const countRes = await pool.query(countSql, values);
    const total = parseInt(countRes.rows[0].count, 10);

    const dataSql = `
      SELECT 
        l.*,
        o.id as org_id, o.name as org_name, o.slug as org_slug, o.org_type, o.verification_status as org_verification_status, o.logo_url as org_logo_url,
        f.id as facility_id, f.name as facility_name, f.facility_code, f.city as facility_city, f.state as facility_state, f.country as facility_country
      FROM co2_listings l
      JOIN organizations o ON l.organization_id = o.id
      JOIN facilities f ON l.facility_id = f.id
      WHERE ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataRes = await pool.query(dataSql, [...values, limit, offset]);
    const items = dataRes.rows.map((row) => this.mapRowToDTO(row));

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  /**
   * Aggregate metrics for an emitter organization dashboard header
   */
  async getOrgSupplyStats(organizationId: string): Promise<EmitterSupplyStatsDTO> {
    const sql = `
      SELECT 
        COUNT(CASE WHEN status IN ('PUBLISHED', 'active', 'ACTIVE') THEN 1 END)::int as active_count,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::int as draft_count,
        COUNT(CASE WHEN status = 'PAUSED' THEN 1 END)::int as paused_count,
        COALESCE(SUM(COALESCE(available_quantity, available_quantity_tons)), 0)::float as total_listed,
        COALESCE(SUM(COALESCE(remaining_quantity, available_quantity, available_quantity_tons)), 0)::float as total_remaining
      FROM co2_listings
      WHERE organization_id = $1;
    `;
    const res = await pool.query(sql, [organizationId]);
    const row = res.rows[0];
    return {
      activeListings: row.active_count || 0,
      draftListings: row.draft_count || 0,
      pausedListings: row.paused_count || 0,
      totalListedTonnes: Math.round(row.total_listed || 0),
      totalRemainingTonnes: Math.round(row.total_remaining || 0),
    };
  }

  /**
   * Generate next sequential public listing code
   */
  async generateListingCode(): Promise<string> {
    const sql = `
      SELECT listing_code 
      FROM co2_listings 
      WHERE listing_code LIKE 'CL-SUP-%' 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;
    const res = await pool.query(sql);
    let nextNum = 125;
    if (res.rows.length > 0 && res.rows[0].listing_code) {
      const match = res.rows[0].listing_code.match(/CL-SUP-(\d+)/);
      if (match && match[1]) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    return `CL-SUP-${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Create a new CO2 listing
   */
  async createListing(organizationId: string, createdByUserId: string, input: CreateListingInput): Promise<ListingDTO> {
    const listingCode = await this.generateListingCode();
    const initialStatus = input.publishNow ? 'PUBLISHED' : 'DRAFT';
    const remainingQuantity = input.availableQuantity;

    const sql = `
      INSERT INTO co2_listings (
        organization_id, facility_id, listing_code, title, description,
        available_quantity, remaining_quantity, available_quantity_tons, quantity_unit,
        minimum_order_quantity, minimum_order_tons, purity_percentage, declared_purity,
        co2_physical_form, state_form, capture_method, capture_source,
        temperature_c, temperature_celsius, pressure_bar,
        price_per_unit, price_per_ton, currency,
        available_from, availability_start_date, available_until, availability_end_date,
        delivery_available, pickup_available, status, created_by,
        lab_report_url, lab_report_filename, verification_status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $6, $8,
        $9, $9, $10, $10,
        $11, $11, $12, $13,
        $14, $14, $15,
        $16, $16, $17,
        $18::timestamptz, $18::date, $19::timestamptz, $19::date,
        $20, $21, $22, $23,
        $24, $25, $26
      ) RETURNING id;
    `;

    const values = [
      organizationId,
      input.facilityId,
      listingCode,
      input.title,
      input.description || null,
      input.availableQuantity,
      remainingQuantity,
      input.quantityUnit || 'tonne',
      input.minimumOrderQuantity || 1,
      input.purityPercentage,
      input.physicalForm.toUpperCase(),
      input.captureMethod || null,
      input.captureSource || null,
      input.temperatureCelsius !== undefined ? input.temperatureCelsius : null,
      input.pressureBar !== undefined ? input.pressureBar : null,
      input.pricePerUnit,
      input.currency || 'INR',
      input.availableFrom,
      input.availableUntil || null,
      input.deliveryAvailable !== false,
      input.pickupAvailable !== false,
      initialStatus,
      createdByUserId,
      input.labReportUrl || null,
      input.labReportFilename || null,
      'PENDING_VERIFICATION',
    ];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(sql, values);
      const newListingId = res.rows[0].id;

      // Insert status history entry
      const historySql = `
        INSERT INTO co2_listing_status_history (
          listing_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason
        ) VALUES (
          $1, 'DRAFT', 'DRAFT', $2, $2, $3, $3, $4
        );
      `;
      await client.query(historySql, [
        newListingId, 
        initialStatus, 
        createdByUserId, 
        input.publishNow ? 'Initial declaration published' : 'Initial declaration saved as draft'
      ]);

      await client.query('COMMIT');
      const created = await this.findByCodeOrId(newListingId);
      return created!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(listingId: string, input: UpdateListingInput): Promise<ListingDTO> {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: any[] = [listingId];
    let paramIndex = 2;

    if (input.title !== undefined) {
      setClauses.push(`title = $${paramIndex}`);
      values.push(input.title);
      paramIndex++;
    }
    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex}`);
      values.push(input.description);
      paramIndex++;
    }
    if (input.availableQuantity !== undefined) {
      setClauses.push(`available_quantity = $${paramIndex}`);
      setClauses.push(`available_quantity_tons = $${paramIndex}`);
      values.push(input.availableQuantity);
      paramIndex++;
    }
    if (input.minimumOrderQuantity !== undefined) {
      setClauses.push(`minimum_order_quantity = $${paramIndex}`);
      setClauses.push(`minimum_order_tons = $${paramIndex}`);
      values.push(input.minimumOrderQuantity);
      paramIndex++;
    }
    if (input.purityPercentage !== undefined) {
      setClauses.push(`purity_percentage = $${paramIndex}`);
      values.push(input.purityPercentage);
      paramIndex++;
    }
    if (input.physicalForm !== undefined) {
      setClauses.push(`co2_physical_form = $${paramIndex}`);
      setClauses.push(`state_form = $${paramIndex}`);
      values.push(input.physicalForm.toUpperCase());
      paramIndex++;
    }
    if (input.captureMethod !== undefined) {
      setClauses.push(`capture_method = $${paramIndex}`);
      values.push(input.captureMethod);
      paramIndex++;
    }
    if (input.captureSource !== undefined) {
      setClauses.push(`capture_source = $${paramIndex}`);
      values.push(input.captureSource);
      paramIndex++;
    }
    if (input.temperatureCelsius !== undefined) {
      setClauses.push(`temperature_c = $${paramIndex}`);
      setClauses.push(`temperature_celsius = $${paramIndex}`);
      values.push(input.temperatureCelsius);
      paramIndex++;
    }
    if (input.pressureBar !== undefined) {
      setClauses.push(`pressure_bar = $${paramIndex}`);
      values.push(input.pressureBar);
      paramIndex++;
    }
    if (input.pricePerUnit !== undefined) {
      setClauses.push(`price_per_unit = $${paramIndex}`);
      setClauses.push(`price_per_ton = $${paramIndex}`);
      values.push(input.pricePerUnit);
      paramIndex++;
    }
    if (input.availableFrom !== undefined) {
      setClauses.push(`available_from = $${paramIndex}::timestamptz`);
      setClauses.push(`availability_start_date = $${paramIndex}::date`);
      values.push(input.availableFrom);
      paramIndex++;
    }
    if (input.availableUntil !== undefined) {
      setClauses.push(`available_until = $${paramIndex}::timestamptz`);
      setClauses.push(`availability_end_date = $${paramIndex}::date`);
      values.push(input.availableUntil);
      paramIndex++;
    }
    if (input.deliveryAvailable !== undefined) {
      setClauses.push(`delivery_available = $${paramIndex}`);
      values.push(input.deliveryAvailable);
      paramIndex++;
    }
    if (input.pickupAvailable !== undefined) {
      setClauses.push(`pickup_available = $${paramIndex}`);
      values.push(input.pickupAvailable);
      paramIndex++;
    }
    if (input.labReportUrl !== undefined) {
      setClauses.push(`lab_report_url = $${paramIndex}`);
      values.push(input.labReportUrl);
      paramIndex++;
    }
    if (input.labReportFilename !== undefined) {
      setClauses.push(`lab_report_filename = $${paramIndex}`);
      values.push(input.labReportFilename);
      paramIndex++;
    }
    if (input.verificationStatus !== undefined) {
      setClauses.push(`verification_status = $${paramIndex}`);
      values.push(input.verificationStatus);
      paramIndex++;
    }
    if (input.verificationNotes !== undefined) {
      setClauses.push(`verification_notes = $${paramIndex}`);
      values.push(input.verificationNotes);
      paramIndex++;
    }

    const sql = `
      UPDATE co2_listings 
      SET ${setClauses.join(', ')} 
      WHERE id = $1;
    `;
    await pool.query(sql, values);
    const updated = await this.findByCodeOrId(listingId);
    return updated!;
  }

  /**
   * Update listing status and record audit log in status history
   */
  async updateStatus(
    listingId: string, 
    currentStatus: string, 
    newStatus: string, 
    userId: string, 
    reason?: string
  ): Promise<ListingDTO> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateSql = `
        UPDATE co2_listings 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2;
      `;
      await client.query(updateSql, [newStatus, listingId]);

      const historySql = `
        INSERT INTO co2_listing_status_history (
          listing_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason
        ) VALUES (
          $1, $2, $2, $3, $3, $4, $4, $5
        );
      `;
      await client.query(historySql, [listingId, currentStatus, newStatus, userId, reason || null]);

      await client.query('COMMIT');
      const updated = await this.findByCodeOrId(listingId);
      return updated!;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve listing status history records
   */
  async getStatusHistory(listingId: string): Promise<ListingStatusHistoryDTO[]> {
    const sql = `
      SELECT 
        h.id, h.previous_status, h.from_status, h.new_status, h.to_status, h.reason, h.created_at,
        u.id as user_id, u.first_name, u.last_name
      FROM co2_listing_status_history h
      LEFT JOIN users u ON COALESCE(h.changed_by_user_id, h.changed_by) = u.id
      WHERE h.listing_id = $1
      ORDER BY h.created_at DESC;
    `;
    const res = await pool.query(sql, [listingId]);
    return res.rows.map((r: any) => ({
      id: r.id,
      fromStatus: r.from_status || r.previous_status || null,
      toStatus: r.to_status || r.new_status,
      changedBy: r.user_id ? {
        id: r.user_id,
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'System User',
      } : null,
      reason: r.reason || null,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
}
