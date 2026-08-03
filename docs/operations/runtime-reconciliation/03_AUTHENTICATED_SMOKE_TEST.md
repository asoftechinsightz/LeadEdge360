# WS3 — Authenticated Smoke Test

**Tenant:** #1 (pilot)  
**Date:** 2 August 2026  
**Production modified:** **No**

---

## 1. Status

# **AUTHENTICATED VALIDATION PENDING**

Authenticated smoke test was **not executed** in this reconciliation pass.

---

## 2. Why validation was not performed

| Blocker | Detail |
|---------|--------|
| Credentials | Tenant #1 administrator credentials were **not authorized** for automated submission to live auth endpoints |
| Session access | No pre-existing session cookie or JWT provided to validation agent |
| SSH | Cannot run in-container or local curl with ops session from validation host |

**Reference credentials** exist in `docs/POST_DEPLOY_CHECKLIST.md` (seed admin) for **manual ops execution only** — not used here.

---

## 3. Unauthenticated probes (context only)

| Check | Result | Notes |
|-------|--------|-------|
| `/signin` | 200 | Login page loads |
| `/dashboard` | 200 | May render shell without workspace session |
| `/leadedge360` | 200 | ~17 KB HTML |
| `/api/leads` | 401 | Auth required |
| `/api/kpis` | 401 | Auth required |

These do **not** substitute for authenticated module validation.

---

## 4. Smoke test checklist (ops / CS — manual)

Execute after login; capture screenshots to **internal CS storage** (not product repo):

| # | Test | Pass? | Screenshot |
|---|------|-------|------------|
| 1 | Login (Tenant #1 admin) | ☐ | ☐ |
| 2 | Dashboard loads | ☐ | ☐ |
| 3 | LeadEdge360 workspace | ☐ | ☐ |
| 4 | AEO widget visible | ☐ | ☐ |
| 5 | Five AEO KPI cards | ☐ | ☐ |
| 6 | Growth recommendations panel | ☐ | ☐ |
| 7 | Lead create (CRUD) | ☐ | ☐ |
| 8 | Lead rescore / intelligence | ☐ | ☐ |
| 9 | Opportunity module (if UI exists) | ☐ | ☐ |
| 10 | Proposal (status or module) | ☐ | ☐ |
| 11 | Timeline / notes on lead | ☐ | ☐ |
| 12 | Follow-ups | ☐ | ☐ |

### Scope notes

- **Opportunity, Timeline, Notes** as full modules may not exist in LeadEdge360 v1 CRM — mark N/A if absent (see `docs/aeo/post-deployment/03_REGRESSION_REPORT.md`).
- **Proposal** in v1 is lead **status**, not a separate module.

---

## 5. Screenshots

| Status |
|--------|
| **None captured** — pending authenticated session |

Recommended filenames for CS:

- `pilot-2026-08-02-dashboard-aeo.png`
- `pilot-2026-08-02-leadedge360.png`
- `pilot-2026-08-02-lead-detail-score.png`

---

## 6. WS3 verdict

**BLOCKED** — Authenticated validation required before Customer Success can certify Tenant #1 readiness.

---

## Related

- [05_CUSTOMER_SUCCESS_READINESS.md](../live-validation/05_CUSTOMER_SUCCESS_READINESS.md)  
- [08_BUSINESS_GROWTH_PLAYBOOK.md](../../aeo/post-deployment/08_BUSINESS_GROWTH_PLAYBOOK.md)
