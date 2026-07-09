# Launch War Room — 2026-06-28T23:22:15.063Z

**Deploy tag:** `v1.0.0-rc3-pilot` · **API:** http://127.0.0.1:3000/api

## Pilot gate

| Check | Status |
|-------|--------|
| PAT verdict | **FAILED** |
| Promotion allowed | ❌ NO |
| **Recommendation** | **HOLD — run npm run production:acceptance on VPS until PASSED** |

## Technical KPIs

| KPI | Status | Value | Target |
|-----|--------|-------|--------|
| Uptime | 🔴 | degraded | ≥99.9% |
| API latency | 🔴 | 0ms | <300ms p95 |
| Error rate | 🟡 | normal | <5% |
| Database | 🔴 | unknown | connected |
| Backup | 🔴 | n/ah ago | ≤48h |
| Active alerts | 🟢 | 9 rules | configured |

## Business KPIs

| KPI | Value | Period |
|-----|-------|--------|
| New organizations | — | total active |
| Active users | — | 24h |
| Leads created | — | 24h |
| Opportunities won | — | 24h |
| Retail POS transactions | — | 24h |
| MRR (INR) | — | active subscriptions |
| Customer retention | —% | manual |

## Financial KPIs (manual weekly update)

| KPI | Value (INR) |
|-----|-------------|
| Cash in bank | — |
| Monthly burn | — |
| MRR | — |
| Accounts receivable | — |
| New contracts signed | — |

## Product readiness

| Product | Web SaaS | Mobile |
|-------|----------|--------|
| LeadEdge360 | READY — pilot (100% CRM parity) | READY — pilot sideload / internal track (point API_BASE_URL to production) |
| RetailEdge360 | READY — pilot (POS cash/UPI/card on web) | READY — pilot (barcode + Razorpay checkout) |

---
*Update financials in `docs/war-room/financial-overrides.json`. Run daily during pilot: `npm run launch:warroom`*