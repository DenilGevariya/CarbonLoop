-- Add UNIQUE constraints for offers, orders, contracts, shipments, invoices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_offers_offer_number') THEN
        ALTER TABLE offers ADD CONSTRAINT uq_offers_offer_number UNIQUE (offer_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_orders_order_number') THEN
        ALTER TABLE orders ADD CONSTRAINT uq_orders_order_number UNIQUE (order_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_contracts_contract_number') THEN
        ALTER TABLE contracts ADD CONSTRAINT uq_contracts_contract_number UNIQUE (contract_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_shipments_shipment_number') THEN
        ALTER TABLE shipments ADD CONSTRAINT uq_shipments_shipment_number UNIQUE (shipment_number);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_invoices_invoice_number') THEN
        ALTER TABLE invoices ADD CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number);
    END IF;
END $$;
