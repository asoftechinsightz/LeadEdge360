# Leads Stabilization — Retest Report

**Sprint:** Leads Stabilization  
**Date:** 22 June 2026  
**Status:** **PASS — 16/16 (100%)**  
**Opportunities testing:** Not started (per instruction)

---

## Executive Summary

All P0/P1 Leads issues have been resolved. End-to-end API workflows pass against MongoDB with real database operations. Leads module is cleared for sign-off; proceed to Opportunities only after stakeholder approval of this report.

| Pass criteria | Result |
|---------------|--------|
| Create Lead | **PASS** |
| Edit Lead | **PASS** |
| Search Lead | **PASS** |
| Timeline | **PASS** |
| Notes | **PASS** |
| Follow-ups | **PASS** |
| Assignment History | **PASS** |
| Status History | **PASS** |
| Lead Detail Tabs | **PASS** |

---

## 1. MongoDB Connectivity

| Check | Result | Detail |
|-------|--------|--------|
| `MONGO_URL` | **Confirmed** | `mongodb://127.0.0.1:27017` (`.env`) |
| `DB_NAME` | **Confirmed** | `asoftech` |
| Connection | **PASS** | TCP + driver connect successful |
| Collections | **PASS** | `leads`, `lead_notes`, `lead_timeline`, `lead_assignments`, `lead_status_history`, `follow_ups` |
| Seed data | **PASS** | 8 demo leads for `demo-org` |

**Note:** Retest used in-memory MongoDB (`scripts/start-mongo-memory.mjs`) on port 27017 because no local MongoDB service was installed. Production/staging should use a real MongoDB instance (Atlas or self-hosted) with the same `MONGO_URL` pattern.

---

## 2. Fixes Applied

### P0 — Environment & seed

| Fix | File(s) |
|-----|---------|
| Demo lead seed re-enabled (development only) | `lib/demo-seed.js` (new), `lib/mongo.js` |
| Seed runs on every `getDb()` in dev — includes `/api/sales/leads` | `lib/mongo.js` |
| Removed dead `if (false)` seed block | `app/api/[[...path]]/route.js` |

### P1 — Assignment & status history

| Fix | File(s) |
|-----|---------|
| `POST /leads/:id/assign` now inserts `lead_assignments` record | `app/api/[[...path]]/route.js` |
| `POST /leads/:id/status` now inserts `lead_status_history` + timeline with `from`/`to` | `app/api/[[...path]]/route.js` |
| `PATCH /leads/:id` records assignment + status history when those fields change | `app/api/[[...path]]/route.js` |
| `GET /leads/:id/activity` moved inside `root === 'leads'` block | `app/api/[[...path]]/route.js` |
| Notes create timeline entry (`note_added`) | `app/api/[[...path]]/route.js` |

### Functional stabilization (pass criteria support)

| Fix | File(s) |
|-----|---------|
| Server-side search (`q` param) on `/api/sales/leads` | `lib/sales/leads.js`, `app/api/sales/leads/route.js`, `LeadsManagement.js` |
| Edit lead form (PATCH) on detail Overview tab | `LeadOverview.js`, `LeadDetailTabs.js` |
| `apiPatch` helper | `src/lib/api.ts` |
| Global Search deep link → `/leadedge360/leads/:id` | `GlobalSearch.tsx` |

---

## 3. Retest Execution

**Command:**

```powershell
# Terminal 1 — in-memory Mongo (dev only, if no local MongoDB service)
node scripts/start-mongo-memory.mjs

# Terminal 2 — dev server (fresh instance recommended after Mongo starts)
npm run dev -- --port 3003

# Terminal 3 — automated retest
$env:RETEST_API_BASE="http://127.0.0.1:3003/api"
node scripts/leads-retest.mjs
```

**Result (22 Jun 2026):**

```
PASS  Auth login
PASS  MongoDB connectivity
PASS  Collections exist
PASS  Seed data present — 8 demo-org leads
PASS  List leads — count=5
PASS  Search lead — matches=1 (q=Rahul)
PASS  Create lead
PASS  Edit lead
PASS  Lead detail tabs data
PASS  Notes
PASS  Follow-ups
PASS  Assignment action
PASS  Assignment history — records=1
PASS  Status change
PASS  Status history — records=2
PASS  Timeline — events=5

=== 16/16 passed ===
```

---

## 4. Workflow Evidence

| Workflow | Endpoint(s) | Verified |
|----------|-------------|----------|
| List + paginate | `GET /api/sales/leads` | Yes |
| Search | `GET /api/sales/leads?q=Rahul` | Yes |
| Create | `POST /api/leads` | Yes — AI score + assign |
| Edit | `PATCH /api/leads/:id` | Yes — company + status |
| Detail tabs | `GET /api/leads/:id`, timeline, notes, followups, tasks, assignments | Yes |
| Notes | `POST /api/leads/:id/notes` | Yes |
| Follow-ups | `POST /api/leads/:id/followups` | Yes |
| Assign | `POST /api/leads/:id/assign` | Yes |
| Assignment history | `GET /api/leads/:id/assignments` | Yes — 1+ records after assign |
| Status change | `POST /api/leads/:id/status` | Yes |
| Status history | `GET /api/leads/:id/status-history` | Yes — 2+ records after PATCH + POST |
| Timeline | `GET /api/leads/:id/timeline` | Yes — 5+ events |

---

## 5. Routes & API Map (unchanged)

| Route | API | Type |
|-------|-----|------|
| `/leadedge360/leads` | `GET /api/sales/leads`, `POST /api/leads` | REAL |
| `/leadedge360/leads/[id]` | `GET/PATCH /api/leads/:id`, sub-resources | REAL |
| `/leads` | Redirect alias | N/A |

---

## 6. Known Remaining Items (non-blocking)

| Item | Severity | Notes |
|------|----------|-------|
| Task creation UI | Low | `POST /leads/:id/tasks` works via API; `TaskList` is read-only |
| `GET /agents` static list | Low | Hardcoded agents, not DB users |
| Production MongoDB | Ops | Install/start real MongoDB or Atlas; remove reliance on memory server |
| Dev server Mongo cache | Ops | Restart Next.js after Mongo comes online if first connect failed |

---

## 7. Sign-Off

| Gate | Status |
|------|--------|
| P0 issues resolved | Yes |
| P1 issues resolved | Yes |
| Pass criteria 100% | Yes (16/16) |
| `LEADS_RETEST_REPORT.md` | Complete |
| Ready for Opportunities testing | **Awaiting approval** |

---

## 8. Files Changed (Stabilization Sprint)

- `lib/demo-seed.js` (new)
- `lib/mongo.js`
- `lib/sales/leads.js`
- `app/api/[[...path]]/route.js`
- `app/api/sales/leads/route.js`
- `components/leadedge360/LeadsManagement.js`
- `components/leadedge360/LeadOverview.js`
- `components/leadedge360/LeadDetailTabs.js`
- `components/suite/GlobalSearch.tsx`
- `src/lib/api.ts`
- `scripts/leads-retest.mjs` (new)
- `scripts/start-mongo-memory.mjs` (new)
- `package.json` / `package-lock.json` (`mongodb-memory-server` devDependency for local testing)
