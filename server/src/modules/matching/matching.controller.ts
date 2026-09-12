import { Request, Response, NextFunction } from 'express';
import { MatchingService } from './matching.service';

const service = new MatchingService();

export class MatchingController {
  /**
   * POST /api/v1/matches/generate
   */
  async generateMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { requirementId, listingId, limit } = req.body;

      if (requirementId) {
        const result = await service.generateMatchesForRequirement(
          String(requirementId),
          limit ? parseInt(String(limit), 10) : 20
        );
        return res.json({
          success: true,
          data: result,
        });
      }

      if (listingId) {
        const result = await service.generateMatchesForListing(
          String(listingId),
          limit ? parseInt(String(limit), 10) : 20
        );
        return res.json({
          success: true,
          data: result,
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Either requirementId or listingId must be provided in request body.',
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/matches/:id
   */
  async getMatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const match = await service.getMatchById(id);
      res.json({
        success: true,
        data: match,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/requirements/:id/matches
   */
  async getRequirementMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : 0;
      const matches = await service.getRequirementMatches(id, minScore);
      res.json({
        success: true,
        count: matches.length,
        data: matches,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/listings/:id/matches
   */
  async getListingMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const minScore = req.query.minScore ? parseFloat(req.query.minScore as string) : 0;
      const matches = await service.getListingMatches(id, minScore);
      res.json({
        success: true,
        count: matches.length,
        data: matches,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/recommendations/requirements/:id
   */
  async getRequirementRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await service.generateMatchesForRequirement(id, 10);
      res.json({
        success: true,
        message: 'Top CarbonLoop supply recommendations generated successfully.',
        data: result.generatedMatches,
      });
    } catch (err) {
      next(err);
    }
  }
}
