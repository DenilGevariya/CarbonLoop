import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AdminService } from './admin.service';
import { validateOrganizationStatusChange, validateAlertResolution } from './admin.validation';

const adminService = new AdminService();

export class AdminController {
  public async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [kpis, health] = await Promise.all([
        adminService.getOverviewKPIs(),
        adminService.getNetworkHealth(),
      ]);
      res.json({
        success: true,
        data: {
          kpis,
          health,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getHealth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await adminService.getNetworkHealth();
      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  }

  public async search(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const results = await adminService.searchGlobal(query);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }

  public async getAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resolved = req.query.resolved === 'true';
      const alerts = await adminService.listAlerts(resolved);
      res.json({ success: true, data: alerts });
    } catch (err) {
      next(err);
    }
  }

  public async resolveAlert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const alertId = req.params.id as string;
      const validation = validateAlertResolution(req.body);
      if (!validation.valid) {
        res.status(400).json({ success: false, error: { code: 'INVALID_BODY', message: validation.error } });
        return;
      }

      const alert = await adminService.resolveAlert(alertId, req.user!.userId, validation.notes);
      res.json({ success: true, data: alert, message: 'System alert resolved.' });
    } catch (err) {
      next(err);
    }
  }

  public async listOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.listOrganizations({ type, status, search, limit, offset });
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getOrganizationDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const detail = await adminService.getOrganizationDetail(id);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  public async listListings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '20', 10), 1), 100);
      const result = await adminService.listListings({
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        minPurity: req.query.minPurity ? Number(req.query.minPurity) : undefined,
        limit,
        offset: (page - 1) * limit,
      });
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async setOrganizationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const validation = validateOrganizationStatusChange(req.body);
      if (!validation.valid || !validation.status) {
        res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: validation.error } });
        return;
      }

      const updated = await adminService.setOrganizationStatus(
        id,
        validation.status,
        req.user!.userId,
        validation.reason
      );
      res.json({ success: true, data: updated, message: `Organization status set to ${validation.status}.` });
    } catch (err) {
      next(err);
    }
  }

  public async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.listUsers({ role, status, search, limit, offset });
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async getUserDetail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const detail = await adminService.getUserDetail(id);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  public async toggleUserActive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { isActive } = req.body || {};
      if (typeof isActive !== 'boolean') {
        res.status(400).json({ success: false, error: { code: 'INVALID_BODY', message: 'isActive must be a boolean.' } });
        return;
      }

      if (id === req.user?.userId && !isActive) {
        res.status(400).json({
          success: false,
          error: { code: 'SELF_SUSPENSION_PREVENTED', message: 'You cannot suspend your own active admin account.' },
        });
        return;
      }

      const updated = await adminService.toggleUserActive(id, isActive, req.user!.userId);
      res.json({ success: true, data: updated, message: `User active state set to ${isActive}.` });
    } catch (err) {
      next(err);
    }
  }

  public async listUserSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const sessions = await adminService.listUserSessions(id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  public async revokeUserSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const result = await adminService.revokeUserSession(sessionId, req.user!.userId);
      res.json({ success: true, data: result, message: 'Session revoked successfully.' });
    } catch (err) {
      next(err);
    }
  }

  public async getMatchDebug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const detail = await adminService.getMatchDebugDetail(id);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  public async listAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.query.actorId as string | undefined;
      const organizationId = req.query.organizationId as string | undefined;
      const entityType = req.query.entityType as string | undefined;
      const action = req.query.action as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.listAuditLogs({
        actorId,
        organizationId,
        entityType,
        action,
        search,
        limit,
        offset,
      });

      res.json({
        success: true,
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async listDisputes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const offset = (page - 1) * limit;

      const result = await adminService.listDisputes({ status, search, limit, offset });
      res.json({
        success: true,
        data: result.items,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateDisputeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status, resolutionNotes } = req.body || {};
      if (!status) {
        res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status is required.' } });
        return;
      }

      const updated = await adminService.updateDisputeStatus(id, status, req.user!.userId, resolutionNotes);
      res.json({ success: true, data: updated, message: `Dispute status set to ${status}.` });
    } catch (err) {
      next(err);
    }
  }
}
