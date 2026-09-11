import { ListingRepository } from './listing.repository';
import { 
  ListingDTO, 
  ListingFilterParams, 
  MarketplaceStatsDTO, 
  EmitterSupplyStatsDTO, 
  CreateListingInput, 
  UpdateListingInput 
} from './listing.types';
import { VALID_STATUS_TRANSITIONS } from './listing.constants';
import { pool } from '../../config/database';

export class ListingService {
  private repo: ListingRepository;

  constructor() {
    this.repo = new ListingRepository();
  }

  /**
   * Search marketplace supply
   */
  async getMarketplaceListings(params: ListingFilterParams) {
    return this.repo.findMarketplaceListings(params);
  }

  /**
   * Get marketplace aggregate stats
   */
  async getMarketplaceStats(): Promise<MarketplaceStatsDTO> {
    return this.repo.getMarketplaceStats();
  }

  /**
   * Get single listing details with authorization check
   */
  async getListingDetails(identifier: string, userOrgId?: string): Promise<ListingDTO> {
    const listing = await this.repo.findByCodeOrId(identifier);
    if (!listing) {
      const err = new Error('Listing not found');
      (err as any).statusCode = 404;
      throw err;
    }

    // Public visibility check: if not published, only the owning organization members can inspect
    const isPublished = ['PUBLISHED', 'active', 'ACTIVE'].includes(listing.status);
    const isOwner = userOrgId && listing.organization.id === userOrgId;

    if (!isPublished && !isOwner) {
      const err = new Error('Access denied to private listing');
      (err as any).statusCode = 403;
      throw err;
    }

    return listing;
  }

  /**
   * Emitter supply management listings
   */
  async getOrgSupplyListings(organizationId: string, params: ListingFilterParams) {
    return this.repo.findOrgListings(organizationId, params);
  }

  /**
   * Emitter supply management aggregate statistics
   */
  async getOrgSupplyStats(organizationId: string): Promise<EmitterSupplyStatsDTO> {
    return this.repo.getOrgSupplyStats(organizationId);
  }

  /**
   * Create a new CO2 listing with facility ownership validation
   */
  async createListing(userOrgId: string, userId: string, input: CreateListingInput): Promise<ListingDTO> {
    // 1. Verify facility belongs to user's organization
    const facRes = await pool.query('SELECT organization_id FROM facilities WHERE id = $1', [input.facilityId]);
    if (facRes.rows.length === 0) {
      const err = new Error('Selected facility does not exist');
      (err as any).statusCode = 400;
      throw err;
    }
    if (facRes.rows[0].organization_id !== userOrgId) {
      const err = new Error('Facility does not belong to your organization');
      (err as any).statusCode = 403;
      throw err;
    }

    // 2. Delegate creation
    return this.repo.createListing(userOrgId, userId, input);
  }

  /**
   * Update listing details with ownership validation
   */
  async updateListing(listingId: string, userOrgId: string, input: UpdateListingInput): Promise<ListingDTO> {
    const existing = await this.repo.findByCodeOrId(listingId);
    if (!existing) {
      const err = new Error('Listing not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (existing.organization.id !== userOrgId) {
      const err = new Error('You are not authorized to edit this listing');
      (err as any).statusCode = 403;
      throw err;
    }

    // If published, check if trying to edit sensitive commercial fields
    const isPublished = ['PUBLISHED', 'active', 'ACTIVE'].includes(existing.status);
    if (isPublished) {
      // E.g. publishing allows price/quantity adjustments cleanly
    }

    return this.repo.updateListing(existing.id, input);
  }

  /**
   * Transition listing status with business rules and state machine verification
   */
  async transitionStatus(
    listingId: string, 
    targetStatus: string, 
    userOrgId: string, 
    userId: string, 
    reason?: string
  ): Promise<ListingDTO> {
    const existing = await this.repo.findByCodeOrId(listingId);
    if (!existing) {
      const err = new Error('Listing not found');
      (err as any).statusCode = 404;
      throw err;
    }

    if (existing.organization.id !== userOrgId) {
      const err = new Error('You are not authorized to update status for this listing');
      (err as any).statusCode = 403;
      throw err;
    }

    const currentStatus = existing.status.toUpperCase();
    const desiredStatus = targetStatus.toUpperCase();

    if (currentStatus === desiredStatus) {
      return existing; // Idempotent
    }

    // Validate state machine transitions
    const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(desiredStatus as any)) {
      const err = new Error(`Cannot transition listing from status ${currentStatus} to ${desiredStatus}`);
      (err as any).statusCode = 400;
      throw err;
    }

    return this.repo.updateStatus(existing.id, currentStatus, desiredStatus, userId, reason);
  }
}
