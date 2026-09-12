import { query } from '../config/database';

export async function seedVerificationDemo() {
  console.log('🌱 Seeding CarbonLoop Trust Network & Verification Demo Data...');

  // 1. Fetch existing organizations, facilities, listings, and admin users
  const orgsRes = await query(`SELECT id, name FROM organizations LIMIT 5`);
  const orgs = orgsRes.rows;

  if (orgs.length === 0) {
    console.log('⚠️ No organizations found. Run core seeds first.');
    return;
  }

  const adminUserRes = await query(`SELECT id FROM users WHERE email LIKE '%admin%' LIMIT 1`);
  const adminUserId = adminUserRes.rows[0]?.id || (await query(`SELECT id FROM users LIMIT 1`)).rows[0]?.id;

  const emitterOrg = orgs.find((o) => o.name.includes('TerraCem') || o.name.includes('Emitter')) || orgs[0];
  const secondOrg = orgs[1] || orgs[0];

  const facRes = await query(`SELECT id, name FROM facilities WHERE organization_id = $1 LIMIT 2`, [emitterOrg.id]);
  const facs = facRes.rows;
  const emitterFac = facs[0];

  const listingsRes = await query(`SELECT id, listing_code, purity_percentage FROM co2_listings WHERE organization_id = $1 LIMIT 3`, [emitterOrg.id]);
  const listings = listingsRes.rows;

  // 2. Create Documents metadata
  const doc1Res = await query(
    `INSERT INTO documents (organization_id, facility_id, uploaded_by, document_type, file_name, storage_key, mime_type, file_size, checksum, description, status, verified_at)
     VALUES ($1, $2, $3, 'CO2_PURITY_CERTIFICATE', 'terracem-purity-assay-2026.pdf', 'demo-key-001.pdf', 'application/pdf', 1048576, 'sha256-demo-001', 'Certified gas chromatography laboratory assay report', 'VERIFIED', NOW())
     RETURNING id`,
    [emitterOrg.id, emitterFac?.id || null, adminUserId]
  );
  const doc1Id = doc1Res.rows[0].id;

  const doc2Res = await query(
    `INSERT INTO documents (organization_id, facility_id, uploaded_by, document_type, file_name, storage_key, mime_type, file_size, checksum, description, status)
     VALUES ($1, $2, $3, 'COMPANY_REGISTRATION', 'terracem-corporate-license-2026.pdf', 'demo-key-002.pdf', 'application/pdf', 2097152, 'sha256-demo-002', 'State industrial license & corporate registration', 'UNDER_REVIEW')
     RETURNING id`,
    [emitterOrg.id, emitterFac?.id || null, adminUserId]
  );
  const doc2Id = doc2Res.rows[0].id;

  const doc3Res = await query(
    `INSERT INTO documents (organization_id, facility_id, uploaded_by, document_type, file_name, storage_key, mime_type, file_size, checksum, description, status)
     VALUES ($1, NULL, $2, 'FACILITY_LICENSE', 'greenforge-operating-license.pdf', 'demo-key-003.pdf', 'application/pdf', 1572864, 'sha256-demo-003', 'Environmental compliance certificate', 'UPLOADED')
     RETURNING id`,
    [secondOrg.id, adminUserId]
  );
  const doc3Id = doc3Res.rows[0].id;

  // 3. Link document to listing
  if (listings[0]) {
    await query(
      `INSERT INTO co2_listing_documents (listing_id, document_id, document_role)
       VALUES ($1, $2, 'purity_proof')
       ON CONFLICT (listing_id, document_id) DO NOTHING`,
      [listings[0].id, doc1Id]
    );

    // 4. Create CO2 Quality Record (Declared 99.5% vs Verified 99.47%)
    await query(
      `INSERT INTO co2_quality_records (listing_id, document_id, purity_percentage, measurement_date, laboratory_name, test_method, sample_reference, notes, verified_by)
       VALUES ($1, $2, 99.47, CURRENT_DATE - INTERVAL '10 days', 'Gujarat Chemical Analysis Lab', 'GC-TCD Gas Chromatography', 'SAMP-2026-09-88', 'Certified chemical assay confirms high industrial purity.', $3)
       ON CONFLICT DO NOTHING`,
      [listings[0].id, doc1Id, adminUserId]
    );

    // Update listing verification status & latest_verified_purity
    await query(
      `UPDATE co2_listings 
       SET verification_status = 'VERIFIED', verified_at = NOW(), verified_by = $2, latest_verified_purity = 99.47
       WHERE id = $1`,
      [listings[0].id, adminUserId]
    );
  }

  // Update organization verification status
  await query(
    `UPDATE organizations SET verification_status = 'VERIFIED', verified_at = NOW(), verified_by = $2 WHERE id = $1`,
    [emitterOrg.id, adminUserId]
  );

  if (emitterFac) {
    await query(
      `UPDATE facilities SET verification_status = 'VERIFIED', verified_at = NOW(), verified_by = $2 WHERE id = $1`,
      [emitterFac.id, adminUserId]
    );
  }

  // 5. Create Verification Requests & History
  // Request 1: Approved Listing Verification
  const req1Res = await query(
    `INSERT INTO verification_requests (
      organization_id, facility_id, listing_id, document_id, requested_by, request_type, verification_type, status, reviewed_by, reviewed_at, review_notes, submitted_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, 'CO2_PURITY', 'CO2_PURITY', 'VERIFIED', $5, NOW(), 'Assay certificate verified by chemical reviewer.', NOW() - INTERVAL '5 days', NOW())
    RETURNING id`,
    [emitterOrg.id, emitterFac?.id || null, listings[0]?.id || null, doc1Id, adminUserId]
  );
  const req1Id = req1Res.rows[0].id;

  await query(
    `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
     VALUES 
      ($1, NULL, 'SUBMITTED', $2, 'Verification request submitted.'),
      ($1, 'SUBMITTED', 'UNDER_REVIEW', $2, 'Reviewer assigned.'),
      ($1, 'UNDER_REVIEW', 'VERIFIED', $2, 'Assay certificate approved.')`,
    [req1Id, adminUserId]
  );

  // Request 2: Under Review Organization Verification
  const req2Res = await query(
    `INSERT INTO verification_requests (
      organization_id, facility_id, document_id, requested_by, request_type, verification_type, status, reviewed_by, submitted_at, updated_at
    ) VALUES ($1, $2, $3, $4, 'ORGANIZATION', 'ORGANIZATION', 'UNDER_REVIEW', $4, NOW() - INTERVAL '2 days', NOW())
    RETURNING id`,
    [emitterOrg.id, emitterFac?.id || null, doc2Id, adminUserId]
  );
  const req2Id = req2Res.rows[0].id;

  await query(
    `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
     VALUES 
      ($1, NULL, 'SUBMITTED', $2, 'Corporate verification request submitted.'),
      ($1, 'SUBMITTED', 'UNDER_REVIEW', $2, 'Document review in progress.')`,
    [req2Id, adminUserId]
  );

  // Request 3: Pending / Submitted Facility Verification
  const req3Res = await query(
    `INSERT INTO verification_requests (
      organization_id, document_id, requested_by, request_type, verification_type, status, submitted_at, updated_at
    ) VALUES ($1, $2, $3, 'FACILITY', 'FACILITY', 'SUBMITTED', NOW() - INTERVAL '1 day', NOW())
    RETURNING id`,
    [secondOrg.id, doc3Id, adminUserId]
  );
  const req3Id = req3Res.rows[0].id;

  await query(
    `INSERT INTO verification_history (verification_request_id, from_status, to_status, changed_by, notes)
     VALUES ($1, NULL, 'SUBMITTED', $2, 'Facility license submitted for verification.')`,
    [req3Id, adminUserId]
  );

  console.log('✅ Trust Network & Verification Demo Data Seeded Successfully!');
}

if (require.main === module) {
  seedVerificationDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error seeding verification demo data:', err);
      process.exit(1);
    });
}
