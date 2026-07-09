# Load Test Plan — RC3

**Target:** 1,000 concurrent users · p95 API latency < 300ms · error rate < 5%

## Tooling

| Tool | Path | When |
|------|------|------|
| Node orchestrator | `scripts/load/run-load-test.mjs` | CI + quick staging |
| k6 (recommended staging) | `scripts/load/k6-production.js` | Full 1k VU ramp |

## Scenarios

| Scenario | Endpoint | VU share | p95 target |
|----------|----------|----------|------------|
| Health | `/api/health/ready` | 20% | 100ms |
| Login | `/api/auth/login-password` | 10% | 2000ms |
| Lead CRUD (list) | `/api/leads?limit=20` | 25% | 300ms |
| Opportunity pipeline | `/api/opportunities?limit=20` | 15% | 300ms |
| Dashboard | `/api/revenue/dashboard` | 15% | 500ms |
| POS checkout | `/api/retail/pos/checkout` | 5% | 500ms |
| WhatsApp send prep | `/api/whatsapp/templates` | 5% | 400ms |
| Barcode lookup | `/api/retail/products?barcode=…` | 5% | 300ms |

## Run on staging (VPS)

**Capacity gate (recommended — matches PAT loopback, bypasses nginx/TLS):**

```bash
export LOAD_TEST_BASE_URL=http://127.0.0.1:3000
export LOAD_TEST_VUS=20
export LOAD_TEST_DURATION_SEC=30
export LOAD_TEST_EMAIL=demo@asoftechinsightz.com
export LOAD_TEST_PASSWORD='<password>'

npm run test:load:staging
```

**Edge probe (HTTPS smoke — paced requests, avoids 503 storm):**

```bash
export LOAD_TEST_PROFILE=edge
export LOAD_TEST_BASE_URL=https://app.asoftechinsightz.com
export LOAD_TEST_AUTH_BASE=http://127.0.0.1:3000
export LOAD_TEST_VUS=20
export LOAD_TEST_DURATION_SEC=30
export LOAD_TEST_EMAIL=demo@asoftechinsightz.com
export LOAD_TEST_PASSWORD='<password>'

# After syncing package.json:
npm run test:load:edge
# Or without npm script:
LOAD_TEST_PROFILE=edge node scripts/load/run-load-test.mjs
```

Unpaced HTTPS load from the same VPS can produce **~99% 503** (nginx overload when errors return in ~1ms). Edge profile uses 150ms think time, 500ms backoff on 503/429, and **does not count transient 503/502/429 toward the error-rate gate** (still reported in `statusCounts`).

GA certification uses **loopback capacity** (`meetsCapacityTarget`).

**Full 1k VU ramp (k6):**

```bash
export LOAD_TEST_BASE_URL=http://127.0.0.1:3000
export LOAD_TEST_VUS=1000
export LOAD_TEST_DURATION_SEC=300
export LOAD_TEST_TOKEN=<bearer>
export LOAD_TEST_EMAIL=admin@example.com
export LOAD_TEST_PASSWORD=<password>

npm run test:load
# or full k6:
k6 run -e K6_BASE_URL=$LOAD_TEST_BASE_URL -e K6_TOKEN=$LOAD_TEST_TOKEN scripts/load/k6-production.js
```

Common false failures when hitting the public URL:

- Auth middleware rate-limits `/api/auth/*` (40 req/min/IP) — login scenario is skipped when credentials pre-resolve a token.
- Barcode/POS scenarios must accept 404/422 like PAT; inventory-backed POS body is resolved automatically.

## Report

Output: `docs/load-test-last-run.json`

Pass criteria for GA:

- All executed scenarios `pass: true`
- `summary.meetsGaTarget: true`
- Document results in `docs/ops/deployments/RC3_LOAD_TEST.md`
