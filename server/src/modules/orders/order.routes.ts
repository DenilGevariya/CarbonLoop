import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new OrderController();

router.use(authenticateUser);

router.post('/accept', (req, res, next) => controller.acceptOffer(req, res, next));
router.get('/', (req, res, next) => controller.listOrders(req, res, next));
router.get('/:id', (req, res, next) => controller.getOrder(req, res, next));
router.post('/:id/confirm-handshake', (req, res, next) => controller.confirmHandshake(req, res, next));
router.post('/:id/update-terms', (req, res, next) => controller.updateTerms(req, res, next));
router.post('/:id/confirm-receipt', (req, res, next) => controller.confirmReceipt(req, res, next));

export default router;
