import { Response, NextFunction } from 'express';
import { LogisticsService } from './logistics.service';
import { createQuoteSchema, quoteFilterSchema, rejectQuoteSchema, withdrawQuoteSchema } from './logistics.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const logisticsService = new LogisticsService();

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

export class LogisticsController {
  async getProviders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const providers = await logisticsService.getLogisticsProviders();
      res.json({ success: true, data: providers });
    } catch (err) {
      next(err);
    }
  }

  async createQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const dto = createQuoteSchema.parse(req.body);
      const quote = await logisticsService.createQuote(userOrgId, req.user!.userId, dto);

      res.status(201).json({ success: true, data: quote });
    } catch (err) {
      next(err);
    }
  }

  async getQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await logisticsService.getQuoteDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  async listQuotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const queryParams = quoteFilterSchema.parse(req.query);
      const result = await logisticsService.listQuotes(
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

  async acceptQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const shipment = await logisticsService.acceptQuote(id, userOrgId, req.user!.userId);

      res.status(201).json({
        success: true,
        data: shipment,
        message: 'Logistics quote accepted and shipment scheduled successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async rejectQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { reason } = rejectQuoteSchema.parse(req.body || {});
      await logisticsService.rejectQuote(id, userOrgId, req.user!.userId, reason);

      res.json({ success: true, message: 'Quote rejected.' });
    } catch (err) {
      next(err);
    }
  }

  async withdrawQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { reason } = withdrawQuoteSchema.parse(req.body || {});
      await logisticsService.withdrawQuote(id, userOrgId, req.user!.userId, reason);

      res.json({ success: true, message: 'Quote withdrawn.' });
    } catch (err) {
      next(err);
    }
  }
}
