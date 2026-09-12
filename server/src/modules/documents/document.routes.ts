import { Router } from 'express';
import { DocumentController } from './document.controller';
import { authenticateUser, optionalAuthenticateUser } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DocumentController();

// Document Upload & Management
router.post('/upload', authenticateUser, controller.uploadDocument);
router.get('/download/:storageKey', optionalAuthenticateUser, controller.downloadDocument);
router.get('/organization/:organizationId', authenticateUser, controller.listByOrganization);
router.get('/:id', authenticateUser, controller.getById);

// Listing Quality Records
router.post('/listings/:listingId/quality-records', authenticateUser, controller.createQualityRecord);
router.get('/listings/:listingId/quality-records', optionalAuthenticateUser, controller.getQualityRecords);

export default router;
