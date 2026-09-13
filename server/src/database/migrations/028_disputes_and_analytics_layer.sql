-- Migration 028: Commercial Disputes and Analytics Layer

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_code VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES co2_listings(id) ON DELETE SET NULL,
    complainant_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    respondent_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    dispute_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    evidence_url TEXT,
    evidence_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED')),
    assigned_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- Seed Initial Disputes linked to existing Orders / Organizations
INSERT INTO disputes (
    dispute_code, order_id, complainant_organization_id, respondent_organization_id,
    dispute_type, description, evidence_notes, status, created_at
)
SELECT 
    CONCAT('DSP-', UPPER(SUBSTRING(o.id::text, 1, 6))),
    o.id,
    o.buyer_organization_id,
    o.seller_organization_id,
    'PURITY_DEVIATION',
    'Recipient laboratory gas chromatography reported 97.2% purity vs 99.5% declared in listing.',
    'Attached certified independent lab purity report assay PDF.',
    'OPEN',
    NOW() - INTERVAL '2 days'
FROM orders o
LIMIT 1
ON CONFLICT (dispute_code) DO NOTHING;

INSERT INTO disputes (
    dispute_code, order_id, complainant_organization_id, respondent_organization_id,
    dispute_type, description, evidence_notes, status, created_at
)
SELECT 
    CONCAT('DSP-DLY-', UPPER(SUBSTRING(o.id::text, 1, 6))),
    o.id,
    o.buyer_organization_id,
    o.seller_organization_id,
    'DELIVERY_DELAY',
    'Transport vehicle arrived 14 hours past agreed delivery window leading to idle plant losses.',
    'GPS Telemetry log and gate arrival timestamp log.',
    'UNDER_REVIEW',
    NOW() - INTERVAL '4 days'
FROM orders o
OFFSET 1
LIMIT 1
ON CONFLICT (dispute_code) DO NOTHING;
