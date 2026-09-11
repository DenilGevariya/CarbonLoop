-- Make legacy overall_match_score column nullable in matches
ALTER TABLE matches ALTER COLUMN overall_match_score DROP NOT NULL;
