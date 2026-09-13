import { Response, NextFunction } from 'express';
import { ListingService } from './listing.service';
import { listingFilterSchema, createListingSchema, updateListingSchema, statusActionSchema } from './listing.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const listingService = new ListingService();

/**
 * Utility helper to resolve the active organization ID for an authenticated user
 */
async function resolveUserOrgId(req: AuthenticatedRequest): Promise<string | null> {
  const userId = req.user?.userId;
  if (!userId) return null;

  // Header override if specified
  const headerOrgId = req.headers['x-organization-id'] as string;
  if (headerOrgId) {
    const check = await pool.query(
      'SELECT organization_id FROM organization_members WHERE user_id = $1 AND organization_id = $2',
      [userId, headerOrgId]
    );
    if (check.rows.length > 0) return headerOrgId;
  }

  // Primary user organization lookup
  const res = await pool.query(
    'SELECT organization_id FROM organization_members WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
    [userId]
  );
  return res.rows[0]?.organization_id || null;
}

export class ListingController {
  /**
   * GET /api/v1/listings
   * Public marketplace list
   */
  async getMarketplaceListings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = listingFilterSchema.parse(req.query);
      const result = await listingService.getMarketplaceListings(filters);
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

  /**
   * GET /api/v1/listings/stats
   * Public marketplace aggregate stats
   */
  async getMarketplaceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await listingService.getMarketplaceStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/listings/my-supply
   * Emitter supply management listings for logged-in organization
   */
  async getOrgSupplyListings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await resolveUserOrgId(req);
      if (!orgId) {
        res.status(400).json({ success: false, error: 'User does not belong to an active organization' });
        return;
      }
      const filters = listingFilterSchema.parse(req.query);
      const result = await listingService.getOrgSupplyListings(orgId, filters);
      const stats = await listingService.getOrgSupplyStats(orgId);

      res.json({
        success: true,
        data: result.items,
        stats,
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

  /**
   * GET /api/v1/listings/:identifier
   * Listing detail by code or ID
   */
  async getListingDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = Array.isArray(req.params.identifier) ? req.params.identifier[0] : req.params.identifier;
      const userOrgId = await resolveUserOrgId(req);
      const listing = await listingService.getListingDetails(identifier, userOrgId || undefined);
      res.json({
        success: true,
        data: listing,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/listings
   * Create listing
   */
  async createListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = await resolveUserOrgId(req);
      const userId = req.user?.userId;
      if (!orgId || !userId) {
        res.status(403).json({ success: false, error: 'Organization membership required to declare CO2 supply' });
        return;
      }
      const input = createListingSchema.parse(req.body);
      const created = await listingService.createListing(orgId, userId, input);
      res.status(201).json({
        success: true,
        message: input.publishNow ? 'CO2 supply listing published successfully' : 'CO2 supply declaration saved as draft',
        data: created,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/listings/:id
   * Update listing
   */
  async updateListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const orgId = await resolveUserOrgId(req);
      if (!orgId) {
        res.status(403).json({ success: false, error: 'Organization membership required' });
        return;
      }
      const input = updateListingSchema.parse(req.body);
      const updated = await listingService.updateListing(id, orgId, input);
      res.json({
        success: true,
        message: 'Listing updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Status action helper
   */
  private async executeStatusChange(req: AuthenticatedRequest, res: Response, next: NextFunction, targetStatus: string): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const orgId = await resolveUserOrgId(req);
      const userId = req.user?.userId;
      const normalizedRoles = (req.user?.roles || []).map((role) => role.trim().toLowerCase().replace(/[\s-]+/g, '_'));
      const isPlatformAdmin = normalizedRoles.some((role) => ['platform_admin', 'admin'].includes(role));
      if ((!orgId && !isPlatformAdmin) || !userId) {
        res.status(403).json({ success: false, error: 'Organization membership required' });
        return;
      }
      const { reason } = statusActionSchema.parse(req.body || {});
      const updated = await listingService.transitionStatus(id, targetStatus, orgId || '', userId, reason, isPlatformAdmin);
      res.json({
        success: true,
        message: `Listing status updated to ${targetStatus}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  publish = (req: AuthenticatedRequest, res: Response, next: NextFunction) => this.executeStatusChange(req, res, next, 'PUBLISHED');
  pause = (req: AuthenticatedRequest, res: Response, next: NextFunction) => this.executeStatusChange(req, res, next, 'PAUSED');
  resume = (req: AuthenticatedRequest, res: Response, next: NextFunction) => this.executeStatusChange(req, res, next, 'PUBLISHED');
  archive = (req: AuthenticatedRequest, res: Response, next: NextFunction) => this.executeStatusChange(req, res, next, 'ARCHIVED');
  markExhausted = (req: AuthenticatedRequest, res: Response, next: NextFunction) => this.executeStatusChange(req, res, next, 'EXHAUSTED');

  /**
   * Regulator/Admin Verification Action
   */
  async verifyListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { verificationStatus, notes } = req.body;
      const updated = await listingService.verifyListing(id, verificationStatus, notes);
      res.json({
        success: true,
        message: `Listing verification status updated to ${verificationStatus}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
