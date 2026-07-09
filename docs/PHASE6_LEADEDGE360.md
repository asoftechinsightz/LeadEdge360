# Phase 6 — LeadEdge360 V2 Refinement

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Scope | Frontend component extraction + design-system adoption |

---

## Summary

Phase 6 refactors LeadEdge360 from monolithic `page.js` files into composable **L4 domain components** under `components/leadedge360/`, using L2 design-system primitives (`KPICard`, `PageHeader`, `LoadingState`, `EmptyState`, `Card`, `Badge`, `Button`).

**No backend or API changes.**

---

## Component inventory

| Component | Purpose |
|-----------|---------|
| `LeadDashboard` | Product command center (KPIs, analytics, quick links) |
| `LeadsManagement` | Paginated leads list screen |
| `LeadTable` | Reusable leads data grid |
| `LeadDetailTabs` | Tab shell for lead detail route |
| `LeadOverview` | Overview tab content |
| `ActivityTimeline` | Timeline events list |
| `LeadNotes` | Notes list + create |
| `FollowupList` | Follow-ups list + schedule |
| `TaskList` | Tasks from `GET /leads/:id/tasks` |
| `LeadAssignments` | Assignment history + assign action |
| `LeadAnalytics` | Charts (trend, sources, territory, agents) |
| `LeadCaptureDialog` | New lead form + AI scoring |
| `LeadFilterBar` | Role / territory / status filters |
| `PipelineBoard` | Opportunity kanban (from prior batch) |
| `constants.js` | Shared territories, statuses, chart colors |

---

## Page composition (target pattern)

```js
// app/leadedge360/page.js
import { LeadDashboard } from '@/components/leadedge360'
export default function LeadEdge360Page() {
  return <LeadDashboard />
}

// app/leadedge360/leads/page.js
import { LeadsManagement } from '@/components/leadedge360'
export default function LeadsPage() {
  return <LeadsManagement />
}
```

`app/leadedge360/page.js` reduced from **~338 lines → 7 lines**.

---

## APIs used

| Screen | Endpoints |
|--------|-----------|
| Dashboard | `/kpis`, `/leads`, `/revenue/dashboard`, `/opportunities/dashboard`, `/analytics/summary`, `/lead-scoring/dashboard` |
| Leads list | `/sales/leads` |
| Lead detail | `/leads/:id`, `/timeline`, `/notes`, `/followups`, `/tasks`, `/assignments`, `/agents` |
| Capture | `POST /leads` |
| Pipeline | `/sales/leads`, `POST /leads/:id/status`, `POST /opportunities/update-stage` |

---

## Design improvements

- Inline `KpiCard` removed → `design-system/KPICard`
- Hardcoded chart hex (`#FF8A3D`) → `CHART_COLORS` from theme tokens
- `"Loading..."` strings → `LoadingState`
- Empty tables → `EmptyState`
- Lead capture dialog extracted and reused on dashboard + leads list

---

## Verification

```bash
npm run build   # PASS
```

Manual:

1. `/leadedge360` — dashboard KPIs, charts, new lead dialog
2. `/leadedge360/leads` — table, filters, pagination, capture dialog
3. `/leadedge360/leads/[id]` — all tabs including Tasks
4. `/leadedge360/opportunities` — pipeline drag/drop

---

## Phase gate

- [x] Aligns with `COMPONENT_GOVERNANCE.md` §3 L4 folder
- [x] No frozen path edits
- [x] Real APIs only
- [x] Build passes
- [ ] Screenshots on request
- [ ] Git commit on request

**Next:** Phase 7 — RetailEdge360 V2 refinement.

Approve Phase 6 to proceed.
