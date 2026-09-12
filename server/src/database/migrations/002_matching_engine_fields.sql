-- Migration 002: CarbonLoop Matching Engine Fields & Audit Table

-- 1. Extend matches table with full factor breakdown, estimates, and status semantics
ALTER TABLE matches ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS quantity_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS purity_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS physical_form_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS availability_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS price_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS distance_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS logistics_score NUMERIC(5, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS utilization_score NUMERIC(5, 2);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_distance_km NUMERIC(8, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_transport_cost NUMERIC(12, 2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS estimated_delivered_cost NUMERIC(12, 2);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS matching_reason TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS explanations JSONB DEFAULT '[]'::jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS warnings JSONB DEFAULT '[]'::jsonb;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS grade VARCHAR(20) DEFAULT 'STRONG';
ALTER TABLE matches ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE matches ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours';

-- 2. Audit Table for detailed per-factor score breakdown
CREATE TABLE IF NOT EXISTS match_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    factor VARCHAR(50) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    weight NUMERIC(4, 2) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by match_id
CREATE INDEX IF NOT EXISTS idx_match_scores_match_id ON match_scores(match_id);

-- 3. Update matches_status_check to support INELIGIBLE status
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
    CHECK (status IN ('SUGGESTED', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'CONVERTED_TO_OFFER', 'INELIGIBLE', 'suggested', 'reviewed', 'accepted', 'rejected', 'converted_to_inquiry', 'converted_to_offer', 'expired', 'ineligible'));

