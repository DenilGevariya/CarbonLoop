-- Align legacy DATE columns to TIMESTAMPTZ
ALTER TABLE co2_listings ALTER COLUMN availability_start_date TYPE TIMESTAMPTZ USING availability_start_date::TIMESTAMPTZ;
ALTER TABLE co2_listings ALTER COLUMN availability_end_date TYPE TIMESTAMPTZ USING availability_end_date::TIMESTAMPTZ;
ALTER TABLE buyer_requirements ALTER COLUMN required_by_date TYPE TIMESTAMPTZ USING required_by_date::TIMESTAMPTZ;
