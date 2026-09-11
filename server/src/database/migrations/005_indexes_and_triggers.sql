-- Database Indexes & Updated_At Triggers for CarbonLoop

-- 1. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);

CREATE INDEX IF NOT EXISTS idx_facilities_org_id ON facilities(organization_id);
CREATE INDEX IF NOT EXISTS idx_facilities_code ON facilities(organization_id, facility_code);

CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

CREATE INDEX IF NOT EXISTS idx_co2_listings_org ON co2_listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_co2_listings_fac ON co2_listings(facility_id);
CREATE INDEX IF NOT EXISTS idx_co2_listings_status ON co2_listings(status);
CREATE INDEX IF NOT EXISTS idx_co2_listings_purity ON co2_listings(purity_percentage);
CREATE INDEX IF NOT EXISTS idx_co2_listings_dates ON co2_listings(available_from, available_until);

CREATE INDEX IF NOT EXISTS idx_buyer_req_org ON buyer_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_buyer_req_status ON buyer_requirements(status);
CREATE INDEX IF NOT EXISTS idx_buyer_req_purity ON buyer_requirements(minimum_purity);
CREATE INDEX IF NOT EXISTS idx_buyer_req_dates ON buyer_requirements(required_from, required_until);

CREATE INDEX IF NOT EXISTS idx_matches_req_id ON matches(requirement_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_overall_score ON matches(overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_req ON inquiries(requirement_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON inquiries(buyer_organization_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller ON inquiries(seller_organization_id);

CREATE INDEX IF NOT EXISTS idx_offers_inquiry ON offers(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_reference);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- 2. REUSABLE TRIGGER FUNCTION FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. APPLY TRIGGER TO ALL TABLES WITH updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t);
    END LOOP;
END $$;
