-- Migration 026: Add Laboratory Purity Report fields to co2_listings and update verification_status constraint
ALTER TABLE co2_listings
ADD COLUMN IF NOT EXISTS lab_report_url TEXT,
ADD COLUMN IF NOT EXISTS lab_report_filename TEXT,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

ALTER TABLE co2_listings DROP CONSTRAINT IF EXISTS co2_listings_verification_status_check;

ALTER TABLE co2_listings
ADD CONSTRAINT co2_listings_verification_status_check
CHECK (verification_status IN (
  'UNVERIFIED', 'SUBMITTED', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'EXPIRED'
));

UPDATE co2_listings
SET verification_status = 'PENDING_VERIFICATION'
WHERE verification_status IS NULL OR verification_status = 'UNVERIFIED' OR verification_status = 'SUBMITTED';

ALTER TABLE co2_listings
ALTER COLUMN verification_status SET DEFAULT 'PENDING_VERIFICATION';
