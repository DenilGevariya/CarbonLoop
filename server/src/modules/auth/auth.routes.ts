import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

// Public auth endpoints
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);

// Authenticated auth endpoints
router.post('/logout', authenticateUser, controller.logout);
router.get('/me', authenticateUser, controller.me);
router.post('/change-password', authenticateUser, controller.changePassword);
router.get('/sessions', authenticateUser, controller.getSessions);
router.delete('/sessions/:id', authenticateUser, controller.revokeSession);
router.post('/onboarding', authenticateUser, controller.completeOnboarding);

export default router;
