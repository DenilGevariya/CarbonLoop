-- Make legacy address column nullable in facilities to allow address_line1
ALTER TABLE facilities ALTER COLUMN address DROP NOT NULL;
