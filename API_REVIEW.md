# AsoftechInsightz — API Review (Phase 5)

**Date:** 23 June 2026  
**Status:** Approved  
**Total endpoints (current):** ~150+ across dedicated routes + catch-all

---

## 1. API Architecture Assessment

### 1.1 Strengths

| Strength | Evidence |
|----------|----------|
| Domain service layer | `lib/*/service.js` pattern for revenue, campaigns, partners, etc. |
| Guard helpers | `guardCrmRequest`, `guardRevenueRequest`, etc. |
| Plan gating | `lib/billing/require-plan.js` |
| Mobile API surface | `/api/mobile/*` bootstrap, sync, lead mutations |
| Webhook idempotency | `webhook_events` dedupe in payments |
| Privacy APIs | DPDP export/consent/delete |
| Health probes | `/api/health/live`, `/ready` |

### 1.2 Weaknesses

| Weakness | Risk | Remediation |
|----------|------|-------------|
| Monolithic catch-all (~2,500 lines) | Regression, auth drift | Strangler — new domains only in dedicated routes |
| Inconsistent auth | Data leak | Sprint 0 tenant fixes + guard audit |
| No OpenAPI spec | Mobile/integration friction | Sprint 0 publish `docs/openapi.yaml` skeleton |
| No rate limiting | Brute force on auth | Sprint 0 middleware |
| Global analytics routes | Cross-tenant exposure | Add `orgId` filter |
| Mock HTTP adapter gaps | False "real mode" | Sprint 0 fix `httpClient.ts` |

---

## 2. Authentication Matrix (current)

| Pattern | Endpoints | Production safe? |
|---------|-----------|------------------|
| `guard*Request` (JWT + plan + perm) | CRM create, revenue, subscriptions, payments, partners, customers | ✅ |
| `requireAuthenticatedTenant` | Privacy APIs | ✅ |
| JWT via `mobile-routes` | Followups, products, notifications, admin | ✅ |
| Portal JWT | `/api/portal/*` | ✅ |
| `resolveTenant` only | Campaigns, scanner, some opportunities | ⚠️ Demo org in dev |
| None | Analytics summary, outreach, catalog, growth-audit, mobile/lead-priority | ❌ Fix Sprint 0 |
| Webhook signature | Razorpay, payment webhook | ✅ |
| Dev bypass | login-password (non-prod) | ✅ Disabled in prod |

---

## 3. Certified API Paths (DO NOT BREAK)

These passed go-live retest (`scripts/go-live-retest.mjs` — 44/44):

| Domain | Key endpoints |
|--------|---------------|
| Auth | `POST /api/auth/login-password` |
| Leads | `GET/POST /api/leads`, `GET/PATCH /api/leads/:id` |
| Opportunities | `GET/POST /api/opportunities`, pipeline, move |
| Proposals | `GET/POST /api/proposals`, PDF, won |
| Campaigns | `GET/POST /api/campaigns`, execute |
| Revenue | `GET /api/revenue/dashboard`, summary, trends |
| Subscriptions | `GET/POST /api/subscriptions`, actions |
| Payments | `POST /api/payments/create-order`, verify, webhook |
| Portal | `POST /api/portal/auth/login`, profile, invoices |
| Partners | `GET/POST /api/partners`, commissions, payout |
| Health | `GET /api/health/live`, `/ready` |
| Privacy | `GET /api/privacy/export`, consent |

**Change policy:** Additive only. Breaking changes require version bump + retest script update.

---

## 4. New API Endpoints (approved design)

### 4.1 Business Card

| Method | Endpoint | Auth | Feature flag |
|--------|----------|------|--------------|
| GET | `/api/growth/business-card` | JWT + plan | `business_card` |
| POST | `/api/growth/business-card` | JWT + plan | `business_card` |
| GET | `/api/growth/business-card/:id` | JWT + plan | `business_card` |
| PATCH | `/api/growth/business-card/:id` | JWT + plan | `business_card` |
| DELETE | `/api/growth/business-card/:id` | JWT + plan | `business_card` |
| POST | `/api/growth/business-card/:id/publish` | JWT + plan | `business_card` |
| GET | `/api/public/card/:slug` | **Public** | — |

### 4.2 QR Engine

| Method | Endpoint | Auth | Feature flag |
|--------|----------|------|--------------|
| GET | `/api/qr` | JWT + plan | `qr_engine` |
| POST | `/api/qr` | JWT + plan | `qr_engine` |
| GET | `/api/qr/:id` | JWT + plan | `qr_engine` |
| PATCH | `/api/qr/:id` | JWT + plan | `qr_engine` |
| DELETE | `/api/qr/:id` | JWT + plan | `qr_engine` |
| GET | `/api/qr/:id/analytics` | JWT + plan | `qr_engine` |
| GET | `/api/public/qr/:code` | **Public** (redirect) | — |
| POST | `/api/mobile/qr/scan` | JWT | `qr_engine` |

### 4.3 Reviews

| Method | Endpoint | Auth | Feature flag |
|--------|----------|------|--------------|
| GET | `/api/reviews/dashboard` | JWT + plan | `reviews` |
| GET/POST | `/api/reviews/campaigns` | JWT + plan | `reviews` |
| POST | `/api/reviews/campaigns/:id/execute` | JWT + plan | `reviews` |
| GET/POST | `/api/reviews/requests` | JWT + plan | `reviews` |
| POST | `/api/reviews/requests/:id/respond` | JWT + plan | `reviews` |
| GET/POST | `/api/reviews/templates` | JWT + plan | `reviews` |

### 4.4 WhatsApp (enhancements)

| Method | Endpoint | Auth | Feature flag |
|--------|----------|------|--------------|
| POST | `/api/whatsapp/send` | JWT | `whatsapp_pro` |
| GET | `/api/whatsapp/conversations` | JWT | `whatsapp_pro` |
| GET | `/api/whatsapp/conversations/:leadId` | JWT | `whatsapp_pro` |
| POST | `/api/whatsapp/auto-rules` | JWT | `whatsapp_pro` |
| POST | `/api/webhooks/whatsapp` | Webhook token | — (existing, enhance) |

### 4.5 AI Growth Assistant

| Method | Endpoint | Auth | Feature flag |
|--------|----------|------|--------------|
| POST | `/api/ai/score/lead` | JWT | `ai_scoring` |
| POST | `/api/ai/score/opportunity` | JWT | `ai_scoring` |
| POST | `/api/ai/suggest/followup` | JWT | `ai_assistant` |
| POST | `/api/ai/generate/content` | JWT | `ai_assistant` |
| GET | `/api/ai/forecast` | JWT | `ai_assistant` |

### 4.6 Shared media upload (Sprint 1)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/media/upload` | JWT (image only, max 2MB) |

---

## 5. API Standards (mandatory for new endpoints)

### 5.1 Request/response

```javascript
// Success list
{ items: [], page: 1, limit: 20, total: 100 }

// Success single
{ data: { ... } }

// Error
{ code: 'VALIDATION_FAILED', message: 'Human readable' }
// HTTP status: 400 | 401 | 403 | 404 | 409 | 500
```

### 5.2 Route file template

```javascript
import { NextResponse } from 'next/server';
import { guardGrowthRequest } from '@/lib/growth/api-helpers';
import { getDb } from '@/lib/mongo';
import { createBusinessCard } from '@/lib/growth/business-card/service';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ctx = await guardGrowthRequest(request, { feature: 'business_card' });
  const db = await getDb();
  const body = await request.json();
  const data = await createBusinessCard(db, ctx.orgId, ctx.userId, body);
  return NextResponse.json({ data }, { status: 201 });
}
```

### 5.3 New guard helper

`lib/growth/api-helpers.js`:

```javascript
export async function guardGrowthRequest(request, { feature } = {}) {
  const { orgId, user } = await requireAuthenticatedTenant(request);
  await requirePlan(orgId, ['BUSINESS_GROWTH', 'ENTERPRISE', 'PROFESSIONAL']);
  if (feature && !hasFeatureForOrg(orgId, feature)) {
    throw planError('PLAN_UPGRADE_REQUIRED');
  }
  return { orgId, userId: user.id, user };
}
```

### 5.4 Public endpoints

- No JWT required
- Rate limit by IP (Sprint 0)
- Return sanitized DTO only (no `orgId` internals, no PII beyond public card fields)
- Log view events to stats (not full audit trail)

---

## 6. Feature Flag Extension

Add to `lib/billing/plan-features.js`:

```javascript
STARTER: ['lead_capture', 'landing_pages', 'lead_export', 'business_card'],

BUSINESS_GROWTH: [
  // existing...
  'business_card', 'qr_engine', 'reviews', 'whatsapp_pro', 'ai_assistant',
],

PROFESSIONAL: [
  // Growth features +
  'ai_scoring', 'advanced_analytics', 'review_automation',
],

ENTERPRISE: [
  // existing + all growth features
],
```

Add **PROFESSIONAL** tier between Growth and Enterprise (approved by product).

---

## 7. Sprint 0 API Fixes (authorized)

| # | Fix | File(s) |
|---|-----|---------|
| 1 | Tenant-scope analytics | `app/api/analytics/*` |
| 2 | Remove hardcoded org | `growth-audit`, `catalog` routes |
| 3 | Auth on outreach routes | `app/api/outreach/*` |
| 4 | Rate limit auth | new `middleware.js` or route wrapper |
| 5 | Fix httpClient mock leak | `src/services/api/adapters/httpClient.ts` |
| 6 | Align `DB_NAME` in `.env` | `.env.example` |
| 7 | Tenant isolation script | `scripts/tenant-isolation-check.mjs` |
| 8 | OpenAPI skeleton | `docs/openapi.yaml` |

**Regression:** Re-run `scripts/go-live-retest.mjs` after Sprint 0 — must remain 44/44 PASS.

---

## 8. Mobile API Roadmap

### Phase A (Sprint 2 — with QR)

```
GET  /api/mobile/growth/card          # own business card summary
POST /api/mobile/qr/scan              # scan + track + resolve
GET  /api/mobile/growth/stats         # card + QR analytics
```

### Phase B (Sprint 4)

```
GET  /api/mobile/reviews/dashboard
POST /api/mobile/reviews/request
```

### Phase C (Sprint 6+ — Retail)

```
POST /api/retail/mobile/pos/sale
GET  /api/retail/mobile/inventory
POST /api/retail/mobile/sync/batch
```

---

## 9. Webhook Contracts (existing + new)

| Webhook | Path | Auth | Action |
|---------|------|------|--------|
| Razorpay | `/api/payments/webhook` | HMAC signature | Payment capture |
| WhatsApp | `/api/webhooks/whatsapp` | `x-webhook-token` | Lead ingest → enhance for conversations |
| Facebook/Google | `/api/webhooks/facebook`, `/google` | token | Lead ingest |

---

## 10. API Review Sign-Off

| Item | Status |
|------|--------|
| Certified paths frozen | ✅ |
| New endpoint design approved | ✅ |
| API standards defined | ✅ |
| Sprint 0 fixes authorized | ✅ |
| Feature flag extension approved | ✅ |
| PROFESSIONAL tier approved | ✅ |

**Next:** `SPRINT_PLAN.md`
