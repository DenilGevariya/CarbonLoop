import { Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { acceptOfferSchema, orderFilterSchema } from './order.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const orderService = new OrderService();

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

export class OrderController {
  async acceptOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const { offer_id, destination_address } = acceptOfferSchema.parse(req.body);
      const order = await orderService.acceptOffer(offer_id, userOrgId, req.user!.userId, destination_address);

      res.status(201).json({
        success: true,
        data: order,
        message: 'Commercial offer accepted and Purchase Order generated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await orderService.getOrderDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  async listOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const queryParams = orderFilterSchema.parse(req.query);
      const result = await orderService.listOrders(
        userOrgId,
        queryParams.role,
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

  async confirmHandshake(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const id = req.params.id as string;
      const role = (req.body.role || 'seller') as 'seller' | 'buyer' | 'logistics';
      const order = await orderService.confirmHandshake(id, userOrgId, req.user!.userId, role);

      res.json({
        success: true,
        data: order,
        message: `Three-way handshake confirmation registered for ${role.toUpperCase()}.`,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateTerms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const id = req.params.id as string;
      const order = await orderService.updateDealTerms(id, userOrgId, req.user!.userId, req.body);

      res.json({
        success: true,
        data: order,
        message: 'Commercial deal terms updated - reconfirmation required from participants.',
      });
    } catch (err) {
      next(err);
    }
  }

  async confirmReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const id = req.params.id as string;
      const order = await orderService.confirmBuyerReceipt(id, userOrgId, req.user!.userId);

      res.json({
        success: true,
        data: order,
        message: 'Buyer receipt confirmed and transaction completed.',
      });
    } catch (err) {
      next(err);
    }
  }
}
