# Enterprise App Mode — Implementation Plan

**Product:** AsoftechInsightz v1.2.0  
**Date:** June 2026  
**Goal:** Separate **marketing** surfaces (`SiteShell`) from **application** surfaces (`AppShell`)  
**Constraint:** Frontend only — **no API or backend logic changes**  
**Status:** Plan only — no code modified in this document

---

## 1. Objective

Introduce **Enterprise App Mode**: when a user is in the product, they see enterprise chrome (sidebar, product switcher, search, user menu). When they are on the public site, they see marketing chrome (top nav, footer, DPDP banner).

### Target split

| Mode | Shell | Routes |
|------|-------|--------|
| **Marketing** | `SiteShell` | `/`, `/about`, `/products`, `/pricing`, `/contact`, `/blog` |
| **Application** | `AppShell` | `/leadedge360`, `/retailedge360`, `/billing`, `/dashboard` |

### Application chrome requirements (must be visible on all app routes)

| Element | Component today | Action |
|---------|-----------------|--------|
| Product switcher | `ProductSwitcher.jsx` | Wire + extend route detection |
| User menu | `DashboardHeader.jsx` | Update links; add Billing |
| Search | `DashboardHeader.jsx` | Already calls `GET /api/leads?q=` — keep as-is |
| Workspace navigation | `AppShell` + `app-nav.js` | Replace stub `/app/*` nav with production routes |

### Explicit non-goals

- No changes to `app/api/**`, `lib/**` billing/auth logic
- No new API endpoints
- No database or entitlement changes
- `/pricing` remains **marketing** (`SiteShell`) — upgrade CTA links out to marketing pricing

---

## 2. Current State

### Shell usage today

| Route | Shell | Issue |
|-------|-------|-------|
| `/` … `/blog` | `SiteShell` | Correct for marketing |
| `/leadedge360` | `SiteShell` | Marketing nav on CRM dashboard |
| `/retailedge360` | `SiteShell` | Same |
| `/billing/success` | `SiteShell` | Post-payment uses marketing chrome |
| `/app/*` | `AppShell` via `app/app/layout.js` | Stub placeholders only |
| `/dashboard` | **Does not exist** | — |
| `/billing` | **Does not exist** (only `/billing/success`) | — |

### Existing AppShell stack (ready to reuse)

```
components/layout/AppShell.jsx       ← sidebar + inset + padding
components/layout/ProductSwitcher.jsx
components/layout/DashboardHeader.jsx ← search, breadcrumbs, user menu
components/layout/app-nav.js          ← WORKSPACE_NAV (needs revision)
components/ui/sidebar.jsx             ← shadcn sidebar primitives
```

### Navigation conflict

`WORKSPACE_NAV` in `app-nav.js` points to **stub routes** (`/app/crm`, `/app/sales`, etc.) that render `WorkspacePlaceholder`. This contradicts `SPRINT19_NAVIGATION_V2.md` (production-only nav).

---

## 3. Target Architecture

### 3.1 Route map (after implementation)

```
MARKETING (SiteShell)
├── /
├── /about
├── /products
├── /pricing
├── /contact
└── /blog

APPLICATION (AppShell)
├── /dashboard          ← NEW: workspace home
├── /leadedge360        ← migrate shell
├── /retailedge360      ← migrate shell
└── /billing
    └── /billing/success ← migrate shell

REDIRECTS (frontend only)
├── /app        → /dashboard
├── /app/crm    → /leadedge360
├── /app/sales  → /leadedge360
├── /app/revenue → /retailedge360
└── /app/partners → /dashboard (or /contact — pick one; recommend /dashboard)
```

### 3.2 Application sidebar (production-only)

Align with Navigation V2 — **no stub workspaces**:

```
┌─────────────────────────────────────┐
│  [Product Switcher ▼]               │
│   LeadEdge360 / RetailEdge360       │
├─────────────────────────────────────┤
│  OVERVIEW                           │
│    ○ Dashboard          /dashboard  │
├─────────────────────────────────────┤
│  PRODUCTS                           │
│    ○ LeadEdge360 CRM    /leadedge360│
│    ○ RetailEdge360      /retailedge360│
├─────────────────────────────────────┤
│  ACCOUNT                            │
│    ○ Billing            /billing    │
└─────────────────────────────────────┘
```

**Not in sidebar:** `/pricing` (marketing), Blog, About, Contact.

### 3.3 User menu (header)

| Item | Route |
|------|-------|
| Dashboard | `/dashboard` |
| LeadEdge360 | `/leadedge360` |
| RetailEdge360 | `/retailedge360` |
| Billing | `/billing` |
| Sign out | `POST /api/auth/logout` (existing) |

Optional: link “Upgrade plan” → `/pricing` (opens marketing site in same tab — acceptable).

### 3.4 Visual layout contract

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │  [≡] Breadcrumbs          [Search] [User ▼]  │
│          ├──────────────────────────────────────────────┤
│ Nav      │                                              │
│          │  Page content (no SiteShell, no marketing nav)│
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- AppShell provides outer padding (`p-4 md:p-6` + `grid-bg`)
- Page components use **inner content only** — remove duplicate `container py-10` top spacing where it doubles header offset (tune to `space-y-6` inside)

---

## 4. Recommended Layout Strategy

### Option A — Route groups (recommended)

Introduce Next.js route groups for a single layout per mode:

```
app/
  layout.js                    ← root: fonts, Toaster (unchanged)
  (marketing)/
    layout.js                  ← export SiteShell wrapper
    page.js                    ← move from app/page.js
    about/page.js
    products/page.js
    pricing/page.js
    contact/page.js
    blog/page.js
  (application)/
    layout.js                  ← export AppShell wrapper
    dashboard/page.js          ← NEW
    leadedge360/page.js        ← move from app/leadedge360
    retailedge360/page.js      ← move from app/retailedge360
    billing/
      page.js                  ← NEW (thin client page)
      success/page.js          ← move from app/billing/success
```

**Pros:** One layout file per mode; impossible to forget shell on new app pages.  
**Cons:** File moves; update any hardcoded imports/paths in docs.

### Option B — Per-route layouts (minimal moves)

Keep pages in place; add `layout.js` next to each app route:

```
app/leadedge360/layout.js      → AppShell
app/retailedge360/layout.js    → AppShell
app/billing/layout.js          → AppShell
app/dashboard/layout.js        → AppShell
```

**Pros:** Smaller diff; URLs unchanged.  
**Cons:** Four duplicate one-line layouts; easy to miss on new app routes.

**Recommendation:** **Option A** for long-term maintainability. **Option B** if you need the smallest PR for Sprint 19B.

---

## 5. Implementation Phases

### Phase 1 — Navigation contract (shell components)

**Files:** `components/layout/app-nav.js`, `ProductSwitcher.jsx`, `DashboardHeader.jsx`, `AppShell.jsx`

| Task | Detail |
|------|--------|
| 1.1 | Replace `WORKSPACE_NAV` with production tree (§3.2) |
| 1.2 | Extend `BREADCRUMB_LABELS` for `dashboard`, `leadedge360`, `retailedge360`, `billing`, `success` |
| 1.3 | Update `activeProduct()` to recognize `/dashboard`, `/billing` (default LeadEdge when on dashboard/billing) |
| 1.4 | Update `buildBreadcrumbs()` — support non-`/app` paths as first-class |
| 1.5 | User menu: replace `/app` with `/dashboard`; add Billing, RetailEdge360 |
| 1.6 | Remove ProductSwitcher footer link to `/products` **or** label it “Marketing site” (optional) |
| 1.7 | AppShell footer: replace “Sprint 19 Phase 1” with product-neutral copy |

**Rollback point:** Revert `app-nav.js` + header/switcher only.

---

### Phase 2 — Application layout wiring

**Depends on:** Phase 1

| Task | Detail |
|------|--------|
| 2.1 | Create `app/(application)/layout.js` exporting `<AppShell>{children}</AppShell>` **or** per-route layouts (Option B) |
| 2.2 | Move / duplicate pages into application group (if Option A) |
| 2.3 | **Strip `<SiteShell>`** from: `leadedge360/page.js`, `retailedge360/page.js`, `billing/success/page.js` |
| 2.4 | Adjust page root wrapper: replace `<SiteShell><div className="container py-10">` with `<div className="mx-auto max-w-[1600px] space-y-6">` (preserve inner UI) |
| 2.5 | Remove marketing-only elements that duplicate AppShell (none required if SiteShell removed) |

**Rollback point:** Restore `SiteShell` wrappers on the three product pages.

---

### Phase 3 — New application pages

**Depends on:** Phase 2

#### 3a. `/dashboard` (new)

**File:** `app/(application)/dashboard/page.js` or `app/dashboard/page.js`

**Content (frontend only, existing APIs):**

- Welcome line + signed-in user name from `GET /api/auth/me`
- Two primary cards: LeadEdge360, RetailEdge360 (links to live dashboards)
- Optional KPI strip: parallel fetch `/api/kpis` + `/api/retail-kpis` for at-a-glance numbers
- If `billing.activated` on `/api/auth/me`: show plan badge (data already returned by API — display only)

**No new endpoints.**

#### 3b. `/billing` (new)

**File:** `app/(application)/billing/page.js`

**Content (uses existing APIs):**

- `GET /api/billing/status` — plan, entitlements, subscription period
- Link “Upgrade” → `/pricing` (marketing)
- Link to `/billing/success` not needed here; success is post-checkout
- If status 401 → redirect `/signin`

**No new endpoints.**

**Rollback point:** Delete new pages; app routes still work via product URLs.

---

### Phase 4 — Marketing layout consolidation

**Depends on:** Phase 2 moves (if Option A)

| Task | Detail |
|------|--------|
| 4.1 | Create `app/(marketing)/layout.js` with `<SiteShell>{children}</SiteShell>` |
| 4.2 | Remove inline `<SiteShell>` from marketing pages (same pattern as app pages) |
| 4.3 | Confirm list: `/`, `/about`, `/products`, `/pricing`, `/contact`, `/blog` |

**Pages intentionally left on SiteShell (not in user list, but unchanged):**

| Route | Rationale |
|-------|-----------|
| `/signin` | Auth funnel; marketing chrome OK |
| `/privacy`, `/terms` | Legal |
| `/download` | Marketing asset page |

**Rollback point:** Restore inline SiteShell on marketing pages.

---

### Phase 5 — Redirects & deprecation

**Files:** `next.config.js` or `app/app/**/page.js`, middleware optional

| Task | Detail |
|------|--------|
| 5.1 | `/app` → `/dashboard` (`redirect` in `next.config.js` or replace `app/app/page.js` with redirect component) |
| 5.2 | `/app/crm`, `/app/sales` → `/leadedge360` |
| 5.3 | `/app/revenue` → `/retailedge360` |
| 5.4 | `/app/partners` → `/dashboard` |
| 5.5 | Remove or hide `app/app/layout.js` AppShell if `/app` tree is fully redirected |
| 5.6 | Update internal links: `DashboardHeader`, any docs referencing `/app` |

**Constraint:** Redirects are Next.js config / page-level — **not** API changes.

**Rollback point:** Restore `app/app/layout.js` and stub pages.

---

### Phase 6 — Polish & QA

| Task | Detail |
|------|--------|
| 6.1 | Verify no marketing `Navbar` on app routes (SS-05 regression) |
| 6.2 | Verify search still opens lead results and navigates to `/leadedge360` |
| 6.3 | Verify product switcher toggles Lead ↔ Retail |
| 6.4 | Mobile: sidebar collapse + `SidebarTrigger` in header |
| 6.5 | Billing flow: `/pricing` (marketing) → pay → `/billing/success` (app shell) → dashboard CTA |
| 6.6 | Breadcrumbs: `/billing/success` shows `Billing / Success` |
| 6.7 | Double-padding audit on LeadEdge360 / RetailEdge360 |

---

## 6. File Change Matrix

| File | Action |
|------|--------|
| `app/(application)/layout.js` | **Create** — AppShell |
| `app/(marketing)/layout.js` | **Create** — SiteShell |
| `app/(application)/dashboard/page.js` | **Create** |
| `app/(application)/billing/page.js` | **Create** |
| `app/leadedge360/page.js` | **Move** + remove SiteShell |
| `app/retailedge360/page.js` | **Move** + remove SiteShell |
| `app/billing/success/page.js` | **Move** + remove SiteShell |
| `app/page.js` + marketing pages | **Move** to `(marketing)/` + remove inline SiteShell |
| `components/layout/app-nav.js` | **Modify** — WORKSPACE_NAV, breadcrumbs |
| `components/layout/ProductSwitcher.jsx` | **Modify** — activeProduct paths |
| `components/layout/DashboardHeader.jsx` | **Modify** — user menu, breadcrumbs |
| `components/layout/AppShell.jsx` | **Modify** — footer copy |
| `app/app/layout.js` | **Deprecate** or redirect |
| `next.config.js` | **Modify** — optional redirects |
| `components/site/Navbar.jsx` | **No change** (marketing only) |
| `app/api/**` | **No change** |

---

## 7. WORKSPACE_NAV Target Definition

Replace contents of `WORKSPACE_NAV` in `app-nav.js`:

```javascript
export const WORKSPACE_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/leadedge360', label: 'LeadEdge360', icon: Target, exact: true },
      { href: '/retailedge360', label: 'RetailEdge360', icon: IndianRupee, exact: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/billing', label: 'Billing', icon: CreditCard, exact: false },
    ],
  },
]
```

Remove: `/app`, `/app/crm`, `/app/sales`, `/app/revenue`, `/app/partners`, sidebar `/pricing`.

---

## 8. Breadcrumb Rules

| Path | Breadcrumb |
|------|------------|
| `/dashboard` | Dashboard |
| `/leadedge360` | LeadEdge360 |
| `/retailedge360` | RetailEdge360 |
| `/billing` | Billing |
| `/billing/success` | Billing › Success |

Update `buildBreadcrumbs()` in `DashboardHeader.jsx` to handle paths that do **not** start with `/app`.

---

## 9. Testing Checklist

### Marketing mode

- [ ] `/` shows Navbar with Home, About, Products, Pricing, Blog, Contact
- [ ] `/pricing` shows Footer + DPDP banner
- [ ] No sidebar on marketing pages

### Application mode

- [ ] `/dashboard` shows AppShell only (no marketing nav)
- [ ] `/leadedge360` — sidebar + search + user menu
- [ ] `/retailedge360` — product switcher shows Retail active
- [ ] `/billing` — loads status from existing API
- [ ] `/billing/success` — AppShell; CTA to `/leadedge360`
- [ ] Signed-out user on `/leadedge360` — demo data still works (no API change)
- [ ] User menu sign-out works
- [ ] `/app` redirects to `/dashboard`

### Regression

- [ ] Global search returns leads (existing API)
- [ ] Lead table CRUD unchanged
- [ ] Retail SKU table unchanged
- [ ] Mobile layout usable

---

## 10. Deployment Order

1. **Phase 1** — Nav contract (components only; `/app` still works)
2. **Phase 2 + 3** — App layout + new pages + strip SiteShell from products
3. **Phase 4** — Marketing layout group (optional same PR or follow-up)
4. **Phase 5** — Redirects from `/app/*`
5. **Phase 6** — QA pass

Deploy Phases 1–3 together to avoid a state where nav points to `/dashboard` before the page exists.

---

## 11. Rollback Plan

| Symptom | Rollback |
|---------|----------|
| App pages broken layout | Re-add `<SiteShell>` to product pages; remove application `layout.js` |
| Nav links 404 | Revert `app-nav.js` to previous WORKSPACE_NAV |
| `/app` bookmarks dead | Restore `app/app/layout.js` and stub pages |
| Double padding | Revert page wrapper class changes only |

Full rollback: revert single PR; no database or API impact.

---

## 12. Effort Estimate

| Phase | Effort |
|-------|--------|
| Phase 1 — Nav components | 2–3 hours |
| Phase 2 — Layout wiring | 3–4 hours |
| Phase 3 — Dashboard + Billing pages | 3–4 hours |
| Phase 4 — Marketing group | 2–3 hours |
| Phase 5 — Redirects | 1 hour |
| Phase 6 — QA | 2 hours |
| **Total** | **~2 dev days** |

---

## 13. Success Criteria

Enterprise App Mode is complete when:

1. All six **marketing** routes use `SiteShell` only.
2. All four **application** route families use `AppShell` only — **no marketing Navbar**.
3. Every application page shows **product switcher, search, user menu, workspace nav**.
4. Sidebar contains **only production routes** (no `/app/*` stubs).
5. `/dashboard` exists as the in-app home.
6. `/billing` exists as the in-app billing summary (existing APIs).
7. Zero changes to API routes or backend libraries.

---

## 14. References

- `docs/ENTERPRISE_UI_GAP_ANALYSIS.md` — Navigation UX score 4/10; P0 app chrome
- `docs/SPRINT19_NAVIGATION_V2.md` — Production-only nav contract
- `components/layout/AppShell.jsx` — Existing enterprise shell
- `components/site/SiteShell.jsx` — Marketing shell

---

*Implementation plan only. No application code was modified.*
