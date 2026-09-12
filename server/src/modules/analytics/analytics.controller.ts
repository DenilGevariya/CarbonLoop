import { Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { AuthenticatedRequest } from '../auth/auth.types';
import { analyticsQuerySchema } from './analytics.validation';
import { pool } from '../../config/database';

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
    'SELECT organization_id FROM organization_members WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  return res.rows[0]?.organization_id || null;
}

export class AnalyticsController {
  private service = new AnalyticsService();

  getOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const userOrgId = await resolveUserOrgId(req);
      if (userOrgId && !req.user?.roles?.includes('platform_admin')) {
        filters.organization_id = userOrgId;
      }
      const data = await this.service.getOverview({
        timeframe: filters.timeframe,
        from: filters.from,
        to: filters.to,
        organizationId: filters.organization_id,
        region: filters.region,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getFunnel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getFunnel(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getSupply = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getSupply(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getDemand = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getDemand(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getMatching = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getMatching(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getLogistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getLogistics(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getRegions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getRegions();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getObservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getObservations(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getImpactReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const data = await this.service.getImpactReport(filters);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getPublicImpact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getPublicImpact();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getPriceByPurity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const userOrgId = await resolveUserOrgId(req);
      if (userOrgId && !req.user?.roles?.includes('platform_admin')) {
        filters.organization_id = userOrgId;
      }
      const data = await this.service.getPriceByPurity({
        timeframe: filters.timeframe,
        from: filters.from,
        to: filters.to,
        organizationId: filters.organization_id,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getTopPricePoints = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const filters = analyticsQuerySchema.parse(req.query);
      const userOrgId = await resolveUserOrgId(req);
      if (userOrgId && !req.user?.roles?.includes('platform_admin')) {
        filters.organization_id = userOrgId;
      }
      const data = await this.service.getTopPricePoints({
        timeframe: filters.timeframe,
        from: filters.from,
        to: filters.to,
        organizationId: filters.organization_id,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}
