import { query, pool } from '../../config/database';
import { Shipment, ShipmentDetail, RouteStop, TrackingEvent, ShipmentStatus } from './shipment.types';

export class ShipmentRepository {
  async getShipmentById(idOrNumber: string): Promise<ShipmentDetail | null> {
    const res = await query<any>(
      `SELECT 
        s.*,
        p_org.name as provider_name,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        o.order_number,
        l.title as listing_title,
        l.purity_percentage as listing_purity,
        f_orig.name as origin_facility_name,
        f_orig.city as origin_city,
        f_orig.state as origin_state,
        f_dest.name as destination_facility_name,
        f_dest.city as destination_city,
        f_dest.state as destination_state
       FROM shipments s
       JOIN organizations p_org ON s.logistics_provider_id = p_org.id
       JOIN orders o ON s.order_id = o.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN facilities f_orig ON s.origin_facility_id = f_orig.id
       LEFT JOIN facilities f_dest ON s.destination_facility_id = f_dest.id
       WHERE s.id::text = $1 OR s.shipment_number = $1`,
      [idOrNumber]
    );

    if (res.rows.length === 0) return null;
    const shipment = res.rows[0];

    // Fetch Route Stops
    const routesRes = await query<RouteStop>(
      `SELECT * FROM shipment_routes WHERE shipment_id = $1 ORDER BY sequence_number ASC`,
      [shipment.id]
    );

    // Fetch Tracking Events
    const eventsRes = await query<TrackingEvent>(
      `SELECT * FROM shipment_tracking_events WHERE shipment_id = $1 ORDER BY occurred_at ASC, created_at ASC`,
      [shipment.id]
    );

    // Fetch Status History
    const histRes = await query(
      `SELECT sh.*, COALESCE(u.first_name || ' ' || u.last_name, u.email) as changed_by_name
       FROM shipment_status_history sh
       LEFT JOIN users u ON sh.changed_by = u.id
       WHERE sh.shipment_id = $1
       ORDER BY sh.created_at ASC`,
      [shipment.id]
    );

    return {
      ...shipment,
      quantity: parseFloat((shipment.quantity || shipment.quantity_tons || '0').toString()),
      distance_km: parseFloat((shipment.distance_km || shipment.estimated_distance_km || '0').toString()),
      status: shipment.status.toUpperCase() as ShipmentStatus,
      routes: routesRes.rows,
      events: eventsRes.rows,
      status_history: histRes.rows,
    };
  }

  async listShipments(
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
      whereConditions.push(`s.order_id = $${paramIndex++}`);
      params.push(orderId);
    }

    if (role === 'sent') {
      whereConditions.push(`s.logistics_provider_id = $${paramIndex++}`);
      params.push(orgId);
    } else if (role === 'received') {
      whereConditions.push(`(o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    } else {
      whereConditions.push(`(s.logistics_provider_id = $${paramIndex} OR o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`LOWER(s.status) = LOWER($${paramIndex++})`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count 
       FROM shipments s
       JOIN orders o ON s.order_id = o.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const itemsRes = await query(
      `SELECT 
        s.*,
        p_org.name as provider_name,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        o.order_number,
        l.title as listing_title,
        f_orig.city as origin_city,
        f_dest.city as destination_city
       FROM shipments s
       JOIN organizations p_org ON s.logistics_provider_id = p_org.id
       JOIN orders o ON s.order_id = o.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN facilities f_orig ON s.origin_facility_id = f_orig.id
       LEFT JOIN facilities f_dest ON s.destination_facility_id = f_dest.id
       ${whereClause}
       ORDER BY s.updated_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      items: itemsRes.rows.map((row: any) => ({
        ...row,
        quantity: parseFloat((row.quantity || row.quantity_tons || '0').toString()),
        distance_km: parseFloat((row.distance_km || row.estimated_distance_km || '0').toString()),
        status: row.status.toUpperCase() as ShipmentStatus,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    id: string,
    newStatus: ShipmentStatus,
    userId: string,
    reason?: string,
    extraUpdates?: { actual_pickup_at?: string; actual_delivery_at?: string }
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const oldRes = await client.query<{ status: string }>(`SELECT status FROM shipments WHERE id = $1`, [id]);
      const oldStatus = oldRes.rows[0]?.status || 'UNKNOWN';

      let sql = `UPDATE shipments SET status = $1, updated_at = NOW()`;
      const sqlParams: any[] = [newStatus];
      let pIdx = 2;

      if (extraUpdates?.actual_pickup_at) {
        sql += `, actual_pickup_at = $${pIdx++}, pickup_date = $${pIdx - 1}`;
        sqlParams.push(extraUpdates.actual_pickup_at);
      }
      if (extraUpdates?.actual_delivery_at) {
        sql += `, actual_delivery_at = $${pIdx++}, actual_delivery_date = $${pIdx - 1}`;
        sqlParams.push(extraUpdates.actual_delivery_at);
      }

      sql += ` WHERE id = $${pIdx}`;
      sqlParams.push(id);

      await client.query(sql, sqlParams);

      await client.query(
        `INSERT INTO shipment_status_history (shipment_id, from_status, to_status, changed_by, reason)
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

  async addTrackingEvent(
    shipmentId: string,
    eventType: string,
    locationName: string,
    statusStr: string,
    latitude?: number,
    longitude?: number,
    notes?: string,
    occurredAt?: string
  ): Promise<TrackingEvent> {
    const res = await query<TrackingEvent>(
      `INSERT INTO shipment_tracking_events (
        shipment_id, event_type, status, event_status, location_name, latitude, longitude, notes, occurred_at, event_time
      ) VALUES ($1, $2, $3, $3, $4, $5, $6, $7, COALESCE($8::timestamptz, NOW()), COALESCE($8::timestamptz, NOW()))
      RETURNING *`,
      [
        shipmentId,
        eventType,
        statusStr,
        locationName,
        latitude || null,
        longitude || null,
        notes || null,
        occurredAt || null,
      ]
    );
    return res.rows[0];
  }
}
