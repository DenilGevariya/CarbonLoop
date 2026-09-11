-- Migration 017: Auth Sessions and User Onboarding Enhancements

-- 1. Auth Sessions Table for Refresh Tokens & Session Management
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_refresh_hash ON auth_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

-- 2. Add Onboarding Timestamp to Users Table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Mark existing seed users as onboarding completed
UPDATE users SET onboarding_completed_at = NOW() WHERE onboarding_completed_at IS NULL;
