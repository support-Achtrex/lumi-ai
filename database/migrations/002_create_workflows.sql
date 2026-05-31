-- ── WORKFLOWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enterprise_id   UUID REFERENCES enterprises(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  trigger_type    VARCHAR(50) NOT NULL, -- e.g., 'mileage_threshold', 'dtc_code', 'time_based'
  trigger_config  JSONB NOT NULL DEFAULT '{}',
  action_type     VARCHAR(50) NOT NULL, -- e.g., 'send_email', 'create_task', 'run_analysis'
  action_config   JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON workflows(user_id);

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
