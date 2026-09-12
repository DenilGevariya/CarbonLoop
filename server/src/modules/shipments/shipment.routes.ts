import { Router } from 'express';
import { ShipmentController } from './shipment.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ShipmentController();

router.use(authenticateUser);

router.get('/', (req, res, next) => controller.listShipments(req, res, next));
router.get('/:id', (req, res, next) => controller.getShipment(req, res, next));

router.post('/:id/schedule', (req, res, next) => controller.scheduleShipment(req, res, next));
router.post('/:id/pickup', (req, res, next) => controller.pickupShipment(req, res, next));
router.post('/:id/depart', (req, res, next) => controller.departShipment(req, res, next));
router.post('/:id/arrive', (req, res, next) => controller.arriveShipment(req, res, next));
router.post('/:id/deliver', (req, res, next) => controller.deliverShipment(req, res, next));
router.post('/:id/confirm-receipt', (req, res, next) => controller.confirmReceipt(req, res, next));
router.post('/:id/report-exception', (req, res, next) => controller.reportException(req, res, next));
router.post('/:id/events', (req, res, next) => controller.addTrackingEvent(req, res, next));

export default router;
