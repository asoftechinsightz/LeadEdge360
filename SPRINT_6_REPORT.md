# Sprint 6 — Retail Foundation Delivery Report

**Date:** 22 June 2026  
**Status:** Code complete — VPS deploy deferred

---

## Summary

Retail inventory domain layer, dedicated APIs, and dashboard wired to real Mongo collections (stores + products + inventory).

| Area | Status |
|------|--------|
| `lib/retail/inventory/service.js` | Done |
| `lib/retail/api-helpers.js` | Done |
| APIs `/api/retail/*` | Done |
| `RetailDashboard` → new endpoints | Done |
| Schemas + indexes | Done |
| Feature flag `retail_inventory` | Done |
| Legacy `products` migration | Done (on first list) |
| `scripts/retail-retest.mjs` | Done |
| `npm run build` | **PASS** |

---

## Collections

| Collection | Purpose |
|------------|---------|
| `retail_stores` | Store/branch master |
| `retail_products` | SKU catalog + AI shelf-life metadata |
| `retail_inventory` | Stock by store |

Legacy `products` documents are migrated automatically when modern inventory is empty.

---

## APIs

| Method | Path |
|--------|------|
| GET/POST | `/api/retail/inventory` |
| DELETE | `/api/retail/inventory/{id}` |
| POST | `/api/retail/inventory/{id}/repredict` |
| GET | `/api/retail/kpis` |
| GET | `/api/retail/stores` |

---

## Test

```bash
npm run dev -- --port 3007
npm run db:indexes
npm run db:retail-retest
```

---

## VPS deploy (later)

```bash
npm run deploy:s6
```

---

## Next

All planned sprints (S0–S6) are code-complete. Batch VPS deploy S2–S6 when ready.
