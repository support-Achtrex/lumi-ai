-- ============================================================
-- LUMI AI — PostgreSQL Database Schema
-- Achtrex | achtrex.com
-- Run: psql -U postgres -d lumi_ai -f 001_create_tables.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(50) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user','admin','enterprise','developer')),
  enterprise_id UUID,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login    TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_enterprise   ON users(enterprise_id);
CREATE INDEX idx_users_role         ON users(role);

-- ── ENTERPRISES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enterprises (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(200) NOT NULL,
  industry      VARCHAR(100),  -- dealership, insurance, fleet, developer
  plan          VARCHAR(50) NOT NULL DEFAULT 'starter'
                  CHECK (plan IN ('starter','professional','enterprise')),
  api_key       VARCHAR(255) UNIQUE,
  monthly_limit INT DEFAULT 10000,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT fk_users_enterprise
  FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE SET NULL;

-- ── CONVERSATIONS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enterprise_id   UUID REFERENCES enterprises(id) ON DELETE SET NULL,
  title           VARCHAR(200) NOT NULL DEFAULT 'New Conversation',
  vehicle_context JSONB DEFAULT '{}',
  message_count   INT NOT NULL DEFAULT 0,
  last_analysis   TEXT,
  metadata        JSONB DEFAULT '{}',
  deleted_at      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user    ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NULL;

-- ── MESSAGES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
  content         TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}',  -- tokens, intent, model used
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created      ON messages(created_at);
CREATE INDEX idx_messages_role         ON messages(role);

-- ── FLEETS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fleets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enterprise_id   UUID REFERENCES enterprises(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  last_analysis   TEXT,
  last_analysis_type VARCHAR(50),
  last_analysis_at   TIMESTAMP WITH TIME ZONE,
  deleted_at      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleets_user    ON fleets(user_id);
CREATE INDEX idx_fleets_deleted ON fleets(deleted_at) WHERE deleted_at IS NULL;

-- ── FLEET VEHICLES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fleet_id         UUID NOT NULL REFERENCES fleets(id) ON DELETE CASCADE,
  vin              CHAR(17) NOT NULL,
  vehicle_data     JSONB NOT NULL DEFAULT '{}',
  mileage          INT,
  last_service_date DATE,
  notes            TEXT,
  added_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(fleet_id, vin)
);

CREATE INDEX idx_fleet_vehicles_fleet ON fleet_vehicles(fleet_id);
CREATE INDEX idx_fleet_vehicles_vin   ON fleet_vehicles(vin);

-- ── VEHICLE CACHE (local cache of AutomotiveDataset.com data) ─────────────────
CREATE TABLE IF NOT EXISTS vehicle_cache (
  vin           CHAR(17) PRIMARY KEY,
  decode_data   JSONB NOT NULL,
  history_data  JSONB,
  pricing_data  JSONB,
  recall_data   JSONB,
  cached_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_vehicle_cache_expires ON vehicle_cache(expires_at);

-- ── API USAGE TRACKING ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_usage (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  enterprise_id   UUID REFERENCES enterprises(id) ON DELETE SET NULL,
  endpoint        VARCHAR(200) NOT NULL,
  method          VARCHAR(10) NOT NULL,
  status_code     INT,
  response_time_ms INT,
  input_tokens    INT DEFAULT 0,
  output_tokens   INT DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user      ON api_usage(user_id);
CREATE INDEX idx_api_usage_created   ON api_usage(created_at);
CREATE INDEX idx_api_usage_endpoint  ON api_usage(endpoint);

-- ── DAMAGE ASSESSMENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS damage_assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  vin             CHAR(17),
  description     TEXT NOT NULL,
  location        VARCHAR(200),
  assessment      TEXT,
  severity_code   VARCHAR(10), -- SEV-0 to SEV-5
  cost_estimate   JSONB,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_damage_user ON damage_assessments(user_id);
CREATE INDEX idx_damage_vin  ON damage_assessments(vin);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_enterprises_updated_at  BEFORE UPDATE ON enterprises  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fleets_updated_at       BEFORE UPDATE ON fleets       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fleet_vehicles_updated_at BEFORE UPDATE ON fleet_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── SEED: Default admin user (change password immediately) ───────────────────
-- Password: Admin@123456 (bcrypt hash — change after first login)
INSERT INTO users (id, email, password, name, role)
VALUES (
  uuid_generate_v4(),
  'admin@achtrex.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2hNGBbhMnS',
  'LUMI AI Admin',
  'admin'
) ON CONFLICT (email) DO NOTHING;
