-- ============================================================================
-- 0001_initial_schema.sql
-- Front Desk — initial database schema
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

CREATE TYPE industry_type AS ENUM ('general_contractor');

CREATE TYPE calendar_provider AS ENUM ('google', 'calcom');

CREATE TYPE call_outcome AS ENUM (
  'booked',
  'faq_resolved',
  'transferred',
  'callback_scheduled',
  'missed'
);

CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TYPE callback_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TYPE tenant_role AS ENUM ('owner', 'staff');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  industry          industry_type NOT NULL DEFAULT 'general_contractor',
  phone             TEXT NOT NULL,
  calendar_provider calendar_provider NOT NULL DEFAULT 'google',
  business_hours    JSONB NOT NULL DEFAULT '{}',
  timezone          TEXT NOT NULL DEFAULT 'America/New_York',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tenant_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL,
  role       tenant_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);

CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT,
  phone        TEXT NOT NULL,
  notes        TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  call_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

CREATE TABLE calls (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL, -- nullable
  retell_call_id   TEXT NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER,
  outcome          call_outcome,
  transcript       TEXT,
  recording_url    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id      UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  call_id          UUID REFERENCES calls(id) ON DELETE SET NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  service_type     TEXT NOT NULL,
  job_notes        TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'pending',
  calendar_event_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE callbacks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  call_id        UUID REFERENCES calls(id) ON DELETE SET NULL,
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  preferred_time TEXT,
  reason         TEXT,
  status         callback_status NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE webhook_events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retell_call_id TEXT NOT NULL,
  event_type     TEXT NOT NULL,
  payload        JSONB NOT NULL DEFAULT '{}',
  processed      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events  ENABLE ROW LEVEL SECURITY;

-- Helper: returns the tenant_id for the current authenticated user
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() LIMIT 1;
$$;

-- tenants
CREATE POLICY "tenants_select" ON tenants
  FOR SELECT USING (id = auth_tenant_id());

CREATE POLICY "tenants_update" ON tenants
  FOR UPDATE USING (id = auth_tenant_id());

-- tenant_users
CREATE POLICY "tenant_users_select" ON tenant_users
  FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "tenant_users_insert" ON tenant_users
  FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

CREATE POLICY "tenant_users_update" ON tenant_users
  FOR UPDATE USING (tenant_id = auth_tenant_id());

-- customers
CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (tenant_id = auth_tenant_id());

-- calls
CREATE POLICY "calls_select" ON calls
  FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "calls_insert" ON calls
  FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

CREATE POLICY "calls_update" ON calls
  FOR UPDATE USING (tenant_id = auth_tenant_id());

-- appointments
CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE USING (tenant_id = auth_tenant_id());

-- callbacks
CREATE POLICY "callbacks_select" ON callbacks
  FOR SELECT USING (tenant_id = auth_tenant_id());

CREATE POLICY "callbacks_insert" ON callbacks
  FOR INSERT WITH CHECK (tenant_id = auth_tenant_id());

CREATE POLICY "callbacks_update" ON callbacks
  FOR UPDATE USING (tenant_id = auth_tenant_id());

-- webhook_events (service role only; no user-facing RLS policy needed)
-- Service role bypasses RLS automatically in Supabase.

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_customers_tenant_phone    ON customers(tenant_id, phone);
CREATE INDEX idx_calls_tenant_started_at   ON calls(tenant_id, started_at DESC);
CREATE INDEX idx_appointments_tenant_sched ON appointments(tenant_id, scheduled_at);
CREATE INDEX idx_callbacks_tenant_status   ON callbacks(tenant_id, status);
CREATE INDEX idx_webhook_events_call_id    ON webhook_events(retell_call_id);
