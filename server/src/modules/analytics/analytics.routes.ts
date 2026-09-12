import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AnalyticsController();

// Public Impact Endpoint (Non-sensitive aggregates)
router.get('/public', controller.getPublicImpact);

// Protected Analytics Endpoints
router.use(authenticateUser);

router.get('/overview', controller.getOverview);
router.get('/funnel', controller.getFunnel);
router.get('/supply', controller.getSupply);
router.get('/demand', controller.getDemand);
router.get('/matching', controller.getMatching);
router.get('/logistics', controller.getLogistics);
router.get('/regions', controller.getRegions);
router.get('/observations', controller.getObservations);
router.get('/impact', controller.getImpactReport);
router.get('/price-by-purity', controller.getPriceByPurity);
router.get('/top-price-points', controller.getTopPricePoints);

export default router;
