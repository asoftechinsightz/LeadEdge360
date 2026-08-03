-- =============================================================================
--  AsoftechInsightz — PostgreSQL Indexes
--  File 02 of 03
-- =============================================================================

-- TENANTS
CREATE INDEX IF NOT EXISTS idx_tenants_status      ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan        ON tenants(plan);

-- USERS
CREATE INDEX IF NOT EXISTS idx_users_tenant        ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_phone         ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_status        ON users(status);

-- AUTH
CREATE INDEX IF NOT EXISTS idx_auth_rt_user        ON auth_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_rt_expires     ON auth_refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otp_dest       ON auth_otps(destination);
CREATE INDEX IF NOT EXISTS idx_auth_otp_expires    ON auth_otps(expires_at);

-- LEADS
CREATE INDEX IF NOT EXISTS idx_leads_tenant        ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status        ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned      ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_territory     ON leads(tenant_id, territory);
CREATE INDEX IF NOT EXISTS idx_leads_source        ON leads(tenant_id, source);
CREATE INDEX IF NOT EXISTS idx_leads_score         ON leads(tenant_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created       ON leads(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_at);
CREATE INDEX IF NOT EXISTS idx_leads_phone_trgm    ON leads USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_name_trgm     ON leads USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_email_trgm    ON leads USING gin ((email::text) gin_trgm_ops);

-- Enable trigram extension (used by GIN indexes above)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ACTIVITIES
CREATE INDEX IF NOT EXISTS idx_lead_act_lead       ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_act_tenant     ON lead_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lead_act_created    ON lead_activities(created_at DESC);

-- FOLLOW-UPS
CREATE INDEX IF NOT EXISTS idx_followup_tenant     ON follow_ups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_followup_assigned   ON follow_ups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_followup_status     ON follow_ups(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_followup_due        ON follow_ups(due_at);
CREATE INDEX IF NOT EXISTS idx_followup_lead       ON follow_ups(lead_id);

-- NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notif_user_unread   ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notif_tenant        ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notif_created       ON notifications(created_at DESC);

-- PUSH DEVICES
CREATE INDEX IF NOT EXISTS idx_push_user           ON push_devices(user_id);

-- WHATSAPP
CREATE INDEX IF NOT EXISTS idx_wa_lead             ON whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_wa_tenant           ON whatsapp_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_created          ON whatsapp_messages(created_at DESC);

-- AUDIT LOGS (partitionable by month for very large deployments)
CREATE INDEX IF NOT EXISTS idx_audit_tenant        ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_user          ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created       ON audit_logs(created_at DESC);

-- PAYMENTS
CREATE INDEX IF NOT EXISTS idx_pay_tenant          ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pay_status          ON payments(status);
