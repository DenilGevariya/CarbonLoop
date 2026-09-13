import { Router } from 'express';
import { MatchingController } from './matching.controller';
import { authenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new MatchingController();

router.use(authenticateUser);

router.get('/', (req, res, next) => controller.listMatches(req, res, next));
router.post('/generate', (req, res, next) => controller.generateMatches(req, res, next));
router.get('/recommendations/requirements/:id', (req, res, next) => controller.getRequirementRecommendations(req, res, next));
router.get('/requirements/:id/matches', (req, res, next) => controller.getRequirementMatches(req, res, next));
router.get('/listings/:id/matches', (req, res, next) => controller.getListingMatches(req, res, next));
router.get('/:id', (req, res, next) => controller.getMatchById(req, res, next));

export default router;
