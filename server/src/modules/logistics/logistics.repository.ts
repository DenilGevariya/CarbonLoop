import { query, pool } from '../../config/database';
import {
  LogisticsQuote,
  LogisticsQuoteDetail,
  CreateQuoteDTO,
  QuoteStatus,
  LogisticsProviderInfo,
  TransportMode,
} from './logistics.types';
import {
  calculateHaversineDistanceKm,
  estimateTransitDurationMinutes,
  calculateTransportEmissionsKg,
  calculateLogisticsDecisionScore,
} from './logistics.estimation';

export class LogisticsRepository {
  async getLogisticsProviders(): Promise<LogisticsProviderInfo[]> {
    const res = await query<LogisticsProviderInfo>(
      `SELECT 
        id, 
        name, 
        org_type, 
        verification_status, 
        city, 
        state, 
        country
       FROM organizations 
       WHERE UPPER(org_type) = 'LOGISTICS_PROVIDER' 
          OR LOWER(name) LIKE '%logistics%' 
          OR LOWER(name) LIKE '%transport%' 
          OR LOWER(name) LIKE '%freight%'
       ORDER BY name ASC`
    );
    return res.rows;
  }

  async createQuote(
    providerOrgId: string,
    originFacilityId: string,
    destinationFacilityId: string,
    distanceKm: number,
    durationMinutes: number,
    estimatedCo2eKg: number,
    totalCost: number,
    userId: string,
    dto: CreateQuoteDTO
  ): Promise<LogisticsQuote> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const quoteRes = await client.query<LogisticsQuote>(
        `INSERT INTO logistics_quotes (
          order_id, provider_organization_id, origin_facility_id, destination_facility_id,
          distance_km, estimated_duration_minutes, transport_mode,
          base_cost, fuel_surcharge, handling_cost, other_cost, total_cost,
          currency, estimated_co2e_kg, valid_until, status
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, 'SUBMITTED'
        ) RETURNING *`,
        [
          dto.order_id,
          providerOrgId,
          originFacilityId,
          destinationFacilityId,
          distanceKm,
          durationMinutes,
          dto.transport_mode,
          dto.base_cost,
          dto.fuel_surcharge || 0,
          dto.handling_cost || 0,
          dto.other_cost || 0,
          totalCost,
          dto.currency || 'INR',
          estimatedCo2eKg,
          dto.valid_until,
        ]
      );

      const quote = quoteRes.rows[0];

      // Record quote status history
      await client.query(
        `INSERT INTO quote_status_history (quote_id, from_status, to_status, changed_by, reason)
         VALUES ($1, NULL, 'SUBMITTED', $2, $3)`,
        [quote.id, userId, dto.notes || 'Logistics transport quote submitted']
      );

      // Record audit log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, 'quote_created', 'logistics_quotes', $3, $4)`,
        [userId, providerOrgId, quote.id, JSON.stringify({ order_id: dto.order_id, total_cost: totalCost })]
      );

      await client.query('COMMIT');
      return quote;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getQuoteById(id: string): Promise<LogisticsQuoteDetail | null> {
    const res = await query<any>(
      `SELECT 
        q.*,
        p_org.name as provider_name,
        o.order_number,
        COALESCE(o.quantity, o.quantity_tons, 0) as order_quantity,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        f_orig.name as origin_facility_name,
        f_orig.city as origin_city,
        f_orig.state as origin_state,
        f_orig.latitude as orig_lat,
        f_orig.longitude as orig_lon,
        f_dest.name as destination_facility_name,
        f_dest.city as destination_city,
        f_dest.state as destination_state,
        f_dest.latitude as dest_lat,
        f_dest.longitude as dest_lon
       FROM logistics_quotes q
       JOIN organizations p_org ON q.provider_organization_id = p_org.id
       JOIN orders o ON q.order_id = o.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       LEFT JOIN facilities f_orig ON q.origin_facility_id = f_orig.id
       LEFT JOIN facilities f_dest ON q.destination_facility_id = f_dest.id
       WHERE q.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    const distanceKm = parseFloat(row.distance_km || '0');
    const totalCost = parseFloat(row.total_cost || '0');
    const durationMins = parseInt(row.estimated_duration_minutes || '0', 10);
    const co2eKg = parseFloat(row.estimated_co2e_kg || '0');

    // Calculate decision score
    const baselineCost = Math.max(1000, distanceKm * 25 + 5000);
    const decisionScore = calculateLogisticsDecisionScore(
      totalCost,
      durationMins,
      co2eKg,
      baselineCost,
      Math.max(60, distanceKm * 1.5),
      distanceKm * (parseFloat(row.order_quantity || '10') || 10) * 0.089
    );

    return {
      ...row,
      distance_km: distanceKm,
      estimated_duration_minutes: durationMins,
      base_cost: parseFloat(row.base_cost || '0'),
      fuel_surcharge: parseFloat(row.fuel_surcharge || '0'),
      handling_cost: parseFloat(row.handling_cost || '0'),
      other_cost: parseFloat(row.other_cost || '0'),
      total_cost: totalCost,
      estimated_co2e_kg: co2eKg,
      order_quantity: parseFloat(row.order_quantity || '0'),
      status: row.status.toUpperCase() as QuoteStatus,
      decision_score: decisionScore,
    };
  }

  async listQuotes(
    orgId: string,
    role: 'received' | 'sent' | 'all' = 'all',
    orderId?: string,
    status?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (orderId) {
      whereConditions.push(`q.order_id = $${paramIndex++}`);
      params.push(orderId);
    }

    if (role === 'sent') {
      whereConditions.push(`q.provider_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else if (role === 'received') {
      whereConditions.push(`(o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    } else {
      whereConditions.push(`(q.provider_organization_id = $${paramIndex} OR o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`LOWER(q.status) = LOWER($${paramIndex++})`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM logistics_quotes q
       JOIN orders o ON q.order_id = o.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const itemsRes = await query(
      `SELECT 
        q.*,
        p_org.name as provider_name,
        o.order_number,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        f_orig.city as origin_city,
        f_dest.city as destination_city
       FROM logistics_quotes q
       JOIN organizations p_org ON q.provider_organization_id = p_org.id
       JOIN orders o ON q.order_id = o.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       LEFT JOIN facilities f_orig ON q.origin_facility_id = f_orig.id
       LEFT JOIN facilities f_dest ON q.destination_facility_id = f_dest.id
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      items: itemsRes.rows.map((row: any) => ({
        ...row,
        distance_km: parseFloat(row.distance_km || '0'),
        base_cost: parseFloat(row.base_cost || '0'),
        fuel_surcharge: parseFloat(row.fuel_surcharge || '0'),
        handling_cost: parseFloat(row.handling_cost || '0'),
        other_cost: parseFloat(row.other_cost || '0'),
        total_cost: parseFloat(row.total_cost || '0'),
        estimated_co2e_kg: parseFloat(row.estimated_co2e_kg || '0'),
        status: row.status.toUpperCase() as QuoteStatus,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, newStatus: QuoteStatus, userId: string, reason?: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const oldRes = await client.query<{ status: string }>(`SELECT status FROM logistics_quotes WHERE id = $1`, [id]);
      const oldStatus = oldRes.rows[0]?.status || 'UNKNOWN';

      await client.query(`UPDATE logistics_quotes SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, id]);

      await client.query(
        `INSERT INTO quote_status_history (quote_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, oldStatus, newStatus, userId, reason || null]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getAvailableTransportRequests(providerOrgId: string, searchFilters: any = {}) {
    let whereConditions: string[] = [
      `UPPER(o.status) IN ('CONFIRMED', 'AWAITING_TRANSPORTER', 'IN_PREPARATION', 'TRANSACTION_CONFIRMED')`,
      `o.id NOT IN (SELECT order_id FROM logistics_request_rejections WHERE provider_organization_id = $1)`,
      `o.id NOT IN (SELECT order_id FROM shipments WHERE status IN ('TRANSPORTER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'BUYER_CONFIRMED_RECEIPT', 'COMPLETED'))`
    ];
    let params: any[] = [providerOrgId];
    let paramIndex = 2;

    if (searchFilters.seller_name) {
      whereConditions.push(`s_org.name ILIKE $${paramIndex++}`);
      params.push(`%${searchFilters.seller_name.trim()}%`);
    }

    if (searchFilters.buyer_name) {
      whereConditions.push(`b_org.name ILIKE $${paramIndex++}`);
      params.push(`%${searchFilters.buyer_name.trim()}%`);
    }

    if (searchFilters.pickup_location) {
      whereConditions.push(`(f_orig.city ILIKE $${paramIndex} OR f_orig.state ILIKE $${paramIndex} OR f_orig.name ILIKE $${paramIndex})`);
      params.push(`%${searchFilters.pickup_location.trim()}%`);
      paramIndex++;
    }

    if (searchFilters.delivery_location) {
      whereConditions.push(`(o.destination_address ILIKE $${paramIndex} OR f_dest.city ILIKE $${paramIndex} OR f_dest.state ILIKE $${paramIndex})`);
      params.push(`%${searchFilters.delivery_location.trim()}%`);
      paramIndex++;
    }

    if (searchFilters.min_quantity) {
      whereConditions.push(`COALESCE(o.quantity, o.quantity_tons, 0) >= $${paramIndex++}`);
      params.push(parseFloat(searchFilters.min_quantity));
    }

    if (searchFilters.status) {
      whereConditions.push(`LOWER(o.status) = LOWER($${paramIndex++})`);
      params.push(searchFilters.status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM orders o
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN facilities f_orig ON l.facility_id = f_orig.id
       LEFT JOIN buyer_requirements r ON o.requirement_id = r.id
       LEFT JOIN facilities f_dest ON r.facility_id = f_dest.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countRes.rows[0]?.count || '0', 10);
    const limit = searchFilters.limit ? parseInt(searchFilters.limit, 10) : 20;
    const page = searchFilters.page ? parseInt(searchFilters.page, 10) : 1;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        o.id as order_id,
        CONCAT('TR-', UPPER(SUBSTRING(o.id::text, 1, 8))) as request_id,
        o.order_number,
        s_org.id as seller_organization_id,
        s_org.name as seller_name,
        b_org.id as buyer_organization_id,
        b_org.name as buyer_name,
        COALESCE(o.quantity, o.quantity_tons, 0) as co2_quantity,
        'tonne' as quantity_unit,
        COALESCE(l.purity_percentage, 99.5) as co2_purity,
        COALESCE(CONCAT(f_orig.city, ', ', f_orig.state), f_orig.name, 'Ahmedabad, Gujarat') as pickup_location,
        COALESCE(o.destination_address, CONCAT(f_dest.city, ', ', f_dest.state), 'Vadodara, Gujarat') as delivery_location,
        COALESCE(
          ROUND(
            CAST(
              6371 * acos(
                cos(radians(COALESCE(f_orig.latitude, 23.0225))) * cos(radians(COALESCE(f_dest.latitude, 22.3072))) *
                cos(radians(COALESCE(f_dest.longitude, 73.1812)) - radians(COALESCE(f_orig.longitude, 72.5714))) +
                sin(radians(COALESCE(f_orig.latitude, 23.0225))) * sin(radians(COALESCE(f_dest.latitude, 22.3072)))
              ) AS NUMERIC
            ), 1
          ), 112.5
        ) as distance_km,
        COALESCE(o.delivery_cost, o.logistics_fee, o.unit_price * 0.15, 1200) as proposed_transport_price,
        COALESCE(o.created_at + INTERVAL '7 days', NOW() + INTERVAL '7 days') as delivery_deadline,
        'OPEN' as status,
        o.created_at
      FROM orders o
      JOIN organizations b_org ON o.buyer_organization_id = b_org.id
      JOIN organizations s_org ON o.seller_organization_id = s_org.id
      JOIN co2_listings l ON o.listing_id = l.id
      LEFT JOIN facilities f_orig ON l.facility_id = f_orig.id
      LEFT JOIN buyer_requirements r ON o.requirement_id = r.id
      LEFT JOIN facilities f_dest ON r.facility_id = f_dest.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const itemsRes = await query(sql, [...params, limit, offset]);

    return {
      items: itemsRes.rows.map((row: any) => ({
        ...row,
        co2_quantity: parseFloat((row.co2_quantity || '0').toString()),
        co2_purity: parseFloat((row.co2_purity || '0').toString()),
        distance_km: parseFloat((row.distance_km || '0').toString()),
        proposed_transport_price: parseFloat((row.proposed_transport_price || '0').toString()),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async rejectTransportRequest(orderId: string, providerOrgId: string, reason?: string): Promise<void> {
    await query(
      `INSERT INTO logistics_request_rejections (order_id, provider_organization_id, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (order_id, provider_organization_id) DO UPDATE SET reason = EXCLUDED.reason`,
      [orderId, providerOrgId, reason || 'Transporter rejected request']
    );
  }

  async acceptTransportRequest(orderId: string, providerOrgId: string, userId: string): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderRes = await client.query(`SELECT * FROM orders WHERE id = $1 FOR UPDATE`, [orderId]);
      if (orderRes.rows.length === 0) throw new Error('Order not found.');
      const order = orderRes.rows[0];

      // Check if shipment already exists
      const shpRes = await client.query(`SELECT * FROM shipments WHERE order_id = $1`, [orderId]);
      let shipment;

      if (shpRes.rows.length > 0) {
        shipment = shpRes.rows[0];
        await client.query(
          `UPDATE shipments 
           SET logistics_provider_id = $1, status = 'TRANSPORTER_ASSIGNED', updated_at = NOW() 
           WHERE id = $2`,
          [providerOrgId, shipment.id]
        );
      } else {
        const countRes = await client.query<{ count: string }>('SELECT COUNT(*) as count FROM shipments');
        const seq = parseInt(countRes.rows[0]?.count || '0', 10) + 1;
        const shipmentNumber = `CL-SHP-${seq.toString().padStart(6, '0')}`;
        const trackingRef = `CLTRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const newShpRes = await client.query(
          `INSERT INTO shipments (
            shipment_number, order_id, logistics_provider_id,
            origin_facility_id, destination_facility_id,
            quantity, quantity_unit, quantity_tons,
            scheduled_pickup_at, estimated_delivery_at, delivery_deadline,
            distance_km, estimated_distance_km, transport_mode, tracking_reference,
            destination_address, status
          ) VALUES (
            $1, $2, $3,
            $4, $5,
            $6, 'tonne', $6,
            NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days', NOW() + INTERVAL '7 days',
            112.5, 112.5, 'ISO_TANK_TRUCK', $7,
            $8, 'TRANSPORTER_ASSIGNED'
          ) RETURNING *`,
          [
            shipmentNumber,
            orderId,
            providerOrgId,
            order.origin_facility_id || null,
            order.destination_facility_id || null,
            parseFloat((order.quantity || order.quantity_tons || '10').toString()),
            trackingRef,
            order.destination_address || 'Vadodara Industrial Estate',
          ]
        );
        shipment = newShpRes.rows[0];
      }

      await client.query(
        `INSERT INTO shipment_status_history (shipment_id, from_status, to_status, changed_by, reason)
         VALUES ($1, NULL, 'TRANSPORTER_ASSIGNED', $2, 'Logistics provider accepted transportation request')`,
        [shipment.id, userId]
      );

      await client.query('COMMIT');
      return shipment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async createCounterBid(orderId: string, providerOrgId: string, userId: string, data: { proposed_price: number; message?: string; estimated_delivery_time?: string; conditions?: string }): Promise<any> {
    const quoteRes = await query(
      `INSERT INTO logistics_quotes (
        order_id, provider_organization_id, distance_km, transport_mode,
        base_cost, fuel_surcharge, handling_cost, other_cost, total_cost,
        currency, valid_until, status, message, conditions, proposed_delivery_time
      ) VALUES (
        $1, $2, 112.5, 'ISO_TANK_TRUCK',
        $3, 0, 0, 0, $3,
        'INR', NOW() + INTERVAL '14 days', 'COUNTER_BID', $4, $5, $6
      ) RETURNING *`,
      [
        orderId,
        providerOrgId,
        data.proposed_price,
        data.message || null,
        data.conditions || null,
        data.estimated_delivery_time ? new Date(data.estimated_delivery_time) : null,
      ]
    );

    return quoteRes.rows[0];
  }

  async getLogisticsDashboardStats(providerOrgId: string) {
    const availRes = await query(
      `SELECT COUNT(o.id) as count
       FROM orders o
       WHERE UPPER(o.status) IN ('CONFIRMED', 'AWAITING_TRANSPORTER', 'IN_PREPARATION', 'TRANSACTION_CONFIRMED')
         AND o.id NOT IN (SELECT order_id FROM logistics_request_rejections WHERE provider_organization_id = $1)
         AND o.id NOT IN (SELECT order_id FROM shipments WHERE status IN ('TRANSPORTER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'BUYER_CONFIRMED_RECEIPT', 'COMPLETED'))`,
      [providerOrgId]
    );

    const activeRes = await query(
      `SELECT COUNT(s.id) as count
       FROM shipments s
       WHERE s.logistics_provider_id = $1
         AND UPPER(s.status) IN ('TRANSPORTER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVING', 'SCHEDULED')`,
      [providerOrgId]
    );

    const compRes = await query(
      `SELECT COUNT(s.id) as count
       FROM shipments s
       WHERE s.logistics_provider_id = $1
         AND UPPER(s.status) IN ('DELIVERED', 'BUYER_CONFIRMED_RECEIPT', 'COMPLETED')`,
      [providerOrgId]
    );

    const overdueRes = await query(
      `SELECT COUNT(s.id) as count
       FROM shipments s
       WHERE s.logistics_provider_id = $1
         AND ((COALESCE(s.delivery_deadline, s.estimated_delivery_at) < NOW() AND UPPER(s.status) NOT IN ('DELIVERED', 'BUYER_CONFIRMED_RECEIPT', 'COMPLETED')) OR s.is_overdue = TRUE)`,
      [providerOrgId]
    );

    const propRes = await query(
      `SELECT COUNT(q.id) as count
       FROM logistics_quotes q
       WHERE q.provider_organization_id = $1
         AND UPPER(q.status) IN ('SUBMITTED', 'COUNTER_BID', 'PENDING', 'DRAFT')`,
      [providerOrgId]
    );

    return {
      availableRequestsCount: parseInt(availRes.rows[0]?.count || '0', 10),
      activeShipmentsCount: parseInt(activeRes.rows[0]?.count || '0', 10),
      completedShipmentsCount: parseInt(compRes.rows[0]?.count || '0', 10),
      overdueShipmentsCount: parseInt(overdueRes.rows[0]?.count || '0', 10),
      activeProposalsCount: parseInt(propRes.rows[0]?.count || '0', 10),
    };
  }
}

