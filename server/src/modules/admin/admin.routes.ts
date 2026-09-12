import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateUser, requireRole } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AdminController();

// Require logged in platform admin or admin for all admin endpoints
router.use(authenticateUser);
router.use(requireRole('platform_admin', 'admin'));

router.get('/overview', (req, res, next) => controller.getOverview(req, res, next));
router.get('/health', (req, res, next) => controller.getHealth(req, res, next));
router.get('/search', (req, res, next) => controller.search(req, res, next));
router.get('/alerts', (req, res, next) => controller.getAlerts(req, res, next));
router.post('/alerts/:id/resolve', (req, res, next) => controller.resolveAlert(req, res, next));

router.get('/organizations', (req, res, next) => controller.listOrganizations(req, res, next));
router.get('/organizations/:id', (req, res, next) => controller.getOrganizationDetail(req, res, next));
router.patch('/organizations/:id/status', (req, res, next) => controller.setOrganizationStatus(req, res, next));

router.get('/users', (req, res, next) => controller.listUsers(req, res, next));
router.get('/users/:id', (req, res, next) => controller.getUserDetail(req, res, next));
router.patch('/users/:id/active', (req, res, next) => controller.toggleUserActive(req, res, next));
router.get('/users/:id/sessions', (req, res, next) => controller.listUserSessions(req, res, next));
router.delete('/sessions/:sessionId', (req, res, next) => controller.revokeUserSession(req, res, next));

router.get('/matches/:id/debug', (req, res, next) => controller.getMatchDebug(req, res, next));
router.get('/audit-logs', (req, res, next) => controller.listAuditLogs(req, res, next));

export default router;
