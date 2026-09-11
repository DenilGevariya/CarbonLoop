-- Make legacy columns nullable in orders, shipments, and related transaction tables
ALTER TABLE orders ALTER COLUMN quantity_tons DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN price_per_ton DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN subtotal_amount DROP NOT NULL;

ALTER TABLE shipments ALTER COLUMN quantity_tons DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN destination_address DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN transport_mode DROP NOT NULL;
