-- Update and Relax Legacy inline check constraints and ensure UNIQUE constraints exist for ON CONFLICT

-- Unique Constraints for Seed / Upsert Safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_facilities_org_code') THEN
        ALTER TABLE facilities ADD CONSTRAINT uq_facilities_org_code UNIQUE (organization_id, facility_code);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_co2_listings_code') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT uq_co2_listings_code UNIQUE (listing_code);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_buyer_requirements_code') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT uq_buyer_requirements_code UNIQUE (requirement_code);
    END IF;
END $$;

-- Check Constraints
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_org_type_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_org_type_check 
    CHECK (org_type IN ('EMITTER', 'BUYER', 'LOGISTICS_PROVIDER', 'VERIFIER', 'ADMIN', 'emitter', 'utilizer', 'logistics_provider', 'verifier', 'regulator', 'admin'));

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_verification_status_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_verification_status_check 
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'pending', 'verified', 'rejected', 'suspended'));

ALTER TABLE co2_listings DROP CONSTRAINT IF EXISTS co2_listings_state_form_check;
ALTER TABLE co2_listings ADD CONSTRAINT co2_listings_state_form_check 
    CHECK (state_form IN ('GASEOUS', 'LIQUID', 'SUPERCRITICAL', 'SOLID_DRY_ICE', 'gaseous', 'liquid', 'supercritical', 'solid_dry_ice'));

ALTER TABLE co2_listings DROP CONSTRAINT IF EXISTS co2_listings_status_check;
ALTER TABLE co2_listings ADD CONSTRAINT co2_listings_status_check 
    CHECK (status IN ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD_OUT', 'CANCELLED', 'draft', 'active', 'reserved', 'sold_out', 'cancelled', 'expired'));

ALTER TABLE buyer_requirements DROP CONSTRAINT IF EXISTS buyer_requirements_status_check;
ALTER TABLE buyer_requirements ADD CONSTRAINT buyer_requirements_status_check 
    CHECK (status IN ('DRAFT', 'ACTIVE', 'MATCHED', 'FULFILLED', 'CANCELLED', 'draft', 'active', 'matched', 'in_negotiation', 'fulfilled', 'cancelled', 'expired'));

ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
    CHECK (status IN ('SUGGESTED', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'CONVERTED_TO_OFFER', 'suggested', 'reviewed', 'accepted', 'rejected', 'converted_to_inquiry', 'converted_to_offer', 'expired'));

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check 
    CHECK (status IN ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'draft', 'pending', 'countered', 'accepted', 'declined', 'expired', 'withdrawn'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('DRAFT', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'draft', 'pending', 'confirmed', 'contracted', 'in_transit', 'delivered', 'completed', 'cancelled'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_status_check 
    CHECK (status IN ('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED', 'scheduled', 'dispatched', 'in_transit', 'delivered', 'delayed', 'cancelled'));

ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_status_check;
ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_status_check 
    CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'pending', 'under_review', 'approved', 'rejected', 'requires_info'));
