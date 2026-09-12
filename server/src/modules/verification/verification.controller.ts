import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.types';
import { VerificationService } from './verification.service';
import { validateSubmitVerification, validateProcessReview } from './verification.validation';
import { VERIFICATION_ERRORS } from './verification.constants';

export class VerificationController {
  private service: VerificationService;

  constructor() {
    this.service = new VerificationService();
  }

  public submitRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: VERIFICATION_ERRORS.UNAUTHORIZED });
      }

      const val = validateSubmitVerification(req.body);
      if (!val.valid || !val.data) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: val.error } });
      }

      const result = await this.service.submitRequest(userId, val.data);
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SUBMIT_ERROR', message: err.message } });
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const detail = await this.service.getDetailById(id);
      return res.json({ success: true, data: detail });
    } catch (err: any) {
      return res.status(404).json({ success: false, error: VERIFICATION_ERRORS.NOT_FOUND });
    }
  };

  public listQueue = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, type, organizationId, limit, offset } = req.query;
      const result = await this.service.listQueue({
        status: status as string,
        type: type as string,
        organizationId: organizationId as string,
        limit: limit ? parseInt(limit as string, 10) : 20,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'QUEUE_ERROR', message: err.message } });
    }
  };

  public processReview = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const reviewerId = req.user?.userId;
      if (!reviewerId) {
        return res.status(401).json({ success: false, error: VERIFICATION_ERRORS.UNAUTHORIZED });
      }

      const id = req.params.id as string;
      const val = validateProcessReview(req.body);
      if (!val.valid || !val.data) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: val.error } });
      }

      const result = await this.service.processReview(id, reviewerId, val.data);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'REVIEW_ERROR', message: err.message } });
    }
  };
}
