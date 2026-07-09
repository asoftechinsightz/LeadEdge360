# `/api/products` — Mobile & Frontend Guide

> **Risk R-03** · Canonical reference for native app teams and frontend developers

---

## The conflict

`GET /api/products` serves **two different purposes** depending on caller context:

| Caller | Purpose | Auth required |
|--------|---------|----------------|
| **Product switcher** (`/product-selection`) | List suite products (LeadEdge360, RetailEdge360) | Optional — may use demo tenant |
| **RetailEdge360** (`/retailedge360`) | Retail SKU inventory for RevenueShield | **Always** send `Authorization: Bearer <JWT>` |

Both hit the same route in `app/api/[[...path]]/route.js`. Without a valid JWT, retail calls may receive demo-org data or the wrong payload shape.

---

## Rules for mobile apps

1. **Always attach JWT** on any retail/inventory call to `/api/products`.
2. **Never** use `/api/products` for the product-switcher list — use `/api/catalog` or hardcoded product metadata from bootstrap (`GET /api/mobile/bootstrap`).
3. Retail CRUD uses:
   - `GET /api/products` — list SKUs
   - `POST /api/products` — create SKU
   - `POST /api/products/:id/repredict` — AI shelf-life
   - `DELETE /api/products/:id` — remove SKU
4. Retail KPIs: `GET /api/retail-kpis` (also requires tenant JWT).

---

## Web frontend (V2)

| Surface | API client | Endpoint |
|---------|------------|----------|
| RetailEdge360 dashboard | `apiGet('/products')` via `src/lib/api.ts` | Inventory SKUs |
| Product selection | Separate fetch / catalog | Not retail inventory |

---

## TypeScript types

```ts
import type { RetailProduct, ProductsResponse } from '@/src/types';
```

See `src/types/retail.ts` for shared DTOs usable by web, React Native, and codegen pipelines.

---

## Related risks

| ID | Topic | Doc |
|----|-------|-----|
| R-03 | `/api/products` dual meaning | This file |
| R-08 | `/api/billing/*` vs `/api/payments/*` | `docs/PHASE8_BILLING.md` |
| R-02 | Demo tenant without JWT | `docs/SOURCE_OF_TRUTH.md` §9.1 |

**No backend changes** — disambiguate at the client layer only.
