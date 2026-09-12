import { query, pool } from '../../config/database';
import { Inquiry, InquiryDetail, InquiryMessage, CreateInquiryDTO, InquiryStatus } from './inquiry.types';

export class InquiryRepository {
  async createInquiry(
    buyerOrgId: string,
    sellerOrgId: string,
    userId: string,
    dto: CreateInquiryDTO
  ): Promise<Inquiry> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inquiryRes = await client.query<Inquiry>(
        `INSERT INTO inquiries (
          listing_id, requirement_id, buyer_organization_id, seller_organization_id,
          initiated_by, requested_quantity, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN')
        RETURNING *`,
        [
          dto.listing_id,
          dto.requirement_id || null,
          buyerOrgId,
          sellerOrgId,
          userId,
          dto.requested_quantity,
          dto.message,
        ]
      );

      const inquiry = inquiryRes.rows[0];

      // Initial inquiry message thread entry
      await client.query(
        `INSERT INTO inquiry_messages (inquiry_id, sender_user_id, sender_organization_id, message)
         VALUES ($1, $2, $3, $4)`,
        [inquiry.id, userId, buyerOrgId, dto.message]
      );

      // Record audit log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, 'inquiry_created', 'inquiries', $3, $4)`,
        [userId, buyerOrgId, inquiry.id, JSON.stringify({ requested_quantity: dto.requested_quantity, listing_id: dto.listing_id })]
      );

      await client.query('COMMIT');
      return inquiry;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getInquiryById(id: string): Promise<InquiryDetail | null> {
    const inquiryRes = await query<InquiryDetail>(
      `SELECT 
        i.*,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title,
        l.purity_percentage as listing_purity,
        l.price_per_ton as listing_price,
        COALESCE(l.remaining_quantity, l.available_quantity_tons, 0) as listing_remaining,
        l.currency as listing_currency,
        f.name as facility_name,
        f.city as facility_city,
        f.state as facility_state,
        r.title as requirement_title,
        r.required_quantity_tons as requirement_quantity,
        r.required_purity_percentage as requirement_purity,
        r.target_price_per_ton as requirement_price,
        r.location_city as requirement_city,
        r.location_state as requirement_state,
        m.overall_score as match_score
       FROM inquiries i
       JOIN organizations b_org ON i.buyer_organization_id = b_org.id
       JOIN organizations s_org ON i.seller_organization_id = s_org.id
       JOIN co2_listings l ON i.listing_id = l.id
       LEFT JOIN facilities f ON l.facility_id = f.id
       LEFT JOIN buyer_requirements r ON i.requirement_id = r.id
       LEFT JOIN matches m ON (m.listing_id = i.listing_id AND (i.requirement_id IS NULL OR m.requirement_id = i.requirement_id))
       WHERE i.id = $1`,
      [id]
    );

    if (inquiryRes.rows.length === 0) return null;

    const row = inquiryRes.rows[0] as any;

    // Fetch messages
    const messagesRes = await query<InquiryMessage>(
      `SELECT 
        im.*,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) as sender_user_name,
        o.name as sender_organization_name
       FROM inquiry_messages im
       JOIN users u ON im.sender_user_id = u.id
       JOIN organizations o ON im.sender_organization_id = o.id
       WHERE im.inquiry_id = $1
       ORDER BY im.created_at ASC`,
      [id]
    );

    // Fetch latest offer
    const offerRes = await query(
      `SELECT * FROM offers 
       WHERE inquiry_id = $1 
       ORDER BY version DESC, created_at DESC 
       LIMIT 1`,
      [id]
    );

    return {
      id: row.id,
      listing_id: row.listing_id,
      requirement_id: row.requirement_id,
      buyer_organization_id: row.buyer_organization_id,
      seller_organization_id: row.seller_organization_id,
      initiated_by: row.initiated_by,
      requested_quantity: parseFloat(row.requested_quantity),
      message: row.message,
      status: row.status.toUpperCase() as InquiryStatus,
      created_at: row.created_at,
      updated_at: row.updated_at,
      listing: {
        id: row.listing_id,
        title: row.listing_title,
        purity_percentage: parseFloat(row.listing_purity || '0'),
        price_per_ton: parseFloat(row.listing_price || '0'),
        remaining_quantity: parseFloat(row.listing_remaining || '0'),
        facility_name: row.facility_name,
        city: row.facility_city,
        state: row.facility_state,
        currency: row.listing_currency || 'INR',
        organization_name: row.seller_organization_name,
      },
      requirement: row.requirement_id
        ? {
            id: row.requirement_id,
            title: row.requirement_title,
            required_quantity: parseFloat(row.requirement_quantity || '0'),
            required_purity_percentage: parseFloat(row.requirement_purity || '0'),
            target_price_per_ton: row.requirement_price ? parseFloat(row.requirement_price) : undefined,
            location_city: row.requirement_city,
            location_state: row.requirement_state,
            organization_name: row.buyer_organization_name,
          }
        : undefined,
      match_score: row.match_score ? parseFloat(row.match_score) : null,
      buyer_organization: { id: row.buyer_organization_id, name: row.buyer_organization_name },
      seller_organization: { id: row.seller_organization_id, name: row.seller_organization_name },
      messages: messagesRes.rows.map((m: any) => ({
        ...m,
        message: m.message,
      })),
      current_offer: offerRes.rows[0] || null,
    };
  }

  async listInquiries(
    orgId: string,
    role: 'received' | 'sent' | 'all' = 'all',
    status?: string,
    page = 1,
    limit = 20
  ) {
    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (role === 'sent') {
      whereConditions.push(`i.buyer_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else if (role === 'received') {
      whereConditions.push(`i.seller_organization_id = $${paramIndex++}`);
      params.push(orgId);
    } else {
      whereConditions.push(`(i.buyer_organization_id = $${paramIndex} OR i.seller_organization_id = $${paramIndex})`);
      params.push(orgId);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`LOWER(i.status) = LOWER($${paramIndex++})`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM inquiries i ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const itemsRes = await query(
      `SELECT 
        i.*,
        b_org.name as buyer_organization_name,
        s_org.name as seller_organization_name,
        l.title as listing_title,
        l.purity_percentage as listing_purity,
        r.title as requirement_title,
        (SELECT COUNT(*) FROM inquiry_messages WHERE inquiry_id = i.id) as message_count
       FROM inquiries i
       JOIN organizations b_org ON i.buyer_organization_id = b_org.id
       JOIN organizations s_org ON i.seller_organization_id = s_org.id
       JOIN co2_listings l ON i.listing_id = l.id
       LEFT JOIN buyer_requirements r ON i.requirement_id = r.id
       ${whereClause}
       ORDER BY i.updated_at DESC
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

  async addMessage(inquiryId: string, senderUserId: string, senderOrgId: string, message: string): Promise<InquiryMessage> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const msgRes = await client.query<InquiryMessage>(
        `INSERT INTO inquiry_messages (inquiry_id, sender_user_id, sender_organization_id, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [inquiryId, senderUserId, senderOrgId, message]
      );

      // Check current inquiry status; if OPEN and sender is seller, move to RESPONDED
      const inquiryRes = await client.query(`SELECT status, seller_organization_id FROM inquiries WHERE id = $1`, [inquiryId]);
      if (inquiryRes.rows.length > 0) {
        const currentStatus = (inquiryRes.rows[0].status || '').toUpperCase();
        const sellerOrgId = inquiryRes.rows[0].seller_organization_id;

        if (currentStatus === 'OPEN' && senderOrgId === sellerOrgId) {
          await client.query(`UPDATE inquiries SET status = 'RESPONDED', updated_at = NOW() WHERE id = $1`, [inquiryId]);
        } else {
          await client.query(`UPDATE inquiries SET updated_at = NOW() WHERE id = $1`, [inquiryId]);
        }
      }

      await client.query('COMMIT');
      return msgRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: string, newStatus: InquiryStatus): Promise<void> {
    await query(`UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2`, [newStatus, id]);
  }
}
