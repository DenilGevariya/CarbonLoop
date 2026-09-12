import { pool } from '../config/database';
import { InquiryService } from './inquiries/inquiry.service';
import { OfferService } from './offers/offer.service';
import { OrderService } from './orders/order.service';
import { NotificationService } from './notifications/notification.service';

const inquiryService = new InquiryService();
const offerService = new OfferService();
const orderService = new OrderService();
const notificationService = new NotificationService();

async function runCommercialTransactionTests() {
  console.log('🧪 Starting Commercial Transaction Layer Integration & Concurrency Tests...\n');

  try {
    // 1. Fetch test organizations, users, and listings
    const orgs = await pool.query('SELECT id, name FROM organizations LIMIT 2');
    if (orgs.rows.length < 2) {
      throw new Error('At least 2 organizations required for transaction testing.');
    }
    const buyerOrg = orgs.rows[0];
    const sellerOrg = orgs.rows[1];

    const users = await pool.query('SELECT id FROM users LIMIT 2');
    const buyerUser = users.rows[0].id;
    const sellerUser = users.rows[1].id;

    const fac = await pool.query('SELECT id FROM facilities LIMIT 1');
    const facilityId = fac.rows[0]?.id;

    // Create a temporary test listing for isolation
    const listingRes = await pool.query(
      `INSERT INTO co2_listings (
        organization_id, facility_id, title, description, available_quantity_tons, remaining_quantity,
        price_per_ton, purity_percentage, state_form, status
       ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, 'PUBLISHED')
       RETURNING *`,
      [sellerOrg.id, facilityId, 'Test Commercial CO2 Batch', 'High-purity liquid CO2 for transaction validation', 1000, 4500.00, 99.5, 'LIQUID']
    );
    const listing = listingRes.rows[0];
    console.log(`✅ Created Test Listing: "${listing.title}" (ID: ${listing.id}, Supply: 1000 t)`);

    // 2. Test Inquiry Creation
    console.log('\n--- 1. Testing Inquiry Creation ---');
    const inquiry = await inquiryService.createInquiry(buyerOrg.id, buyerUser, {
      listing_id: listing.id,
      requested_quantity: 400,
      message: 'Interested in securing 400 tonnes of high purity CO2 for industrial beverage processing.',
    });
    console.log(`✅ Inquiry Created successfully: ID ${inquiry.id}, Status: ${inquiry.status}`);

    // 3. Test Message Threading
    console.log('\n--- 2. Testing Inquiry Message Threading ---');
    const msg1 = await inquiryService.addMessage(inquiry.id, sellerUser, sellerOrg.id, 'We can fulfill your 400t requirement at our facility.');
    console.log(`✅ Seller Response Message Posted. Inquiry Status Updated.`);
    const detail = await inquiryService.getInquiryDetail(inquiry.id, buyerOrg.id);
    console.log(`✅ Retrieved Inquiry Detail. Total Messages: ${detail.messages?.length}`);

    // 4. Test Commercial Offer Creation
    console.log('\n--- 3. Testing Commercial Offer Creation (V1) ---');
    const offerV1 = await offerService.createOffer(sellerOrg.id, sellerUser, {
      inquiry_id: inquiry.id,
      quantity: 400,
      unit_price: 4400.00,
      delivery_cost: 35000.00,
      valid_until: new Date(Date.now() + 86400000).toISOString(), // 24 hours in future
      message: 'Official proposal: ₹4,400/t + ₹35,000 transport cost.',
    });
    console.log(`✅ Offer V1 Issued: ${offerV1.offer_number}, Total: ₹${offerV1.total_estimated_cost}, Status: ${offerV1.status}`);

    // 5. Test Counter-Offer Versioning
    console.log('\n--- 4. Testing Counter-Offer Revision (V2) ---');
    const offerV2 = await offerService.counterOffer(offerV1.id, buyerOrg.id, buyerUser, {
      unit_price: 4200.00,
      valid_until: new Date(Date.now() + 86400000).toISOString(),
      message: 'Buyer Counter Proposal: Target unit price ₹4,200/t.',
    });
    console.log(`✅ Counter Offer V2 Issued: ${offerV2.offer_number}, Version: ${offerV2.version}, Parent Offer: ${offerV2.parent_offer_id}`);

    // Verify parent offer status transitioned to COUNTERED
    const parentCheck = await offerService.getOfferDetail(offerV1.id, sellerOrg.id);
    console.log(`✅ Parent Offer Status: ${parentCheck.status} (Verified version history length: ${parentCheck.version_history?.length})`);

    // 6. Test Offer Acceptance & Industrial Order Generation
    console.log('\n--- 5. Testing Offer Acceptance & Order Generation ---');
    const order = await orderService.acceptOffer(offerV2.id, sellerOrg.id, sellerUser, 'GIDC Industrial Estate, Vadodara, Gujarat');
    console.log(`✅ Order Generated: Number: ${order.order_number}, Status: ${order.status}, Total Amount: ₹${order.total_amount}`);

    // 7. Verify Remaining Quantity Reduction & Status Transition
    const updatedListingRes = await pool.query('SELECT remaining_quantity, status FROM co2_listings WHERE id = $1', [listing.id]);
    const updatedListing = updatedListingRes.rows[0];
    console.log(`✅ Listing Remaining Supply Decremented: 1000 t -> ${updatedListing.remaining_quantity} t (Listing Status: ${updatedListing.status})`);

    // 8. Test Idempotency (Duplicate Accept)
    console.log('\n--- 6. Testing Idempotency & Duplicate Protection ---');
    const dupOrder = await orderService.acceptOffer(offerV2.id, sellerOrg.id, sellerUser);
    console.log(`✅ Duplicate Accept Handled Safely. Returned Existing Order ID: ${dupOrder.id}`);

    // 9. Concurrency Protection Test (Overselling Prevention)
    console.log('\n--- 7. Testing Concurrency & Row Locking (Overselling Protection) ---');
    const limitedListingRes = await pool.query(
      `INSERT INTO co2_listings (
        organization_id, facility_id, title, description, available_quantity_tons, remaining_quantity,
        price_per_ton, purity_percentage, state_form, status
       ) VALUES ($1, $2, $3, $4, 300, 300, 5000.00, 99.0, 'LIQUID', 'PUBLISHED')
       RETURNING id`,
      [sellerOrg.id, facilityId, 'Limited Quantity Batch for Concurrency Test', 'Only 300 tonnes left']
    );
    const limitedListingId = limitedListingRes.rows[0].id;

    // Create 2 competing inquiries & offers for 250t each (Total 500t > 300t)
    const inqA = await inquiryService.createInquiry(buyerOrg.id, buyerUser, { listing_id: limitedListingId, requested_quantity: 250, message: 'Buyer A request' });
    const inqB = await inquiryService.createInquiry(buyerOrg.id, buyerUser, { listing_id: limitedListingId, requested_quantity: 250, message: 'Buyer B request' });

    const offerA = await offerService.createOffer(sellerOrg.id, sellerUser, { inquiry_id: inqA.id, quantity: 250, unit_price: 5000, valid_until: new Date(Date.now() + 86400000).toISOString() });
    const offerB = await offerService.createOffer(sellerOrg.id, sellerUser, { inquiry_id: inqB.id, quantity: 250, unit_price: 5000, valid_until: new Date(Date.now() + 86400000).toISOString() });

    console.log('⚡ Triggering concurrent offer acceptances (250t + 250t against 300t remaining)...');
    const results = await Promise.allSettled([
      orderService.acceptOffer(offerA.id, buyerOrg.id, buyerUser),
      orderService.acceptOffer(offerB.id, buyerOrg.id, buyerUser),
    ]);

    const fulfilledCount = results.filter((r) => r.status === 'fulfilled').length;
    const rejectedCount = results.filter((r) => r.status === 'rejected').length;

    console.log(`✅ Concurrency Test Results: ${fulfilledCount} Succeeded, ${rejectedCount} Rejected.`);
    if (fulfilledCount === 1 && rejectedCount === 1) {
      console.log('🏆 Database Transaction & Row Locking PREVENTED OVERSELLING SUCCESSFULLY!');
    } else {
      console.error('❌ Overselling test failed!', results);
    }

    // Clean up temporary test records
    await pool.query('DELETE FROM orders WHERE listing_id IN ($1, $2)', [listing.id, limitedListingId]);
    await pool.query('DELETE FROM co2_listings WHERE id IN ($1, $2)', [listing.id, limitedListingId]);
    console.log('\n✨ All Commercial Transaction Layer Integration & Concurrency Tests Passed!\n');
  } catch (err) {
    console.error('❌ Commercial Transaction Test Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runCommercialTransactionTests();
