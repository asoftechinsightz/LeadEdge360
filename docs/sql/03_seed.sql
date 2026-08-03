-- =============================================================================
--  AsoftechInsightz — Seed Data + Initial Admin User
--  File 03 of 03
--
--  Default super-admin (CHANGE THE PASSWORD AFTER FIRST LOGIN):
--    Email:    admin@asoftechinsightz.com
--    Password: ChangeMe@2025
--    bcrypt:   $2b$10$0HBzZL3xH7vY6XbqRzAQiOoiHmRkD1G9aQmFLG3rfNn7M2QmKtTL.
-- =============================================================================

BEGIN;

-- ---- Permissions catalogue ----
INSERT INTO permissions (code, description) VALUES
  ('leads.read',          'View leads in own tenant'),
  ('leads.write',         'Create / update / delete leads'),
  ('leads.assign',        'Assign leads to other users'),
  ('leads.rescore',       'Re-run AI scoring on leads'),
  ('followups.read',      'View follow-ups'),
  ('followups.write',     'Create / update / close follow-ups'),
  ('dashboard.read',      'View dashboards & KPIs'),
  ('whatsapp.send',       'Send WhatsApp messages'),
  ('notifications.read',  'Read own notifications'),
  ('admin.users',         'Manage users in tenant'),
  ('admin.roles',         'Manage roles & permissions'),
  ('admin.subscriptions', 'Manage subscriptions & billing'),
  ('admin.product_access','Toggle product access for tenant'),
  ('admin.audit',         'View audit log'),
  ('superadmin.*',        'Cross-tenant superadmin (system staff only)')
ON CONFLICT (code) DO NOTHING;

-- ---- Products ----
INSERT INTO products (id, code, name, description, status) VALUES
  ('11111111-1111-1111-1111-111111111111','leadedge360',  'LeadEdge360',  'Geo-intelligent AI lead management',         'live'),
  ('22222222-2222-2222-2222-222222222222','retailedge360','RetailEdge360','AI-powered retail & expiry intelligence',   'beta')
ON CONFLICT (code) DO NOTHING;

-- ---- Subscription plans (LeadEdge360) ----
INSERT INTO subscription_plans (product_id, code, name, price_inr, interval, features, limits, is_custom) VALUES
  ('11111111-1111-1111-1111-111111111111','starter','Starter',  1499.00, 'monthly',
    '["Up to 500 leads/mo","1 user","Web + WhatsApp capture","Basic AI scoring","Email support"]'::jsonb,
    '{"leads_per_month":500,"users":1}'::jsonb, FALSE),
  ('11111111-1111-1111-1111-111111111111','growth', 'Growth',   4999.00, 'monthly',
    '["Up to 10000 leads/mo","5 users","All channels","Advanced AI scoring + Copilot","Territory routing & RBAC","WhatsApp automation","Priority support"]'::jsonb,
    '{"leads_per_month":10000,"users":5}'::jsonb, FALSE),
  ('11111111-1111-1111-1111-111111111111','scale',  'Scale',    NULL,    'monthly',
    '["Unlimited leads","Unlimited users","SSO + Audit logs","Dedicated CSM","VPC option","SLA 99.95%"]'::jsonb,
    '{"leads_per_month":-1,"users":-1}'::jsonb, TRUE);

-- ---- Default “System” tenant (for the super-admin) ----
INSERT INTO tenants (id, name, slug, owner_email, plan, status, country, timezone)
VALUES ('00000000-0000-0000-0000-000000000001','System','system','admin@asoftechinsightz.com','scale','active','IN','Asia/Kolkata')
ON CONFLICT (slug) DO NOTHING;

-- ---- System roles (per-tenant + a global superadmin role) ----
INSERT INTO roles (id, tenant_id, name, description, is_system) VALUES
  ('00000000-0000-0000-0000-000000000010', NULL,                                     'superadmin','Cross-tenant super-administrator',TRUE),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',  'admin',     'Tenant administrator',           TRUE),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001',  'manager',   'Sales manager',                  TRUE),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001',  'agent',     'Sales agent',                    TRUE)
ON CONFLICT DO NOTHING;

-- ---- Grant permissions to system roles ----
-- superadmin gets everything
INSERT INTO role_permissions (role_id, permission_id)
  SELECT '00000000-0000-0000-0000-000000000010', id FROM permissions
  ON CONFLICT DO NOTHING;
-- admin: everything except superadmin.*
INSERT INTO role_permissions (role_id, permission_id)
  SELECT '00000000-0000-0000-0000-000000000011', id FROM permissions WHERE code NOT LIKE 'superadmin.%'
  ON CONFLICT DO NOTHING;
-- manager: read/write leads + followups + dashboard + whatsapp + admin.users
INSERT INTO role_permissions (role_id, permission_id)
  SELECT '00000000-0000-0000-0000-000000000012', id FROM permissions
  WHERE code IN ('leads.read','leads.write','leads.assign','leads.rescore',
                 'followups.read','followups.write','dashboard.read',
                 'whatsapp.send','notifications.read','admin.users')
  ON CONFLICT DO NOTHING;
-- agent: read/write own leads + own followups + dashboard + whatsapp
INSERT INTO role_permissions (role_id, permission_id)
  SELECT '00000000-0000-0000-0000-000000000013', id FROM permissions
  WHERE code IN ('leads.read','leads.write','followups.read','followups.write',
                 'dashboard.read','whatsapp.send','notifications.read')
  ON CONFLICT DO NOTHING;

-- ---- Initial super-admin user (bcrypt cost=10 of 'ChangeMe@2025') ----
INSERT INTO users (id, tenant_id, email, full_name, password_hash, role_id, status,
                   email_verified_at, dpdp_consent)
VALUES (
  '00000000-0000-0000-0000-0000000000A0',
  '00000000-0000-0000-0000-000000000001',
  'admin@asoftechinsightz.com', 'System Administrator',
  '$2b$10$0HBzZL3xH7vY6XbqRzAQiOoiHmRkD1G9aQmFLG3rfNn7M2QmKtTL.',
  '00000000-0000-0000-0000-000000000010', 'active', now(),
  jsonb_build_object('essential', true, 'analytics', true, 'marketing', false,
                     'version', '1.0', 'acceptedAt', now())
)
ON CONFLICT (email) DO NOTHING;

-- ---- Demo tenant (so the marketing demo continues to work) ----
INSERT INTO tenants (id, name, slug, owner_email, plan)
VALUES ('00000000-0000-0000-0000-000000000002','Demo Workspace','demo','demo@asoftechinsightz.com','growth')
ON CONFLICT (slug) DO NOTHING;

-- ---- Lead sources for demo tenant ----
INSERT INTO lead_sources (tenant_id, code, name) VALUES
  ('00000000-0000-0000-0000-000000000002','website',  'Website Form'),
  ('00000000-0000-0000-0000-000000000002','facebook', 'Facebook Lead Ads'),
  ('00000000-0000-0000-0000-000000000002','google',   'Google Lead Form'),
  ('00000000-0000-0000-0000-000000000002','whatsapp', 'WhatsApp Business'),
  ('00000000-0000-0000-0000-000000000002','referral', 'Referral'),
  ('00000000-0000-0000-0000-000000000002','manual',   'Manual entry')
ON CONFLICT DO NOTHING;

-- ---- Product access for both tenants ----
INSERT INTO product_access (tenant_id, product_id)
  SELECT t.id, p.id FROM tenants t CROSS JOIN products p
  ON CONFLICT DO NOTHING;

COMMIT;

-- ----------------------------------------------------------------------------
-- POST-INSTALL NOTES
--   1) Log in as admin@asoftechinsightz.com / ChangeMe@2025
--   2) Immediately change the password via POST /api/users/change-password
--   3) Create your real tenant via POST /api/admin/tenants and invite users
-- ----------------------------------------------------------------------------
