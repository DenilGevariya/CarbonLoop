import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.use(authenticateUser);

router.get('/', (req, res, next) => controller.getNotifications(req, res, next));
router.get('/unread-count', (req, res, next) => controller.getUnreadCount(req, res, next));
router.patch('/:id/read', (req, res, next) => controller.markAsRead(req, res, next));
router.post('/mark-all-read', (req, res, next) => controller.markAllAsRead(req, res, next));

export default router;
