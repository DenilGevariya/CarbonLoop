-- Migration 018: Supply Marketplace Status Constraint Fix & Indexing

-- Update co2_listings_status_check constraint to include PUBLISHED, PAUSED, EXHAUSTED, EXPIRED, ARCHIVED
ALTER TABLE co2_listings DROP CONSTRAINT IF EXISTS co2_listings_status_check;
ALTER TABLE co2_listings ADD CONSTRAINT co2_listings_status_check 
    CHECK (status IN (
        'DRAFT', 'PUBLISHED', 'PAUSED', 'EXHAUSTED', 'EXPIRED', 'ARCHIVED', 
        'ACTIVE', 'RESERVED', 'SOLD_OUT', 'CANCELLED',
        'draft', 'published', 'paused', 'exhausted', 'expired', 'archived',
        'active', 'reserved', 'sold_out', 'cancelled'
    ));

-- Create helpful marketplace query performance indexes
CREATE INDEX IF NOT EXISTS idx_co2_listings_status_purity ON co2_listings(status, purity_percentage);
CREATE INDEX IF NOT EXISTS idx_co2_listings_status_price ON co2_listings(status, price_per_unit);
CREATE INDEX IF NOT EXISTS idx_co2_listings_code_uniq ON co2_listings(listing_code);
