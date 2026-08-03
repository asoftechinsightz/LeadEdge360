# Sprint 19 — Navigation Architecture V2 (Production-Only)

**Product:** AsoftechInsightz v1.2.0  
**Date:** June 2026  
**Status:** Approved navigation contract — documentation only (no code changes)  
**Supersedes:** Navigation sections in `SPRINT19_UX_MODERNIZATION_PLAN.md` and `components/layout/enterprise-nav.js`

---

## 1. Purpose

Sprint 19 V1 proposed an enterprise navigation tree with workspaces (`/app/crm`, `/app/sales`, `/app/partners`, etc.), hub groupings (Sales Hub, Growth Engine, Partner Hub, Administration), and links to marketing pages (`/products`, `/about`, `/pricing`).

**Problem:** Most of those targets are **not production-ready**:

| Target type | Examples | Issue |
|-------------|----------|-------|
| Stub routes | `/app`, `/app/crm`, `/app/sales`, `/app/revenue`, `/app/partners` | `WorkspacePlaceholder` only — no API wiring |
| Marketing routes | `/`, `/about`, `/products`, `/blog`, `/contact` | Static content; not app workspaces |
| Phantom features | Tasks, Follow-ups (web), Commissions, Users admin, Growth Engine | No web UI or JWT-only APIs |
| Duplicate / misleading links | Proposals → `/leadedge360`, Subscriptions → `/pricing` | Same route as sibling items; `subscriptions` collection never written |

**V2 rule:** Every sidebar menu item must land on a route whose page **already calls live APIs** and renders **real tenant-scoped data**. No placeholders, no marketing detours, no “coming soon” shells.

---

## 2. Production Readiness Scoring

| Score | Meaning |
|-------|---------|
| **10** | Full web UI + full CRUD/read APIs + cookie auth path + tenant isolation |
| **8–9** | Core UI complete; minor gaps (layout shell, demo mode, unused API surface) |
| **6–7** | Functional but partial (billing without subscription records, search without destination page) |
| **4–5** | Backend exists; **no cookie-authenticated web UI** (mobile JWT only) |
| **1–3** | Stub page, static marketing, or broken assets |
| **0** | Not implemented |

---

## 3. Revised Navigation Architecture

### 3.1 Design principles

1. **Two product surfaces only** — LeadEdge360 and RetailEdge360 are the only data-driven application pages in production today.
2. **App shell is chrome, not a destination** — `AppShell` (`/app/*`) provides sidebar, search, and user menu but **must not** list stub workspace routes until those pages ship with API integration.
3. **Product switcher ≠ workspace tree** — Switcher jumps between the two live product dashboards.
4. **Billing stays out of primary sidebar** until `/pricing` (or a successor) is mounted inside `AppShell` and uses `GET /api/billing/plans`.
5. **Mobile-only APIs are not nav targets** — Follow-ups, admin users, notifications, WhatsApp send, dashboard revenue require JWT; web uses Emergent cookie auth.

### 3.2 Approved navigation tree (V2)

```
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT SWITCHER (sidebar header)                          │
│    ● LeadEdge360  →  /leadedge360                           │
│    ● RetailEdge360  →  /retailedge360                       │
├─────────────────────────────────────────────────────────────┤
│  PRODUCTS                                                   │
│    LeadEdge360 CRM          /leadedge360                    │
│    RetailEdge360 Inventory  /retailedge360                  │
├─────────────────────────────────────────────────────────────┤
│  SHELL UTILITIES (header — not sidebar destinations)        │
│    Global search            GET /api/leads?q=               │
│    User menu                GET /api/auth/me, POST logout   │
└─────────────────────────────────────────────────────────────┘
```

**Total sidebar destinations: 2** (plus product switcher aliases to the same two routes).

### 3.3 Shell layout recommendation

| Surface | Layout | Rationale |
|---------|--------|-----------|
| `/leadedge360` | Migrate to `AppShell` (Phase 2) | Production page today uses `SiteShell` |
| `/retailedge360` | Migrate to `AppShell` (Phase 2) | Same |
| `/app/*` stubs | Remove from nav; keep route hidden or redirect | No production data |
| `/pricing` | Keep on `SiteShell`; link from user menu only after AppShell migration | Functional billing but marketing chrome |

---

## 4. Approved Menu Items (Production-Ready)

### 4.1 Product switcher — LeadEdge360

| Field | Value |
|-------|-------|
| **Label** | LeadEdge360 |
| **Route** | `/leadedge360` |
| **Page** | `app/leadedge360/page.js` |
| **Production readiness** | **9 / 10** |

**Existing API dependencies (called from page today):**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads` | List/filter leads (`territory`, `status`, `role`, `agent`, pagination) |
| POST | `/api/leads` | Create lead + AI score + auto-assign |
| PATCH | `/api/leads/:id` | Update status / assignment |
| POST | `/api/leads/:id/rescore` | Re-run AI scoring |
| GET | `/api/kpis` | Dashboard KPIs, charts, trend, leaderboard |
| GET | `/api/agents` | Agent directory (hardcoded response) |

**APIs available but not wired in this page UI:**

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/leads/:id` | Detail + `lead_activities` + `follow_ups` |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/status` | Status change with activity log |
| POST | `/api/leads/:id/assign` | Assign with activity log |
| GET | `/api/leads/sources` | Distinct sources |

**MongoDB collections used (via APIs above):**

| Collection | Operations | Tenant key |
|------------|------------|------------|
| `leads` | Read, insert, update | `orgId` |
| `lead_activities` | Read (detail API only) | `orgId` |
| `follow_ups` | Read (detail API only) | `orgId` |
| `orgs` | Implicit via `resolveTenant` | — |
| `users` | Implicit when authenticated | `orgId` |

**Deductions (−1):** Uses `SiteShell` not `AppShell`; unauthenticated users operate on shared `demo-org`; agent list is not stored in MongoDB.

**In-page capabilities (not separate nav routes until Phase 2 split):**

- Lead inbox table
- KPI strip + 14-day trend chart
- Source pie, territory bar, agent leaderboard
- New lead dialog, lead detail dialog, WhatsApp/call/email actions
- Role switcher (query-param filter to API)

---

### 4.2 Product switcher — RetailEdge360

| Field | Value |
|-------|-------|
| **Label** | RetailEdge360 |
| **Route** | `/retailedge360` |
| **Page** | `app/retailedge360/page.js` |
| **Production readiness** | **9 / 10** |

**Existing API dependencies:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | List SKUs for tenant |
| POST | `/api/products` | Add SKU + AI shelf-life prediction |
| POST | `/api/products/:id/repredict` | Re-run RevenueShield AI |
| DELETE | `/api/products/:id` | Remove SKU |
| GET | `/api/retail-kpis` | Inventory value, risk breakdown, category chart |

**MongoDB collections used:**

| Collection | Operations | Tenant key |
|------------|------------|------------|
| `products` | Read, insert, update, delete | `orgId` |
| `orgs` | Implicit via `resolveTenant` | — |

**Deductions (−1):** `SiteShell` layout; demo-org seeding for anonymous users.

**In-page capabilities:**

- SKU catalogue table sorted by risk
- Retail KPI strip
- Category bar chart + risk pie chart
- Add SKU dialog, product detail dialog, re-predict, delete

---

### 4.3 Sidebar — LeadEdge360 CRM

| Field | Value |
|-------|-------|
| **Label** | LeadEdge360 CRM |
| **Route** | `/leadedge360` |
| **Production readiness** | **9 / 10** |

Same APIs and collections as §4.1. This is the **same route** as the switcher entry — listed once in config, referenced by switcher + sidebar.

---

### 4.4 Sidebar — RetailEdge360 Inventory

| Field | Value |
|-------|-------|
| **Label** | RetailEdge360 Inventory |
| **Route** | `/retailedge360` |
| **Production readiness** | **9 / 10** |

Same APIs and collections as §4.2.

---

### 4.5 Shell utility — Global search (header)

| Field | Value |
|-------|-------|
| **Label** | Global search |
| **Route** | N/A (utility; results link to `/leadedge360`) |
| **Component** | `components/layout/DashboardHeader.jsx` |
| **Production readiness** | **7 / 10** |

**Existing API dependencies:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads?q=&pageSize=8` | Debounced typeahead search |

**MongoDB collections used:**

| Collection | Operations |
|------------|------------|
| `leads` | Read (regex search on name, email, phone, company) |

**Deductions (−3):** Only mounted on `/app/*` today; `/app` dashboard is a stub; selecting a result navigates to `/leadedge360` without deep-linking to the lead.

---

### 4.6 Shell utility — User menu (header)

| Field | Value |
|-------|-------|
| **Label** | User menu / Sign out |
| **Route** | N/A |
| **Production readiness** | **8 / 10** |

**Existing API dependencies:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/me` | Current user + `isDemo` flag |
| POST | `/api/auth/logout` | Clear `emergent_session` cookie |

**MongoDB collections used:**

| Collection | Operations |
|------------|------------|
| `users` | Read (by email from Emergent session) |
| `orgs` | Read implicit via user.orgId |

**Deductions (−2):** Dropdown links to stub `/app` and legacy dashboards; no org plan display (`orgs.plan` not exposed on `/api/auth/me`).

---

## 5. Excluded Menu Items (V1 / Enterprise Nav)

Items that **must not** appear in Sprint 19 V2 navigation.

### 5.1 Stub `/app` workspace routes

| Proposed label | Proposed route | Readiness | Reason |
|----------------|----------------|-----------|--------|
| Dashboard | `/app` | **1 / 10** | Static placeholder cards; no API calls |
| CRM | `/app/crm` | **1 / 10** | `WorkspacePlaceholder` |
| Sales | `/app/sales` | **1 / 10** | `WorkspacePlaceholder` |
| Revenue | `/app/revenue` | **1 / 10** | `WorkspacePlaceholder` |
| Partners | `/app/partners` | **1 / 10** | `WorkspacePlaceholder` |
| CRM → Tasks | `/app/crm` | **1 / 10** | No tasks API or UI |
| CRM → Follow-ups | `/app/crm` | **4 / 10** | `follow_ups` collection + `/api/followups` exist — **JWT mobile only** |
| Sales → Opportunities | `/app/sales` | **1 / 10** | Stub route |
| Sales → Proposals | `/leadedge360` | **9 / 10** route but **misleading label** — use parent CRM item only |
| Sales → Invoices | `/pricing` | See §5.3 | Not invoice UI |
| Revenue → Revenue | `/app/revenue` | **1 / 10** | Stub |
| Revenue → Payments | `/pricing` | See §5.3 | |
| Revenue → Subscriptions | `/pricing` | **5 / 10** | `subscriptions` collection never written |
| Partners → Partners | `/app/partners` | **1 / 10** | Stub |
| Partners → Commissions | `/app/partners` | **0 / 10** | Not implemented |
| Admin → Users | `/signin` | **4 / 10** | `/api/admin/users` is JWT-only |
| Admin → Organization | `/about` | **1 / 10** | Static marketing |
| Admin → Branding | `/products` | **1 / 10** | Static marketing |

### 5.2 Growth Engine (entire section excluded)

| Proposed label | Proposed route | Readiness | Reason |
|----------------|----------------|-----------|--------|
| Website Audit | `/products` | **1 / 10** | Marketing page; no audit API |
| Scanner Jobs | `/retailedge360` | **9 / 10** route but **wrong product metaphor** | Retail SKU page ≠ growth scanner |
| Results | `/retailedge360` | Duplicate of above | Collapse into RetailEdge360 when intentional |

**Verdict:** Remove Growth Engine group entirely. No matching product or API family exists.

### 5.3 Marketing & billing routes (excluded from app sidebar)

| Route | Readiness | API | Collections | Nav policy |
|-------|-----------|-----|-------------|------------|
| `/pricing` | **7 / 10** | `POST /api/billing/checkout`, `POST /api/billing/verify`, `GET /api/auth/me` | `payments`, `orgs` | **User menu link only** — uses `SiteShell`; plans hardcoded in page (does not call `GET /api/billing/plans`) |
| `/contact` | **6 / 10** | `POST /api/contact` | `contact_requests` | Marketing/support — not app nav |
| `/signin` | **8 / 10** | Redirect to `/api/auth/login` | `users`, `orgs` on callback | Auth entry — not workspace nav |
| `/`, `/about`, `/products`, `/blog`, `/download` | **1 / 10** | None | None | Marketing — excluded |

---

## 6. Deferred Navigation (API-ready, UI not ready)

These items from Sprint 19 V1 **can** ship as nav entries once a **real page** exists (no new APIs required unless noted).

| Future menu item | Suggested route | APIs already available | Collections | Blocker |
|------------------|-----------------|------------------------|-------------|---------|
| Executive dashboard | `/app` | `GET /api/kpis`, `GET /api/retail-kpis`, `GET /api/auth/me` | `leads`, `products`, `orgs` | Build dashboard page with parallel fetch |
| CRM pipeline board | `/app/crm/pipeline` | `GET /api/leads`, `PATCH /api/leads/:id` | `leads` | Extract + group-by-status UI from `leadedge360` |
| CRM analytics | `/app/crm/analytics` | `GET /api/kpis` | `leads` | Extract charts from `leadedge360` |
| Lead detail + activities | `/app/crm/leads/[id]` | `GET /api/leads/:id` | `leads`, `lead_activities`, `follow_ups` | New page; API exists |
| Sales team leaderboard | `/app/sales/team` | `GET /api/kpis`, `GET /api/agents` | `leads` (aggregated) | New page |
| Agent pipeline | `/app/sales` | `GET /api/leads?role=agent&agent=` | `leads` | New page with agent filter |
| Retail catalogue (migrated) | `/app/revenue/retail` | Same as `/retailedge360` | `products` | Move page under AppShell |
| Plan catalog | `/app/revenue/plans` | `GET /api/billing/plans` | `orgs` | New page; wire existing plans API |
| Billing checkout | `/app/revenue/plans` or `/pricing` in AppShell | `POST /api/billing/checkout`, `POST /api/billing/verify` | `payments`, `orgs` | Remount pricing in AppShell |
| Follow-ups inbox | `/app/crm/followups` | `GET/POST /api/followups` | `follow_ups` | **Requires cookie-auth bridge** to mobile routes |
| Admin users | `/app/admin/users` | `GET/POST/PATCH/DELETE /api/admin/users` | `users` | **JWT only today** |
| WhatsApp conversations | `/app/crm/whatsapp` | `GET /api/whatsapp/conversation/:leadId` | `whatsapp_messages` | JWT only |

**Minimum readiness to add nav item:** Page exists under `AppShell`, calls listed APIs on mount, score ≥ **8**.

---

## 7. Comparison: V1 vs V2 route map

### V1 (SPRINT19_UX_MODERNIZATION_PLAN — rejected for nav)

```
/app, /app/crm, /app/crm/pipeline, /app/sales, /app/revenue, /app/partners
/leadedge360 → redirect /app/crm
/retailedge360 → redirect /app/revenue/retail
```

### V2 (approved)

```
Product switcher + sidebar:
  /leadedge360   ← sole LeadEdge360 destination
  /retailedge360 ← sole RetailEdge360 destination

Redirects (optional, Phase 2):
  /app           → /leadedge360   (until real dashboard ships)
  /app/crm       → /leadedge360
  /app/revenue/retail → /retailedge360

Do NOT redirect /leadedge360 away until replacement page is ≥ 8/10 ready.
```

---

## 8. `enterprise-nav.js` remediation checklist

When implementing V2 in code (future sprint task):

| Action | Item |
|--------|------|
| Remove | All `/app/*` workspace entries except after pages ship |
| Remove | Growth Engine, Partner Hub, Administration groups |
| Remove | Links to `/products`, `/about`, `/signin` as workspace items |
| Remove | Duplicate children pointing at same route with different labels |
| Keep | `/leadedge360`, `/retailedge360` only |
| Collapse | CRM / Sales / Revenue groups into two product links |
| Defer | Billing link until mounted in AppShell + uses `GET /api/billing/plans` |

---

## 9. Auth & tenant notes (all nav destinations)

| Concern | Behavior |
|---------|----------|
| Unauthenticated web | `resolveTenant` → `demo-org`; demo data seeded |
| Authenticated web | Emergent cookie → `users` + `orgs` |
| Mobile JWT APIs | **Not reachable** from current web nav surfaces |
| Product gating (`retailEnabled`) | Not enforced on web routes |

---

## 10. Summary

| Metric | V1 proposal | V2 approved |
|--------|-------------|-------------|
| Sidebar destinations | 20+ | **2** |
| Stub routes in nav | 9 | **0** |
| Marketing routes in nav | 6 | **0** |
| Production-ready score (min) | 1 | **9** |
| Distinct Mongo collections in nav path | 16 (claimed) | **3** (`leads`, `products`, `orgs` + implicit `users`) |

**Bottom line:** Sprint 19 navigation should be a **two-product switcher** (LeadEdge360 + RetailEdge360) pointing at `/leadedge360` and `/retailedge360` until Phase 2 splits those monolith pages into AppShell workspaces with real API wiring. Everything else stays in the deferred table.

---

*Document only — no repository code was modified.*
