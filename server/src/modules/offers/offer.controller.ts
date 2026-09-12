import { Response, NextFunction } from 'express';
import { OfferService } from './offer.service';
import { OrderService } from '../orders/order.service';
import {
  createOfferSchema,
  counterOfferSchema,
  rejectOfferSchema,
  withdrawOfferSchema,
  offerFilterSchema,
} from './offer.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const offerService = new OfferService();
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

export class OfferController {
  async createOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const dto = createOfferSchema.parse(req.body);
      const offer = await offerService.createOffer(userOrgId, req.user!.userId, dto);

      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  }

  async counterOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const dto = counterOfferSchema.parse(req.body);
      const counter = await offerService.counterOffer(id, userOrgId, req.user!.userId, dto);

      res.status(201).json({ success: true, data: counter });
    } catch (err) {
      next(err);
    }
  }

  async getOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await offerService.getOfferDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  async listOffers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const queryParams = offerFilterSchema.parse(req.query);
      const result = await offerService.listOffers(
        userOrgId,
        queryParams.role,
        queryParams.inquiry_id,
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

  async acceptOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const destinationAddress = req.body?.destination_address;

      const order = await orderService.acceptOffer(id, userOrgId, req.user!.userId, destinationAddress);

      res.status(200).json({
        success: true,
        data: order,
        message: 'Commercial offer accepted and Purchase Order generated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { reason } = rejectOfferSchema.parse(req.body || {});

      await offerService.rejectOffer(id, userOrgId, req.user!.userId, reason);

      res.json({ success: true, message: 'Offer rejected.' });
    } catch (err) {
      next(err);
    }
  }

  async withdrawOffer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { reason } = withdrawOfferSchema.parse(req.body || {});

      await offerService.withdrawOffer(id, userOrgId, req.user!.userId, reason);

      res.json({ success: true, message: 'Offer withdrawn.' });
    } catch (err) {
      next(err);
    }
  }
}
