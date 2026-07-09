# API Inventory — AsoftechInsightz

> **Reference inventory only.** Canonical API rules and authority: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §9 · `docs/openapi.json`

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Base URL (Production):** `https://app.asoftechinsightz.com/api`  
**Base URL (Local):** `http://localhost:3000/api`

---

## 1. Architecture Overview

| Aspect | Detail |
|--------|--------|
| Framework | Next.js 14 App Router Route Handlers |
| Route files | 73 files under `app/api/` |
| Catch-all | `app/api/[[...path]]/route.js` (~2400+ lines) |
| Mobile router | `lib/mobile-routes.js` (delegated from catch-all) |
| OpenAPI spec | `docs/openapi.json` |
| Postman collection | `docs/postman-collection.json` |
| Auth | Bearer JWT (`Authorization` header) + refresh tokens |
| Tenant scoping | `lib/tenant.js` → `resolveTenant(request)` |
| Frontend consumption | Inline `fetch('/api/...')` — no centralized client |

**Note:** Dedicated route files take precedence over the catch-all. Some endpoints are registered in both layers.

---

## 2. Frontend API Consumers

Pages that call APIs directly (no service abstraction):

| Page | File | Endpoints Used |
|------|------|----------------|
| LeadEdge360 | `app/leadedge360/page.js` | `/api/leads`, `/api/kpis`, `/api/agents`, PATCH `/api/leads/:id`, POST `/api/leads/:id/rescore`, POST `/api/leads` |
| RetailEdge360 | `app/retailedge360/page.js` | `/api/products`, `/api/retail-kpis`, POST `/api/products/:id/repredict`, DELETE `/api/products/:id`, POST `/api/products` |
| Sign-in | `app/signin/page.js` | `/api/auth/login-otp`, `/api/auth/verify-otp`, `/api/auth/login-password` |
| Subscribe | `app/subscribe/page.js` | `/api/billing/checkout`, `/api/billing/verify` |
| Proposals | `app/proposals/page.js` | `/api/proposals`, `/api/dashboard/proposals` |
| Invoices | `app/invoices/page.js` | `/api/invoices` |
| Revenue | `app/revenue/page.js` | `/api/revenue/dashboard` |
| Onboarding | `app/onboarding/page.js` | `/api/onboarding/status` |
| Contact | `app/contact/page.js` | POST `/api/contact` |
| Growth Audit | `app/growth-audit/page.js` | POST `/api/growth-audit` |
| DPDP Banner | `components/site/DpdpConsentBanner.jsx` | POST `/api/auth/dpdp-consent` |

**Gap:** Campaigns, opportunities, scanner, lead-scoring, sales queue, and most analytics APIs have **no frontend UI**.

---

## 3. Dedicated API Routes (72 files)

### 3.1 Authentication

| Method | Path | File |
|--------|------|------|
| GET | `/api/auth/google` | `app/api/auth/google/route.js` |
| POST | `/api/auth/logout` | `app/api/auth/logout/route.js` |

### 3.2 CRM & Opportunities

| Method | Path | File |
|--------|------|------|
| POST | `/api/crm/auto-convert` | `app/api/crm/auto-convert/route.js` |
| POST | `/api/opportunities/auto-create` | `app/api/opportunities/auto-create/route.js` |
| POST | `/api/opportunities/create` | `app/api/opportunities/create/route.js` |
| GET | `/api/opportunities/dashboard` | `app/api/opportunities/dashboard/route.js` |
| POST | `/api/opportunities/update-stage` | `app/api/opportunities/update-stage/route.js` |
| POST | `/api/opportunities/update-value` | `app/api/opportunities/update-value/route.js` |
| POST | `/api/opportunities/[id]/proposal` | `app/api/opportunities/[id]/proposal/route.js` |

### 3.3 Lead Scoring

| Method | Path | File |
|--------|------|------|
| GET | `/api/lead-scoring/dashboard` | `app/api/lead-scoring/dashboard/route.js` |
| GET | `/api/lead-scoring/priority` | `app/api/lead-scoring/priority/route.js` |
| POST | `/api/lead-scoring/run` | `app/api/lead-scoring/run/route.js` |
| GET | `/api/mobile/lead-priority` | `app/api/mobile/lead-priority/route.js` |

### 3.4 Billing, Payments & Subscriptions

| Method | Path | File |
|--------|------|------|
| GET, POST | `/api/payments` | `app/api/payments/route.js` |
| POST | `/api/payments/create-order` | `app/api/payments/create-order/route.js` |
| POST | `/api/payments/verify` | `app/api/payments/verify/route.js` |
| POST | `/api/payments/webhook` | `app/api/payments/webhook/route.js` |
| GET | `/api/pricing/plans` | `app/api/pricing/plans/route.js` |
| POST | `/api/subscriptions/create` | `app/api/subscriptions/create/route.js` |

**Service layer:** `lib/razorpay.js`, `lib/billing/*` (check-feature, check-role, check-subscription, get-subscription, plan-features, require-plan, roles)

### 3.5 Proposals & Invoices

| Method | Path | File |
|--------|------|------|
| GET, POST | `/api/proposals` | `app/api/proposals/route.js` |
| POST | `/api/proposals/auto-generate` | `app/api/proposals/auto-generate/route.js` |
| POST | `/api/proposals/[id]/convert-to-invoice` | `app/api/proposals/[id]/convert-to-invoice/route.js` |
| POST | `/api/proposals/[id]/email` | `app/api/proposals/[id]/email/route.js` |
| GET | `/api/proposals/[id]/pdf` | `app/api/proposals/[id]/pdf/route.js` |
| POST | `/api/proposals/[id]/status` | `app/api/proposals/[id]/status/route.js` |
| POST | `/api/proposals/[id]/won` | `app/api/proposals/[id]/won/route.js` |
| GET, POST | `/api/proposal-templates` | `app/api/proposal-templates/route.js` |
| GET | `/api/invoices` | `app/api/invoices/route.js` |
| GET | `/api/dashboard/proposals` | `app/api/dashboard/proposals/route.js` |
| GET | `/api/dashboard/invoices` | `app/api/dashboard/invoices/route.js` |

### 3.6 Revenue

| Method | Path | File |
|--------|------|------|
| GET, POST | `/api/revenue` | `app/api/revenue/route.js` |
| GET | `/api/revenue/dashboard` | `app/api/revenue/dashboard/route.js` |
| GET | `/api/revenue/admin-dashboard` | `app/api/revenue/admin-dashboard/route.js` |

### 3.7 Marketing — Campaigns & Outreach

| Method | Path | File |
|--------|------|------|
| GET, POST | `/api/campaigns` | `app/api/campaigns/route.js` |
| GET, PUT, DELETE | `/api/campaigns/[id]` | `app/api/campaigns/[id]/route.js` |
| GET | `/api/campaigns/[id]/analytics` | `app/api/campaigns/[id]/analytics/route.js` |
| POST | `/api/campaigns/[id]/execute` | `app/api/campaigns/[id]/execute/route.js` |
| PUT | `/api/campaigns/[id]/template` | `app/api/campaigns/[id]/template/route.js` |
| GET | `/api/campaigns/analytics` | `app/api/campaigns/analytics/route.js` |
| GET | `/api/campaigns/summary` | `app/api/campaigns/summary/route.js` |
| GET | `/api/campaigns/executions` | `app/api/campaigns/executions/route.js` |
| GET | `/api/campaigns/executions/[executionId]/messages` | `app/api/campaigns/executions/[executionId]/messages/route.js` |
| GET | `/api/analytics/campaigns` | `app/api/analytics/campaigns/route.js` |
| GET | `/api/analytics/funnel` | `app/api/analytics/funnel/route.js` |
| GET | `/api/analytics/summary` | `app/api/analytics/summary/route.js` |
| POST | `/api/outreach/email/send` | `app/api/outreach/email/send/route.js` |
| GET | `/api/outreach/email/summary` | `app/api/outreach/email/summary/route.js` |
| GET, POST | `/api/templates/email` | `app/api/templates/email/route.js` |
| GET, PUT, DELETE | `/api/templates/email/[id]` | `app/api/templates/email/[id]/route.js` |
| GET | `/api/templates/email/summary` | `app/api/templates/email/summary/route.js` |

### 3.8 LeadEdge360 — Sales & Scanner

| Method | Path | File |
|--------|------|------|
| GET | `/api/sales/leads` | `app/api/sales/leads/route.js` |
| GET | `/api/sales/priority` | `app/api/sales/priority/route.js` |
| GET | `/api/sales/queue` | `app/api/sales/queue/route.js` |
| GET | `/api/sales/workload` | `app/api/sales/workload/route.js` |
| GET | `/api/scanner/jobs` | `app/api/scanner/jobs/route.js` |
| GET | `/api/scanner/jobs/[jobId]` | `app/api/scanner/jobs/[jobId]/route.js` |
| GET | `/api/scanner/results` | `app/api/scanner/results/route.js` |
| GET | `/api/scanner/results/[jobId]` | `app/api/scanner/results/[jobId]/route.js` |
| GET | `/api/scanner/summary` | `app/api/scanner/summary/route.js` |
| POST | `/api/scanner/convert/[resultId]` | `app/api/scanner/convert/[resultId]/route.js` |
| POST | `/api/scanner/auto/[resultId]` | `app/api/scanner/auto/[resultId]/route.js` |

### 3.9 Onboarding

| Method | Path | File |
|--------|------|------|
| GET | `/api/onboarding/status` | `app/api/onboarding/status/route.js` |
| GET, POST | `/api/onboarding/progress` | `app/api/onboarding/progress/route.js` |
| POST | `/api/onboarding/company` | `app/api/onboarding/company/route.js` |
| POST | `/api/onboarding/branding` | `app/api/onboarding/branding/route.js` |
| GET, POST | `/api/onboarding/team` | `app/api/onboarding/team/route.js` |
| GET, POST | `/api/onboarding/whatsapp` | `app/api/onboarding/whatsapp/route.js` |
| GET, POST | `/api/onboarding/email` | `app/api/onboarding/email/route.js` |

### 3.10 Partners, Catalog & Growth Audit

| Method | Path | File |
|--------|------|------|
| GET | `/api/partners/dashboard` | `app/api/partners/dashboard/route.js` |
| POST | `/api/partners/payout` | `app/api/partners/payout/route.js` |
| GET, POST | `/api/catalog` | `app/api/catalog/route.js` |
| POST | `/api/growth-audit` | `app/api/growth-audit/route.js` |

---

## 4. Catch-All Router Endpoints

**File:** `app/api/[[...path]]/route.js`  
**Delegates to:** `lib/mobile-routes.js`, `lib/scanner/handler.js`, inline handlers

### 4.1 Health & Auth

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api` | Health check |
| GET | `/api/auth/login` | Redirect to Emergent or `/signin` |
| GET | `/api/auth/callback` | OAuth callback → `/leadedge360` |
| GET | `/api/auth/me` | Current session user |
| POST | `/api/auth/logout` | Clear session (duplicate of dedicated route) |
| POST | `/api/auth/dpdp-consent` | DPDP consent logging |
| POST | `/api/auth/register` | Mobile JWT registration |
| POST | `/api/auth/verify-otp` | OTP verification |
| POST | `/api/auth/verify-email` | Email verification |
| POST | `/api/auth/login-otp` | OTP login initiation |
| POST | `/api/auth/login-password` | Password login |
| POST | `/api/auth/forgot-password` | Password reset request |
| POST | `/api/auth/reset-password` | Password reset |
| POST | `/api/auth/refresh-token` | Token refresh |

### 4.2 Users & Products (Mobile JWT)

| Method | Path |
|--------|------|
| GET, PATCH | `/api/users/me` |
| POST | `/api/users/change-password` |
| GET | `/api/users/subscription` |
| GET | `/api/products` |
| POST | `/api/products/switch` |

**Conflict:** `/api/products` GET is also handled for RetailEdge inventory in the catch-all. Mobile JWT handler runs first and can block retail inventory calls without Bearer token.

### 4.3 Follow-ups & Dashboard KPIs

| Method | Path |
|--------|------|
| GET, POST | `/api/followups` |
| PATCH, DELETE | `/api/followups/[id]` |
| POST | `/api/followups/[id]/close` |
| GET | `/api/followups/reminders` |
| GET | `/api/dashboard/kpis` |
| GET | `/api/dashboard/followups-due` |
| GET | `/api/dashboard/revenue` |
| GET | `/api/dashboard/sales-performance` |

### 4.4 WhatsApp, Notifications & Admin

| Method | Path |
|--------|------|
| POST | `/api/whatsapp/send` |
| POST | `/api/whatsapp/send-template` |
| GET | `/api/whatsapp/conversation/[leadId]` |
| GET | `/api/notifications` |
| POST | `/api/notifications/[id]/read` |
| POST | `/api/notifications/devices` |
| GET, PATCH | `/api/notifications/settings` |
| GET, POST | `/api/admin/users` |
| PATCH, DELETE | `/api/admin/users/[id]` |
| GET | `/api/admin/roles` |
| GET | `/api/admin/subscriptions` |
| GET, POST | `/api/admin/product-access` |

### 4.5 LeadEdge360 — Leads CRM

| Method | Path |
|--------|------|
| GET | `/api/agents` |
| GET, POST | `/api/leads` |
| GET | `/api/leads/sources` |
| GET, PATCH, DELETE | `/api/leads/[id]` |
| POST | `/api/leads/[id]/rescore` |
| POST | `/api/leads/[id]/status` |
| POST | `/api/leads/[id]/assign` |
| GET, POST | `/api/leads/[id]/notes` |
| GET, POST | `/api/leads/[id]/timeline` |
| GET, POST | `/api/leads/[id]/followups` |
| GET, POST | `/api/leads/[id]/tasks` |
| GET | `/api/leads/[id]/status-history` |
| GET | `/api/leads/[id]/assignments` |
| GET | `/api/leads/[id]/activity` |
| GET | `/api/kpis` |
| GET | `/api/lead-dashboard` |
| GET | `/api/followup-dashboard` |
| GET | `/api/task-dashboard` |
| GET | `/api/lead-search` |
| GET | `/api/lead-filters` |
| GET | `/api/recent-activities` |
| GET | `/api/mobile-leads` |

### 4.6 Scanner (Catch-All)

| Method | Path |
|--------|------|
| GET | `/api/scanner` |
| POST | `/api/scanner` |
| POST | `/api/scanner/[jobId]` |

### 4.7 Mobile App Endpoints

| Method | Path |
|--------|------|
| GET | `/api/mobile/home` |
| GET | `/api/mobile/summary` |
| GET | `/api/mobile/bootstrap` |
| GET | `/api/mobile/config` |
| GET | `/api/mobile/sync` |
| GET | `/api/mobile/sync/changes` |
| GET | `/api/mobile/leads/[id]` |
| POST | `/api/mobile/leads/[id]/note` |
| POST | `/api/mobile/leads/[id]/task` |
| POST | `/api/mobile/leads/[id]/followup` |
| PATCH | `/api/mobile/leads/[id]/status` |
| PATCH | `/api/mobile/leads/[id]/assign` |
| GET | `/api/mobile/analytics` |
| GET | `/api/mobile/analytics/trends` |
| GET | `/api/mobile/audit-logs` |
| GET | `/api/mobile/reports` |
| GET | `/api/mobile/reports/[id]/download` |

### 4.8 Analytics & Reports

| Method | Path |
|--------|------|
| GET | `/api/analytics/conversion` |
| GET | `/api/analytics/sources` |
| GET | `/api/analytics/agents` |
| GET | `/api/analytics/trends` |
| GET | `/api/analytics/monthly` |
| GET | `/api/audit-logs` |
| GET | `/api/audit-logs/[entityId]` |
| GET | `/api/reports/exports` |
| POST | `/api/reports/export` |
| GET | `/api/reports/export/[id]` |
| GET | `/api/reports/export/[id]/download` |
| PATCH | `/api/reports/export/[id]` |

### 4.9 RetailEdge360

| Method | Path |
|--------|------|
| GET, POST | `/api/products` |
| POST | `/api/products/[id]/repredict` |
| DELETE | `/api/products/[id]` |
| GET | `/api/retail-kpis` |

### 4.10 Billing (Catch-All — Razorpay)

| Method | Path |
|--------|------|
| GET | `/api/billing/plans` |
| POST | `/api/billing/checkout` |
| POST | `/api/billing/verify` |

### 4.11 Webhooks & Utilities

| Method | Path |
|--------|------|
| POST | `/api/webhooks/razorpay` |
| POST | `/api/webhooks/whatsapp` |
| POST | `/api/webhooks/facebook` |
| POST | `/api/webhooks/google` |
| POST | `/api/contact` |
| POST | `/api/seed-reset` |

---

## 5. API-to-Product Mapping

| Product / Module | Primary APIs | Frontend Coverage |
|------------------|-------------|-------------------|
| **LeadEdge360** | `/api/leads/*`, `/api/kpis`, `/api/agents`, `/api/followups/*`, `/api/opportunities/*`, `/api/lead-scoring/*`, `/api/sales/*`, `/api/scanner/*` | Partial — leads dashboard only |
| **RetailEdge360** | `/api/products`, `/api/retail-kpis` | Partial — inventory dashboard |
| **Billing Center** | `/api/billing/*`, `/api/payments/*`, `/api/pricing/plans`, `/api/subscriptions/*`, `/api/invoices`, `/api/revenue/*` | Partial — subscribe, invoices, revenue, proposals |
| **Dashboard (Executive)** | `/api/dashboard/kpis`, `/api/dashboard/revenue`, `/api/dashboard/sales-performance`, `/api/dashboard/followups-due` | **No dedicated page** |
| **Marketing / Campaigns** | `/api/campaigns/*`, `/api/outreach/*`, `/api/templates/email/*`, `/api/analytics/*` | **No frontend UI** |
| **Partners** | `/api/partners/*` | **No frontend UI** |
| **Onboarding** | `/api/onboarding/*` | Status check only |
| **Mobile** | `/api/mobile/*`, OpenAPI auth/leads surface | API-ready; native apps not in repo |
| **Admin** | `/api/admin/*` | **No frontend UI** |

---

## 6. Backend Service Layer (Reference — Do Not Modify)

| Directory | Domain |
|-----------|--------|
| `lib/billing/` | Subscription, plan features, roles |
| `lib/lead-scoring/` | Scoring engine, batch run |
| `lib/crm-conversion/` | Hot lead → opportunity |
| `lib/opportunities/` | Opportunity lifecycle |
| `lib/campaigns/` | Marketing campaigns |
| `lib/proposals/` | Proposal generation/PDF |
| `lib/scanner/` | Geo lead scanner |
| `lib/sales/` | Sales queue/workload |
| `lib/mobile-routes.js` | Mobile JWT API router |
| `lib/jwt.js`, `lib/password.js`, `lib/otp.js` | Auth |
| `lib/razorpay.js` | Payments |
| `lib/tenant.js` | Multi-tenant |
| `lib/scoring.js` | Legacy AI lead score |
| `lib/retail-ai.js` | Retail shelf-life AI |

---

## 7. Known API Issues (Document Only)

| Issue | Severity | Detail |
|-------|----------|--------|
| `/api/products` path conflict | High | Mobile product list vs retail inventory share same path |
| Dual payment surfaces | Medium | `/api/billing/*` (subscribe page) vs `/api/payments/*` (dedicated routes) |
| Duplicate logout | Low | Both catch-all and dedicated route handle `/api/auth/logout` |
| Unauthenticated demo tenant | Medium | `resolveTenant()` falls back to `demo-org` without JWT |
| Emergent Auth stub | Low | `/api/auth/login` redirects to removed Emergent Auth |

---

## 8. Phase 2+ Frontend API Strategy (Planned)

Without changing API contracts:

1. Introduce `lib/api-client.js` — thin fetch wrapper with JWT header injection from `localStorage`
2. Add `src/types/` — TypeScript interfaces mirroring `docs/openapi.json` schemas
3. Mount React Query via `app/providers.js` for caching and loading states
4. Map each V2 screen to existing endpoints only (see product mapping above)
