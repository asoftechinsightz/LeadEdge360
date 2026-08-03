# Phase 1 — Enterprise App Mode UI Mockups & Wireframes

**Product:** AsoftechInsightz v1.2.0  
**Phase:** Enterprise App Mode — Phase 1 (navigation & shell contract)  
**Date:** June 2026  
**Status:** **Awaiting approval** — implement Phase 1 only after sign-off  
**Benchmarks:** Salesforce · HubSpot · ServiceNow · Dynatrace

---

## Constraints (locked)

| Rule | Implication |
|------|-------------|
| No API changes | Search uses existing `GET /api/leads?q=`; billing page uses `GET /api/billing/status`; dashboard uses `GET /api/auth/me`, `/api/kpis`, `/api/retail-kpis` |
| No Mongo changes | Display only what APIs already return |
| No auth changes | Sign-in stays on `SiteShell`; user menu uses existing `/api/auth/me` + logout |
| No billing logic changes | Billing page is read-only summary + link to marketing `/pricing` |
| No placeholder routes | Sidebar links **only** to production pages below |
| Production-ready pages only | No `/app/crm`, `/app/sales`, or stub workspaces in nav |

### Approved application routes (Phase 1 nav targets)

| Route | Page | Data source |
|-------|------|-------------|
| `/dashboard` | Workspace home | `auth/me`, `kpis`, `retail-kpis` |
| `/leadedge360` | CRM dashboard | Existing page (shell swap only in later phase) |
| `/retailedge360` | Retail dashboard | Existing page (shell swap only in later phase) |
| `/billing` | Account billing | `billing/status` |
| `/billing/success` | Post-payment | `billing/status` (existing) |

---

## Design Direction

### What we borrow from each benchmark

| Benchmark | Pattern adopted | Where |
|-----------|-----------------|-------|
| **Salesforce** | Left app rail + object switcher; list-first home; record search in header | Sidebar + product switcher + global search |
| **HubSpot** | Friendly workspace home with two product cards; account menu with billing entry | `/dashboard`, user menu |
| **ServiceNow** | Dense nav labels; flat app background (no marketing gradients); section headers in sidebar | App shell chrome, sidebar groups |
| **Dynatrace** | Dark analytical UI; breadcrumb context; compact 56px header | Header bar, dark tokens |

### What we intentionally avoid

- Marketing navbar (Blog, About, Contact) inside app mode
- Stub “Coming soon” workspace tiles
- Decorative glow/blur on shell chrome (reserved for marketing site)
- Light mode in Phase 1 (dark-only; matches current product)

### Visual system (existing tokens — no new palette)

| Token | Value | Usage in app shell |
|-------|-------|-------------------|
| `--sidebar-background` | `hsl(222 47% 4%)` | Sidebar fill |
| `--background` | `hsl(222 47% 5%)` | Main content (flat — **no** body gradients in app) |
| `--primary` | `#FF8A3D` | Active nav, LeadEdge accent |
| `--accent` | `#22C55E` | RetailEdge accent |
| `--border` | `hsl(222 25% 16%)` | Dividers |
| Font body | Inter 14px | Nav, header, tables |
| Font display | Space Grotesk | Page titles inside content area only |

**App shell rule:** Disable marketing `body` radial gradients inside `AppShell` (flat `#0B1220` feel — ServiceNow/Dynatrace density).

---

## Global Layout — Desktop (≥1024px)

### Wireframe SS-WF-01 — Application chrome

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR 240px      │  HEADER 56px fixed                                       │
│ collapsible → 64px │  ┌─────────────────────────────────────────────────────┐  │
│                    │  │ [≡]  Dashboard › LeadEdge360    [🔍 Search…]  [👤▼] │  │
├────────────────────┼──┴─────────────────────────────────────────────────────┴──┤
│ ┌────────────────┐ │                                                             │
│ │ [logo] Asoftech│ │  CONTENT AREA (scroll)                                      │
│ │ Insightz    ▼  │ │  max-width: 1600px · padding: 24px                        │
│ │ LeadEdge360    │ │                                                             │
│ └────────────────┘ │  ┌─────────────────────────────────────────────────────┐  │
│                    │  │                                                     │  │
│ OVERVIEW           │  │              Route-specific page                    │  │
│  ● Dashboard       │  │                                                     │  │
│                    │  └─────────────────────────────────────────────────────┘  │
│ PRODUCTS           │                                                             │
│  ○ LeadEdge360     │                                                             │
│  ○ RetailEdge360   │                                                             │
│                    │                                                             │
│ ACCOUNT            │                                                             │
│  ○ Billing         │                                                             │
│                    │                                                             │
│ ─────────────────  │                                                             │
│ v1.2 · Workspace   │                                                             │
└────────────────────┴─────────────────────────────────────────────────────────────┘
```

| Region | Width / height | Behavior |
|--------|----------------|----------|
| Sidebar expanded | 240px | Default on desktop |
| Sidebar collapsed | 64px | Icon-only; tooltips on hover |
| Header | 56px (`h-14`) | Sticky; `backdrop-blur` + `border-b` |
| Content | `flex-1` | Scroll independent of sidebar |

---

## 1. Sidebar Design

### Reference mockup ID: **SS-WF-02**

**Benchmark mix:** Salesforce left rail + ServiceNow section labels + HubSpot clarity.

```
┌─────────────────────────┐
│ ┌────┐ AsoftechInsightz │  ← Product switcher trigger (full width)
│ │logo│ LeadEdge360    ⌄ │
├─────────────────────────┤
│ OVERVIEW                │  ← 10px caps, tracking-widest, 50% opacity
│ ┌─────────────────────┐ │
│ │ ▣  Dashboard        │ │  ← active: left border 2px primary
│ └─────────────────────┘ │
│                         │
│ PRODUCTS                │
│   ○ LeadEdge360         │
│   ○ RetailEdge360       │
│                         │
│ ACCOUNT                 │
│   ○ Billing             │
│                         │
├─────────────────────────┤
│ Workspace · DPDP ready  │  ← footer 10px muted (no "Sprint 19")
└─────────────────────────┘
```

### Nav item states

| State | Visual |
|-------|--------|
| **Default** | `text-sidebar-foreground/80`, no border |
| **Hover** | `bg-sidebar-accent` |
| **Active** | `bg-sidebar-accent`, `border-l-2 border-sidebar-primary`, icon `text-primary` (Lead) or `text-accent` (Retail) |
| **Collapsed** | Icon centered; label in tooltip |

### Production nav map (Phase 1 `WORKSPACE_NAV`)

| Group | Label | Icon | href | exact |
|-------|-------|------|------|-------|
| Overview | Dashboard | `LayoutDashboard` | `/dashboard` | yes |
| Products | LeadEdge360 | `Target` | `/leadedge360` | yes |
| Products | RetailEdge360 | `IndianRupee` | `/retailedge360` | yes |
| Account | Billing | `CreditCard` | `/billing` | no (matches `/billing/success`) |

**Excluded from sidebar:** `/pricing`, `/app/*`, marketing pages.

### Collapsed sidebar SS-WF-02b

```
┌──────┐
│ [⌄]  │  ← switcher icon only
├──────┤
│  ▣   │  Dashboard
│  ◎   │  LeadEdge
│  ₹   │  Retail
│  💳  │  Billing
└──────┘
```

---

## 2. Header Design

### Reference mockup ID: **SS-WF-03**

**Benchmark mix:** Dynatrace top bar + HubSpot search + Salesforce breadcrumbs.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [≡]  │  Billing  ›  Success          │  ┌──────────────────┐  │ [Avatar ▼] │
│ mob  │  Breadcrumb (md+)             │  │ 🔍 Search leads… │  │ Priya Iyer │
│ only │                               │  └──────────────────┘  │            │
└────────────────────────────────────────────────────────────────────────────┘
     ↑ z-30 sticky · h-14 · bg-background/80 · border-b border-border/60
```

### Header zones (desktop)

| Zone | Width | Content |
|------|-------|---------|
| Left | auto | `SidebarTrigger` hidden ≥md; breadcrumbs visible ≥md |
| Center | max 384px | Global search input (`rounded-full`, h-9) |
| Right | auto | User avatar + name (truncate 120px) |

### Breadcrumb rules

| Path | Trail |
|------|-------|
| `/dashboard` | **Dashboard** |
| `/leadedge360` | **LeadEdge360** |
| `/retailedge360` | **RetailEdge360** |
| `/billing` | **Billing** |
| `/billing/success` | Billing › **Success** |

Last segment = `BreadcrumbPage` (non-link). Prior segments link.

### Search popover SS-WF-03b

```
┌──────────────────────────────┐
│ 🔍 rahul                     │
├──────────────────────────────┤
│ Rahul Verma                  │
│ Acme Pharma · +91… · Bengaluru│
│──────────────────────────────│
│ Sneha Patel                  │
│ …                            │
├──────────────────────────────┤
│ [ Open CRM inbox → ]         │  → /leadedge360
└──────────────────────────────┘
```

- Min 2 characters (existing behavior)
- No new search APIs; retail SKU search out of scope for Phase 1

---

## 3. Product Switcher

### Reference mockup ID: **SS-WF-04**

**Benchmark mix:** Salesforce App Launcher (compact) + HubSpot product hub.

### Trigger (sidebar header)

```
┌─────────────────────────────────┐
│ [LOGO]  AsoftechInsightz     ⌄  │
│         LeadEdge360               │  ← current product short name
└─────────────────────────────────┘
```

### Dropdown panel (align: start, width 256px)

```
┌─────────────────────────────────┐
│ PRODUCTS                        │
├─────────────────────────────────┤
│ [◎] LeadEdge360            ✓    │  ← primary border tint
│     CRM & lead intelligence     │
├─────────────────────────────────┤
│ [₹] RetailEdge360               │  ← accent border tint
│     Expiry & shelf-life AI      │
├─────────────────────────────────┤
│ View marketing site →           │  ← optional link to /products (new tab)
└─────────────────────────────────┘
```

### Active product detection

| Current path | Active product |
|--------------|----------------|
| `/leadedge360` | LeadEdge360 |
| `/retailedge360` | RetailEdge360 |
| `/dashboard`, `/billing`, `/billing/*` | Last selected product **or** default LeadEdge360 |

Phase 1: default **LeadEdge360** when on dashboard/billing (no persistence API).

### Interaction

- Click product row → `router.push(product.href)`
- Check icon on active row (existing pattern)
- No stub products in list

---

## 4. User Menu

### Reference mockup ID: **SS-WF-05** (part of header)

**Benchmark mix:** HubSpot account dropdown.

```
┌────────────────────────┐
│ Priya Iyer             │
│ priya@company.com      │
├────────────────────────┤
│ ▣ Dashboard            │
│ ◎ LeadEdge360          │
│ ₹ RetailEdge360        │
│ 💳 Billing             │
├────────────────────────┤
│ ↗ Upgrade plan         │  → /pricing (marketing, same tab)
├────────────────────────┤
│ Sign out               │
└────────────────────────┘
```

Signed-out state: single **Sign in** pill → `/signin` (unchanged).

If `billing.plan` present on `auth/me`: show small pill next to name on desktop — `Starter` / `Growth` (display only).

---

## 5. Dashboard Layout (`/dashboard`)

### Reference mockup ID: **SS-WF-06**

**Benchmark mix:** HubSpot home + Dynatrace KPI strip.

**Phase 1 note:** Phase 1 implements **nav + shell components** only. Dashboard page ships Phase 2–3; this mockup is the **approved target** for that page.

### Desktop wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Dashboard                                                      │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Good morning, Priya                                    [ Starter plan ]     │
│  Workspace overview · Sunday, 21 Jun 2026                                  │
│                                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Total leads │ │ Hot leads   │ │ Conversion  │ │ SKUs at risk│          │
│  │    142      │ │     28      │ │    18%      │ │     12      │          │
│  │ +4% vs 7d   │ │  KPI strip  │ │  existing   │ │  retail API │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                            │
│  YOUR PRODUCTS                                                             │
│  ┌──────────────────────────────┐ ┌──────────────────────────────┐      │
│  │ [◎] LeadEdge360              │ │ [₹] RetailEdge360            │      │
│  │ CRM & lead intelligence      │ │ Expiry & shelf-life AI       │      │
│  │ 142 leads · 8 hot            │ │ 48 SKUs · ₹2.1L at risk      │      │
│  │ [ Open dashboard → ]         │ │ [ Open dashboard → ]         │      │
│  └──────────────────────────────┘ └──────────────────────────────┘      │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ QUICK ACTIONS                                                     │   │
│  │  [ + New lead ]   → opens /leadedge360 (existing dialog deep-link)│   │
│  │  [ View billing ] → /billing                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Card specs

| Element | Spec |
|---------|------|
| KPI tile | Flat `bg-card`, `border-border/60`, **no blur orb**; 4px left accent bar |
| Product card | 2-col grid; primary CTA `rounded-full`; secondary stats from existing APIs |
| Page title | `text-2xl` Space Grotesk — **not** marketing `text-5xl` |

### Data bindings (existing APIs only)

| UI block | API |
|----------|-----|
| Greeting + plan badge | `GET /api/auth/me` → `user`, `billing` |
| Lead KPIs | `GET /api/kpis` |
| Retail KPIs | `GET /api/retail-kpis` |
| Product cards | Same + links to live routes |

---

## 6. Billing Page Layout (`/billing`)

### Reference mockup ID: **SS-WF-07**

**Benchmark mix:** HubSpot Billing settings (simplified) + ServiceNow form density.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Billing                                                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Billing & plan                                                            │
│  Manage your subscription and product access.                              │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ CURRENT PLAN                                          [ Upgrade → ]  │  │
│  │ ─────────────────────────────────────────────────────────────────  │  │
│  │  Plan          Growth                                              │  │
│  │  Status        Active                                              │  │
│  │  Period ends   21 July 2026                                        │  │
│  │                                                                    │  │
│  │  PRODUCT ACCESS                                                    │  │
│  │  ✓ LeadEdge360                                                     │  │
│  │  ✓ RetailEdge360                                                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ NEED TO CHANGE PLAN?                                               │  │
│  │  Visit pricing to upgrade or contact sales for Scale.              │  │
│  │  [ View pricing ]  → /pricing                                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### States

| State | UI |
|-------|-----|
| Loading | Skeleton lines in plan card |
| Active subscription | As wireframe |
| No subscription (`billingStatus: none`) | Plan: Starter (default); CTA “Subscribe” → `/pricing` |
| 401 unsigned | Redirect `/signin` (client-side, existing pattern) |

**Out of scope:** Invoice table, payment history, cancel flow (no APIs).

### `/billing/success` (existing page — shell only in later phase)

```
        [✓]
   Payment successful
   Welcome to Growth

   ┌─────────────────┐
   │ Plan · Status   │
   │ Products enabled│
   └─────────────────┘

   [ Go to dashboard → ]  /leadedge360 or /dashboard
```

Uses `AppShell` + same header/sidebar as other app routes.

---

## 7. Production Product Pages (shell context)

### LeadEdge360 SS-WF-08 · RetailEdge360 SS-WF-09

Phase 1 does **not** restructure inner CRM/retail content — only defines chrome around existing pages.

```
┌─ AppShell chrome (sidebar + header) ─────────────────────────────────────┐
│  Breadcrumb: LeadEdge360                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  [Existing leadedge360 page content — KPIs, charts, table]        │ │
│  │  (SiteShell wrapper removed; container padding normalized)         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

**Visual tweak when wrapped:** Remove duplicate top marketing nav; reduce outer `py-10` to align with shell padding.

---

## 8. Mobile Layout

### Reference mockup ID: **SS-WF-10**

**Benchmark mix:** Salesforce Mobile app drawer + HubSpot collapsed header.

### Mobile wireframe (≤767px)

```
┌─────────────────────────────┐
│ [≡]    [🔍 Search…]  [👤]  │  ← h-14; breadcrumb hidden
├─────────────────────────────┤
│                             │
│   Page content              │
│   (full width)              │
│                             │
│                             │
└─────────────────────────────┘

Drawer open ([≡] tapped):
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │ Product switcher        │ │
│ ├─────────────────────────┤ │
│ │ Dashboard               │ │
│ │ LeadEdge360             │ │
│ │ RetailEdge360           │ │
│ │ Billing                 │ │
│ └─────────────────────────┘ │
│         (overlay dim)       │
└─────────────────────────────┘
```

| Element | Mobile behavior |
|---------|-----------------|
| Sidebar | Off-canvas sheet via `SidebarTrigger` |
| Breadcrumbs | Hidden; page title inside content (`h1`) |
| Search | Full width between trigger and avatar |
| Product switcher | Inside drawer header |
| Tables (Lead/Retail) | Horizontal scroll unchanged |
| Bottom nav | **Not in Phase 1** (drawer only — avoids new routes) |

### Breakpoints

| Breakpoint | Sidebar | Header |
|------------|---------|--------|
| `< 768px` | Drawer | Compact |
| `768–1023px` | Collapsed icon rail optional | Full search |
| `≥ 1024px` | Expanded 240px default | Breadcrumbs + search |

---

## 9. Component → Mockup Mapping (Phase 1 scope)

Phase 1 implements **shell components only** (no page moves yet):

| Mockup | File(s) to update on approval |
|--------|-------------------------------|
| SS-WF-02 Sidebar | `app-nav.js`, `AppShell.jsx` |
| SS-WF-03 Header | `DashboardHeader.jsx` |
| SS-WF-04 Product switcher | `ProductSwitcher.jsx` |
| SS-WF-05 User menu | `DashboardHeader.jsx` |
| SS-WF-06 Dashboard | Phase 2 — `dashboard/page.js` |
| SS-WF-07 Billing | Phase 2 — `billing/page.js` |
| SS-WF-10 Mobile | `sidebar.jsx` + header responsive classes |

---

## 10. Approval Checklist

Sign off each item before Phase 1 implementation:

- [ ] **SS-WF-02** Sidebar groups and production-only links approved
- [ ] **SS-WF-03** Header layout (56px, search center, breadcrumbs) approved
- [ ] **SS-WF-04** Product switcher dropdown content approved
- [ ] **SS-WF-05** User menu items approved (incl. Upgrade → `/pricing`)
- [ ] **SS-WF-06** Dashboard layout approved for Phase 2 build
- [ ] **SS-WF-07** Billing page layout approved for Phase 2 build
- [ ] **SS-WF-10** Mobile drawer pattern approved
- [ ] Flat app background (no marketing gradients in AppShell) approved
- [ ] No placeholder `/app/*` routes in navigation confirmed

**Approver:** _______________  
**Date:** _______________

---

## 11. Screenshot Capture Guide (post-implementation)

After Phase 1–3 implementation, capture for design regression:

| ID | Viewport | URL |
|----|----------|-----|
| SS-IMP-01 | 1440×900 | `/dashboard` with AppShell |
| SS-IMP-02 | 1440×900 | `/leadedge360` — no marketing nav |
| SS-IMP-03 | 1440×900 | `/billing` |
| SS-IMP-04 | 390×844 | Mobile drawer open |
| SS-IMP-05 | 1440×900 | Product switcher dropdown open |

Store under `docs/screenshots/phase1/` (create on implementation).

---

## 12. Phase 1 Implementation Preview (after approval)

On approval, Phase 1 will **only**:

1. Update `WORKSPACE_NAV` to SS-WF-02 link set  
2. Update `ProductSwitcher` to SS-WF-04  
3. Update `DashboardHeader` to SS-WF-03 / SS-WF-05  
4. Update breadcrumbs for production paths  
5. Remove stub `/app/*` links from shell components  
6. Flatten AppShell content background  

**Will not** (until Phase 2+): move pages off `SiteShell`, create `/dashboard` or `/billing` routes, or change APIs.

---

*Mockup document only. No application code, APIs, Mongo collections, authentication, or billing logic was modified.*
