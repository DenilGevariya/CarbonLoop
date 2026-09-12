import { pool } from '../config/database';

export async function seedLogisticsDemoData() {
  console.log('🚚 Seeding Realistic CarbonLoop Logistics Network & Shipment Tracking Demo Data...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get or Create Logistics Provider Organizations
    const providersData = [
      { name: 'CarbonRoute Logistics Express', slug: 'carbonroute-express', region: 'Gujarat & West India Corridor' },
      { name: 'GreenTransit Industrial Freight', slug: 'greentransit-freight', region: 'National Pipeline & Tanker Net' },
      { name: 'Gujarat Industrial Transport Corp', slug: 'gujarat-industrial-transport', region: 'Statewide Heavy Chemical' },
      { name: 'CircularHaul CO2 Solutions', slug: 'circularhaul-co2', region: 'Inter-State Cryogenic Rail & Tanker' },
    ];

    const providerIds: string[] = [];

    for (const p of providersData) {
      const existing = await client.query('SELECT id FROM organizations WHERE slug = $1', [p.slug]);
      if (existing.rows.length > 0) {
        providerIds.push(existing.rows[0].id);
      } else {
        const ins = await client.query(
          `INSERT INTO organizations (name, slug, org_type, industry, country, verification_status)
           VALUES ($1, $2, 'LOGISTICS_PROVIDER', 'Logistics & Freight', 'India', 'VERIFIED')
           RETURNING id`,
          [p.name, p.slug]
        );
        providerIds.push(ins.rows[0].id);
      }
    }

    // 2. Fetch existing orders & orgs for linkage
    const ordersRes = await client.query('SELECT id, order_number, listing_id, buyer_organization_id, seller_organization_id FROM orders LIMIT 10');
    if (ordersRes.rows.length === 0) {
      console.log('⚠️ No existing orders found to attach demo quotes/shipments. Run primary seed first.');
      await client.query('COMMIT');
      return;
    }

    const facRes = await client.query('SELECT id FROM facilities LIMIT 1');
    const facilityId = facRes.rows[0]?.id || null;

    const testOrder = ordersRes.rows[0];

    // 3. Create Signature Demo Shipment CL-SHP-000124 (300 TONNES, Ahmedabad -> Vadodara, IN_TRANSIT)
    const existingDemoShp = await client.query('SELECT id FROM shipments WHERE shipment_number = $1', ['CL-SHP-000124']);
    if (existingDemoShp.rows.length === 0) {
      // Create quote for demo shipment
      const demoQuoteRes = await client.query(
        `INSERT INTO logistics_quotes (
          order_id, provider_organization_id, distance_km, estimated_duration_minutes,
          transport_mode, base_cost, fuel_surcharge, handling_cost, other_cost, total_cost,
          currency, estimated_co2e_kg, valid_until, status, notes
        ) VALUES (
          $1, $2, 145.0, 240,
          'ISO_TANK_TRUCK', 36000.00, 4500.00, 2000.00, 1000.00, 43500.00,
          'INR', 3480.00, NOW() + INTERVAL '14 days', 'ACCEPTED',
          'Dedicated ISO tank truck transport for liquefied CO2'
        ) RETURNING id`,
        [testOrder.id, providerIds[0]]
      );
      const demoQuoteId = demoQuoteRes.rows[0].id;

      const demoShpRes = await client.query(
        `INSERT INTO shipments (
          shipment_number, order_id, logistics_provider_id, quote_id, origin_facility_id,
          quantity, quantity_unit, quantity_tons,
          scheduled_pickup_at, actual_pickup_at, estimated_delivery_at,
          distance_km, estimated_distance_km, transport_mode, tracking_reference,
          destination_address, status
        ) VALUES (
          'CL-SHP-000124', $1, $2, $3, $4,
          300.00, 'tonne', 300.00,
          NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours', NOW() + INTERVAL '6 hours',
          145.0, 145.0, 'ISO_TANK_TRUCK', 'CLTRK-8F4A19',
          'Vadodara GreenFuel Industrial Park, Plot 42', 'IN_TRANSIT'
        ) RETURNING id`,
        [testOrder.id, providerIds[0], demoQuoteId, facilityId]
      );
      const demoShpId = demoShpRes.rows[0].id;

      // Add Route Stops
      await client.query(
        `INSERT INTO shipment_routes (shipment_id, sequence_number, location_name, location_type, latitude, longitude)
         VALUES
         ($1, 1, 'Ahmedabad Capture Plant', 'ORIGIN', 23.0225, 72.5714),
         ($1, 2, 'Nadiad Toll Checkpoint', 'WAYPOINT', 22.6916, 72.8634),
         ($1, 3, 'Vadodara GreenFuel Facility', 'DESTINATION', 22.3072, 73.1812)`,
        [demoShpId]
      );

      // Add Historical Tracking Events
      await client.query(
        `INSERT INTO shipment_tracking_events (shipment_id, event_type, status, event_status, location_name, latitude, longitude, notes, occurred_at, event_time)
         VALUES
         ($1, 'SHIPMENT_CREATED', 'PLANNED', 'PLANNED', 'Ahmedabad Capture Plant', 23.0225, 72.5714, 'Shipment order initialized from accepted transport proposal', NOW() - INTERVAL '24 hours', NOW() - INTERVAL '24 hours'),
         ($1, 'SCHEDULED', 'SCHEDULED', 'SCHEDULED', 'Ahmedabad Capture Plant', 23.0225, 72.5714, 'Vehicle assigned and pickup window confirmed', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),
         ($1, 'PICKED_UP', 'PICKED_UP', 'PICKED_UP', 'Ahmedabad Capture Plant', 23.0225, 72.5714, '300 tonnes liquefied CO2 loaded into pressure tanker', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours'),
         ($1, 'DEPARTED', 'IN_TRANSIT', 'IN_TRANSIT', 'Ahmedabad Industrial Exit', 22.9800, 72.6000, 'Departed origin facility on schedule', NOW() - INTERVAL '14 hours', NOW() - INTERVAL '14 hours'),
         ($1, 'CHECKPOINT', 'IN_TRANSIT', 'IN_TRANSIT', 'Nadiad Toll Plaza Checkpoint', 22.6916, 72.8634, 'Safety inspection cleared. Pressure 18.4 bar stable.', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
         ($1, 'IN_TRANSIT', 'IN_TRANSIT', 'IN_TRANSIT', 'Anand Industrial Corridor', 22.5645, 72.9289, 'In transit along NH48 corridor towards Vadodara', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')`,
        [demoShpId]
      );

      console.log('✅ Signature Demo Shipment CL-SHP-000124 (IN_TRANSIT, 300 t) Seeded Successfully!');
    }

    // 4. Seed Additional Diverse Demo Shipments (DELIVERED, EXCEPTION, SCHEDULED)
    const extraShipmentsData = [
      {
        num: 'CL-SHP-000125',
        qty: 150,
        status: 'DELIVERED',
        mode: 'CYLINDER_CASCADE',
        ref: 'CLTRK-[#3A91B2]',
        orig: 'Surat Chemical Complex',
        dest: 'Bharuch Synthesis Plant',
        dist: 75,
      },
      {
        num: 'CL-SHP-000126',
        qty: 500,
        status: 'EXCEPTION',
        mode: 'RAIL_TANKER',
        ref: 'CLTRK-[#7F2C99]',
        orig: 'Jamnagar Refinery',
        dest: 'Ahmedabad Synthetic Fuels',
        dist: 310,
        excReason: 'Severe Highway Weather Delay & Track Clearance Maintenance',
      },
      {
        num: 'CL-SHP-000127',
        qty: 200,
        status: 'SCHEDULED',
        mode: 'ISO_TANK_TRUCK',
        ref: 'CLTRK-[#11D89F]',
        orig: 'Vapi Capture Station',
        dest: 'Dahej Industrial Estate',
        dist: 180,
      },
    ];

    for (let i = 0; i < extraShipmentsData.length; i++) {
      const item = extraShipmentsData[i];
      const check = await client.query('SELECT id FROM shipments WHERE shipment_number = $1', [item.num]);
      if (check.rows.length === 0) {
        const pId = providerIds[(i + 1) % providerIds.length];
        const targetOrder = ordersRes.rows[i % ordersRes.rows.length];

        const qRes = await client.query(
          `INSERT INTO logistics_quotes (
            order_id, provider_organization_id, distance_km, estimated_duration_minutes,
            transport_mode, base_cost, fuel_surcharge, handling_cost, other_cost, total_cost,
            currency, estimated_co2e_kg, valid_until, status
          ) VALUES (
            $1, $2, $3, 180,
            $4, 28000.00, 3000.00, 1500.00, 500.00, 33000.00,
            'INR', 2100.00, NOW() + INTERVAL '7 days', 'ACCEPTED'
          ) RETURNING id`,
          [targetOrder.id, pId, item.dist, item.mode]
        );

        const sRes = await client.query(
          `INSERT INTO shipments (
            shipment_number, order_id, logistics_provider_id, quote_id,
            quantity, quantity_unit, quantity_tons,
            scheduled_pickup_at, estimated_delivery_at,
            distance_km, estimated_distance_km, transport_mode, tracking_reference,
            destination_address, status, exception_reason
          ) VALUES (
            $1, $2, $3, $4,
            $5, 'tonne', $5,
            NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day',
            $6, $6, $7, $8,
            $9, $10, $11
          ) RETURNING id`,
          [
            item.num,
            targetOrder.id,
            pId,
            qRes.rows[0].id,
            item.qty,
            item.dist,
            item.mode,
            `CLTRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            item.dest,
            item.status,
            item.excReason || null,
          ]
        );

        await client.query(
          `INSERT INTO shipment_tracking_events (shipment_id, event_type, status, event_status, location_name, occurred_at)
           VALUES ($1, 'SHIPMENT_CREATED', $2, $2, $3, NOW() - INTERVAL '2 days')`,
          [sRes.rows[0].id, item.status, item.orig]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Logistics Demo Seed Data Successfully Populated!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error Seeding Logistics Demo Data:', err);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedLogisticsDemoData().then(() => process.exit(0));
}
