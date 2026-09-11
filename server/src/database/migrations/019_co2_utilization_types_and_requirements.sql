-- Migration 019: CO2 Utilization Types & Requirement Schema Extensions

-- 1. Create CO2 Utilization Types Table
CREATE TABLE IF NOT EXISTS co2_utilization_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Insert Core Utilization Categories
INSERT INTO co2_utilization_types (code, name, description) VALUES
('SYNTHETIC_FUEL', 'Synthetic Fuels', 'Carbon feedstock for synthetic fuel, e-kerosene, and e-methanol synthesis.'),
('CONCRETE_AND_CONSTRUCTION', 'Concrete & Construction', 'Accelerated carbonation, precast concrete curing, and carbon mineralization in building materials.'),
('GREENHOUSE', 'Greenhouse Cultivation', 'Agricultural enrichment for enhanced photosynthetic growth in commercial greenhouse facilities.'),
('ALGAE', 'Algae Cultivation', 'Continuous gas injection for microalgae biomass production and biorefineries.'),
('CHEMICALS', 'Chemical Processing', 'Feedstock for polyols, polymers, organic carbonates, and fine chemical manufacturing.'),
('MINERALIZATION', 'Carbon Mineralization', 'Permanent carbon binding via mineral carbonation processes.'),
('FOOD_AND_BEVERAGE', 'Food & Beverage', 'Beverage carbonation, food preservation, and dry ice cooling applications.'),
('OTHER', 'Other Industrial Pathways', 'Custom or specialized industrial utilization pathways.')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Extend Buyer Requirements Table
ALTER TABLE buyer_requirements 
    ADD COLUMN IF NOT EXISTS utilization_type_id UUID REFERENCES co2_utilization_types(id) ON DELETE SET NULL;

-- 4. Update status check constraint for buyer_requirements to include full lifecycle
ALTER TABLE buyer_requirements DROP CONSTRAINT IF EXISTS buyer_requirements_status_check;
ALTER TABLE buyer_requirements ADD CONSTRAINT buyer_requirements_status_check 
    CHECK (status IN (
        'DRAFT', 'PUBLISHED', 'ACTIVE', 'PAUSED', 'FULFILLED', 'EXPIRED', 'ARCHIVED', 'MATCHED', 'CANCELLED',
        'draft', 'published', 'active', 'paused', 'fulfilled', 'expired', 'archived', 'matched', 'cancelled'
    ));

-- 5. Create index for utilization_type_id
CREATE INDEX IF NOT EXISTS idx_buyer_req_utilization ON buyer_requirements(utilization_type_id);
