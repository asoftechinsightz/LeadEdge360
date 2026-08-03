# WS3 — LeadEdge360 Module Validation

**Pilot URL:** `https://app.asoftechinsightz.com`  
**Validation date:** 2 August 2026  
**Legend:** PASS · WARN · FAIL · AUTH REQUIRED

---

## 1. Module matrix

| Module | Route / API | Unauthenticated probe | Status | Notes |
|--------|-------------|----------------------|--------|-------|
| **Dashboard** | `/dashboard` | HTTP 200 | **PASS** | Workspace shell loads |
| **Leads** | `/leadedge360`, `/api/leads` | Page 200; API **401** | **AUTH REQUIRED** | API auth enforced |
| **Lead Intelligence** | CRM + `/api/leads/{id}/rescore` | Page 200 | **AUTH REQUIRED** | Rescore needs session |
| **Opportunities** | Product module | No dedicated route probed | **WARN** | Metrics mention `opportunities_won_total`; UI module **not verified** |
| **Proposals** | Lead status `Proposal` | CRM status only | **WARN** | Not a separate module in v1 CRM |
| **Customers** | Customer 360 | — | **WARN** | Not in LeadEdge360 v1 scope |
| **Timeline** | Lead detail | — | **AUTH REQUIRED** | Part of lead detail when logged in |
| **Notes** | Lead `message` / fields | — | **AUTH REQUIRED** | No separate notes API on web cookie path |
| **Follow-ups** | JWT `/api/followups` | Not probed with JWT | **AUTH REQUIRED** | Web embeds in lead detail only |
| **AI Growth Engine** | `/dashboard` AEO section | SSR HTML lacks AEO strings | **WARN** | AEO Phase-1 RC **not confirmed** on live bundle |
| **Executive Dashboard** | `/dashboard` KPI rows | HTTP 200 | **PASS** | Workspace overview loads |

---

## 2. Route availability (HTTP status)

| Path | Status | Time |
|------|--------|------|
| `/dashboard` | 200 | ~266 ms |
| `/leadedge360` | 200 | ~153 ms |
| `/retailedge360` | 200 | ~167 ms |
| `/billing` | **404** | ~348 ms |
| `/signin` | 200 | ~184 ms |
| `/api/leads` | **401** | ~401 ms |
| `/api/kpis` | **401** | — |
| `/api/agents` | **401** | ~1612 ms |

**401 on data APIs:** Consistent with authenticated pilot (`REQUIRE_AUTH` behavior inferred).

---

## 3. Product scope clarification

Per `docs/aeo/post-deployment/03_REGRESSION_REPORT.md` and codebase audit:

- **Opportunities, Customers, Timeline, Notes** as full modules are **not** in the local LeadEdge360 v1 CRM baseline.
- Live metrics suggest an **extended pilot binary** with opportunity counters — UI availability **unknown without auth**.

---

## 4. AI Growth Engine (AEO Phase-1)

| Check | Result |
|-------|--------|
| `AeoGrowthEngine` in approved RC | Yes (local workspace) |
| Static HTML contains `AEO` / `GROWTH ENGINE` | **No** (SSR shell only) |
| Client bundle verification | **Not completed** (requires authenticated session or ops SSH) |
| `/billing` (Phase 1 sibling route) | **404** — suggests incomplete Phase 1 route deploy |

**Status:** **WARN** — cannot mark PASS until authenticated UI confirms five AEO KPI cards and recommendation panel.

---

## 5. Authenticated validation checklist (Tenant #1 / ops)

```
☐ Login admin@asoftechinsightz.com (or Tenant #1 admin)
☐ Dashboard: workspace KPI row + AI Growth Engine section
☐ LeadEdge360: lead table, charts, rescore, WhatsApp links
☐ AEO: five KPI cards, profile panel, recommendations
☐ RetailEdge360: SKU dashboard
☐ Billing route (if expected): /billing
```

---

## 6. WS3 verdict

**AUTH REQUIRED** for full module sign-off; unauthenticated probes show **PASS** for core CRM pages, **WARN** for AEO and extended modules, **FAIL** for `/billing`.
