import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticateUser, requireOrgMember } from '../../middleware/auth.middleware';

const router = Router();
const controller = new OrganizationController();

router.get('/me', authenticateUser, controller.getOrganization);
router.get('/my-facilities', authenticateUser, controller.getFacilities);
router.get('/:id', authenticateUser, requireOrgMember, controller.getOrganization);
router.put('/:id', authenticateUser, requireOrgMember, controller.updateOrganization);

export default router;
