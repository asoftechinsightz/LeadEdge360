# Frontend Route Inventory

**Audit date:** 22 June 2026  
**Framework:** Next.js 14 App Router (`app/`)

---

## 1. Summary

| Category | Count |
|----------|------:|
| Total page routes | 49 |
| Public (no suite auth) | 22 |
| Protected (SuiteRouteLayout + JWT) | 26 |
| Public growth / card | 1 |
| Auth entry / redirect | 3 |

**Auth mechanism:** Client-side `SuiteAuthProvider` checks `localStorage.accessToken`. Missing token → redirect to `/signin?returnUrl=...`.  
**Middleware:** Only rate-limits `/api/auth/*` (40 req/min/IP). **No route-level middleware auth.**

**Layout source:** `components/suite/SuiteRouteLayout.tsx` → `ThemeProvider` + `SuiteAuthProvider` + `AppShell`.

---

## 2. Protected Routes (Business Suite Shell)

Routes using `SuiteRouteLayout` via `layout.js`:

| Route | File | Product / Module |
|-------|------|------------------|
| `/dashboard` | `app/dashboard/page.js` | Business Suite — Executive dashboard |
| `/leads` | `app/leads/page.js` | LeadEdge360 / CRM |
| `/leads/[id]` | `app/leads/[id]/page.js` | LeadEdge360 — Lead detail |
| `/opportunities` | `app/opportunities/page.js` | LeadEdge360 — Pipeline |
| `/proposals` | `app/proposals/page.js` | Business Suite — CRM |
| `/proposals/[id]` | `app/proposals/[id]/page.js` | Business Suite — Proposal detail |
| `/invoices` | `app/invoices/page.js` | Business Suite — Billing |
| `/revenue` | `app/revenue/page.js` | Business Suite — Revenue |
| `/campaigns` | `app/campaigns/page.js` | Business Suite — Marketing |
| `/analytics` | `app/analytics/page.js` | Business Suite — Analytics |
| `/settings` | `app/settings/page.js` | Business Suite — Administration |
| `/payments` | `app/payments/page.js` | Business Suite — Billing center |
| `/onboarding` | `app/onboarding/page.js` | Business Suite — Company setup |
| `/growth/business-card` | `app/growth/business-card/page.js` | Growth — Digital business card (Sprint 1) |
| `/retailedge360` | `app/retailedge360/page.js` | RetailEdge360 |
| `/leadedge360` | `app/leadedge360/page.js` | LeadEdge360 — Executive command center |
| `/leadedge360/command-center` | `app/leadedge360/command-center/page.js` | LeadEdge360 — AI Command Center |
| `/leadedge360/insights` | `app/leadedge360/insights/page.js` | LeadEdge360 — AI Insights |
| `/leadedge360/automation` | `app/leadedge360/automation/page.js` | LeadEdge360 — Automation Hub |
| `/leadedge360/geo-finder` | `app/leadedge360/geo-finder/page.js` | LeadEdge360 — Geo Lead Finder |
| `/leadedge360/territories` | `app/leadedge360/territories/page.js` | LeadEdge360 — Territory Management |
| `/leadedge360/growth-engine` | `app/leadedge360/growth-engine/page.js` | LeadEdge360 — Growth Audit Engine |
| `/leadedge360/revenue-intelligence` | `app/leadedge360/revenue-intelligence/page.js` | LeadEdge360 — Revenue Intelligence |
| `/leadedge360/conversations` | `app/leadedge360/conversations/page.js` | LeadEdge360 — Conversations |
| `/leadedge360/reports` | `app/leadedge360/reports/page.js` | LeadEdge360 — Reports |
| `/leadedge360/leads` | `app/leadedge360/leads/page.js` | LeadEdge360 — Leads (alias) |
| `/leadedge360/leads/[id]` | `app/leadedge360/leads/[id]/page.js` | LeadEdge360 — Lead detail (alias) |
| `/leadedge360/opportunities` | `app/leadedge360/opportunities/page.js` | LeadEdge360 — Opportunities (alias) |

**Note:** `SUITE_AUTH_GUARD_PATHS` in `auth-routes.ts` omits `/leads`, `/opportunities`, `/growth` but those routes are protected by parent `layout.js`.

---

## 3. Public Routes

### 3.1 Marketing site (`SiteShell`)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.js` | GIX marketing homepage |
| `/about` | `app/about/page.js` | About |
| `/blog` | `app/blog/page.js` | Blog listing |
| `/contact` | `app/contact/page.js` | Contact form |
| `/download` | `app/download/page.js` | Download / app links |
| `/industries` | `app/industries/page.js` | Industries |
| `/partners` | `app/partners/page.js` | Partner program (marketing) |
| `/pricing` | `app/pricing/page.js` | Pricing |
| `/privacy` | `app/privacy/page.js` | Privacy policy |
| `/products` | `app/products/page.js` | Product catalog marketing |
| `/services` | `app/services/page.js` | Services |
| `/solutions` | `app/solutions/page.js` | Solutions |
| `/terms` | `app/terms/page.js` | Terms of service |

### 3.2 Public growth / lead capture

| Route | File | Layout | Purpose |
|-------|------|--------|---------|
| `/growth-audit` | `app/growth-audit/page.js` | `SiteShell` | Public growth audit form |
| `/c/[slug]` | `app/c/[slug]/page.js` | Root | Public digital business card (SSR) |

### 3.3 Auth & onboarding entry

| Route | File | Access |
|-------|------|--------|
| `/signin` | `app/signin/page.js` | Public — primary login |
| `/login` | `app/login/page.js` | Public — redirect/alias |
| `/splash` | `app/splash/page.js` | Public — post-auth router (checks `/auth/me`) |

### 3.4 Semi-protected / flow routes (no SuiteRouteLayout)

| Route | File | Notes |
|-------|------|-------|
| `/product-selection` | `app/product-selection/page.js` | Post-login product picker; expects token via API |
| `/subscribe` | `app/subscribe/page.js` | Plans grid; billing checkout |
| `/design-system-preview` | `app/design-system-preview/page.js` | Internal DS gallery |

---

## 4. Product-Specific Route Map

### 4.1 Business Suite (cross-product CRM)

```
/dashboard
/leads, /leads/[id]
/opportunities
/proposals, /proposals/[id]
/invoices
/revenue
/campaigns
/analytics
/settings
/payments
/onboarding
/growth/business-card
/product-selection
/subscribe
```

### 4.2 LeadEdge360

```
/leadedge360
/leadedge360/command-center
/leadedge360/insights
/leadedge360/automation
/leadedge360/geo-finder
/leadedge360/territories
/leadedge360/growth-engine
/leadedge360/revenue-intelligence
/leadedge360/conversations
/leadedge360/reports
/leadedge360/leads, /leadedge360/leads/[id]
/leadedge360/opportunities
```

Also shares `/leads`, `/opportunities`, `/dashboard` via unified nav.

### 4.3 RetailEdge360

```
/retailedge360
```

Marketing reference: `/products` (RetailEdge360 section).

### 4.4 Growth modules

| Route | Status |
|-------|--------|
| `/growth/business-card` | Built (Sprint 1) |
| `/c/[slug]` | Public card |
| `/growth-audit` | Public form |
| `/growth/qr` | **Not built** (Sprint 2) |
| `/growth/reviews` | **Not built** (Sprint 3) |
| `/q/[code]` | **Not built** (Sprint 2) |

---

## 5. Navigation vs Routes

**Nav source:** `components/suite/nav-config.ts` → `SUITE_NAV_GROUPS`

| Nav group | Routes in sidebar |
|-----------|-------------------|
| Dashboard | `/dashboard` |
| Sales | `/leads`, `/opportunities` |
| CRM | `/proposals`, `/invoices` |
| Marketing | `/campaigns`, `/growth/business-card` |
| Analytics | `/analytics`, `/revenue` |
| AI Workspace | 9× `/leadedge360/*` |
| Administration | `/settings`, `/payments` |

**In `SUITE_ROUTES` but not sidebar:** `/retailedge360`, `/onboarding`, `/growth-audit`, `/growth`

**Product switcher:** LeadEdge360 → `/dashboard`; RetailEdge360 → `/retailedge360`

---

## 6. API Routes (reference only)

Frontend pages do not define API routes. Backend lives under `app/api/` (100+ handlers). See `API_CONSUMPTION_REPORT.md` for frontend consumption.

---

## 7. Auth Guard Gaps (audit finding)

| Issue | Detail |
|-------|--------|
| No server middleware auth | Page protection is client-only |
| `SUITE_AUTH_GUARD_PATHS` incomplete | Missing `/leads`, `/opportunities`, `/growth` |
| `/growth-audit` in guard list | Actually public (`SiteShell`) |
| No role-based route denial | Any authenticated user reaches all suite routes |
| No plan/feature nav hiding | All menu items visible to all users |

---

*See [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md) and [UI_GAP_REPORT.md](./UI_GAP_REPORT.md).*
