# AsoftechInsightz Business Suite V2 — Frontend Master Plan

> **Superseded as authority by [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md).**  
> This file is the Phase 1 audit archive. For canonical decisions, brand, routes, constraints, and tokens, use `SOURCE_OF_TRUTH.md` and `src/design-tokens/tokens.json`.

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Status:** Awaiting approval before Phase 2  
**Scope:** Frontend modernization only — backend, MongoDB, auth, billing, and APIs are frozen

---

## 1. Executive Summary

AsoftechInsightz is a **single Next.js 14 application** serving the marketing website (`www.asoftechinsightz.com`), Business Suite (`app.asoftechinsightz.com`), product workspaces, and the full API surface. This is **not a monorepo** — one codebase, one deployment artifact, route-based product separation.

The repository is **production-capable** on the backend: multi-tenant CRM, lead scoring, Razorpay billing, mobile JWT APIs, campaigns, proposals, and n8n webhook integrations are implemented. The frontend is **early-stage relative to the backend** — rich shadcn/ui primitives are installed but largely unused; product dashboards are monolithic page files; the Business Suite lacks a unified AppShell.

**Recommended approach:** Evolution, not revolution. Preserve all existing business functionality and APIs. Modernize incrementally through Phases 2–10 defined in the master directive.

---

## 2. Architecture Audit

### 2.1 Technology Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Framework | Next.js (App Router) | 14.2.35 |
| UI Library | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.1 |
| Component System | shadcn/ui (New York) + Radix UI | 50 primitives in `components/ui/` |
| Icons | lucide-react | 0.516.0 |
| Charts | Recharts | 2.15.3 (direct usage, not shadcn chart wrapper) |
| Animation | framer-motion | Marketing scroll reveals |
| Forms (installed) | react-hook-form + zod | Installed, not used in pages |
| Data fetching (installed) | TanStack React Query, SWR, axios | Installed; pages use raw `fetch()` |
| Tables (installed) | @tanstack/react-table | Installed, unused |
| Toasts | Sonner | Wired in root layout |
| Payments | Razorpay checkout.js | Global script in `app/layout.js` |
| Package manager | Yarn | 1.22.22 |
| Deployment | Docker standalone + GitHub Actions | `Dockerfile`, `.github/workflows/deploy.yml` |

### 2.2 Repository Structure

```
asoftech-insightz/
├── app/                          # Next.js App Router — pages + API routes
│   ├── page.js                   # Marketing homepage (GIX sections)
│   ├── [marketing pages]/        # about, products, pricing, contact, etc.
│   ├── leadedge360/              # LeadEdge360 CRM dashboard (~429 lines)
│   ├── retailedge360/            # RetailEdge360 inventory dashboard
│   ├── proposals|invoices|revenue/ # Business Suite ops pages
│   ├── signin|splash|subscribe/  # Auth + billing flow
│   └── api/                      # 73 route files + catch-all handler
├── components/
│   ├── ui/                       # shadcn primitives (50 files)
│   ├── site/                     # Marketing shell (Navbar, Footer, etc.)
│   ├── gix/                      # Homepage landing sections (9 sections)
│   └── business-suite/           # DashboardHeader + ProductSwitcher (2 files)
├── lib/                          # Backend service layer (DO NOT MODIFY)
├── models/                       # Mongo document models (DO NOT MODIFY)
├── hooks/                        # use-mobile, use-toast
├── src/config/                   # planFeatures.js
├── docs/                         # API specs, deployment, SQL schema
├── n8n/                          # Workflow automation exports
└── scripts/                      # DB migration scripts
```

### 2.3 Domain Architecture (Target vs Current)

| Domain | Target URL | Current Implementation |
|--------|-----------|------------------------|
| Marketing | `www.asoftechinsightz.com` | Same Next.js app, routes at `/`, `/about`, `/products`, etc. |
| Business Suite | `app.asoftechinsightz.com` | Same app; no route group separation |
| LeadEdge360 | `leadedge360.asoftechinsightz.com` → `/leadedge360` | Route exists; **no nginx/subdomain redirect configured in app** |
| RetailEdge360 | `retailedge360.asoftechinsightz.com` → `/retailedge360` | Route exists; **no in-app redirect** |

**Gap:** Product subdomain redirects must be configured at nginx/VPS level (`docs/nginx.conf` reference exists; no Next.js rewrites).

### 2.4 Dual API Architecture

The backend exposes APIs through two parallel patterns:

1. **Dedicated route files** — 72 modular handlers under `app/api/**/route.js` (campaigns, opportunities, scanner, payments, etc.)
2. **Catch-all router** — `app/api/[[...path]]/route.js` handles ~80+ legacy/mobile/CRM endpoints

Some paths exist in both layers (e.g., `/api/auth/logout`, `/api/analytics/funnel`). Dedicated routes take precedence over the catch-all.

### 2.5 Authentication & Multi-Tenancy (Read-Only)

| Concern | Location | Frontend Impact |
|---------|----------|-----------------|
| JWT auth | `lib/jwt.js`, `lib/mobile-routes.js` | Tokens stored in `localStorage` |
| Tenant resolution | `lib/tenant.js` | API-side only; demo fallback for unauthenticated calls |
| Sign-in UI | `app/signin/page.js` | OTP + password flows |
| Post-login routing | `app/splash/page.js` | Routes by `user.products` / `activeProduct` |
| Route protection | **None** | No `middleware.js`; pages are not server-guarded |

### 2.6 Deployment Workflow

```
Local Development → Git Commit → Git Push → VPS Pull → Docker Build → Deploy
```

Reference: `DEPLOYMENT.md`, `docs/POST_DEPLOY_CHECKLIST.md`, `.github/workflows/deploy.yml`

---

## 3. Module Classification

### KEEP — Preserve as-is (backend + core logic)

| Module | Path | Rationale |
|--------|------|-----------|
| API catch-all router | `app/api/[[...path]]/route.js` | Production CRM, mobile, billing surface |
| Dedicated API routes | `app/api/**/route.js` | Modular endpoints for campaigns, opportunities, scanner |
| Auth system | `lib/jwt.js`, `lib/mobile-routes.js`, `lib/otp.js`, `lib/password.js` | JWT + OTP production-ready |
| Multi-tenant | `lib/tenant.js` | Org scoping via `orgId` |
| Lead scoring | `lib/scoring.js`, `lib/lead-scoring/*` | AI scoring engine |
| Billing / Razorpay | `lib/razorpay.js`, `lib/billing/*` | Payment integration |
| CRM / Opportunities | `lib/opportunities/*`, `lib/crm-conversion/*`, `lib/sales/*` | Sales pipeline logic |
| Campaigns / Outreach | `lib/campaigns/*`, `lib/email/*` | Marketing automation backend |
| Scanner | `lib/scanner/*` | Geo lead scanner |
| Retail AI | `lib/retail-ai.js` | Shelf-life prediction |
| Mongo models | `models/*` | Document schemas |
| n8n workflows | `n8n/*.json` | Automation integrations |
| OpenAPI spec | `docs/openapi.json` | Mobile API contract |
| shadcn/ui primitives | `components/ui/*` | Foundation for design system |

### REFINE — Evolve UI/UX without changing behavior

| Module | Path | Action |
|--------|------|--------|
| LeadEdge360 dashboard | `app/leadedge360/page.js` | Extract components; apply enterprise theme; keep same API calls |
| RetailEdge360 dashboard | `app/retailedge360/page.js` | Same as above |
| Marketing homepage | `app/page.js` + `components/gix/*` | Rebrand to brochure colors; improve conversion |
| Marketing pages | `app/about`, `products`, `pricing`, etc. | Visual refresh; preserve content structure |
| Business Suite header | `components/business-suite/DashboardHeader.tsx` | Extend into full AppShell |
| Product switcher | `components/business-suite/ProductSwitcher.tsx` | Integrate into sidebar |
| Proposals / Invoices / Revenue | `app/proposals`, `invoices`, `revenue` | Apply suite shell + design system |
| Subscribe / Pricing | `app/subscribe`, `pricing` | Align with brand; keep Razorpay flow |
| Sign-in | `app/signin/page.js` | Enterprise auth UI |
| Product selection | `app/product-selection/page.js` | Match suite branding |
| Site shell | `components/site/SiteShell.jsx`, `Navbar.jsx`, `Footer.jsx` | Marketing redesign |
| Theme tokens | `app/globals.css`, `tailwind.config.js` | Align to official brand palette |
| Onboarding wizard | `app/onboarding/page.js` | Design system + progress UX |

### REFACTOR — Structural frontend changes (no API changes)

| Module | Path | Action |
|--------|------|--------|
| Page monoliths | `app/leadedge360/page.js`, `retailedge360/page.js` | Split into `components/leadedge360/*`, `components/retailedge360/*` |
| Data fetching | Inline `fetch()` across pages | Introduce shared API client + React Query (no contract changes) |
| Layout routing | Flat `app/` structure | Add `app/(marketing)/` and `app/(suite)/` route groups |
| Providers | `app/providers.js` | Mount QueryClientProvider in root layout |
| TypeScript models | N/A (missing) | Add `src/types/` shared DTOs mirroring OpenAPI schemas |
| KPI widgets | Inline in pages | Extract to `components/suite/KpiCard.tsx` etc. |

### REMOVE — Candidates for cleanup (Phase 10 or earlier with approval)

| Item | Path | Rationale |
|------|------|-----------|
| Backup page route | `app/solutions-backup-2026-06-20-2305/` | Stale backup; not linked in nav |
| `.bak` snapshot files | Throughout repo | Clutter; not referenced by build |
| Unused visual components | `ParticleNetwork.jsx`, `WireSphere.jsx`, `CountUp.jsx` | Built but never imported |
| Legacy toast system | `components/ui/toast.jsx`, `toaster.jsx`, `hooks/use-toast.js` | Superseded by Sonner |
| Duplicate plan config | `src/config/planFeatures.js` vs `lib/billing/plan-features.js` | Consolidate reference in docs only (backend untouched) |
| Emergent Auth stubs | `lib/auth.js` (returns null) | Dead code path; document only |

---

## 4. Brand Alignment Gap (Current vs Target)

| Token | Official Brand | Current Theme |
|-------|---------------|---------------|
| Navy Blue | `#071B4D` | `#070B14` (brand.navy) |
| Royal Blue | `#0D47A1` | Not defined |
| Electric Blue | `#1976D2` | Not defined |
| Orange Accent | `#FF7A00` | `#FF8A3D` (primary CSS var) |
| Accent color | Orange (brand) | Green `#22C55E` (CSS `--accent`) |

Phase 2 will realign tokens to brochure branding.

---

## 5. Phased Delivery Roadmap

| Phase | Deliverable | Dependencies | Gate |
|-------|-------------|--------------|------|
| **1** | Audit documents (this set) | — | **Current — awaiting approval** |
| **2** | Enterprise Design System (colors, typography, theme, component standards) | Phase 1 approval | Screenshots + commit |
| **3** | Business Suite AppShell (sidebar, header, product switcher, search, notifications, breadcrumbs) | Phase 2 | Screenshots + commit |
| **4** | Marketing Website Redesign (Home, About, Products, Solutions, Industries, Pricing, Blog, Contact) | Phase 2 | Screenshots + commit |
| **5** | Dashboard V2 — Executive Command Center (real APIs) | Phases 2–3 | Screenshots + commit |
| **6** | LeadEdge360 V2 (List, Details, Pipeline, Activities, Tasks, Followups, Analytics) | Phases 2–3 | Screenshots + commit |
| **7** | RetailEdge360 V2 (Revenue, Catalog, Analytics, Performance) | Phases 2–3 | Screenshots + commit |
| **8** | Billing Center V2 (Plans, Subscription, Invoices, Payments) | Phases 2–3 | Screenshots + commit |
| **9** | Mobile Readiness Hardening | Phases 5–8 | Assessment report + commit |
| **10** | Enterprise QA & Production Readiness | All phases | Final report + deployment plan |

**Rule:** Stop after every phase. No code changes in Phase 1.

---

## 6. Future Product Expansion Strategy

The current architecture supports future products through **route namespaces** and **product switcher** patterns:

| Future Product | Proposed Route | API Readiness | Frontend Readiness |
|----------------|---------------|---------------|-------------------|
| PartnerEdge360 | `/partneredge360` | `app/api/partners/*` exists | No UI page |
| CustomerEdge360 | `/customeredge360` | Not identified | Not started |
| Observability360 | `/observability360` | Analytics APIs exist | No dedicated UI |
| Compliance360 | `/compliance360` | Audit logs API exists | No dedicated UI |
| AI Agent Marketplace | `/marketplace` | n8n + webhook infra | Not started |
| Mobile Apps | Native iOS/Android/Flutter | `docs/openapi.json`, mobile routes | API-ready; no shared TS models |

**Expansion pattern (recommended):**

1. Add route under `app/{product}/page.js`
2. Register in `ProductSwitcher` and `product-selection`
3. Create `components/{product}/` folder for domain components
4. Reuse suite AppShell from Phase 3
5. Consume existing APIs only — no backend changes

---

## 7. Automation-First Readiness

Backend webhook and integration endpoints already exist for future automation:

| Integration | API Endpoint | n8n Workflow |
|-------------|-------------|--------------|
| WhatsApp | `/api/webhooks/whatsapp`, `/api/whatsapp/*` | `n8n/whatsapp-lead-ingest.json` |
| Facebook Leads | `/api/webhooks/facebook` | `n8n/facebook-lead-ingest.json` |
| Google Leads | `/api/webhooks/google` | `n8n/google-lead-ingest.json` |
| Razorpay | `/api/webhooks/razorpay` | — |
| Email outreach | `/api/outreach/email/*` | — |
| Campaigns | `/api/campaigns/*` | — |

Frontend V2 should expose campaign/analytics UIs in later phases without modifying these APIs.

---

## 8. Critical Constraints (Non-Negotiable)

1. No MongoDB collection or schema changes
2. No backend architecture changes
3. No API contract changes
4. No authentication flow changes
5. No Razorpay integration changes
6. No lead scoring logic changes
7. No billing logic changes
8. No mock data — real APIs only
9. Preserve existing business workflows

---

## 9. Phase 1 Deliverables Checklist

| Document | Status |
|----------|--------|
| `docs/FRONTEND_V2_MASTER_PLAN.md` | Complete |
| `docs/API_INVENTORY.md` | Complete |
| `docs/ROUTE_INVENTORY.md` | Complete |
| `docs/COMPONENT_INVENTORY.md` | Complete |
| `docs/MOBILE_READINESS_ASSESSMENT.md` | Complete |
| `docs/UI_GAP_ANALYSIS.md` | Complete |
| `docs/RISK_REGISTER.md` | Complete |

---

## 10. Approval Request

Phase 1 audit is complete. No implementation code was modified.

**Please review the seven audit documents and approve Phase 2 (Enterprise Design System) to proceed.**
