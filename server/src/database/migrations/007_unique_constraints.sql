-- Add UNIQUE constraints for seed upsert safety

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
