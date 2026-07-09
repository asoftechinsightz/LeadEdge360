# AsoftechInsightz — Database Review (Phase 4)

**Date:** 23 June 2026  
**Status:** Approved — Sprint 0 index migration authorized  
**Store:** MongoDB (`MONGO_URL`, `DB_NAME`)

---

## 1. Current State Summary

| Metric | Value |
|--------|-------|
| Collections | 50+ |
| Tenant key | `orgId` (convention) |
| Primary business ID | `id` (UUID string) |
| Application indexes | **0 defined** |
| SQL / PostgreSQL | Not used (`pg` dep is dead weight) |
| DB name | `asoftech` — set via `DB_NAME` in `.env` (aligned Sprint 0) |

---

## 2. Collection Inventory by Domain

### 2.1 Core tenancy

| Collection | Key fields | Relationships |
|------------|------------|---------------|
| `orgs` | `id`, `name`, `plan`, `retailEnabled`, `leadEnabled` | Parent of all tenant data |
| `users` | `id`, `orgId`, `email`, `role`, `products[]`, `activeProduct`, `passwordHash` | N:1 org |

### 2.2 CRM (LeadEdge360)

| Collection | Tenant | Notes |
|------------|--------|-------|
| `leads` | `orgId` | Core entity |
| `lead_timeline` | `orgId`, `leadId` | Activity stream |
| `lead_notes` | `orgId`, `leadId` | |
| `lead_tasks` | `orgId`, `leadId` | |
| `lead_status_history` | `orgId`, `leadId` | |
| `lead_assignments` | `orgId`, `leadId` | |
| `follow_ups` | `orgId`, `leadId` | |
| `opportunities` | `orgId` | Links to `leadId` |
| `opportunity_activities` | `orgId` | |
| `proposals` | `orgId` | Links to opportunity |
| `proposal_items` | `orgId` | |
| `proposal_templates` | `orgId` | |

### 2.3 Marketing & scanner

| Collection | Tenant |
|------------|--------|
| `campaigns`, `campaign_activities`, `campaign_executions`, `campaign_messages` | `orgId` |
| `email_templates` | `orgId` |
| `scanner_jobs`, `scanner_results`, `lead_scores`, `website_audits` | `orgId` |

### 2.4 Revenue & billing

| Collection | Tenant | Model |
|------------|--------|-------|
| `subscriptions` | `orgId` | Org SaaS plan |
| `subscription_plans` | global | Catalog |
| `customer_subscriptions` | `orgId` | B2B customer subs |
| `subscription_activities` | `orgId` | |
| `invoices`, `payments`, `revenue` | `orgId` | |
| `webhook_events` | `orgId` | Idempotency |

### 2.5 Customers, portal, partners

| Collection | Tenant |
|------------|--------|
| `customers`, `customer_notes`, `customer_activities` | `orgId` |
| `portal_users`, `support_tickets` | `orgId` |
| `partners`, `partner_referrals`, `partner_commissions`, `partner_payouts` | `orgId` |

### 2.6 Retail (minimal today)

| Collection | Tenant | Gap |
|------------|--------|-----|
| `products` | `orgId` | Inventory fields only — not full retail |

### 2.7 Comms & compliance

| Collection | Tenant |
|------------|--------|
| `whatsapp_messages`, `notifications`, `push_devices` | `orgId` |
| `audit_logs`, `consent_log`, `data_deletion_requests` | `orgId` |
| `contact_requests` | varies |
| `report_exports`, `onboarding_progress` | `orgId` |

---

## 3. Standard Document Schema (target)

All **new** collections must include:

```javascript
{
  id: String,           // UUID
  orgId: String,        // required, indexed
  createdAt: String,    // ISO-8601
  updatedAt: String,    // ISO-8601
  createdBy: String,    // userId
  updatedBy: String,    // userId
  // ... domain fields
}
```

**Migration strategy for existing collections:** Add `createdBy`/`updatedBy` on write — do not backfill in Sprint 0 (optional later).

---

## 4. New Collections (approved design)

### 4.1 Growth — Business Card

**Collection:** `business_cards`

```javascript
{
  id, orgId, createdAt, updatedAt, createdBy, updatedBy,
  slug: String,              // unique globally
  published: Boolean,
  profile: {
    businessName, tagline, description,
    phone, email, whatsapp,
    website, address, city, state, pincode,
    latitude, longitude,
    logoUrl, coverUrl
  },
  socialLinks: { google, facebook, instagram, linkedin },
  theme: { primaryColor, layout },
  stats: { views, clicks }
}
```

**Indexes:** `{ slug: 1 }` unique, `{ orgId: 1 }`

### 4.2 QR Engine

**Collection:** `qr_codes`

```javascript
{
  id, orgId, createdAt, updatedAt, createdBy,
  code: String,              // short code for /q/{code}
  type: 'business_card' | 'whatsapp' | 'review',
  targetId: String,          // business_card.id or campaign id
  payload: Object,           // type-specific
  label: String,
  active: Boolean,
  stats: { scans, clicks, conversions }
}
```

**Collection:** `qr_events`

```javascript
{
  id, orgId, qrCodeId, createdAt,
  eventType: 'scan' | 'click' | 'convert',
  metadata: { userAgent, ip, referer, leadId }
}
```

**Indexes:** `{ code: 1 }` unique, `{ orgId: 1, qrCodeId: 1, createdAt: -1 }`

### 4.3 Reviews

**Collection:** `review_campaigns`

```javascript
{
  id, orgId, createdAt, updatedAt, createdBy,
  name, status, channel, templateId,
  audienceFilter, stats: { sent, completed, avgRating }
}
```

**Collection:** `review_requests`

```javascript
{
  id, orgId, campaignId, leadId, customerId,
  status: 'pending' | 'sent' | 'completed' | 'declined',
  rating, reviewText, platform, sentAt, completedAt
}
```

**Collection:** `review_response_templates`

```javascript
{ id, orgId, name, body, sentiment: 'positive' | 'negative' | 'neutral' }
```

### 4.4 WhatsApp (enhancement)

Extend `whatsapp_messages`:

```javascript
// add fields: direction, autoReply, conversationId, businessCardId
```

**Collection:** `whatsapp_auto_rules` (new)

```javascript
{
  id, orgId, trigger: 'keyword' | 'first_message',
  pattern, response, active
}
```

### 4.5 AI (cache layer)

**Collection:** `ai_inference_cache` (optional Sprint 5)

```javascript
{
  id, orgId, type, entityId, inputHash, result, createdAt, expiresAt
}
```

### 4.6 Retail (future — Sprint 6+)

Separate collections — **do not reuse `products` for POS transactions:**

| Collection | Purpose |
|------------|---------|
| `retail_stores` | Multi-branch |
| `retail_inventory` | Stock levels |
| `retail_transactions` | POS sales |
| `retail_transaction_items` | Line items |
| `retail_suppliers` | Supplier master |
| `retail_loyalty_accounts` | Points |

---

## 5. Index Migration Plan (Sprint 0)

**Script:** `scripts/mongo-indexes.mjs` (to create)

### 5.1 P0 indexes (existing collections)

| Collection | Index | Type |
|------------|-------|------|
| `users` | `{ email: 1 }` | unique |
| `users` | `{ orgId: 1 }` | compound |
| `leads` | `{ orgId: 1, id: 1 }` | compound |
| `leads` | `{ orgId: 1, createdAt: -1 }` | list sort |
| `leads` | `{ orgId: 1, status: 1 }` | filter |
| `opportunities` | `{ orgId: 1, id: 1 }` | compound |
| `opportunities` | `{ orgId: 1, stage: 1 }` | pipeline |
| `proposals` | `{ orgId: 1, id: 1 }` | compound |
| `campaigns` | `{ orgId: 1, createdAt: -1 }` | list |
| `subscriptions` | `{ orgId: 1, status: 1 }` | plan gate |
| `customers` | `{ orgId: 1, id: 1 }` | compound |
| `invoices` | `{ orgId: 1, createdAt: -1 }` | list |
| `payments` | `{ orgId: 1, orderId: 1 }` | lookup |
| `audit_logs` | `{ orgId: 1, createdAt: -1 }` | list |
| `auth_refresh_tokens` | `{ tokenHash: 1 }` | unique |
| `auth_otps` | `{ destination: 1, purpose: 1, consumedAt: 1 }` | verify |
| `webhook_events` | `{ eventId: 1 }` | unique dedupe |

### 5.2 Execution rules

- Run against staging first
- `createIndex` with `{ background: true }`
- **Non-breaking** — no collection renames, no field removals
- Log index build status
- Add to `PRODUCTION_READINESS_CHECKLIST.md`

---

## 6. Tenant Isolation Review

### 6.1 Compliant pattern (keep)

```javascript
await db.collection('leads').findOne({ orgId, id: leadId });
```

### 6.2 Violations to fix (Sprint 0)

| File | Issue | Fix |
|------|-------|-----|
| `app/api/growth-audit/route.js` | Hardcoded `ORG_ID` | Use `resolveTenant` |
| `app/api/catalog/route.js` | Hardcoded `ORG_ID` | Use `resolveTenant` |
| `app/api/analytics/summary/route.js` | No `orgId` filter | Add tenant scope |
| `app/api/analytics/funnel/route.js` | No `orgId` filter | Add tenant scope |
| `app/api/lead-scoring/dashboard/route.js` | Global counts | Add `orgId` |

### 6.3 Tenant isolation test (Sprint 0)

Script: `scripts/tenant-isolation-check.mjs`

- Seed two orgs with distinct data
- Verify org A token cannot read org B records on top 20 endpoints

---

## 7. Audit Trail Standardization

**Canonical write path:** `lib/audit/service.js`

```javascript
await writeAuditLog({
  orgId, userId, action, entity, entityId, detail, ip, ua
});
```

**Sprint 0:** Document field schema in `lib/audit/service.js` JSDoc.  
**Sprint 1+:** New modules must use service only (no inline `audit_logs` inserts).

---

## 8. Data Retention (policy)

| Data | Retention | Notes |
|------|-----------|-------|
| `audit_logs` | 2 years | Archive job future |
| `qr_events` | 1 year | Aggregate to stats |
| `auth_otps` | 24 hours | TTL index future |
| `webhook_events` | 90 days | |
| `ai_inference_cache` | 7 days | TTL index |

TTL indexes — Sprint 5+ (non-blocking).

---

## 9. Backup & DR

Existing: `scripts/mongo-backup.mjs`, `scripts/mongo-restore.mjs`  
Documented in `DR_BACKUP_RECOVERY_REPORT.md`

**Sprint 0 action:** Verify backup includes new collections after Sprint 1.

---

## 10. Database Review Sign-Off

| Item | Decision |
|------|----------|
| MongoDB remains primary store | ✅ |
| New collection schemas | ✅ Approved |
| Sprint 0 index migration | ✅ Authorized |
| Tenant violation fixes | ✅ Authorized |
| `DB_NAME` alignment | ✅ Fix in Sprint 0 |
| Retail separate collections | ✅ Approved for Sprint 6+ |

**Next:** `API_REVIEW.md`
