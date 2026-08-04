# Storage Optimization Report

**Program:** Commercial GA Closure  
**Date:** 4 August 2026  
**Mode:** Read-only audit — **no deletions performed**

---

## Executive summary

| Risk | Level | Primary driver |
|------|-------|----------------|
| Root filesystem | **HIGH** | `/dev/sda1` at **81%** (156G / 193G) |
| Docker build cache | **HIGH** | **73.56 GB** reclaimable |
| Docker images | **MEDIUM** | 82.95 GB total, ~1.7 GB reclaimable inactive |
| Application data | **LOW** | Mongo volume ~597 MB |

**Commercial GA:** Disk risk must be **addressed or explicitly accepted by PO** before GO.

---

## `df -h` summary

| Mount | Size | Used | Avail | Use% |
|-------|------|------|-------|------|
| `/` (`/dev/sda1`) | 193G | 156G | 38G | **81%** |
| `/tmp` (tmpfs) | 7.9G | 1.2G | 6.7G | 15% |
| `/boot` | 989M | 150M | 772M | 17% |

---

## `docker system df`

| Type | Total | Active | Size | Reclaimable |
|------|-------|--------|------|-------------|
| Images | 24 | 21 | 82.95 GB | 1.712 GB (2%) |
| Containers | 21 | 21 | 65.11 MB | 0 B |
| Local Volumes | 29 | 11 | 3.011 GB | 543.4 MB (18%) |
| **Build Cache** | 600 | 0 | **73.56 GB** | **72.76 GB** |

---

## Largest Docker volumes (`du -sh /var/lib/docker/volumes/*`)

| Volume | Size |
|--------|------|
| `asoftech-insightz_prometheus-data` | 1.2 GB |
| `asoftech-insightz_mongo-data` | 597 MB |
| Legacy anonymous volumes | 300M+ each (multiple) |
| `opsedge360_postgres_data` | 182 MB |
| `asoftech-insightz_n8n-data` | 1.8 MB |
| `asoftech-insightz_grafana-data` | 1.1 MB |

**Note:** Multiple OpsEdge / observability volumes from co-hosted stacks contribute to total disk pressure.

---

## Journal usage

```
journalctl --disk-usage: 43.6M
```

Journal is **not** a primary disk driver.

---

## Mongo backup retention

| Path | Observation |
|------|-------------|
| `/backup/mongodb/` | **54** archives; latest ~176 MB |
| Estimated backup dir | ~5–8 GB cumulative (varies by retention policy) |

Review retention policy — old archives may be safe to archive off-host.

---

## Recommended cleanup (manual — not executed)

| Priority | Action | Est. reclaim | Risk |
|----------|--------|--------------|------|
| **P0** | `docker builder prune -af` | ~72 GB | Low — rebuilds slower next deploy |
| **P1** | `docker image prune -a` (unused images) | ~1–5 GB | Medium — verify unused images |
| **P1** | Remove orphan `rc2-mongo` container if obsolete | Minimal | Low |
| **P2** | Archive old `/backup/mongodb/*.archive` > 30d off-host | Variable | Low with retention policy |
| **P2** | Prune unused Docker volumes (`docker volume prune`) | ~543 MB | **High** — verify volumes first |
| **P3** | Review `/opt/*` legacy project trees | Unknown | Medium |

### Safe maintenance sequence (ops window)

```bash
# After PO approval — NOT run in this program
docker builder prune -af
docker image prune -f
# Review: docker volume ls -f dangling=true
# Monthly cron already exists: /usr/local/bin/docker-cleanup.sh
```

---

## Acceptance options for Commercial GA

| Option | Requirement |
|--------|-------------|
| **A — Remediate** | Root disk < 75% after P0 prune | 
| **B — Accept risk** | PO documents 81% with expansion plan |

---

## Commercial GA gate

| Criterion | Result |
|-----------|--------|
| Disk risk addressed or PO-accepted | **NOT MET** (81%, no acceptance doc) |

---

## Related

- `docs/operations/PRODUCTION_HEALTH_REPORT.md`
- `OPERATIONS_HANDOVER.md`
