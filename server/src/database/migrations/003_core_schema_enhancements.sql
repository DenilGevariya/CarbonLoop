-- Core Schema Enhancements & Comprehensive Entity Model for CarbonLoop

-- 1. Users table enhancements
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Organizations table enhancements
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_identifier VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'verified';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 3. Organization Members table enhancements
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Facilities table enhancements
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS facility_code VARCHAR(50);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'operational';
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS contact_name VARCHAR(100);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS operational_since DATE;

-- Update address_line1 from address if address exists
UPDATE facilities SET address_line1 = address WHERE address_line1 IS NULL AND address IS NOT NULL;

-- 5. Generic Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL DEFAULT 'other',
    file_name VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    file_size BIGINT NOT NULL DEFAULT 0,
    checksum VARCHAR(128),
    description TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Facility Certifications enhancement (link to documents)
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(100);
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS issuing_authority VARCHAR(255);
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS issued_at DATE;
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update columns from old names if exist
UPDATE facility_certifications SET issuing_authority = issuing_body WHERE issuing_authority IS NULL AND issuing_body IS NOT NULL;
UPDATE facility_certifications SET issued_at = issued_date WHERE issued_at IS NULL AND issued_date IS NOT NULL;
UPDATE facility_certifications SET expires_at = expiry_date WHERE expires_at IS NULL AND expiry_date IS NOT NULL;

-- 7. CO2 Listings enhancements
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS listing_code VARCHAR(50);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS available_quantity NUMERIC(14,3);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS remaining_quantity NUMERIC(14,3);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS co2_physical_form VARCHAR(50);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS capture_method VARCHAR(255);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS capture_source VARCHAR(255);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS temperature_c NUMERIC(6,2);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS minimum_order_quantity NUMERIC(14,3);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS price_per_unit NUMERIC(12,2);
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS available_from TIMESTAMPTZ;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT TRUE;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS pickup_available BOOLEAN DEFAULT TRUE;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Synchronize legacy column names if present
UPDATE co2_listings SET available_quantity = available_quantity_tons WHERE available_quantity IS NULL AND available_quantity_tons IS NOT NULL;
UPDATE co2_listings SET remaining_quantity = available_quantity WHERE remaining_quantity IS NULL AND available_quantity IS NOT NULL;
UPDATE co2_listings SET price_per_unit = price_per_ton WHERE price_per_unit IS NULL AND price_per_ton IS NOT NULL;
UPDATE co2_listings SET co2_physical_form = state_form WHERE co2_physical_form IS NULL AND state_form IS NOT NULL;
UPDATE co2_listings SET temperature_c = temperature_celsius WHERE temperature_c IS NULL AND temperature_celsius IS NOT NULL;
UPDATE co2_listings SET minimum_order_quantity = minimum_order_tons WHERE minimum_order_quantity IS NULL AND minimum_order_tons IS NOT NULL;
UPDATE co2_listings SET available_from = availability_start_date WHERE available_from IS NULL AND availability_start_date IS NOT NULL;
UPDATE co2_listings SET available_until = availability_end_date WHERE available_until IS NULL AND availability_end_date IS NOT NULL;

-- 8. CO2 Listing Documents Table
CREATE TABLE IF NOT EXISTS co2_listing_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    document_role VARCHAR(50) NOT NULL DEFAULT 'purity_proof',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id, document_id)
);

-- 9. CO2 Listing Status History enhancements
ALTER TABLE co2_listing_status_history ADD COLUMN IF NOT EXISTS from_status VARCHAR(50);
ALTER TABLE co2_listing_status_history ADD COLUMN IF NOT EXISTS to_status VARCHAR(50);
ALTER TABLE co2_listing_status_history ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE co2_listing_status_history SET from_status = previous_status WHERE from_status IS NULL AND previous_status IS NOT NULL;
UPDATE co2_listing_status_history SET to_status = new_status WHERE to_status IS NULL AND new_status IS NOT NULL;
UPDATE co2_listing_status_history SET changed_by = changed_by_user_id WHERE changed_by IS NULL AND changed_by_user_id IS NOT NULL;

-- 10. Buyer Requirements enhancements
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS requirement_code VARCHAR(50);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS required_quantity NUMERIC(14,3);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS minimum_purity NUMERIC(5,2);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS maximum_purity NUMERIC(5,2);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS acceptable_physical_form VARCHAR(50);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS preferred_capture_method VARCHAR(255);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS maximum_price_per_unit NUMERIC(12,2);
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'INR';
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS required_from TIMESTAMPTZ;
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS required_until TIMESTAMPTZ;
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS delivery_required BOOLEAN DEFAULT TRUE;
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS destination_facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL;
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium';
ALTER TABLE buyer_requirements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE buyer_requirements SET required_quantity = required_quantity_tons WHERE required_quantity IS NULL AND required_quantity_tons IS NOT NULL;
UPDATE buyer_requirements SET minimum_purity = required_purity_percentage WHERE minimum_purity IS NULL AND required_purity_percentage IS NOT NULL;
UPDATE buyer_requirements SET maximum_price_per_unit = target_price_per_ton WHERE maximum_price_per_unit IS NULL AND target_price_per_ton IS NOT NULL;
UPDATE buyer_requirements SET acceptable_physical_form = preferred_state_form WHERE acceptable_physical_form IS NULL AND preferred_state_form IS NOT NULL;
UPDATE buyer_requirements SET destination_facility_id = facility_id WHERE destination_facility_id IS NULL AND facility_id IS NOT NULL;
UPDATE buyer_requirements SET required_from = required_by_date WHERE required_from IS NULL AND required_by_date IS NOT NULL;

-- 11. Buyer Requirement Status History enhancements
ALTER TABLE buyer_requirement_status_history ADD COLUMN IF NOT EXISTS from_status VARCHAR(50);
ALTER TABLE buyer_requirement_status_history ADD COLUMN IF NOT EXISTS to_status VARCHAR(50);
ALTER TABLE buyer_requirement_status_history ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE buyer_requirement_status_history SET from_status = previous_status WHERE from_status IS NULL AND previous_status IS NOT NULL;
UPDATE buyer_requirement_status_history SET to_status = new_status WHERE to_status IS NULL AND new_status IS NOT NULL;
UPDATE buyer_requirement_status_history SET changed_by = changed_by_user_id WHERE changed_by IS NULL AND changed_by_user_id IS NOT NULL;

-- 12. Matches enhancements
ALTER TABLE matches ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS quantity_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS purity_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS distance_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS price_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS availability_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS use_case_score NUMERIC(5,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_distance_km NUMERIC(10,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_transport_cost NUMERIC(12,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_delivered_cost NUMERIC(12,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS matching_reason TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE matches SET overall_score = overall_match_score WHERE overall_score IS NULL AND overall_match_score IS NOT NULL;
UPDATE matches SET purity_score = purity_match_score WHERE purity_score IS NULL AND purity_match_score IS NOT NULL;
UPDATE matches SET distance_score = distance_match_score WHERE distance_score IS NULL AND distance_match_score IS NOT NULL;
UPDATE matches SET price_score = price_match_score WHERE price_score IS NULL AND price_match_score IS NOT NULL;
UPDATE matches SET quantity_score = volume_match_score WHERE quantity_score IS NULL AND volume_match_score IS NOT NULL;
UPDATE matches SET estimated_distance_km = distance_km WHERE estimated_distance_km IS NULL AND distance_km IS NOT NULL;

-- 13. Match Score Factor Breakdown Table
CREATE TABLE IF NOT EXISTS match_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    factor VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES buyer_requirements(id) ON DELETE SET NULL,
    buyer_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    seller_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_quantity NUMERIC(14,3) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Offers enhancements
ALTER TABLE offers ADD COLUMN IF NOT EXISTS inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_number VARCHAR(50);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offered_by_organization_id UUID REFERENCES organizations(id) ON DELETE RESTRICT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS quantity NUMERIC(14,3);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'INR';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS total_estimated_cost NUMERIC(12,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS message TEXT;

UPDATE offers SET quantity = offered_quantity_tons WHERE quantity IS NULL AND offered_quantity_tons IS NOT NULL;
UPDATE offers SET unit_price = offered_price_per_ton WHERE unit_price IS NULL AND offered_price_per_ton IS NOT NULL;
UPDATE offers SET total_estimated_cost = total_amount WHERE total_estimated_cost IS NULL AND total_amount IS NOT NULL;
UPDATE offers SET offered_by_organization_id = buyer_organization_id WHERE offered_by_organization_id IS NULL AND buyer_organization_id IS NOT NULL;

-- 16. Offer Items Table
CREATE TABLE IF NOT EXISTS offer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'tonne',
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Orders enhancements
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES buyer_requirements(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity NUMERIC(14,3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transport_cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_state VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_country VARCHAR(100) DEFAULT 'India';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

UPDATE orders SET quantity = quantity_tons WHERE quantity IS NULL AND quantity_tons IS NOT NULL;
UPDATE orders SET unit_price = price_per_ton WHERE unit_price IS NULL AND price_per_ton IS NOT NULL;
UPDATE orders SET subtotal = subtotal_amount WHERE subtotal IS NULL AND subtotal_amount IS NOT NULL;
UPDATE orders SET transport_cost = logistics_fee WHERE transport_cost IS NULL AND logistics_fee IS NOT NULL;
UPDATE orders SET accepted_offer_id = offer_id WHERE accepted_offer_id IS NULL AND offer_id IS NOT NULL;

-- 18. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES co2_listings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL DEFAULT 'tonne',
    unit_price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    contract_type VARCHAR(50) NOT NULL DEFAULT 'standard_supply',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    effective_from TIMESTAMPTZ NOT NULL,
    effective_until TIMESTAMPTZ NOT NULL,
    signed_at TIMESTAMPTZ,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Logistics Quotes Table
CREATE TABLE IF NOT EXISTS logistics_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    provider_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    origin_facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    destination_facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    distance_km NUMERIC(10,2) NOT NULL,
    estimated_duration_minutes INT,
    transport_mode VARCHAR(50) NOT NULL DEFAULT 'ISO_TANK_TRUCK',
    base_cost NUMERIC(12,2) NOT NULL,
    fuel_surcharge NUMERIC(12,2) NOT NULL DEFAULT 0,
    handling_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    other_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    estimated_co2e_kg NUMERIC(12,2),
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Shipments enhancements
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS quantity NUMERIC(14,3);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS scheduled_pickup_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS actual_pickup_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS actual_delivery_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_reference VARCHAR(100);

UPDATE shipments SET quantity = quantity_tons WHERE quantity IS NULL AND quantity_tons IS NOT NULL;
UPDATE shipments SET scheduled_pickup_at = pickup_date WHERE scheduled_pickup_at IS NULL AND pickup_date IS NOT NULL;
UPDATE shipments SET estimated_delivery_at = estimated_delivery_date WHERE estimated_delivery_at IS NULL AND estimated_delivery_date IS NOT NULL;
UPDATE shipments SET actual_delivery_at = actual_delivery_date WHERE actual_delivery_at IS NULL AND actual_delivery_date IS NOT NULL;
UPDATE shipments SET distance_km = estimated_distance_km WHERE distance_km IS NULL AND estimated_distance_km IS NOT NULL;

-- 22. Shipment Routes Table
CREATE TABLE IF NOT EXISTS shipment_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) NOT NULL DEFAULT 'checkpoint',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    arrival_estimate TIMESTAMPTZ,
    departure_estimate TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(shipment_id, sequence_number)
);

-- 23. Shipment Tracking Events enhancements
ALTER TABLE shipment_tracking_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50);
ALTER TABLE shipment_tracking_events ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE shipment_tracking_events ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shipment_tracking_events ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE shipment_tracking_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE shipment_tracking_events SET status = event_status WHERE status IS NULL AND event_status IS NOT NULL;
UPDATE shipment_tracking_events SET notes = description WHERE notes IS NULL AND description IS NOT NULL;
UPDATE shipment_tracking_events SET occurred_at = event_time WHERE occurred_at IS NULL AND event_time IS NOT NULL;

-- 24. Verification Requests enhancements
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES co2_listings(id) ON DELETE SET NULL;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS verification_type VARCHAR(50);
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE verification_requests SET verification_type = request_type WHERE verification_type IS NULL AND request_type IS NOT NULL;
UPDATE verification_requests SET reviewed_at = completed_at WHERE reviewed_at IS NULL AND completed_at IS NOT NULL;
UPDATE verification_requests SET review_notes = notes WHERE review_notes IS NULL AND notes IS NOT NULL;

-- 25. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    issued_by_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    billed_to_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    provider_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. Notifications enhancements
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 28. Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

-- 29. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    reviewer_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    reviewed_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, reviewer_organization_id)
);

-- 30. Audit Logs enhancements
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

UPDATE audit_logs SET actor_user_id = user_id WHERE actor_user_id IS NULL AND user_id IS NOT NULL;
UPDATE audit_logs SET new_values = payload WHERE new_values IS NULL AND payload IS NOT NULL;
