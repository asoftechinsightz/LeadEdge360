-- =============================================================================
--  AsoftechInsightz · LeadEdge360 — PostgreSQL Schema (DDL)
--  Target: PostgreSQL 15+
--  File 01 of 03 — tables, constraints, foreign keys
--  Run order: 01_schema.sql → 02_indexes.sql → 03_seed.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
--  1. TENANTS (organisations / workspaces)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT            NOT NULL,
  slug            CITEXT          UNIQUE NOT NULL,
  owner_email     CITEXT          NOT NULL,
  plan            TEXT            NOT NULL DEFAULT 'starter'
                                  CHECK (plan IN ('starter','growth','scale','custom')),
  status          TEXT            NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active','suspended','cancelled')),
  country         TEXT            DEFAULT 'IN',
  timezone        TEXT            DEFAULT 'Asia/Kolkata',
  settings        JSONB           NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =============================================================================
--  2. ROLES (system-level + tenant-level)
-- =============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT            NOT NULL,
  description     TEXT,
  is_system       BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

-- =============================================================================
--  3. PERMISSIONS (granular ACL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS permissions (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT            UNIQUE NOT NULL, -- e.g. leads.read, leads.write
  description     TEXT            NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id         UUID            REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id   UUID            REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- =============================================================================
--  4. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID         REFERENCES tenants(id) ON DELETE CASCADE,
  email               CITEXT       UNIQUE NOT NULL,
  phone               TEXT         UNIQUE,
  password_hash       TEXT,                       -- bcrypt; nullable for SSO-only
  full_name           TEXT,
  picture             TEXT,
  role_id             UUID         REFERENCES roles(id),
  status              TEXT         NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active','invited','suspended','deleted')),
  email_verified_at   TIMESTAMPTZ,
  phone_verified_at   TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  dpdp_consent        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  preferences         JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- =============================================================================
--  5. AUTH TOKENS (refresh tokens + OTP store)
-- =============================================================================
CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT            NOT NULL,
  device          TEXT,
  ip              INET,
  user_agent      TEXT,
  expires_at      TIMESTAMPTZ     NOT NULL,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_otps (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination     TEXT            NOT NULL,                 -- email or phone
  channel         TEXT            NOT NULL CHECK (channel IN ('sms','email','whatsapp')),
  purpose         TEXT            NOT NULL CHECK (purpose IN ('signup','login','verify','reset')),
  code_hash       TEXT            NOT NULL,                 -- bcrypt of 6-digit OTP
  attempts        INT             NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ     NOT NULL,
  consumed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =============================================================================
--  6. PRODUCTS & SUBSCRIPTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT            UNIQUE NOT NULL,           -- leadedge360, retailedge360
  name            TEXT            NOT NULL,
  description     TEXT,
  status          TEXT            NOT NULL DEFAULT 'live'
                                  CHECK (status IN ('live','beta','coming_soon')),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  code            TEXT            NOT NULL,                  -- starter, growth, scale
  name            TEXT            NOT NULL,
  price_inr       NUMERIC(10,2),
  interval        TEXT            NOT NULL DEFAULT 'monthly'
                                  CHECK (interval IN ('monthly','annual')),
  features        JSONB           NOT NULL DEFAULT '[]'::jsonb,
  limits          JSONB           NOT NULL DEFAULT '{}'::jsonb,
  is_custom       BOOLEAN         NOT NULL DEFAULT FALSE,
  active          BOOLEAN         NOT NULL DEFAULT TRUE,
  UNIQUE (product_id, code)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id         UUID         NOT NULL REFERENCES products(id),
  plan_id            UUID         NOT NULL REFERENCES subscription_plans(id),
  status             TEXT         NOT NULL DEFAULT 'trialing'
                                  CHECK (status IN ('trialing','active','past_due','cancelled','expired')),
  trial_ends_at      TIMESTAMPTZ,
  current_start      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  current_end        TIMESTAMPTZ  NOT NULL,
  razorpay_order_id  TEXT,
  razorpay_payment_id TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_access (
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id      UUID            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  enabled         BOOLEAN         NOT NULL DEFAULT TRUE,
  PRIMARY KEY (tenant_id, product_id)
);

-- =============================================================================
--  7. LEADS  (the heart of LeadEdge360)
-- =============================================================================
CREATE TABLE IF NOT EXISTS lead_sources (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code            TEXT            NOT NULL,        -- website, facebook, google, whatsapp, referral, manual
  name            TEXT            NOT NULL,
  enabled         BOOLEAN         NOT NULL DEFAULT TRUE,
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS leads (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT         NOT NULL,
  email               CITEXT,
  phone               TEXT         NOT NULL,
  company             TEXT,
  message             TEXT,
  source              TEXT         NOT NULL,
  source_id           UUID         REFERENCES lead_sources(id),
  territory           TEXT,
  budget              NUMERIC(12,2) DEFAULT 0,
  whatsapp_opted_in   BOOLEAN      NOT NULL DEFAULT FALSE,
  -- AI scoring
  score               SMALLINT     CHECK (score BETWEEN 0 AND 100),
  label               TEXT         CHECK (label IN ('Hot','Warm','Cold')),
  scoring_reasons     JSONB        NOT NULL DEFAULT '[]'::jsonb,
  scoring_engine      TEXT,        -- llm | rules | rules-fallback
  -- pipeline
  status              TEXT         NOT NULL DEFAULT 'New'
                                   CHECK (status IN ('New','Contacted','Qualified','Proposal','Won','Lost')),
  assigned_to         UUID         REFERENCES users(id) ON DELETE SET NULL,
  next_followup_at    TIMESTAMPTZ,
  meta                JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- =============================================================================
--  8. LEAD ACTIVITIES  (timeline of every touchpoint)
-- =============================================================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id         UUID            NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id         UUID            REFERENCES users(id) ON DELETE SET NULL,
  type            TEXT            NOT NULL CHECK (type IN (
                                    'created','status_change','assigned','note','call',
                                    'whatsapp_sent','email_sent','followup_due','rescored')),
  payload         JSONB           NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =============================================================================
--  9. FOLLOW-UPS
-- =============================================================================
CREATE TABLE IF NOT EXISTS follow_ups (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id         UUID            NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to     UUID            REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT            NOT NULL,
  notes           TEXT,
  due_at          TIMESTAMPTZ     NOT NULL,
  channel         TEXT            CHECK (channel IN ('call','whatsapp','email','meeting','other')),
  status          TEXT            NOT NULL DEFAULT 'open'
                                  CHECK (status IN ('open','done','cancelled','overdue')),
  outcome         TEXT,
  reminder_sent   BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ
);

-- =============================================================================
-- 10. NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID            NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  channel         TEXT            NOT NULL CHECK (channel IN ('push','email','whatsapp','inapp')),
  type            TEXT            NOT NULL,                    -- followup_due, new_lead, payment_success, ...
  title           TEXT            NOT NULL,
  body            TEXT,
  payload         JSONB           NOT NULL DEFAULT '{}'::jsonb,
  read_at         TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  status          TEXT            NOT NULL DEFAULT 'queued'
                                  CHECK (status IN ('queued','sent','failed','read')),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_devices (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform        TEXT            NOT NULL CHECK (platform IN ('ios','android','web')),
  token           TEXT            NOT NULL,
  device_name     TEXT,
  last_seen_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

-- =============================================================================
-- 11. WHATSAPP CONVERSATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id         UUID            REFERENCES leads(id) ON DELETE SET NULL,
  direction       TEXT            NOT NULL CHECK (direction IN ('inbound','outbound')),
  msg_type        TEXT            NOT NULL CHECK (msg_type IN ('text','template','image','document','audio','interactive')),
  template_name   TEXT,
  body            TEXT,
  media_url       TEXT,
  status          TEXT            NOT NULL DEFAULT 'queued'
                                  CHECK (status IN ('queued','sent','delivered','read','failed')),
  wa_message_id   TEXT,
  meta            JSONB           NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =============================================================================
-- 12. AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID            REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID            REFERENCES users(id)   ON DELETE SET NULL,
  action          TEXT            NOT NULL,                 -- lead.create, user.update, etc.
  entity          TEXT            NOT NULL,
  entity_id       UUID,
  diff            JSONB           NOT NULL DEFAULT '{}'::jsonb,
  ip              INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- =============================================================================
-- 13. CONSENT MANAGEMENT (DPDP Act 2023)
-- =============================================================================
CREATE TABLE IF NOT EXISTS consent_log (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID            REFERENCES users(id) ON DELETE CASCADE,
  email           CITEXT,
  policy_version  TEXT            NOT NULL,
  essential       BOOLEAN         NOT NULL DEFAULT TRUE,
  analytics       BOOLEAN         NOT NULL DEFAULT FALSE,
  marketing       BOOLEAN         NOT NULL DEFAULT FALSE,
  ip              INET,
  user_agent      TEXT,
  accepted_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  withdrawn_at    TIMESTAMPTZ
);

-- =============================================================================
-- 14. PAYMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id     UUID         REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT         NOT NULL DEFAULT 'INR',
  razorpay_order_id   TEXT         UNIQUE,
  razorpay_payment_id TEXT,
  status              TEXT         NOT NULL DEFAULT 'created'
                                   CHECK (status IN ('created','authorised','captured','paid','refunded','failed')),
  invoice_url         TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  paid_at             TIMESTAMPTZ
);

-- =============================================================================
--  AUTOMATIC updated_at TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.columns
           WHERE column_name='updated_at' AND table_schema='public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', r.table_name, r.table_name);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION set_updated_at();', r.table_name, r.table_name);
  END LOOP;
END $$;
