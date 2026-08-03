# Tenant #1 — Success Dashboard

**Program:** LeadEdge360 Pilot Business Execution  
**Tenant:** #1 (pilot designation)  
**As-of:** 3 August 2026, 04:24 UTC  
**Pilot URL:** `https://app.asoftechinsightz.com`  
**Evidence rule:** Observed data only. Tenant-specific CRM data **not available** without authenticated session.

---

## Data availability legend

| Label | Meaning |
|-------|---------|
| **Observed** | Captured from API/docs with timestamp |
| **NOT CAPTURED** | No tenant-level authenticated evidence |
| **Platform** | Global pilot metrics (not Tenant #1–specific) |

---

## 1. Business Summary

| Field | Value | Source |
|-------|-------|--------|
| Tenant name | **NOT CAPTURED** | No authenticated Tenant #1 profile |
| Industry / segment | **NOT CAPTURED** | |
| Plan (billing) | **NOT CAPTURED** | `/api/auth/me` not run for Tenant #1 |
| Pilot status | **On hold** for guided kickoff | `PO_CUSTOMER_READINESS_REPORT.md` |
| Platform health | **Observed** — `ok: true`, `status: pilot`, Mongo connected | `GET /api/health` 03 Aug 04:24 UTC |
| Contact (platform) | Enquiry@asoftechinsightz.com | `/api/health` `pilot.contactEmail` |

**Tenant #1 business outcomes (leads, wins, revenue):** **NOT CAPTURED**

---

## 2. Adoption

| Metric | Tenant #1 | Platform (observed) | Source |
|--------|-----------|---------------------|--------|
| Active users (24h) | **NOT CAPTURED** | `0` | `/api/metrics` 03 Aug 04:24 UTC |
| Active tenants | **NOT CAPTURED** | `0` | `/api/metrics` |
| Admin login validated | **NOT CAPTURED** | AUTHENTICATED VALIDATION PENDING | `runtime-handover/03_AUTHENTICATED_VALIDATION_CHECKLIST.md` |
| Onboarding kit started | **NOT CAPTURED** | Docs ready | `CUSTOMER_ONBOARDING_KIT.md` |
| Profile completeness (AEO) | **NOT CAPTURED** | UI unvalidated on live | Auth validation pending |
| Weekly login cadence | **NOT CAPTURED** | | |

---

## 3. Lead Funnel

**Tenant #1 (`GET /api/kpis` per org):** **NOT CAPTURED** (401 without session; no tenant export)

| Stage | Platform metric | Observed (global) | Tenant #1 |
|-------|-----------------|-------------------|-----------|
| Leads created (cumulative) | `asoftech_leads_created_total` | `0` | **NOT CAPTURED** |
| Total leads (tenant) | `kpis.total` | — | **NOT CAPTURED** |
| New | `byStatus` New | — | **NOT CAPTURED** |
| Contacted | `byStatus` Contacted | — | **NOT CAPTURED** |
| Qualified | `kpis.qualified` | — | **NOT CAPTURED** |
| Proposal | `byStatus` Proposal | — | **NOT CAPTURED** |
| Won | `kpis.won` | — | **NOT CAPTURED** |
| Lost | `byStatus` Lost | — | **NOT CAPTURED** |
| Hot leads | `kpis.hot` | — | **NOT CAPTURED** |
| Conversion % | `kpis.conversion` | — | **NOT CAPTURED** |

**Lead sources / territories:** **NOT CAPTURED** (`bySource`, `byTerritory`)

---

## 4. Revenue Funnel

| Metric | Tenant #1 | Platform (observed) | Notes |
|--------|-----------|---------------------|-------|
| Won customers (count) | **NOT CAPTURED** | `opportunities_won_total: 0` | Metrics API; not tenant-scoped in probe |
| MRR (INR) | **NOT CAPTURED** | `asoftech_mrr_inr: 0` | `/api/metrics` |
| POS transactions | **NOT CAPTURED** | `pos_transactions_total: 0` | Retail-related counter |
| Pipeline value (sum `budget`) | **NOT CAPTURED** | Field exists on lead model | No tenant lead export |
| Razorpay checkout | Unavailable (effective) | `checkoutEnabled: false` | `/api/health` pilot.billing |
| Revenue (tenant) | **NOT CAPTURED** | | |

---

## 5. Customer Health

**Tenant #1 health score:** **NOT CAPTURED** — see scoring model in `CUSTOMER_HEALTH_MODEL.md` (apply when KPIs available).

| Signal | Tenant #1 | Evidence |
|--------|-----------|----------|
| Health tier | **NOT CAPTURED** | |
| AEO Score | **NOT CAPTURED** | |
| Follow-ups due | **NOT CAPTURED** | |
| Escalations open | **NOT CAPTURED** | |

**Platform risk indicators (observed):** Zero active users/tenants in metrics probe; pilot app up but no validated tenant activity in captured data.

---

## 6. AI Usage

| Signal | Tenant #1 | Platform / docs |
|--------|-----------|-----------------|
| Scoring engine (LLM vs Hybrid) | **NOT CAPTURED** | `EMERGENT_LLM_KEY` presence **not verified** on VPS |
| AEO LLM drafts used | **NOT CAPTURED** | |
| Lead AI scores issued | **NOT CAPTURED** | |
| Retail AI repredicts | **NOT CAPTURED** | |
| Rule-based recommendations viewed | **NOT CAPTURED** | |

**Capability (RC):** Hybrid scoring always; LLM when key set (`docs/aeo/AEO_AI_RECOMMENDATION_CATALOG.md`).

---

## 7. Risks

| # | Risk | Evidence | Severity |
|---|------|----------|----------|
| R1 | No Tenant #1 operational data captured | This dashboard | **High** |
| R2 | Authenticated validation not executed | `runtime-handover/03` PENDING | **High** |
| R3 | AEO on live unconfirmed | Infra SSH blocked; no container proof | **High** |
| R4 | Deploy parity diverged | `runtime-reconciliation/05` | **High** |
| R5 | `/billing` 404 on live | HTTP probe 2 Aug | **Medium** |
| R6 | Razorpay/SMTP not configured | `/api/health` 03 Aug | **Medium** |
| R7 | Profile sessionStorage only | Onboarding kit docs | **Low** (documented) |

---

## 8. Open Actions

| # | Action | Owner | Status |
|---|--------|-------|--------|
| A1 | Complete Infrastructure checklist (SSH) | Ops | **Open** |
| A2 | Execute authenticated validation + screenshots | CS | **Open** |
| A3 | Populate this dashboard from `GET /api/kpis` after Tenant #1 login | CS | **Blocked** |
| A4 | Record first Tenant #1 lead funnel baseline | CS | **NOT STARTED** |
| A5 | Weekly update via `WEEKLY_BUSINESS_REVIEW.md` | CS + PO | **NOT STARTED** |

**Full register:** `EXECUTIVE_ACTION_REGISTER.md`

---

## Update cadence

Refresh Tenant #1 sections after each authenticated CS session. Copy platform metrics from `/api/metrics` and tenant KPIs from `/api/kpis` (authenticated). Do not estimate missing fields.

**Related:** `SUCCESS_METRICS_BASELINE.md` · `WEEKLY_BUSINESS_REVIEW.md`
