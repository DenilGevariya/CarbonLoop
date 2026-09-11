-- Make legacy state_form and available_quantity_tons columns nullable in co2_listings
ALTER TABLE co2_listings ALTER COLUMN state_form DROP NOT NULL;
ALTER TABLE co2_listings ALTER COLUMN available_quantity_tons DROP NOT NULL;
ALTER TABLE co2_listings ALTER COLUMN price_per_ton DROP NOT NULL;
ALTER TABLE co2_listings ALTER COLUMN availability_start_date DROP NOT NULL;
