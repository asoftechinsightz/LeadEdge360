# Permission Matrix

**Audit date:** 22 June 2026

---

## 1. Roles

### 1.1 Canonical RBAC (`lib/billing/roles.js`)

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | `*` (all) |
| `ORG_ADMIN` | `crm`, `proposals`, `invoices`, `revenue` |
| `SALES_MANAGER` | `crm`, `proposals` |
| `SALES_EXECUTIVE` | `crm` |
| `FINANCE` | `invoices`, `revenue` |
| `PARTNER` | `partner_dashboard` |

### 1.2 Runtime role aliases (`lib/rbac.js`)

| Stored `user.role` | Normalized to |
|--------------------|---------------|
| `admin` | `ORG_ADMIN` |
| `manager` | `SALES_MANAGER` |
| `user`, `agent` | `SALES_EXECUTIVE` |
| `superadmin` | `SUPER_ADMIN` |
| `finance` | `FINANCE` |
| `partner` | `PARTNER` |

`SUPER_ADMIN` bypasses all role-list checks.

---

## 2. Admin Roles API

**Endpoint:** `GET /api/admin/roles`  
**Access:** JWT + `user.role` in `['admin', 'superadmin']` (raw strings)

**Static response (not DB-backed):**

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Tenant administrator | `['*']` |
| `manager` | Sales manager | `leads.*`, `followups.*`, `dashboard.read`, `whatsapp.send`, `admin.users` |
| `agent` | Sales agent | `leads.read`, `leads.write`, `followups.*`, `dashboard.read`, `whatsapp.send` |

**Mismatch:** Admin API uses dot-notation (`leads.read`). Canonical RBAC uses coarse strings (`crm`, `proposals`). Settings UI displays admin API data, not `lib/billing/roles.js`.

---

## 3. Menu Matrix

**Source:** `components/suite/nav-config.ts` → `SUITE_NAV_GROUPS`

| Menu group | Items | Visible to |
|------------|-------|------------|
| Dashboard | `/dashboard` | All authenticated users |
| Sales | `/leads`, `/opportunities` | All authenticated users |
| CRM | `/proposals`, `/invoices` | All authenticated users |
| Marketing | `/campaigns`, `/growth/business-card` | All authenticated users |
| Analytics | `/analytics`, `/revenue` | All authenticated users |
| AI Workspace | 9× `/leadedge360/*` | All authenticated users |
| Administration | `/settings`, `/payments` | All authenticated users |

**Product switcher:**

| Product | Default href |
|---------|--------------|
| LeadEdge360 | `/dashboard` |
| RetailEdge360 | `/retailedge360` |

**Frontend gating:** **None.** Sidebar renders all groups for every logged-in user. No `useFeatureFlag()`, no role-based menu filtering.

---

## 4. Route Access Matrix

### 4.1 Frontend (client-side)

| Route type | Guard | Role check | Plan check |
|------------|-------|------------|------------|
| Suite pages (`SuiteRouteLayout`) | JWT in `localStorage` | No | No |
| Marketing (`SiteShell`) | None | No | No |
| `/c/[slug]` public card | None | No | No |
| `/signin`, `/splash` | None | No | No |

**Auth flow (`SuiteAuthProvider`):**

1. Read `accessToken` from `localStorage`
2. If missing → `redirectToSignIn(pathname)`
3. Parse `currentUser` (name, email, picture — **role not in context type**)
4. No subscription or permission validation on client

### 4.2 Backend API

| Module | JWT | Tenant (`orgId`) | Plan | RBAC permission | Feature flag |
|--------|-----|------------------|------|-----------------|--------------|
| CRM (leads, opps, analytics) | Yes | Yes | No* | `crm` | No |
| Proposals | Yes | Yes | GROWTH+ | `crm` | No |
| Revenue / Invoices | Yes | Yes | GROWTH+ | **None** | No |
| Payments / Subscriptions | Yes | Yes | GROWTH+ | **None** | No |
| Customers | Yes | Yes | GROWTH+ | **None** | No |
| Partners API | Yes | Yes | PRO/ENTERPRISE (+ aliases) | **None** | No |
| Growth / Business Card | Yes | Yes | STARTER+ | `crm` | `business_card` |
| Media upload | Yes | Yes | STARTER+ | `crm` | `business_card` |
| Public card API | No | No | No | No | No |
| Portal API | Portal JWT | Yes | No | `portal_customer` | No |
| Admin roles/users | Yes | Yes | No | `admin`/`superadmin` only | No |

\*Most CRM routes do not call `requirePlan()` — plan enforcement is inconsistent.

### 4.3 Plan tiers (`lib/billing/plan-features.js`)

| Plan | Growth features (sample) |
|------|--------------------------|
| `STARTER` | `business_card`, basic CRM |
| `BUSINESS_GROWTH` | + `qr_engine`, `reviews`, `whatsapp_pro` |
| `PROFESSIONAL` | + `ai_assistant`, `review_automation` |
| `ENTERPRISE` | Full feature set |

**Enforcement:** `hasFeatureForOrg()` used only in `guardGrowthRequest()` (business card). Other features are defined but not API-gated.

---

## 5. Role × Menu × Route Matrix

| Role | Expected access (design) | Actual frontend | Actual API |
|------|--------------------------|-----------------|------------|
| `ORG_ADMIN` | Full suite | Full nav, all routes | CRM + proposals + revenue (partial RBAC) |
| `SALES_MANAGER` | CRM, proposals | Full nav | `crm`, `proposals` on guarded routes |
| `SALES_EXECUTIVE` | CRM only | Full nav | `crm` |
| `FINANCE` | Invoices, revenue | Full nav | Revenue APIs — **no `invoices`/`revenue` permission check** |
| `PARTNER` | Partner dashboard | Full nav | Partners API — **no `partner_dashboard` check** |
| `SUPER_ADMIN` | All | Full nav | Bypass |

---

## 6. Permission Gaps (audit findings)

| # | Gap | Severity |
|---|-----|----------|
| 1 | Two permission systems (canonical vs admin API) | High |
| 2 | No frontend RBAC — any token sees all screens | High |
| 3 | `FINANCE` permissions unused on revenue/invoice APIs | Medium |
| 4 | `PARTNER` permission unused on partner APIs | Medium |
| 5 | Nav not filtered by plan feature flags | Medium |
| 6 | `SUITE_AUTH_GUARD_PATHS` out of sync with layouts | Low |
| 7 | Client auth is token-presence only | Medium |
| 8 | No server middleware page protection | Medium |

---

## 7. Access Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
│ SuiteRouteLayout → JWT required → NO role/plan enforcement   │
│ SiteShell / /c/[slug] → public                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API                                                  │
│ JWT + orgId + requireRole(crm|…) + requirePlan (some routes) │
│ hasFeatureForOrg (business_card only)                        │
│ Portal: separate JWT realm                                   │
└─────────────────────────────────────────────────────────────┘
```

---

*See [UI_GAP_REPORT.md](./UI_GAP_REPORT.md) for planned permission UI (Sprint 5 `useFeatureFlag`).*
