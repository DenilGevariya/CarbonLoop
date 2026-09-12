import { Response, NextFunction } from 'express';
import { InquiryService } from './inquiry.service';
import { createInquirySchema, inquiryMessageSchema, inquiryFilterSchema } from './inquiry.validation';
import { AuthenticatedRequest } from '../auth/auth.types';
import { pool } from '../../config/database';

const inquiryService = new InquiryService();

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

export class InquiryController {
  async createInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const dto = createInquirySchema.parse(req.body);
      const inquiry = await inquiryService.createInquiry(userOrgId, req.user!.userId, dto);

      res.status(201).json({
        success: true,
        data: inquiry,
      });
    } catch (err) {
      next(err);
    }
  }

  async getInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await inquiryService.getInquiryDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail });
    } catch (err) {
      next(err);
    }
  }

  async listInquiries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User does not belong to an active organization.' } });
        return;
      }

      const queryParams = inquiryFilterSchema.parse(req.query);
      const result = await inquiryService.listInquiries(
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

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      const isPlatformAdmin = (req.user?.roles || []).some((r) => r.toLowerCase() === 'platform_admin' || r.toLowerCase() === 'admin');
      const id = req.params.id as string;

      const detail = await inquiryService.getInquiryDetail(id, userOrgId || '', isPlatformAdmin);
      res.json({ success: true, data: detail.messages || [] });
    } catch (err) {
      next(err);
    }
  }

  async postMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      const { message } = inquiryMessageSchema.parse(req.body);

      const newMessage = await inquiryService.addMessage(id, req.user!.userId, userOrgId, message);
      res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
      next(err);
    }
  }

  async closeInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userOrgId = await resolveUserOrgId(req);
      if (!userOrgId) {
        res.status(400).json({ success: false, error: { code: 'NO_ORG', message: 'User organization not found.' } });
        return;
      }

      const id = req.params.id as string;
      await inquiryService.closeInquiry(id, userOrgId);
      res.json({ success: true, message: 'Inquiry closed successfully.' });
    } catch (err) {
      next(err);
    }
  }
}
