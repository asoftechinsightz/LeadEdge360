# Pilot Production Deployment Report — v1.0.0-rc3-pilot

**Generated:** 2026-06-28T23:09:39.984Z  
**Stage:** Pilot Production (Hostinger VPS)  
**Tag:** `v1.0.0-rc3-pilot`

---

## Summary

| Step | Status |
|------|--------|
| Environment validation | 🟡 |
| MongoDB backup (verified) | ❌ |
| Migrations applied | 🟡 |
| App deploy + rollback gate | 🟡 |
| Monitoring stack | 🟡 |
| Smoke tests | ❌ |
| Security headers | 🟡 |
| Backup cron | 🟡 |

---

## Backup verification

_No backup report — run pilot-production-deploy.sh_

---

## Migration report

_Pending_

---

## Deployment health

_No deploy report_

---

## Smoke test results

_Not run_

---

## Monitoring

_Not deployed_

---

## Security headers

_Run headers-check against PUBLIC_URL_

---

## Backup retention

| Tier | Retention |
|------|-----------|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 12 months |

Cron: `/etc/cron.d/asoftech-backup`

---

## Rollback readiness

Until pilot succeeds for **≥ 2 weeks**, maintain:

1. Previous Docker image tag
2. Latest verified backup: `see /opt/asoftech/backups/daily/`
3. `.deploy-version` file on VPS

```bash
# Emergency rollback
docker compose stop app
docker compose up -d app  # previous image
# OR restore MongoDB from backup archive
```

---

## Artifact index

| File | Purpose |
|------|---------|
| `pilot-backup-verification.json` | Pre-deploy backup proof |
| `pilot-migration-report.json` | Migration apply log |
| `pilot-smoke-report.json` | Full smoke matrix |
| `pilot-monitoring-report.json` | Prometheus/Grafana health |
| `pilot-backup-cron.json` | Cron install proof |
| `deploy-pilot-*.json` | Deploy verification |

---

**Pilot GA gate:** uptime ≥99.9%, p95 <300ms, zero P0, zero tenant leakage, 2-week stable run.
