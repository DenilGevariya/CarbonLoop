import { Router } from 'express';
import { VerificationController } from './verification.controller';
import { authenticateUser, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new VerificationController();

// Require logged in user for all verification endpoints
router.use(authenticateUser);

router.post('/requests', controller.submitRequest);
router.get('/requests', requireRole('platform_admin', 'admin', 'regulator', 'policy_regulator', 'verifier'), controller.listQueue);
router.get('/requests/:id', requireRole('platform_admin', 'admin', 'regulator', 'policy_regulator', 'verifier'), controller.getById);

// Admin / Reviewer Endpoints
router.post('/requests/:id/review', requireRole('platform_admin', 'admin', 'regulator', 'policy_regulator', 'verifier'), controller.processReview);

export default router;
