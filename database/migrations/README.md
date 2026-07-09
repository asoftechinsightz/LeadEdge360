# Database Migrations — Asoftech Business Suite

MongoDB schema changes are managed as **idempotent, forward/rollback migration pairs**.

## Layout

```
database/migrations/
├── README.md
├── MIGRATION_REPORT.md
├── run.mjs              # Apply or rollback migrations
├── 001_core_indexes.up.mjs
├── 001_core_indexes.down.mjs
├── 002_marketing_engine_indexes.up.mjs
├── 002_marketing_engine_indexes.down.mjs
├── 003_retail_sprint10.up.mjs
└── 003_retail_sprint10.down.mjs
```

## Usage

```bash
# Forward (idempotent)
node database/migrations/run.mjs up

# Rollback last batch
node database/migrations/run.mjs down

# Dry run
node database/migrations/run.mjs up --dry-run
```

Requires `MONGO_URL` and `DB_NAME` (loaded via `lib/mongo-connect.js`).

## Principles

| Rule | Implementation |
|------|----------------|
| Idempotent | `createIndex` skipped if key already exists |
| Forward | `.up.mjs` applies indexes / collection validators |
| Rollback | `.down.mjs` drops indexes created by that migration |
| Validation | `run.mjs` records applied migrations in `_migrations` collection |
| Tenant safety | All CRM indexes include `orgId` as first key where applicable |

## Legacy scripts

Pre-RC1 index scripts remain for reference:

- `scripts/mongo-indexes.mjs` — superseded by `001_core_indexes.up.mjs`
- `scripts/marketing-engine-indexes.mjs` — superseded by `002_marketing_engine_indexes.up.mjs`
