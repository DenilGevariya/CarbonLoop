-- Database Check Constraints for Data Integrity in CarbonLoop

DO $$
BEGIN
    -- 1. Organizations Geographic Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_organizations_lat') THEN
        ALTER TABLE organizations ADD CONSTRAINT chk_organizations_lat CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_organizations_long') THEN
        ALTER TABLE organizations ADD CONSTRAINT chk_organizations_long CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
    END IF;

    -- 2. Facilities Geographic Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_facilities_lat') THEN
        ALTER TABLE facilities ADD CONSTRAINT chk_facilities_lat CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_facilities_long') THEN
        ALTER TABLE facilities ADD CONSTRAINT chk_facilities_long CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
    END IF;

    -- 3. CO2 Listings Integrity Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_avail_qty') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_avail_qty CHECK (available_quantity IS NULL OR available_quantity > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_rem_qty') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_rem_qty CHECK (remaining_quantity IS NULL OR remaining_quantity >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_purity') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_purity CHECK (purity_percentage >= 0 AND purity_percentage <= 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_min_order') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_min_order CHECK (minimum_order_quantity IS NULL OR minimum_order_quantity > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_price') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_price CHECK (price_per_unit IS NULL OR price_per_unit >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_co2_listings_dates') THEN
        ALTER TABLE co2_listings ADD CONSTRAINT chk_co2_listings_dates CHECK (available_until IS NULL OR available_from IS NULL OR available_until >= available_from);
    END IF;

    -- 4. Buyer Requirements Integrity Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_qty') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_qty CHECK (required_quantity IS NULL OR required_quantity > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_min_purity') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_min_purity CHECK (minimum_purity IS NULL OR (minimum_purity >= 0 AND minimum_purity <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_max_purity') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_max_purity CHECK (maximum_purity IS NULL OR (maximum_purity >= 0 AND maximum_purity <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_purity_range') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_purity_range CHECK (maximum_purity IS NULL OR minimum_purity IS NULL OR minimum_purity <= maximum_purity);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_max_price') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_max_price CHECK (maximum_price_per_unit IS NULL OR maximum_price_per_unit >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_buyer_req_dates') THEN
        ALTER TABLE buyer_requirements ADD CONSTRAINT chk_buyer_req_dates CHECK (required_until IS NULL OR required_from IS NULL OR required_until >= required_from);
    END IF;

    -- 5. Matches Score Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_matches_overall_score') THEN
        ALTER TABLE matches ADD CONSTRAINT chk_matches_overall_score CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_matches_qty_score') THEN
        ALTER TABLE matches ADD CONSTRAINT chk_matches_qty_score CHECK (quantity_score IS NULL OR (quantity_score >= 0 AND quantity_score <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_matches_purity_score') THEN
        ALTER TABLE matches ADD CONSTRAINT chk_matches_purity_score CHECK (purity_score IS NULL OR (purity_score >= 0 AND purity_score <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_matches_distance_score') THEN
        ALTER TABLE matches ADD CONSTRAINT chk_matches_distance_score CHECK (distance_score IS NULL OR (distance_score >= 0 AND distance_score <= 100));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_matches_price_score') THEN
        ALTER TABLE matches ADD CONSTRAINT chk_matches_price_score CHECK (price_score IS NULL OR (price_score >= 0 AND price_score <= 100));
    END IF;

    -- 6. Offers Financial & Quantity Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_offers_quantity') THEN
        ALTER TABLE offers ADD CONSTRAINT chk_offers_quantity CHECK (quantity IS NULL OR quantity > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_offers_unit_price') THEN
        ALTER TABLE offers ADD CONSTRAINT chk_offers_unit_price CHECK (unit_price IS NULL OR unit_price >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_offers_total') THEN
        ALTER TABLE offers ADD CONSTRAINT chk_offers_total CHECK (total_estimated_cost IS NULL OR total_estimated_cost >= 0);
    END IF;

    -- 7. Orders Financial & Quantity Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_quantity') THEN
        ALTER TABLE orders ADD CONSTRAINT chk_orders_quantity CHECK (quantity IS NULL OR quantity > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_unit_price') THEN
        ALTER TABLE orders ADD CONSTRAINT chk_orders_unit_price CHECK (unit_price IS NULL OR unit_price >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total') THEN
        ALTER TABLE orders ADD CONSTRAINT chk_orders_total CHECK (total_amount IS NULL OR total_amount >= 0);
    END IF;

    -- 8. Shipments Constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_shipments_quantity') THEN
        ALTER TABLE shipments ADD CONSTRAINT chk_shipments_quantity CHECK (quantity IS NULL OR quantity > 0);
    END IF;

    -- 9. Reviews Rating Constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reviews_rating') THEN
        ALTER TABLE reviews ADD CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5);
    END IF;
END $$;
