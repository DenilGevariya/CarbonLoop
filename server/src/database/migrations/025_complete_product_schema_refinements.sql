-- Migration: 025_complete_product_schema_refinements.sql
-- Enforces versioned offers, three-way handshake tracking, declared vs verified purity, and overdue shipment flags.

-- 1. Offer Version History
ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS parent_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_number INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS change_summary TEXT;

CREATE INDEX IF NOT EXISTS idx_offers_parent_version ON offers(parent_offer_id, version_number);

-- 2. Three-Way Handshake & Reconfirmation in Orders/Deals
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS seller_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS logistics_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vehicle_availability_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS route_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reconfirmation_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reconfirmation_reason TEXT,
  ADD COLUMN IF NOT EXISTS agreed_quantity NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS allocated_quantity NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipped_quantity NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivered_quantity NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_quantity NUMERIC(12, 2);

-- 3. Declared vs Verified Purity on CO2 Listings
ALTER TABLE co2_listings
  ADD COLUMN IF NOT EXISTS declared_purity NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS verified_purity NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Populate declared_purity from purity_percentage if declared_purity is null
UPDATE co2_listings
SET declared_purity = purity_percentage
WHERE declared_purity IS NULL;

-- 4. Overdue Shipments and Deadline Tracking
ALTER TABLE shipments
  ADD COLUMN IF NOT EXISTS delivery_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS price_per_km NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS idx_shipments_overdue ON shipments(is_overdue, status);
