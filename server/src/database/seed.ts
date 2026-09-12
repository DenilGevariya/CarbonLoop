import bcrypt from 'bcryptjs';
import { pool, closePool } from '../config/database';

// Fixed deterministic UUIDs (valid hex characters 0-9, a-f)
const IDS = {
  // Roles
  ROLE_ADMIN: '10000000-0000-4000-a000-000000000001',
  ROLE_EMITTER: '10000000-0000-4000-a000-000000000002',
  ROLE_UTILIZER: '10000000-0000-4000-a000-000000000003',
  ROLE_LOGISTICS: '10000000-0000-4000-a000-000000000004',
  ROLE_REGULATOR: '10000000-0000-4000-a000-000000000005',

  // Users
  USER_ADMIN: '20000000-0000-4000-a000-000000000001',
  USER_TERRACEM: '20000000-0000-4000-a000-000000000002',
  USER_NOVASTEEL: '20000000-0000-4000-a000-000000000003',
  USER_GREENFORGE: '20000000-0000-4000-a000-000000000004',
  USER_CARBONARC: '20000000-0000-4000-a000-000000000005',
  USER_ALGAENOVA: '20000000-0000-4000-a000-000000000006',
  USER_TRANSCARBON: '20000000-0000-4000-a000-000000000007',
  USER_REGULATOR: '20000000-0000-4000-a000-000000000008',

  // Organizations
  ORG_TERRACEM: '30000000-0000-4000-a000-000000000001',
  ORG_NOVASTEEL: '30000000-0000-4000-a000-000000000002',
  ORG_BLUESKY: '30000000-0000-4000-a000-000000000003',
  ORG_GREENFORGE: '30000000-0000-4000-a000-000000000004',
  ORG_CARBONARC: '30000000-0000-4000-a000-000000000005',
  ORG_ALGAENOVA: '30000000-0000-4000-a000-000000000006',
  ORG_TRANSCARBON: '30000000-0000-4000-a000-000000000007',
  ORG_REGULATOR: '30000000-0000-4000-a000-000000000008',

  // Facilities
  FAC_AHMEDABAD_CEMENT: '40000000-0000-4000-a000-000000000001',
  FAC_HAZIRA_STEEL: '40000000-0000-4000-a000-000000000002',
  FAC_SURAT_POWER: '40000000-0000-4000-a000-000000000003',
  FAC_VADODARA_MINERAL: '40000000-0000-4000-a000-000000000004',
  FAC_DAHEJ_REFINE: '40000000-0000-4000-a000-000000000005',
  FAC_HAZIRA_BIO: '40000000-0000-4000-a000-000000000006',

  // Documents
  DOC_TERRACEM_PURITY: '50000000-0000-4000-a000-000000000001',
  DOC_NOVASTEEL_LICENSE: '50000000-0000-4000-a000-000000000002',
  DOC_CONTRACT_001: '50000000-0000-4000-a000-000000000003',

  // Listings
  LIST_01: '60000000-0000-4000-a000-000000000001',
  LIST_02: '60000000-0000-4000-a000-000000000002',
  LIST_03: '60000000-0000-4000-a000-000000000003',
  LIST_04: '60000000-0000-4000-a000-000000000004',
  LIST_05: '60000000-0000-4000-a000-000000000005',
  LIST_06: '60000000-0000-4000-a000-000000000006',
  LIST_07: '60000000-0000-4000-a000-000000000007',
  LIST_08: '60000000-0000-4000-a000-000000000008',
  LIST_09: '60000000-0000-4000-a000-000000000009',
  LIST_10: '60000000-0000-4000-a000-000000000010',
  LIST_11: '60000000-0000-4000-a000-000000000011',
  LIST_12: '60000000-0000-4000-a000-000000000012',

  // Buyer Requirements
  REQ_01: '70000000-0000-4000-a000-000000000001',
  REQ_02: '70000000-0000-4000-a000-000000000002',
  REQ_03: '70000000-0000-4000-a000-000000000003',
  REQ_04: '70000000-0000-4000-a000-000000000004',
  REQ_05: '70000000-0000-4000-a000-000000000005',
  REQ_06: '70000000-0000-4000-a000-000000000006',
  REQ_07: '70000000-0000-4000-a000-000000000007',
  REQ_08: '70000000-0000-4000-a000-000000000008',
  REQ_09: '70000000-0000-4000-a000-000000000009',
  REQ_10: '70000000-0000-4000-a000-000000000010',

  // Matches
  MATCH_01: '80000000-0000-4000-a000-000000000001',
  MATCH_02: '80000000-0000-4000-a000-000000000002',
  MATCH_03: '80000000-0000-4000-a000-000000000003',

  // Inquiries & Offers
  INQ_01: '90000000-0000-4000-a000-000000000001',
  OFFER_01: 'a0000000-0000-4000-a000-000000000001',

  // Orders, Shipments, Invoices, Contracts
  ORDER_01: 'b0000000-0000-4000-a000-000000000001',
  SHIPMENT_01: 'c0000000-0000-4000-a000-000000000001',
  INVOICE_01: 'd0000000-0000-4000-a000-000000000001',
  CONTRACT_001: 'e0000000-0000-4000-a000-000000000001',
};

async function seed() {
  console.log('🌱 Starting CarbonLoop comprehensive development seed process...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. ROLES
    console.log('Inserting Roles...');
    const roleValues = [
      [IDS.ROLE_ADMIN, 'platform_admin', 'Full platform administrator with compliance overview'],
      [IDS.ROLE_EMITTER, 'emitter', 'CO2 Industrial Emitter offering captured carbon supply'],
      [IDS.ROLE_UTILIZER, 'utilizer', 'Carbon utilizer sourcing CO2 as feedstock'],
      [IDS.ROLE_LOGISTICS, 'logistics_provider', 'Logistics and freight transport partner'],
      [IDS.ROLE_REGULATOR, 'regulator', 'Government and environmental regulator'],
      ['10000000-0000-4000-a000-000000000006', 'ADMIN', 'System Administrator'],
      ['10000000-0000-4000-a000-000000000007', 'EMITTER', 'CO2 Industrial Emitter'],
      ['10000000-0000-4000-a000-000000000008', 'BUYER', 'CO2 Industrial Buyer'],
      ['10000000-0000-4000-a000-000000000009', 'LOGISTICS', 'Logistics Transport Partner']
    ];

    for (const r of roleValues) {
      await client.query(
        `INSERT INTO roles (id, name, description) VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;`,
        r
      );
    }

    // 2. USERS (Hashed password for 'Password123!')
    console.log('Inserting Demo Users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const DEMO_USER_IDS = {
      EMITTER: '20000000-0000-4000-a000-000000000009',
      UTILIZER: '20000000-0000-4000-a000-000000000010',
      LOGISTICS: '20000000-0000-4000-a000-000000000011',
      ADMIN: '20000000-0000-4000-a000-000000000012',
    };

    const userValues = [
      [IDS.USER_ADMIN, 'admin@carbonloop.io', hashedPassword, 'Aarav', 'Sharma', '+91 98765 43210', true, true],
      [IDS.USER_TERRACEM, 'supply@terracem.com', hashedPassword, 'Rajesh', 'Patel', '+91 98234 56789', true, true],
      [IDS.USER_NOVASTEEL, 'supply@novasteel.com', hashedPassword, 'Vikram', 'Sengupta', '+91 98345 67890', true, true],
      [IDS.USER_GREENFORGE, 'procurement@greenforge.com', hashedPassword, 'Priya', 'Deshmukh', '+91 98456 78901', true, true],
      [IDS.USER_CARBONARC, 'procurement@carbonarc.com', hashedPassword, 'Ananya', 'Roy', '+91 98567 89012', true, true],
      [IDS.USER_ALGAENOVA, 'procurement@algaenova.com', hashedPassword, 'Siddharth', 'Nair', '+91 98678 90123', true, true],
      [IDS.USER_TRANSCARBON, 'logistics@transcarbon.com', hashedPassword, 'Karan', 'Mehta', '+91 98789 01234', true, true],
      [IDS.USER_REGULATOR, 'regulator@gpcb.gov.in', hashedPassword, 'Dr. Sunita', 'Rao', '+91 98890 12345', true, true],
      // Standard local demo logins
      [DEMO_USER_IDS.EMITTER, 'demo.emitter@carbonloop.local', hashedPassword, 'Demo Emitter', 'User', '+91 90000 00001', true, true],
      [DEMO_USER_IDS.UTILIZER, 'demo.utilizer@carbonloop.local', hashedPassword, 'Demo Utilizer', 'User', '+91 90000 00002', true, true],
      [DEMO_USER_IDS.LOGISTICS, 'demo.logistics@carbonloop.local', hashedPassword, 'Demo Logistics', 'User', '+91 90000 00003', true, true],
      [DEMO_USER_IDS.ADMIN, 'demo.admin@carbonloop.local', hashedPassword, 'Demo Admin', 'User', '+91 90000 00004', true, true],
    ];

    for (const u of userValues) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified, onboarding_completed_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (email) DO UPDATE SET 
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = EXCLUDED.phone,
           onboarding_completed_at = NOW();`,
        u
      );
    }

    // Assign User Roles
    const userRoleMappings = [
      [IDS.USER_ADMIN, IDS.ROLE_ADMIN],
      [IDS.USER_TERRACEM, IDS.ROLE_EMITTER],
      [IDS.USER_NOVASTEEL, IDS.ROLE_EMITTER],
      [IDS.USER_GREENFORGE, IDS.ROLE_UTILIZER],
      [IDS.USER_CARBONARC, IDS.ROLE_UTILIZER],
      [IDS.USER_ALGAENOVA, IDS.ROLE_UTILIZER],
      [IDS.USER_TRANSCARBON, IDS.ROLE_LOGISTICS],
      [IDS.USER_REGULATOR, IDS.ROLE_REGULATOR],
      [DEMO_USER_IDS.EMITTER, IDS.ROLE_EMITTER],
      [DEMO_USER_IDS.UTILIZER, IDS.ROLE_UTILIZER],
      [DEMO_USER_IDS.LOGISTICS, IDS.ROLE_LOGISTICS],
      [DEMO_USER_IDS.ADMIN, IDS.ROLE_ADMIN],
    ];

    for (const [uId, rId] of userRoleMappings) {
      await client.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [uId, rId]
      );
    }

    // 3. ORGANIZATIONS
    console.log('Inserting Organizations...');
    const orgValues = [
      [IDS.ORG_TERRACEM, 'TerraCem Industries', 'TerraCem Cement Private Limited', 'terracem-industries', 'emitter', 'Cement & Concrete', 'CIN-L26940GJ2015PLC0821', 'Leading sustainable cement manufacturer in Western India.', 'https://terracem.demo', 'supply@terracem.com', '+91 98234 56789', '24AAACT1234A1Z5', 'Gujarat', 'Ahmedabad', '382445', 'GIDC Phase IV, Vatva', 22.9583, 72.6369, 'verified'],
      [IDS.ORG_NOVASTEEL, 'NovaSteel Energy', 'NovaSteel Heavy Industries Ltd', 'novasteel-energy', 'emitter', 'Steel Manufacturing', 'CIN-L27100MH2012PLC0944', 'Integrated steel plant capturing high-volume industrial CO2 flue gases.', 'https://novasteel.demo', 'supply@novasteel.com', '+91 98345 67890', '24AAACN5678B1Z2', 'Gujarat', 'Surat', '394270', 'Hazira Industrial Zone', 21.1167, 72.6500, 'verified'],
      [IDS.ORG_BLUESKY, 'BlueSky Power', 'BlueSky Thermal Energy Corp', 'bluesky-power', 'emitter', 'Power Generation', 'CIN-L40100GJ2018PLC0999', 'Clean power producer utilizing post-combustion carbon capture.', 'https://bluesky.demo', 'contact@bluesky.demo', '+91 98111 22233', '24AAACB9999C1Z9', 'Gujarat', 'Surat', '395001', 'Surat Thermal Power Complex', 21.1702, 72.8311, 'verified'],
      [IDS.ORG_GREENFORGE, 'GreenForge Materials', 'GreenForge Sustainable Infrastructure Ltd', 'greenforge-materials', 'utilizer', 'Sustainable Construction', 'CIN-L45200GJ2019PLC1022', 'Pioneering mineralized concrete building products.', 'https://greenforge.demo', 'procurement@greenforge.com', '+91 98456 78901', '24AAACG1111D1Z8', 'Gujarat', 'Vadodara', '391340', 'Nandesari GIDC', 22.4110, 73.0890, 'verified'],
      [IDS.ORG_CARBONARC, 'CarbonArc Fuels', 'CarbonArc Synthetic Energy Solutions', 'carbonarc-fuels', 'utilizer', 'Synthetic E-Fuels', 'CIN-L23200KA2020PLC1188', 'Producing drop-in e-methanol and aviation e-fuels from captured CO2.', 'https://carbonarc.demo', 'procurement@carbonarc.com', '+91 98567 89012', '24AAACC2222E1Z7', 'Gujarat', 'Dahej', '392130', 'PCPIR Region', 21.7118, 72.5312, 'verified'],
      [IDS.ORG_ALGAENOVA, 'AlgaeNova Labs', 'AlgaeNova Bio-Technologies Pvt Ltd', 'algaenova-labs', 'utilizer', 'Bio-Technologies', 'CIN-L73100TN2021PLC1240', 'Algae biomanufacturing for protein meal and biplastics using gaseous CO2.', 'https://algaenova.demo', 'procurement@algaenova.com', '+91 98678 90123', '24AAACA3333F1Z6', 'Gujarat', 'Surat', '394270', 'Hazira Coastal Bio Zone', 21.1000, 72.6400, 'verified'],
      [IDS.ORG_TRANSCARBON, 'TransCarbon Logistics', 'TransCarbon Cryogenic Transport Ltd', 'transcarbon-logistics', 'logistics_provider', 'Cryogenic Freight', 'CIN-L60200GJ2018PLC0755', 'Specialized ISO tank transport and pressurized CO2 distribution fleet.', 'https://transcarbon.demo', 'logistics@transcarbon.com', '+91 98789 01234', '24AAACT4444G1Z5', 'Gujarat', 'Ahmedabad', '380015', 'SG Highway Freight Hub', 23.0225, 72.5714, 'verified'],
      [IDS.ORG_REGULATOR, 'GPCB Regulatory Oversight', 'Gujarat Pollution Control Board Oversight Unit', 'gpcb-regulatory', 'regulator', 'Environmental Oversight', 'GOV-GJ-2026-REG', 'State environmental monitoring and carbon accounting verification authority.', 'https://gpcb.gujarat.gov.in', 'regulator@gpcb.gov.in', '+91 98890 12345', 'GOV24AAACG5555H1Z4', 'Gujarat', 'Gandhinagar', '382010', 'Sector 10A Environmental Bhavan', 23.2156, 72.6369, 'verified']
    ];

    for (const o of orgValues) {
      await client.query(
        `INSERT INTO organizations (id, name, legal_name, slug, org_type, industry, registration_number, description, website, email, phone, tax_identifier, state, city, postal_code, address_line1, latitude, longitude, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (slug) DO UPDATE SET 
           name = EXCLUDED.name,
           legal_name = EXCLUDED.legal_name,
           description = EXCLUDED.description;`,
        o
      );
    }

    // Organization Members
    const members = [
      [IDS.ORG_TERRACEM, IDS.USER_TERRACEM, 'Head of Carbon Operations', true],
      [IDS.ORG_NOVASTEEL, IDS.USER_NOVASTEEL, 'VP Sustainability', true],
      [IDS.ORG_GREENFORGE, IDS.USER_GREENFORGE, 'Chief Procurement Officer', true],
      [IDS.ORG_CARBONARC, IDS.USER_CARBONARC, 'Feedstock Sourcing Lead', true],
      [IDS.ORG_ALGAENOVA, IDS.USER_ALGAENOVA, 'Bio-Refinery Director', true],
      [IDS.ORG_TRANSCARBON, IDS.USER_TRANSCARBON, 'Fleet Operations Manager', true],
      [IDS.ORG_REGULATOR, IDS.USER_REGULATOR, 'Senior Carbon Inspector', true],
      [IDS.ORG_TERRACEM, DEMO_USER_IDS.EMITTER, 'Demo Emitter Specialist', false],
      [IDS.ORG_GREENFORGE, DEMO_USER_IDS.UTILIZER, 'Demo Off-Take Specialist', false],
      [IDS.ORG_TRANSCARBON, DEMO_USER_IDS.LOGISTICS, 'Demo Logistics Operator', false],
      [IDS.ORG_REGULATOR, DEMO_USER_IDS.ADMIN, 'Demo System Inspector', false],
    ];

    for (const [oId, uId, title, isPrimary] of members) {
      await client.query(
        `INSERT INTO organization_members (organization_id, user_id, job_title, is_primary_contact)
         VALUES ($1, $2, $3, $4) ON CONFLICT (organization_id, user_id) DO NOTHING;`,
        [oId, uId, title, isPrimary]
      );
    }

    // 4. FACILITIES
    console.log('Inserting Facilities...');
    const facilityValues = [
      [IDS.FAC_AHMEDABAD_CEMENT, IDS.ORG_TERRACEM, 'Ahmedabad Mega Cement Plant', 'FAC-TC-001', 'Cement Works with Amine Absorption Capture', 'Cement Works', 'GIDC Phase IV, Vatva', 'Ahmedabad', 'Gujarat', '382445', 22.9583, 72.6369, 'Rajesh Patel', 'supply@terracem.com', '+91 98234 56789', 120000.00, 'Amine Gas Absorption'],
      [IDS.FAC_HAZIRA_STEEL, IDS.ORG_NOVASTEEL, 'Hazira Steel & Power Hub', 'FAC-NS-001', 'Blast Furnace Steel Works with Flue Capture', 'Steel Works', 'Hazira Industrial Zone', 'Surat', 'Gujarat', '394270', 21.1167, 72.6500, 'Vikram Sengupta', 'supply@novasteel.com', '+91 98345 67890', 250000.00, 'Direct Flue Gas Capture'],
      [IDS.FAC_SURAT_POWER, IDS.ORG_BLUESKY, 'Surat Thermal Capture Unit', 'FAC-BS-001', 'Flue gas desulfurization and carbon capture unit', 'Power Station', 'Surat Thermal Power Complex', 'Surat', 'Gujarat', '395001', 21.1702, 72.8311, 'Anil Verma', 'contact@bluesky.demo', '+91 98111 22233', 180000.00, 'Post-Combustion Chilled Ammonia'],
      [IDS.FAC_VADODARA_MINERAL, IDS.ORG_GREENFORGE, 'Vadodara Mineralization Unit', 'FAC-GF-001', 'Accelerated carbonation concrete curing plant', 'Concrete Curing Facility', 'Nandesari GIDC', 'Vadodara', 'Gujarat', '391340', 22.4110, 73.0890, 'Priya Deshmukh', 'procurement@greenforge.com', '+91 98456 78901', 45000.00, 'Carbonation Chamber Tech'],
      [IDS.FAC_DAHEJ_REFINE, IDS.ORG_CARBONARC, 'Dahej E-Fuel Refinery', 'FAC-CA-001', 'Synthetic Methanol and E-Fuel Synthesis Plant', 'Chemical Refinery', 'PCPIR Region', 'Dahej', 'Gujarat', '392130', 21.7118, 72.5312, 'Ananya Roy', 'procurement@carbonarc.com', '+91 98567 89012', 80000.00, 'Direct Catalytic Hydrogenation'],
      [IDS.FAC_HAZIRA_BIO, IDS.ORG_ALGAENOVA, 'Hazira Microalgae Cultivation Hub', 'FAC-AN-001', 'High-density raceway pond algae cultivation facility', 'Bio-Refinery', 'Hazira Coastal Bio Zone', 'Surat', 'Gujarat', '394270', 21.1000, 72.6400, 'Siddharth Nair', 'procurement@algaenova.com', '+91 98678 90123', 30000.00, 'Photosynthetic Fixation']
    ];

    for (const f of facilityValues) {
      await client.query(
        `INSERT INTO facilities (id, organization_id, name, facility_code, description, facility_type, address, address_line1, city, state, postal_code, latitude, longitude, contact_name, contact_email, contact_phone, annual_co2_capacity_tons, capture_technology)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (organization_id, facility_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`,
        f
      );
    }

    // 5. DOCUMENTS
    console.log('Inserting Generic Documents...');
    const docValues = [
      [IDS.DOC_TERRACEM_PURITY, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, IDS.USER_TERRACEM, 'purity_certificate', 'Purity_Analysis_Batch_2026A.pdf', 'docs/terracem/purity_2026a.pdf', 'application/pdf', 1048576, 'a1b2c3d4e5f6', 'ISO 17025 certified purity analysis confirming 99.5% CO2 concentration.'],
      [IDS.DOC_NOVASTEEL_LICENSE, IDS.ORG_NOVASTEEL, IDS.FAC_HAZIRA_STEEL, IDS.USER_NOVASTEEL, 'facility_license', 'GPCB_Capture_Permit_2026.pdf', 'docs/novasteel/gpcb_permit.pdf', 'application/pdf', 2097152, 'f6e5d4c3b2a1', 'Environmental clearance permit for high-volume industrial CO2 recovery.'],
      [IDS.DOC_CONTRACT_001, IDS.ORG_GREENFORGE, IDS.FAC_VADODARA_MINERAL, IDS.USER_GREENFORGE, 'contract', 'Supply_Agreement_GF_TC_2026.pdf', 'docs/contracts/agreement_001.pdf', 'application/pdf', 3145728, '9876543210ab', 'Bilateral industrial CO2 supply contract between TerraCem and GreenForge.']
    ];

    for (const d of docValues) {
      await client.query(
        `INSERT INTO documents (id, organization_id, facility_id, uploaded_by, document_type, file_name, storage_key, mime_type, file_size, checksum, description, verified_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO NOTHING;`,
        d
      );
    }

    // Facility Certifications
    await client.query(
      `INSERT INTO facility_certifications (facility_id, certification_name, certificate_number, issuing_body, issuing_authority, issued_at, expires_at, status, document_id)
       VALUES 
       ('${IDS.FAC_AHMEDABAD_CEMENT}', 'ISO 14064 Carbon Verification', 'CERT-TC-14064', 'Bureau Veritas India', 'Bureau Veritas India', '2025-01-15', '2028-01-15', 'ACTIVE', '${IDS.DOC_TERRACEM_PURITY}'),
       ('${IDS.FAC_HAZIRA_STEEL}', 'GPCB Industrial Emission Compliance', 'GPCB-CERT-2026', 'Gujarat Pollution Control Board', 'Gujarat Pollution Control Board', '2025-06-01', '2027-06-01', 'ACTIVE', '${IDS.DOC_NOVASTEEL_LICENSE}')
       ON CONFLICT DO NOTHING;`
    );

    // 6. CO2 SUPPLY LISTINGS (12 Realistic Industrial Supply Listings)
    console.log('Inserting CO2 Listings...');
    const listingValues = [
      [IDS.LIST_01, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, 'CL-SUP-000101', 'High-Purity Liquid CO2 (Food & Industrial Grade)', 'Continuous flue capture stream purified via chemical absorption. Delivered at high pressure and sub-zero temperature.', 1250.00, 1250.00, 'tonne', 99.50, 'liquid', 'Amine Gas Absorption', 'Flue Gas Calcination', -15.00, 25.00, 20.00, 4800.00, 'INR', '2026-09-01', '2026-12-31', true, true, 'PUBLISHED', IDS.USER_TERRACEM],
      [IDS.LIST_02, IDS.ORG_NOVASTEEL, IDS.FAC_HAZIRA_STEEL, 'CL-SUP-000102', 'Compressed Gaseous CO2 Stream', 'Bulk industrial gaseous CO2 direct from steel manufacturing process stream. Ideal for chemical feedstocks.', 3400.00, 3400.00, 'tonne', 98.20, 'gaseous', 'Direct Flue Capture', 'Blast Furnace Gas', 30.00, 16.00, 50.00, 4200.00, 'INR', '2026-09-01', '2027-03-31', true, true, 'PUBLISHED', IDS.USER_NOVASTEEL],
      [IDS.LIST_03, IDS.ORG_BLUESKY, IDS.FAC_SURAT_POWER, 'CL-SUP-000103', 'Supercritical CO2 Stream', 'Supercritical carbon dioxide stream compressed for pipeline or high-pressure ISO tanker transfer.', 2800.00, 2800.00, 'tonne', 99.10, 'supercritical', 'Post-Combustion Chilled Ammonia', 'Thermal Flue Gas', 35.00, 75.00, 40.00, 4500.00, 'INR', '2026-09-15', '2026-12-15', true, false, 'PUBLISHED', IDS.USER_ADMIN],
      [IDS.LIST_04, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, 'CL-SUP-000104', 'Ultra-Pure Beverage-Grade CO2', '99.9% purity verified CO2 suitable for carbonated beverages and pharmaceutical applications.', 600.00, 600.00, 'tonne', 99.90, 'liquid', 'Cryogenic Distillation', 'Calcination Off-Gas', -20.00, 30.00, 10.00, 5600.00, 'INR', '2026-10-01', '2027-01-31', true, true, 'PUBLISHED', IDS.USER_TERRACEM],
      [IDS.LIST_05, IDS.ORG_NOVASTEEL, IDS.FAC_HAZIRA_STEEL, 'CL-SUP-000105', 'Solid Dry Ice Pellets (Industrial Cleaning Grade)', 'Pelletized solid carbon dioxide for dry ice blasting and cold-chain thermal regulation.', 150.00, 150.00, 'tonne', 99.00, 'solid_dry_ice', 'Direct Compression', 'Steel Off-Gas', -78.50, 1.00, 2.00, 7200.00, 'INR', '2026-09-10', '2026-11-30', true, true, 'PUBLISHED', IDS.USER_NOVASTEEL],
      [IDS.LIST_06, IDS.ORG_BLUESKY, IDS.FAC_SURAT_POWER, 'CL-SUP-000106', 'Continuous Flue Gas Stream (Raw Process Feed)', 'Raw captured flue gas stream direct from Surat plant for heavy chemical synthesis.', 5000.00, 5000.00, 'tonne', 95.50, 'gaseous', 'Direct Flue Capture', 'Power Plant Boiler', 40.00, 10.00, 100.00, 3800.00, 'INR', '2026-09-01', '2027-06-30', true, false, 'PUBLISHED', IDS.USER_ADMIN],
      [IDS.LIST_07, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, 'CL-SUP-000107', 'High-Pressure Compressed Gaseous CO2 (Draft)', 'Upcoming stream undergoing purity verification ahead of commercial off-take.', 950.00, 950.00, 'tonne', 98.80, 'gaseous', 'Amine Gas Absorption', 'Calcination Off-Gas', 25.00, 45.00, 25.00, 4400.00, 'INR', '2026-11-01', '2027-02-28', true, true, 'DRAFT', IDS.USER_TERRACEM],
      [IDS.LIST_08, IDS.ORG_NOVASTEEL, IDS.FAC_HAZIRA_STEEL, 'CL-SUP-000108', 'Sub-Zero Liquid CO2 Tanker Bulk Batch (Paused)', 'Temporarily paused due to scheduled cryogenic pump maintenance at Hazira facility.', 1800.00, 1800.00, 'tonne', 99.30, 'liquid', 'Cryogenic Compression', 'Blast Furnace Gas', -18.00, 28.00, 30.00, 4900.00, 'INR', '2026-09-15', '2027-01-15', true, true, 'PAUSED', IDS.USER_NOVASTEEL],
      [IDS.LIST_09, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, 'CL-SUP-000109', 'Refined Chemical-Grade Supercritical CO2 (Exhausted)', 'Supercritical CO2 volume fully committed under quarterly bilateral agreements.', 400.00, 0.00, 'tonne', 99.70, 'supercritical', 'Post-Combustion Solvent', 'Kiln Flue Stream', 38.00, 80.00, 50.00, 5100.00, 'INR', '2026-08-01', '2026-09-30', true, true, 'EXHAUSTED', IDS.USER_TERRACEM],
      [IDS.LIST_10, IDS.ORG_BLUESKY, IDS.FAC_SURAT_POWER, 'CL-SUP-000110', 'High-Volume Post-Combustion CO2 Feed', 'High-volume CO2 feedstock suitable for synthetic fuel and e-kerosene production.', 2100.00, 2100.00, 'tonne', 97.50, 'gaseous', 'Post-Combustion Chilled Ammonia', 'Thermal Gas Turbine', 32.00, 14.00, 40.00, 4100.00, 'INR', '2026-10-01', '2027-04-30', true, true, 'PUBLISHED', IDS.USER_ADMIN],
      [IDS.LIST_11, IDS.ORG_NOVASTEEL, IDS.FAC_HAZIRA_STEEL, 'CL-SUP-000111', 'Cryogenic Liquid CO2 Off-Take Batch', 'Ultra-clean liquid carbon dioxide captured from direct reduction iron manufacturing.', 750.00, 750.00, 'tonne', 99.60, 'liquid', 'Cryogenic Separation', 'DRI Process Off-Gas', -16.00, 26.00, 15.00, 5300.00, 'INR', '2026-09-20', '2026-12-31', true, true, 'PUBLISHED', IDS.USER_NOVASTEEL],
      [IDS.LIST_12, IDS.ORG_TERRACEM, IDS.FAC_AHMEDABAD_CEMENT, 'CL-SUP-000112', 'Industrial Dry Ice Blocks (Expired)', 'Solid CO2 block supply allocation from Q2 operational window.', 200.00, 200.00, 'tonne', 98.90, 'solid_dry_ice', 'Direct Compression', 'Calcination Off-Gas', -78.50, 1.00, 5.00, 6800.00, 'INR', '2026-05-01', '2026-08-31', true, true, 'EXPIRED', IDS.USER_TERRACEM]
    ];

    for (const l of listingValues) {
      await client.query(
        `INSERT INTO co2_listings (id, organization_id, facility_id, listing_code, title, description, available_quantity, remaining_quantity, quantity_unit, purity_percentage, co2_physical_form, capture_method, capture_source, temperature_c, pressure_bar, minimum_order_quantity, price_per_unit, currency, available_from, available_until, delivery_available, pickup_available, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::timestamptz, $20::timestamptz, $21, $22, $23, $24)
         ON CONFLICT (id) DO UPDATE SET 
           listing_code = EXCLUDED.listing_code, 
           title = EXCLUDED.title, 
           price_per_unit = EXCLUDED.price_per_unit, 
           status = EXCLUDED.status,
           available_quantity = EXCLUDED.available_quantity,
           remaining_quantity = EXCLUDED.remaining_quantity,
           purity_percentage = EXCLUDED.purity_percentage,
           co2_physical_form = EXCLUDED.co2_physical_form,
           state_form = EXCLUDED.co2_physical_form;`,
        l
      );

      // Insert status history record
      await client.query(
        `INSERT INTO co2_listing_status_history (listing_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason)
         VALUES ($1, 'DRAFT', 'DRAFT', $2, $2, $3, $3, 'Initial supply setup and declaration')
         ON CONFLICT DO NOTHING;`,
        [l[0], l[22], l[23]]
      );
    }

    // Link Listing Document
    await client.query(
      `INSERT INTO co2_listing_documents (listing_id, document_id, document_role)
       VALUES ('${IDS.LIST_01}', '${IDS.DOC_TERRACEM_PURITY}', 'purity_proof')
       ON CONFLICT DO NOTHING;`
    );

    // 7. BUYER REQUIREMENTS (10 Realistic Demand Requirements)
    console.log('Inserting Buyer Requirements...');
    
    // Fetch utilization type mapping by code
    const utilRes = await client.query(`SELECT id, code FROM co2_utilization_types`);
    const utilMap: Record<string, string> = {};
    utilRes.rows.forEach((row) => {
      utilMap[row.code] = row.id;
    });

    const reqValues = [
      [IDS.REQ_01, IDS.ORG_GREENFORGE, 'CL-REQ-000101', 'Mineralization Feedstock for Low-Carbon Brick Line', 'Require high-purity liquid CO2 for accelerated concrete curing and carbonated block manufacturing in Vadodara.', 500.00, 'tonne', 99.00, 99.90, 'liquid', 'Amine Gas Absorption', 5200.00, 'INR', '2026-09-15', '2026-12-31', true, IDS.FAC_VADODARA_MINERAL, 'high', 'PUBLISHED', IDS.USER_GREENFORGE, 'Concrete Curing', 'Vadodara', 'Gujarat', utilMap['CONCRETE_AND_CONSTRUCTION']],
      [IDS.REQ_02, IDS.ORG_CARBONARC, 'CL-REQ-000102', 'High-Volume Gaseous CO2 for E-Methanol Synthesis', 'Bulk gaseous or supercritical CO2 feedstock for catalytic conversion into synthetic e-methanol.', 2500.00, 'tonne', 98.00, 99.50, 'gaseous', 'Direct Flue Capture', 4500.00, 'INR', '2026-10-01', '2027-03-31', true, IDS.FAC_DAHEJ_REFINE, 'urgent', 'PUBLISHED', IDS.USER_CARBONARC, 'E-Fuels', 'Dahej', 'Gujarat', utilMap['SYNTHETIC_FUEL']],
      [IDS.REQ_03, IDS.ORG_ALGAENOVA, 'CL-REQ-000103', 'Continuous CO2 Gas for Algae Biomanufacturing', 'Low-pressure continuous gaseous CO2 feed to enhance photosynthetic growth rates in microalgae raceway ponds.', 300.00, 'tonne', 95.00, 99.00, 'gaseous', 'Any', 4000.00, 'INR', '2026-09-01', '2026-11-30', true, IDS.FAC_HAZIRA_BIO, 'normal', 'PUBLISHED', IDS.USER_ALGAENOVA, 'Algae Cultivation', 'Surat', 'Gujarat', utilMap['ALGAE']],
      [IDS.REQ_04, IDS.ORG_GREENFORGE, 'CL-REQ-000104', 'High-Purity Dry Ice for Mold Decontamination', 'Dry ice pellets required for precision blast cleaning of automated precast concrete molds.', 50.00, 'tonne', 99.00, 100.00, 'solid_dry_ice', 'Direct Compression', 7500.00, 'INR', '2026-09-20', '2026-10-20', true, IDS.FAC_VADODARA_MINERAL, 'normal', 'PUBLISHED', IDS.USER_GREENFORGE, 'Industrial Cleaning', 'Vadodara', 'Gujarat', utilMap['FOOD_AND_BEVERAGE']],
      [IDS.REQ_05, IDS.ORG_CARBONARC, 'CL-REQ-000105', 'Polymer Polyol Feedstock CO2 Stream', 'High-purity CO2 stream for polycarbonate and polyol synthesis in chemical manufacturing line.', 750.00, 'tonne', 99.20, 99.90, 'liquid', 'Cryogenic Separation', 5800.00, 'INR', '2026-10-15', '2027-01-31', true, IDS.FAC_DAHEJ_REFINE, 'high', 'PUBLISHED', IDS.USER_CARBONARC, 'Chemical Synthesis', 'Dahej', 'Gujarat', utilMap['CHEMICALS']],
      [IDS.REQ_06, IDS.ORG_ALGAENOVA, 'CL-REQ-000106', 'High-Density Algae Pond Carbonation Stream', 'Bulk CO2 feed required for expanding Q4 algae raceway pond production phase.', 400.00, 'tonne', 96.00, 99.00, 'gaseous', 'Direct Flue Capture', 4100.00, 'INR', '2026-11-01', '2027-02-28', true, IDS.FAC_HAZIRA_BIO, 'normal', 'DRAFT', IDS.USER_ALGAENOVA, 'Algae Biorefinery', 'Surat', 'Gujarat', utilMap['ALGAE']],
      [IDS.REQ_07, IDS.ORG_GREENFORGE, 'CL-REQ-000107', 'Supercritical CO2 for Accelerated Carbonation (Paused)', 'Temporarily paused pending autoclave line maintenance at Vadodara facility.', 600.00, 'tonne', 99.50, 99.95, 'supercritical', 'Post-Combustion Solvent', 6200.00, 'INR', '2026-10-01', '2026-12-15', true, IDS.FAC_VADODARA_MINERAL, 'high', 'PAUSED', IDS.USER_GREENFORGE, 'Mineral Carbonation', 'Vadodara', 'Gujarat', utilMap['MINERALIZATION']],
      [IDS.REQ_08, IDS.ORG_CARBONARC, 'CL-REQ-000108', 'Synthetic Aviation Fuel Feedstock Trial (Fulfilled)', 'Fulfilled initial pilot quantity requirement for test batch of synthetic aviation fuel.', 200.00, 'tonne', 99.00, 99.80, 'liquid', 'Amine Absorption', 5400.00, 'INR', '2026-07-01', '2026-08-31', true, IDS.FAC_DAHEJ_REFINE, 'urgent', 'FULFILLED', IDS.USER_CARBONARC, 'Synthetic Aviation Fuel', 'Dahej', 'Gujarat', utilMap['SYNTHETIC_FUEL']],
      [IDS.REQ_09, IDS.ORG_ALGAENOVA, 'CL-REQ-000109', 'Commercial Greenhouse CO2 Enrichment (Expired)', 'Enrichment CO2 stream for Q2 greenhouse tomato harvest window.', 180.00, 'tonne', 97.00, 99.00, 'gaseous', 'Flue Capture', 4300.00, 'INR', '2026-04-01', '2026-06-30', true, IDS.FAC_HAZIRA_BIO, 'normal', 'EXPIRED', IDS.USER_ALGAENOVA, 'Greenhouse Enrichment', 'Surat', 'Gujarat', utilMap['GREENHOUSE']],
      [IDS.REQ_10, IDS.ORG_GREENFORGE, 'CL-REQ-000110', 'Heavy Concrete Precast Curing Feedstock', 'High-volume CO2 supply for large-scale infrastructure precast block carbonation.', 1200.00, 'tonne', 98.50, 99.50, 'gaseous', 'Any', 4800.00, 'INR', '2026-10-01', '2027-04-30', true, IDS.FAC_VADODARA_MINERAL, 'urgent', 'PUBLISHED', IDS.USER_GREENFORGE, 'Concrete Curing', 'Vadodara', 'Gujarat', utilMap['CONCRETE_AND_CONSTRUCTION']]
    ];

    for (const r of reqValues) {
      await client.query(
        `INSERT INTO buyer_requirements (
          id, organization_id, requirement_code, title, description, 
          required_quantity, quantity_unit, minimum_purity, maximum_purity, 
          acceptable_physical_form, preferred_capture_method, maximum_price_per_unit, 
          currency, required_from, required_until, delivery_required, 
          destination_facility_id, priority, status, created_by, intended_use, 
          location_city, location_state, utilization_type_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::timestamptz, $15::timestamptz, $16, $17, $18, $19, $20, $21, $22, $23, $24)
         ON CONFLICT (id) DO UPDATE SET 
           requirement_code = EXCLUDED.requirement_code,
           title = EXCLUDED.title, 
           description = EXCLUDED.description,
           maximum_price_per_unit = EXCLUDED.maximum_price_per_unit,
           status = EXCLUDED.status,
           utilization_type_id = EXCLUDED.utilization_type_id;`,
        r
      );

      // Status history record
      await client.query(
        `INSERT INTO buyer_requirement_status_history (requirement_id, previous_status, from_status, new_status, to_status, changed_by_user_id, changed_by, reason)
         VALUES ($1, 'DRAFT', 'DRAFT', $2, $2, $3, $3, 'Initial requirement declaration')
         ON CONFLICT DO NOTHING;`,
        [r[0], r[18], r[19]]
      );
    }

    // 8. MATCHES & FACTOR SCORES
    console.log('Inserting Matches & Match Scores...');
    const matchValues = [
      [IDS.MATCH_01, IDS.REQ_01, IDS.LIST_01, 'suggested', 94.50, 96.00, 99.00, 92.00, 94.00, 95.00, 96.00, 112.50, 450.00, 5250.00, 'Excellent purity compatibility (99.5% vs 99.0% req) and short transit distance (112km between Ahmedabad and Vadodara).'],
      [IDS.MATCH_02, IDS.REQ_02, IDS.LIST_02, 'accepted', 91.80, 95.00, 98.00, 94.00, 92.00, 90.00, 90.00, 78.00, 312.00, 4512.00, 'High volume compatibility (2500t demand vs 3400t supply) with direct gaseous delivery capability.'],
      [IDS.MATCH_03, IDS.REQ_03, IDS.LIST_02, 'suggested', 87.20, 88.00, 95.00, 98.00, 85.00, 84.00, 86.00, 12.00, 50.00, 4250.00, 'Very close geographic proximity (Hazira Steel to Hazira Bio: 12km) providing minimal transport cost.']
    ];

    for (const m of matchValues) {
      await client.query(
        `INSERT INTO matches (id, requirement_id, listing_id, status, overall_score, overall_match_score, quantity_score, purity_score, distance_score, price_score, availability_score, use_case_score, estimated_distance_km, estimated_transport_cost, estimated_delivered_cost, matching_reason)
         VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (requirement_id, listing_id) DO UPDATE SET overall_score = EXCLUDED.overall_score;`,
        m
      );

      await client.query(
        `INSERT INTO match_scores (match_id, factor, score, weight, explanation) VALUES
         ('${m[0]}', 'Purity Compatibility', ${m[6]}, 0.30, 'Listing purity meets or exceeds buyer requirement'),
         ('${m[0]}', 'Geographic Proximity', ${m[7]}, 0.25, 'Distance within acceptable economic radius'),
         ('${m[0]}', 'Price Alignment', ${m[8]}, 0.20, 'Unit price fits within target budget parameters'),
         ('${m[0]}', 'Volume Capacity', ${m[5]}, 0.15, 'Available quantity satisfies requested order size'),
         ('${m[0]}', 'Schedule Alignment', ${m[9]}, 0.10, 'Supply window aligns with required project timeline')
         ON CONFLICT DO NOTHING;`
      );
    }

    // 9. INQUIRIES & OFFERS
    console.log('Inserting Inquiries & Commercial Offers...');
    await client.query(
      `INSERT INTO inquiries (id, listing_id, requirement_id, buyer_organization_id, seller_organization_id, initiated_by, requested_quantity, message, status)
       VALUES ('${IDS.INQ_01}', '${IDS.LIST_01}', '${IDS.REQ_01}', '${IDS.ORG_GREENFORGE}', '${IDS.ORG_TERRACEM}', '${IDS.USER_GREENFORGE}', 350.00, 'Interested in securing 350 tonnes of liquid CO2 starting October 1st. Please quote delivered pricing to Vadodara.', 'converted_to_offer')
       ON CONFLICT (id) DO NOTHING;`
    );

    await client.query(
      `INSERT INTO offers (id, inquiry_id, offer_number, listing_id, buyer_organization_id, seller_organization_id, offered_by_organization_id, quantity, offered_quantity_tons, quantity_unit, unit_price, offered_price_per_ton, currency, delivery_cost, total_estimated_cost, total_amount, valid_until, message, status)
       VALUES ('${IDS.OFFER_01}', '${IDS.INQ_01}', 'OFF-TC-2026-001', '${IDS.LIST_01}', '${IDS.ORG_GREENFORGE}', '${IDS.ORG_TERRACEM}', '${IDS.ORG_TERRACEM}', 350.00, 350.00, 'tonne', 4800.00, 4800.00, 'INR', 140000.00, 1820000.00, 1820000.00, NOW() + INTERVAL '14 days', 'We can fulfill 350 tonnes via ISO tank transport. Quote includes Rs 4,800/tonne plus Rs 1.4L freight.', 'accepted')
       ON CONFLICT (offer_number) DO NOTHING;`
    );

    await client.query(
      `INSERT INTO offer_items (offer_id, description, quantity, unit, unit_price, subtotal)
       VALUES 
       ('${IDS.OFFER_01}', 'High-Purity Liquid CO2 (99.5%)', 350.00, 'tonne', 4800.00, 1680000.00),
       ('${IDS.OFFER_01}', 'Cryogenic Freight Transport (Ahmedabad -> Vadodara)', 1.00, 'lot', 140000.00, 140000.00)
       ON CONFLICT DO NOTHING;`
    );

    // 10. ORDERS & CONTRACTS
    console.log('Inserting Orders & Contracts...');
    await client.query(
      `INSERT INTO orders (id, order_number, buyer_organization_id, seller_organization_id, listing_id, requirement_id, accepted_offer_id, quantity, quantity_tons, quantity_unit, unit_price, price_per_ton, currency, subtotal, subtotal_amount, transport_cost, tax_amount, total_amount, delivery_address, delivery_city, delivery_state, delivery_postal_code, status, ordered_at, accepted_at)
       VALUES ('${IDS.ORDER_01}', 'ORD-2026-8801', '${IDS.ORG_GREENFORGE}', '${IDS.ORG_TERRACEM}', '${IDS.LIST_01}', '${IDS.REQ_01}', '${IDS.OFFER_01}', 350.00, 350.00, 'tonne', 4800.00, 4800.00, 'INR', 1680000.00, 1680000.00, 140000.00, 91000.00, 1911000.00, 'Nandesari GIDC, Plot 42', 'Vadodara', 'Gujarat', '391340', 'in_transit', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
       ON CONFLICT (order_number) DO NOTHING;`
    );

    await client.query(
      `INSERT INTO order_items (order_id, listing_id, description, quantity, quantity_unit, unit_price, subtotal)
       VALUES ('${IDS.ORDER_01}', '${IDS.LIST_01}', 'Liquid Industrial CO2 (99.5% Purity)', 350.00, 'tonne', 4800.00, 1680000.00)
       ON CONFLICT DO NOTHING;`
    );

    await client.query(
      `INSERT INTO contracts (id, order_id, contract_number, contract_type, status, effective_from, effective_until, signed_at, document_id)
       VALUES ('${IDS.CONTRACT_001}', '${IDS.ORDER_01}', 'CTR-2026-0042', 'bilateral_supply', 'active', NOW() - INTERVAL '2 days', NOW() + INTERVAL '90 days', NOW() - INTERVAL '2 days', '${IDS.DOC_CONTRACT_001}')
       ON CONFLICT (contract_number) DO NOTHING;`
    );

    // 11. SHIPMENTS & TRACKING EVENTS
    console.log('Inserting Logistics Quotes & Shipments...');
    await client.query(
      `INSERT INTO logistics_quotes (order_id, provider_organization_id, origin_facility_id, destination_facility_id, distance_km, estimated_duration_minutes, transport_mode, base_cost, fuel_surcharge, total_cost, valid_until, status)
       VALUES ('${IDS.ORDER_01}', '${IDS.ORG_TRANSCARBON}', '${IDS.FAC_AHMEDABAD_CEMENT}', '${IDS.FAC_VADODARA_MINERAL}', 112.50, 180, 'ISO_TANK_TRUCK', 120000.00, 20000.00, 140000.00, NOW() + INTERVAL '30 days', 'accepted')
       ON CONFLICT DO NOTHING;`
    );

    await client.query(
      `INSERT INTO shipments (id, shipment_number, order_id, logistics_provider_id, origin_facility_id, destination_facility_id, quantity, quantity_tons, quantity_unit, scheduled_pickup_at, actual_pickup_at, estimated_delivery_at, distance_km, transport_mode, destination_address, tracking_reference, status)
       VALUES ('${IDS.SHIPMENT_01}', 'SHP-TC-9901', '${IDS.ORDER_01}', '${IDS.ORG_TRANSCARBON}', '${IDS.FAC_AHMEDABAD_CEMENT}', '${IDS.FAC_VADODARA_MINERAL}', 350.00, 350.00, 'tonne', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 hours', 112.50, 'ISO_TANK_TRUCK', 'Nandesari GIDC, Plot 42, Vadodara', 'TRK-GJ01-88902', 'in_transit')
       ON CONFLICT (shipment_number) DO NOTHING;`
    );

    // Shipment Routes
    await client.query(
      `INSERT INTO shipment_routes (shipment_id, sequence_number, location_name, location_type, latitude, longitude) VALUES
       ('${IDS.SHIPMENT_01}', 1, 'TerraCem Ahmedabad Plant Gate', 'origin', 22.9583, 72.6369),
       ('${IDS.SHIPMENT_01}', 2, 'Nadiad Highway Checkpoint', 'checkpoint', 22.6916, 72.8634),
       ('${IDS.SHIPMENT_01}', 3, 'Anand Freight Plaza', 'checkpoint', 22.5645, 72.9289),
       ('${IDS.SHIPMENT_01}', 4, 'GreenForge Vadodara Unit', 'destination', 22.4110, 73.0890)
       ON CONFLICT (shipment_id, sequence_number) DO NOTHING;`
    );

    // Tracking Events
    await client.query(
      `INSERT INTO shipment_tracking_events (shipment_id, event_type, status, event_status, latitude, longitude, location_name, notes, occurred_at) VALUES
       ('${IDS.SHIPMENT_01}', 'loaded', 'dispatched', 'dispatched', 22.9583, 72.6369, 'Ahmedabad Cement Plant', 'ISO Tank Trailer GJ-01-TC-8890 loaded and pressure checked at 25 bar.', NOW() - INTERVAL '24 hours'),
       ('${IDS.SHIPMENT_01}', 'checkpoint_passed', 'in_transit', 'in_transit', 22.6916, 72.8634, 'Nadiad Highway Checkpoint', 'Passed weight station safely. Pressure and temperature stable at -15C.', NOW() - INTERVAL '12 hours'),
       ('${IDS.SHIPMENT_01}', 'checkpoint_passed', 'in_transit', 'in_transit', 22.5645, 72.9289, 'Anand Freight Plaza', 'En route to Vadodara industrial zone.', NOW() - INTERVAL '3 hours')
       ON CONFLICT DO NOTHING;`
    );

    // 12. INVOICES & PAYMENTS
    console.log('Inserting Invoices & Payments...');
    await client.query(
      `INSERT INTO invoices (id, invoice_number, order_id, issued_by_organization_id, billed_to_organization_id, subtotal, tax_amount, total_amount, currency, status, issued_at, due_at, paid_at)
       VALUES ('${IDS.INVOICE_01}', 'INV-2026-0091', '${IDS.ORDER_01}', '${IDS.ORG_TERRACEM}', '${IDS.ORG_GREENFORGE}', 1820000.00, 91000.00, 1911000.00, 'INR', 'paid', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', NOW() - INTERVAL '1 day')
       ON CONFLICT (invoice_number) DO NOTHING;`
    );

    await client.query(
      `INSERT INTO payments (invoice_id, order_id, amount, currency, payment_method, provider_reference, status, paid_at)
       VALUES ('${IDS.INVOICE_01}', '${IDS.ORDER_01}', 1911000.00, 'INR', 'bank_transfer', 'UTR-HDFC-20260911-0098', 'completed', NOW() - INTERVAL '1 day')
       ON CONFLICT DO NOTHING;`
    );

    // 13. NOTIFICATIONS, REVIEWS & AUDIT LOGS
    console.log('Inserting Notifications & Audit Logs...');
    await client.query(
      `INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read) VALUES
       ('${IDS.USER_GREENFORGE}', 'match_found', 'High-Compatibility CO2 Match Found', 'Your requirement REQ-GF-001 has matched 94.5% with TerraCem Ahmedabad Plant.', 'matches', '${IDS.MATCH_01}', false),
       ('${IDS.USER_TERRACEM}', 'inquiry_received', 'New Inquiry for CO2 Supply', 'GreenForge Materials submitted an inquiry for 350 tonnes.', 'inquiries', '${IDS.INQ_01}', true),
       ('${IDS.USER_GREENFORGE}', 'shipment_update', 'Shipment Dispatched', 'ISO Tank Trailer GJ-01-TC-8890 is in transit to Vadodara.', 'shipments', '${IDS.SHIPMENT_01}', false)
       ON CONFLICT DO NOTHING;`
    );

    await client.query(
      `INSERT INTO audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, new_values, ip_address) VALUES
       ('${IDS.USER_TERRACEM}', '${IDS.ORG_TERRACEM}', 'CREATE_LISTING', 'co2_listings', '${IDS.LIST_01}', '{"title": "High-Purity Liquid CO2", "quantity": 1250, "purity": 99.5}', '127.0.0.1'),
       ('${IDS.USER_GREENFORGE}', '${IDS.ORG_GREENFORGE}', 'ACCEPT_OFFER', 'offers', '${IDS.OFFER_01}', '{"status": "accepted", "total": 1820000}', '127.0.0.1')
       ON CONFLICT DO NOTHING;`
    );

    await client.query('COMMIT');
    console.log('✅ CarbonLoop database seeded successfully with comprehensive demo data!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database seeding failed:', err);
    throw err;
  } finally {
    client.release();
    await closePool();
  }
}

seed().catch((err) => {
  console.error('❌ Seeding process error:', err);
  process.exit(1);
});
