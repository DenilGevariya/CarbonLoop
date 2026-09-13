import { LogisticsRepository } from './logistics.repository';
import { CreateQuoteDTO, LogisticsQuote, LogisticsQuoteDetail, QuoteStatus } from './logistics.types';
import { query, pool } from '../../config/database';
import { NotificationService } from '../notifications/notification.service';
import {
  calculateHaversineDistanceKm,
  estimateTransitDurationMinutes,
  calculateTransportEmissionsKg,
} from './logistics.estimation';

const notificationService = new NotificationService();

export class LogisticsService {
  private repo = new LogisticsRepository();

  async getLogisticsProviders() {
    return this.repo.getLogisticsProviders();
  }

  async createQuote(userOrgId: string, userId: string, dto: CreateQuoteDTO): Promise<LogisticsQuote> {
    // 1. Verify org is logistics provider or participant
    const orgRes = await query(`SELECT org_type FROM organizations WHERE id = $1`, [userOrgId]);
    if (orgRes.rows.length === 0) {
      const err: any = new Error('Organization not found.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Fetch order & facility details
    const orderRes = await query(
      `SELECT 
        o.*,
        l.facility_id as listing_facility_id,
        f_l.latitude as orig_lat, f_l.longitude as orig_lon, f_l.id as orig_fac_id,
        r.facility_id as req_facility_id,
        f_r.latitude as dest_lat, f_r.longitude as dest_lon, f_r.id as dest_fac_id
       FROM orders o
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN facilities f_l ON l.facility_id = f_l.id
       LEFT JOIN buyer_requirements r ON o.requirement_id = r.id
       LEFT JOIN facilities f_r ON r.facility_id = f_r.id
       WHERE o.id = $1`,
      [dto.order_id]
    );

    if (orderRes.rows.length === 0) {
      const err: any = new Error('Associated order not found.');
      err.statusCode = 404;
      throw err;
    }

    const order = orderRes.rows[0];
    const orderQty = parseFloat((order.quantity || order.quantity_tons || '10').toString());

    const originFacilityId = dto.origin_facility_id || order.orig_fac_id;
    const destinationFacilityId = dto.destination_facility_id || order.dest_fac_id;

    const lat1 = parseFloat(order.orig_lat || '23.0225');
    const lon1 = parseFloat(order.orig_lon || '72.5714');
    const lat2 = parseFloat(order.dest_lat || '22.3072');
    const lon2 = parseFloat(order.dest_lon || '73.1812');

    const distanceKm = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) || 120;
    const durationMinutes = estimateTransitDurationMinutes(distanceKm, dto.transport_mode);
    const estimatedCo2eKg = calculateTransportEmissionsKg(distanceKm, orderQty, dto.transport_mode);

    // Recalculate financial total server-side
    const baseCost = dto.base_cost;
    const fuel = dto.fuel_surcharge || 0;
    const handling = dto.handling_cost || 0;
    const other = dto.other_cost || 0;
    const totalCost = baseCost + fuel + handling + other;

    // Check validity date
    if (new Date(dto.valid_until).getTime() <= Date.now()) {
      const err: any = new Error('Quote validity date must be in the future.');
      err.statusCode = 400;
      throw err;
    }

    const quote = await this.repo.createQuote(
      userOrgId,
      originFacilityId,
      destinationFacilityId,
      distanceKm,
      durationMinutes,
      estimatedCo2eKg,
      totalCost,
      userId,
      dto
    );

    // Notify buyer & seller
    await notificationService.notifyOrganization(
      order.buyer_organization_id,
      'Logistics Quote Received',
      `A transport quote of ₹${totalCost.toLocaleString('en-IN')} was submitted for Order #${order.order_number}.`,
      'LOGISTICS_QUOTE_RECEIVED',
      'logistics_quote',
      quote.id,
      `/dashboard/logistics/quotes/${quote.id}`
    );

    return quote;
  }

  async getQuoteDetail(id: string, userOrgId: string, isPlatformAdmin = false): Promise<LogisticsQuoteDetail> {
    const detail = await this.repo.getQuoteById(id);
    if (!detail) {
      const err: any = new Error('Logistics quote not found.');
      err.statusCode = 404;
      throw err;
    }
    return detail;
  }

  async listQuotes(orgId: string, role: 'received' | 'sent' | 'all' = 'all', orderId?: string, status?: string, page = 1, limit = 20) {
    return this.repo.listQuotes(orgId, role, orderId, status, page, limit);
  }

  /**
   * Accepts a logistics quote and generates a Shipment record inside a PostgreSQL transaction.
   */
  async acceptQuote(quoteId: string, userOrgId: string, userId: string): Promise<any> {
    // 1. Idempotency Check: return existing shipment if quote already accepted
    const existingShipmentRes = await pool.query(`SELECT * FROM shipments WHERE quote_id = $1`, [quoteId]);
    if (existingShipmentRes.rows.length > 0) {
      return existingShipmentRes.rows[0];
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 2. Lock quote row
      const quoteRes = await client.query(
        `SELECT * FROM logistics_quotes WHERE id = $1 FOR UPDATE`,
        [quoteId]
      );
      if (quoteRes.rows.length === 0) {
        const err: any = new Error('Logistics quote not found.');
        err.statusCode = 404;
        throw err;
      }
      const quote = quoteRes.rows[0];

      // Check quote validity
      const quoteStatus = (quote.status || '').toUpperCase();
      if (quoteStatus !== 'SUBMITTED' && quoteStatus !== 'DRAFT' && quoteStatus !== 'PENDING') {
        const err: any = new Error(`Cannot accept a quote with status '${quote.status}'.`);
        err.statusCode = 400;
        throw err;
      }

      if (new Date(quote.valid_until).getTime() <= Date.now()) {
        await client.query(`UPDATE logistics_quotes SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`, [quoteId]);
        const err: any = new Error('Quote has expired and cannot be accepted.');
        err.statusCode = 400;
        throw err;
      }

      // 3. Lock order row
      const orderRes = await client.query(
        `SELECT o.*, 
                l.title as listing_title,
                f_l.name as orig_name, f_l.city as orig_city, f_l.latitude as orig_lat, f_l.longitude as orig_lon,
                f_r.name as dest_name, f_r.city as dest_city, f_r.latitude as dest_lat, f_r.longitude as dest_lon
         FROM orders o
         JOIN co2_listings l ON o.listing_id = l.id
         LEFT JOIN facilities f_l ON l.facility_id = f_l.id
         LEFT JOIN buyer_requirements r ON o.requirement_id = r.id
         LEFT JOIN facilities f_r ON r.facility_id = f_r.id
         WHERE o.id = $1 FOR UPDATE OF o`,
        [quote.order_id]
      );
      if (orderRes.rows.length === 0) {
        const err: any = new Error('Order not found.');
        err.statusCode = 404;
        throw err;
      }
      const order = orderRes.rows[0];

      // Check authorization
      const isParticipant = order.buyer_organization_id === userOrgId || order.seller_organization_id === userOrgId;
      if (!isParticipant) {
        const err: any = new Error('You are not authorized to accept a logistics quote for this order.');
        err.statusCode = 403;
        throw err;
      }

      // 4. Update Quote Status to ACCEPTED
      await client.query(`UPDATE logistics_quotes SET status = 'ACCEPTED', updated_at = NOW() WHERE id = $1`, [quoteId]);
      await client.query(
        `INSERT INTO quote_status_history (quote_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, 'ACCEPTED', $3, 'Logistics transport quote accepted')`,
        [quoteId, quote.status, userId]
      );

      // Reject competing quotes for the same order
      await client.query(
        `UPDATE logistics_quotes SET status = 'REJECTED', updated_at = NOW()
         WHERE order_id = $1 AND id != $2 AND status IN ('SUBMITTED', 'DRAFT', 'PENDING')`,
        [quote.order_id, quoteId]
      );

      // 5. Generate Shipment Number (CL-SHP-000124)
      const countRes = await client.query<{ count: string }>('SELECT COUNT(*) as count FROM shipments');
      const seq = parseInt(countRes.rows[0]?.count || '0', 10) + 1;
      const shipmentNumber = `CL-SHP-${seq.toString().padStart(6, '0')}`;
      const trackingReference = `CLTRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const orderQty = parseFloat((order.quantity || order.quantity_tons || '0').toString());
      const scheduledPickupAt = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const estDurationMins = parseInt(quote.estimated_duration_minutes || '240', 10);
      const estimatedDeliveryAt = new Date(Date.now() + 86400000 + estDurationMins * 60000).toISOString();

      // 6. Create Shipment Record
      const shipmentRes = await client.query(
        `INSERT INTO shipments (
          shipment_number, order_id, logistics_provider_id, quote_id,
          origin_facility_id, destination_facility_id,
          quantity, quantity_unit, quantity_tons,
          scheduled_pickup_at, estimated_delivery_at,
          distance_km, estimated_distance_km, transport_mode, tracking_reference,
          destination_address, status
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6,
          $7, 'tonne', $7,
          $8, $9,
          $10, $10, $11, $12,
          $13, 'SCHEDULED'
        ) RETURNING *`,
        [
          shipmentNumber,
          quote.order_id,
          quote.provider_organization_id,
          quoteId,
          quote.origin_facility_id || order.listing_facility_id,
          quote.destination_facility_id || order.req_facility_id,
          orderQty,
          scheduledPickupAt,
          estimatedDeliveryAt,
          parseFloat(quote.distance_km || '120'),
          quote.transport_mode || 'ISO_TANK_TRUCK',
          trackingReference,
          order.destination_address || 'Vadodara Industrial Estate',
        ]
      );
      const shipment = shipmentRes.rows[0];

      // 7. Insert Initial Route Stops
      const origName = order.orig_name || 'Ahmedabad Capture Facility';
      const destName = order.dest_name || order.destination_address || 'Vadodara Industrial Plant';

      await client.query(
        `INSERT INTO shipment_routes (shipment_id, sequence_number, location_name, location_type, latitude, longitude)
         VALUES 
         ($1, 1, $2, 'ORIGIN', $3, $4),
         ($1, 2, 'Nadiad Logistics Hub', 'WAYPOINT', 22.6916, 72.8634),
         ($1, 3, $5, 'DESTINATION', $6, $7)`,
        [
          shipment.id,
          origName,
          parseFloat(order.orig_lat || '23.0225'),
          parseFloat(order.orig_lon || '72.5714'),
          destName,
          parseFloat(order.dest_lat || '22.3072'),
          parseFloat(order.dest_lon || '73.1812'),
        ]
      );

      // 8. Insert Initial Tracking Event
      await client.query(
        `INSERT INTO shipment_tracking_events (shipment_id, event_type, status, location_name, occurred_at, notes)
         VALUES ($1, 'SHIPMENT_CREATED', 'SCHEDULED', $2, NOW(), 'Shipment created and scheduled from accepted quote')`,
        [shipment.id, origName]
      );

      // 9. Update Order Status
      await client.query(`UPDATE orders SET status = 'IN_PREPARATION', updated_at = NOW() WHERE id = $1`, [quote.order_id]);

      // 10. Status History & Audit Log
      await client.query(
        `INSERT INTO shipment_status_history (shipment_id, from_status, to_status, changed_by, reason)
         VALUES ($1, NULL, 'SCHEDULED', $2, 'Shipment scheduled upon quote acceptance')`,
        [shipment.id, userId]
      );

      await client.query(
        `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, 'shipment_created', 'shipments', $3, $4)`,
        [userId, userOrgId, shipment.id, JSON.stringify({ shipment_number: shipmentNumber, quote_id: quoteId })]
      );

      await client.query('COMMIT');

      // 11. Notifications
      await notificationService.notifyOrganization(
        quote.provider_organization_id,
        `Transport Quote Accepted (${shipmentNumber})`,
        `Your quote for Order #${order.order_number} was accepted. Shipment ${shipmentNumber} scheduled.`,
        'LOGISTICS_QUOTE_ACCEPTED',
        'shipment',
        shipment.id,
        `/dashboard/shipments/${shipment.id}`
      );

      await notificationService.notifyOrganization(
        order.buyer_organization_id,
        `Logistics Provider Assigned (${shipmentNumber})`,
        `Transport assigned for Order #${order.order_number}. Shipment ${shipmentNumber}.`,
        'SHIPMENT_CREATED',
        'shipment',
        shipment.id,
        `/dashboard/shipments/${shipment.id}`
      );

      return shipment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async rejectQuote(id: string, userOrgId: string, userId: string, reason?: string): Promise<void> {
    await this.repo.updateStatus(id, 'REJECTED', userId, reason);
  }

  async withdrawQuote(id: string, userOrgId: string, userId: string, reason?: string): Promise<void> {
    await this.repo.updateStatus(id, 'WITHDRAWN', userId, reason);
  }

  async getAvailableRequests(providerOrgId: string, searchFilters: any = {}) {
    return this.repo.getAvailableTransportRequests(providerOrgId, searchFilters);
  }

  async acceptTransportRequest(orderId: string, providerOrgId: string, userId: string) {
    return this.repo.acceptTransportRequest(orderId, providerOrgId, userId);
  }

  async rejectTransportRequest(orderId: string, providerOrgId: string, reason?: string) {
    return this.repo.rejectTransportRequest(orderId, providerOrgId, reason);
  }

  async createCounterBid(orderId: string, providerOrgId: string, userId: string, data: any) {
    return this.repo.createCounterBid(orderId, providerOrgId, userId, data);
  }

  async getDashboardStats(providerOrgId: string) {
    return this.repo.getLogisticsDashboardStats(providerOrgId);
  }
}

