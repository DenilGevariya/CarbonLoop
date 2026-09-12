import { query, pool } from '../../config/database';
import { Offer, OfferDetail, CreateOfferDTO, CounterOfferDTO, OfferStatus } from './offer.types';

export class OfferRepository {
  async generateOfferNumber(): Promise<string> {
    const res = await query<{ count: string }>('SELECT COUNT(*) as count FROM offers');
    const seq = parseInt(res.rows[0]?.count || '0', 10) + 1;
    return `CL-OFR-${seq.toString().padStart(6, '0')}`;
  }

  async createOffer(
    offerNumber: string,
    offeredByOrgId: string,
    buyerOrgId: string,
    sellerOrgId: string,
    listingId: string,
    dto: CreateOfferDTO,
    totalEstimatedCost: number,
    userId: string,
    parentOfferId?: string,
    version = 1
  ): Promise<Offer> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const offerRes = await client.query<Offer>(
        `INSERT INTO offers (
          inquiry_id, offer_number, parent_offer_id, version,
          offered_by_organization_id, buyer_organization_id, seller_organization_id, listing_id,
          quantity, quantity_unit, unit_price, currency, delivery_cost, total_estimated_cost,
          offered_quantity_tons, offered_price_per_ton, total_amount,
          valid_until, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $9, $11, $14, $15, $16, 'SENT')
        RETURNING *`,
        [
          dto.inquiry_id,
          offerNumber,
          parentOfferId || null,
          version,
          offeredByOrgId,
          buyerOrgId,
          sellerOrgId,
          listingId,
          dto.quantity,
          dto.quantity_unit || 'tonne',
          dto.unit_price,
          dto.currency || 'INR',
          dto.delivery_cost || 0,
          totalEstimatedCost,
          dto.valid_until,
          dto.message || null,
        ]
      );

      const offer = offerRes.rows[0];

      // Insert offer status history
      await client.query(
        `INSERT INTO offer_status_history (offer_id, from_status, to_status, changed_by, reason)
         VALUES ($1, NULL, 'SENT', $2, $3)`,
        [offer.id, userId, dto.message || 'Commercial offer issued']
      );

      // Update parent offer status if this is a counter offer
      if (parentOfferId) {
        await client.query(
          `UPDATE offers SET status = 'COUNTERED', updated_at = NOW() WHERE id = $1`,
          [parentOfferId]
        );
        await client.query(
          `INSERT INTO offer_status_history (offer_id, from_status, to_status, changed_by, reason)
           VALUES ($1, 'SENT', 'COUNTERED', $2, 'Counter offer submitted')`,
          [parentOfferId, userId]
        );
      }

      // Update inquiry status to NEGOTIATING
      await client.query(
        `UPDATE inquiries SET status = 'NEGOTIATING', updated_at = NOW() WHERE id = $1`,
        [dto.inquiry_id]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, $3, 'offers', $4, $5)`,
        [userId, offeredByOrgId, parentOfferId ? 'offer_countered' : 'offer_created', offer.id, JSON.stringify({ offer_number: offerNumber, quantity: dto.quantity, unit_price: dto.unit_price })]
      );

      await client.query('COMMIT');
      return offer;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getOfferById(id: string): Promise<OfferDetail | null> {
    const res = await query<OfferDetail>(
      `SELECT 
        o.*,
        by_org.name as offered_by_organization_name,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title,
        l.purity_percentage as listing_purity,
        f.city || ', ' || f.state as listing_location
       FROM offers o
       JOIN organizations by_org ON o.offered_by_organization_id = by_org.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       LEFT JOIN facilities f ON l.facility_id = f.id
       WHERE o.id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const offer = res.rows[0];

    // Fetch version history if inquiry_id present
    let history: Offer[] = [];
    if (offer.inquiry_id) {
      const histRes = await query<Offer>(
        `SELECT * FROM offers WHERE inquiry_id = $1 ORDER BY version ASC`,
        [offer.inquiry_id]
      );
      history = histRes.rows;
    }

    return {
      ...offer,
      quantity: parseFloat(((offer as any).quantity || (offer as any).offered_quantity_tons || '0').toString()),
      unit_price: parseFloat(((offer as any).unit_price || (offer as any).offered_price_per_ton || '0').toString()),
      delivery_cost: parseFloat(((offer as any).delivery_cost || '0').toString()),
      total_estimated_cost: parseFloat(((offer as any).total_estimated_cost || (offer as any).total_amount || '0').toString()),
      status: offer.status.toUpperCase() as OfferStatus,
      version_history: history.map((h: any) => ({
        ...h,
        quantity: parseFloat((h.quantity || h.offered_quantity_tons || '0').toString()),
        unit_price: parseFloat((h.unit_price || h.offered_price_per_ton || '0').toString()),
        delivery_cost: parseFloat((h.delivery_cost || '0').toString()),
        total_estimated_cost: parseFloat((h.total_estimated_cost || h.total_amount || '0').toString()),
        status: h.status.toUpperCase() as OfferStatus,
      })),
    };
  }

  async listOffers(
    orgId: string,
    role: 'received' | 'sent' | 'all' = 'all',
    inquiryId?: string,
    status?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (role === 'sent') {
      whereConditions.push(`o.offered_by_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else if (role === 'received') {
      whereConditions.push(`(o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex}) AND o.offered_by_organization_id != $${paramIndex}`);
      params.push(orgId);
      paramIndex++;
    } else {
      whereConditions.push(`(o.buyer_organization_id = $${paramIndex} OR o.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    }

    if (inquiryId) {
      whereConditions.push(`o.inquiry_id = $${paramIndex++}`);
      params.push(inquiryId);
    }

    if (status) {
      whereConditions.push(`LOWER(o.status) = LOWER($${paramIndex++})`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM offers o ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const itemsRes = await query(
      `SELECT 
        o.*,
        by_org.name as offered_by_organization_name,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title
       FROM offers o
       JOIN organizations by_org ON o.offered_by_organization_id = by_org.id
       JOIN organizations b_org ON o.buyer_organization_id = b_org.id
       JOIN organizations s_org ON o.seller_organization_id = s_org.id
       JOIN co2_listings l ON o.listing_id = l.id
       ${whereClause}
       ORDER BY o.updated_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      items: itemsRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, newStatus: OfferStatus, userId: string, reason?: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const oldRes = await client.query<{ status: string }>(`SELECT status FROM offers WHERE id = $1`, [id]);
      const oldStatus = oldRes.rows[0]?.status || 'UNKNOWN';

      let updateSql = `UPDATE offers SET status = $1, updated_at = NOW()`;
      const updateParams: any[] = [newStatus];

      if (newStatus === 'REJECTED' && reason) {
        updateSql += `, rejection_reason = $2 WHERE id = $3`;
        updateParams.push(reason, id);
      } else if (newStatus === 'WITHDRAWN' && reason) {
        updateSql += `, withdrawal_reason = $2 WHERE id = $3`;
        updateParams.push(reason, id);
      } else {
        updateSql += ` WHERE id = $2`;
        updateParams.push(id);
      }

      await client.query(updateSql, updateParams);

      await client.query(
        `INSERT INTO offer_status_history (offer_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, oldStatus, newStatus, userId, reason || null]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
