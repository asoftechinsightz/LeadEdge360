# LeadEdge360 — Success Metrics Baseline

**Version:** 1.0  
**Purpose:** Weekly tracked metrics — **baseline snapshot** and ongoing collection template.  
**Rule:** Use platform APIs/UI only. Mark **NOT CAPTURED** until authenticated tenant session provides values.

**Baseline captured:** 3 August 2026, 04:24 UTC (platform probes + documentation state)

---

## Collection sources

| Source | Auth | Tenant-scoped |
|--------|------|---------------|
| `GET /api/kpis` | Session cookie | Yes |
| `GET /api/retail-kpis` | Session cookie | Yes |
| `GET /api/metrics` | Public (when deployed) | Platform aggregate |
| `GET /api/health` | Public | Platform |
| Dashboard UI | Session | Yes |
| CS observation | Manual | Yes |

---

## Weekly metrics table

| Metric | API / UI field | Baseline (Tenant #1) | Baseline (platform) | Notes |
|--------|----------------|----------------------|---------------------|-------|
| **Leads** (total) | `kpis.total` | **NOT CAPTURED** | `leads_created_total: 0` | Metrics = cumulative platform counter |
| **Qualified leads** | `kpis.qualified` | **NOT CAPTURED** | — | Qualified + Proposal + Won statuses |
| **Opportunities** | `opportunities_won_total` (metrics) | **NOT CAPTURED** | `0` | Counter on `/api/metrics`; no separate Opportunity UI in Phase-1 |
| **Proposals** | `byStatus` → Proposal count | **NOT CAPTURED** | — | From `kpis` response |
| **Customers** (Won) | `kpis.won` | **NOT CAPTURED** | — | Status = Won |
| **Lost** | `byStatus` Lost | **NOT CAPTURED** | — | For funnel completeness |
| **AI usage — engine** | Lead `engine` | **NOT CAPTURED** | — | `llm` vs Hybrid |
| **AI usage — AEO Score** | Dashboard AEO row | **NOT CAPTURED** | — | Client-computed |
| **AI usage — avg score** | `kpis.avgScore` | **NOT CAPTURED** | — | |
| **User activity** | CS login log / `active_users_24h` | **NOT CAPTURED** | `0` | Platform 24h counter |
| **Pipeline value** | Sum of lead `budget` | **NOT CAPTURED** | — | Field on lead model; no UI aggregate KPI |
| **Revenue / MRR** | `mrr_inr` (metrics) | **NOT CAPTURED** | `0` | Tenant revenue **NOT CAPTURED** |
| **Customer health** | `CUSTOMER_HEALTH_MODEL.md` tier | **NOT CAPTURED** | — | Composite |
| **Hot leads** | `kpis.hot` | **NOT CAPTURED** | — | |
| **Conversion %** | `kpis.conversion` | **NOT CAPTURED** | — | |
| **Retail SKUs** | `retail-kpis.total` | **NOT CAPTURED** | — | If RetailEdge licensed |
| **At-risk inventory ₹** | `retail-kpis.atRiskValue` | **NOT CAPTURED** | — | |

---

## Funnel snapshot template (weekly)

Copy each week after authenticated `GET /api/kpis`:

```
Week of: ___________
total: __
qualified: __
byStatus: New __ | Contacted __ | Qualified __ | Proposal __ | Won __ | Lost __
hot: __
won: __
conversion: __%
avgScore: __
bySource: [paste or summarize]
byTerritory: [paste or summarize]
```

---

## Platform health snapshot (ops — weekly)

```
Date/time: ___________
/api/health ok: __
database.ok: __
pilotMode: __
checkoutEnabled: __
smtp.ready: __
/api/metrics:
  active_tenants: __
  active_users_24h: __
  leads_created_total: __
  opportunities_won_total: __
  mrr_inr: __
  process_uptime_seconds: __
```

**Observed 03 Aug 2026:** `ok: true`, Mongo connected, `active_tenants: 0`, `active_users_24h: 0`, all cumulative counters `0`, `mrr_inr: 0`, uptime `155028` s.

---

## AEO baseline template (weekly)

```
AEO Score: __
Business Completeness: __%
FAQ count: __ / 5
Local Visibility: __%
Review Health: __
Recommendations acted: __
```

**Tenant #1 AEO baseline:** **NOT CAPTURED**

---

## Ownership

| Metric family | Owner | Cadence |
|---------------|-------|---------|
| CRM funnel | CS | Weekly |
| AEO | CS | Weekly |
| Platform health | Ops | Weekly |
| Commercial (MRR, renewal) | CS + Finance | Monthly |

**Roll-up:** `WEEKLY_BUSINESS_REVIEW.md` · `TENANT1_SUCCESS_DASHBOARD.md`

---

## Related

- `EXECUTIVE_KPI_GUIDE.md`  
- `COMMERCIAL_VALIDATION_TOOLKIT.md` §1
