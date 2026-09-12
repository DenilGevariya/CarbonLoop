import { ShipmentRepository } from './shipment.repository';
import { ShipmentDetail, ShipmentStatus, TrackingEvent } from './shipment.types';
import { query, pool } from '../../config/database';
import { NotificationService } from '../notifications/notification.service';

const notificationService = new NotificationService();

export class ShipmentService {
  private repo = new ShipmentRepository();

  async getShipmentDetail(idOrNumber: string, userOrgId: string, isPlatformAdmin = false): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(idOrNumber);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }
    return detail;
  }

  async listShipments(orgId: string, role: 'received' | 'sent' | 'all' = 'all', orderId?: string, status?: string, page = 1, limit = 20) {
    return this.repo.listShipments(orgId, role, orderId, status, page, limit);
  }

  async scheduleShipment(
    id: string,
    scheduledPickupAt: string,
    estimatedDeliveryAt: string,
    userOrgId: string,
    userId: string,
    notes?: string
  ): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    if (new Date(scheduledPickupAt).getTime() >= new Date(estimatedDeliveryAt).getTime()) {
      const err: any = new Error('Scheduled pickup time must be before estimated delivery time.');
      err.statusCode = 400;
      throw err;
    }

    await query(
      `UPDATE shipments 
       SET scheduled_pickup_at = $1, estimated_delivery_at = $2, notes = $3, status = 'SCHEDULED', updated_at = NOW() 
       WHERE id = $4`,
      [scheduledPickupAt, estimatedDeliveryAt, notes || null, id]
    );

    await this.repo.addTrackingEvent(
      id,
      'SCHEDULED',
      detail.origin_facility_name || 'Origin Facility',
      'SCHEDULED',
      undefined,
      undefined,
      notes || 'Shipment dispatch window confirmed'
    );

    // Update order status
    await query(`UPDATE orders SET status = 'READY_FOR_SHIPMENT', updated_at = NOW() WHERE id = $1`, [detail.order_id]);

    return (await this.repo.getShipmentById(id))!;
  }

  async pickupShipment(id: string, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = (detail.status || '').toUpperCase();
    if (currentStatus !== 'SCHEDULED' && currentStatus !== 'PLANNED') {
      const err: any = new Error(`Cannot perform pickup on shipment with status '${detail.status}'.`);
      err.statusCode = 400;
      throw err;
    }

    const nowIso = new Date().toISOString();
    await this.repo.updateStatus(id, 'PICKED_UP', userId, 'Cargo loaded and picked up at origin facility', {
      actual_pickup_at: nowIso,
    });

    await this.repo.addTrackingEvent(
      id,
      'PICKED_UP',
      detail.origin_facility_name || 'Origin Capture Facility',
      'PICKED_UP',
      undefined,
      undefined,
      'ISO tank container loaded and verified'
    );

    await query(`UPDATE orders SET status = 'IN_TRANSIT', updated_at = NOW() WHERE id = $1`, [detail.order_id]);

    // Notify buyer
    const orderRes = await query(`SELECT buyer_organization_id, order_number FROM orders WHERE id = $1`, [detail.order_id]);
    if (orderRes.rows.length > 0) {
      await notificationService.notifyOrganization(
        orderRes.rows[0].buyer_organization_id,
        'CO₂ Cargo Picked Up',
        `Shipment ${detail.shipment_number} for Order #${orderRes.rows[0].order_number} has been picked up.`,
        'SHIPMENT_PICKED_UP',
        'shipment',
        id,
        `/dashboard/shipments/${detail.shipment_number}`
      );
    }

    return (await this.repo.getShipmentById(id))!;
  }

  async departShipment(id: string, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    await this.repo.updateStatus(id, 'IN_TRANSIT', userId, 'Departed facility for destination');

    await this.repo.addTrackingEvent(
      id,
      'DEPARTED',
      detail.origin_city ? `${detail.origin_city} Dispatch Hub` : 'Origin Facility',
      'IN_TRANSIT',
      undefined,
      undefined,
      'Departed origin facility. In transit.'
    );

    return (await this.repo.getShipmentById(id))!;
  }

  async arriveShipment(id: string, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    await this.repo.updateStatus(id, 'ARRIVING', userId, 'Approaching destination industrial facility');

    await this.repo.addTrackingEvent(
      id,
      'ARRIVING',
      detail.destination_city ? `${detail.destination_city} Checkpoint` : 'Destination Facility',
      'ARRIVING',
      undefined,
      undefined,
      'Vehicle within arrival geofence'
    );

    return (await this.repo.getShipmentById(id))!;
  }

  async deliverShipment(id: string, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    const nowIso = new Date().toISOString();
    await this.repo.updateStatus(id, 'DELIVERED', userId, 'Cargo delivered to destination facility', {
      actual_delivery_at: nowIso,
    });

    await this.repo.addTrackingEvent(
      id,
      'DELIVERED',
      detail.destination_facility_name || detail.destination_address || 'Destination Plant',
      'DELIVERED',
      undefined,
      undefined,
      'CO₂ cargo offloaded into storage facility'
    );

    await query(`UPDATE orders SET status = 'DELIVERED', updated_at = NOW() WHERE id = $1`, [detail.order_id]);

    const orderRes = await query(`SELECT buyer_organization_id, order_number FROM orders WHERE id = $1`, [detail.order_id]);
    if (orderRes.rows.length > 0) {
      await notificationService.notifyOrganization(
        orderRes.rows[0].buyer_organization_id,
        'Shipment Delivered - Action Required',
        `Shipment ${detail.shipment_number} for Order #${orderRes.rows[0].order_number} was delivered. Please confirm receipt.`,
        'SHIPMENT_DELIVERED',
        'shipment',
        id,
        `/dashboard/shipments/${detail.shipment_number}`
      );
    }

    return (await this.repo.getShipmentById(id))!;
  }

  async confirmReceipt(id: string, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = (detail.status || '').toUpperCase();
    if (currentStatus !== 'DELIVERED') {
      const err: any = new Error(`Cannot confirm receipt for shipment with status '${detail.status}'. Must be DELIVERED.`);
      err.statusCode = 400;
      throw err;
    }

    await this.repo.updateStatus(id, 'COMPLETED', userId, 'Buyer confirmed receipt of cargo');

    await this.repo.addTrackingEvent(
      id,
      'DELIVERY_CONFIRMED',
      detail.destination_facility_name || 'Destination Plant',
      'COMPLETED',
      undefined,
      undefined,
      'Receipt confirmed by buyer organization. Off-take execution completed.'
    );

    // Update order status to COMPLETED
    await query(`UPDATE orders SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1`, [detail.order_id]);

    return (await this.repo.getShipmentById(id))!;
  }

  async reportException(id: string, reason: string, notes: string | undefined, userOrgId: string, userId: string): Promise<ShipmentDetail> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    await query(
      `UPDATE shipments SET exception_reason = $1, exception_notes = $2, status = 'EXCEPTION', updated_at = NOW() WHERE id = $3`,
      [reason, notes || null, id]
    );

    await this.repo.addTrackingEvent(
      id,
      'EXCEPTION',
      'Route Checkpoint',
      'EXCEPTION',
      undefined,
      undefined,
      `Operational Exception: ${reason} - ${notes || ''}`
    );

    return (await this.repo.getShipmentById(id))!;
  }

  async addTrackingEvent(
    id: string,
    eventType: string,
    locationName: string,
    latitude?: number,
    longitude?: number,
    notes?: string,
    occurredAt?: string
  ): Promise<TrackingEvent> {
    const detail = await this.repo.getShipmentById(id);
    if (!detail) {
      const err: any = new Error('Shipment not found.');
      err.statusCode = 404;
      throw err;
    }

    return this.repo.addTrackingEvent(
      id,
      eventType,
      locationName,
      detail.status,
      latitude,
      longitude,
      notes,
      occurredAt
    );
  }
}
