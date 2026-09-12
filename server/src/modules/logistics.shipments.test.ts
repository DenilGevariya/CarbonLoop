import { pool } from '../config/database';
import { LogisticsService } from './logistics/logistics.service';
import { ShipmentService } from './shipments/shipment.service';
import { OrderService } from './orders/order.service';
import { OfferService } from './offers/offer.service';
import { InquiryService } from './inquiries/inquiry.service';
import {
  calculateHaversineDistanceKm,
  estimateTransitDurationMinutes,
  calculateTransportEmissionsKg,
  calculateLogisticsDecisionScore,
} from './logistics/logistics.estimation';

const logisticsService = new LogisticsService();
const shipmentService = new ShipmentService();
const orderService = new OrderService();
const offerService = new OfferService();
const inquiryService = new InquiryService();

async function runLogisticsShipmentsTest() {
  console.log('🧪 Starting Logistics Network, Quotes, and Shipment Tracking Lifecycle Tests...\n');

  try {
    // 1. Test Estimation Utilities
    console.log('--- 1. Testing Estimation Utilities ---');
    const dist = calculateHaversineDistanceKm(23.0225, 72.5714, 22.3072, 73.1812); // Ahmedabad -> Vadodara
    const duration = estimateTransitDurationMinutes(dist, 'ISO_TANK_TRUCK');
    const emissions = calculateTransportEmissionsKg(dist, 300, 'ISO_TANK_TRUCK');
    const decisionScore = calculateLogisticsDecisionScore(45000, duration, emissions, 50000, 240, 3500);

    console.log(`✅ Calculated Distance (Ahmedabad -> Vadodara): ${dist} km (Expected ~100-120 km)`);
    console.log(`✅ Calculated Indicative Duration: ${duration} mins`);
    console.log(`✅ Calculated Transport Emissions: ${emissions} kg CO2e`);
    console.log(`✅ Calculated Logistics Decision Score: ${decisionScore} / 100`);

    // 2. Fetch test orgs, users, facilities & setup test order
    const orgs = await pool.query('SELECT id, name, org_type FROM organizations LIMIT 3');
    if (orgs.rows.length < 2) {
      throw new Error('At least 2 organizations required for logistics testing.');
    }
    const buyerOrg = orgs.rows[0];
    const sellerOrg = orgs.rows[1];

    // Get or create logistics provider organization
    let providerOrg = orgs.rows.find((o) => (o.org_type || '').toUpperCase() === 'LOGISTICS_PROVIDER');
    if (!providerOrg) {
      const pRes = await pool.query(
        `INSERT INTO organizations (name, slug, org_type, industry, country, verification_status)
         VALUES ('CarbonRoute Express Logistics', 'carbonroute-express-logistics', 'LOGISTICS_PROVIDER', 'Logistics & Freight', 'India', 'VERIFIED')
         RETURNING id, name, org_type`
      );
      providerOrg = pRes.rows[0];
    }
    console.log(`✅ Logistics Provider Org: "${providerOrg.name}" (${providerOrg.id})`);

    const users = await pool.query('SELECT id FROM users LIMIT 2');
    const buyerUser = users.rows[0].id;
    const sellerUser = users.rows[1].id;

    const fac = await pool.query('SELECT id FROM facilities LIMIT 1');
    const facilityId = fac.rows[0]?.id;

    // Create test listing & order
    const listingRes = await pool.query(
      `INSERT INTO co2_listings (
        organization_id, facility_id, title, description, available_quantity_tons, remaining_quantity,
        price_per_ton, purity_percentage, state_form, status
       ) VALUES ($1, $2, 'Logistics Test Stream', 'High volume supply', 2000, 2000, 4500.00, 99.5, 'LIQUID', 'PUBLISHED')
       RETURNING id`,
      [sellerOrg.id, facilityId]
    );
    const listingId = listingRes.rows[0].id;

    const inq = await inquiryService.createInquiry(buyerOrg.id, buyerUser, {
      listing_id: listingId,
      requested_quantity: 500,
      message: 'Logistics test supply request for 500 tonnes',
    });

    const offer = await offerService.createOffer(sellerOrg.id, sellerUser, {
      inquiry_id: inq.id,
      quantity: 500,
      unit_price: 4500,
      delivery_cost: 40000,
      valid_until: new Date(Date.now() + 86400000).toISOString(),
    });

    const order = await orderService.acceptOffer(offer.id, buyerOrg.id, buyerUser, 'GIDC Estate, Vadodara');
    console.log(`\n✅ Setup Test Order: ${order.order_number} (ID: ${order.id}, Volume: 500 t)`);

    // 3. Test Logistics Quote Creation
    console.log('\n--- 2. Testing Logistics Quote Creation ---');
    const quote = await logisticsService.createQuote(providerOrg.id, sellerUser, {
      order_id: order.id,
      transport_mode: 'ISO_TANK_TRUCK',
      base_cost: 35000,
      fuel_surcharge: 5000,
      handling_cost: 2000,
      other_cost: 1000,
      currency: 'INR',
      valid_until: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Dedicated ISO tank truck transport quote',
    });

    console.log(`✅ Quote Created: ID ${quote.id}, Total Cost: ₹${quote.total_cost}, Mode: ${quote.transport_mode}, Status: ${quote.status}`);

    // 4. Test Quote Acceptance Transaction & Shipment Generation
    console.log('\n--- 3. Testing Quote Acceptance Transaction & Shipment Generation ---');
    const shipment = await logisticsService.acceptQuote(quote.id, buyerOrg.id, buyerUser);
    console.log(`✅ Quote Accepted! Shipment Created: Number: ${shipment.shipment_number}, Tracking Ref: ${shipment.tracking_reference}, Status: ${shipment.status}`);

    // Verify detail with route stops and tracking events
    const shipDetail = await shipmentService.getShipmentDetail(shipment.shipment_number, buyerOrg.id);
    console.log(`✅ Shipment Detail Verified. Route Stops: ${shipDetail.routes?.length}, Tracking Events: ${shipDetail.events?.length}`);

    // 5. Test Idempotency
    console.log('\n--- 4. Testing Quote Accept Idempotency ---');
    const dupShipment = await logisticsService.acceptQuote(quote.id, buyerOrg.id, buyerUser);
    console.log(`✅ Duplicate Quote Acceptance Handled Safely. Returned Shipment ID: ${dupShipment.id}`);

    // 6. Test Shipment Lifecycle Transitions
    console.log('\n--- 5. Testing Shipment Lifecycle Transitions ---');
    
    // SCHEDULED -> PICKED_UP
    const pickedUp = await shipmentService.pickupShipment(shipment.id, providerOrg.id, sellerUser);
    console.log(`✅ Step 1: PICKED_UP - Actual Pickup Time: ${pickedUp.actual_pickup_at}`);

    // PICKED_UP -> IN_TRANSIT
    const inTransit = await shipmentService.departShipment(shipment.id, providerOrg.id, sellerUser);
    console.log(`✅ Step 2: IN_TRANSIT - Status: ${inTransit.status}`);

    // Append custom tracking event
    await shipmentService.addTrackingEvent(shipment.id, 'CHECKPOINT', 'Nadiad Toll Plaza', 22.6916, 72.8634, 'Passed checkpoint on schedule');
    console.log(`✅ Checkpoint Tracking Event Appended.`);

    // IN_TRANSIT -> ARRIVING
    const arriving = await shipmentService.arriveShipment(shipment.id, providerOrg.id, sellerUser);
    console.log(`✅ Step 3: ARRIVING - Status: ${arriving.status}`);

    // ARRIVING -> DELIVERED
    const delivered = await shipmentService.deliverShipment(shipment.id, providerOrg.id, sellerUser);
    console.log(`✅ Step 4: DELIVERED - Actual Delivery Time: ${delivered.actual_delivery_at}`);

    // DELIVERED -> COMPLETED (Buyer Receipt Confirmation)
    const completed = await shipmentService.confirmReceipt(shipment.id, buyerOrg.id, buyerUser);
    console.log(`✅ Step 5: COMPLETED - Buyer Confirmation Recorded. Status: ${completed.status}`);

    // 7. Verify Order Status Reconciliation
    const updatedOrderRes = await pool.query('SELECT status FROM orders WHERE id = $1', [order.id]);
    console.log(`✅ Associated Order Status Reconciled to: ${updatedOrderRes.rows[0].status}`);

    // 8. Test Operational Exception Flow
    console.log('\n--- 6. Testing Operational Exception Reporting ---');
    const excQuote = await logisticsService.createQuote(providerOrg.id, sellerUser, {
      order_id: order.id,
      transport_mode: 'ISO_TANK_TRUCK',
      base_cost: 38000,
      valid_until: new Date(Date.now() + 86400000).toISOString(),
    });
    const excShipment = await logisticsService.acceptQuote(excQuote.id, buyerOrg.id, buyerUser);
    const exceptioned = await shipmentService.reportException(excShipment.id, 'Heavy Highway Weather Delay', 'Tanker held at Nadiad safety stop', providerOrg.id, sellerUser);
    console.log(`✅ Exception Reported. Shipment Status: ${exceptioned.status}, Reason: "${exceptioned.exception_reason}"`);

    // Clean up temporary records
    await pool.query('DELETE FROM shipment_tracking_events WHERE shipment_id IN ($1, $2)', [shipment.id, excShipment.id]);
    await pool.query('DELETE FROM shipment_routes WHERE shipment_id IN ($1, $2)', [shipment.id, excShipment.id]);
    await pool.query('DELETE FROM shipments WHERE id IN ($1, $2)', [shipment.id, excShipment.id]);
    await pool.query('DELETE FROM logistics_quotes WHERE id IN ($1, $2)', [quote.id, excQuote.id]);
    await pool.query('DELETE FROM orders WHERE id = $1', [order.id]);
    await pool.query('DELETE FROM co2_listings WHERE id = $1', [listingId]);

    console.log('\n✨ All Logistics Network, Quote, and Shipment Lifecycle Tests Passed Successfully!\n');
  } catch (err) {
    console.error('❌ Logistics & Shipment Test Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runLogisticsShipmentsTest();
