import { Router } from 'express';
import { InquiryController } from './inquiry.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new InquiryController();

router.use(authenticateUser);

router.post('/', (req, res, next) => controller.createInquiry(req, res, next));
router.get('/', (req, res, next) => controller.listInquiries(req, res, next));
router.get('/:id', (req, res, next) => controller.getInquiry(req, res, next));
router.get('/:id/messages', (req, res, next) => controller.getMessages(req, res, next));
router.post('/:id/messages', (req, res, next) => controller.postMessage(req, res, next));
router.post('/:id/close', (req, res, next) => controller.closeInquiry(req, res, next));

export default router;
