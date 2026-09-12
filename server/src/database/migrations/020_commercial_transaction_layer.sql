-- Migration 020: Commercial Transaction Layer Enhancements

-- 1. Update Inquiries Table Check Constraint
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_check 
    CHECK (status IN ('OPEN', 'RESPONDED', 'NEGOTIATING', 'CONVERTED', 'CLOSED', 'CANCELLED', 'open', 'responded', 'negotiating', 'converted', 'closed', 'cancelled', 'converted_to_offer', 'PENDING', 'pending'));

-- 2. Inquiry Messages Table
CREATE TABLE IF NOT EXISTS inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sender_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_created ON inquiry_messages(created_at);

-- 3. Update Offers Table for Versioning, Counter-Offers, and Reasons
ALTER TABLE offers ADD COLUMN IF NOT EXISTS parent_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS withdrawal_reason TEXT;

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check 
    CHECK (status IN ('DRAFT', 'SENT', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'PENDING', 'DECLINED', 'draft', 'sent', 'countered', 'accepted', 'rejected', 'withdrawn', 'expired', 'pending', 'declined'));

CREATE INDEX IF NOT EXISTS idx_offers_parent ON offers(parent_offer_id);
CREATE INDEX IF NOT EXISTS idx_offers_offered_by ON offers(offered_by_organization_id);

-- 4. Offer Status History
CREATE TABLE IF NOT EXISTS offer_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_status_history_offer ON offer_status_history(offer_id);

-- 5. Update Orders Table for Commercial Snapshots and Requirements
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES buyer_requirements(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity NUMERIC(14,3);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'tonne';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commercial_snapshot JSONB DEFAULT '{}'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PREPARATION', 'READY_FOR_SHIPMENT', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DRAFT', 'pending', 'confirmed', 'in_preparation', 'ready_for_shipment', 'in_transit', 'delivered', 'completed', 'cancelled', 'draft'));

-- 6. Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
