import { OfferRepository } from './offer.repository';
import { CreateOfferDTO, CounterOfferDTO, Offer, OfferDetail, OfferStatus } from './offer.types';
import { query } from '../../config/database';
import { NotificationService } from '../notifications/notification.service';

const notificationService = new NotificationService();

export class OfferService {
  private repo = new OfferRepository();

  async createOffer(userOrgId: string, userId: string, dto: CreateOfferDTO): Promise<Offer> {
    // 1. Fetch inquiry details
    const inqRes = await query(
      `SELECT i.*, l.COALESCE_rem as listing_remaining, l.title as listing_title
       FROM inquiries i
       JOIN (
         SELECT id, title, COALESCE(remaining_quantity, available_quantity_tons, 0) as COALESCE_rem
         FROM co2_listings
       ) l ON i.listing_id = l.id
       WHERE i.id = $1`,
      [dto.inquiry_id]
    );

    if (inqRes.rows.length === 0) {
      const err: any = new Error('Inquiry not found.');
      err.statusCode = 404;
      throw err;
    }

    const inquiry = inqRes.rows[0];
    const isParticipant = inquiry.buyer_organization_id === userOrgId || inquiry.seller_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('You are not authorized to issue an offer for this inquiry.');
      err.statusCode = 403;
      throw err;
    }

    const remainingQty = parseFloat(inquiry.listing_remaining || '0');
    if (dto.quantity > remainingQty) {
      const err: any = new Error(`Offered quantity (${dto.quantity} t) exceeds available listing quantity (${remainingQty} t).`);
      err.statusCode = 400;
      throw err;
    }

    // Validate validity date is in future
    if (new Date(dto.valid_until).getTime() <= Date.now()) {
      const err: any = new Error('Offer validity date must be in the future.');
      err.statusCode = 400;
      throw err;
    }

    // Server-side financial total calculation
    const subtotal = dto.unit_price * dto.quantity;
    const deliveryCost = dto.delivery_cost || 0;
    const totalEstimatedCost = subtotal + deliveryCost;

    const offerNumber = await this.repo.generateOfferNumber();

    const offer = await this.repo.createOffer(
      offerNumber,
      userOrgId,
      inquiry.buyer_organization_id,
      inquiry.seller_organization_id,
      inquiry.listing_id,
      dto,
      totalEstimatedCost,
      userId
    );

    // Notify counterparty
    const recipientOrgId = inquiry.buyer_organization_id === userOrgId ? inquiry.seller_organization_id : inquiry.buyer_organization_id;
    await notificationService.notifyOrganization(
      recipientOrgId,
      `Commercial Offer Received (${offerNumber})`,
      `An offer of ₹${dto.unit_price}/t for ${dto.quantity} tonnes was received.`,
      'OFFER_RECEIVED',
      'offer',
      offer.id,
      `/dashboard/offers/${offer.id}`
    );

    return offer;
  }

  async counterOffer(parentOfferId: string, userOrgId: string, userId: string, dto: CounterOfferDTO): Promise<Offer> {
    const parentOffer = await this.repo.getOfferById(parentOfferId);
    if (!parentOffer) {
      const err: any = new Error('Parent offer not found.');
      err.statusCode = 404;
      throw err;
    }

    const parentStatus = (parentOffer.status || '').toUpperCase();
    if (parentStatus !== 'SENT' && parentStatus !== 'PENDING') {
      const err: any = new Error(`Cannot counter an offer with status ${parentOffer.status}.`);
      err.statusCode = 400;
      throw err;
    }

    if (new Date(parentOffer.valid_until).getTime() <= Date.now()) {
      const err: any = new Error('Parent offer has expired and cannot be countered.');
      err.statusCode = 400;
      throw err;
    }

    const isParticipant = parentOffer.buyer_organization_id === userOrgId || parentOffer.seller_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('You are not authorized to counter this offer.');
      err.statusCode = 403;
      throw err;
    }

    if (parentOffer.offered_by_organization_id === userOrgId) {
      const err: any = new Error('You cannot counter your own offer. Submit an offer revision instead.');
      err.statusCode = 400;
      throw err;
    }

    // Check validity date
    if (new Date(dto.valid_until).getTime() <= Date.now()) {
      const err: any = new Error('Counter offer validity date must be in the future.');
      err.statusCode = 400;
      throw err;
    }

    const quantity = dto.quantity || parseFloat(((parentOffer as any).quantity || (parentOffer as any).offered_quantity_tons || '0').toString());
    const unitPrice = dto.unit_price;
    const parentDeliveryCost = parseFloat((parentOffer.delivery_cost || '0').toString());
    const deliveryCost = dto.delivery_cost !== undefined ? dto.delivery_cost : parentDeliveryCost;

    const subtotal = unitPrice * quantity;
    const totalEstimatedCost = subtotal + deliveryCost;

    const offerNumber = await this.repo.generateOfferNumber();

    const createDto: CreateOfferDTO = {
      inquiry_id: parentOffer.inquiry_id,
      quantity,
      quantity_unit: parentOffer.quantity_unit,
      unit_price: unitPrice,
      currency: parentOffer.currency,
      delivery_cost: deliveryCost,
      valid_until: dto.valid_until,
      message: dto.message,
    };

    const offer = await this.repo.createOffer(
      offerNumber,
      userOrgId,
      parentOffer.buyer_organization_id,
      parentOffer.seller_organization_id,
      parentOffer.listing_id,
      createDto,
      totalEstimatedCost,
      userId,
      parentOffer.id,
      parentOffer.version + 1
    );

    // Notify original offer author
    await notificationService.notifyOrganization(
      parentOffer.offered_by_organization_id,
      `Counter Offer Received (${offerNumber})`,
      `Counter proposal received: ₹${unitPrice}/t for ${quantity} tonnes.`,
      'COUNTER_OFFER_RECEIVED',
      'offer',
      offer.id,
      `/dashboard/offers/${offer.id}`
    );

    return offer;
  }

  async getOfferDetail(id: string, userOrgId: string, isPlatformAdmin = false): Promise<OfferDetail> {
    const detail = await this.repo.getOfferById(id);
    if (!detail) {
      const err: any = new Error('Offer not found.');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant =
      detail.buyer_organization_id === userOrgId ||
      detail.seller_organization_id === userOrgId ||
      isPlatformAdmin;

    if (!isParticipant) {
      const err: any = new Error('You are not authorized to view this offer.');
      err.statusCode = 403;
      throw err;
    }

    return detail;
  }

  async listOffers(orgId: string, role: 'received' | 'sent' | 'all' = 'all', inquiryId?: string, status?: string, page = 1, limit = 20) {
    return this.repo.listOffers(orgId, role, inquiryId, status, page, limit);
  }

  async rejectOffer(id: string, userOrgId: string, userId: string, reason?: string): Promise<void> {
    const offer = await this.repo.getOfferById(id);
    if (!offer) {
      const err: any = new Error('Offer not found.');
      err.statusCode = 404;
      throw err;
    }

    if (offer.offered_by_organization_id === userOrgId) {
      const err: any = new Error('You cannot reject your own offer. Use withdraw instead.');
      err.statusCode = 400;
      throw err;
    }

    const isParticipant = offer.buyer_organization_id === userOrgId || offer.seller_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('You are not authorized to reject this offer.');
      err.statusCode = 403;
      throw err;
    }

    const currentStatus = (offer.status || '').toUpperCase();
    if (currentStatus !== 'SENT' && currentStatus !== 'PENDING') {
      const err: any = new Error(`Cannot reject offer with status ${offer.status}.`);
      err.statusCode = 400;
      throw err;
    }

    await this.repo.updateStatus(id, 'REJECTED', userId, reason);

    // Notify author
    await notificationService.notifyOrganization(
      offer.offered_by_organization_id,
      `Offer Declined (${offer.offer_number})`,
      `Your commercial offer ${offer.offer_number} was rejected by counterparty.`,
      'OFFER_REJECTED',
      'offer',
      id,
      `/dashboard/offers/${id}`
    );
  }

  async withdrawOffer(id: string, userOrgId: string, userId: string, reason?: string): Promise<void> {
    const offer = await this.repo.getOfferById(id);
    if (!offer) {
      const err: any = new Error('Offer not found.');
      err.statusCode = 404;
      throw err;
    }

    if (offer.offered_by_organization_id !== userOrgId) {
      const err: any = new Error('Only the issuing organization can withdraw an offer.');
      err.statusCode = 403;
      throw err;
    }

    const currentStatus = (offer.status || '').toUpperCase();
    if (currentStatus !== 'SENT' && currentStatus !== 'PENDING') {
      const err: any = new Error(`Cannot withdraw offer with status ${offer.status}.`);
      err.statusCode = 400;
      throw err;
    }

    await this.repo.updateStatus(id, 'WITHDRAWN', userId, reason);

    const recipientOrgId = offer.buyer_organization_id === userOrgId ? offer.seller_organization_id : offer.buyer_organization_id;
    await notificationService.notifyOrganization(
      recipientOrgId,
      `Offer Withdrawn (${offer.offer_number})`,
      `Commercial offer ${offer.offer_number} was withdrawn by sender.`,
      'OFFER_WITHDRAWN',
      'offer',
      id,
      `/dashboard/offers/${id}`
    );
  }
}
