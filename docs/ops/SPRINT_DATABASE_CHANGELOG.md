# Sprint Database Changelog

Cumulative record of MongoDB changes applied on VPS (`asoftech_saas`).  
**Update this file after every sprint deploy on `187.127.179.138`.**

| Field | Value |
|-------|-------|
| VPS | `187.127.179.138` |
| DB | `asoftech_saas` |
| Apply script | `npm run db:indexes` |
| Full bootstrap | `npm run db:bootstrap` |

---

## S0 — Stabilization

**Deployed:** Prior to Sprint 1  
**Status:** Applied

### Collections touched
- Existing CRM collections (`leads`, `opportunities`, `proposals`, `invoices`, `payments`, etc.)

### Indexes added
- Core tenant indexes on `leads`, `opportunities`, `proposals`, `campaigns`, `subscriptions`, `customers`, `invoices`, `payments`
- `audit_logs_orgId_createdAt`
- `auth_refresh_tokenHash`, `auth_otps_lookup`
- `webhook_events_eventId`
- `lead_scores_orgId_score`
- `campaign_executions_org_campaign`
- `scanner_results_org_job`

### VPS sign-off
| Check | Date | Operator | Result |
|-------|------|----------|--------|
| Indexes applied | — | — | Pending re-confirm on VPS |
| go-live-retest 44/44 | — | — | Pending |

---

## S1 — Digital Business Card

**Deployed:** Sprint 1 complete  
**Status:** Applied (code); VPS sign-off pending

### Collections added
| Collection | Purpose |
|------------|---------|
| `business_cards` | Digital business card profiles |

### Indexes added
| Collection | Index |
|------------|-------|
| `business_cards` | `{ orgId: 1, id: 1 }` |
| `business_cards` | `{ slug: 1 }` unique |
| `business_cards` | `{ orgId: 1, updatedAt: -1 }` |

### Seed data
- Demo org `demo-org`
- Admin `admin@asoftechinsightz.com`
- Published card slug `asoftech-demo` → `/c/asoftech-demo`

### VPS sign-off
| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run db:bootstrap` | | | |
| `npm run db:indexes` | | | |
| Public `/c/asoftech-demo` | | | |

---

## S2 — QR Engine

**Deployed:** Pending VPS  
**Status:** Code complete; awaiting VPS deploy

### Collections added
| Collection | Purpose |
|------------|---------|
| `qr_codes` | QR definitions, stats, tenant metadata |
| `qr_events` | Scan / click / conversion event log |
| `qr_conversions` | Conversion records (lead, order, etc.) |

### Indexes added
| Collection | Index | Options |
|------------|-------|---------|
| `qr_codes` | `{ orgId: 1 }` | |
| `qr_codes` | `{ orgId: 1, type: 1 }` | |
| `qr_codes` | `{ orgId: 1, code: 1 }` | unique |
| `qr_codes` | `{ orgId: 1, createdAt: -1 }` | |
| `qr_codes` | `{ orgId: 1, id: 1 }` | |
| `qr_codes` | `{ orgId: 1, updatedAt: -1 }` | |
| `qr_codes` | `{ code: 1 }` | unique (public lookup) |
| `qr_events` | `{ orgId: 1, qrCodeId: 1, createdAt: -1 }` | |
| `qr_events` | `{ orgId: 1, eventType: 1, createdAt: -1 }` | |
| `qr_conversions` | `{ orgId: 1, qrCodeId: 1, createdAt: -1 }` | |
| `qr_conversions` | `{ orgId: 1, createdAt: -1 }` | |

### Schema docs
- `database/schemas/qr_codes.js`
- `database/schemas/qr_events.js`
- `database/schemas/qr_conversions.js`

### No destructive migrations
- Collections created on first insert; indexes are additive only
- No changes to certified CRM/revenue/payment collections

### VPS deploy commands
```bash
cd /opt/asoftech
git pull
docker compose up -d mongo
npm run db:indexes
npm run build
npm run dev -- --hostname 0.0.0.0 --port 3007 &
npm run db:qr-retest
node scripts/go-live-retest.mjs
```

### VPS sign-off
| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run db:indexes` (QR indexes) | | | |
| `qr_codes` collection exists | | | |
| `qr_events` collection exists | | | |
| `qr_conversions` collection exists | | | |
| `npm run db:qr-retest` PASS | | | |
| `go-live-retest.mjs` 44/44 | | | |
| `/growth/qr` UI loads | | | |
| `/q/{code}` redirect works | | | |

---

## S3 — Reviews (planned deploy — deferred)

**Status:** Code complete; VPS batch with S2

### Collections added
| Collection | Purpose |
|------------|---------|
| `review_campaigns` | Campaign config + aggregate stats |
| `review_requests` | Per-customer tokens, ratings, comments |

### Indexes added
| Collection | Index |
|------------|-------|
| `review_campaigns` | `{ orgId: 1, id: 1 }` |
| `review_campaigns` | `{ orgId: 1, createdAt: -1 }` |
| `review_campaigns` | `{ orgId: 1, status: 1 }` |
| `review_requests` | `{ orgId: 1, id: 1 }` |
| `review_requests` | `{ orgId: 1, campaignId: 1, createdAt: -1 }` |
| `review_requests` | `{ token: 1 }` unique |
| `review_requests` | `{ orgId: 1, createdAt: -1 }` |

### VPS sign-off
| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run deploy:s3` | | | |
| `db:reviews-retest` PASS | | | |
| `/growth/reviews` UI | | | |
| `/review/{token}` public | | | |

---

## S4 — WhatsApp + AI v1 (planned deploy — deferred)

| Collection | Purpose |
|------------|---------|
| `whatsapp_threads` | Org-scoped WhatsApp conversation threads |
| `whatsapp_messages` | Thread messages (inbound/outbound) |

### Indexes

| Collection | Index |
|------------|-------|
| `whatsapp_threads` | `{ orgId: 1, id: 1 }` |
| `whatsapp_threads` | `{ orgId: 1, contactPhone: 1 }` unique |
| `whatsapp_threads` | `{ orgId: 1, lastMessageAt: -1 }` |
| `whatsapp_messages` | `{ orgId: 1, threadId: 1, createdAt: 1 }` |

### Sign-off

| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run deploy:s4` | | | |
| `db:sprint4-retest` PASS | | | |
| Conversations UI | | | |
| Lead AI panel | | | |
| Card click tracking | | | |

---

## S5 — Suite polish (planned deploy — deferred)

No new collections. RBAC + portal UI only.

### Sign-off

| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run deploy:s5` | | | |
| `db:sprint5-retest` PASS | | | |
| `/portal/login` + invoices | | | |
| `/partners/dashboard` | | | |
| Nav feature gating | | | |

---

## S6 — Retail foundation (planned deploy — deferred)

| Collection | Purpose |
|------------|---------|
| `retail_stores` | Store/branch master |
| `retail_products` | SKU catalog + AI metadata |
| `retail_inventory` | Stock levels by store |

### Sign-off

| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `npm run deploy:s6` | | | |
| `db:retail-retest` PASS | | | |
| `/retailedge360` UI | | | |

---

## UAT — Production defect fixes

**Status:** Code ready; apply on VPS with `npm run deploy:uat`

### Collections added / extended

| Collection | Change | Purpose |
|------------|--------|---------|
| `territories` | **NEW** | Territory master per org |
| `leads` | **EXTENDED** | `deletedAt`, `deletedBy`, `restoredAt`, `restoredBy` |
| `lead_assignments` | **EXTENDED** | `assignedBy` on assignment history |
| `audit_logs` | **EXISTING** | `lead.soft_delete`, `lead.restore` actions |

### `territories` document shape

```js
{
  id: "uuid",
  orgId: "demo-org",
  name: "Bengaluru",
  code: "BENGALURU",
  region: "India",
  manager: "",
  active: true,
  createdAt: "2026-06-22T...",
  updatedAt: "2026-06-22T...",
  createdBy: "user-id",
  updatedBy: "user-id"
}
```

### `leads` soft-delete fields

```js
{
  // ...existing lead fields...
  deletedAt: "2026-06-22T10:00:00.000Z",  // set on delete
  deletedBy: "user-id",
  restoredAt: "2026-06-22T11:00:00.000Z", // set on restore
  restoredBy: "admin-user-id"
}
```

Active lead filter (all list/search queries):

```js
{ $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }] }
```

### Indexes added (UAT)

| Collection | Index | Notes |
|------------|-------|-------|
| `leads` | `{ orgId: 1, deletedAt: 1 }` sparse | Soft-delete filter |
| `leads` | `{ orgId: 1, territory: 1 }` | Territory reporting |
| `leads` | `{ orgId: 1, name/email/phone/company: 1 }` | Global search |
| `territories` | `{ orgId: 1, id: 1 }` | CRUD lookup |
| `territories` | `{ orgId: 1, name: 1 }` | Name filter |
| `territories` | `{ orgId: 1, active: 1, name: 1 }` | Active list |
| `lead_assignments` | `{ orgId: 1, leadId: 1, createdAt: -1 }` | History tab |
| `audit_logs` | `{ orgId: 1, entity: 1, entityId: 1 }` | Delete audit trail |
| `opportunities` | `{ orgId: 1, name: 1 }` | Global search |
| `proposals` | `{ orgId: 1, clientName: 1 }` | Global search |
| `campaigns` | `{ orgId: 1, name: 1 }` | Global search |

### Migration commands

```bash
npm run db:indexes          # apply indexes (idempotent)
npm run db:uat-migrate      # seed territories + backfill assignments
npm run db:uat-migrate -- --dry-run
npm run db:uat-migrate -- --org-id=demo-org
```

Or full automated:

```bash
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:uat
```

### VPS sign-off

| Check | Date | Operator | Result |
|-------|------|----------|--------|
| `db:indexes` | | | |
| `db:uat-migrate` | | | |
| `db:uat-retest` | | | |
| `db:tenant-retest` | | | |
| Territory UI | | | |
| Lead soft delete | | | |

---

## Batch VPS deploy (S2–S6)

When ready on `187.127.179.138`:

```bash
cd /opt/asoftech
git pull && npm install
docker compose up -d mongo
npm run deploy:s2
npm run deploy:s3
npm run deploy:s4
npm run deploy:s5
npm run deploy:s6
npm run dev -- --hostname 0.0.0.0 --port 3007
```


Copy when signing off a deploy:

```
Date: YYYY-MM-DD
Sprint: S{n}
Operator: <name>
Host: 187.127.179.138
DB: asoftech_saas
Command: npm run db:indexes
Output: X created, Y skipped
Retest: PASS/FAIL
Notes:
```
