import { Router } from 'express';
import { RequirementController } from './requirements.controller';
import { authenticateUser, optionalAuthenticateUser } from '../../middleware/auth.middleware';

const router = Router();

// Public Demand Marketplace routes
router.get('/', RequirementController.getPublicRequirements);
router.get('/stats', RequirementController.getStats);
router.get('/utilization-types', RequirementController.getUtilizationTypes);

// Protected Org Demand routes
router.get('/my-requirements', authenticateUser, RequirementController.getMyRequirements);

// Requirement detail (optional auth so owner org can inspect drafts)
router.get('/:id', optionalAuthenticateUser, RequirementController.getRequirementById);

// Create / Update
router.post('/', authenticateUser, RequirementController.createRequirement);
router.patch('/:id', authenticateUser, RequirementController.updateRequirement);

// Status lifecycle transitions
router.post('/:id/publish', authenticateUser, RequirementController.publishRequirement);
router.post('/:id/pause', authenticateUser, RequirementController.pauseRequirement);
router.post('/:id/resume', authenticateUser, RequirementController.resumeRequirement);
router.post('/:id/archive', authenticateUser, RequirementController.archiveRequirement);
router.post('/:id/mark-fulfilled', authenticateUser, RequirementController.markFulfilled);

export default router;
