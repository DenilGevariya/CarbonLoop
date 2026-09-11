import { Request, Response, NextFunction } from 'express';
import { RequirementService } from './requirements.service';
import {
  createRequirementSchema,
  updateRequirementSchema,
  statusChangeSchema,
  filterRequirementsSchema,
} from './requirements.validation';

export class RequirementController {
  // GET /api/v1/requirements (Public Demand Marketplace)
  static async getPublicRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = filterRequirementsSchema.parse(req.query);
      const result = await RequirementService.getPublicRequirements(filters);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/requirements/my-requirements (Authenticated Organization Demand)
  static async getMyRequirements(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user?.active_organization_id;
      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active organization required' },
        });
      }

      const filters = filterRequirementsSchema.parse(req.query);
      const result = await RequirementService.getOrganizationRequirements(orgId, filters);
      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/requirements/stats
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await RequirementService.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/requirements/utilization-types
  static async getUtilizationTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await RequirementService.getUtilizationTypes();
      res.json({
        success: true,
        data: types,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/v1/requirements/:id
  static async getRequirementById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const requirement = await RequirementService.getRequirementByIdOrCode(id);
      res.json({
        success: true,
        data: requirement,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/v1/requirements
  static async createRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;

      if (!orgId || !userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Authenticated user with active organization required' },
        });
      }

      const input = createRequirementSchema.parse(req.body);
      const requirement = await RequirementService.createRequirement(orgId, userId, input);

      res.status(201).json({
        success: true,
        message: 'Buyer requirement created successfully',
        data: requirement,
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/v1/requirements/:id
  static async updateRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active organization required' },
        });
      }

      const input = updateRequirementSchema.parse(req.body);
      const updated = await RequirementService.updateRequirement(id, orgId, input);

      res.json({
        success: true,
        message: 'Requirement updated successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  // Lifecycle transitions
  static async publishRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;

      const updated = await RequirementService.transitionStatus(
        id,
        orgId,
        userId,
        'PUBLISHED',
        'Published requirement to CarbonLoop demand network'
      );

      res.json({
        success: true,
        message: 'Requirement published successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async pauseRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;
      const { reason } = statusChangeSchema.parse(req.body || {});

      const updated = await RequirementService.transitionStatus(
        id,
        orgId,
        userId,
        'PAUSED',
        reason || 'Temporarily paused demand requirement'
      );

      res.json({
        success: true,
        message: 'Requirement paused successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async resumeRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;

      const updated = await RequirementService.transitionStatus(
        id,
        orgId,
        userId,
        'PUBLISHED',
        'Resumed published requirement'
      );

      res.json({
        success: true,
        message: 'Requirement resumed successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async archiveRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;
      const { reason } = statusChangeSchema.parse(req.body || {});

      const updated = await RequirementService.transitionStatus(
        id,
        orgId,
        userId,
        'ARCHIVED',
        reason || 'Archived requirement'
      );

      res.json({
        success: true,
        message: 'Requirement archived successfully',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async markFulfilled(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const orgId = (req as any).user?.active_organization_id;
      const userId = (req as any).user?.id;
      const { reason } = statusChangeSchema.parse(req.body || {});

      const updated = await RequirementService.transitionStatus(
        id,
        orgId,
        userId,
        'FULFILLED',
        reason || 'Requirement fulfilled'
      );

      res.json({
        success: true,
        message: 'Requirement marked as fulfilled',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
}
