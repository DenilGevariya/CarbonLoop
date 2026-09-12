import { OrderRepository } from './order.repository';
import { Order, OrderDetail, CommercialSnapshot } from './order.types';
import { pool } from '../../config/database';
import { NotificationService } from '../notifications/notification.service';

const notificationService = new NotificationService();

export class OrderService {
  private repo = new OrderRepository();

  /**
   * Accepts a commercial offer and creates an industrial Purchase Order.
   * Executed within a single PostgreSQL transaction with row-level locking (SELECT FOR UPDATE)
   * on co2_listings to prevent overselling across concurrent buyers.
   */
  async acceptOffer(offerId: string, userOrgId: string, userId: string, destinationAddress?: string): Promise<Order> {
    // 1. Idempotency Check (If order already exists for this offer)
    const existingOrderRes = await pool.query<Order>(
      `SELECT * FROM orders WHERE offer_id = $1`,
      [offerId]
    );

    if (existingOrderRes.rows.length > 0) {
      return existingOrderRes.rows[0];
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 2. Lock and fetch offer row
      const offerRes = await client.query(
        `SELECT * FROM offers WHERE id = $1 FOR UPDATE`,
        [offerId]
      );

      if (offerRes.rows.length === 0) {
        const err: any = new Error('Offer not found.');
        err.statusCode = 404;
        throw err;
      }

      const offer = offerRes.rows[0];

      // Authorization Check: Must be a participant (buyer or seller) in the offer
      const isParticipant = offer.buyer_organization_id === userOrgId || offer.seller_organization_id === userOrgId;
      if (!isParticipant) {
        const err: any = new Error('You are not authorized to accept this offer.');
        err.statusCode = 403;
        throw err;
      }

      // Check Offer State
      const offerStatus = (offer.status || '').toUpperCase();
      if (offerStatus !== 'SENT' && offerStatus !== 'PENDING') {
        const err: any = new Error(`Cannot accept an offer with status '${offer.status}'.`);
        err.statusCode = 400;
        throw err;
      }

      // Expiration check
      if (new Date(offer.valid_until).getTime() <= Date.now()) {
        await client.query(`UPDATE offers SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`, [offerId]);
        await client.query(
          `INSERT INTO offer_status_history (offer_id, from_status, to_status, changed_by, reason)
           VALUES ($1, $2, 'EXPIRED', $3, 'Offer expired prior to acceptance')`,
          [offerId, offer.status, userId]
        );
        const err: any = new Error('Offer has expired and cannot be accepted.');
        err.statusCode = 400;
        throw err;
      }

      // 3. Lock and fetch CO2 listing row with FOR UPDATE
      const listingRes = await client.query(
        `SELECT * FROM co2_listings WHERE id = $1 FOR UPDATE`,
        [offer.listing_id]
      );

      if (listingRes.rows.length === 0) {
        const err: any = new Error('Associated CO₂ supply listing not found.');
        err.statusCode = 404;
        throw err;
      }

      const listing = listingRes.rows[0];

      // Fetch facility details for commercial snapshot
      let facilityName: string | undefined;
      let facilityLocation: string | undefined;
      if (listing.facility_id) {
        const facRes = await client.query(`SELECT name, city, state FROM facilities WHERE id = $1`, [listing.facility_id]);
        if (facRes.rows.length > 0) {
          facilityName = facRes.rows[0].name;
          facilityLocation = `${facRes.rows[0].city}, ${facRes.rows[0].state}`;
        }
      }
      const listingStatus = (listing.status || '').toUpperCase();
      if (listingStatus !== 'PUBLISHED' && listingStatus !== 'ACTIVE') {
        const err: any = new Error(`CO₂ listing is not active (Status: ${listing.status}).`);
        err.statusCode = 400;
        throw err;
      }

      const offerQty = parseFloat(offer.quantity || offer.offered_quantity_tons || '0');
      const currentListingQty = parseFloat((listing.remaining_quantity ?? listing.available_quantity_tons ?? 0).toString());

      if (currentListingQty < offerQty) {
        const err: any = new Error(`Insufficient remaining CO₂ supply. Required: ${offerQty} t, Available: ${currentListingQty} t.`);
        err.statusCode = 400;
        throw err;
      }

      // 4. Generate Order Number
      const countRes = await client.query<{ count: string }>('SELECT COUNT(*) as count FROM orders');
      const seq = parseInt(countRes.rows[0]?.count || '0', 10) + 1;
      const orderNumber = `CL-ORD-${seq.toString().padStart(6, '0')}`;

      // 5. Build Commercial Snapshot
      const unitPrice = parseFloat(offer.unit_price || offer.offered_price_per_ton || '0');
      const deliveryCost = parseFloat(offer.delivery_cost || '0');
      const subtotal = unitPrice * offerQty;
      const totalAmount = subtotal + deliveryCost;

      const snapshot: CommercialSnapshot = {
        offer_number: offer.offer_number || `CL-OFR-${offerId.slice(0, 6)}`,
        offer_id: offerId,
        inquiry_id: offer.inquiry_id || undefined,
        version: offer.version || 1,
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId,
        listing_title: listing.title,
        listing_purity_percentage: parseFloat(listing.purity_percentage || '0'),
        seller_facility_name: facilityName,
        seller_location: facilityLocation,
        buyer_location: destinationAddress,
        unit_price: unitPrice,
        quantity: offerQty,
        subtotal,
        delivery_cost: deliveryCost,
        total_amount: totalAmount,
        currency: offer.currency || 'INR',
      };

      // 6. Create Order Row
      const orderRes = await client.query<Order>(
        `INSERT INTO orders (
          order_number, offer_id, listing_id, requirement_id,
          buyer_organization_id, seller_organization_id,
          quantity, quantity_unit, unit_price, currency,
          subtotal_amount, delivery_cost, total_amount,
          quantity_tons, price_per_ton, logistics_fee, platform_fee,
          destination_address, commercial_snapshot, created_by, status
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13,
          $7, $9, $12, 0,
          $14, $15, $16, 'CONFIRMED'
        ) RETURNING *`,
        [
          orderNumber,
          offerId,
          offer.listing_id,
          offer.inquiry_id ? (await client.query(`SELECT requirement_id FROM inquiries WHERE id = $1`, [offer.inquiry_id])).rows[0]?.requirement_id : null,
          offer.buyer_organization_id,
          offer.seller_organization_id,
          offerQty,
          offer.quantity_unit || 'tonne',
          unitPrice,
          offer.currency || 'INR',
          subtotal,
          deliveryCost,
          totalAmount,
          destinationAddress || null,
          JSON.stringify(snapshot),
          userId,
        ]
      );

      const order = orderRes.rows[0];

      // 7. Mark Offer as ACCEPTED
      await client.query(
        `UPDATE offers SET status = 'ACCEPTED', updated_at = NOW() WHERE id = $1`,
        [offerId]
      );
      await client.query(
        `INSERT INTO offer_status_history (offer_id, from_status, to_status, changed_by, reason)
         VALUES ($1, $2, 'ACCEPTED', $3, 'Commercial offer accepted by counterparty')`,
        [offerId, offer.status, userId]
      );

      // 8. Order Status History Entry
      await client.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
         VALUES ($1, NULL, 'CONFIRMED', $2, 'Order generated from accepted commercial offer')`,
        [order.id, userId]
      );

      // 9. Decrement Listing Remaining Quantity
      const newListingQty = currentListingQty - offerQty;
      const newListingStatus = newListingQty <= 0 ? 'EXHAUSTED' : listing.status;

      await client.query(
        `UPDATE co2_listings 
         SET remaining_quantity = $1, 
             available_quantity_tons = $1, 
             status = $2, 
             updated_at = NOW() 
         WHERE id = $3`,
        [newListingQty, newListingStatus, offer.listing_id]
      );

      // 10. Update Inquiry status to CONVERTED if present
      if (offer.inquiry_id) {
        await client.query(
          `UPDATE inquiries SET status = 'CONVERTED', updated_at = NOW() WHERE id = $1`,
          [offer.inquiry_id]
        );

        // Expire other pending offers for this inquiry
        await client.query(
          `UPDATE offers SET status = 'EXPIRED', updated_at = NOW() 
           WHERE inquiry_id = $1 AND id != $2 AND status IN ('SENT', 'PENDING', 'DRAFT')`,
          [offer.inquiry_id, offerId]
        );
      }

      // 11. Create Audit Log
      await client.query(
        `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values)
         VALUES ($1, $2, 'order_created', 'orders', $3, $4)`,
        [userId, userOrgId, order.id, JSON.stringify({ order_number: orderNumber, offer_id: offerId, total_amount: totalAmount })]
      );

      await client.query('COMMIT');

      // 12. Send Notifications to both Buyer and Seller Organizations
      await notificationService.notifyOrganization(
        offer.buyer_organization_id,
        `Purchase Order Created (${orderNumber})`,
        `Commercial agreement confirmed for ${offerQty} tonnes of CO₂. Order #${orderNumber}.`,
        'ORDER_CREATED',
        'order',
        order.id,
        `/dashboard/orders/${order.id}`
      );

      await notificationService.notifyOrganization(
        offer.seller_organization_id,
        `Sales Order Confirmed (${orderNumber})`,
        `Commercial agreement confirmed for ${offerQty} tonnes of CO₂. Order #${orderNumber}.`,
        'ORDER_CREATED',
        'order',
        order.id,
        `/dashboard/orders/${order.id}`
      );

      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async confirmHandshake(orderId: string, userOrgId: string, userId: string, role: 'seller' | 'buyer' | 'logistics'): Promise<Order> {
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1 OR order_number = $1`, [orderId]);
    if (orderRes.rows.length === 0) {
      const err: any = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    const order = orderRes.rows[0];
    const isSeller = order.seller_organization_id === userOrgId;
    const isBuyer = order.buyer_organization_id === userOrgId;

    if (role === 'seller' && !isSeller) {
      const err: any = new Error('Only the seller organization can confirm as seller.');
      err.statusCode = 403;
      throw err;
    }

    if (role === 'buyer' && !isBuyer) {
      const err: any = new Error('Only the buyer organization can confirm as buyer.');
      err.statusCode = 403;
      throw err;
    }

    let sellerConfirmed = order.seller_confirmed_at || (role === 'seller' ? new Date() : null);
    let buyerConfirmed = order.buyer_confirmed_at || (role === 'buyer' ? new Date() : null);
    let logisticsConfirmed = order.logistics_confirmed_at || (role === 'logistics' ? new Date() : null);

    let newStatus = 'AWAITING_THREE_WAY_CONFIRMATION';
    if (sellerConfirmed || buyerConfirmed || logisticsConfirmed) {
      newStatus = 'PARTIALLY_CONFIRMED';
    }

    // Absolute Rule: All three must confirm to be TRANSACTION_CONFIRMED
    if (sellerConfirmed && buyerConfirmed && logisticsConfirmed) {
      newStatus = 'TRANSACTION_CONFIRMED';
    }

    const updateRes = await pool.query<Order>(
      `UPDATE orders 
       SET seller_confirmed_at = $1,
           buyer_confirmed_at = $2,
           logistics_confirmed_at = $3,
           vehicle_availability_confirmed = CASE WHEN $4 = 'logistics' THEN TRUE ELSE vehicle_availability_confirmed END,
           route_accepted = CASE WHEN $4 = 'logistics' THEN TRUE ELSE route_accepted END,
           reconfirmation_required = FALSE,
           status = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        sellerConfirmed ? (sellerConfirmed instanceof Date ? sellerConfirmed : new Date(sellerConfirmed)) : null,
        buyerConfirmed ? (buyerConfirmed instanceof Date ? buyerConfirmed : new Date(buyerConfirmed)) : null,
        logisticsConfirmed ? (logisticsConfirmed instanceof Date ? logisticsConfirmed : new Date(logisticsConfirmed)) : null,
        role,
        newStatus,
        order.id,
      ]
    );

    const updatedOrder = updateRes.rows[0];

    // Log status history
    await pool.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, order.status, newStatus, userId, `Handshake confirmed by ${role.toUpperCase()}`]
    );

    // Notify participants
    await notificationService.notifyOrganization(
      order.buyer_organization_id,
      `Handshake Progress (${newStatus})`,
      `${role.toUpperCase()} confirmed order #${order.order_number}. Current status: ${newStatus}.`,
      'ORDER_UPDATED',
      'order',
      order.id,
      `/dashboard/orders/${order.id}`
    );

    await notificationService.notifyOrganization(
      order.seller_organization_id,
      `Handshake Progress (${newStatus})`,
      `${role.toUpperCase()} confirmed order #${order.order_number}. Current status: ${newStatus}.`,
      'ORDER_UPDATED',
      'order',
      order.id,
      `/dashboard/orders/${order.id}`
    );

    return updatedOrder;
  }

  async updateDealTerms(orderId: string, userOrgId: string, userId: string, terms: any): Promise<Order> {
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0) {
      const err: any = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    const order = orderRes.rows[0];
    const isParticipant = order.seller_organization_id === userOrgId || order.buyer_organization_id === userOrgId;
    if (!isParticipant) {
      const err: any = new Error('Unauthorized to modify commercial deal terms.');
      err.statusCode = 403;
      throw err;
    }

    // Material changes reset confirmations to RECONFIRMATION_REQUIRED
    const updateRes = await pool.query<Order>(
      `UPDATE orders
       SET seller_confirmed_at = NULL,
           buyer_confirmed_at = NULL,
           logistics_confirmed_at = NULL,
           reconfirmation_required = TRUE,
           reconfirmation_reason = $1,
           status = 'RECONFIRMATION_REQUIRED',
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [terms.reason || 'Material deal terms were updated.', order.id]
    );

    await pool.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
       VALUES ($1, $2, 'RECONFIRMATION_REQUIRED', $3, $4)`,
      [order.id, order.status, userId, 'Material deal terms updated - reconfirmation required.']
    );

    return updateRes.rows[0];
  }

  async confirmBuyerReceipt(orderId: string, buyerOrgId: string, userId: string): Promise<Order> {
    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0) {
      const err: any = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    const order = orderRes.rows[0];
    if (order.buyer_organization_id !== buyerOrgId) {
      const err: any = new Error('Only the buyer organization can confirm receipt.');
      err.statusCode = 403;
      throw err;
    }

    const updateRes = await pool.query<Order>(
      `UPDATE orders
       SET status = 'COMPLETED',
           delivered_quantity = COALESCE(delivered_quantity, quantity_tons, quantity),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [order.id]
    );

    await pool.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason)
       VALUES ($1, $2, 'COMPLETED', $3, 'Buyer confirmed receipt of delivered CO₂')`,
      [order.id, order.status, userId]
    );

    return updateRes.rows[0];
  }

  async getOrderDetail(id: string, userOrgId: string, isPlatformAdmin = false): Promise<OrderDetail> {
    const detail = await this.repo.getOrderById(id);
    if (!detail) {
      const err: any = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    const isParticipant =
      detail.buyer_organization_id === userOrgId ||
      detail.seller_organization_id === userOrgId ||
      isPlatformAdmin;

    if (!isParticipant) {
      const err: any = new Error('You are not authorized to view this order.');
      err.statusCode = 403;
      throw err;
    }

    return detail;
  }

  async listOrders(orgId: string, role: 'received' | 'sent' | 'all' = 'all', status?: string, page = 1, limit = 20) {
    return this.repo.listOrders(orgId, role, status, page, limit);
  }
}

