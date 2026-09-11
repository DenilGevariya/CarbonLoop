-- Make legacy columns nullable in buyer_requirements
ALTER TABLE buyer_requirements ALTER COLUMN intended_use DROP NOT NULL;
ALTER TABLE buyer_requirements ALTER COLUMN required_purity_percentage DROP NOT NULL;
ALTER TABLE buyer_requirements ALTER COLUMN required_quantity_tons DROP NOT NULL;
ALTER TABLE buyer_requirements ALTER COLUMN location_city DROP NOT NULL;
ALTER TABLE buyer_requirements ALTER COLUMN location_state DROP NOT NULL;
