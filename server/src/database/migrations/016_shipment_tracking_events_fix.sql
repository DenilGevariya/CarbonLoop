-- Make legacy event_status column nullable in shipment_tracking_events
ALTER TABLE shipment_tracking_events ALTER COLUMN event_status DROP NOT NULL;
