import { RequirementRepository } from './requirements.repository';
import {
  BuyerRequirement,
  RequirementFilterParams,
  CreateRequirementInput,
  UpdateRequirementInput,
  RequirementStatus,
  DemandStats,
} from './requirements.types';
import { VALID_STATUS_TRANSITIONS } from './requirements.constants';
import { query } from '../../config/database';

export class RequirementService {
  static async getPublicRequirements(filters: RequirementFilterParams) {
    // Run auto-expiration check on search
    await RequirementRepository.autoExpireExpiredRequirements();
    return RequirementRepository.findAllPublic(filters);
  }

  static async getOrganizationRequirements(orgId: string, filters: RequirementFilterParams) {
    await RequirementRepository.autoExpireExpiredRequirements();
    return RequirementRepository.findByOrganization(orgId, filters);
  }

  static async getRequirementByIdOrCode(idOrCode: string): Promise<BuyerRequirement> {
    const requirement = await RequirementRepository.findByIdOrCode(idOrCode);
    if (!requirement) {
      const err = new Error('CO₂ Buyer Requirement not found');
      (err as any).statusCode = 404;
      throw err;
    }
    return requirement;
  }

  static async createRequirement(
    orgId: string,
    userId: string,
    input: CreateRequirementInput
  ): Promise<BuyerRequirement> {
    // Verify destination facility ownership if provided
    if (input.destination_facility_id) {
      const { rows } = await query(
        `SELECT id FROM facilities WHERE id = $1 AND organization_id = $2;`,
        [input.destination_facility_id, orgId]
      );
      if (rows.length === 0) {
        const err = new Error('Destination facility does not belong to your organization');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    return RequirementRepository.create(orgId, userId, input);
  }

  static async updateRequirement(
    id: string,
    orgId: string,
    input: UpdateRequirementInput
  ): Promise<BuyerRequirement> {
    const existing = await this.getRequirementByIdOrCode(id);

    // Verify ownership
    if (existing.organization_id !== orgId) {
      const err = new Error('Forbidden: Requirement belongs to another organization');
      (err as any).statusCode = 403;
      throw err;
    }

    // Verify destination facility ownership if updating facility
    if (input.destination_facility_id) {
      const { rows } = await query(
        `SELECT id FROM facilities WHERE id = $1 AND organization_id = $2;`,
        [input.destination_facility_id, orgId]
      );
      if (rows.length === 0) {
        const err = new Error('Destination facility does not belong to your organization');
        (err as any).statusCode = 400;
        throw err;
      }
    }

    return RequirementRepository.update(id, input);
  }

  static async transitionStatus(
    id: string,
    orgId: string,
    userId: string,
    targetStatus: RequirementStatus,
    reason?: string
  ): Promise<BuyerRequirement> {
    const existing = await this.getRequirementByIdOrCode(id);

    if (existing.organization_id !== orgId) {
      const err = new Error('Forbidden: Requirement belongs to another organization');
      (err as any).statusCode = 403;
      throw err;
    }

    const currentStatus = existing.status;
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      const err = new Error(
        `Invalid status transition from ${currentStatus} to ${targetStatus}`
      );
      (err as any).statusCode = 400;
      throw err;
    }

    return RequirementRepository.updateStatus(
      id,
      targetStatus,
      currentStatus,
      userId,
      reason
    );
  }

  static async getStats(): Promise<DemandStats> {
    return RequirementRepository.getStats();
  }

  static async getUtilizationTypes() {
    return RequirementRepository.getUtilizationTypes();
  }
}
