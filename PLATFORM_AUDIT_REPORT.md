# AsoftechInsightz Business Suite — Platform Audit Report

**Phase:** 1 — Platform Audit  
**Date:** 23 June 2026  
**Status:** Complete (codebase-derived; no assumptions)  
**Rule:** No implementation started — audit only

---

## Executive Summary

AsoftechInsightz is a **Next.js 14 App Router + MongoDB** multi-product SaaS platform with two products (**LeadEdge360**, **RetailEdge360**) under a unified **Business Suite** shell. The platform has passed prior go-live certification for core CRM, revenue, payments, portal API, and partner API modules.

**Architecture pattern:** Dual API surface — a legacy monolithic catch-all (`app/api/[[...path]]/route.js`, ~2,500 lines) plus ~90 dedicated route modules for newer domains. UI uses three shells: **AppShell** (authenticated suite), **SiteShell** (marketing), and **bare** (auth flows).

**Data store:** MongoDB only (no active PostgreSQL usage despite `pg` dependency). **50+ collections**, tenant-scoped via `orgId`. **No application-defined indexes.**

**Mock layer:** LeadEdge360 enterprise screens default to mock data (`NEXT_PUBLIC_USE_MOCK_API=true`). Core CRM/revenue/campaign APIs are MongoDB-backed.

---

## 1. Existing Features

### 1.1 Lead Management — **Partial / Production-capable**

| Capability | Status | Implementation |
|------------|--------|----------------|
| Lead CRUD | ✅ Complete | Catch-all `/api/leads`, `lib/sales/leads.js` |
| Lead list / search / filters | ✅ Complete | `/api/lead-search`, `/api/lead-filters`, `/api/mobile-leads` |
| Lead assignment | ⚠️ Partial | `POST /api/leads/:id/assign` — agents hardcoded, not DB users |
| Lead timeline | ✅ Complete | `lead_timeline` collection, GET/POST |
| Notes | ✅ Complete | `lead_notes`, GET/POST |
| Tasks | ⚠️ Partial | GET/POST only — no update/complete/delete on main API |
| Follow-ups | ⚠️ Partial | Lead-scoped + richer mobile API in `lib/mobile-routes.js` |
| Status history | ✅ Complete | `lead_status_history`, `lead_assignments` |
| AI lead scoring | ✅ Complete | `lib/scoring.js`, `/api/lead-scoring/*` |
| Dashboards | ✅ Complete | `/api/lead-dashboard`, `/api/kpis`, `/api/task-dashboard` |
| UI | ✅ Complete | `/leads`, `/leads/[id]`, `LeadDetailTabs`, `LeadsManagement` |

### 1.2 Opportunities — **Complete**

- Full pipeline: CRUD, stage moves, auto-create from leads, proposal linkage, revenue on won
- Service: `lib/opportunities/service.js`
- API: `app/api/opportunities/**`
- UI: `/opportunities`, `PipelineBoard`

### 1.3 Proposals — **Complete**

- CRUD, PDF generation, email, won → invoice conversion, auto-generate
- Service: `lib/proposals/service.js`
- API: `app/api/proposals/**`
- UI: `/proposals`, `/proposals/[id]`

### 1.4 Tasks — **Partial**

- Create/read on lead scope; mobile follow-up CRUD is richer
- No standalone task module UI outside lead detail tabs

### 1.5 Follow-ups — **Partial**

- `follow_ups` collection; mobile routes support close/reminders
- Lead detail UI: `FollowupList.js`

### 1.6 Campaigns — **Complete**

- CRUD, audience resolution, execution, SMTP (degrades when unconfigured)
- Service: `lib/campaigns/*`
- API: `app/api/campaigns/**`
- UI: `/campaigns`, `CampaignTable`

### 1.7 Authentication — **Complete (with dev bypass)**

| Mechanism | Status |
|-----------|--------|
| Password login (JWT) | ✅ `POST /api/auth/login-password` |
| OTP login/register/reset | ✅ `lib/otp.js`, mobile-routes |
| Refresh tokens | ✅ `auth_refresh_tokens` |
| Portal auth (separate JWT) | ✅ `lib/portal/service.js` |
| Google OAuth | ⚠️ Redirect stub only |
| Emergent/cookie session | ❌ Disabled (`lib/auth.js` stubs) |
| Dev bypass | ✅ `DEV_AUTH_BYPASS` — non-production only |

**Dev credentials:** `admin@asoftechinsightz.com` / `ChangeMe@2025`

### 1.8 RBAC — **Partial**

- Role normalization: `lib/rbac.js`, `lib/billing/roles.js`
- Roles: `admin`, `manager`, `user`/`agent`, `finance`, `partner`, `superadmin`
- Permissions: `crm`, `proposals`, `invoices`, `revenue`, `partner_dashboard`
- Guard helpers: `guardCrmRequest`, `guardRevenueRequest`, etc.
- **Gap:** UI does not gate nav/actions by role; inconsistent auth on some routes

### 1.9 Business Suite — **Complete (shell)**

- Unified `AppShell` + `SuiteRouteLayout` + `SUITE_NAV_GROUPS`
- Phase 11 route unification documented in `APPSHELL_ROUTE_AUDIT.md`
- Components: `AppShell.tsx`, `Sidebar.tsx`, `SuiteHeader.tsx`, `MobileNav.tsx`

### 1.10 Product Switching — **Complete**

- User fields: `products[]`, `activeProduct`, `businessSuiteEnabled`
- API: `POST /api/products/switch`, `GET /api/products`
- UI: `/product-selection`, `ProductSwitcher.tsx`
- Org flags: `retailEnabled`, `leadEnabled` on `orgs`

### 1.11 Subscriptions — **Partial (dual model)**

| Model | Collection | Purpose |
|-------|------------|---------|
| Org SaaS plan | `subscriptions` | Platform billing, `requirePlan` gating |
| Customer subscriptions | `customer_subscriptions` | B2B customer lifecycle module |

Plans: `STARTER`, `BUSINESS_GROWTH`, `ENTERPRISE` — feature lists in `lib/billing/plan-features.js`

### 1.12 Notifications — **Partial**

- In-app list/read/settings via `lib/mobile-routes.js`
- Device token registration (`push_devices`)
- **No FCM/APNs delivery** — registration only
- Portal "notifications" = activity feed alias

### 1.13 Reports — **Partial**

- Revenue export, campaign analytics, CSV export jobs
- LeadEdge360 Reports UI: **mock by default**
- Global analytics routes lack tenant scoping (audit risk)

### 1.14 Mobile Readiness — **Partial**

| Area | Status |
|------|--------|
| Mobile API routes | ✅ `/api/mobile/*` bootstrap, sync, lead mutations |
| Responsive AppShell | ✅ `MobileNav.tsx`, card layouts on some pages |
| Native Android/iOS apps | ❌ Not in repo |
| Offline / sync engine (Retail) | ❌ Not implemented |
| QR scanner (mobile) | ❌ Not implemented |

### 1.15 Additional Certified Modules

| Module | Status | Notes |
|--------|--------|-------|
| Revenue & invoices | ✅ Complete | `lib/revenue/service.js`, `/revenue`, `/invoices` |
| Payments (Razorpay + mock) | ⚠️ Partial | Real when keys configured |
| Customer accounts | ✅ Complete | `lib/customers/service.js` |
| Customer portal API | ✅ API only | No `app/portal/` UI |
| Partner management API | ✅ API only | Marketing page only; no admin UI |
| Scanner / geo lead finder | ⚠️ Partial | Google Places when keyed; UI mock default |
| RetailEdge360 | ⚠️ Partial | Product CRUD + KPIs; not full POS |
| Onboarding API | ✅ Complete | UI redirects to `/settings` |
| Growth audit (public) | ⚠️ Partial | Hardcoded org ID |
| Privacy / DPDP | ✅ Complete | export, consent, delete-request |
| Health checks | ✅ Complete | `/api/health/live`, `/ready` |

### 1.16 LeadEdge360 Enterprise Modules (AI Workspace)

Routes under `/leadedge360/*` — **mostly mock UI** unless `NEXT_PUBLIC_USE_MOCK_API=false`:

| Module | Route | Data |
|--------|-------|------|
| Command Center | `/leadedge360/command-center` | Mock |
| Geo Lead Finder | `/leadedge360/geo-finder` | Mock / scanner API when configured |
| Territories | `/leadedge360/territories` | Mock |
| Automation Hub | `/leadedge360/automation` | Mock |
| Growth Audit Engine | `/leadedge360/growth-engine` | Mock |
| Revenue Intelligence | `/leadedge360/revenue-intelligence` | Mock / revenue API when configured |
| AI Insights | `/leadedge360/insights` | Mock |
| Conversations | `/leadedge360/conversations` | Mock |
| Reports | `/leadedge360/reports` | Mock |

Core CRM paths (`/leads`, `/opportunities`, `/dashboard`) use **real APIs**.

---

## 2. Existing APIs

### 2.1 API Architecture

```
Request → Next.js App Router
    ├── Dedicated routes (app/api/**/route.js) — preferred for new domains
    └── Catch-all (app/api/[[...path]]/route.js) — legacy CRM, mobile, billing
            └── lib/mobile-routes.js — auth, followups, products, notifications
```

**Production gate:** Catch-all returns 401 for non-public roots without authenticated tenant (`lib/security/production.js`).

**Public roots:** `auth`, `health`, `webhooks`, `scanner`

### 2.2 Authentication Patterns

| Pattern | Used by | Behavior |
|---------|---------|----------|
| `guard*Request` | CRM, revenue, subscriptions, payments, partners | JWT + plan + permission |
| `resolveTenant` | Campaigns, scanner, some CRM | Demo org in dev if unauthenticated |
| JWT (mobile-routes) | Followups, products, notifications | Bearer token required |
| Portal JWT | `/api/portal/*` | `role: portal_customer` |
| None | Some analytics, outreach, catalog | **Security gap** |

### 2.3 API Inventory Summary

**~150+ endpoints** across dedicated routes and catch-all. Key groups:

| Domain | Methods | Base path | Auth |
|--------|---------|-----------|------|
| Auth | POST, GET | `/api/auth/*` | Public / JWT |
| Leads | GET, POST, PATCH, DELETE | `/api/leads/*` | Tenant |
| Opportunities | GET, POST, PATCH | `/api/opportunities/*` | guardCrm / resolveTenant |
| Proposals | GET, POST, PATCH, DELETE | `/api/proposals/*` | Mixed |
| Campaigns | GET, POST, PUT, PATCH, DELETE | `/api/campaigns/*` | resolveTenant |
| Revenue | GET, POST | `/api/revenue/*` | guardRevenue |
| Subscriptions | GET, POST, PATCH, DELETE | `/api/subscriptions/*` | guardSubscription |
| Invoices | GET, POST | `/api/invoices/*` | guardRevenue |
| Payments | POST | `/api/payments/*` | guardPayment / webhook |
| Customers | GET, POST, PATCH, DELETE | `/api/customers/*` | guardCustomer |
| Partners | GET, POST | `/api/partners/*` | guardPartner |
| Portal | GET, POST, PATCH | `/api/portal/*` | Portal JWT |
| Scanner | GET, POST | `/api/scanner/*` | resolveTenant / public jobs |
| Mobile | GET, POST, PATCH | `/api/mobile/*` | Tenant / JWT |
| Onboarding | GET, POST | `/api/onboarding/*` | resolveTenant |
| Privacy | GET, POST | `/api/privacy/*` | requireAuthenticatedTenant |
| Health | GET | `/api/health/*` | None |
| Billing | GET, POST | `/api/billing/*` | Tenant |
| Webhooks | POST | `/api/webhooks/*` | Signature / token |

Full endpoint catalog is embedded in catch-all `route.js` and `app/api/**` — see agent audit for line-level inventory.

### 2.4 External Dependencies

| Integration | Config | Fallback |
|-------------|--------|----------|
| MongoDB | `MONGO_URL`, `DB_NAME` | Required |
| Razorpay | `RZP_*` keys | Mock payments |
| Google Places | `GOOGLE_PLACES_API_KEY` | Scanner limited |
| SMTP | Campaign SMTP config | `generated` status, no send |
| WhatsApp | `WHATSAPP_*` | API routes exist; delivery env-dependent |
| LLM (Emergent) | `EMERGENT_LLM_KEY` | Rules-based scoring/retail AI |
| MSG91 OTP | `MSG91_*` | Dev OTP in response |

---

## 3. Existing Database

### 3.1 Connection

- **File:** `lib/mongo.js`
- **URI:** `MONGO_URL` or `mongodb://127.0.0.1:27017` (non-prod)
- **Database:** `DB_NAME` (`.env`: `asoftech`; default in code: `asoftech_saas`)
- **Dev seed:** `ensureDevAdmin` + `ensureDevDemoData` on first connection (non-production)

### 3.2 Collections (50+)

| Domain | Collections |
|--------|-------------|
| Tenancy & auth | `users`, `orgs`, `auth_refresh_tokens`, `auth_otps` |
| CRM | `leads`, `lead_timeline`, `lead_notes`, `lead_tasks`, `lead_status_history`, `lead_assignments`, `follow_ups` |
| Pipeline | `opportunities`, `opportunity_activities` |
| Proposals | `proposals`, `proposal_items`, `proposal_templates`, `catalogs` |
| Campaigns | `campaigns`, `campaign_activities`, `campaign_executions`, `campaign_messages`, `email_templates` |
| Scanner | `scanner_jobs`, `scanner_results`, `website_audits`, `lead_scores`, `scan_schedules` |
| Customers | `customers`, `customer_notes`, `customer_activities`, `customer_subscriptions`, `subscription_activities` |
| Billing | `subscriptions`, `subscription_plans`, `payments`, `invoices`, `revenue`, `webhook_events` |
| Partners | `partners`, `partner_referrals`, `partner_commissions`, `partner_payouts` |
| Portal | `portal_users`, `support_tickets` |
| Retail | `products` |
| Comms | `whatsapp_messages`, `notifications`, `push_devices` |
| Compliance | `consent_log`, `data_deletion_requests`, `audit_logs`, `contact_requests` |
| Reports | `report_exports` |
| Onboarding | `onboarding_progress` |

### 3.3 Standard Record Fields (convention)

Most tenant documents include:

| Field | Purpose |
|-------|---------|
| `id` | UUID string primary key |
| `orgId` | Tenant isolation |
| `createdAt` | ISO timestamp |
| `updatedAt` | ISO timestamp |

**Gaps vs directive:** `createdBy`, `updatedBy`, structured `auditTrail` on every record — **inconsistent**. Audit exists as separate `audit_logs` writes and entity-specific history collections.

### 3.4 Indexes

**None defined in application code.** Only MongoDB default `_id` index. **Performance risk** at scale on `orgId`, `email`, `leads.id`.

### 3.5 Relationships (logical)

```
orgs (1) ──< users
orgs (1) ──< leads ──< lead_notes, lead_tasks, lead_timeline, follow_ups
leads (1) ──< opportunities ──< proposals ──< invoices ──< revenue
orgs (1) ──< subscriptions (SaaS plan)
customers (1) ──< customer_subscriptions
orgs (1) ──< campaigns ──< campaign_executions
orgs (1) ──< partners ──< partner_referrals, partner_commissions
scanner_jobs (1) ──< scanner_results ──> leads (convert)
```

### 3.6 Tenant Isolation

- **Primary:** `orgId` on all tenant queries
- **Resolution:** `lib/tenant.js` — JWT → user → `orgId`; dev fallback `demo-org`
- **Violations:** `app/api/catalog/route.js`, `app/api/growth-audit/route.js` use hardcoded `ORG_ID`
- **Global analytics:** Some routes count across all orgs

### 3.7 Audit Trails

| Mechanism | Location |
|-----------|----------|
| Central service | `lib/audit/service.js` → `audit_logs` |
| Lead history | `lead_timeline`, `lead_status_history`, `lead_assignments` |
| Subscription | `subscription_activities` |
| Customer | `customer_activities` |
| Campaign | `campaign_activities` |
| Webhook dedupe | `webhook_events` |

Field shapes vary (`entity` vs `entityType`) — normalization debt.

---

## 4. Existing UI

### 4.1 Shell Architecture

```
app/layout.js (globals.css, Providers, Toaster)
├── SuiteRouteLayout → AppShell (authenticated CRM)
├── SiteShell (marketing: Navbar, Footer, ThemeProvider)
└── Bare (signin, splash, product-selection)
```

### 4.2 Route Map (45 pages)

**Authenticated suite (AppShell):** `/dashboard`, `/leads`, `/leads/[id]`, `/opportunities`, `/proposals`, `/proposals/[id]`, `/invoices`, `/campaigns`, `/analytics`, `/revenue`, `/settings`, `/payments`, `/retailedge360`

**LeadEdge360 AI:** `/leadedge360/command-center`, `insights`, `automation`, `geo-finder`, `territories`, `growth-engine`, `revenue-intelligence`, `conversations`, `reports` (+ redirects from legacy paths)

**Auth:** `/signin`, `/login` → signin, `/splash`, `/product-selection`, `/subscribe`

**Marketing (SiteShell):** `/`, `/about`, `/solutions`, `/services`, `/industries`, `/partners`, `/pricing`, `/products`, `/blog`, `/contact`, `/download`, `/terms`, `/privacy`, `/growth-audit`

**Internal:** `/design-system-preview`

### 4.3 Navigation

- **Source of truth:** `components/suite/nav-config.ts` → `SUITE_NAV_GROUPS`
- Groups: Dashboard, CRM, Revenue, Marketing, LeadEdge360 AI, Settings
- Mobile: `MobileNav.tsx` bottom bar
- Breadcrumbs: `Breadcrumbs.tsx`
- Global search: `GlobalSearch.tsx`

### 4.4 Reusable Components

| Layer | Path | Count |
|-------|------|-------|
| Design system | `components/design-system/core/*.tsx` | Button, Card, Input, Table, KPICard, etc. |
| shadcn/ui | `components/ui/*.jsx` | 40+ primitives |
| Suite shell | `components/suite/*.tsx` | AppShell, Sidebar, Header, Auth |
| Brand | `components/brand/BrandLogo.tsx` | Logo |
| LeadEdge360 | `components/leadedge360/**` | CRM + enterprise |
| RetailEdge360 | `components/retailedge360/**` | Retail dashboard |
| Marketing | `components/site/**`, `components/gix/**` | Public site |

### 4.5 Permissions in UI

- **No route-level RBAC** in React components
- Auth gate: `SuiteAuthProvider` redirects unauthenticated users to `/signin`
- Plan gating: API-side only (`requirePlan`)
- Product gating: `ProductSwitcher` + `/product-selection`

### 4.6 Mobile UI

- Responsive Tailwind layouts
- `MobileNav` for suite navigation
- Card views on leads/opportunities at small breakpoints
- No PWA manifest or native wrappers in repo

---

## 5. Business Workflows (as implemented)

### 5.1 Lead → Cash (LeadEdge360)

```
Lead capture (form/webhook/scanner)
  → AI scoring
  → Assignment
  → Follow-ups / tasks
  → Opportunity (auto or manual)
  → Proposal
  → Invoice
  → Payment (Razorpay)
  → Revenue recognition
```

### 5.2 Campaign workflow

```
Create campaign → define audience → attach template
  → execute (SMTP or simulated)
  → track activities / analytics
```

### 5.3 Subscription workflow

```
Org subscribes (Razorpay) → subscriptions collection
  → requirePlan gates features
  → Customer subscriptions (separate B2B module)
```

### 5.4 Product switch workflow

```
Login → /splash → /product-selection
  → POST /api/products/switch
  → Route to LeadEdge360 or RetailEdge360 dashboard
```

---

## 6. Prior Certification Status

| Report | Result |
|--------|--------|
| `GO_LIVE_CERTIFICATION_REPORT.md` | 44/44 PASS — GO-LIVE APPROVED |
| `SECURITY_AUDIT_REPORT.md` | Documented risks + mitigations |
| Module retests (leads, opportunities, campaigns, proposals, revenue, payments, portal, partners) | All PASS |

**Production stability baseline exists.** New work must not break certified paths.

---

## 7. Testing Status

| Type | Status |
|------|--------|
| Unit tests | ❌ None in project |
| API retest scripts | ✅ `scripts/*-retest.mjs` (manual CI) |
| Integration tests | ❌ None |
| UAT scenarios | Documented in module reports |
| `mongodb-memory-server` | In devDependencies, unused in scripts |

---

## 8. Files Inspected (index)

| Area | Key paths |
|------|-----------|
| API catch-all | `app/api/[[...path]]/route.js` |
| Mobile API | `lib/mobile-routes.js` |
| Tenant / auth | `lib/tenant.js`, `lib/jwt.js`, `lib/dev-auth.js`, `lib/rbac.js` |
| Billing | `lib/billing/plan-features.js`, `require-plan.js` |
| CRM services | `lib/opportunities/`, `lib/proposals/`, `lib/campaigns/`, `lib/sales/` |
| Revenue | `lib/revenue/`, `lib/payments/`, `lib/subscriptions/` |
| Portal / partners | `lib/portal/`, `lib/partners/` |
| Scanner | `lib/scanner/` |
| UI shell | `components/suite/`, `app/layout.js` |
| Mock layer | `src/services/api/config.ts`, `mock/`, `adapters/httpClient.ts` |
| Config | `next.config.js`, `tailwind.config.js`, `.env` |

---

## 9. Audit Sign-Off

| Section | Complete |
|---------|----------|
| Existing features | ✅ |
| Existing APIs | ✅ |
| Existing database | ✅ |
| Existing UI | ✅ |
| Business workflows | ✅ |
| No code changes made | ✅ |

**Next deliverable:** `GAP_ANALYSIS_REPORT.md` (Phase 2)
