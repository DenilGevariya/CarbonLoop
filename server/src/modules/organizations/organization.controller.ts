import { Response, NextFunction } from 'express';
import { OrganizationRepository } from './organization.repository';
import { AuthenticatedRequest } from '../auth/auth.types';
import { query as dbQuery } from '../../config/database';

export class OrganizationController {
  private repo = new OrganizationRepository();

  getOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rawOrgId = req.params.id || req.headers['x-organization-id'];
      const orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : (rawOrgId as string);

      if (!orgId) {
        return res.status(400).json({ success: false, error: { code: 'ORG_ID_REQUIRED', message: 'Organization ID required.' } });
      }

      const org = await this.repo.findById(orgId);
      if (!org) {
        return res.status(404).json({ success: false, error: { code: 'ORG_NOT_FOUND', message: 'Organization not found.' } });
      }

      const members = await this.repo.findMembers(orgId);
      const facilitiesCount = await this.repo.getFacilityCount(orgId);

      res.json({
        success: true,
        data: {
          ...org,
          members,
          facilitiesCount,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  updateOrganization = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rawOrgId = req.params.id;
      const orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : (rawOrgId as string);

      const updated = await this.repo.updateOrg(orgId, req.body);

      res.json({
        success: true,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  };

  getFacilities = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const rawOrgId = req.params.id || req.headers['x-organization-id'];
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Look up user's active organization if orgId not explicitly specified
      let orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : (rawOrgId as string);
      if (!orgId) {
        const memRes = await this.repo.findMembers(userId);
        // Fallback query directly for facility lookup
        const orgRes = await this.repo.findById(userId);
      }

      const facilitiesRes = await dbQuery(
        `SELECT f.id, f.name, f.facility_code as "facilityCode", f.city, f.state, f.country, f.status
         FROM facilities f
         JOIN organization_members om ON f.organization_id = om.organization_id
         WHERE om.user_id = $1
         ORDER BY f.name ASC`,
        [userId]
      );

      res.json({
        success: true,
        data: facilitiesRes.rows,
      });
    } catch (err) {
      next(err);
    }
  };
}
