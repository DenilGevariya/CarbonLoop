import { Router } from 'express';
import { LogisticsController } from './logistics.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new LogisticsController();

router.use(authenticateUser);

router.get('/providers', (req, res, next) => controller.getProviders(req, res, next));
router.get('/stats', (req, res, next) => controller.getDashboardStats(req, res, next));
router.get('/requests', (req, res, next) => controller.getAvailableRequests(req, res, next));
router.post('/requests/:id/accept', (req, res, next) => controller.acceptRequest(req, res, next));
router.post('/requests/:id/reject', (req, res, next) => controller.rejectRequest(req, res, next));
router.post('/requests/:id/counter-bid', (req, res, next) => controller.counterBidRequest(req, res, next));
router.post('/quotes', (req, res, next) => controller.createQuote(req, res, next));
router.get('/quotes', (req, res, next) => controller.listQuotes(req, res, next));
router.get('/quotes/:id', (req, res, next) => controller.getQuote(req, res, next));
router.post('/quotes/:id/accept', (req, res, next) => controller.acceptQuote(req, res, next));
router.post('/quotes/:id/reject', (req, res, next) => controller.rejectQuote(req, res, next));
router.post('/quotes/:id/withdraw', (req, res, next) => controller.withdrawQuote(req, res, next));

export default router;

