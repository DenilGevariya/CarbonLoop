-- Migration 021: Logistics Network, Quotes, and Shipment Tracking Layer

-- 1. Logistics Quotes Table Enhancements & Check Constraints
ALTER TABLE logistics_quotes DROP CONSTRAINT IF EXISTS logistics_quotes_status_check;
ALTER TABLE logistics_quotes ADD CONSTRAINT logistics_quotes_status_check 
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'PENDING', 'draft', 'submitted', 'accepted', 'rejected', 'withdrawn', 'expired', 'pending'));

ALTER TABLE logistics_quotes DROP CONSTRAINT IF EXISTS logistics_quotes_transport_mode_check;
ALTER TABLE logistics_quotes ADD CONSTRAINT logistics_quotes_transport_mode_check 
    CHECK (transport_mode IN ('ROAD', 'RAIL', 'PIPELINE', 'SHIP', 'OTHER', 'ISO_TANK_TRUCK', 'CYLINDER_CASCADE', 'RAIL_TANKER', 'road', 'rail', 'pipeline', 'ship', 'other'));
ALTER TABLE logistics_quotes ALTER COLUMN destination_facility_id DROP NOT NULL;
ALTER TABLE logistics_quotes ALTER COLUMN origin_facility_id DROP NOT NULL;
ALTER TABLE logistics_quotes ADD COLUMN IF NOT EXISTS notes TEXT;
-- 2. Quote Status History Table
CREATE TABLE IF NOT EXISTS quote_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES logistics_quotes(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_status_history_quote ON quote_status_history(quote_id);

-- 3. Shipments Table Enhancements & Check Constraints
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES logistics_quotes(id) ON DELETE SET NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS exception_reason TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS exception_notes TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE shipments ALTER COLUMN destination_facility_id DROP NOT NULL;

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_status_check 
    CHECK (status IN ('PLANNED', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'EXCEPTION', 'DISPATCHED', 'DELAYED', 'planned', 'scheduled', 'picked_up', 'in_transit', 'arriving', 'delivered', 'completed', 'cancelled', 'exception', 'dispatched', 'delayed'));

ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_transport_mode_check;
ALTER TABLE shipments ADD CONSTRAINT shipments_transport_mode_check 
    CHECK (transport_mode IN ('ROAD', 'RAIL', 'PIPELINE', 'SHIP', 'OTHER', 'ISO_TANK_TRUCK', 'CYLINDER_CASCADE', 'RAIL_TANKER', 'road', 'rail', 'pipeline', 'ship', 'other'));

-- 4. Shipment Status History Table
CREATE TABLE IF NOT EXISTS shipment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_status_history_shipment ON shipment_status_history(shipment_id);

-- 5. Shipment Routes Table Check Constraint
ALTER TABLE shipment_routes DROP CONSTRAINT IF EXISTS shipment_routes_location_type_check;
ALTER TABLE shipment_routes ADD CONSTRAINT shipment_routes_location_type_check 
    CHECK (location_type IN ('ORIGIN', 'WAYPOINT', 'DEPOT', 'DESTINATION', 'CHECKPOINT', 'origin', 'waypoint', 'depot', 'destination', 'checkpoint'));

-- 6. Shipment Tracking Events Check Constraint
ALTER TABLE shipment_tracking_events DROP CONSTRAINT IF EXISTS shipment_tracking_events_event_type_check;
ALTER TABLE shipment_tracking_events ADD CONSTRAINT shipment_tracking_events_event_type_check 
    CHECK (event_type IN ('SHIPMENT_CREATED', 'SCHEDULED', 'PICKUP_STARTED', 'PICKED_UP', 'DEPARTED', 'CHECKPOINT', 'ARRIVING', 'DELIVERED', 'DELIVERY_CONFIRMED', 'COMPLETED', 'DELAY', 'EXCEPTION', 'LOADED', 'CHECKPOINT_PASSED', 'shipment_created', 'scheduled', 'pickup_started', 'picked_up', 'departed', 'checkpoint', 'arriving', 'delivered', 'delivery_confirmed', 'completed', 'delay', 'exception', 'loaded', 'checkpoint_passed'));
