-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration Tracking Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 4. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    org_type VARCHAR(50) NOT NULL CHECK (org_type IN ('EMITTER', 'BUYER', 'LOGISTICS_PROVIDER', 'VERIFIER', 'ADMIN')),
    industry VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 6. Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100) NOT NULL, -- e.g., Cement Plant, Power Station, Chemical Refinery, Utilization Hub
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    annual_co2_capacity_tons NUMERIC(12, 2),
    capture_technology VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Facility Certifications
CREATE TABLE IF NOT EXISTS facility_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    issuing_body VARCHAR(255) NOT NULL,
    document_url TEXT,
    issued_date DATE,
    expiry_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CO2 Listings (Supply)
CREATE TABLE IF NOT EXISTS co2_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    purity_percentage NUMERIC(5, 2) NOT NULL CHECK (purity_percentage >= 0 AND purity_percentage <= 100),
    pressure_bar NUMERIC(8, 2),
    temperature_celsius NUMERIC(6, 2),
    state_form VARCHAR(50) NOT NULL CHECK (state_form IN ('GASEOUS', 'LIQUID', 'SUPERCRITICAL', 'SOLID_DRY_ICE')),
    contaminants_description TEXT,
    available_quantity_tons NUMERIC(12, 2) NOT NULL,
    minimum_order_tons NUMERIC(12, 2) DEFAULT 1,
    price_per_ton NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    availability_start_date DATE NOT NULL,
    availability_end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD_OUT', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CO2 Listing Status History
CREATE TABLE IF NOT EXISTS co2_listing_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Buyer Requirements (Demand)
CREATE TABLE IF NOT EXISTS buyer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    intended_use VARCHAR(100) NOT NULL, -- e.g., Concrete Curing, E-Fuels, Algae Cultivation, Beverage Carbonation, Chemical Synthesis
    required_purity_percentage NUMERIC(5, 2) NOT NULL,
    preferred_state_form VARCHAR(50),
    required_quantity_tons NUMERIC(12, 2) NOT NULL,
    target_price_per_ton NUMERIC(10, 2),
    max_distance_km NUMERIC(8, 2),
    location_city VARCHAR(100) NOT NULL,
    location_state VARCHAR(100) NOT NULL,
    required_by_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'MATCHED', 'FULFILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Buyer Requirement Status History
CREATE TABLE IF NOT EXISTS buyer_requirement_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES buyer_requirements(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Matches & Match Scores
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES buyer_requirements(id) ON DELETE CASCADE,
    overall_match_score NUMERIC(5, 2) NOT NULL CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
    purity_match_score NUMERIC(5, 2),
    distance_km NUMERIC(8, 2),
    distance_match_score NUMERIC(5, 2),
    price_match_score NUMERIC(5, 2),
    volume_match_score NUMERIC(5, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'SUGGESTED' CHECK (status IN ('SUGGESTED', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'CONVERTED_TO_OFFER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id, requirement_id)
);

-- 13. Inquiries & Offers
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    buyer_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    seller_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    offered_quantity_tons NUMERIC(12, 2) NOT NULL,
    offered_price_per_ton NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    delivery_terms TEXT,
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Orders & Contracts
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    listing_id UUID NOT NULL REFERENCES co2_listings(id),
    buyer_organization_id UUID NOT NULL REFERENCES organizations(id),
    seller_organization_id UUID NOT NULL REFERENCES organizations(id),
    quantity_tons NUMERIC(12, 2) NOT NULL,
    price_per_ton NUMERIC(10, 2) NOT NULL,
    subtotal_amount NUMERIC(12, 2) NOT NULL,
    logistics_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Logistics Quotes & Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    logistics_provider_id UUID REFERENCES organizations(id),
    origin_facility_id UUID NOT NULL REFERENCES facilities(id),
    destination_facility_id UUID REFERENCES facilities(id),
    destination_address TEXT NOT NULL,
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('ISO_TANK_TRUCK', 'PIPELINE', 'CYLINDER_CASCADE', 'RAIL_TANKER')),
    quantity_tons NUMERIC(12, 2) NOT NULL,
    estimated_distance_km NUMERIC(8, 2),
    pickup_date TIMESTAMPTZ,
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'DISPATCHED' CHECK (status IN ('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Shipment Tracking Events
CREATE TABLE IF NOT EXISTS shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    event_status VARCHAR(50) NOT NULL,
    description TEXT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Verification Requests & Documents
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    verifier_organization_id UUID REFERENCES organizations(id),
    request_type VARCHAR(50) NOT NULL, -- e.g., Facility Emission Verification, CO2 Purity Certification
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES for fast querying
CREATE INDEX IF NOT EXISTS idx_co2_listings_org ON co2_listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_co2_listings_status ON co2_listings(status);
CREATE INDEX IF NOT EXISTS idx_co2_listings_purity ON co2_listings(purity_percentage);

CREATE INDEX IF NOT EXISTS idx_buyer_requirements_org ON buyer_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status ON buyer_requirements(status);

CREATE INDEX IF NOT EXISTS idx_matches_listing_req ON matches(listing_id, requirement_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(overall_match_score DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_organization_id);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
