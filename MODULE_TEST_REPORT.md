# LeadEdge360 Module Test Report

**Phase:** Functional Testing (Frontend Freeze v1 approved)  
**Module:** 1 — Leads  
**Date:** 22 June 2026  
**Tester:** Automated API + static code audit  
**Environment:** `localhost:3002` (Next.js dev), `DEV_AUTH_BYPASS=true`, MongoDB **not running** (`ECONNREFUSED 127.0.0.1:27017`)

---

## Executive Summary

| Metric | Result |
|--------|--------|
| Routes inventoried | 3 (+ 1 shell integration) |
| API endpoints mapped | 18 |
| Mock API usage in Leads module | **None** — all real MongoDB-backed APIs |
| Auth (login) | **PASS** via dev bypass |
| Leads data operations | **BLOCKED** — all Mongo-dependent endpoints return HTTP 500 |
| Code defects found (static) | **6** (independent of Mongo availability) |
| Module ready for production | **No** — environment + backend gaps must be resolved first |

**Verdict:** Leads module cannot be signed off until MongoDB is available and P0/P1 fixes are applied. Re-test required after fixes.

---

## 1. Routes

| Route | Component | Purpose | API type |
|-------|-----------|---------|----------|
| `/leadedge360/leads` | `LeadsManagement` | List, filter, search, create lead | **REAL** |
| `/leadedge360/leads/[id]` | `LeadDetailTabs` | Lead detail with tabs | **REAL** |
| `/leads` | `redirect()` → `/leadedge360/leads` | Legacy alias | N/A |
| Shell: Global Search | `GlobalSearch` in `AppShell` | Quick lead lookup | **REAL** (`/api/lead-search`) |

**Not routed (related but out of scope for this page):**

| Artifact | Notes |
|----------|-------|
| `LeadDashboard.js` | Uses `GET /leads` (different response shape); not mounted on any route |
| `src/hooks/useLeads.ts` | Typed hook for `GET /leads`; unused by current Leads pages |

---

## 2. API Endpoints Used by Leads Module

All endpoints are **REAL API** (MongoDB + tenant-scoped). None use `leadEdgeApi` or `NEXT_PUBLIC_USE_MOCK_API`.

### List & create (`LeadsManagement`)

| Method | Endpoint | Handler | Used by |
|--------|----------|---------|---------|
| `GET` | `/api/sales/leads` | `app/api/sales/leads/route.js` → `lib/sales/leads.js` | `LeadsManagement` — paginated list |
| `POST` | `/api/leads` | `app/api/[[...path]]/route.js` | `LeadCaptureDialog` — create + AI score |

### Detail (`LeadDetailTabs` + child components)

| Method | Endpoint | Handler | Used by |
|--------|----------|---------|---------|
| `GET` | `/api/leads/:id` | catch-all `route.js` | Lead header + overview data |
| `GET` | `/api/leads/:id/timeline` | catch-all | `ActivityTimeline` |
| `GET` | `/api/leads/:id/notes` | catch-all | `LeadNotes` |
| `POST` | `/api/leads/:id/notes` | catch-all | `LeadNotes` — add note |
| `GET` | `/api/leads/:id/followups` | catch-all | `FollowupList` |
| `POST` | `/api/leads/:id/followups` | catch-all | `FollowupList` — schedule |
| `GET` | `/api/leads/:id/tasks` | catch-all | `TaskList` (read-only UI) |
| `POST` | `/api/leads/:id/tasks` | catch-all | **API exists; no UI wired** |
| `GET` | `/api/leads/:id/assignments` | catch-all | `LeadAssignments` — history |
| `POST` | `/api/leads/:id/assign` | catch-all | `LeadAssignments` — assign agent |
| `GET` | `/api/agents` | catch-all (static `AGENTS` array) | Agent dropdown |

### Shell integration

| Method | Endpoint | Used by |
|--------|----------|---------|
| `GET` | `/api/lead-search?q=` | `GlobalSearch` |

### Related (Opportunities module — shares lead data)

| Method | Endpoint | Notes |
|--------|----------|-------|
| `GET` | `/api/sales/leads` | `opportunities/page.js` loads pipeline source data |
| `POST` | `/api/leads/:id/status` | `PipelineBoard.js` — stage changes |

### Auth (prerequisite)

| Method | Endpoint | Notes |
|--------|----------|-------|
| `POST` | `/api/auth/login-password` | JWT bearer for `apiGet`/`apiPost` interceptors |

---

## 3. REAL API vs MOCK API

| Surface | Classification |
|---------|----------------|
| `LeadsManagement`, `LeadCaptureDialog`, `LeadDetailTabs`, child tabs | **REAL API** |
| `leadEdgeApi` / `src/services/api/mock/*` | **Not used** by Leads module |
| `GET /api/agents` | **REAL route** but returns **hardcoded** agent list (not DB-backed) |
| `DEV_AUTH_BYPASS` login | **In-memory dev auth** — does not bypass Mongo for lead CRUD |

---

## 4. End-to-End Workflow Testing

### Test environment

```
POST /api/auth/login-password  → 200 OK (dev bypass token)
MongoDB 127.0.0.1:27017        → ECONNREFUSED
```

### Workflow results

| # | Workflow | Steps | Expected | Result | Notes |
|---|----------|-------|----------|--------|-------|
| W1 | **Authenticate** | Login with `admin@asoftechinsightz.com` | JWT issued | **PASS** | Dev bypass; Mongo not required for login |
| W2 | **List leads** | Open `/leadedge360/leads` → `GET /sales/leads` | 200 + `items[]` | **FAIL** | HTTP 500 — `Failed to load sales leads` |
| W3 | **Paginate** | Next/Prev page controls | Page changes | **BLOCKED** | Depends on W2 |
| W4 | **Filter by status** | Select status → `GET /sales/leads?status=` | Filtered rows | **BLOCKED** | Depends on W2 |
| W5 | **Filter by label** | Select label → `GET /sales/leads?label=` | Filtered rows | **BLOCKED** | Depends on W2 |
| W6 | **Search** | Type in search box | Matches across dataset | **PARTIAL (design flaw)** | Client-side filter on **current page only**; no server `q` param on `/sales/leads` |
| W7 | **Create lead** | New lead dialog → `POST /leads` | 201 + scored lead | **FAIL** | HTTP 500 — Mongo `ECONNREFUSED` |
| W8 | **View lead detail** | Click row → `GET /leads/:id` | Lead profile loads | **BLOCKED** | No lead ID without W7 or seed data |
| W9 | **Add note** | Notes tab → `POST /leads/:id/notes` | Note persisted | **BLOCKED** | — |
| W10 | **Schedule follow-up** | Follow-ups tab → `POST /leads/:id/followups` | Follow-up created + timeline | **BLOCKED** | — |
| W11 | **View tasks** | Tasks tab → `GET /leads/:id/tasks` | Task list | **BLOCKED** | UI is read-only even when API works |
| W12 | **Assign agent** | Assignments tab → `POST /leads/:id/assign` | Lead updated + history | **FAIL (logic bug)** | Assign updates `leads` + `lead_timeline` but **not** `lead_assignments`; history tab stays empty |
| W13 | **View timeline** | Timeline tab → `GET /leads/:id/timeline` | Events after mutations | **BLOCKED** | — |
| W14 | **Global search** | Shell search → `GET /lead-search?q=` | Matching leads | **FAIL** | HTTP 500 — Mongo required |
| W15 | **Global search navigation** | Click result | Opens lead detail | **FAIL (routing bug)** | Navigates to `/leadedge360?lead={id}` — **no handler**; should be `/leadedge360/leads/{id}` |
| W16 | **Legacy alias** | Visit `/leads` | Redirect to `/leadedge360/leads` | **PASS** | Static redirect |
| W17 | **Tenant isolation** | JWT `orgId` vs lead `orgId` | Only tenant leads visible | **NOT TESTED** | Blocked by Mongo; dev user uses `demo-org` |

### API smoke test log (22 Jun 2026, port 3002)

```
PASS  POST /api/auth/login-password
FAIL  GET  /api/sales/leads?page=1&limit=5          → 500
FAIL  GET  /api/leads?page=1&pageSize=5             → 500
FAIL  GET  /api/agents                              → 500
FAIL  POST /api/leads (create)                      → 500
```

Server log: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

---

## 5. Failures Identified

### P0 — Environment / infrastructure

| ID | Failure | Impact |
|----|---------|--------|
| F-01 | **MongoDB not running locally** | All lead list, create, detail, search operations return HTTP 500 |
| F-02 | **Demo lead seed disabled** | `seedDemoLeadsIfEmpty()` wrapped in `if (false)` at `route.js:239` — fresh DB has zero leads even when Mongo is up |

### P1 — Backend logic bugs

| ID | Failure | Location | Impact |
|----|---------|----------|--------|
| F-03 | **Assignment history never populated** | `POST /leads/:id/assign` updates `leads` + `lead_timeline` only; `GET /leads/:id/assignments` reads `lead_assignments` collection which is never written | Assignments tab always shows "No assignment history" |
| F-04 | **Status history not recorded** | `POST /leads/:id/status` writes `lead_timeline` but not `lead_status_history` | `/leads/:id/activity` `statusChanges` count stays 0 |
| F-05 | **`GET /leads/:id/activity` outside `root === 'leads'` block** | `route.js:640-677` — fragile routing; missing `root === 'leads'` guard | Risk of incorrect route matching; maintenance hazard |

### P2 — Frontend / API contract gaps

| ID | Failure | Location | Impact |
|----|---------|----------|--------|
| F-06 | **Search is client-side only** | `LeadsManagement.js:37-48` | Search misses leads on other pages; large datasets unusable |
| F-07 | **No task creation UI** | `TaskList.js` — GET only | `POST /leads/:id/tasks` unreachable from UI |
| F-08 | **No status change on detail page** | `LeadDetailTabs.js` — badge only | Status changes require Opportunities pipeline drag |
| F-09 | **Dual list API shapes** | `/sales/leads` → `{ items, pages }` vs `/leads` → `{ leads, meta }` | `useLeads` hook / `LeadDashboard` incompatible with `LeadsManagement` |
| F-10 | **GlobalSearch wrong deep link** | `GlobalSearch.tsx:65` → `/leadedge360?lead=` | Search results do not open lead detail |

### P3 — Data quality

| ID | Failure | Impact |
|----|---------|--------|
| F-11 | **`GET /agents` is static** | Agent list not tenant-specific; may not match real users in `users` collection |

---

## 6. Fix Plan

### Immediate (before re-test)

| Priority | Fix | Owner | Files |
|----------|-----|-------|-------|
| P0 | Start MongoDB locally or point `MONGO_URL` to Atlas | DevOps | `.env`, infrastructure |
| P0 | Re-enable demo lead seed in development | Backend | `app/api/[[...path]]/route.js` — change `if (false)` to `if (process.env.NODE_ENV !== 'production')` for `seedDemoLeadsIfEmpty` |
| P1 | On `POST /leads/:id/assign`, insert into `lead_assignments` | Backend | `route.js` assign handler |
| P1 | On `POST /leads/:id/status`, insert into `lead_status_history` | Backend | `route.js` status handler |
| P1 | Move `GET /leads/:id/activity` inside `if (root === 'leads')` block | Backend | `route.js` |

### Short-term (Leads module completeness)

| Priority | Fix | Files |
|----------|-----|-------|
| P2 | Add server-side search to `GET /sales/leads` (`q` param) and wire `LeadsManagement` | `lib/sales/leads.js`, `LeadsManagement.js` |
| P2 | Add task creation form in `TaskList` → `POST /leads/:id/tasks` | `TaskList.js` |
| P2 | Add status selector on lead detail (or link to pipeline) | `LeadDetailTabs.js` |
| P2 | Fix `GlobalSearch` navigation → `/leadedge360/leads/{id}` | `GlobalSearch.tsx` |
| P3 | Unify list response shape (`/sales/leads` vs `/leads`) or deprecate one endpoint | API + types |

### Re-test checklist (run after fixes)

1. Start MongoDB; confirm `GET /api/sales/leads` returns seeded items for `demo-org`
2. Create lead via dialog — verify score, label, `assignedTo` in list
3. Open detail — all tabs load without 404/500
4. Add note + follow-up — verify timeline events
5. Assign agent — verify `lead.assignedTo` updates **and** assignments history shows entry
6. Change status via pipeline — verify status history count
7. Global search — result opens correct detail URL
8. Filter status/label + server search across full dataset
9. Pagination with 20+ leads

---

## 7. Component → API Map (Reference)

```
/leadedge360/leads
├── LeadsManagement
│   ├── GET /api/sales/leads
│   └── LeadCaptureDialog → POST /api/leads
└── LeadTable → link to /leadedge360/leads/:id

/leadedge360/leads/[id]
└── LeadDetailTabs
    ├── GET /api/leads/:id
    ├── GET /api/leads/:id/timeline      → ActivityTimeline
    ├── GET|POST /api/leads/:id/notes    → LeadNotes
    ├── GET|POST /api/leads/:id/followups → FollowupList
    ├── GET /api/leads/:id/tasks         → TaskList (read-only)
    ├── GET /api/leads/:id/assignments   → LeadAssignments
    ├── POST /api/leads/:id/assign       → LeadAssignments
    └── GET /api/agents                  → agent dropdown

AppShell
└── GlobalSearch → GET /api/lead-search
```

---

## 8. Next Module

**Do not proceed** until Leads re-test passes.

After Leads sign-off, next module per priority: **Opportunities** (`/leadedge360/opportunities`).

---

## Appendix: Commands for Re-Test

```powershell
# 1. Ensure MongoDB is running, then:
cd d:\AsoftechInsightz_Project\asoftech-insightz
npm run dev

# 2. Login + list leads
$login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login-password" `
  -Method POST -Body '{"email":"admin@asoftechinsightz.com","password":"ChangeMe@2025"}' `
  -ContentType "application/json"
$h = @{ Authorization = "Bearer $($login.accessToken)" }
Invoke-RestMethod -Uri "http://localhost:3000/api/sales/leads?page=1&limit=5" -Headers $h
```
