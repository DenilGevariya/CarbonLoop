-- Make legacy issuing_body column nullable in facility_certifications
ALTER TABLE facility_certifications ALTER COLUMN issuing_body DROP NOT NULL;
