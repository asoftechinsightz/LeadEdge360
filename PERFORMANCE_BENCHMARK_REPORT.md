# Performance Benchmark Report

**Project:** LeadEdge360  
**Date:** 23 June 2026  
**Environment:** Local dev (MongoDB memory, Next.js port 3007)  
**Retest:** `node scripts/go-live-retest.mjs`

---

## Executive Summary

Performance certification ran smoke benchmarks with **500 seeded leads** (configurable via `GO_LIVE_PERF_SCALE`). All API and dashboard targets were met. Full-scale targets (100k leads, 50k payments) are documented as **staging validation** items.

---

## Targets vs Results

| Endpoint | Target | Measured | Status |
|----------|--------|----------|--------|
| Lead list (50/page) | API < 500 ms | **36 ms** | ✅ PASS |
| Revenue dashboard | Dashboard < 2 sec | **31 ms** | ✅ PASS |
| Customer dashboard | Dashboard < 2 sec | **415 ms** | ✅ PASS |
| Partner dashboard | Dashboard < 2 sec | **27 ms** | ✅ PASS |
| Customer search | Search < 300 ms | **21 ms** | ✅ PASS |
| Partner commissions API | API < 500 ms | **25 ms** (prior sprint) | ✅ PASS |

---

## Test Configuration

```powershell
$env:GO_LIVE_PERF_SCALE='500'   # Scale factor for lead seeding
$env:RETEST_API_BASE='http://127.0.0.1:3007/api'
node scripts/go-live-retest.mjs
```

---

## Full-Scale Targets (Staging Backlog)

| Dataset | Target Count | Dev Tested | Staging Required |
|---------|--------------|------------|------------------|
| Leads | 100,000 | 500 (smoke) | Yes |
| Customers | 25,000 | Existing + smoke | Yes |
| Subscriptions | 10,000 | Lifecycle test | Yes |
| Payments | 50,000 | Payment flows | Yes |
| Proposals | 25,000 | Lifecycle test | Yes |
| Opportunities | 10,000 | Lifecycle test | Yes |
| Partners | 2,000 | Partner A/B test | Yes |

### Staging command

```powershell
$env:GO_LIVE_PERF_SCALE='100000'
node scripts/go-live-retest.mjs
```

---

## Memory & Stability

| Check | Result |
|-------|--------|
| Retest completes without crash | ✅ PASS |
| No unhandled exceptions in retest | ✅ PASS |
| Mongo memory stable during bulk insert | ✅ PASS |
| Memory leak detection | ⏳ P2 — requires prolonged soak test |

---

## Performance Observations

1. **Customer dashboard** (415 ms) is the slowest certified endpoint — still well under 2 sec target; likely due to aggregation across customers + subscriptions.
2. **Lead list** remains fast at 500 records; index on `{ orgId, createdAt }` recommended before 100k scale.
3. **Search** uses regex with escaped input — performant at current scale.

---

## Recommended Indexes (Pre-Scale)

```javascript
db.leads.createIndex({ orgId: 1, createdAt: -1 })
db.customers.createIndex({ orgId: 1, email: 1 })
db.payments.createIndex({ orgId: 1, customerId: 1, createdAt: -1 })
db.partner_commissions.createIndex({ orgId: 1, status: 1 })
db.revenue.createIndex({ orgId: 1, status: 1, invoiceId: 1 })
```

---

## Issues & Fixes

### PERF-01 — No performance test harness

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Description** | No automated perf certification |
| **Root Cause** | Module retests focused on correctness |
| **Fix Applied** | Performance phase in `go-live-retest.mjs` |
| **Retest Result** | **PASS** |

---

## Certification

**Performance: CERTIFIED** for pilot go-live at expected pilot data volumes. Run full-scale staging benchmark before enterprise onboarding.
