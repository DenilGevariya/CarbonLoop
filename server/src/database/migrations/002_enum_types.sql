-- PostgreSQL ENUM Types for CarbonLoop

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'platform_admin', 'emitter', 'utilizer', 'logistics_provider', 'regulator'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type_enum') THEN
        CREATE TYPE organization_type_enum AS ENUM (
            'emitter', 'utilizer', 'logistics_provider', 'verifier', 'regulator', 'admin'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_status_enum') THEN
        CREATE TYPE organization_status_enum AS ENUM (
            'pending', 'verified', 'rejected', 'suspended'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'facility_status_enum') THEN
        CREATE TYPE facility_status_enum AS ENUM (
            'operational', 'under_maintenance', 'decommissioned', 'pending'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status_enum') THEN
        CREATE TYPE listing_status_enum AS ENUM (
            'draft', 'active', 'reserved', 'sold_out', 'cancelled', 'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_unit_enum') THEN
        CREATE TYPE listing_unit_enum AS ENUM (
            'tonne', 'kg', 'm3'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'co2_physical_form_enum') THEN
        CREATE TYPE co2_physical_form_enum AS ENUM (
            'gaseous', 'liquid', 'supercritical', 'solid_dry_ice'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'requirement_status_enum') THEN
        CREATE TYPE requirement_status_enum AS ENUM (
            'draft', 'active', 'matched', 'in_negotiation', 'fulfilled', 'cancelled', 'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'requirement_priority_enum') THEN
        CREATE TYPE requirement_priority_enum AS ENUM (
            'low', 'medium', 'high', 'critical'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status_enum') THEN
        CREATE TYPE match_status_enum AS ENUM (
            'suggested', 'reviewed', 'accepted', 'rejected', 'converted_to_inquiry', 'converted_to_offer', 'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status_enum') THEN
        CREATE TYPE inquiry_status_enum AS ENUM (
            'open', 'responded', 'converted_to_offer', 'closed', 'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status_enum') THEN
        CREATE TYPE offer_status_enum AS ENUM (
            'draft', 'pending', 'countered', 'accepted', 'declined', 'expired', 'withdrawn'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM (
            'draft', 'pending', 'confirmed', 'contracted', 'in_transit', 'delivered', 'completed', 'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status_enum') THEN
        CREATE TYPE contract_status_enum AS ENUM (
            'draft', 'pending_signature', 'active', 'completed', 'terminated', 'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'logistics_quote_status_enum') THEN
        CREATE TYPE logistics_quote_status_enum AS ENUM (
            'draft', 'submitted', 'accepted', 'rejected', 'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_status_enum') THEN
        CREATE TYPE shipment_status_enum AS ENUM (
            'scheduled', 'dispatched', 'in_transit', 'delivered', 'delayed', 'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipment_event_type_enum') THEN
        CREATE TYPE shipment_event_type_enum AS ENUM (
            'pickup_scheduled', 'loaded', 'dispatched', 'checkpoint_passed', 'in_transit_delay', 'arrived', 'unloaded', 'delivered', 'exception'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_type_enum') THEN
        CREATE TYPE verification_type_enum AS ENUM (
            'organization_identity', 'facility_emissions', 'co2_purity', 'logistics_compliance'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
        CREATE TYPE verification_status_enum AS ENUM (
            'pending', 'under_review', 'approved', 'rejected', 'requires_info'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
        CREATE TYPE document_type_enum AS ENUM (
            'purity_certificate', 'emissions_report', 'facility_license', 'contract', 'invoice', 'bill_of_lading', 'safety_data_sheet', 'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM (
            'system', 'match_found', 'inquiry_received', 'offer_received', 'offer_accepted', 'order_status_changed', 'shipment_update', 'verification_update'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
        CREATE TYPE invoice_status_enum AS ENUM (
            'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM (
            'pending', 'processing', 'completed', 'failed', 'refunded'
        );
    END IF;
END $$;
