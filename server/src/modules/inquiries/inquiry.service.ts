import { InquiryRepository } from './inquiry.repository';
import { CreateInquiryDTO, Inquiry, InquiryDetail, InquiryMessage, InquiryStatus } from './inquiry.types';
import { query } from '../../config/database';
import { NotificationService } from '../notifications/notification.service';

const notificationService = new NotificationService();

export class InquiryService {
  private repo = new InquiryRepository();

  async createInquiry(buyerOrgId: string, userId: string, dto: CreateInquiryDTO): Promise<Inquiry> {
    // 1. Fetch listing details & validate
    const listingRes = await query(
      `SELECT id, organization_id, status, COALESCE(remaining_quantity, available_quantity_tons, 0) as remaining_quantity, title
       FROM co2_listings WHERE id = $1`,
      [dto.listing_id]
    );

    if (listingRes.rows.length === 0) {
      const err: any = new Error('Listing not found.');
      err.statusCode = 404;
      throw err;
    }

    const listing = listingRes.rows[0];
    const listingStatus = (listing.status || '').toUpperCase();
    if (listingStatus !== 'PUBLISHED' && listingStatus !== 'ACTIVE') {
      const err: any = new Error(`Listing is not available for transactions (Status: ${listing.status}).`);
      err.statusCode = 400;
      throw err;
    }

    const remainingQty = parseFloat(listing.remaining_quantity || '0');
    if (dto.requested_quantity > remainingQty) {
      const err: any = new Error(`Requested quantity (${dto.requested_quantity} t) exceeds available listing quantity (${remainingQty} t).`);
      err.statusCode = 400;
      throw err;
    }

    const sellerOrgId = listing.organization_id;
    if (sellerOrgId === buyerOrgId) {
      const err: any = new Error('Buyer organization cannot create an inquiry on its own listing.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Validate requirement ownership if provided
    if (dto.requirement_id) {
      const reqRes = await query(
        `SELECT id, organization_id, status FROM buyer_requirements WHERE id = $1`,
        [dto.requirement_id]
      );
      if (reqRes.rows.length === 0) {
        const err: any = new Error('Buyer requirement not found.');
        err.statusCode = 404;
        throw err;
      }
      if (reqRes.rows[0].organization_id !== buyerOrgId) {
        const err: any = new Error('Requirement does not belong to buyer organization.');
        err.statusCode = 403;
        throw err;
      }
    }

    // 3. Create inquiry
    const inquiry = await this.repo.createInquiry(buyerOrgId, sellerOrgId, userId, dto);

    // 4. Send notification to seller organization
    await notificationService.notifyOrganization(
      sellerOrgId,
      'New CO₂ Supply Inquiry',
      `A buyer requested ${dto.requested_quantity} tonnes for listing "${listing.title}".`,
      'INQUIRY_CREATED',
      'inquiry',
      inquiry.id,
      `/dashboard/inquiries/${inquiry.id}`
    );

    return inquiry;
  }

  async getInquiryDetail(id: string, userOrgId: string, isPlatformAdmin = false): Promise<InquiryDetail> {
    const detail = await this.repo.getInquiryById(id);
    if (!detail) {
      const err: any = new Error('Inquiry not found.');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant =
      detail.buyer_organization_id === userOrgId ||
      detail.seller_organization_id === userOrgId ||
      isPlatformAdmin;

    if (!isParticipant) {
      const err: any = new Error('You do not have authorization to view this inquiry.');
      err.statusCode = 403;
      throw err;
    }

    return detail;
  }

  async listInquiries(orgId: string, role: 'received' | 'sent' | 'all' = 'all', status?: string, page = 1, limit = 20) {
    return this.repo.listInquiries(orgId, role, status, page, limit);
  }

  async addMessage(inquiryId: string, userId: string, userOrgId: string, message: string): Promise<InquiryMessage> {
    const detail = await this.repo.getInquiryById(inquiryId);
    if (!detail) {
      const err: any = new Error('Inquiry not found.');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant = detail.buyer_organization_id === userOrgId || detail.seller_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('You are not authorized to post messages to this inquiry.');
      err.statusCode = 403;
      throw err;
    }

    const msg = await this.repo.addMessage(inquiryId, userId, userOrgId, message);

    // Notify recipient org
    const recipientOrgId = detail.buyer_organization_id === userOrgId ? detail.seller_organization_id : detail.buyer_organization_id;
    await notificationService.notifyOrganization(
      recipientOrgId,
      'New Inquiry Message',
      `New commercial message regarding inquiry for "${detail.listing?.title || 'CO₂ Supply'}".`,
      'INQUIRY_MESSAGE',
      'inquiry',
      inquiryId,
      `/dashboard/inquiries/${inquiryId}`
    );

    return msg;
  }

  async closeInquiry(inquiryId: string, userOrgId: string): Promise<void> {
    const detail = await this.repo.getInquiryById(inquiryId);
    if (!detail) {
      const err: any = new Error('Inquiry not found.');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant = detail.buyer_organization_id === userOrgId || detail.seller_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('You are not authorized to close this inquiry.');
      err.statusCode = 403;
      throw err;
    }

    await this.repo.updateStatus(inquiryId, 'CLOSED');
  }
}
