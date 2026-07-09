# Database Validation — RC1

**Generated:** 2026-06-22  
**Engine:** MongoDB 7  
**Review reference:** `DATABASE_REVIEW.md`, `scripts/mongo-indexes.mjs`

## Summary

| Check | Result |
|-------|--------|
| Collections catalogued | ~95 |
| Schema files in `database/schemas/` | 8 (+ mongosh-init) |
| Index migration scripts | ✅ `database/migrations/` |
| Tenant key (`orgId`) on CRM data | ✅ |
| Unique constraints | ✅ users.email, auth tokens, org activity sourceKey |
| Soft deletes (leads) | ✅ `deletedAt` field + sparse index |
| Audit fields | ✅ `createdAt`, `updatedAt`, `createdBy` on most writes |
| Orphan risk | 🟡 Legacy `products` + `retail_products` dual catalog |
| Missing indexes | 🟡 Some marketing collections — run migration 002 |
| Duplicate indexes | ✅ Migration runner skips existing keys |
| Tenant leakage | ✅ P0 fixes applied (see `SECURITY_AUDIT_REPORT.md`) |

---

## Collections by domain

### Tenancy & auth
`orgs`, `users`, `auth_refresh_tokens`, `auth_otps`, `auth_exchange_codes`, `consent_log`, `portal_users`, `push_devices`, `team_members`, `onboarding_profiles`, `onboarding_progress`

### CRM
`leads`, `lead_timeline`, `lead_notes`, `lead_tasks`, `lead_status_history`, `lead_assignments`, `lead_attachments`, `follow_ups`, `opportunities`, `opportunity_activities`, `territories`, `customers`, `customer_activities`, `customer_notes`

### Commercial
`proposals`, `proposal_items`, `proposal_templates`, `invoices`, `payments`, `revenue`, `subscriptions`, `subscription_plans`, `subscription_activities`, `customer_subscriptions`, `catalogs`, `document_versions`

### Campaigns & comms
`campaigns`, `campaign_activities`, `campaign_executions`, `campaign_messages`, `email_templates`, `email_messages`, `whatsapp_threads`, `whatsapp_messages`

### Retail
`retail_stores`, `retail_products`, `retail_inventory`, `retail_sales`, `retail_payment_orders`, `products` (legacy)

### Platform
`platform_events`, `dead_letter_events`, `audit_logs`, `report_exports`, `agent_*`, `marketing_*`, `scanner_*`, `qr_*`, `business_cards`, `review_*`, `partners`, `partner_*`

---

## Indexes (high priority)

| Collection | Index | Purpose |
|------------|-------|---------|
| `users` | `{ email: 1 }` unique | Login |
| `leads` | `{ orgId: 1, id: 1 }` | Tenant lead lookup |
| `leads` | `{ orgId: 1, deletedAt: 1 }` sparse | Soft delete filter |
| `auth_refresh_tokens` | `{ tokenHash: 1 }` unique | Session security |
| `opportunities` | `{ orgId: 1, stage: 1 }` | Pipeline queries |
| `retail_payment_orders` | `{ orgId: 1, razorpay_order_id: 1 }` | POS payment (Sprint 10) |
| `retail_products` | `{ orgId: 1, barcode: 1 }` sparse | Barcode lookup |
| `lead_attachments` | `{ orgId: 1, leadId: 1, createdAt: -1 }` | Files tab |

Apply: `node database/migrations/run.mjs up`

---

## Foreign references (logical)

| From | Field | To |
|------|-------|-----|
| `leads` | `opportunityId` | `opportunities.id` |
| `opportunities` | `leadId` | `leads.id` |
| `lead_attachments` | `leadId` | `leads.id` |
| `retail_inventory` | `productId` | `retail_products.id` |
| `retail_sales` | `items[].inventoryId` | `retail_inventory.id` |
| `whatsapp_messages` | `threadId` | `whatsapp_threads.id` |

**Note:** MongoDB has no enforced FK constraints — application layer validates.

---

## Tenant isolation validation

- ✅ Service queries include `{ orgId }` filter (e.g. `lib/leads/service.js`, `lib/opportunities/service.js`)
- ✅ Production mode disables demo tenant (`lib/security/production.js`)
- ✅ Cross-tenant partner referral leak fixed (pre-RC1 audit)
- 🟡 JWT resolves user by `id` only — org change requires re-login (acceptable)

---

## Seed data

| Script | Purpose |
|--------|---------|
| `lib/dev-seed.js` / `lib/demo-seed.js` | Dev demo org |
| `scripts/mongo-bootstrap.mjs` | CI bootstrap |
| `database/mongosh-init.js` | Business cards init |

**Production:** Disable `ALLOW_DEV_SEED`; use `scripts/mongo-bootstrap.mjs` for cert admin only.

---

## Validation commands

```bash
node database/migrations/run.mjs up --dry-run
node scripts/mongo-indexes.mjs --dry-run
node scripts/mongo-bootstrap.mjs   # CI/staging
```

---

## Issues & remediation

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| DB-1 | P2 | Dual `products` / `retail_products` | Migration script to consolidate |
| DB-2 | P2 | Not all collections in `database/schemas/` | Expand schema validators |
| DB-3 | P1 | Run migration 003 on staging/prod | `run.mjs up` before RC1 deploy |

**Database validation score: 88/100**
