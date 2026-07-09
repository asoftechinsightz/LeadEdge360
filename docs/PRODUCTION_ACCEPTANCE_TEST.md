# Production Acceptance Test (PAT)

Run after **every deployment** before routing customer traffic.

## Command

```bash
npm run production:acceptance
```

Exit code **1** and verdict **FAILED** if any **critical** check fails — deployment must not be promoted.

## Environment

| Variable | Purpose | Default |
|----------|---------|---------|
| `RETEST_API_BASE` / `PAT_API_BASE` | API base URL | `http://127.0.0.1:3000/api` |
| `PUBLIC_URL` | HTTPS URL for SSL/proxy/CSP checks | — |
| `CERT_ADMIN_EMAIL` | Admin login for workflow tests | required |
| `CERT_ADMIN_PASSWORD` | Admin password | required |
| `PAT_STAGE` | `production` \| `pilot` \| `staging` | `production` |
| `PAT_REQUIRE_BACKUP` | Fail if no recent backup | `1` in production |
| `PAT_SKIP_DOCKER` | Skip container checks | `0` |
| `PAT_P95_TARGET_MS` | Latency gate | `300` |
| `PROMETHEUS_URL` | Monitoring probe | `http://127.0.0.1:9090/-/healthy` |
| `GRAFANA_URL` | Monitoring probe | `http://127.0.0.1:3030/api/health` |

## VPS example

```bash
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='...'
export PUBLIC_URL=https://app.asoftechinsightz.com
export RETEST_API_BASE=http://127.0.0.1:3000/api
export PAT_STAGE=pilot
export PAT_REQUIRE_BACKUP=1
npm run production:acceptance
```

## What is verified

| Category | Checks |
|----------|--------|
| Infrastructure | Docker, MongoDB, Redis, reverse proxy, SSL, HSTS, CSP |
| Database | Migration pairs, rollback readiness |
| Configuration | Production env secrets, upload path |
| Authentication | Login, OTP routes, refresh rotation, RBAC |
| Isolation | Cross-tenant IDOR, unauthenticated access |
| CRM | Leads, opportunities, customers, revenue, lead create |
| Retail | Products, barcode, POS checkout |
| Razorpay | Keys, subscriptions, webhook route |
| WhatsApp | Template catalog |
| Files | Upload directory, attachment routes |
| Monitoring | `/api/metrics`, alert rules, Prometheus/Grafana |
| Backup | Latest archive freshness and size |
| Latency | p95 ≤ 300ms (configurable) |

## Reports

Timestamped artifacts in `docs/deployments/`:

- `production-acceptance-<timestamp>.json`
- `production-acceptance-<timestamp>.md`
- `production-acceptance-latest.json` (symlink copy for automation)

## Integration

- `scripts/ops/deploy-production.sh` — runs PAT after deploy
- `scripts/ops/pilot-production-deploy.sh` — Step 6
- `.github/workflows/ci.yml` — after E2E bootstrap (staging mode)

## Promotion gate

```json
{
  "verdict": "PASSED" | "FAILED",
  "promotionAllowed": true | false
}
```

**Do not onboard customers when `promotionAllowed` is false.**
