# Monitoring Verification

**Program:** Commercial GA Closure  
**Date:** 4 August 2026  
**Mode:** Read-only

---

## Stack status

| Component | Container | Endpoint | HTTP check |
|-----------|-----------|----------|------------|
| Prometheus | `asoftech-prometheus` | `127.0.0.1:9090` | **200** `/healthy` |
| Grafana | `asoftech-grafana` | `127.0.0.1:3031` | **200** `/api/health` |
| node-exporter | `asoftech-node-exporter` | `127.0.0.1:9100` | Not probed (metrics path) |
| cAdvisor | `asoftech-cadvisor` | `127.0.0.1:8080` | healthy |
| App health | `asoftech-app` | Docker healthcheck | **healthy** |
| Edge health | `asoftech-edge-nginx` | probes `app:3000/api` | **healthy** |
| Mongo health | `asoftech-mongo` | `mongosh ping` | **healthy** |

All monitoring ports bound to **localhost** — not publicly exposed.

---

## Docker metrics

| Source | Coverage |
|--------|----------|
| cAdvisor | Per-container CPU, memory, network |
| `docker stats` | Live snapshot available |
| Docker healthchecks | app, mongo, edge-nginx |

**Idle baseline:** app ~38 MiB, mongo ~98 MiB, edge ~6 MiB.

---

## Node exporter

| Metric class | Available |
|--------------|-----------|
| CPU / load | Yes |
| Memory | Yes |
| Disk filesystem | Yes — **alert on `/` 81%** |
| Network | Yes |

---

## Mongo metrics

| Item | Status |
|------|--------|
| Dedicated `mongodb_exporter` | **Not deployed** |
| Container stats via cAdvisor | Yes |
| Mongo healthcheck | `mongosh` ping every 10s |

**Gap:** No query latency / replication lag metrics for Commercial GA SLOs.

---

## Application metrics & health endpoints

| Endpoint | Purpose | Public | Result |
|----------|---------|--------|--------|
| `GET /api` | Liveness | Yes | `200`, `ok: true` |
| `GET /signin` | Page availability | Yes | `200` |
| Docker HEALTHCHECK | Container orchestration | Internal | Passing |
| `/api/metrics` | App metrics | Not verified | Unknown usage |

Public API response time observed: **~15–477 ms** (probe variance).

---

## Grafana dashboards

| Item | Status |
|------|--------|
| Grafana UI | Running, healthy |
| LeadEdge360 Sprint-1 dashboard | **Not verified** in this read-only audit |
| Edge 502 dashboard | **Not confirmed** |

**Action:** Ops to log into Grafana (`127.0.0.1:3031` via SSH) and confirm dashboards exist.

---

## Missing alerts (recommendations — not implemented)

| Alert | Condition | Severity | Status |
|-------|-----------|----------|--------|
| App unhealthy | Docker health ≠ healthy 3× | P0 | **Missing** |
| Edge upstream fail | edge healthcheck fail | P0 | **Partial** (healthcheck only) |
| Disk root | > 85% | P1 | **Missing** — currently 81% |
| Mongo unhealthy | health failing | P0 | **Missing** |
| SSL expiry | < 14 days | P1 | **Missing** (cert Sep 2026) |
| Backup job fail | mongo-backup cron error | P1 | **Missing** |
| Public synthetic | `/api` non-200 | P0 | **Missing** (external) |

---

## Commercial GA gate

| Criterion | Result |
|-----------|--------|
| Monitoring stack running | **PASS** |
| Application health endpoints | **PASS** |
| Alerting coverage acceptable | **FAIL** |
| Mongo-specific monitoring | **PARTIAL** |

---

## Related

- `docs/operations/MONITORING_BASELINE.md`
- `OPERATIONS_HANDOVER.md`
