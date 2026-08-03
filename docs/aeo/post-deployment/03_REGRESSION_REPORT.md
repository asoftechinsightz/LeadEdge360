# Workstream 3 — CRM Regression Validation

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Validation date:** August 2026  
**Principle:** Zero regression on **existing** LeadEdge360 v1 capabilities

---

## 1. Executive summary

| Category | Regression? | Notes |
|----------|-------------|-------|
| Core lead CRM (Phase-1 baseline) | **NO** (code audit) | AEO adds composition only |
| Modules not in v1 product | **N/A** | Opportunity, Invoice, Payment, Customer 360 not in codebase |
| Live pilot `/leadedge360` | **INVESTIGATE** | 500 on external HTTP probe |

**WS3 verdict:** **CONDITIONAL PASS** — no code regressions identified in Phase-1 diff scope; live 500 requires ops check.

---

## 2. Regression matrix — PO checklist vs product baseline

### Implemented in LeadEdge360 v1 (validate on pilot)

| Workflow | API / UI | Phase-1 touch? | Expected | Code audit |
|----------|----------|----------------|----------|------------|
| Lead Management | `GET/POST/PATCH /api/leads`, table UI | None on APIs | Unchanged | **PASS** |
| Lead Assignment | `assignedTo` on leads, agent filter | None | Unchanged | **PASS** |
| Lead Intelligence | `aiScore`, rescore, reasons UI | `scoring.js` adds separate `runAeoPrompt`; `aiScore` prompt unchanged | Unchanged | **PASS** |
| Dashboard KPIs | `GET /api/kpis`, CRM charts | Additional fetches same endpoints | Unchanged responses | **PASS** |
| Follow-ups (web) | Nested in `GET /api/leads/{id}` | None | Unchanged | **PASS** |
| WhatsApp deep links | `wa.me` in lead table | None | Unchanged | **PASS** |
| Status pipeline | New → Won/Lost including Proposal | None | Unchanged | **PASS** |
| Billing workspace | `/billing` | None | Unchanged | **PASS** |
| RetailEdge360 | `/retailedge360` | None | Unchanged | **PASS** |

### Not in LeadEdge360 v1 (out of regression scope)

| PO item | Product status | WS3 handling |
|---------|----------------|--------------|
| Opportunity (module) | Not implemented | **N/A** — not a regression |
| Proposal (module) | Status stage only | **N/A** |
| Invoice | Billing via Razorpay; no CRM invoice module | **N/A** |
| Payment | Razorpay checkout | **N/A** |
| Customer 360 | Not implemented | **N/A** |
| Timeline | Lead detail fields only | **N/A** |
| Notes | `message` / lead fields | **N/A** |

Customer Success should not report these as “broken by AEO” — they were never in Tenant #1 pilot scope.

---

## 3. Code change impact (static)

| File | Change type | CRM risk |
|------|-------------|----------|
| `app/api/[[...path]]/route.js` | **Not modified** in AEO Phase-1 | None |
| `lib/scoring.js` | Added `runAeoPrompt`; `aiScore` body unchanged | Low |
| `leadedge360/page.js` | Shared `KpiCard` + AEO strip | Low — additive UI |
| `dashboard/page.js` | Added `AeoGrowthEngine` section | Low — additive UI |

---

## 4. Pilot smoke test script (Tenant #1)

Execute after authenticated login on deployed revision:

```
☐ Create lead → appears in list with AI score
☐ PATCH status Qualified → KPI qualified count updates
☐ Rescore lead → score/label updates, toast success
☐ WhatsApp icon opens wa.me link
☐ Territory / status filters work
☐ Charts load (trend, source pie, territory bar)
☐ New lead dialog POST succeeds
☐ Retail KPIs on /dashboard still load
☐ Navigation: Dashboard, LeadEdge360, Billing — no new nav items
```

---

## 5. Live probe finding

| Observation | Impact |
|-------------|--------|
| `GET https://app.asoftechinsightz.com/leadedge360` → **500** | Possible deploy/runtime issue **unrelated to AEO** or stale revision — **ops ticket required** |

---

## 6. WS3 verdict

**CONDITIONAL PASS** — Phase-1 changes are additive; core CRM APIs untouched. **Condition:** resolve live `/leadedge360` 500 and complete authenticated smoke script on pilot.

---

## Related

- [POST_DEPLOY_CHECKLIST.md](../../POST_DEPLOY_CHECKLIST.md)  
- [AEO_PHASE1_RELEASE_VALIDATION_REPORT.md](../AEO_PHASE1_RELEASE_VALIDATION_REPORT.md)
