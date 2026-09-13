-- Migration 027: Logistics Requests, Counter Bids, and Rejections Layer

-- 1. Logistics Request Rejections Table
CREATE TABLE IF NOT EXISTS logistics_request_rejections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, provider_organization_id)
);

CREATE INDEX IF NOT EXISTS idx_logistics_rejections_order ON logistics_request_rejections(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_rejections_provider ON logistics_request_rejections(provider_organization_id);

-- 2. Logistics Quotes Counter-Bid Columns & Constraints
ALTER TABLE logistics_quotes ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE logistics_quotes ADD COLUMN IF NOT EXISTS conditions TEXT;
ALTER TABLE logistics_quotes ADD COLUMN IF NOT EXISTS proposed_delivery_time TIMESTAMPTZ;

ALTER TABLE logistics_quotes DROP CONSTRAINT IF EXISTS logistics_quotes_status_check;
ALTER TABLE logistics_quotes ADD CONSTRAINT logistics_quotes_status_check 
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'PENDING', 'COUNTER_BID', 'COUNTER_PROPOSAL', 'OPEN', 'AVAILABLE', 'draft', 'submitted', 'accepted', 'rejected', 'withdrawn', 'expired', 'pending', 'counter_bid', 'counter_proposal', 'open', 'available'));

-- 3. Shipments Status & Deadline Constraints
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delivery_deadline TIMESTAMPTZ;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_status_check 
    CHECK (status IN ('PLANNED', 'SCHEDULED', 'TRANSPORTER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVING', 'DELIVERED', 'BUYER_CONFIRMED_RECEIPT', 'COMPLETED', 'CANCELLED', 'EXCEPTION', 'DISPATCHED', 'DELAYED', 'OVERDUE', 'planned', 'scheduled', 'transporter_assigned', 'picked_up', 'in_transit', 'arriving', 'delivered', 'buyer_confirmed_receipt', 'completed', 'cancelled', 'exception', 'dispatched', 'delayed', 'overdue'));

-- 4. Clean up duplicate system alerts before index creation
DELETE FROM system_alerts sa1
USING system_alerts sa2
WHERE sa1.id < sa2.id
  AND sa1.entity_id IS NOT NULL
  AND sa1.entity_id = sa2.entity_id
  AND sa1.category = sa2.category
  AND sa1.is_resolved = FALSE;

ALTER TABLE system_alerts ADD COLUMN IF NOT EXISTS alert_key VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_alerts_dedup 
ON system_alerts (entity_id, category) 
WHERE is_resolved = FALSE AND entity_id IS NOT NULL;
