# LeadEdge360 — Sales Pipeline Review

**Version:** 1.0  
**As-of:** 3 August 2026  
**Scope:** Executive sales pipeline view — **documented evidence only**

---

## Executive summary

**Tenant #1 sales pipeline (CRM):** **NOT CAPTURED** — no authenticated access to `GET /api/kpis` or lead table for Tenant #1.

**Platform-level signals:** Cumulative metrics counters are **zero**; active tenants and users **zero** in `/api/metrics` probe (03 Aug 04:24 UTC). This indicates **no validated pilot tenant activity** in captured operational data, not necessarily empty database.

**GTM pipeline (new customers):** **NOT CAPTURED** — no CRM export of prospect accounts in documentation.

---

## 1. Pipeline Status

### Tenant #1 (in-product pipeline)

| Stage | Count | Value (₹) | Source |
|-------|-------|-----------|--------|
| New | **NOT CAPTURED** | — | `byStatus` |
| Contacted | **NOT CAPTURED** | — | |
| Qualified | **NOT CAPTURED** | — | `kpis.qualified` |
| Proposal | **NOT CAPTURED** | — | `byStatus` |
| Won | **NOT CAPTURED** | — | `kpis.won` |
| Lost | **NOT CAPTURED** | — | |
| **Total leads** | **NOT CAPTURED** | — | `kpis.total` |
| **Hot** | **NOT CAPTURED** | — | `kpis.hot` |
| **Conversion %** | **NOT CAPTURED** | — | `kpis.conversion` |

### Platform metrics (observed — not tenant-scoped)

| Counter | Value | Timestamp |
|---------|-------|-----------|
| `asoftech_leads_created_total` | 0 | 03 Aug 04:24 UTC |
| `asoftech_opportunities_won_total` | 0 | Same |
| `asoftech_active_tenants` | 0 | Same |
| `asoftech_mrr_inr` | 0 | Same |

### By source / territory

**NOT CAPTURED** for Tenant #1 (`bySource`, `byTerritory`).

---

## 2. Lost Opportunities

| Field | Tenant #1 |
|-------|-----------|
| Lost count | **NOT CAPTURED** |
| Lost reasons | **NOT CAPTURED** (no loss-reason field in Phase-1 UI) |
| Lost vs total % | **NOT CAPTURED** |

**CS action when data available:** Review Lost status leads weekly; document reasons in CS notes (external).

---

## 3. Proposal Conversion

| Metric | Tenant #1 | Definition |
|--------|-----------|------------|
| Leads in Proposal | **NOT CAPTURED** | `byStatus` Proposal |
| Proposal → Won rate | **NOT CAPTURED** | Won / (Proposal + Won) over period |
| Stuck Proposal &gt; 14d | **NOT CAPTURED** | CS audit on `updatedAt` |
| Platform `opportunities_won_total` | 0 (observed) | Metrics API — not proposal-stage specific |

**In-product proposal model:** Status **Proposal** in CRM — no separate proposal document module (`CUSTOMER_ONBOARDING_KIT.md` §7).

---

## 4. Next Actions

| # | Action | Owner | Depends on |
|---|--------|-------|------------|
| 1 | Run authenticated validation; export first KPI snapshot | CS | Tenant #1 credentials |
| 2 | Populate pipeline table in this doc from `/api/kpis` | CS | Auth |
| 3 | Identify Proposal-stage leads for follow-up | CS | Auth |
| 4 | Do not promise Opportunity module UI | Sales | Phase-1 scope |
| 5 | Use `/pricing` not `/billing` for commercial | Sales | Live 404 on `/billing` |

---

## 5. High Priority Accounts

### Tenant #1 (customer pipeline)

| Account / lead | Stage | Score | Owner | Next step |
|----------------|-------|-------|-------|-----------|
| **NOT CAPTURED** | | | | |

**Priority rule when data exists:** Hot label → Proposal stage → highest `score`.

### GTM prospects (new sales)

| Account | Stage | Owner | Next step |
|---------|-------|-------|-----------|
| **NOT CAPTURED** | | | |

---

## Charts available in product (when authenticated)

| Chart | Data | Location |
|-------|------|----------|
| 14-day trend | `trend[]` leads + won | `/leadedge360` |
| Sources pie | `bySource` | `/leadedge360` |
| Territories bar | `byTerritory` | `/leadedge360` |
| Agent performance | `byAgent` | `/leadedge360` |

---

## Related

- `SALES_PLAYBOOK.md`  
- `TENANT1_SUCCESS_DASHBOARD.md` § Lead Funnel  
- `SUCCESS_METRICS_BASELINE.md`
