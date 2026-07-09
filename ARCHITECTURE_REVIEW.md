# AsoftechInsightz — Architecture Review (Phase 3)

**Date:** 23 June 2026  
**Status:** Approved baseline — implementation may proceed per `SPRINT_PLAN.md`  
**Prerequisites:** `PLATFORM_AUDIT_REPORT.md`, `GAP_ANALYSIS_REPORT.md` (approved)

---

## 1. Architecture Principles (locked)

| # | Principle | Rule |
|---|-----------|------|
| 1 | **Production stability** | Certified CRM/revenue paths are frozen unless bugfix |
| 2 | **No big-bang rewrite** | Strangler pattern for catch-all API migration |
| 3 | **API-first** | New modules: `service → route → UI` (never UI-only) |
| 4 | **Loose product coupling** | LeadEdge360 ↔ RetailEdge360 via shared services APIs only |
| 5 | **Tenant isolation** | Every query scoped by `orgId`; no cross-tenant joins |
| 6 | **Feature flags** | Plan-driven via `PLAN_FEATURES` + `hasFeature()` — no hard-coded plan checks in UI |
| 7 | **Mobile-ready** | REST JSON contracts suitable for future Android/iOS clients |
| 8 | **Auditability** | `writeAuditLog()` on all mutating operations |

---

## 2. System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                        Clients                                   │
│  Web (Next.js)  │  Future Android/iOS  │  Webhooks (n8n, etc.) │
└────────┬────────────────┬──────────────────────┬────────────────┘
         │                │                      │
         ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js 14 App Router (output: standalone)          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ SiteShell    │  │ AppShell     │  │ API Routes           │ │
│  │ (marketing)  │  │ (suite CRM)  │  │ dedicated + catch-all│ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Shared Services │ │ Product Domains │ │ External        │
│ auth, billing,  │ │ leads, retail,  │ │ MongoDB,        │
│ notifications,  │ │ growth (new)    │ │ Razorpay,       │
│ qr, ai, reports │ │                 │ │ Google, SMTP,   │
└─────────────────┘ └─────────────────┘ │ WhatsApp, LLM   │
                                       └─────────────────┘
```

---

## 3. Layered Architecture

### 3.1 Presentation (UI)

| Shell | Path | Auth |
|-------|------|------|
| `SiteShell` | Marketing pages | Public |
| `SuiteRouteLayout` → `AppShell` | CRM suite | `SuiteAuthProvider` (JWT) |
| Bare | `/signin`, `/splash` | Auth flows |
| Public card (new) | `/c/[slug]` | Public read |

**Convention:** Pages are thin; data via React Query + `src/lib/api` or service adapters.

### 3.2 API Layer

| Pattern | Location | Use for |
|---------|----------|---------|
| Dedicated route | `app/api/<domain>/route.js` | **All new modules** |
| Catch-all | `app/api/[[...path]]/route.js` | Legacy CRM — freeze, migrate incrementally |
| Guard helpers | `lib/*/api-helpers.js` | Auth + plan + permission |

**Standard route template:**

```javascript
// app/api/<domain>/route.js
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const ctx = await guardGrowthRequest(request); // auth + plan + feature flag
  const db = await getDb();
  return NextResponse.json(await listItems(db, ctx.orgId, parseQuery(request)));
}
```

### 3.3 Service Layer

| Domain | Path | Status |
|--------|------|--------|
| Leads / sales | `lib/sales/` | Existing |
| Opportunities | `lib/opportunities/` | Existing |
| Proposals | `lib/proposals/` | Existing |
| Campaigns | `lib/campaigns/` | Existing |
| Revenue | `lib/revenue/` | Existing |
| Payments | `lib/payments/` | Existing |
| Subscriptions | `lib/subscriptions/` | Existing |
| Customers | `lib/customers/` | Existing |
| Partners | `lib/partners/` | Existing |
| Portal | `lib/portal/` | Existing |
| Scanner | `lib/scanner/` | Existing |
| Audit | `lib/audit/` | Existing |
| **Growth (new)** | `lib/growth/` | **To build** |
| **QR (new)** | `lib/qr/` | **To build** |
| **Reviews (new)** | `lib/reviews/` | **To build** |
| **Retail (new)** | `lib/retail/` | **To build** |
| **AI (new)** | `lib/ai/` | **To build** — unify scoring |

### 3.4 Data Layer

- **Primary:** MongoDB (`lib/mongo.js`)
- **Tenant key:** `orgId` on every collection document
- **IDs:** UUID strings (`id` field), not `_id` for business logic
- **Indexes:** See `DATABASE_REVIEW.md`

---

## 4. Shared Business Suite Services

Products consume shared services via **HTTP API** or **direct service import** (same monorepo) — never shared collections across product boundaries except via explicit foreign keys (`orgId` + `customerId`).

### 4.1 Service boundaries

```
┌────────────────────────────────────────────────────────────┐
│                    BUSINESS SUITE CORE                      │
├─────────────┬─────────────┬──────────────┬─────────────────┤
│ Auth/Tenant │ Billing/    │ Notification │ Audit           │
│ lib/jwt     │ Subscriptions│ lib/mobile-  │ lib/audit/      │
│ lib/tenant  │ lib/billing │ routes (notif)│ service.js      │
├─────────────┼─────────────┼──────────────┼─────────────────┤
│ QR Engine   │ AI Engine   │ Report Engine│ File/Media      │
│ lib/qr/ NEW │ lib/ai/ NEW │ lib/reports/ │ lib/media/ NEW  │
└─────────────┴─────────────┴──────────────┴─────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  LEADEDGE360    │          │  RETAILEDGE360  │
│  lib/sales      │          │  lib/retail/    │
│  lib/opportunities│        │  (new domain)   │
│  lib/growth/    │          │                 │
│  lib/reviews/   │          │                 │
└─────────────────┘          └─────────────────┘
```

### 4.2 Auth & tenant flow

```
Request
  → Authorization: Bearer <JWT>
  → verifyAccessToken (lib/jwt.js)
  → resolveTenant (lib/tenant.js)
  → { orgId, user, role, perms }
  → guard*Request (plan + permission)
  → service(db, orgId, userId, ...)
```

**Dev bypass:** `lib/dev-auth.js` — non-production only; never in Docker production image without explicit override.

### 4.3 Feature flag flow (target state)

```
requirePlan(orgId, ['BUSINESS_GROWTH', 'ENTERPRISE'])
  → getSubscription(orgId)
  → hasFeature(planCode, 'business_card')
  → allow / deny
```

Extend `lib/billing/plan-features.js` — single source of truth.

---

## 5. New Module Architecture

### 5.1 Digital Business Card

```
lib/growth/business-card/
  ├── schema.js          # validation
  ├── service.js         # CRUD, publish, slug resolution
  └── public.js          # public-safe DTO (no secrets)

app/api/growth/business-card/route.js       # authenticated CRUD
app/api/growth/business-card/[id]/route.js
app/api/public/card/[slug]/route.js         # public GET (no auth)

app/c/[slug]/page.js                        # public SSR page
components/growth/BusinessCardEditor.tsx    # suite UI
```

**Slug:** `{orgSlug}` or `{orgId-short}-{name}` — globally unique index.

### 5.2 QR Engine

```
lib/qr/
  ├── service.js         # generate QR payloads
  ├── track.js           # scan/click/conversion events
  └── types.js           # business_card | whatsapp | review

app/api/qr/route.js                        # create/list QR codes
app/api/qr/[id]/route.js
app/api/qr/[id]/events/route.js            # analytics
app/api/public/qr/[code]/route.js          # redirect + track scan

Public redirect: GET /q/[code] → 302 + event log
```

**QR payload types:**

| Type | Redirect target |
|------|-----------------|
| `business_card` | `/c/{slug}` |
| `whatsapp` | `https://wa.me/{phone}?text={encoded}` |
| `review` | Google review URL or internal review request |

### 5.3 Review & Reputation

```
lib/reviews/
  ├── service.js         # campaigns, requests, responses
  ├── analytics.js
  └── templates.js

app/api/reviews/campaigns/route.js
app/api/reviews/requests/route.js
app/api/reviews/dashboard/route.js
app/api/reviews/[id]/respond/route.js

Reuses: lib/campaigns/ for outbound, lib/notifications for alerts
```

### 5.4 WhatsApp (enhancement)

```
lib/whatsapp/
  ├── service.js         # send, templates, auto-reply rules
  ├── webhook.js         # inbound message handler
  └── lead-capture.js    # webhook → lead create

Extend existing: whatsapp_messages collection, mobile-routes send
Wire: lib/growth/ click-to-chat from business card
```

### 5.5 AI Growth Assistant

```
lib/ai/
  ├── client.js          # LLM wrapper (timeout, fallback)
  ├── lead-score.js      # migrate from lib/scoring.js
  ├── opportunity-score.js
  ├── followup-suggest.js
  ├── content-generate.js
  └── forecast.js        # wrap lib/revenue forecast

app/api/ai/score/lead/route.js
app/api/ai/score/opportunity/route.js
app/api/ai/suggest/followup/route.js
app/api/ai/generate/content/route.js
app/api/ai/forecast/route.js
```

**Rule:** Enterprise UI calls these APIs — remove mock adapter dependency incrementally.

### 5.6 RetailEdge360 (future — separate domain)

```
lib/retail/
  ├── pos/
  ├── inventory/
  ├── gst/
  ├── customers/         # retail shoppers (NOT lib/customers B2B)
  ├── suppliers/
  ├── loyalty/
  └── sync/              # offline queue (future)

app/api/retail/**        # all retail endpoints prefixed
```

**No imports from `lib/opportunities/` or `lib/sales/` inside retail.**

---

## 6. API Strangler Plan (catch-all migration)

Migrate **read-only, low-risk** routes first. Never delete catch-all handlers until dedicated route is verified in production.

| Priority | Route group | Target | Risk |
|----------|-------------|--------|------|
| P0 | `/api/growth/*`, `/api/qr/*`, `/api/reviews/*` | New dedicated | Low |
| P1 | `/api/analytics/*` (tenant-scoped rewrite) | Dedicated + orgId filter | Medium |
| P2 | `/api/leads/*` subset | `app/api/leads/` | High — certified |
| P3 | Remaining catch-all | Incremental | High |

**Rule:** Dedicated routes take precedence in Next.js routing — add new files without modifying catch-all for new domains.

---

## 7. Mobile Architecture (future-ready)

### 7.1 API contract

- Version header: `X-API-Version: 1`
- Auth: Bearer JWT (existing)
- Pagination: `{ page, limit, total, items }`
- Errors: `{ code, message, status }`

### 7.2 Mobile API v1 groups

| Group | Base | Product |
|-------|------|---------|
| Bootstrap | `/api/mobile/bootstrap` | Suite |
| Leads | `/api/mobile/leads/*` | LeadEdge360 |
| Growth | `/api/mobile/growth/*` | LeadEdge360 (new) |
| QR | `/api/mobile/qr/scan` | Suite (new) |
| Retail | `/api/retail/mobile/*` | RetailEdge360 (future) |

### 7.3 Offline (Retail — later)

```
Client queue → POST /api/retail/sync/batch
  → idempotency key per operation
  → server reconciles with inventory locks
```

Not in Sprint 0–2 scope.

---

## 8. Deployment Architecture

```
Docker (node:20-alpine)
  ├── server.js (standalone)
  ├── .next/static/     ← MUST be copied (CSS/JS assets)
  ├── public/
  └── node_modules/

Env required (production):
  MONGO_URL, DB_NAME, JWT_SECRET
  RZP_KEY_ID, RZP_KEY_SECRET (payments)
  GOOGLE_PLACES_API_KEY (scanner)
  REQUIRE_AUTH=true
```

**No `DEV_AUTH_BYPASS` in production.**

---

## 9. Security Architecture

| Control | Implementation |
|---------|----------------|
| Authentication | JWT access + refresh rotation |
| Authorization | RBAC (`lib/rbac.js`) + plan gates |
| Tenant isolation | `orgId` on all queries; integration tests |
| Rate limiting | **Sprint 0:** middleware on `/api/auth/*` |
| Input validation | Zod in services (new modules) |
| Audit | `writeAuditLog()` on mutations |
| File upload | **Sprint 1:** `lib/media/` with type/size limits |
| CSP | `next.config.js` — extend for `cdn.razorpay.com` if needed |

---

## 10. What we will NOT do

- Rewrite certified CRM services
- Merge Retail into Lead CRM collections
- Remove catch-all in one release
- Ship web-only business card (public API is mandatory)
- Enable dev auth bypass in production
- Add PostgreSQL alongside Mongo (unless explicitly approved later)

---

## 11. Architecture Sign-Off

| Review area | Decision |
|-------------|----------|
| Layered service pattern | ✅ Approved |
| Shared services boundaries | ✅ Approved |
| New module folder structure | ✅ Approved |
| API strangler approach | ✅ Approved |
| Retail as separate domain | ✅ Approved |
| Mobile API-first contracts | ✅ Approved |

**Next:** `DATABASE_REVIEW.md`, `API_REVIEW.md`, `SPRINT_PLAN.md`
