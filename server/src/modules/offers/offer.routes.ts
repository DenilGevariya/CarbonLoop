import { Router } from 'express';
import { OfferController } from './offer.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new OfferController();

router.use(authenticateUser);

router.post('/', (req, res, next) => controller.createOffer(req, res, next));
router.get('/', (req, res, next) => controller.listOffers(req, res, next));
router.get('/:id', (req, res, next) => controller.getOffer(req, res, next));
router.post('/:id/counter', (req, res, next) => controller.counterOffer(req, res, next));
router.post('/:id/accept', (req, res, next) => controller.acceptOffer(req, res, next));
router.post('/:id/reject', (req, res, next) => controller.rejectOffer(req, res, next));
router.post('/:id/withdraw', (req, res, next) => controller.withdrawOffer(req, res, next));

export default router;
