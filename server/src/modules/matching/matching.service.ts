import { MatchingRepository } from './matching.repository';
import { evaluateMatch } from './matching.engine';
import { StoredMatch, EngineMatchOutput } from './matching.types';
import { AppError } from '../../middleware/error.middleware';

export class MatchingService {
  private repo: MatchingRepository;

  constructor() {
    this.repo = new MatchingRepository();
  }

  /**
   * Generate & evaluate candidate supply listings for a buyer requirement
   */
  async generateMatchesForRequirement(
    requirementId: string,
    limit = 20
  ): Promise<{ requirementId: string; totalEvaluated: number; generatedMatches: StoredMatch[] }> {
    const requirement = await this.repo.getRequirementById(requirementId);
    if (!requirement) {
      throw new AppError(`Buyer Requirement with ID '${requirementId}' not found`, 404, 'REQUIREMENT_NOT_FOUND');
    }

    const candidateListings = await this.repo.getActiveCandidateListings(100);

    const matchOutputs: EngineMatchOutput[] = [];
    for (const listing of candidateListings) {
      const result = evaluateMatch(listing, requirement);
      if (result.eligible || result.isNearMatch) {
        matchOutputs.push(result);
      }
    }

    // Sort candidates by overall score descending
    matchOutputs.sort((a, b) => b.overallScore - a.overallScore);

    const topMatches = matchOutputs.slice(0, limit);
    const persistedIds: string[] = [];

    for (const engineMatch of topMatches) {
      const matchId = await this.repo.upsertMatch(engineMatch);
      persistedIds.push(matchId);
    }

    const storedMatches = await this.repo.getRequirementMatches(requirementId, 0);

    return {
      requirementId,
      totalEvaluated: candidateListings.length,
      generatedMatches: storedMatches,
    };
  }

  /**
   * Generate & evaluate candidate demand requirements for a supply listing
   */
  async generateMatchesForListing(
    listingId: string,
    limit = 20
  ): Promise<{ listingId: string; totalEvaluated: number; generatedMatches: StoredMatch[] }> {
    const listing = await this.repo.getListingById(listingId);
    if (!listing) {
      throw new AppError(`CO2 Listing with ID '${listingId}' not found`, 404, 'LISTING_NOT_FOUND');
    }

    const candidateRequirements = await this.repo.getActiveCandidateRequirements(100);

    const matchOutputs: EngineMatchOutput[] = [];
    for (const requirement of candidateRequirements) {
      const result = evaluateMatch(listing, requirement);
      if (result.eligible || result.isNearMatch) {
        matchOutputs.push(result);
      }
    }

    matchOutputs.sort((a, b) => b.overallScore - a.overallScore);

    const topMatches = matchOutputs.slice(0, limit);
    for (const engineMatch of topMatches) {
      await this.repo.upsertMatch(engineMatch);
    }

    const storedMatches = await this.repo.getListingMatches(listingId, 0);

    return {
      listingId,
      totalEvaluated: candidateRequirements.length,
      generatedMatches: storedMatches,
    };
  }

  /**
   * Get single match details with factor explanations
   */
  async getMatchById(matchId: string): Promise<StoredMatch> {
    const match = await this.repo.getMatchById(matchId);
    if (!match) {
      throw new AppError(`Match record with ID '${matchId}' not found`, 404, 'MATCH_NOT_FOUND');
    }
    return match;
  }

  /**
   * Get requirement matches
   */
  async getRequirementMatches(requirementId: string, minScore = 0): Promise<StoredMatch[]> {
    return this.repo.getRequirementMatches(requirementId, minScore);
  }

  /**
   * Get listing matches
   */
  async getListingMatches(listingId: string, minScore = 0): Promise<StoredMatch[]> {
    return this.repo.getListingMatches(listingId, minScore);
  }
}
