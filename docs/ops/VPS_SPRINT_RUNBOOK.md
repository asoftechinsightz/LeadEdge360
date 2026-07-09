# VPS Sprint Deployment Runbook

**VPS:** `root@187.127.179.138`  
**App path:** `/opt/asoftech`  
**Database:** MongoDB Docker (`asoftech-mongo`), `DB_NAME=asoftech_saas`  
**Dev port:** `3007` (staging); production app on `3000` via Docker

Run **every sprint** on VPS after code is pushed. Each sprint gets a deployment record under `docs/ops/deployments/`.

---

## Prerequisites

1. Cursor **Remote SSH** → `root@187.127.179.138`
2. Open folder `/opt/asoftech`
3. `.env` configured:

```env
MONGO_URL=mongodb://asofadmin:<password>@127.0.0.1:27017/?authSource=admin
DB_NAME=asoftech_saas
MONGO_USERNAME=asofadmin
MONGO_PASSWORD=<password>
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
NEXT_PUBLIC_APP_URL=http://187.127.179.138:3007
```

---

## Standard sprint deploy (automated)

```bash
cd /opt/asoftech
git pull origin main          # or your working branch
npm install                   # if package.json changed
node scripts/vps-sprint-deploy.mjs s2
```

The script runs, in order:

1. Mongo health check
2. `docker compose up -d mongo`
3. Sprint-specific indexes (`npm run db:indexes`)
4. Sprint-specific seed/bootstrap (if any)
5. `npm run build`
6. Sprint retest script
7. `go-live-retest.mjs` (baseline regression)
8. Appends results to `docs/ops/deployments/S{n}_*.md`

---

## Manual step-by-step (if script fails)

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `docker compose up -d mongo` | Ensure Mongo running |
| 2 | `docker compose ps` | Verify `asoftech-mongo` healthy |
| 3 | `npm run db:indexes` | Apply new indexes |
| 4 | `npm run db:bootstrap` | Seed demo org (S0/S1 only, or fresh DB) |
| 5 | `npm run build` | Verify production build |
| 6 | `npm run dev -- --hostname 0.0.0.0 --port 3007` | Staging dev server |
| 7 | `npm run db:qr-retest` | Sprint retest (S2) |
| 8 | `node scripts/go-live-retest.mjs` | CRM baseline 44/44 |
| 9 | Document in `docs/ops/SPRINT_DATABASE_CHANGELOG.md` | Sign off DB changes |

---

## Per-sprint quick reference

| Sprint | Deploy script arg | DB script | Retest | Deployment doc |
|--------|-------------------|-----------|--------|----------------|
| S0 Stabilization | `s0` | `db:indexes` | `go-live-retest.mjs` | `S0_STABILIZATION_DEPLOYMENT.md` |
| **S0 Hardening** | **`s0h`** | **`db:indexes`** | **`sprint0-staging-uat` + UAT suite** | **`SPRINT0_HARDENING_DEPLOYMENT.md`** |
| S1 Business Card | `s1` | `db:bootstrap` + `db:indexes` | `business-card-retest` | `S1_BUSINESS_CARD_DEPLOYMENT.md` |
| S2 QR Engine | `s2` | `db:indexes` | `db:qr-retest` | `S2_QR_ENGINE_DEPLOYMENT.md` |
| S6 Retail | `s6` | `db:indexes` | `retail-retest` | `S6_RETAIL_DEPLOYMENT.md` |
| **UAT Fixes** | **`uat`** | **`db:indexes`** | **`uat-retest` + `tenant-isolation-retest`** | **`UAT_PRODUCTION_FIXES_DEPLOYMENT.md`** |

---

## UAT batch deploy (S2–S6 + UAT fixes)

If staging has not yet received S2–S6, run in order on VPS:

```bash
cd /opt/asoftech
git pull origin main
npm install
docker compose up -d mongo

# Terminal 1
npm run dev -- --hostname 0.0.0.0 --port 3007

# Terminal 2
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:s2 && npm run deploy:s3 && npm run deploy:s4 && npm run deploy:s5 && npm run deploy:s6
npm run deploy:uat
```

Single-command UAT-only (when S2–S6 already deployed):

```bash
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run deploy:uat
```

## Production deploy (after staging PASS)

```bash
cd /opt/asoftech
git pull origin main
docker compose up -d --build
curl -fsS https://app.asoftechinsightz.com/api/
```

Do **not** set `DEV_AUTH_BYPASS=true` on production.

---

## Documentation rule

After each VPS deploy:

1. Update `docs/ops/SPRINT_DATABASE_CHANGELOG.md` with collections/indexes applied
2. Fill sign-off section in `docs/ops/deployments/S{n}_*.md`
3. Update sprint report (`SPRINT_{n}_REPORT.md`) test results table

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED 127.0.0.1:27017` | `docker compose up -d mongo`; check port mapping in `docker-compose.yml` |
| `qr-retest` auth fail | Ensure `REQUIRE_AUTH=true`, admin user seeded via `db:bootstrap` |
| `PLAN_UPGRADE_REQUIRED` | Subscription `planCode: BUSINESS_GROWTH` for `demo-org` |
| Index conflict | `node scripts/mongo-indexes.mjs` is idempotent (skips existing) |
| Build OOM on VPS | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |

---

*See also: [SPRINT_DATABASE_CHANGELOG.md](./SPRINT_DATABASE_CHANGELOG.md), [IMPLEMENTATION_PLAN.md](../audit/IMPLEMENTATION_PLAN.md)*
