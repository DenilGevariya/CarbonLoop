-- ====================================================================
-- CarbonLoop Database Migration 024: Admin Command Center Enhancements
-- ====================================================================

BEGIN;

-- 1. Organizations Suspension Columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. System Alerts Table (Deterministic Operational Alerts)
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    category VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_identifier VARCHAR(100),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Admin Command Center performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(is_resolved, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

COMMIT;
