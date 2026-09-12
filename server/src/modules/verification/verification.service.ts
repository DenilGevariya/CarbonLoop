import { VerificationRepository } from './verification.repository';
import { SubmitVerificationDTO, ProcessReviewDTO } from './verification.types';

export class VerificationService {
  private repo: VerificationRepository;

  constructor() {
    this.repo = new VerificationRepository();
  }

  public async submitRequest(userId: string, dto: SubmitVerificationDTO) {
    return this.repo.submitRequest(userId, dto);
  }

  public async getById(id: string) {
    return this.repo.getById(id);
  }

  public async getDetailById(id: string) {
    return this.repo.getDetailById(id);
  }

  public async listQueue(params: {
    status?: string;
    type?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.repo.listQueue(params);
  }

  public async processReview(requestId: string, reviewerId: string, dto: ProcessReviewDTO) {
    if (dto.action === 'START') {
      return this.repo.startReview(requestId, reviewerId);
    } else if (dto.action === 'APPROVE') {
      return this.repo.approveRequest(requestId, reviewerId, dto.notes, dto.expiryMonths || 12, dto.latestVerifiedPurity);
    } else if (dto.action === 'REJECT') {
      return this.repo.rejectRequest(requestId, reviewerId, dto.notes || 'Evidence rejected', dto.reason);
    } else if (dto.action === 'REQUEST_CHANGES') {
      return this.repo.requestChanges(requestId, reviewerId, dto.notes || 'Additional evidence required.');
    }
    throw new Error(`Unsupported review action: ${dto.action}`);
  }
}
