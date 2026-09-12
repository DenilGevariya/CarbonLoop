-- ====================================================================
-- CarbonLoop Database Migration 023: Trust Network & Verification Layer
-- ====================================================================

BEGIN;

-- 1. Organizations Verification Enhancements
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_verification_status_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_verification_status_check
  CHECK (verification_status IN (
    'UNVERIFIED', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'EXPIRED',
    'PENDING', 'pending', 'verified', 'rejected', 'suspended'
  ));

-- 2. Facilities Verification Enhancements
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_verification_status_check;
ALTER TABLE facilities ADD CONSTRAINT facilities_verification_status_check
  CHECK (verification_status IN (
    'UNVERIFIED', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'PENDING'
  ));

-- 3. CO2 Listings Verification & Quality Enhancements
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE co2_listings ADD COLUMN IF NOT EXISTS latest_verified_purity NUMERIC(5,2);

ALTER TABLE co2_listings DROP CONSTRAINT IF EXISTS co2_listings_verification_status_check;
ALTER TABLE co2_listings ADD CONSTRAINT co2_listings_verification_status_check
  CHECK (verification_status IN (
    'UNVERIFIED', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'EXPIRED'
  ));

-- 4. Generic Documents Table Enhancements
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;
ALTER TABLE documents ADD CONSTRAINT documents_status_check
  CHECK (status IN ('UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'));

-- 5. Facility Certifications Enhancements
ALTER TABLE facility_certifications ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION';

ALTER TABLE facility_certifications DROP CONSTRAINT IF EXISTS facility_certifications_status_check;
ALTER TABLE facility_certifications ADD CONSTRAINT facility_certifications_status_check
  CHECK (status IN ('ACTIVE', 'EXPIRED', 'PENDING_VERIFICATION', 'REVOKED'));

-- 6. CO2 Quality Records Table (Historical Lab Test Evidence)
CREATE TABLE IF NOT EXISTS co2_quality_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES co2_listings(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    purity_percentage NUMERIC(5,2) NOT NULL CHECK (purity_percentage >= 0 AND purity_percentage <= 100),
    measurement_date DATE NOT NULL,
    laboratory_name VARCHAR(255) NOT NULL,
    test_method VARCHAR(255),
    sample_reference VARCHAR(100),
    notes TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Verification Requests Table Enhancements
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_status_check;
ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_status_check
  CHECK (status IN (
    'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'VERIFIED', 'REJECTED', 'EXPIRED', 'PENDING'
  ));

-- 8. Verification Audit History Table
CREATE TABLE IF NOT EXISTS verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_verification_status ON organizations(verification_status);
CREATE INDEX IF NOT EXISTS idx_facilities_verification_status ON facilities(verification_status);
CREATE INDEX IF NOT EXISTS idx_co2_listings_verification_status ON co2_listings(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_facility_id ON documents(facility_id);
CREATE INDEX IF NOT EXISTS idx_co2_quality_records_listing_id ON co2_quality_records(listing_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_org_id ON verification_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_request_id ON verification_history(verification_request_id);

COMMIT;
