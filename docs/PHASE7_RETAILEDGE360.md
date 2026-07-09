# Phase 7 — RetailEdge360 V2 Refinement

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Route | `/retailedge360` |
| Shell | `SuiteRouteLayout` |

---

## Summary

Phase 7 refactors RetailEdge360 from a **289-line monolithic `page.js`** into composable L4 components under `components/retailedge360/`, migrating raw `fetch()` calls to the shared API client + React Query.

**No backend or API contract changes.**

---

## Component inventory

| Component | Purpose |
|-----------|---------|
| `RetailDashboard` | Main command center composition |
| `RetailAnalytics` | Category bar chart + risk pie chart |
| `InventoryTable` | Product catalogue table with actions |
| `ProductCaptureDialog` | Add SKU + AI shelf-life prediction |
| `ProductDetailDialog` | SKU detail + RevenueShield insights |
| `constants.js` | Categories, risk styles, chart colors, `formatCurrency` |

---

## Page composition

```js
// app/retailedge360/page.js (7 lines)
import { RetailDashboard } from '@/components/retailedge360'
export default function RetailEdge360Page() {
  return <RetailDashboard />
}
```

---

## APIs wired

| Action | Endpoint |
|--------|----------|
| List products | `GET /products` |
| Retail KPIs | `GET /retail-kpis` |
| Add SKU | `POST /products` |
| Re-predict | `POST /products/:id/repredict` |
| Remove SKU | `DELETE /products/:id` |

---

## Design-system adoption

- Inline `Kpi` → `KPICard`
- Raw `fetch` → `apiGet` / `apiPost` / `apiDelete` + React Query
- `"Loading..."` → `LoadingState`
- Empty catalogue → `EmptyState`
- Chart colors → theme token palette (`CHART_COLORS`)
- Added `apiDelete` helper to `src/lib/api.ts`

---

## Verification

```bash
npm run build   # PASS
```

Manual:

1. Sign in → `/retailedge360`
2. View KPIs and charts
3. Add SKU via dialog
4. Click row → detail dialog
5. Re-predict and remove SKU

---

## Phase gate

- [x] L4 folder per governance
- [x] Real APIs only
- [x] No frozen path edits
- [x] Build passes

**Next:** Phase 8 — Billing Center V2 (`components/billing/`).

Approve Phase 7 to proceed.
