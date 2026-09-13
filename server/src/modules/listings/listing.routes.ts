import { Router } from 'express';
import { ListingController } from './listing.controller';
import { authenticateUser, optionalAuthenticateUser, forbidRegulatorCommercialActions } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ListingController();

// Public routes
router.get('/', controller.getMarketplaceListings.bind(controller));
router.get('/stats', controller.getMarketplaceStats.bind(controller));

// Protected Emitter supply routes
router.get('/my-supply', authenticateUser, controller.getOrgSupplyListings.bind(controller));

// Listing detail (optional auth so owner organization can inspect drafts/private listings)
router.get('/:identifier', optionalAuthenticateUser, controller.getListingDetails.bind(controller));

// Create / Update / Status actions (Protected + Regulator Restricted)
router.post('/', authenticateUser, forbidRegulatorCommercialActions, controller.createListing.bind(controller));
router.patch('/:id', authenticateUser, forbidRegulatorCommercialActions, controller.updateListing.bind(controller));

// Explicit status lifecycle actions
router.post('/:id/publish', authenticateUser, controller.publish.bind(controller));
router.post('/:id/pause', authenticateUser, controller.pause.bind(controller));
router.post('/:id/resume', authenticateUser, controller.resume.bind(controller));
router.post('/:id/archive', authenticateUser, controller.archive.bind(controller));
router.post('/:id/mark-exhausted', authenticateUser, controller.markExhausted.bind(controller));
router.put('/:id/verify', authenticateUser, controller.verifyListing.bind(controller));

export default router;
