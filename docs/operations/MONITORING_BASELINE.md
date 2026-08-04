# Monitoring Baseline

**Date:** 4 August 2026  
**VPS:** leadedge360  
**Mode:** Read-only verification

---

## Stack overview

```
Host (node-exporter :9100, cAdvisor :8080)
    │
    ├── Prometheus (:9090) ──► Grafana (:3031)
    │
    └── Docker containers (cadvisor scrapes)
```

All monitoring ports bound to **127.0.0.1** — not public.

---

## Components verified

| Component | Container | Status | Host port |
|-----------|-----------|--------|-----------|
| Grafana | `asoftech-grafana` | healthy (4 weeks uptime) | 3031 |
| Prometheus | `asoftech-prometheus` | healthy | 9090 |
| node-exporter | `asoftech-node-exporter` | up | 9100 |
| cAdvisor | `asoftech-cadvisor` | healthy | 8080 |

Volumes: `asoftech-insightz_grafana-data`, `asoftech-insightz_prometheus-data`.

---

## Container metrics

| Source | Provides |
|--------|----------|
| cAdvisor | Per-container CPU, memory, network |
| Docker healthchecks | `asoftech-app`, `asoftech-mongo`, `asoftech-edge-nginx` |
| `docker stats` | Live CPU/memory snapshot |

**Baseline snapshot (idle):**

| Container | CPU | Memory |
|-----------|-----|--------|
| `asoftech-app` | ~0% | ~38 MiB |
| `asoftech-mongo` | ~0.6% | ~98 MiB |
| `asoftech-edge-nginx` | ~0% | ~6 MiB |

---

## Node exporter

- Host CPU, memory, disk, filesystem metrics
- Endpoint: `http://127.0.0.1:9100/metrics` (localhost only)

**Disk alert threshold:** root at **81%** — configure alert before 90%.

---

## Mongo metrics

- No dedicated MongoDB exporter confirmed in Sprint-1 stack
- Indirect: container stats via cAdvisor
- **Recommendation:** Add `mongodb_exporter` or Atlas-style monitoring for GA operations

---

## Application metrics

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /api` | Liveness (`ok: true`) | Public |
| `GET /api/metrics` | App metrics (if enabled) | Not verified in this audit |

Docker **HEALTHCHECK** and compose healthcheck probe `/api` every 30s.

Edge nginx healthcheck probes `http://app:3000/api`.

---

## Health endpoints summary

| Probe | Target | Interval |
|-------|--------|----------|
| Dockerfile HEALTHCHECK | `127.0.0.1:3000/api` | 30s |
| Compose app healthcheck | same | 30s |
| Compose mongo | `mongosh ping` | 10s |
| Edge nginx | `app:3000/api` | 30s |
| Public monitor | `https://app.asoftechinsightz.com/api` | External |

---

## Alerting recommendations (not implemented — document only)

| Alert | Condition | Severity |
|-------|-----------|----------|
| App unhealthy | Docker health ≠ healthy 3× | P0 |
| Edge 502 rate | nginx 502 > 1% 5m | P0 |
| Disk root | > 85% | P1 |
| Mongo unhealthy | health failing | P0 |
| SSL expiry | < 14 days | P1 |
| Cert `app.asoftechinsightz.com` | expires Sep 2026 | OK |
| Memory host | available < 2 GiB | P2 |
| Backup job | mongo-backup cron failure | P1 |

**Channels:** Grafana alerting → email/Slack (configure in Grafana UI).

---

## Gaps for GA

1. No confirmed Grafana dashboard for LeadEdge360 Sprint-1 app SLOs.
2. No automated external uptime check documented (recommend UptimeRobot / Grafana synthetic).
3. Application-level metrics endpoint usage not verified.
4. Mongo-specific exporter missing.

---

## Related

- `PRODUCTION_HEALTH_REPORT.md`
- `PERFORMANCE_BASELINE.md`
