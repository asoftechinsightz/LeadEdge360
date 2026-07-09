# Pilot Org Provisioning

Automated provisioning for the first production pilot customer via `npm run pilot:provision`.

**Script:** `scripts/provision-pilot-org.mjs`  
**Companion:** [Pilot Readiness](./PILOT_READINESS.md) · [AsoftechInsightz Validation](./ASOFTECHINSIGHTZ_PILOT_VALIDATION.md) · [Post-Certification Action Plan](./POST_CERTIFICATION_ACTION_PLAN.md)

---

## What it creates

| Resource | Collection(s) | Notes |
|----------|---------------|-------|
| Organization | `orgs` | Unique `orgId` (never `demo-org`) |
| Admin user | `users` | Active, bcrypt password, unique phone |
| Subscription | `subscriptions` | Default `ENTERPRISE` / `ACTIVE` |
| Branding + GST | `org_branding`, `onboarding_profiles` | Proposal/invoice prefixes, GSTIN, address |
| Proposal template | `proposal_templates` | Default org-scoped template |
| Industry + AI | `org_industry_profile`, `org_ai_settings` | Recommended agents, token/cost budgets |
| Sample data (optional) | `leads`, `catalogs`, `opportunities` | Idempotent pilot samples |
| Audit entry | `audit_logs` | `pilot_org_provisioned` |

---

## Required environment

```bash
PILOT_ORG_NAME="Acme Pvt Ltd"
PILOT_ADMIN_EMAIL=admin@acme.com
PILOT_ADMIN_PASSWORD='StrongPass@2026'   # min 8 characters
```

## Optional environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `PILOT_ORG_ID` | slug from name | Stable org identifier |
| `PILOT_ADMIN_NAME` | Pilot Administrator | Display name |
| `PILOT_ADMIN_PHONE` | auto-generated | Must be unique across users |
| `PILOT_INDUSTRY` | `it_services` | See `lib/agents/industry-profiles.js` |
| `PILOT_PLAN_CODE` | `ENTERPRISE` | Subscription plan |
| `PILOT_GSTIN` | — | GST registration number |
| `PILOT_PAN` | — | PAN |
| `PILOT_PROPOSAL_PREFIX` | `PROP` | Proposal numbering |
| `PILOT_INVOICE_PREFIX` | `INV` | Invoice numbering |
| `PILOT_GST_TYPE` | `CGST_SGST` | GST calculation mode |
| `PILOT_PLACE_OF_SUPPLY` | `PILOT_STATE` | Invoice place of supply |
| `PILOT_PRIMARY_COLOR` | `#0A1F44` | Brand color |
| `PILOT_SEED_SAMPLE` | — | Set `1` to seed sample CRM data |
| `PILOT_AI_TOKEN_BUDGET` | `500000` | Monthly AI token budget |
| `PILOT_AI_COST_BUDGET` | `500` | Monthly AI cost budget (INR) |
| `RETEST_API_BASE` | — | Optional post-provision login check |

Valid industries: `bfsi`, `healthcare`, `manufacturing`, `retail`, `education`, `hospitality`, `real_estate`, `government`, `it_services`.

---

## Usage on VPS

```bash
cd /opt/asoftech-insightz
source .env

export PILOT_ORG_NAME="Acme Pvt Ltd"
export PILOT_ORG_ID="acme-pilot"
export PILOT_ADMIN_EMAIL="admin@acme.com"
export PILOT_ADMIN_PASSWORD='StrongPass@2026'
export PILOT_ADMIN_NAME="Jane Admin"
export PILOT_ADMIN_PHONE='+919876543210'
export PILOT_INDUSTRY=it_services
export PILOT_GSTIN=29AAAAA0000A1Z5
export PILOT_PROPOSAL_PREFIX=ACME
export PILOT_INVOICE_PREFIX=ACME-INV
export RETEST_API_BASE=http://127.0.0.1:3000/api

# Preview (no database writes)
npm run pilot:provision -- --dry-run

# Provision (idempotent — safe to rerun)
npm run pilot:provision

# With sample leads + catalog
npm run pilot:provision -- --seed-sample
```

---

## Flags

| Flag | Description |
|------|-------------|
| `--dry-run` | Print planned actions without writing to MongoDB |
| `--seed-sample` | Upsert sample leads, catalog items, and one opportunity |

---

## Idempotency and rollback

- **Idempotent:** Re-running with the same `PILOT_ORG_ID` upserts org, user, subscription, branding, and AI settings. Existing records are updated; missing records are created.
- **Conflict guard:** Fails if admin email or phone belongs to a different org.
- **Rollback:** If any step fails mid-run, documents **inserted during that run** are deleted automatically. Updates to existing documents are not rolled back.

---

## Sync from dev machine

```powershell
powershell -ExecutionPolicy Bypass -File scripts/vps-sync-pilot-deploy.ps1
```

Then on VPS:

```bash
npm run pilot:provision -- --dry-run   # confirm script is present
```

---

## Post-provision checklist

1. Admin login at production URL
2. **Settings → Document branding** — upload logo and signature
3. Verify proposal/invoice PDF shows correct GST and prefixes
4. Enable SMTP if campaigns are required
5. Run `npm run pilot:verify` as platform admin

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing required env` | Set `PILOT_ORG_NAME`, `PILOT_ADMIN_EMAIL`, `PILOT_ADMIN_PASSWORD` |
| `Email already belongs to org X` | Run `npm run pilot:align-org -- --from-email` then re-provision |
| Login 401 after provision | `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:set-password` |
| `Phone already belongs` | Set unique `PILOT_ADMIN_PHONE` |
| `npm run pilot:provision` not found | Sync `package.json` and `scripts/provision-pilot-org.mjs` to VPS |
| Mongo connection failed | Check `MONGO_URL`, `DB_NAME`, and `lib/mongo-connect.js` host detection |
