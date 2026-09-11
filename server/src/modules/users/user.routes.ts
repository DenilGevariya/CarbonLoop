import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new UserController();

router.get('/profile', authenticateUser, controller.getProfile);
router.put('/profile', authenticateUser, controller.updateProfile);

export default router;
