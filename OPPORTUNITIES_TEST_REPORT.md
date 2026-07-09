# Opportunities Module — Test Report

**Sprint:** Opportunities Testing  
**Date:** 22 June 2026  
**Prerequisite:** Leads module signed off  
**Status:** **PASS — 15/15 (100%)**  
**Campaign testing:** Not started (per instruction)

---

## Executive Summary

Opportunities module underwent route validation, API inventory, MongoDB verification, and full workflow retesting. **14 defects** were identified and fixed. All pass criteria are met.

| Pass criteria | Result |
|---------------|--------|
| Create Opportunity | **PASS** |
| Edit Opportunity | **PASS** |
| Delete Opportunity | **PASS** |
| Move Stage | **PASS** |
| Won Workflow | **PASS** |
| Lost Workflow | **PASS** |
| Revenue Sync | **PASS** |
| Pipeline Analytics | **PASS** |
| Timeline History | **PASS** |

---

## 1. Route Validation

| Route | Component | Purpose | API type |
|-------|-----------|---------|----------|
| `/leadedge360/opportunities` | `OpportunitiesPage` | Pipeline board + KPIs | **REAL** |
| `/opportunities` | Redirect → `/leadedge360/opportunities` | Legacy alias | N/A |

**Shell navigation:** Linked from `nav-config.ts` under Core CRM.

---

## 2. API Inventory

| Method | Endpoint | Handler | Used by |
|--------|----------|---------|---------|
| `GET` | `/api/opportunities` | `app/api/opportunities/route.js` | List opportunities |
| `POST` | `/api/opportunities` | `app/api/opportunities/route.js` | Create opportunity |
| `GET` | `/api/opportunities/[id]` | `app/api/opportunities/[id]/route.js` | Detail + activities |
| `PATCH` | `/api/opportunities/[id]` | `app/api/opportunities/[id]/route.js` | Edit opportunity |
| `DELETE` | `/api/opportunities/[id]` | `app/api/opportunities/[id]/route.js` | Delete opportunity |
| `GET` | `/api/opportunities/pipeline` | `app/api/opportunities/pipeline/route.js` | Pipeline board data |
| `POST` | `/api/opportunities/move` | `app/api/opportunities/move/route.js` | Unified stage move |
| `GET` | `/api/opportunities/dashboard` | `app/api/opportunities/dashboard/route.js` | Pipeline analytics KPIs |
| `POST` | `/api/opportunities/update-stage` | `app/api/opportunities/update-stage/route.js` | Stage update (legacy) |
| `POST` | `/api/opportunities/update-value` | `app/api/opportunities/update-value/route.js` | Value update |
| `POST` | `/api/opportunities/create` | `app/api/opportunities/create/route.js` | Create (legacy alias) |
| `POST` | `/api/opportunities/auto-create` | Scanner auto-create | Background |
| `POST` | `/api/opportunities/[id]/proposal` | Proposal generation | Proposals module |

**Related (Leads sync):** `POST /api/leads/:id/status` still used by mobile; web pipeline uses `/api/opportunities/move`.

**Classification:** All opportunity endpoints are **REAL API** (MongoDB). No mock/`leadEdgeApi` usage.

---

## 3. MongoDB Verification

| Check | Result | Detail |
|-------|--------|--------|
| `MONGO_URL` | **Confirmed** | `mongodb://127.0.0.1:27017` |
| `DB_NAME` | **Confirmed** | `asoftech` |
| `opportunities` collection | **PASS** | Tenant-scoped by `orgId` |
| `opportunity_activities` collection | **PASS** | Timeline per opportunity |
| `revenue` collection | **PASS** | Created on Won workflow |
| Demo seed | **PASS** | 6+ opportunities for `demo-org` |

---

## 4. Issues Found & Fixes

### OPP-01 — No tenant scoping on opportunity APIs

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `dashboard`, `update-stage`, `update-value`, `create` routes queried/updated without `resolveTenant()` or `orgId` filter |
| **Fix applied** | All routes now use `resolveTenant(request)` and `orgId` in every query/update via `lib/opportunities/service.js` |
| **Retest** | **PASS** — dashboard returns tenant-scoped counts only |

### OPP-02 — Pipeline showed leads without linked opportunities

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `OpportunitiesPage` loaded `/sales/leads` and filtered by status; `opportunityId` rarely set on leads |
| **Fix applied** | New `GET /api/opportunities/pipeline` calls `getPipelineItems()` which auto-creates/links opportunities via `ensureOpportunityForLead()` |
| **Retest** | **PASS** — pipeline items include `opportunityId` |

### OPP-03 — Drag-and-drop did not sync opportunity stage

| Field | Detail |
|-------|--------|
| **Severity** | P0 |
| **Root cause** | `PipelineBoard` called `POST /leads/:id/status` then conditionally `update-stage` only if `item.opportunityId` existed (usually false) |
| **Fix applied** | Unified `POST /api/opportunities/move` updates lead status, opportunity stage, timeline, and revenue in one transaction |
| **Retest** | **PASS** — move stage returns synced lead + opportunity |

### OPP-04 — Negotiation stage rejected by API

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | `PipelineBoard` had Negotiation column but `STATUSES` in `route.js` and `constants.js` omitted `Negotiation` |
| **Fix applied** | Added `Negotiation` to `STATUSES` arrays; centralized stage map in `lib/opportunities/stages.js` |
| **Retest** | **PASS** — Negotiation moves accepted |

### OPP-05 — No revenue sync on Won

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Won drag only updated lead status; no `revenue` collection insert |
| **Fix applied** | `syncRevenueOnWon()` in service inserts deduplicated `revenue` record with `source: 'opportunity_won'` |
| **Retest** | **PASS** — revenue record created with correct amount |

### OPP-06 — No opportunity activity timeline

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | `logActivity()` existed but was never called from web pipeline or CRUD |
| **Fix applied** | `logOpportunityActivity()` called on create, update, move; `GET /opportunities/[id]` returns `activities` |
| **Retest** | **PASS** — 2+ activities after create + edit |

### OPP-07 — No lead status history on pipeline move

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Pipeline used raw status POST without `lead_status_history` / `lead_timeline` writes |
| **Fix applied** | `movePipelineStage()` records both collections (same pattern as Leads stabilization) |
| **Retest** | **PASS** — timeline events on lead after move |

### OPP-08 — Missing CRUD APIs

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Only fragmented `create`, `update-stage`, `update-value` routes existed; no list/get/delete |
| **Fix applied** | `GET/POST /api/opportunities`, `GET/PATCH/DELETE /api/opportunities/[id]` |
| **Retest** | **PASS** — create, edit, delete all return 200/201 |

### OPP-09 — Dashboard analytics not tenant-scoped

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | `countDocuments()` without `orgId` filter |
| **Fix applied** | `getOpportunityDashboard()` with `orgId`, pipeline value aggregation, `byStage` breakdown |
| **Retest** | **PASS** — analytics KPIs load correctly |

### OPP-10 — No demo opportunity seed

| Field | Detail |
|-------|--------|
| **Severity** | P2 |
| **Root cause** | `seedDemoLeadsIfEmpty` ran but opportunities were never created for pipeline leads |
| **Fix applied** | `seedDemoOpportunitiesIfEmpty()` wired into `lib/demo-seed.js` via `getDb()` |
| **Retest** | **PASS** — 6 demo-org opportunities on fresh DB |

### OPP-11 — Pipeline grid layout mismatch

| Field | Detail |
|-------|--------|
| **Severity** | P2 |
| **Root cause** | 7 columns defined but `xl:grid-cols-6` |
| **Fix applied** | Changed to `xl:grid-cols-7`; columns imported from shared `PIPELINE_COLUMNS` |
| **Retest** | **PASS** (visual) |

### OPP-12 — Lost workflow incomplete

| Field | Detail |
|-------|--------|
| **Severity** | P1 |
| **Root cause** | Lost stage updated lead only when opportunity existed; no `LOST` stage on opportunity |
| **Fix applied** | `movePipelineStage()` sets `stage: 'LOST'`, `leadStatus: 'Lost'`, logs activity |
| **Retest** | **PASS** — `stage=LOST` confirmed |

### OPP-13 — `update-stage` / `update-value` bypassed service layer

| Field | Detail |
|-------|--------|
| **Severity** | P2 |
| **Root cause** | Direct Mongo updates without validation or activity logging |
| **Fix applied** | Routes delegate to `updateOpportunityRecord()` |
| **Retest** | **PASS** |

### OPP-14 — KPI showed lead count instead of pipeline value

| Field | Detail |
|-------|--------|
| **Severity** | P2 |
| **Root cause** | Fourth KPI used `pipelineItems.length` client-side |
| **Fix applied** | Dashboard returns `pipelineValue`; page shows `₹` formatted aggregate |
| **Retest** | **PASS** |

---

## 5. Retest Execution

**Command:**

```powershell
node scripts/start-mongo-memory.mjs          # if no local MongoDB
npm run dev -- --port 3004
$env:RETEST_API_BASE="http://127.0.0.1:3004/api"
node scripts/opportunities-retest.mjs
```

**Result (22 Jun 2026):**

```
PASS  Auth login
PASS  MongoDB connectivity
PASS  Collections exist
PASS  Opportunity seed data — 6 demo-org opportunities
PASS  Pipeline analytics — total=6
PASS  Pipeline load — items=6
PASS  Create opportunity
PASS  Edit opportunity
PASS  Timeline history — activities=2
PASS  Move stage
PASS  Won workflow — stage=WON
PASS  Revenue sync — amount=80000
PASS  Revenue collection — 2 won revenue records
PASS  Lost workflow — stage=LOST
PASS  Delete opportunity

=== 15/15 passed ===
```

---

## 6. Workflow Evidence

| Workflow | Endpoint | Verified |
|----------|----------|----------|
| Load pipeline | `GET /api/opportunities/pipeline` | Yes — auto-linked opportunities |
| Pipeline analytics | `GET /api/opportunities/dashboard` | Yes — total/won/lost/pipelineValue |
| Create | `POST /api/opportunities` | Yes — standalone + from lead |
| Edit | `PATCH /api/opportunities/:id` | Yes — company, expectedValue |
| Delete | `DELETE /api/opportunities/:id` | Yes — clears lead.opportunityId |
| Move stage | `POST /api/opportunities/move` | Yes — Qualified transition |
| Won | `POST /api/opportunities/move` status=Won | Yes — stage=WON + revenue |
| Lost | `POST /api/opportunities/move` status=Lost | Yes — stage=LOST |
| Revenue sync | `revenue` collection | Yes — `source: opportunity_won` |
| Timeline | `GET /api/opportunities/:id` → activities | Yes — create + edit logged |
| Lead timeline | `lead_timeline` + `lead_status_history` | Yes — on move |

---

## 7. Architecture (Post-Fix)

```
/leadedge360/opportunities
├── OpportunitiesPage
│   ├── GET /api/opportunities/dashboard     → KPIs
│   └── GET /api/opportunities/pipeline      → board items
└── PipelineBoard
    └── POST /api/opportunities/move         → unified workflow
         ├── leads.status update
         ├── opportunities.stage update
         ├── lead_timeline + lead_status_history
         ├── opportunity_activities
         └── revenue (on Won)
```

**Service layer:** `lib/opportunities/service.js`  
**Stage mapping:** `lib/opportunities/stages.js`

---

## 8. Sign-Off

| Gate | Status |
|------|--------|
| All pass criteria | **100% (9/9)** |
| Automated retest | **15/15** |
| P0/P1 issues resolved | Yes |
| Campaign testing | **Not started** |
| Ready for Campaign sprint | **Awaiting approval** |

---

## 9. Files Changed

- `lib/opportunities/service.js` (new)
- `lib/opportunities/stages.js` (expanded)
- `lib/opportunities/create-opportunity.js` (delegates to service)
- `lib/demo-seed.js`
- `app/api/opportunities/route.js` (new)
- `app/api/opportunities/[id]/route.js` (new)
- `app/api/opportunities/pipeline/route.js` (new)
- `app/api/opportunities/move/route.js` (new)
- `app/api/opportunities/dashboard/route.js`
- `app/api/opportunities/update-stage/route.js`
- `app/api/opportunities/update-value/route.js`
- `app/api/opportunities/create/route.js`
- `app/api/[[...path]]/route.js` (Negotiation status)
- `components/leadedge360/constants.js`
- `components/leadedge360/PipelineBoard.js`
- `app/leadedge360/opportunities/page.js`
- `scripts/opportunities-retest.mjs` (new)
- `OPPORTUNITIES_TEST_REPORT.md` (this file)
