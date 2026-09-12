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
}
