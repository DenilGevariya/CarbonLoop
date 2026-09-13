import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function numSql(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'NULL';
  return val.toString();
}

function boolSql(val: boolean | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return val ? 'true' : 'false';
}

function makeUuid(typePrefix: number, index: number): string {
  const hexIdx = index.toString(16).padStart(12, '0');
  const typeStr = typePrefix.toString(16).padStart(8, '0');
  return `${typeStr}-0000-4000-a000-${hexIdx}`;
}

async function main() {
  console.log('Generating comprehensive seed.sql...');

  const passHash = await bcrypt.hash('Password123!', 10);

  const sqlLines: string[] = [];

  sqlLines.push('-- CarbonLoop Massive 55+ Organization Enterprise Database Seed SQL Script');
  sqlLines.push('-- Compatible with Neon PostgreSQL and standard PostgreSQL 14+');
  sqlLines.push('-- Contains 55 Orgs, 55 Facilities, 50 Listings, 40 Requirements, Matches, Orders, Shipments, Invoices & Tracking Events');
  sqlLines.push('');
  sqlLines.push('BEGIN;');
  sqlLines.push('');

  // 0. TRUNCATE ALL TABLES
  sqlLines.push('-- 0. CLEAN SLATE TRUNCATE');
  sqlLines.push(`TRUNCATE TABLE 
  system_alerts,
  audit_logs,
  notifications,
  payments,
  invoices,
  shipment_tracking_events,
  shipment_routes,
  shipments,
  logistics_quotes,
  contracts,
  order_items,
  orders,
  offer_items,
  offers,
  inquiries,
  matches,
  match_scores,
  buyer_requirement_status_history,
  buyer_requirements,
  co2_listing_documents,
  co2_listing_status_history,
  co2_listings,
  facility_certifications,
  documents,
  facilities,
  organization_members,
  organizations,
  user_roles,
  users,
  co2_utilization_types,
  roles
CASCADE;`);
  sqlLines.push('');

  // 1. ROLES
  sqlLines.push('-- 1. ROLES');
  sqlLines.push(`INSERT INTO roles (id, name, description) VALUES
  ('10000000-0000-4000-a000-000000000001', 'platform_admin', 'Full platform administrator with compliance overview'),
  ('10000000-0000-4000-a000-000000000002', 'emitter', 'CO2 Industrial Emitter offering captured carbon supply'),
  ('10000000-0000-4000-a000-000000000003', 'utilizer', 'Carbon utilizer sourcing CO2 as feedstock'),
  ('10000000-0000-4000-a000-000000000004', 'logistics_provider', 'Logistics and freight transport partner'),
  ('10000000-0000-4000-a000-000000000005', 'regulator', 'Government and environmental regulator'),
  ('10000000-0000-4000-a000-000000000006', 'ADMIN', 'System Administrator'),
  ('10000000-0000-4000-a000-000000000007', 'EMITTER', 'CO2 Industrial Emitter'),
  ('10000000-0000-4000-a000-000000000008', 'BUYER', 'CO2 Industrial Buyer'),
  ('10000000-0000-4000-a000-000000000009', 'LOGISTICS', 'Logistics Transport Partner')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;`);
  sqlLines.push('');

  // 2. USERS
  sqlLines.push('-- 2. USERS (Hashed password for "Password123!")');
  
  const usersData = [
    ['20000000-0000-4000-a000-000000000001', 'admin@carbonloop.io', 'Aarav', 'Sharma', '+91 98765 43210'],
    ['20000000-0000-4000-a000-000000000002', 'supply@terracem.com', 'Rajesh', 'Patel', '+91 98234 56789'],
    ['20000000-0000-4000-a000-000000000003', 'supply@novasteel.com', 'Vikram', 'Sengupta', '+91 98345 67890'],
    ['20000000-0000-4000-a000-000000000004', 'procurement@greenforge.com', 'Priya', 'Deshmukh', '+91 98456 78901'],
    ['20000000-0000-4000-a000-000000000005', 'procurement@carbonarc.com', 'Ananya', 'Roy', '+91 98567 89012'],
    ['20000000-0000-4000-a000-000000000006', 'procurement@algaenova.com', 'Siddharth', 'Nair', '+91 98678 90123'],
    ['20000000-0000-4000-a000-000000000007', 'logistics@transcarbon.com', 'Karan', 'Mehta', '+91 98789 01234'],
    ['20000000-0000-4000-a000-000000000008', 'regulator@gpcb.gov.in', 'Dr. Sunita', 'Rao', '+91 98890 12345'],
    ['20000000-0000-4000-a000-000000000009', 'demo.emitter@carbonloop.local', 'Demo Emitter', 'User', '+91 90000 00001'],
    ['20000000-0000-4000-a000-000000000010', 'demo.utilizer@carbonloop.local', 'Demo Utilizer', 'User', '+91 90000 00002'],
    ['20000000-0000-4000-a000-000000000011', 'demo.logistics@carbonloop.local', 'Demo Logistics', 'User', '+91 90000 00003'],
    ['20000000-0000-4000-a000-000000000012', 'demo.admin@carbonloop.local', 'Demo Admin', 'User', '+91 90000 00004'],
  ];

  const userRows = usersData.map(u => 
    `  (${escapeSql(u[0])}, ${escapeSql(u[1])}, '${passHash}', ${escapeSql(u[2])}, ${escapeSql(u[3])}, ${escapeSql(u[4])}, true, true, NOW())`
  ).join(',\n');

  sqlLines.push(`INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified, onboarding_completed_at) VALUES\n${userRows}\nON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;`);
  sqlLines.push('');

  // USER ROLES
  sqlLines.push('-- USER ROLES MAPPING');
  sqlLines.push(`INSERT INTO user_roles (user_id, role_id) VALUES
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000002'),
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000002'),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000003'),
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000003'),
  ('20000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000003'),
  ('20000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000004'),
  ('20000000-0000-4000-a000-000000000008', '10000000-0000-4000-a000-000000000005'),
  ('20000000-0000-4000-a000-000000000009', '10000000-0000-4000-a000-000000000002'),
  ('20000000-0000-4000-a000-000000000010', '10000000-0000-4000-a000-000000000003'),
  ('20000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000004'),
  ('20000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000001')
ON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  // 3. UTILIZATION TYPES
  sqlLines.push('-- 3. CO2 UTILIZATION TYPES');
  sqlLines.push(`INSERT INTO co2_utilization_types (id, name, code, description) VALUES
  ('11000000-0000-4000-a000-000000000001', 'Concrete Curing & Building Materials', 'CONCRETE_AND_CONSTRUCTION', 'CO2 mineralization during precast and ready-mix concrete curing.'),
  ('11000000-0000-4000-a000-000000000002', 'Synthetic E-Fuels & Aviation Kerosene', 'SYNTHETIC_FUEL', 'Hydrogenation of CO2 into e-methanol, e-diesel, and synthetic aviation fuel.'),
  ('11000000-0000-4000-a000-000000000003', 'Microalgae Cultivation & Biomanufacturing', 'ALGAE', 'Continuous carbon injection into algae ponds for protein and biplastics.'),
  ('11000000-0000-4000-a000-000000000004', 'Chemical Synthesis & Polymers', 'CHEMICALS', 'Synthesis of polycarbonates, polyols, organic acids, and green solvents.'),
  ('11000000-0000-4000-a000-000000000005', 'Food & Beverage Carbonation', 'FOOD_AND_BEVERAGE', 'Beverage carbonation, food preservation, and dry ice refrigeration.'),
  ('11000000-0000-4000-a000-000000000006', 'Greenhouse Crop Enrichment', 'GREENHOUSE', 'Agricultural carbon dioxide enrichment for commercial greenhouse crop yields.'),
  ('11000000-0000-4000-a000-000000000007', 'Accelerated Mineral Carbonation', 'MINERALIZATION', 'Permanent binding of CO2 into industrial slag and alkaline minerals.')
ON CONFLICT (code) DO NOTHING;`);
  sqlLines.push('');

  // 4. ORGANIZATIONS (55 Industrial Organizations)
  sqlLines.push('-- 4. ORGANIZATIONS (55 Enterprise Industrial Organizations)');
  
  const orgSeeds = [
    // Emitters (20)
    { name: 'TerraCem Industries', legal_name: 'TerraCem Cement Pvt Ltd', type: 'emitter', industry: 'Cement & Concrete', city: 'Ahmedabad', state: 'Gujarat', lat: 22.9583, lng: 72.6369, desc: 'Leading sustainable cement plant with amine absorption CO2 recovery.' },
    { name: 'NovaSteel Energy', legal_name: 'NovaSteel Heavy Industries Ltd', type: 'emitter', industry: 'Steel Manufacturing', city: 'Surat', state: 'Gujarat', lat: 21.1167, lng: 72.6500, desc: 'Integrated blast furnace steel works with post-combustion flue capture.' },
    { name: 'BlueSky Power', legal_name: 'BlueSky Thermal Energy Corp', type: 'emitter', industry: 'Power Generation', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, desc: 'Thermal power complex producing continuous industrial gaseous CO2.' },
    { name: 'Gujarat Chemicals & Alkalis', legal_name: 'GACL Decarbonization Division', type: 'emitter', industry: 'Chemical Manufacturing', city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, desc: 'Chlor-alkali chemical complex capturing high-purity process CO2.' },
    { name: 'Dahej Fertilizer Complex', legal_name: 'Dahej Agrochemicals & Nitrogen Ltd', type: 'emitter', industry: 'Fertilizers', city: 'Dahej', state: 'Gujarat', lat: 21.7118, lng: 72.5312, desc: 'Ammonia synthesis plant producing food-grade bi-product carbon dioxide.' },
    { name: 'Mundra Thermal Power', legal_name: 'Mundra Carbon Capture Hub', type: 'emitter', industry: 'Power Generation', city: 'Mundra', state: 'Gujarat', lat: 22.8394, lng: 69.7247, desc: 'Coastal power plant with chilled ammonia carbon capture facility.' },
    { name: 'UltraTech Carbon Capture', legal_name: 'UltraTech Cement Works Rajkot', type: 'emitter', industry: 'Cement & Concrete', city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, desc: 'Calcination flue gas capture unit delivering continuous liquid CO2.' },
    { name: 'Reliance Jamnagar Refinery', legal_name: 'Reliance Green Hydrogen & Carbon Hub', type: 'emitter', industry: 'Petrochemicals', city: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lng: 70.0577, desc: 'World-scale petrochemical refinery capturing steam methane reformer CO2.' },
    { name: 'Tata Steel Kalinganagar', legal_name: 'Tata Steel Decarbonization Hub', type: 'emitter', industry: 'Steel Manufacturing', city: 'Jajpur', state: 'Odisha', lat: 20.9517, lng: 86.1386, desc: 'Direct reduction iron process stream with cryogenic CO2 separation.' },
    { name: 'JSW Steel Vijayanagar', legal_name: 'JSW Sustainable Steel Corp', type: 'emitter', industry: 'Steel Manufacturing', city: 'Ballari', state: 'Karnataka', lat: 15.1394, lng: 76.9214, desc: 'Blast furnace gas recovery capturing 500,000 TPA carbon dioxide.' },
    { name: 'Jindal Power & Steel', legal_name: 'Jindal Clean Energy Division', type: 'emitter', industry: 'Power & Steel', city: 'Angul', state: 'Odisha', lat: 20.8392, lng: 85.1511, desc: 'Coal-to-gasification process capturing industrial purity CO2.' },
    { name: 'Deepak Nitrite Chemical Hub', legal_name: 'Deepak Nitrite Fine Chemicals', type: 'emitter', industry: 'Chemical Manufacturing', city: 'Nandesari', state: 'Gujarat', lat: 22.4110, lng: 73.0890, desc: 'Specialty chemical manufacturer offering compressed gaseous CO2.' },
    { name: 'Aarti Industries Vapi', legal_name: 'Aarti Carbon Recovery Division', type: 'emitter', industry: 'Chemical Manufacturing', city: 'Vapi', state: 'Gujarat', lat: 20.3893, lng: 72.9106, desc: 'Organic chemical plant supplying sub-zero liquid carbon dioxide.' },
    { name: 'Bharuch Petrochemical Works', legal_name: 'Bharuch Aromatics & Olefins Ltd', type: 'emitter', industry: 'Petrochemicals', city: 'Bharuch', state: 'Gujarat', lat: 21.7051, lng: 72.9959, desc: 'Cracker unit with membrane-assisted post-combustion capture.' },
    { name: 'Coromandel Fertilizers Kakinada', legal_name: 'Coromandel Green Nitrogen Ltd', type: 'emitter', industry: 'Fertilizers', city: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475, desc: 'High-purity liquid CO2 stream from urea reactor off-gas.' },
    { name: 'ACC Cement Chanda Works', legal_name: 'ACC Decarbonization Unit', type: 'emitter', industry: 'Cement & Concrete', city: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lng: 79.2961, desc: 'Cement kiln oxy-fuel combustion capture pilot plant.' },
    { name: 'Dalmia Cement Ariyalur', legal_name: 'Dalmia Eco-Cement Plant', type: 'emitter', industry: 'Cement & Concrete', city: 'Ariyalur', state: 'Tamil Nadu', lat: 11.1401, lng: 79.0782, desc: 'Pioneering carbon capture utilization facility in Southern India.' },
    { name: 'Hindalco Belagavi Smelter', legal_name: 'Hindalco Green Aluminium', type: 'emitter', industry: 'Non-Ferrous Metals', city: 'Belagavi', state: 'Karnataka', lat: 15.8497, lng: 74.4977, desc: 'Alumina refinery process calcination carbon capture stream.' },
    { name: 'National Fertilizer Panipat', legal_name: 'NFL Industrial Gas Division', type: 'emitter', industry: 'Fertilizers', city: 'Panipat', state: 'Haryana', lat: 29.3909, lng: 76.9635, desc: 'Food-grade certified 99.9% CO2 liquid storage terminal.' },
    { name: 'Rashtriya Chemicals Trombay', legal_name: 'RCF Industrial Gas Complex', type: 'emitter', industry: 'Fertilizers & Chemicals', city: 'Mumbai', state: 'Maharashtra', lat: 19.0435, lng: 72.8906, desc: 'Metropolitan chemical facility supplying liquid CO2 to Western India.' },

    // Utilizers (22)
    { name: 'GreenForge Materials', legal_name: 'GreenForge Sustainable Infrastructure Ltd', type: 'utilizer', industry: 'Sustainable Construction', city: 'Vadodara', state: 'Gujarat', lat: 22.4110, lng: 73.0890, desc: 'Pioneering mineralized concrete blocks curing CO2 feedstock.' },
    { name: 'CarbonArc Fuels', legal_name: 'CarbonArc Synthetic Energy Solutions', type: 'utilizer', industry: 'Synthetic E-Fuels', city: 'Dahej', state: 'Gujarat', lat: 21.7118, lng: 72.5312, desc: 'Producing drop-in e-methanol and synthetic jet e-fuel from captured CO2.' },
    { name: 'AlgaeNova Labs', legal_name: 'AlgaeNova Bio-Technologies Pvt Ltd', type: 'utilizer', industry: 'Bio-Technologies', city: 'Surat', state: 'Gujarat', lat: 21.1000, lng: 72.6400, desc: 'High-density microalgae raceway ponds utilizing continuous gaseous CO2.' },
    { name: 'CarbonCure India Solutions', legal_name: 'CarbonCure ReadyMix India Pvt Ltd', type: 'utilizer', industry: 'Sustainable Construction', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, desc: 'Injecting recycled CO2 into concrete manufacturing lines.' },
    { name: 'Synfuel Technologies', legal_name: 'Synfuel Clean Aviation Fuels Ltd', type: 'utilizer', industry: 'Synthetic E-Fuels', city: 'Hazira', state: 'Gujarat', lat: 21.1167, lng: 72.6500, desc: 'Power-to-Liquid e-kerosene production for sustainable aviation.' },
    { name: 'BioCarbon AgriTech', legal_name: 'BioCarbon Photosynthetic Solutions', type: 'utilizer', industry: 'Agriculture & Bio-Refinery', city: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289, desc: 'Enriching commercial greenhouse crops with captured carbon dioxide.' },
    { name: 'EcoMat Concrete Blocks', legal_name: 'EcoMat Mineralized Products Pvt Ltd', type: 'utilizer', industry: 'Sustainable Construction', city: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, desc: 'Manufacture of negative-carbon paving blocks and structural masonry.' },
    { name: 'CleanPolymer Synthetics', legal_name: 'CleanPolymer Sustainable Plastics', type: 'utilizer', industry: 'Chemicals & Polymers', city: 'Bharuch', state: 'Gujarat', lat: 21.7051, lng: 72.9959, desc: 'Synthesizing polycarbonates and polyols using captured CO2 feedstocks.' },
    { name: 'Kaveri Bio-Algae Systems', legal_name: 'Kaveri Green Bio-Refinery Ltd', type: 'utilizer', industry: 'Bio-Technologies', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, desc: 'Microalgae protein and biofuel production using power plant CO2.' },
    { name: 'Deccan Synthetic Fuels', legal_name: 'Deccan E-Chemicals & Energy', type: 'utilizer', industry: 'Synthetic E-Fuels', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, desc: 'CO2 hydrogenation to produce green dimethyl ether (DME) and e-fuels.' },
    { name: 'Maharastra Carbonation Materials', legal_name: 'MahaCarbon Precast Works', type: 'utilizer', industry: 'Sustainable Construction', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, desc: 'Accelerated carbonation chambers for precast concrete slabs.' },
    { name: 'Cipla Eco-Pharma Formulations', legal_name: 'Cipla Green Chemical Synthesis', type: 'utilizer', industry: 'Pharmaceuticals', city: 'Vapi', state: 'Gujarat', lat: 20.3893, lng: 72.9106, desc: 'Supercritical CO2 extraction and green active pharmaceutical ingredients.' },
    { name: 'Dr Reddys Bio-Carbon Hub', legal_name: 'Dr Reddys Sustainable Formulations', type: 'utilizer', industry: 'Pharmaceuticals', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, desc: 'Green solvent and botanical extraction using high-purity liquid CO2.' },
    { name: 'Toyota Kirloskar Clean Materials', legal_name: 'TKAP Carbon-Cured Castings', type: 'utilizer', industry: 'Automotive & Materials', city: 'Bidadi', state: 'Karnataka', lat: 12.7972, lng: 77.3853, desc: 'Carbon-hardened foundry sand molds and lightweight structural alloys.' },
    { name: 'TVS Green Synthetic Resins', legal_name: 'TVS Polymer Materials Tech', type: 'utilizer', industry: 'Automotive & Materials', city: 'Hosur', state: 'Tamil Nadu', lat: 12.7409, lng: 77.8253, desc: 'Bio-based polyurethanes utilizing captured industrial CO2.' },
    { name: 'Chola Microalgae Nutrition', legal_name: 'Chola Marine Biotech Ltd', type: 'utilizer', industry: 'Bio-Technologies', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, desc: 'Astaxanthin and Spirulina microalgae cultivation with CO2 injection.' },
    { name: 'Kalinga Mineralized Bricks', legal_name: 'Kalinga Low-Carbon Materials', type: 'utilizer', industry: 'Sustainable Construction', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, desc: 'Utilizing steel plant slag and CO2 to create ultra-durable bricks.' },
    { name: 'Punjab Bio-Enrichment Farms', legal_name: 'Punjab Agritech Carbon Solutions', type: 'utilizer', industry: 'Agriculture', city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573, desc: 'Protected greenhouse crop carbon fertilization networks.' },
    { name: 'Godrej Eco-Polymers', legal_name: 'Godrej Sustainable Resins', type: 'utilizer', industry: 'Chemicals & Polymers', city: 'Valia', state: 'Gujarat', lat: 21.5714, lng: 73.1812, desc: 'Polycarbonate synthesis using captured industrial flue gas.' },
    { name: 'L&T Green Precast Infrastructure', legal_name: 'L&T Construction Decarbonization Wing', type: 'utilizer', industry: 'Sustainable Construction', city: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lng: 79.7036, desc: 'CO2 mineralization for mega precast railway and bridge girders.' },
    { name: 'Amul Dairy Beverage Carbonation', legal_name: 'GCMMF Carbonation Facility', type: 'utilizer', industry: 'Food & Beverage', city: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289, desc: 'Beverage carbonation and dry ice cold-chain preservation.' },
    { name: 'PepsiCo Sustainable Bottling Bharuch', legal_name: 'PepsiCo India Bottling Works', type: 'utilizer', industry: 'Food & Beverage', city: 'Bharuch', state: 'Gujarat', lat: 21.7051, lng: 72.9959, desc: 'Food-grade 99.99% CO2 carbonation for soft drink bottling.' },

    // Logistics Providers (8)
    { name: 'TransCarbon Logistics', legal_name: 'TransCarbon Cryogenic Transport Ltd', type: 'logistics_provider', industry: 'Cryogenic Freight', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, desc: 'Specialized ISO tank transport and pressurized CO2 distribution fleet.' },
    { name: 'CryoTrans Express India', legal_name: 'CryoTrans Heavy Freight Pvt Ltd', type: 'logistics_provider', industry: 'Cryogenic Freight', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, desc: 'High-capacity cryogenic liquid trailer fleet operating across Western India.' },
    { name: 'GasCarrier Logistics South', legal_name: 'GasCarrier Tanker Fleet Ltd', type: 'logistics_provider', industry: 'Pressurized Gas Transport', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, desc: 'South Indian bulk CO2 pressurized tube trailer operator.' },
    { name: 'Vanguard Industrial Freight', legal_name: 'Vanguard Logistics Solutions', type: 'logistics_provider', industry: 'Industrial Freight', city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, desc: 'Multimodal freight operator specializing in hazardous gas movement.' },
    { name: 'Deccan Cryo Carriers', legal_name: 'Deccan Cryogenic Freight Corp', type: 'logistics_provider', industry: 'Cryogenic Freight', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, desc: 'Central India cryogenic liquid tank truck distribution hub.' },
    { name: 'Coastal Gas Logistics Odisha', legal_name: 'Coastal Gas Carriers Pvt Ltd', type: 'logistics_provider', industry: 'Pressurized Gas Transport', city: 'Paradeep', state: 'Odisha', lat: 20.3164, lng: 86.6114, desc: 'East coast port and industrial corridor compressed gas haulage.' },
    { name: 'Northern Cryo Supply Fleet', legal_name: 'Northern Cryogenic Transport Ltd', type: 'logistics_provider', industry: 'Cryogenic Freight', city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, desc: 'North Indian liquid carbon dioxide tanker fleet.' },
    { name: 'Western Tanker Hub Anand', legal_name: 'Western Gas Freight Logistics', type: 'logistics_provider', industry: 'Pressurized Gas Transport', city: 'Anand', state: 'Gujarat', lat: 22.5645, lng: 72.9289, desc: 'Regional short-haul ISO tank container dispatch depot.' },

    // Regulators (5)
    { name: 'GPCB Regulatory Oversight', legal_name: 'Gujarat Pollution Control Board Oversight Unit', type: 'regulator', industry: 'Environmental Oversight', city: 'Gandhinagar', state: 'Gujarat', lat: 23.2156, lng: 72.6369, desc: 'State environmental monitoring and carbon accounting verification authority.' },
    { name: 'MPCB Industrial Audit Division', legal_name: 'Maharashtra Pollution Control Board', type: 'regulator', industry: 'Environmental Oversight', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, desc: 'Industrial emissions verification and carbon utilization regulator.' },
    { name: 'TNPCB Carbon Audit Cell', legal_name: 'Tamil Nadu Pollution Control Board', type: 'regulator', industry: 'Environmental Oversight', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, desc: 'Industrial decarbonization compliance and emissions registrar.' },
    { name: 'CPCB Central Bureau', legal_name: 'Central Pollution Control Board Carbon Registry', type: 'regulator', industry: 'Environmental Oversight', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, desc: 'National Carbon Market registry and compliance enforcement agency.' },
    { name: 'KSPCB Environment Board', legal_name: 'Karnataka State Pollution Control Board', type: 'regulator', industry: 'Environmental Oversight', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, desc: 'State industrial carbon emissions monitoring and verification wing.' }
  ];

  const coreOrgIds = [
    '30000000-0000-4000-a000-000000000001',
    '30000000-0000-4000-a000-000000000002',
    '30000000-0000-4000-a000-000000000003',
    '30000000-0000-4000-a000-000000000004',
    '30000000-0000-4000-a000-000000000005',
    '30000000-0000-4000-a000-000000000006',
    '30000000-0000-4000-a000-000000000007',
    '30000000-0000-4000-a000-000000000008'
  ];

  const orgSqlRows: string[] = [];
  const facilitySqlRows: string[] = [];
  
  const createdOrgIds: string[] = [];
  const createdFacIds: string[] = [];

  for (let i = 0; i < orgSeeds.length; i++) {
    const o = orgSeeds[i];
    const orgId = i < coreOrgIds.length ? coreOrgIds[i] : makeUuid(3, i + 1);
    const facId = i < 6 ? `40000000-0000-4000-a000-00000000000${i + 1}` : makeUuid(4, i + 1);

    createdOrgIds.push(orgId);
    createdFacIds.push(facId);

    const slug = o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const regNo = `CIN-L${20000 + i}${o.state.substring(0, 2).toUpperCase()}20${15 + (i % 8)}PLC0${100 + i}`;
    const taxId = `24AAAA${o.name.substring(0, 3).toUpperCase()}${1000 + i}A1Z5`;
    const email = `contact@${slug}.demo`;
    const phone = `+91 98${(1000000 + i * 314159) % 90000000}`;

    orgSqlRows.push(`  (${escapeSql(orgId)}, ${escapeSql(o.name)}, ${escapeSql(o.legal_name)}, ${escapeSql(slug)}, ${escapeSql(o.type)}, ${escapeSql(o.industry)}, ${escapeSql(regNo)}, ${escapeSql(o.desc)}, ${escapeSql(`https://${slug}.demo`)}, ${escapeSql(email)}, ${escapeSql(phone)}, ${escapeSql(taxId)}, ${escapeSql(o.state)}, ${escapeSql(o.city)}, '390001', ${escapeSql(`${o.city} Industrial Zone, Corridor ${i + 1}`)}, ${o.lat}, ${o.lng}, 'verified')`);

    facilitySqlRows.push(`  (${escapeSql(facId)}, ${escapeSql(orgId)}, ${escapeSql(`${o.name} Facility ${i + 1}`)}, ${escapeSql(`FAC-${o.type.substring(0,3).toUpperCase()}-${(100 + i + 1)}`)}, ${escapeSql(`Primary ${o.industry} operational site in ${o.city}`)}, ${escapeSql(o.type === 'emitter' ? 'Flue Capture Station' : o.type === 'utilizer' ? 'Off-Take Processing Unit' : 'Logistics Hub')}, ${escapeSql(`${o.city} Industrial Zone`)}, ${escapeSql(`${o.city} Industrial Zone`)}, ${escapeSql(o.city)}, ${escapeSql(o.state)}, '390001', ${o.lat}, ${o.lng}, 'Operations Manager', ${escapeSql(email)}, ${escapeSql(phone)}, ${(50000 + (i * 12500) % 300000)}.00, 'Amine Gas Absorption & Catalytic Conversion')`);
  }

  sqlLines.push(`INSERT INTO organizations (id, name, legal_name, slug, org_type, industry, registration_number, description, website, email, phone, tax_identifier, state, city, postal_code, address_line1, latitude, longitude, status) VALUES\n${orgSqlRows.join(',\n')}\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`);
  sqlLines.push('');

  // 5. FACILITIES
  sqlLines.push('-- 5. FACILITIES (55 Industrial Facilities)');
  sqlLines.push(`INSERT INTO facilities (id, organization_id, name, facility_code, description, facility_type, address, address_line1, city, state, postal_code, latitude, longitude, contact_name, contact_email, contact_phone, annual_co2_capacity_tons, capture_technology) VALUES\n${facilitySqlRows.join(',\n')}\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`);
  sqlLines.push('');

  // 6. ORGANIZATION MEMBERS
  sqlLines.push('-- 6. ORGANIZATION MEMBERS');
  sqlLines.push(`INSERT INTO organization_members (organization_id, user_id, job_title, is_primary_contact) VALUES
  ('30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 'Head of Carbon Operations', true),
  ('30000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000003', 'VP Sustainability', true),
  ('30000000-0000-4000-a000-000000000004', '20000000-0000-4000-a000-000000000004', 'Chief Procurement Officer', true),
  ('30000000-0000-4000-a000-000000000005', '20000000-0000-4000-a000-000000000005', 'Feedstock Sourcing Lead', true),
  ('30000000-0000-4000-a000-000000000006', '20000000-0000-4000-a000-000000000006', 'Bio-Refinery Director', true),
  ('30000000-0000-4000-a000-000000000007', '20000000-0000-4000-a000-000000000007', 'Fleet Operations Manager', true),
  ('30000000-0000-4000-a000-000000000008', '20000000-0000-4000-a000-000000000008', 'Senior Carbon Inspector', true),
  ('30000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000009', 'Demo Emitter Specialist', false),
  ('30000000-0000-4000-a000-000000000004', '20000000-0000-4000-a000-000000000010', 'Demo Off-Take Specialist', false),
  ('30000000-0000-4000-a000-000000000007', '20000000-0000-4000-a000-000000000011', 'Demo Logistics Operator', false),
  ('30000000-0000-4000-a000-000000000008', '20000000-0000-4000-a000-000000000012', 'Demo System Inspector', false)
ON CONFLICT (organization_id, user_id) DO NOTHING;`);
  sqlLines.push('');

  // 7. DOCUMENTS & CERTIFICATIONS
  sqlLines.push('-- 7. DOCUMENTS & FACILITY CERTIFICATIONS');
  const docRows: string[] = [];
  const certRows: string[] = [];

  for (let dIdx = 0; dIdx < 20; dIdx++) {
    const docId = makeUuid(5, dIdx + 1);
    const orgId = createdOrgIds[dIdx % createdOrgIds.length];
    const facId = createdFacIds[dIdx % createdFacIds.length];
    const userId = '20000000-0000-4000-a000-000000000002';
    
    docRows.push(`  (${escapeSql(docId)}, ${escapeSql(orgId)}, ${escapeSql(facId)}, ${escapeSql(userId)}, 'purity_certificate', ${escapeSql(`Purity_Analysis_Batch_${2026 + dIdx}.pdf`)}, ${escapeSql(`docs/certs/purity_${2026 + dIdx}.pdf`)}, 'application/pdf', 1048576, 'a1b2c3d4e5f6', 'ISO 17025 certified purity analysis confirming 99.5% CO2 concentration.', NOW())`);

    certRows.push(`  (${escapeSql(facId)}, ${escapeSql(`ISO 14064 Carbon Verification Level ${dIdx + 1}`)}, ${escapeSql(`CERT-ISO-14064-${100 + dIdx}`)}, 'Bureau Veritas India', 'Bureau Veritas India', '2025-01-15', '2028-01-15', 'ACTIVE', ${escapeSql(docId)})`);
  }

  sqlLines.push(`INSERT INTO documents (id, organization_id, facility_id, uploaded_by, document_type, file_name, storage_key, mime_type, file_size, checksum, description, verified_at) VALUES\n${docRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO facility_certifications (facility_id, certification_name, certificate_number, issuing_body, issuing_authority, issued_at, expires_at, status, document_id) VALUES\n${certRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  // 8. CO2 SUPPLY LISTINGS (50 Listings)
  sqlLines.push('-- 8. CO2 SUPPLY LISTINGS (50 Active Emitter Listings)');
  const emitterOrgs = orgSeeds.map((o, idx) => ({ ...o, id: createdOrgIds[idx], facId: createdFacIds[idx] })).filter(o => o.type === 'emitter');
  const physicalForms = ['liquid', 'gaseous', 'supercritical', 'solid_dry_ice'];
  const captureTechs = ['Amine Gas Absorption', 'Direct Flue Capture', 'Post-Combustion Chilled Ammonia', 'Cryogenic Compression', 'Membrane Separation'];
  const statuses = ['PUBLISHED', 'PUBLISHED', 'PUBLISHED', 'DRAFT', 'PAUSED', 'EXHAUSTED'];

  const listingRows: string[] = [];
  const listingIds: string[] = [];

  for (let lIdx = 0; lIdx < 50; lIdx++) {
    const emitter = emitterOrgs[lIdx % emitterOrgs.length];
    const listId = makeUuid(6, lIdx + 1);
    listingIds.push(listId);

    const code = `CL-SUP-00${(100 + lIdx + 1).toString().padStart(4, '0')}`;
    const form = physicalForms[lIdx % physicalForms.length];
    const purity = Number((95.5 + (lIdx * 0.17) % 4.4).toFixed(2));
    const price = Number((3800 + (lIdx * 190) % 3600).toFixed(2));
    const availQty = Number((300 + (lIdx * 230) % 4500).toFixed(2));
    const remQty = lIdx % 6 === 5 ? 0 : Number((availQty * (0.4 + (lIdx % 5) * 0.15)).toFixed(2));
    const status = statuses[lIdx % statuses.length];
    const title = `${emitter.name} ${form.replace('_', ' ').toUpperCase()} CO₂ Stream (${purity}%)`;

    listingRows.push(`  (${escapeSql(listId)}, ${escapeSql(emitter.id)}, ${escapeSql(emitter.facId)}, ${escapeSql(code)}, ${escapeSql(title)}, ${escapeSql(`High-reliability captured industrial CO2 stream from ${emitter.city} plant facility. Verified purity rating of ${purity}%.`)}, ${availQty}, ${remQty}, 'tonne', ${purity}, ${escapeSql(form)}, ${escapeSql(captureTechs[lIdx % captureTechs.length])}, ${escapeSql(`${emitter.industry} Flue Capture`)}, ${form === 'liquid' ? -18.0 : form === 'solid_dry_ice' ? -78.5 : 28.0}, ${form === 'supercritical' ? 75.0 : form === 'liquid' ? 25.0 : 12.0}, 1.00, ${price}, 'INR', NOW() - INTERVAL '10 days', NOW() + INTERVAL '120 days', true, true, ${escapeSql(status)}, '20000000-0000-4000-a000-000000000002')`);
  }

  sqlLines.push(`INSERT INTO co2_listings (id, organization_id, facility_id, listing_code, title, description, available_quantity, remaining_quantity, quantity_unit, purity_percentage, co2_physical_form, capture_method, capture_source, temperature_c, pressure_bar, minimum_order_quantity, price_per_unit, currency, available_from, available_until, delivery_available, pickup_available, status, created_by) VALUES\n${listingRows.join(',\n')}\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, price_per_unit = EXCLUDED.price_per_unit;`);
  sqlLines.push('');

  // 9. BUYER REQUIREMENTS (40 Requirements)
  sqlLines.push('-- 9. BUYER REQUIREMENTS (40 Active Demand Requirements)');
  const utilizerOrgs = orgSeeds.map((o, idx) => ({ ...o, id: createdOrgIds[idx], facId: createdFacIds[idx] })).filter(o => o.type === 'utilizer');
  const reqStatuses = ['PUBLISHED', 'PUBLISHED', 'PUBLISHED', 'DRAFT', 'PAUSED', 'FULFILLED'];
  const priorities = ['normal', 'high', 'urgent'];
  const utilTypeIds = [
    '11000000-0000-4000-a000-000000000001',
    '11000000-0000-4000-a000-000000000002',
    '11000000-0000-4000-a000-000000000003',
    '11000000-0000-4000-a000-000000000004',
    '11000000-0000-4000-a000-000000000005',
    '11000000-0000-4000-a000-000000000006',
    '11000000-0000-4000-a000-000000000007'
  ];

  const reqRows: string[] = [];
  const reqIds: string[] = [];

  for (let rIdx = 0; rIdx < 40; rIdx++) {
    const utilizer = utilizerOrgs[rIdx % utilizerOrgs.length];
    const reqId = makeUuid(7, rIdx + 1);
    reqIds.push(reqId);

    const code = `CL-REQ-00${(100 + rIdx + 1).toString().padStart(4, '0')}`;
    const form = physicalForms[rIdx % physicalForms.length];
    const minPurity = Number((95.0 + (rIdx * 0.12) % 4.5).toFixed(2));
    const maxPrice = Number((4000 + (rIdx * 175) % 3500).toFixed(2));
    const reqQty = Number((200 + (rIdx * 180) % 3000).toFixed(2));
    const status = reqStatuses[rIdx % reqStatuses.length];
    const priority = priorities[rIdx % priorities.length];
    const utilTypeId = utilTypeIds[rIdx % utilTypeIds.length];
    const title = `${utilizer.name} ${form.toUpperCase()} CO₂ Off-take Requirement`;

    reqRows.push(`  (${escapeSql(reqId)}, ${escapeSql(utilizer.id)}, ${escapeSql(code)}, ${escapeSql(title)}, ${escapeSql(`Feedstock sourcing requirement for ${utilizer.industry} operational line in ${utilizer.city}, ${utilizer.state}.`)}, ${reqQty}, 'tonne', ${minPurity}, 99.99, ${escapeSql(form)}, 'Any', ${maxPrice}, 'INR', NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', true, ${escapeSql(utilizer.facId)}, ${escapeSql(priority)}, ${escapeSql(status)}, '20000000-0000-4000-a000-000000000004', ${escapeSql(`Process manufacturing input for ${utilizer.name}`)}, ${escapeSql(utilizer.city)}, ${escapeSql(utilizer.state)}, ${escapeSql(utilTypeId)})`);
  }

  sqlLines.push(`INSERT INTO buyer_requirements (id, organization_id, requirement_code, title, description, required_quantity, quantity_unit, minimum_purity, maximum_purity, acceptable_physical_form, preferred_capture_method, maximum_price_per_unit, currency, required_from, required_until, delivery_required, destination_facility_id, priority, status, created_by, intended_use, location_city, location_state, utilization_type_id) VALUES\n${reqRows.join(',\n')}\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, maximum_price_per_unit = EXCLUDED.maximum_price_per_unit;`);
  sqlLines.push('');

  // 10. MATCHES & SCORES
  sqlLines.push('-- 10. MATCHES & COMPATIBILITY SCORES');
  const matchRows: string[] = [];

  for (let mIdx = 0; mIdx < 40; mIdx++) {
    const mId = makeUuid(8, mIdx + 1);
    const reqId = reqIds[mIdx];
    const listId = listingIds[mIdx];

    const overallScore = Number((88.0 + (mIdx * 0.3) % 11.5).toFixed(2));
    const purityScore = Number((90.0 + (mIdx * 0.2) % 9.5).toFixed(2));
    const distScore = Number((85.0 + (mIdx * 0.4) % 14.5).toFixed(2));
    const priceScore = Number((89.0 + (mIdx * 0.25) % 10.0).toFixed(2));

    matchRows.push(`  (${escapeSql(mId)}, ${escapeSql(reqId)}, ${escapeSql(listId)}, 'suggested', ${overallScore}, ${overallScore}, 98.00, ${purityScore}, ${distScore}, ${priceScore}, 95.00, 92.00, ${(50 + mIdx * 12.5)}, ${(200 + mIdx * 15.0)}, ${(4200 + mIdx * 50.0)}, ${escapeSql(`High compatibility match (${overallScore}%) between CO2 supply stream and utilization facility.`)})`);
  }

  sqlLines.push(`INSERT INTO matches (id, requirement_id, listing_id, status, overall_score, overall_match_score, quantity_score, purity_score, distance_score, price_score, availability_score, use_case_score, estimated_distance_km, estimated_transport_cost, estimated_delivered_cost, matching_reason) VALUES\n${matchRows.join(',\n')}\nON CONFLICT (requirement_id, listing_id) DO UPDATE SET overall_score = EXCLUDED.overall_score;`);
  sqlLines.push('');

  // 11. INQUIRIES, OFFERS & ORDERS
  sqlLines.push('-- 11. INQUIRIES, COMMERCIAL OFFERS & ORDERS');
  const inqRows: string[] = [];
  const offerRows: string[] = [];
  const offerItemRows: string[] = [];
  const orderRows: string[] = [];
  const orderItemRows: string[] = [];

  const inqIds: string[] = [];
  const offerIds: string[] = [];
  const orderIds: string[] = [];

  const buyerOrg = createdOrgIds[3]; // GreenForge
  const sellerOrg = createdOrgIds[0]; // TerraCem
  const logisticsOrg = createdOrgIds[6]; // TransCarbon

  for (let tIdx = 0; tIdx < 15; tIdx++) {
    const inqId = makeUuid(9, tIdx + 1);
    const offerId = makeUuid(10, tIdx + 1);
    const orderId = makeUuid(11, tIdx + 1);

    inqIds.push(inqId);
    offerIds.push(offerId);
    orderIds.push(orderId);

    const listId = listingIds[tIdx];
    const reqId = reqIds[tIdx];
    const qty = 250 + tIdx * 50;
    const unitPrice = 4500 + tIdx * 100;
    const freightCost = 100000 + tIdx * 10000;
    const subtotal = qty * unitPrice;
    const total = subtotal + freightCost;

    inqRows.push(`  (${escapeSql(inqId)}, ${escapeSql(listId)}, ${escapeSql(reqId)}, ${escapeSql(buyerOrg)}, ${escapeSql(sellerOrg)}, '20000000-0000-4000-a000-000000000004', ${qty}, ${escapeSql(`Commercial inquiry for ${qty} tonnes of CO2 feedstock.`)}, 'converted_to_offer')`);

    offerRows.push(`  (${escapeSql(offerId)}, ${escapeSql(inqId)}, ${escapeSql(`OFF-TC-2026-0${10 + tIdx}`)}, ${escapeSql(listId)}, ${escapeSql(buyerOrg)}, ${escapeSql(sellerOrg)}, ${escapeSql(sellerOrg)}, ${qty}, ${qty}, 'tonne', ${unitPrice}, ${unitPrice}, 'INR', ${freightCost}, ${total}, ${total}, NOW() + INTERVAL '14 days', ${escapeSql(`Firm commercial quote for ${qty} tonnes CO2 delivery.`)}, 'accepted')`);

    offerItemRows.push(`  (${escapeSql(offerId)}, 'High-Purity Industrial Liquid CO2 Stream', ${qty}, 'tonne', ${unitPrice}, ${subtotal})`);
    offerItemRows.push(`  (${escapeSql(offerId)}, 'Cryogenic ISO Tanker Logistics & Freight', 1.00, 'lot', ${freightCost}, ${freightCost})`);

    const orderStatus = tIdx < 5 ? 'in_transit' : tIdx < 10 ? 'delivered' : 'confirmed';

    orderRows.push(`  (${escapeSql(orderId)}, ${escapeSql(`ORD-2026-${8800 + tIdx}`)}, ${escapeSql(buyerOrg)}, ${escapeSql(sellerOrg)}, ${escapeSql(listId)}, ${escapeSql(reqId)}, ${escapeSql(offerId)}, ${qty}, ${qty}, 'tonne', ${unitPrice}, ${unitPrice}, 'INR', ${subtotal}, ${subtotal}, ${freightCost}, ${(subtotal * 0.05)}, ${(total * 1.05)}, 'Nandesari GIDC, Plot 42', 'Vadodara', 'Gujarat', '391340', ${escapeSql(orderStatus)}, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')`);

    orderItemRows.push(`  (${escapeSql(orderId)}, ${escapeSql(listId)}, 'Industrial CO2 Feedstock', ${qty}, 'tonne', ${unitPrice}, ${subtotal})`);
  }

  sqlLines.push(`INSERT INTO inquiries (id, listing_id, requirement_id, buyer_organization_id, seller_organization_id, initiated_by, requested_quantity, message, status) VALUES\n${inqRows.join(',\n')}\nON CONFLICT (id) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO offers (id, inquiry_id, offer_number, listing_id, buyer_organization_id, seller_organization_id, offered_by_organization_id, quantity, offered_quantity_tons, quantity_unit, unit_price, offered_price_per_ton, currency, delivery_cost, total_estimated_cost, total_amount, valid_until, message, status) VALUES\n${offerRows.join(',\n')}\nON CONFLICT (offer_number) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO offer_items (offer_id, description, quantity, unit, unit_price, subtotal) VALUES\n${offerItemRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO orders (id, order_number, buyer_organization_id, seller_organization_id, listing_id, requirement_id, accepted_offer_id, quantity, quantity_tons, quantity_unit, unit_price, price_per_ton, currency, subtotal, subtotal_amount, transport_cost, tax_amount, total_amount, delivery_address, delivery_city, delivery_state, delivery_postal_code, status, ordered_at, accepted_at) VALUES\n${orderRows.join(',\n')}\nON CONFLICT (order_number) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO order_items (order_id, listing_id, description, quantity, quantity_unit, unit_price, subtotal) VALUES\n${orderItemRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  // 12. LOGISTICS QUOTES, SHIPMENTS & TRACKING
  sqlLines.push('-- 12. LOGISTICS QUOTES, SHIPMENTS, ROUTES & TELEMETRY EVENTS');
  const quoteRows: string[] = [];
  const shipmentRows: string[] = [];
  const routeRows: string[] = [];
  const eventRows: string[] = [];

  const shipmentIds: string[] = [];

  for (let sIdx = 0; sIdx < 15; sIdx++) {
    const orderId = orderIds[sIdx];
    const shipmentId = makeUuid(12, sIdx + 1);
    shipmentIds.push(shipmentId);

    const originFac = createdFacIds[0];
    const destFac = createdFacIds[3];
    const qty = 250 + sIdx * 50;
    const distanceKm = 112.5 + sIdx * 15.0;

    quoteRows.push(`  (${escapeSql(orderId)}, ${escapeSql(logisticsOrg)}, ${escapeSql(originFac)}, ${escapeSql(destFac)}, ${distanceKm}, 180, 'ISO_TANK_TRUCK', 120000.00, 20000.00, 140000.00, NOW() + INTERVAL '30 days', 'accepted')`);

    const shpStatus = sIdx < 5 ? 'in_transit' : sIdx < 10 ? 'delivered' : 'scheduled';

    shipmentRows.push(`  (${escapeSql(shipmentId)}, ${escapeSql(`SHP-TC-${9900 + sIdx}`)}, ${escapeSql(orderId)}, ${escapeSql(logisticsOrg)}, ${escapeSql(originFac)}, ${escapeSql(destFac)}, ${qty}, ${qty}, 'tonne', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '6 hours', ${distanceKm}, 'ISO_TANK_TRUCK', 'Nandesari GIDC Industrial Estate, Vadodara', ${escapeSql(`TRK-GJ01-${88900 + sIdx}`)}, ${escapeSql(shpStatus)})`);

    routeRows.push(`  (${escapeSql(shipmentId)}, 1, 'Ahmedabad Cement Capture Facility Gate', 'origin', 22.9583, 72.6369)`);
    routeRows.push(`  (${escapeSql(shipmentId)}, 2, 'Nadiad Highway Expressway Checkpoint', 'checkpoint', 22.6916, 72.8634)`);
    routeRows.push(`  (${escapeSql(shipmentId)}, 3, 'Anand Toll & Freight Plaza', 'checkpoint', 22.5645, 72.9289)`);
    routeRows.push(`  (${escapeSql(shipmentId)}, 4, 'GreenForge Vadodara Plant Receiver Yard', 'destination', 22.4110, 73.0890)`);

    eventRows.push(`  (${escapeSql(shipmentId)}, 'loaded', 'dispatched', 'dispatched', 22.9583, 72.6369, 'Ahmedabad Capture Plant', 'ISO Tanker loaded and pressurized to 25.4 bar at -16.2C.', NOW() - INTERVAL '36 hours')`);
    eventRows.push(`  (${escapeSql(shipmentId)}, 'checkpoint_passed', 'in_transit', 'in_transit', 22.6916, 72.8634, 'Nadiad Highway Plaza', 'Weigh station verification cleared. Telemetry sensors normal.', NOW() - INTERVAL '18 hours')`);
    eventRows.push(`  (${escapeSql(shipmentId)}, 'checkpoint_passed', 'in_transit', 'in_transit', 22.5645, 72.9289, 'Anand Freight Hub', 'En route on Corridor 8 to Vadodara industrial site.', NOW() - INTERVAL '4 hours')`);
  }

  sqlLines.push(`INSERT INTO logistics_quotes (order_id, provider_organization_id, origin_facility_id, destination_facility_id, distance_km, estimated_duration_minutes, transport_mode, base_cost, fuel_surcharge, total_cost, valid_until, status) VALUES\n${quoteRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO shipments (id, shipment_number, order_id, logistics_provider_id, origin_facility_id, destination_facility_id, quantity, quantity_tons, quantity_unit, scheduled_pickup_at, actual_pickup_at, estimated_delivery_at, distance_km, transport_mode, destination_address, tracking_reference, status) VALUES\n${shipmentRows.join(',\n')}\nON CONFLICT (shipment_number) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO shipment_routes (shipment_id, sequence_number, location_name, location_type, latitude, longitude) VALUES\n${routeRows.join(',\n')}\nON CONFLICT (shipment_id, sequence_number) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO shipment_tracking_events (shipment_id, event_type, status, event_status, latitude, longitude, location_name, notes, occurred_at) VALUES\n${eventRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  // 13. INVOICES & PAYMENTS
  sqlLines.push('-- 13. INVOICES & PAYMENTS');
  const invRows: string[] = [];
  const payRows: string[] = [];

  for (let iIdx = 0; iIdx < 15; iIdx++) {
    const invId = makeUuid(13, iIdx + 1);
    const orderId = orderIds[iIdx];
    const amount = (250 + iIdx * 50) * 4500 + 100000 + iIdx * 10000;

    invRows.push(`  (${escapeSql(invId)}, ${escapeSql(`INV-2026-00${90 + iIdx}`)}, ${escapeSql(orderId)}, ${escapeSql(sellerOrg)}, ${escapeSql(buyerOrg)}, ${amount}, ${(amount * 0.05)}, ${(amount * 1.05)}, 'INR', 'paid', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', NOW() - INTERVAL '2 days')`);

    payRows.push(`  (${escapeSql(invId)}, ${escapeSql(orderId)}, ${(amount * 1.05)}, 'INR', 'bank_transfer', ${escapeSql(`UTR-HDFC-202609-${1000 + iIdx}`)}, 'completed', NOW() - INTERVAL '2 days')`);
  }

  sqlLines.push(`INSERT INTO invoices (id, invoice_number, order_id, issued_by_organization_id, billed_to_organization_id, subtotal, tax_amount, total_amount, currency, status, issued_at, due_at, paid_at) VALUES\n${invRows.join(',\n')}\nON CONFLICT (invoice_number) DO NOTHING;`);
  sqlLines.push('');
  sqlLines.push(`INSERT INTO payments (invoice_id, order_id, amount, currency, payment_method, provider_reference, status, paid_at) VALUES\n${payRows.join(',\n')}\nON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  // 14. NOTIFICATIONS, AUDIT LOGS & ALERTS
  sqlLines.push('-- 14. NOTIFICATIONS, AUDIT LOGS & SYSTEM ALERTS');
  sqlLines.push(`INSERT INTO notifications (user_id, type, title, message, entity_type, entity_id, is_read) VALUES
  ('20000000-0000-4000-a000-000000000004', 'match_found', 'High-Compatibility CO2 Match Found', 'Your requirement matched 96.5% with TerraCem Ahmedabad Cement Works.', 'matches', '80000000-0000-4000-a000-000000000001', false),
  ('20000000-0000-4000-a000-000000000002', 'inquiry_received', 'New Commercial Inquiry for CO2 Supply', 'GreenForge Materials submitted an inquiry for 350 tonnes.', 'inquiries', '90000000-0000-4000-a000-000000000001', true),
  ('20000000-0000-4000-a000-000000000004', 'shipment_update', 'ISO Tanker Dispatched', 'Shipment SHP-TC-9901 is en route to Vadodara Industrial Estate.', 'shipments', 'c0000000-0000-4000-a000-000000000001', false),
  ('20000000-0000-4000-a000-000000000007', 'route_assigned', 'New Transport Order Assigned', 'Assigned ISO Tanker shipment from TerraCem to GreenForge.', 'shipments', 'c0000000-0000-4000-a000-000000000001', true),
  ('20000000-0000-4000-a000-000000000008', 'regulatory_audit', 'Facility Compliance Verified', 'GPCB verified ISO 14064 certification for Hazira Steel Works.', 'facilities', '40000000-0000-4000-a000-000000000002', true)
ON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  sqlLines.push(`INSERT INTO system_alerts (category, title, message, severity, entity_type, entity_id) VALUES
  ('COMPLIANCE_EXPIRY_WARNING', 'Certification Expiry Approaching', 'Facility FAC-TC-001 ISO certification will expire in 45 days.', 'WARNING', 'facilities', '40000000-0000-4000-a000-000000000001'),
  ('TEMPERATURE_EXCURSION', 'Telemetry Alert: Pressure Normal', 'Shipment SHP-TC-9901 pressure confirmed at 25.4 bar.', 'INFO', 'shipments', 'c0000000-0000-4000-a000-000000000001')
ON CONFLICT DO NOTHING;`);
  sqlLines.push('');

  sqlLines.push('COMMIT;');
  sqlLines.push('');
  sqlLines.push('-- CarbonLoop Large Scale Database Seed Complete!');

  const finalSql = sqlLines.join('\n');
  const targetPath = path.resolve(__dirname, '../../seed.sql');

  fs.writeFileSync(targetPath, finalSql, 'utf8');
  console.log(`Successfully generated massive seed.sql file at ${targetPath} (${finalSql.length} bytes, ${sqlLines.length} lines)!`);
}

main().catch(err => {
  console.error('Error generating seed SQL:', err);
  process.exit(1);
});
