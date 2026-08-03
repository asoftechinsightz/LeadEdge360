# AsoftechInsightz — Codebase Architecture Audit Report

**Version audited:** v1.2.0  
**Audit date:** 21 June 2026  
**Repository path:** `asoftech-insightz/`  
**Auditor scope:** Read-only analysis of application structure, APIs, data layer, auth, multi-tenancy, billing, and frontend patterns.

---

## Executive Summary

AsoftechInsightz is a **Next.js 14 monolith** that combines a marketing website with two SaaS product dashboards — **LeadEdge360** (AI CRM / lead management) and **RetailEdge360** (retail inventory / shelf-life AI). All backend logic is served through a **single catch-all API route** (`app/api/[[...path]]/route.js`, ~595 lines) with a secondary mobile/JWT surface in `lib/mobile-routes.js` (~582 lines). Data is persisted in **MongoDB** (database `asoftech_saas`), despite PostgreSQL schema documentation existing in `docs/sql/`.

The platform implements **org-scoped multi-tenancy** with a shared demo org for unauthenticated users, **dual authentication** (Emergent OAuth cookies for web + JWT for mobile), and **Razorpay one-time checkout** for plan upgrades. Product switching is primarily **route-based navigation** rather than a unified product shell.

| Dimension | Assessment |
|-----------|------------|
| Architecture maturity | MVP / early production |
| Code organization | Monolithic API router; dashboards as large client pages |
| Type safety | JavaScript only (no TypeScript) |
| Test coverage | None (no unit/integration test files) |
| Documentation | Strong API docs; runtime diverges from PostgreSQL/OpenAPI in places |
| Security posture | Permissive CORS/iframe headers; demo mode exposes shared data |

---

## 1. Application Structure

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App Router                        │
├─────────────────────────────────────────────────────────────────────┤
│  Marketing Pages          │  Product Dashboards                     │
│  /, /about, /products,    │  /leadedge360  (CRM)                    │
│  /pricing, /contact,      │  /retailedge360 (Retail AI)             │
│  /blog, /signin, /legal   │                                         │
├─────────────────────────────────────────────────────────────────────┤
│              components/site/  +  components/ui/ (shadcn)           │
├─────────────────────────────────────────────────────────────────────┤
│         app/api/[[...path]]/route.js  ← Master API Router           │
│         lib/mobile-routes.js          ← JWT Mobile/Admin API        │
├─────────────────────────────────────────────────────────────────────┤
│  lib/  auth, jwt, tenant, mongo, scoring, retail-ai, razorpay,     │
│        otp, password, whatsapp                                       │
├─────────────────────────────────────────────────────────────────────┤
│                    MongoDB (asoftech_saas)                          │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   Emergent Auth        Emergent LLM          Razorpay
   (Google OAuth)       (AI scoring)          (Billing)
         │                                        │
         ▼                                        ▼
   n8n Webhooks                             MSG91 (OTP SMS)
   (WhatsApp, FB, Google leads)
```

### 1.2 Directory Layout

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages, layout, global styles, catch-all API |
| `components/site/` | Marketing shell: Navbar, Footer, SiteShell, animations, DPDP banner |
| `components/ui/` | 48 shadcn/ui primitives (Radix + Tailwind) |
| `lib/` | Server-side business logic, DB access, auth, AI, billing |
| `hooks/` | `use-mobile.jsx`, `use-toast.js` |
| `docs/` | API docs, auth flow, OpenAPI, Postman, PostgreSQL DDL (target schema) |
| `n8n/` | Workflow JSON exports for lead ingest and WhatsApp automation |
| `.github/workflows/` | CI/CD deploy pipeline |
| `memory/` | Test credentials (dev reference) |

### 1.3 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14.2.3 |
| UI | React | 18.3.1 |
| Styling | Tailwind CSS + shadcn/ui | 3.4.1 |
| Animation | Framer Motion | 11.18.0 |
| Charts | Recharts | 2.15.3 |
| Database | MongoDB native driver | 6.6.0 |
| Auth (web) | Emergent Auth (hosted OAuth) | External |
| Auth (mobile) | JWT + refresh tokens | jsonwebtoken 9.x |
| Payments | Razorpay | 2.9.6 |
| AI | Emergent LLM proxy (gpt-4o-mini) | External |
| Container | Docker standalone output | node:20-alpine |

### 1.4 Build & Deployment Configuration

`next.config.js` key settings:

- **`output: 'standalone'`** — Docker/Kubernetes-ready production builds
- **`images.unoptimized: true`** — No Next.js image optimization
- **`serverComponentsExternalPackages: ['mongodb']`** — MongoDB kept external
- **Permissive security headers** — `X-Frame-Options: ALLOWALL`, `CORS_ORIGINS: *`
- **Dev optimizations** — Webpack polling, reduced page buffer for lower memory

Deployment artifacts: `Dockerfile`, `docker-compose.yml` (app + mongo + optional n8n), `deploy.sh`, GitHub Actions workflow.

---

## 2. Page Inventory

All routes use `page.js` (no TypeScript pages). Total: **12 routes**.

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `app/page.js` | Marketing | Homepage — hero animations (ParticleNetwork, WireSphere), product highlights, stats, CTAs |
| `/about` | `app/about/page.js` | Marketing | Company story, mission, values, team |
| `/products` | `app/products/page.js` | Marketing | Product suite overview linking to LeadEdge360 and RetailEdge360 |
| `/leadedge360` | `app/leadedge360/page.js` | **Product dashboard** | CRM: lead table, KPIs, charts, filters, role switcher, AI re-scoring, lead capture dialog |
| `/retailedge360` | `app/retailedge360/page.js` | **Product dashboard** | Retail: SKU inventory, expiry AI, risk KPIs, charts, add-SKU dialog |
| `/pricing` | `app/pricing/page.js` | Marketing + billing | Subscription plans, Razorpay checkout, auth-gated subscribe |
| `/signin` | `app/signin/page.js` | Auth | Google OAuth via Emergent, DPDP/Terms consent, redirect to `/api/auth/login` |
| `/contact` | `app/contact/page.js` | Marketing | Contact form → `POST /api/contact` |
| `/blog` | `app/blog/page.js` | Marketing | Static blog listing (4 hardcoded posts) |
| `/download` | `app/download/page.js` | Marketing | Source download page (v1.2.0 archives), quick-start docs |
| `/privacy` | `app/privacy/page.js` | Legal | DPDP Act privacy policy |
| `/terms` | `app/terms/page.js` | Legal | Terms of Service |

### Supporting App Files (Non-Routes)

| File | Purpose |
|------|---------|
| `app/layout.js` | Root layout — Inter + Space Grotesk fonts, dark theme, Sonner toaster |
| `app/globals.css` | Tailwind base, CSS variables, custom animations |
| `app/providers.js` | Client providers wrapper — **present but not wired into layout** |
| `app/api/[[...path]]/route.js` | All backend endpoints |

### Navigation & Post-Auth Flows

- **Default post-login redirect:** `/leadedge360` (auth callback)
- **Default post-payment redirect:** `/leadedge360` (pricing page)
- **Navbar links:** Products, Pricing, LeadEdge360, RetailEdge360, Sign in/out

---

## 3. Component Inventory

**Total: 56 component files** (all `.jsx`, no `.tsx`)

### 3.1 Site Components (`components/site/` — 8 files)

| Component | File | Purpose |
|-----------|------|---------|
| SiteShell | `SiteShell.jsx` | Page wrapper: Navbar + `<main>` + Footer + DPDP banner |
| Navbar | `Navbar.jsx` | Top nav, auth state (`/api/auth/me`), mobile menu, user dropdown |
| Footer | `Footer.jsx` | Site footer with product/legal links |
| DpdpConsentBanner | `DpdpConsentBanner.jsx` | India DPDP Act consent → `POST /api/auth/dpdp-consent` |
| CountUp | `CountUp.jsx` | Intersection-triggered animated number counter |
| Reveal | `Reveal.jsx` | Framer Motion scroll-reveal wrapper |
| ParticleNetwork | `ParticleNetwork.jsx` | Canvas particle network (homepage hero) |
| WireSphere | `WireSphere.jsx` | Canvas rotating wireframe sphere (homepage hero) |

### 3.2 UI Primitives (`components/ui/` — 48 shadcn/ui files)

Accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip.

### 3.3 Hooks

| Hook | File | Purpose |
|------|------|---------|
| useIsMobile | `hooks/use-mobile.jsx` | Responsive breakpoint detection |
| useToast | `hooks/use-toast.js` | Toast notification state (shadcn pattern) |

### 3.4 Component Architecture Observations

- **No shared dashboard layout** — LeadEdge360 and RetailEdge360 each wrap themselves in `SiteShell` independently
- **No product-specific component folders** — Dashboard UI is inline in page files (~400+ lines each)
- **Heavy shadcn/ui adoption** — Good design system foundation, but many primitives are unused
- **`app/providers.js` unused** — TanStack Query provider defined but not mounted in root layout

---

## 4. API Inventory

All HTTP endpoints are prefixed with `/api`. Routing is handled by a single catch-all handler exporting `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`.

**Dispatch order:**

1. Public health check
2. `auth/*` routes (Emergent web auth + mobile auth fallthrough)
3. `resolveTenant(request)` — org scoping for all subsequent routes
4. Demo data seeding (when `orgId === demo-org`)
5. `mobileRoute()` — JWT-authenticated mobile/admin endpoints
6. Web dashboard routes (leads, products, billing, webhooks, contact)

### 4.1 Public / Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api` | None | Health check `{ ok, name, time }` |
| OPTIONS | `/api/*` | None | CORS preflight |

### 4.2 Authentication — Web (Emergent Cookie)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/login` | Redirect to Emergent hosted login |
| GET | `/api/auth/callback` | Exchange `session_id`, set `emergent_session` cookie, redirect `/leadedge360` |
| GET | `/api/auth/me` | Current user, demo flag, auth configured status |
| POST | `/api/auth/logout` | Clear `emergent_session` cookie |
| POST | `/api/auth/dpdp-consent` | Record DPDP consent on user + `consent_log` |

### 4.3 Authentication — Mobile (JWT)

Handled by `lib/mobile-routes.js` → `handleAuth()`:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create org + user, issue OTP |
| POST | `/api/auth/verify-otp` | Verify OTP, issue access + refresh tokens |
| POST | `/api/auth/verify-email` | MVP email verify (token = user id) |
| POST | `/api/auth/login-otp` | Issue login OTP |
| POST | `/api/auth/login-password` | Password login → tokens |
| POST | `/api/auth/forgot-password` | Issue reset OTP |
| POST | `/api/auth/reset-password` | OTP verify + password update |
| POST | `/api/auth/refresh-token` | Rotate refresh token, new access token |
| POST | `/api/auth/logout` | Revoke refresh token (mobile) |

### 4.4 Users (JWT Required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/change-password` | Change password |
| GET | `/api/users/subscription` | Org plan + active subscription record |

### 4.5 Leads — Web Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leads` | List with filters (territory, status, label, source, role, agent, search, date range, pagination) |
| POST | `/api/leads` | Create lead → AI score → auto-assign agent |
| GET | `/api/leads/sources` | Distinct lead sources |
| GET | `/api/leads/:id` | Lead detail + activities + follow-ups |
| PATCH | `/api/leads/:id` | Update status or assignedTo |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/rescore` | Re-run AI scoring |
| POST | `/api/leads/:id/status` | Update status + activity log |
| POST | `/api/leads/:id/assign` | Assign agent + activity log |

### 4.6 Agents & KPIs (Web)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/agents` | **Hardcoded** 7-agent directory (not DB-backed) |
| GET | `/api/kpis` | LeadEdge analytics: conversion, byTerritory, byStatus, bySource, byAgent, 14-day trend |

### 4.7 RetailEdge360 — Products (Web)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List SKUs by org |
| POST | `/api/products` | Create SKU → `predictShelfLife()` |
| POST | `/api/products/:id/repredict` | Re-run shelf-life AI |
| DELETE | `/api/products/:id` | Remove SKU |
| GET | `/api/retail-kpis` | Risk breakdown, inventory value, projected savings |

### 4.8 Follow-ups (JWT)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/followups` | List follow-ups |
| POST | `/api/followups` | Create follow-up |
| PATCH | `/api/followups/:id` | Update |
| DELETE | `/api/followups/:id` | Soft cancel |
| POST | `/api/followups/:id/close` | Close follow-up |
| GET | `/api/followups/reminders` | Due reminders |

### 4.9 Dashboard (JWT — Mobile)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/kpis` | Mobile KPI summary |
| GET | `/api/dashboard/followups-due` | Due follow-ups |
| GET | `/api/dashboard/revenue` | Won leads × budget over time windows |
| GET | `/api/dashboard/sales-performance` | Agent performance metrics |

### 4.10 WhatsApp (JWT)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/whatsapp/send` | Send message |
| POST | `/api/whatsapp/send-template` | Send template message |
| GET | `/api/whatsapp/conversation/:leadId` | Message history |

### 4.11 Notifications (JWT)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications |
| POST | `/api/notifications/:id/read` | Mark read |
| POST | `/api/notifications/devices` | Register push device |
| GET | `/api/notifications/settings` | Notification preferences |
| PATCH | `/api/notifications/settings` | Update preferences |

### 4.12 Admin (JWT + role `admin`|`superadmin`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/users` | List org users |
| POST | `/api/admin/users` | Invite user |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Soft delete |
| GET | `/api/admin/roles` | Static role list |
| GET | `/api/admin/subscriptions` | Read subscriptions (collection never written) |
| GET | `/api/admin/product-access` | Product enablement flags |
| POST | `/api/admin/product-access` | Toggle `retailEnabled` / `leadEnabled` on org |

### 4.13 Billing (Razorpay)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/billing/plans` | Plan catalog from `lib/razorpay.js` |
| POST | `/api/billing/checkout` | Create Razorpay order + `payments` record |
| POST | `/api/billing/verify` | Verify signature, update payment + org plan |

### 4.14 Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/webhooks/razorpay` | `x-razorpay-signature` | `order.paid`, `payment.captured` |
| POST | `/api/webhooks/whatsapp` | `x-webhook-token` | n8n lead ingest |
| POST | `/api/webhooks/facebook` | `x-webhook-token` | Facebook lead ingest |
| POST | `/api/webhooks/google` | `x-webhook-token` | Google lead ingest |

### 4.15 Other

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Marketing contact form |
| POST | `/api/seed-reset` | Dev utility — wipe and reseed demo data |

### 4.16 Documented but Not Implemented

Per comparison with `docs/openapi.json`:

- `POST /api/leads/sources` — not in route handler
- `POST /api/admin/roles` — not implemented
- `POST /api/admin/subscriptions` — not implemented

---

## 5. MongoDB Collection Usage

**Connection:** `lib/mongo.js` → singleton `MongoClient` → database `DB_NAME` (default: `asoftech_saas`)

| Collection | Primary Files | Operations | Schema Notes |
|------------|---------------|------------|--------------|
| **`orgs`** | `tenant.js`, `route.js`, `mobile-routes.js` | CRUD | Tenant root: `id`, `name`, `ownerEmail`, `plan`, `retailEnabled`, `leadEnabled`, `upgradedAt` |
| **`users`** | `tenant.js`, `route.js`, `mobile-routes.js` | CRUD | `id`, `email`, `orgId`, `role`, `passwordHash`, `dpdpConsent`, `preferences`, `status` |
| **`leads`** | `route.js`, `mobile-routes.js` | CRUD, seed, webhooks | CRM leads with AI scoring fields: `score`, `label`, `reasons`, `engine`, `assignedTo` |
| **`products`** | `route.js` | CRUD, seed | Retail SKUs with AI predictions: `riskLevel`, `daysUntilExpiry`, `recommendation` |
| **`lead_activities`** | `route.js` | Insert, read | Audit trail for status changes and assignments |
| **`follow_ups`** | `route.js`, `mobile-routes.js` | CRUD | Scheduled follow-ups linked to leads |
| **`payments`** | `route.js` | Insert, update | Razorpay order/payment records |
| **`subscriptions`** | `mobile-routes.js` | **Read only** | Never populated by billing flow |
| **`contact_requests`** | `route.js` | Insert | Marketing contact form submissions |
| **`consent_log`** | `route.js` | Insert | DPDP consent audit trail |
| **`auth_refresh_tokens`** | `jwt.js` | Insert, rotate, revoke | Hashed refresh tokens with expiry |
| **`auth_otps`** | `otp.js` | Insert, verify, invalidate | Bcrypt-hashed OTP codes |
| **`whatsapp_messages`** | `mobile-routes.js` | Insert, read | Outbound WhatsApp message log |
| **`notifications`** | `mobile-routes.js` | Read, mark read | **No insert path in codebase** |
| **`push_devices`** | `mobile-routes.js` | Upsert | Mobile push notification device tokens |

### Data Not in MongoDB

- **Agents directory** — hardcoded array in `route.js` (7 demo agents)
- **Roles list** — static response in admin handler

### Indexing

No explicit MongoDB indexes are created in application code. Production would require indexes on:

- `leads`: `{ orgId, createdAt }`, `{ orgId, status }`, `{ orgId, territory }`
- `products`: `{ orgId }`
- `users`: `{ email }`, `{ orgId }`
- `auth_refresh_tokens`: `{ tokenHash, revokedAt }`
- `auth_otps`: `{ destination, purpose, expiresAt }`

### PostgreSQL Documentation Gap

`docs/sql/01_schema.sql` defines normalized tables (`tenants`, `product_access`, `audit_logs`, etc.) that do not map 1:1 to the MongoDB implementation. The runtime database is MongoDB; PostgreSQL docs represent a **planned migration target**.

---

## 6. Authentication Flow

### 6.1 Dual Auth Model Overview

```
                    ┌─────────────────────┐
                    │   Incoming Request   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Bearer JWT token?  │
                    └──────────┬──────────┘
                         yes   │   no
                    ┌──────────▼──────────┐     ┌──────────────────────┐
                    │ verifyAccessToken() │     │ emergent_session     │
                    │ Load user by sub    │     │ cookie present?      │
                    └──────────┬──────────┘     └──────────┬───────────┘
                               │                    yes   │   no
                               │              ┌──────────▼───────────┐
                               │              │ verifySessionToken() │
                               │              │ → Emergent API       │
                               │              └──────────┬───────────┘
                               │                         │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │  user.orgId → tenant    │
                               └────────────┬────────────┘
                                            │ no auth
                               ┌────────────▼────────────┐
                               │ orgId = demo-org        │
                               │ isDemo = true           │
                               └─────────────────────────┘
```

### 6.2 Web Auth (Emergent / Google OAuth)

| Step | Component | Details |
|------|-----------|---------|
| 1 | `app/signin/page.js` | User accepts DPDP + Terms → redirect `/api/auth/login` |
| 2 | `lib/auth.js` → `loginUrl()` | Redirect to `https://auth.emergent.sh/login` |
| 3 | `route.js` → `GET /auth/callback` | Exchange `session_id` via Emergent API |
| 4 | `lib/tenant.js` → `ensureUserOrg()` | Auto-provision `orgs` + `users` on first login |
| 5 | Cookie | `emergent_session` — httpOnly, 7-day maxAge, secure in production |
| 6 | Session verify | `getSessionUser()` → `verifySessionToken()` on each request |

**Environment:** `EMERGENT_PROJECT_ID`, `EMERGENT_API_KEY` (gate: `AUTH_CONFIGURED`)

### 6.3 Mobile Auth (JWT)

| Component | File | Details |
|-----------|------|---------|
| Access token | `lib/jwt.js` | JWT payload: `{ sub, tenantId, role, perms }`, TTL 900s |
| Refresh token | `lib/jwt.js` | 80-char opaque hex, SHA-256 hashed in `auth_refresh_tokens` |
| Password hashing | `lib/password.js` | bcrypt |
| OTP | `lib/otp.js` | 6-digit, bcrypt-hashed, MSG91 SMS (dev: logs to console) |
| Guard | `mobile-routes.js` | `requireAuth()` — Bearer header required |

### 6.4 Auth Gaps & Risks

| Issue | Severity | Detail |
|-------|----------|--------|
| Web routes unauthenticated | Medium | Demo tenant allows full CRUD without login |
| Role switcher is UI-only | Medium | Web dashboard `role` param filters data but is not server-enforced |
| Dual logout paths | Low | Web cookie logout vs mobile refresh token revocation |
| Email verify MVP | Low | `verify-email` accepts user id as token |
| No rate limiting | High | Auth endpoints lack brute-force protection |

---

## 7. Multi-Tenant Architecture

### 7.1 Tenant Model

- **Tenant = Organisation** (`orgs` collection), identified by UUID `id`
- **Every business document** carries `orgId` field
- **Demo org:** constant `DEMO_ORG_ID = 'demo-org'` in `lib/tenant.js`

### 7.1 Tenant Resolution (`resolveTenant`)

Priority order:

1. **JWT Bearer** → `verifyAccessToken()` → user lookup → `orgId: user.orgId`
2. **Emergent cookie** → email lookup → `ensureUserOrg()` if new user
3. **Unauthenticated** → `{ orgId: DEMO_ORG_ID, isDemo: true }`

### 7.2 Provisioning

| Trigger | Function | Creates |
|---------|----------|---------|
| Emergent first login | `ensureUserOrg()` | Org (plan: `starter`) + User (role: `admin`) |
| Mobile registration | `handleAuth` register | Org + User (status: `invited`, role: `admin`) |

### 7.3 Data Isolation

- All tenant-scoped queries filter `{ orgId }`
- Demo seeding runs only when `orgId === DEMO_ORG_ID`
- Legacy migration tags pre-tenant documents with `orgId: demo-org`
- **Shared demo data:** All unauthenticated users operate on the same `demo-org` dataset

### 7.4 RBAC

| Surface | Enforcement |
|---------|-------------|
| Web dashboard | **None** — role is a client-side query param |
| Mobile API | JWT required via `requireAuth()` |
| Admin API | JWT + role check (`admin` or `superadmin`) |

Roles are defined statically in the admin handler, not stored in a dedicated collection.

### 7.5 Multi-Tenancy Maturity

| Capability | Status |
|------------|--------|
| Org-scoped data | ✅ Implemented |
| Auto-provisioning | ✅ Implemented |
| Demo mode | ✅ Implemented (shared org) |
| Per-org product flags | ⚠️ Stored but not enforced on web |
| Per-org agent directory | ❌ Hardcoded globally |
| Audit logging | ⚠️ Partial (`lead_activities`, `consent_log` only) |
| Tenant admin UI | ❌ Web admin not exposed |

---

## 8. Product Switching Architecture

### 8.1 Current Model: Route-Based Navigation

Product switching is **not a unified shell** — users navigate between separate Next.js pages:

| Product | Route | Page File | API Namespace |
|---------|-------|-----------|---------------|
| LeadEdge360 | `/leadedge360` | `app/leadedge360/page.js` | `/api/leads`, `/api/kpis`, `/api/agents` |
| RetailEdge360 | `/retailedge360` | `app/retailedge360/page.js` | `/api/products`, `/api/retail-kpis` |

**Entry points:**

- Navbar / Footer product links
- Homepage and `/products` marketing cards
- Post-login default: `/leadedge360`
- Post-payment redirect: `/leadedge360`

### 8.2 Product Access Control (Admin/Mobile Only)

`lib/mobile-routes.js` → `handleAdmin()`:

- **GET `/admin/product-access`** returns enablement flags:
  - `leadedge360` → always `enabled: true`
  - `retailedge360` → `org.retailEnabled ?? true`
- **POST `/admin/product-access`** toggles `orgs.retailEnabled` or `orgs.leadEnabled`

**Critical gap:** Web dashboard routes do **not** check `retailEnabled`/`leadEnabled`. Any authenticated (or demo) user can access both product pages regardless of org flags.

### 8.3 Product Domain Separation

| Aspect | LeadEdge360 | RetailEdge360 |
|--------|-------------|---------------|
| Data collection | `leads`, `lead_activities`, `follow_ups` | `products` |
| AI module | `lib/scoring.js` → `aiScore()` | `lib/retail-ai.js` → `predictShelfLife()` |
| Dashboard KPIs | Conversion, territory, source, agent | Risk levels, inventory value, savings projection |
| Mobile support | Full (follow-ups, WhatsApp, dashboard) | Web only |

### 8.4 Missing Unified Product Shell

There is no:

- Shared authenticated app layout with product switcher
- Product context provider or global state
- Unified navigation sidebar across products
- Cross-product AI Copilot (mentioned in metadata but not implemented)

---

## 9. Revenue & Billing Architecture

### 9.1 Plan Catalog

Defined in `lib/razorpay.js` → `PLANS`:

| Plan ID | Name | Price (INR/mo) | Checkout |
|---------|------|----------------|----------|
| `starter` | Starter | ₹1,499 | ✅ Razorpay |
| `growth` | Growth | ₹4,999 | ✅ Razorpay |
| `scale` | Scale | Custom (null) | ❌ Blocked — contact sales |

Frontend mirrors plans in `app/pricing/page.js`.

### 9.2 Checkout Flow

```
User (pricing page)
    │
    ▼
POST /api/billing/checkout { planId }
    │── Razorpay orders.create(amount × 100 paise)
    │── Insert payments { status: 'created' }
    ▼
Razorpay checkout modal (client-side)
    │
    ▼
POST /api/billing/verify { order_id, payment_id, signature, planId }
    │── verifyCheckoutSignature()
    │── payments → status: 'paid'
    │── orgs.plan = planId
    ▼
Redirect → /leadedge360
```

### 9.3 Webhook Handler

`POST /api/webhooks/razorpay`:

- Verifies `x-razorpay-signature` via `RAZORPAY_WEBHOOK_SECRET`
- Handles `order.paid`, `payment.captured`
- Updates `payments` collection
- **Does not** update `orgs.plan` or create `subscriptions` records

### 9.4 Subscription Model Gaps

| Aspect | Implementation | Gap |
|--------|----------------|-----|
| Plan storage | `orgs.plan` field | ✅ Works for MVP |
| `subscriptions` collection | Read in mobile/admin APIs | ❌ Never written by billing |
| Recurring billing | Not implemented | One-time Razorpay orders only |
| Plan enforcement | Not checked on API routes | Paid features not gated |
| Trial period | Not implemented | — |
| Invoice generation | Not implemented | — |
| Webhook → org plan sync | Missing | Verify path updates plan; webhook does not |

### 9.5 Revenue Metrics (Non-Billing)

| Metric | Source | Notes |
|--------|--------|-------|
| Dashboard revenue | `GET /dashboard/revenue` | Sums `budget` on Won leads — CRM metric, not payment revenue |
| Retail savings | `GET /retail-kpis` | `savedSoFar = atRiskValue × 0.65` — AI projection placeholder |

### 9.6 Graceful Degradation

When `RZP_CONFIGURED` is false (missing Razorpay keys):

- Checkout returns 503
- Pricing page shows "Talk to sales" fallback

---

## 10. Technical Debt Assessment

### 10.1 Critical

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| TD-01 | Monolithic API router (~595 lines) | `route.js` | Unmaintainable; hard to test, review, and extend |
| TD-02 | No automated tests | Entire codebase | Zero regression safety |
| TD-03 | Shared demo org for all anonymous users | `tenant.js` | Data pollution; no true preview isolation |
| TD-04 | Permissive CORS + iframe headers | `next.config.js` | XSS/clickjacking risk in production |
| TD-05 | Web routes lack auth enforcement | `route.js` | Unauthorized data access in non-demo orgs if orgId known |

### 10.2 High

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| TD-06 | Docs/runtime divergence (PostgreSQL vs MongoDB) | `docs/sql/` vs `lib/mongo.js` | Migration confusion; OpenAPI describes unimplemented endpoints |
| TD-07 | `subscriptions` collection never populated | Billing flow | Admin/mobile subscription APIs return empty |
| TD-08 | Product gating not enforced on web | `route.js` | `retailEnabled`/`leadEnabled` flags are cosmetic |
| TD-09 | Hardcoded agents (not per-org) | `route.js` L20–28 | Multi-tenant agent management broken |
| TD-10 | Large dashboard pages (~400+ lines) | `leadedge360/page.js`, `retailedge360/page.js` | Poor maintainability, no component extraction |
| TD-11 | No MongoDB indexes defined | Application code | Performance degradation at scale |
| TD-12 | No rate limiting on auth/API | All routes | Brute-force and abuse vulnerability |

### 10.3 Medium

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| TD-13 | JavaScript only (no TypeScript) | Entire codebase | No compile-time type safety |
| TD-14 | `app/providers.js` not wired | `layout.js` | TanStack Query unused despite dependency |
| TD-15 | Dual date libraries (date-fns + dayjs) | `package.json` | Bundle bloat |
| TD-16 | README outdated (RetailEdge "coming soon") | `README.md` | RetailEdge360 is fully implemented |
| TD-17 | Webhook dev mode bypass | `ingestWebhookAllowed()` | Token check skipped when unset |
| TD-18 | Notifications collection has no writer | `mobile-routes.js` | Notification feature incomplete |
| TD-19 | In-memory migration flag | `route.js` `migrationDone` | Resets on cold start; race condition possible |
| TD-20 | Random agent assignment | `assignAgent()` | Non-deterministic; no load balancing |

### 10.4 Low

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| TD-21 | Static blog posts | `app/blog/page.js` | No CMS integration |
| TD-22 | Missing `public/` directory | Project root | Download assets referenced but not bundled |
| TD-23 | Package name mismatch | `package.json` `"nextjs-mongo-template"` | Identity confusion |
| TD-24 | `@tanstack/react-table` unused | Dependencies | Dead dependency |
| TD-25 | `axios` + native fetch mixed | Pages vs lib | Inconsistent HTTP client |

### 10.5 Technical Debt Summary

```
Critical  ████████░░  5 items
High      ██████████  7 items
Medium    ██████████  8 items
Low       █████░░░░░  5 items
```

**Estimated remediation effort:** 4–6 weeks for a small team to address Critical + High items.

---

## 11. Frontend Modernization Recommendations

### 11.1 TypeScript Migration (Priority: High)

**Current:** All `.js`/`.jsx` files, no type checking.

**Recommendation:**

1. Add `tsconfig.json` with `strict: true`
2. Rename incrementally: `lib/` → `.ts`, then `components/`, then `app/`
3. Generate types from MongoDB document shapes and API responses
4. Use Zod schemas (already a dependency) for runtime validation at API boundaries

**Benefit:** Catch auth/billing bugs at compile time; improve IDE support.

### 11.2 Component Architecture Refactor (Priority: High)

**Current:** Dashboard logic embedded in 400+ line page files.

**Recommendation:**

```
app/leadedge360/
├── page.js                    (thin orchestrator)
├── _components/
│   ├── LeadTable.jsx
│   ├── LeadKpiCards.jsx
│   ├── LeadCharts.jsx
│   ├── NewLeadDialog.jsx
│   └── LeadFilters.jsx
└── _hooks/
    ├── useLeads.js
    └── useKpis.js
```

Apply same pattern to RetailEdge360. Extract shared dashboard primitives (`KpiCard`, `DataTable`, `FilterBar`) into `components/dashboard/`.

### 11.3 Data Fetching Modernization (Priority: High)

**Current:** Raw `fetch()` in `useEffect` with manual loading/error state.

**Recommendation:**

1. Wire `app/providers.js` into `layout.js` with TanStack Query provider
2. Create typed API client hooks:

```javascript
// hooks/useLeads.js
export function useLeads(filters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => api.getLeads(filters),
  })
}
```

3. Add optimistic updates for lead status changes
4. Consider SWR (already a dependency) as lighter alternative

**Benefit:** Automatic caching, deduplication, background refetch, error boundaries.

### 11.4 Unified Product Shell (Priority: Medium)

**Recommendation:**

1. Create `app/(dashboard)/layout.js` with authenticated sidebar
2. Add product switcher component (LeadEdge360 ↔ RetailEdge360)
3. Move marketing pages to `app/(marketing)/` route group
4. Enforce product access flags server-side before rendering

```
app/
├── (marketing)/          ← SiteShell wrapper
│   ├── page.js
│   ├── pricing/
│   └── ...
├── (dashboard)/          ← Authenticated product shell
│   ├── layout.js         ← Sidebar + product switcher
│   ├── leadedge360/
│   └── retailedge360/
└── (auth)/
    └── signin/
```

### 11.5 Server Components Adoption (Priority: Medium)

**Current:** All dashboard pages are `'use client'` with client-side data fetching.

**Recommendation:**

1. Convert static marketing pages to Server Components (already possible)
2. Use Server Components for initial KPI/lead data fetch with streaming
3. Keep interactive parts (dialogs, charts, filters) as Client Components
4. Leverage Next.js 14 `loading.js` and `error.js` per route

### 11.6 Design System Consolidation (Priority: Medium)

**Recommendations:**

1. Audit and remove unused shadcn/ui components (reduce bundle)
2. Create `components/dashboard/` for product-specific shared UI
3. Define design tokens in `globals.css` for product-specific accent colors
4. Replace dynamic Tailwind classes (`bg-${accent}/20`) with explicit variants — dynamic classes are purged by Tailwind

### 11.7 Accessibility & i18n (Priority: Low–Medium)

1. Add ARIA labels to dashboard tables and charts
2. Ensure keyboard navigation for dialogs and filters
3. Plan for Hindi/regional language support (India market)
4. Add `lang` attribute switching capability

### 11.8 Performance Optimizations (Priority: Medium)

| Area | Recommendation |
|------|----------------|
| Charts | Lazy-load Recharts with `dynamic()` |
| Animations | Reduce ParticleNetwork/WireSphere on mobile (`useIsMobile` exists) |
| Bundle | Remove unused deps (`axios`, `@tanstack/react-table`, duplicate date libs) |
| Images | Add `public/` assets; enable image optimization for production CDN |
| API | Add pagination defaults; virtualize large lead tables |

### 11.9 Testing Strategy (Priority: High)

| Layer | Tool | Target |
|-------|------|--------|
| Unit | Vitest | `lib/scoring.js`, `lib/razorpay.js`, `lib/tenant.js` |
| API | Supertest or Playwright | Route handler integration |
| E2E | Playwright | Sign-in → create lead → checkout flow |
| Component | Testing Library | Dashboard components after extraction |

### 11.10 Recommended Modernization Roadmap

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1** | 2 weeks | Split API router, add tests for lib/, wire TanStack Query |
| **Phase 2** | 2 weeks | Extract dashboard components, add route groups |
| **Phase 3** | 2 weeks | TypeScript migration (lib → components → app) |
| **Phase 4** | 2 weeks | Unified product shell, server components, auth enforcement |
| **Phase 5** | Ongoing | Billing/subscription completion, PostgreSQL migration |

---

## Appendix A: Environment Variables

| Variable | Purpose |
|----------|---------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name (default: `asoftech_saas`) |
| `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_APP_URL` | App URL for redirects |
| `CORS_ORIGINS` | CORS allowed origins |
| `EMERGENT_PROJECT_ID` | Emergent Auth client ID |
| `EMERGENT_API_KEY` | Emergent Auth API key |
| `EMERGENT_LLM_KEY` | AI scoring LLM proxy key |
| `JWT_SECRET` | JWT signing secret |
| `JWT_ACCESS_TTL` | Access token TTL (seconds) |
| `JWT_REFRESH_TTL` | Refresh token TTL (seconds) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |
| `N8N_WEBHOOK_TOKEN` | Inbound webhook auth token |
| `MSG91_AUTH_KEY` | OTP SMS provider |

## Appendix B: External Integrations

| Service | Purpose | Integration Point |
|---------|---------|-----------------|
| Emergent Auth | Google OAuth (web) | `lib/auth.js` |
| Emergent LLM | AI lead scoring, shelf-life prediction | `lib/scoring.js`, `lib/retail-ai.js` |
| Razorpay | Payment checkout | `lib/razorpay.js`, billing routes |
| MSG91 | OTP SMS | `lib/otp.js` |
| n8n | Workflow automation | Webhook routes + `n8n/*.json` |
| WhatsApp Cloud API | Messaging (via n8n/mobile) | `lib/whatsapp.js`, mobile routes |

## Appendix C: File Statistics

| File | Approx. Lines | Role |
|------|---------------|------|
| `app/api/[[...path]]/route.js` | ~595 | Master API router |
| `lib/mobile-routes.js` | ~582 | Mobile/JWT API |
| `app/leadedge360/page.js` | ~426 | CRM dashboard |
| `app/retailedge360/page.js` | ~350+ | Retail dashboard |
| Total project files | ~129 | — |
| Test files | 0 | — |

---

*End of report. Generated by automated codebase audit — no application source files were modified.*
