# Sprint 5 — Suite Polish Delivery Report

**Date:** 22 June 2026  
**Status:** Code complete — VPS deploy deferred

---

## Summary

Feature-flag nav, RBAC alignment, customer portal UI, partner dashboard, and demo-mode polish.

| Area | Status |
|------|--------|
| `GET /api/users/features` | Already done (S5-01) |
| `GET /api/admin/roles` aligned with `roles.js` | Done |
| `requireRole` on revenue/invoice APIs | Done |
| `hooks/useFeatureFlag.ts` + nav filtering | Done |
| `app/portal/` login, invoices, profile | Done |
| `app/partners/dashboard/` | Done |
| Settings API Keys tab removed | Done |
| AI Workspace Live/Demo badge | Done |
| `SUITE_AUTH_GUARD_PATHS` synced + used | Done |
| `npm run build` | **PASS** |

---

## Key changes

### RBAC
- `lib/billing/roles-catalog.js` — canonical roles for admin API
- `app/api/admin/roles/route.js` — returns `SUPER_ADMIN`, `ORG_ADMIN`, `FINANCE`, `PARTNER`, etc.
- `guardRevenueRequest(req, { permission })` — `revenue` or `invoices`
- `lib/nav/permissions.js` — role-based nav + route guards

### Portal (`/portal`)
- Login → `portalAccessToken` in localStorage
- Invoices list, profile view/edit
- Uses existing `/api/portal/*` APIs

### Partners (`/partners/dashboard`)
- Commission KPIs, referrals list
- Partner role redirected to dashboard; finance blocked from CRM nav

### UX polish
- Sidebar AI Workspace shows **Demo** / **Live** from `NEXT_PUBLIC_USE_MOCK_API`
- Growth modules gated in nav + `GrowthFeatureGate` on business card page

---

## Test

```bash
npm run dev -- --port 3007
npm run db:sprint5-retest
```

---

## VPS deploy (later)

```bash
npm run deploy:s5
```

---

## Next

Sprint 6 — Retail foundation.
