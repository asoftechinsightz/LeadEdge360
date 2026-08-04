# Performance Baseline

**Date:** 4 August 2026  
**SHA:** `bcc6215`  
**Environment:** Production VPS + public HTTPS  
**Mode:** Read-only measurement

---

## Methodology

- External: `curl` from validation workstation to `https://app.asoftechinsightz.com`
- Internal: `wget` / `time` from `asoftech-edge-nginx` and `asoftech-app` on VPS
- Container stats: `docker stats --no-stream` at idle

No load test or synthetic traffic generation (read-only program).

---

## Application startup

| Phase | Approximate duration |
|-------|---------------------|
| `docker compose up -d` (app after mongo healthy) | ~45–50 s to **healthy** |
| Next.js "Ready" log | ~1–2 s after container start |
| Full image rebuild + deploy | ~2–4 min (VPS observed) |

`start_period` on healthcheck: 45s.

---

## API latency

| Path | Measurement | Result |
|------|-------------|--------|
| Public `GET /api` | curl TTFB | **~477 ms** |
| Edge → `app:3000/api` | wget from edge container | **~77 ms** |
| App loopback `127.0.0.1:3000/api` | node http get | **< 200 ms** (sub-second) |
| Public `GET /signin` | HTTP status | **200** |
| Public `GET /leadedge360` | HTTP status | **200** |

Public latency includes TLS, edge proxy, and geographic distance from probe. Sub-100 ms internal edge→app path indicates **network/proxy overhead** dominates external measurements.

---

## Mongo latency

| Check | Result |
|-------|--------|
| Container health | `mongosh ping` — healthy |
| App → mongo | Same Docker network (`mongo:27017`) — typical < 5 ms |
| Dedicated benchmark | Not run (read-only) |

RC-2 CI Mongo suites pass on GitHub Actions service container.

---

## Container resource usage (idle baseline)

| Container | CPU | Memory |
|-----------|-----|--------|
| `asoftech-app` | ~0% | ~38 MiB |
| `asoftech-mongo` | ~0.6% | ~98 MiB |
| `asoftech-edge-nginx` | ~0% | ~6 MiB |

**Host:** 15 GiB RAM, ~9.9 GiB available; load average 0.19–0.74.

---

## Container startup order

1. `asoftech-mongo` → healthy (~20 s start_period)
2. `asoftech-app` → starts after mongo healthy → healthy (~45 s)
3. `asoftech-n8n` — parallel with mongo
4. `asoftech-edge-nginx` — independent edge stack

---

## RC-2 reference scores (CI, not production load)

| Dimension | RC-2 CI score |
|-----------|---------------|
| Overall RC | 100 (post gate fix) |
| Security | ≥ 95 |
| API regression | PASS |

Production performance baseline is **operational idle + single-request latency**, not RC scorecard load tests.

---

## Bottleneck notes

| Item | Observation |
|------|-------------|
| Disk | 81% full — may affect Mongo and logs under growth |
| Cold start | First request after deploy may be slower (Next.js warm-up) |
| AI / LLM | `EMERGENT_LLM_KEY` missing — AI paths not production-loaded |

---

## Recommendations (documentation only)

1. Run `k6` or Grafana k6 smoke at 10 RPS before high-traffic GA.
2. Set SLO: public `/api` p95 < 1 s from primary user region.
3. Monitor Mongo slow queries after pilot tenants onboard.
4. Free disk space before marketing campaigns.

---

## Related

- `MONITORING_BASELINE.md`
- `docs/production/PRODUCTION_STABILIZATION_VALIDATION.md`
