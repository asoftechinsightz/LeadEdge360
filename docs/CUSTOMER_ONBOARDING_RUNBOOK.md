# Customer Onboarding Runbook — GA Pilot v1.0

**Audience:** Engineering + Customer Success  
**Prerequisite:** [`GA_PILOT_SIGNOFF.md`](./GA_PILOT_SIGNOFF.md) — all certification gates green  
**Public URL:** `https://app.asoftechinsightz.com`  
**Signup:** Disabled (`PUBLIC_SIGNUP_ENABLED=false`) — all tenants are provisioned

---

## Overview

```
Sales handoff → Provision org → Smoke test → Welcome customer → Monitor 2–4 weeks
```

Each pilot customer gets a dedicated org, admin user, subscription, and optional sample CRM/retail data. No self-service registration.

---

## Phase 1 — Pre-onboarding (Sales)

| Step | Owner | Action |
|------|-------|--------|
| 1 | Sales | Collect company name, admin email, phone, industry, GSTIN (if invoicing) |
| 2 | Sales | Confirm plan tier (`ENTERPRISE` default for pilot) |
| 3 | Sales | Confirm modules needed: CRM only, CRM + Retail, WhatsApp |
| 4 | Engineering | Verify PAT green on VPS before first customer of the day |

---

## Phase 2 — Provision tenant (VPS)

SSH to VPS:

```bash
cd /opt/asoftech-insightz
source .env

export PILOT_ORG_NAME="Acme Pvt Ltd"
export PILOT_ORG_ID="acme-pilot"
export PILOT_ADMIN_EMAIL="admin@acme.com"
export PILOT_ADMIN_PASSWORD='StrongPass@2026!'
export PILOT_ADMIN_NAME="Jane Admin"
export PILOT_ADMIN_PHONE='+919876543210'
export PILOT_INDUSTRY=it_services
export PILOT_SEED_SAMPLE=1
export RETEST_API_BASE=http://127.0.0.1:3000/api

# Preview
npm run pilot:provision -- --dry-run

# Create org (idempotent)
npm run pilot:provision
```

**Retail sample data** (if customer needs RetailEdge360):

```bash
DEMO_ORG_ID=first-customer \
DEMO_ADMIN_EMAIL=admin@firstcustomer.com \
DEMO_ADMIN_PASSWORD='StrongPass@2026!' \
node scripts/provision-client-demo.mjs --org-id first-customer
```

Full reference: [`platform/PILOT_PROVISIONING.md`](./platform/PILOT_PROVISIONING.md)

---

## Phase 3 — Post-provision validation

```bash
# Quick API smoke (uses CERT_ADMIN_* or pilot credentials)
export CERT_ADMIN_EMAIL=admin@acme.com
export CERT_ADMIN_PASSWORD='StrongPass@2026!'
npm run deploy:pilot:smoke

# Or full PAT (stricter — run after any deploy)
npm run production:acceptance
```

**Manual checks (5 min):**

- [ ] Sign in at `https://app.asoftechinsightz.com/signin`
- [ ] Dashboard loads with tenant data
- [ ] Create one lead → appears in list
- [ ] Settings → org branding visible
- [ ] (If retail) Inventory catalog loads, POS page opens

---

## Phase 4 — Customer handoff

| Deliverable | Details |
|-------------|---------|
| Login URL | `https://app.asoftechinsightz.com/signin` |
| Credentials | Admin email + temporary password (force change on first login if policy enabled) |
| Support channel | Email / WhatsApp per sales agreement |
| Training | 30-min walkthrough: Leads → Opportunities → Invoices → (Retail POS if applicable) |

**Security reminders for customer:**

- Use strong unique password
- Do not share admin credentials across users — add team members via Settings
- Report suspicious activity immediately

---

## Phase 5 — Ongoing ops (2–4 week pilot)

| Frequency | Action |
|-----------|--------|
| Daily | `npm run launch:warroom` — uptime, backups, PAT summary |
| Per deploy | `docker compose up -d --no-deps --build app` then `npm run production:acceptance` |
| Weekly | Review Grafana dashboards (port 3031), backup freshness |
| On incident | Rollback: `bash scripts/ops/rollback-production.sh` — see [`BACKUP_DISASTER_RECOVERY.md`](./BACKUP_DISASTER_RECOVERY.md) |

**Escalation:**

| Severity | Action |
|----------|--------|
| P0 (data leak, auth bypass, payment failure) | Stop onboarding, rollback, fix within 4h |
| P1 (module broken for all users) | Hotfix within 24h |
| P2 (single-tenant cosmetic) | Next sprint |

---

## Pilot customer tracker (template)

| # | Company | orgId | Admin email | Provisioned | Smoke OK | Go-live date | Notes |
|---|---------|-------|-------------|-------------|----------|--------------|-------|
| 0 | AsoftechInsightz (demo) | client-demo | demo@asoftechinsightz.com | ✅ | ✅ | — | Internal demo |
| 1 | | | | | | | |
| 2 | | | | | | | |

---

## Automated onboarding script (AsoftechInsightz first tenant)

For the platform operator's own tenant alignment:

```bash
cd /opt/asoftech-insightz
source .env
export PILOT_ADMIN_PASSWORD='your-secure-password'
bash scripts/pilot-onboard-asoftechinsightz.sh
```

See [`platform/ASOFTECHINSIGHTZ_PILOT_VALIDATION.md`](./platform/ASOFTECHINSIGHTZ_PILOT_VALIDATION.md).

---

## Exit criteria (pilot → public GA)

- [ ] 5–10 customers onboarded and active
- [ ] Uptime ≥ 99.9% over pilot window
- [ ] Zero P0, zero tenant leakage
- [ ] Qualitative customer satisfaction
- [ ] External pen test completed
- [ ] Razorpay live keys (if billing enabled)
- [ ] 1k-VU load test (optional stretch)

Decision documented in updated [`RELEASE_CERTIFICATION.md`](./RELEASE_CERTIFICATION.md).
