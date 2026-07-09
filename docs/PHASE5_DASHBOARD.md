# Phase 5 — Executive Dashboard V2

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Route | `/dashboard` |
| Shell | `SuiteRouteLayout` → `ThemeProvider theme="suite"` + `AppShell` |

---

## Summary

Phase 5 delivers the **Executive Command Center** — a cross-product suite dashboard composing L2 design-system components and wiring real `/api/dashboard/*` endpoints plus activity feeds.

**No backend or API contract changes.**

---

## Deliverables

| File | Purpose |
|------|---------|
| `app/dashboard/layout.js` | Suite shell + auth guard |
| `app/dashboard/page.js` | Thin page wrapper |
| `components/suite/ExecutiveDashboard.js` | KPIs, charts, activity feed, follow-ups |
| `components/suite/nav-config.ts` | Sidebar Dashboard → `/dashboard` |

---

## APIs wired (real data)

| Endpoint | Widget |
|----------|--------|
| `GET /dashboard/kpis` | Lead KPI row |
| `GET /dashboard/followups-due` | Follow-up KPI + due list |
| `GET /dashboard/revenue?range=30d` | Revenue line chart |
| `GET /dashboard/sales-performance` | Agent revenue bar chart |
| `GET /dashboard/proposals` | CRM snapshot — proposals count |
| `GET /dashboard/invoices` | CRM snapshot — invoices count |
| `GET /recent-activities` | Activity feed |

---

## Design system usage

- `PageHeader`, `SectionHeader`, `KPICard`
- `Card`, `Badge`, `Button`
- `LoadingState`, `EmptyState`
- Recharts for revenue + sales charts

---

## Navigation

| Label | Route |
|-------|-------|
| Dashboard (sidebar) | `/dashboard` |
| LeadEdge360 product dashboard | `/leadedge360` (unchanged) |

---

## Verification

```bash
npm run build   # PASS
```

Manual:

1. Sign in → open `/dashboard`
2. Confirm KPIs, charts, and activity load (requires Mongo + auth token)
3. Sidebar “Dashboard” lands on `/dashboard`; LeadEdge360 remains at `/leadedge360`

---

## Phase gate

- [x] Frontend only
- [x] Real APIs (no mocks)
- [x] L2 design-system components
- [x] Suite theme via AppShell
- [x] Build passes
- [ ] Screenshots on request
- [ ] Git commit on request

**Next:** Phase 6 — LeadEdge360 V2 refinement (extract remaining monolith patterns per `COMPONENT_GOVERNANCE.md`).

Approve Phase 5 to proceed.
