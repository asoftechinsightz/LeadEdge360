# LeadEdge360 — Executive Action Register

**Version:** 1.0  
**As-of:** 3 August 2026  
**Source:** Runtime handover, reconciliation matrix, PO readiness report, Tenant #1 dashboard gaps.

**Legend:** P1 = blocks Tenant #1 execution · P2 = blocks expansion · P3 = monitor · **Status:** Open / In Progress / Closed

---

## Customer Success

| ID | Priority | Action | Owner | Due | Evidence required | Status |
|----|----------|--------|-------|-----|-------------------|--------|
| CS-01 | P1 | Execute `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` with Tenant #1 admin | CS | PO sets | Signed checklist + screenshots | **Open** |
| CS-02 | P1 | Populate `TENANT1_SUCCESS_DASHBOARD.md` from authenticated `/api/kpis` | CS | +2d after CS-01 | Dashboard markdown updated | **Open** |
| CS-03 | P1 | Start weekly `WEEKLY_BUSINESS_REVIEW.md` cadence | CS | Week 1 post CS-01 | WBR filed | **Open** |
| CS-04 | P2 | Complete `TRAINING_ACADEMY.md` certification for kickoff CS lead | CS Lead | Before Tenant #2 | Sign-off row | **Open** |
| CS-05 | P2 | Adjust scripts: no `/billing` until 404 resolved | CS + Sales | Immediate | Messaging audit | **Open** |
| CS-06 | P3 | Document sessionStorage profile limitation in kickoff | CS | With CS-01 | Kickoff deck | **Open** |

---

## Operations

| ID | Priority | Action | Owner | Due | Evidence required | Status |
|----|----------|--------|-------|-----|-------------------|--------|
| OPS-01 | P1 | Complete `02_INFRASTRUCTURE_CHECKLIST.md` via authorized SSH (`VPS_SSH_KEY`) | Infrastructure | PO sets | Git SHA, Docker image, logs | **Open** |
| OPS-02 | P1 | Verify AEO paths inside `asoftech-app` container | Infrastructure | With OPS-01 | `docker exec` output in checklist | **Open** |
| OPS-03 | P1 | Close SSH access gap (firewall / `asoftech_ci` key) | Infrastructure | ASAP | Successful SSH log | **Open** |
| OPS-04 | P2 | Confirm `EMERGENT_LLM_KEY` in `.env` if AI SLA promised | Infrastructure | Pre-kickoff | Presence grep (no values) | **Open** |
| OPS-05 | P2 | Configure Razorpay keys if checkout required | Infrastructure | PO decision | `/api/health` billing true | **Open** |
| OPS-06 | P2 | Configure SMTP or document dry_run for CS | Infrastructure | PO decision | `/api/health` smtp | **Open** |
| OPS-07 | P3 | Weekly platform metrics snapshot | Ops | Weekly | `SUCCESS_METRICS_BASELINE.md` platform block | **Open** |
| OPS-08 | P3 | n8n flows active for Tenant #1 channels | Ops | Pre-lead ingest | POST_DEPLOY §5 checks | **NOT CAPTURED** |

---

## Commercial

| ID | Priority | Action | Owner | Due | Evidence required | Status |
|----|----------|--------|-------|-----|-------------------|--------|
| COM-01 | P1 | PO decision: authorize Tenant #1 guided kickoff after CS-01 + OPS-01 | PO | After gates | PO sign-off on readiness report | **Open** |
| COM-02 | P2 | Tenant #1 business outcomes baseline | CS | Day 7 post kickoff | `COMMERCIAL_VALIDATION_TOOLKIT.md` §1 | **NOT CAPTURED** |
| COM-03 | P2 | ROI worksheet (if numbers available) | CS | Day 30 | Toolkit §2 — **no invented ROI** | **NOT CAPTURED** |
| COM-04 | P3 | Pricing feedback collection | CS | Day 30 | Toolkit §5 | **NOT CAPTURED** |
| COM-05 | P3 | NPS survey | CS | Day 30 | Toolkit §7 | **NOT CAPTURED** |

---

## Support

| ID | Priority | Action | Owner | Due | Evidence required | Status |
|----|----------|--------|-------|-----|-------------------|--------|
| SUP-01 | P2 | Define Tenant #1 support ticket channel | CS | Pre-kickoff | Channel doc | **NOT CAPTURED** |
| SUP-02 | P3 | Status page per POST_DEPLOY §10 | Ops | Expansion | URL live | **NOT CAPTURED** |
| SUP-03 | P3 | Escalation drill (P1 path) | CS + Ops | Quarterly | Drill notes | **Open** |

---

## GTM

| ID | Priority | Action | Owner | Due | Evidence required | Status |
|----|----------|--------|-------|-----|-------------------|--------|
| GTM-01 | P2 | Hold Tenant #2 outreach until `TENANT_EXPANSION_READINESS.md` gates pass | Sales + PO | Ongoing | Expansion matrix | **Open** |
| GTM-02 | P3 | Export marketing assets from `MARKETING_ASSETS.md` to PDF/deck | Marketing | As needed | Published assets | **Open** |
| GTM-03 | P3 | Sales pipeline review weekly after Tenant #1 data | Sales | Post CS-02 | `SALES_PIPELINE_REVIEW.md` updated | **Open** |

---

## Closed / resolved (do not reopen without regression)

| ID | Action | Evidence | Closed |
|----|--------|----------|--------|
| — | CS/GTM documentation pack (10 files) | `docs/customer-success/` | 3 Aug 2026 |
| — | Pilot Business Execution docs (8 files) | This register + WS outputs | 3 Aug 2026 |
| — | HTTPS + Mongo on pilot | `/api/health` 03 Aug | Observed ongoing |

---

## Register summary

| Category | P1 Open | P2 Open | P3 Open |
|----------|---------|---------|---------|
| Customer Success | 3 | 3 | 1 |
| Operations | 3 | 3 | 2 |
| Commercial | 1 | 2 | 2 |
| Support | 0 | 1 | 2 |
| GTM | 0 | 1 | 2 |

**Next review:** Weekly WBR or PO staff meeting.

**Related:** `TENANT1_SUCCESS_DASHBOARD.md` § Open Actions · `runtime-handover/04_RUNTIME_RECONCILIATION_MATRIX.md`
