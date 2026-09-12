-- Migration 022: Analytics Indexes and Views for CarbonLoop Performance

-- Indexes for CO2 Listings queries
CREATE INDEX IF NOT EXISTS idx_co2_listings_status_created ON co2_listings(status, created_at);
CREATE INDEX IF NOT EXISTS idx_co2_listings_purity ON co2_listings(purity_percentage);
CREATE INDEX IF NOT EXISTS idx_co2_listings_price ON co2_listings(price_per_ton);

-- Indexes for Buyer Requirements queries
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_status_created ON buyer_requirements(status, created_at);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_purity ON buyer_requirements(required_purity_percentage);

-- Indexes for Matches queries
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(overall_score);
CREATE INDEX IF NOT EXISTS idx_matches_status_created ON matches(status, created_at);

-- Indexes for Orders queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- Indexes for Logistics Quotes & Shipments
CREATE INDEX IF NOT EXISTS idx_logistics_quotes_status_created ON logistics_quotes(status, created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_status_created ON shipments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_events_shipment_occurred ON shipment_tracking_events(shipment_id, occurred_at);
