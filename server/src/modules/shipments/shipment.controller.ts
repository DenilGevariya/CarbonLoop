import { Response, NextFunction } from 'express';
import { ShipmentService } from './shipment.service';
import {
  shipmentFilterSchema,
  scheduleShipmentSchema,
  reportExceptionSchema,
  addTrackingEventSchema,
} from './shipment.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const shipmentService = new ShipmentService();

async function resolveUserOrgId(req: AuthenticatedRequest): Promise<string | null> {
  const userId = req.user?.userId;
  if (!userId) return null;

  const headerOrgId = req.headers['x-organization-id'] as string;
  if (headerOrgId) {
    const check = await pool.query(
      'SELECT organization_id FROM organization_members WHERE user_id = $1 AND organization_id = $2',
      [userId, headerOrgId]
    );
    if (check.rows.length > 0) return headerOrgId;
  }

  const res = await pool.query(
    'SELECT organization_id FROM organization_members WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
    [userId]
  );
  return res.rows[0]?.organization_id || null;
}

export class ShipmentController {
  async getShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await shipmentService.getShipmentDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  async listShipments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const queryParams = shipmentFilterSchema.parse(req.query);
      const result = await shipmentService.listShipments(
        userOrgId,
        queryParams.role,
        queryParams.order_id,
        queryParams.status,
        queryParams.page,
        queryParams.limit
      );

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async scheduleShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { scheduled_pickup_at, estimated_delivery_at, notes } = scheduleShipmentSchema.parse(req.body);

      const shipment = await shipmentService.scheduleShipment(
        id,
        scheduled_pickup_at,
        estimated_delivery_at,
        userOrgId,
        req.user!.userId,
        notes
      );

      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async pickupShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await shipmentService.pickupShipment(id, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async departShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await shipmentService.departShipment(id, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async arriveShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await shipmentService.arriveShipment(id, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async deliverShipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await shipmentService.deliverShipment(id, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async confirmReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await shipmentService.confirmReceipt(id, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async reportException(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { reason, notes } = reportExceptionSchema.parse(req.body);
      const shipment = await shipmentService.reportException(id, reason, notes, userOrgId, req.user!.userId);
      res.json({ success: true, data: shipment });
    } catch (err) {
      next(err);
    }
  }

  async addTrackingEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { event_type, location_name, latitude, longitude, notes, occurred_at } = addTrackingEventSchema.parse(req.body);

      const event = await shipmentService.addTrackingEvent(
        id,
        event_type,
        location_name,
        latitude,
        longitude,
        notes,
        occurred_at
      );

      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  }
}
