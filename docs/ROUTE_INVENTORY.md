# Route Inventory — AsoftechInsightz

> **Reference inventory only.** Canonical route map: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §8 · `src/design-tokens/tokens.json` → `routes`

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Router:** Next.js 14 App Router (file-based)  
**Middleware:** None (`middleware.js` not present)

---

## 1. Routing Architecture

| Aspect | Implementation |
|--------|----------------|
| Framework | Next.js App Router |
| Page files | `app/**/page.js` (25 routes) |
| Layout files | `app/layout.js` (root only — no route groups) |
| API routes | `app/api/**/route.js` (73 files + catch-all) |
| Redirects in config | **None** — `next.config.js` has headers only, no `redirects`/`rewrites` |
| Auth gate | Client-side only (`localStorage` + splash router) |
| Product subdomain handling | **Not in app** — requires nginx/VPS configuration |

### Path Aliases (`jsconfig.json`)

| Alias | Maps To |
|-------|---------|
| `@/*` | Repository root |
| `@/components/*` | `components/` |
| `@/lib/*` | `lib/` |
| `@/app/*` | `app/` |

---

## 2. Frontend Routes — Complete Inventory

### 2.1 Marketing Website (Public)

| URL | File | Shell | Status |
|-----|------|-------|--------|
| `/` | `app/page.js` | GIX sections via `GIXContainer` | KEEP — refine in Phase 4 |
| `/about` | `app/about/page.js` | `SiteShell` | KEEP — refine |
| `/solutions` | `app/solutions/page.js` | `SiteShell` | KEEP — refine |
| `/services` | `app/services/page.js` | `SiteShell` | KEEP — refine |
| `/industries` | `app/industries/page.js` | `SiteShell` | KEEP — refine |
| `/products` | `app/products/page.js` | `SiteShell` | KEEP — refine |
| `/partners` | `app/partners/page.js` | `SiteShell` | KEEP — refine |
| `/blog` | `app/blog/page.js` | `SiteShell` | KEEP — refine (Insights) |
| `/contact` | `app/contact/page.js` | `SiteShell` | KEEP — refine |
| `/growth-audit` | `app/growth-audit/page.js` | `SiteShell` | KEEP — refine |
| `/download` | `app/download/page.js` | `SiteShell` | KEEP |
| `/privacy` | `app/privacy/page.js` | `SiteShell` | KEEP |
| `/terms` | `app/terms/page.js` | `SiteShell` | KEEP |
| `/pricing` | `app/pricing/page.js` | `SiteShell` | KEEP — refine (static pricing) |

**Missing vs master directive:** No dedicated `/book-demo` route. Demo booking is likely via `/contact` or `/growth-audit` CTAs.

**Remove candidate:** `app/solutions-backup-2026-06-20-2305/page.js` — stale backup route, not in navigation.

### 2.2 Authentication & Onboarding

| URL | File | Purpose | Status |
|-----|------|---------|--------|
| `/signin` | `app/signin/page.js` | OTP + password login | REFINE |
| `/splash` | `app/splash/page.js` | Post-login product router | KEEP |
| `/product-selection` | `app/product-selection/page.js` | LeadEdge360 vs RetailEdge360 chooser | REFINE |
| `/subscribe` | `app/subscribe/page.js` | Razorpay 3-tier checkout | REFINE |
| `/onboarding` | `app/onboarding/page.js` | Client onboarding wizard | REFINE |

### 2.3 Business Suite — LeadEdge360

| URL | File | APIs Used | Shell | Status |
|-----|------|-----------|-------|--------|
| `/leadedge360` | `app/leadedge360/page.js` | `/api/leads`, `/api/kpis`, `/api/agents` | `DashboardHeader` (via Navbar) | REFINE → Phase 6 |
| `/proposals` | `app/proposals/page.js` | `/api/proposals`, `/api/dashboard/proposals` | **Marketing Navbar** | REFINE |
| `/invoices` | `app/invoices/page.js` | `/api/invoices` | **Marketing Navbar** | REFINE |
| `/revenue` | `app/revenue/page.js` | `/api/revenue/dashboard` | **Marketing Navbar** | REFINE |

### 2.4 Business Suite — RetailEdge360

| URL | File | APIs Used | Shell | Status |
|-----|------|-----------|-------|--------|
| `/retailedge360` | `app/retailedge360/page.js` | `/api/products`, `/api/retail-kpis` | `DashboardHeader` (via Navbar) | REFINE → Phase 7 |

### 2.5 Billing

| URL | File | Purpose | Status |
|-----|------|---------|--------|
| `/subscribe` | `app/subscribe/page.js` | Razorpay checkout | REFINE → Phase 8 |
| `/pricing` | `app/pricing/page.js` | Static plan display | REFINE |

### 2.6 Missing Routes (Referenced but Not Implemented)

| URL | Referenced By | Priority |
|-----|--------------|----------|
| `/payments` | `DashboardHeader.tsx` nav link | **High** — broken link |
| `/dashboard` | Master directive (Executive Command Center) | **High** — Phase 5 |
| `/book-demo` | Master directive marketing pages | Medium — may map to `/contact` |
| `/campaigns` | API exists, no UI | Low — future phase |
| `/admin` | Admin APIs exist, no UI | Low — future phase |

---

## 3. Product URL Mapping (Target Architecture)

| Subdomain (Target) | Redirect To | Current State |
|--------------------|-------------|---------------|
| `www.asoftechinsightz.com` | `/` (marketing routes) | Same app, path-based |
| `app.asoftechinsightz.com` | Business Suite routes | Same app, no separation |
| `leadedge360.asoftechinsightz.com` | `/leadedge360` | Route exists; **redirect not configured in Next.js** |
| `retailedge360.asoftechinsightz.com` | `/retailedge360` | Route exists; **redirect not configured in Next.js** |

**Recommended VPS/nginx config (Phase 10 deployment plan):**

```nginx
# leadedge360.asoftechinsightz.com → app.asoftechinsightz.com/leadedge360
server {
  server_name leadedge360.asoftechinsightz.com;
  return 301 https://app.asoftechinsightz.com/leadedge360$request_uri;
}
```

Reference: `docs/nginx.conf`

---

## 4. Navigation & Layout Routing

### 4.1 Navbar Switching Logic

**File:** `components/site/Navbar.jsx`

```
if pathname starts with /leadedge360 OR /retailedge360
  → render DashboardHeader
else
  → render marketing Navbar
```

**Gap:** Suite pages `/proposals`, `/invoices`, `/revenue`, `/onboarding`, `/payments` use the **marketing navbar**, not `DashboardHeader`.

### 4.2 DashboardHeader Navigation

**File:** `components/business-suite/DashboardHeader.tsx`

| Nav Item | Href | Page Exists |
|----------|------|-------------|
| Leads | `/leadedge360` | Yes |
| Proposals | `/proposals` | Yes |
| Invoices | `/invoices` | Yes |
| Revenue | `/revenue` | Yes |
| Payments | `/payments` | **No** |
| Onboarding | `/onboarding` | Yes |

### 4.3 Product Switcher

**File:** `components/business-suite/ProductSwitcher.tsx`  
Action: `window.location = "/product-selection"`

### 4.4 Footer Product Links

**File:** `components/site/Footer.jsx`  
Links to `/leadedge360`, `/retailedge360`

---

## 5. Client-Side Routing Flows

### 5.1 Authentication Flow

```
/signin
  → POST /api/auth/login-otp | verify-otp | login-password
  → localStorage: accessToken, refreshToken, currentUser
  → /splash
```

### 5.2 Splash Router (`app/splash/page.js`)

```
Read localStorage.currentUser.products + activeProduct

1 product = leadedge360     → /leadedge360
1 product = retailedge360   → /retailedge360
2+ products + activeProduct → matching product route
2+ products, no activeProduct → /product-selection
No products / error         → /signin
```

### 5.3 Subscription Flow

```
/subscribe?plan=starter|growth|pro
  → POST /api/billing/checkout
  → Razorpay modal (window.Razorpay)
  → POST /api/billing/verify
  → /onboarding
```

### 5.4 Logout Flow

```
DashboardHeader or Navbar logout
  → clear localStorage (currentUser, accessToken, refreshToken)
  → /signin
```

---

## 6. Server-Side API Redirects

| Trigger | Destination | File |
|---------|-------------|------|
| `GET /api/auth/login` (not configured) | `/signin?auth_error=not_configured` | catch-all |
| `GET /api/auth/login` (configured) | Emergent hosted login | catch-all |
| `GET /api/auth/callback` (missing session) | `/?auth_error=missing_session` | catch-all |
| `GET /api/auth/callback` (exchange failed) | `/?auth_error=exchange_failed` | catch-all |
| `GET /api/auth/callback` (success) | `/leadedge360` + cookie | catch-all |
| `GET /api/auth/google` | Google OAuth URL | `app/api/auth/google/route.js` |

---

## 7. Proposed Route Structure (Phase 3+ — Not Implemented)

Evolutionary target using Next.js route groups:

```
app/
├── (marketing)/
│   ├── layout.js          # SiteShell
│   ├── page.js            # Home
│   ├── about/page.js
│   ├── products/page.js
│   └── ...
├── (suite)/
│   ├── layout.js          # AppShell (sidebar + header)
│   ├── dashboard/page.js  # Executive Command Center (Phase 5)
│   ├── leadedge360/
│   │   ├── page.js        # Lead list
│   │   ├── pipeline/page.js
│   │   ├── [id]/page.js   # Lead details
│   │   └── analytics/page.js
│   ├── retailedge360/
│   │   ├── page.js
│   │   └── analytics/page.js
│   ├── billing/
│   │   ├── page.js
│   │   ├── invoices/page.js
│   │   └── payments/page.js
│   └── onboarding/page.js
├── signin/page.js
├── splash/page.js
└── product-selection/page.js
```

This preserves existing URLs where possible and adds nested routes for V2 modules.

---

## 8. Route-to-API Coverage Matrix

| Route | APIs Available (Unused) | V2 Opportunity |
|-------|--------------------------|----------------|
| `/leadedge360` | opportunities, followups, tasks, timeline, lead-scoring, scanner, sales queue | Phase 6 |
| `/retailedge360` | catalog API | Phase 7 |
| — (missing `/dashboard`) | `/api/dashboard/kpis`, revenue, sales-performance | Phase 5 |
| — (missing `/payments`) | `/api/payments`, `/api/billing/plans` | Phase 8 |
| — (no campaigns UI) | `/api/campaigns/*`, analytics | Future |
| `/onboarding` | `/api/onboarding/*` (full wizard APIs) | Refine |

---

## 9. Summary Statistics

| Metric | Count |
|--------|-------|
| Total frontend page routes | 25 (24 active + 1 backup) |
| Marketing routes | 14 |
| Business Suite routes | 6 |
| Auth/billing/onboarding routes | 5 |
| Missing referenced routes | 2+ (`/payments`, `/dashboard`) |
| Route groups | 0 |
| Layout files | 1 (root only) |
| Middleware | 0 |
