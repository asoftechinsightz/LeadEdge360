# Migration Report — RC1

**Generated:** 2026-06-22

## Overview

| Migration | Description | Forward | Rollback | Idempotent |
|-----------|-------------|---------|----------|------------|
| `001_core_indexes` | CRM, auth, events, agents indexes (~90) | ✅ | ✅ | ✅ |
| `002_marketing_engine_indexes` | Marketing engine collections | ✅ | ✅ | ✅ |
| `003_retail_sprint10` | POS payments, barcode, attachments | ✅ | ✅ | ✅ |

## Execution

```bash
node database/migrations/run.mjs up
node database/migrations/run.mjs up --dry-run
node database/migrations/run.mjs down
```

Applied migrations are tracked in MongoDB collection `_migrations`.

## Validation checklist

- [x] Forward migrations are idempotent (`createIndex` skip-if-exists)
- [x] Rollback scripts drop named indexes only (no data deletion)
- [x] All CRM indexes lead with `orgId`
- [x] Sprint 10 adds `retail_payment_orders`, `retail_products.barcode`, `lead_attachments` indexes
- [ ] Run `up` on staging before production cutover
- [ ] Snapshot MongoDB volume before production migration

## History mapping

| Legacy script | Replaced by |
|---------------|-------------|
| `scripts/mongo-indexes.mjs` | `001_core_indexes.up.mjs` |
| `scripts/marketing-engine-indexes.mjs` | `002_marketing_engine_indexes.up.mjs` |
| Sprint 10 manual indexes | `003_retail_sprint10.up.mjs` |

## Rollback procedure (production)

1. Put app in maintenance mode (optional)
2. `node database/migrations/run.mjs down` (runs `.down.mjs` in reverse)
3. Redeploy previous app image tag
4. Verify `/api/health/ready` returns 200

**Note:** Index rollback does not revert application code. Coordinate app + DB rollback together.
