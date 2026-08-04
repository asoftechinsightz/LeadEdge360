# Operations Handover

**LeadEdge360 v1.0.0 — Commercial GA Closure**  
**Effective:** Post Sprint-1 stabilization (`bcc6215`)  
**Architecture freeze:** ACTIVE

---

## System overview

| Item | Value |
|------|--------|
| Production URL | `https://app.asoftechinsightz.com` |
| VPS | leadedge360 (`187.127.179.138`) |
| App path | `/opt/asoftech-insightz` |
| Edge path | `/opt/asoftech-edge` |
| Validation script | `scripts/validate-production-stack.sh` |

---

## Daily checks

| # | Check | Command / action |
|---|-------|------------------|
| 1 | All core containers up | `docker ps --filter name=asoftech` |
| 2 | App health | `curl -fsS https://app.asoftechinsightz.com/api` |
| 3 | Signin page | HTTP 200 on `/signin` |
| 4 | Health statuses | `docker inspect asoftech-app --format '{{.State.Health.Status}}'` |
| 5 | Disk usage | `df -h /` — alert if > 85% |
| 6 | Backup file | `ls -lt /backup/mongodb/*.archive \| head -1` |

---

## Weekly checks

| # | Check | Action |
|---|-------|--------|
| 1 | Full validation script | `bash scripts/validate-production-stack.sh` |
| 2 | Grafana review | Disk, CPU, container restarts |
| 3 | SSL expiry | `openssl x509` on app cert |
| 4 | Docker disk | `docker system df` |
| 5 | Review `/var/log/leadedge-cron.log` | Agent cron errors |
| 6 | Fail2Ban | `fail2ban-client status` |

---

## Monthly maintenance

| # | Task | Notes |
|---|------|-------|
| 1 | `docker-cleanup.sh` cron | Already scheduled (1st, 04:00) |
| 2 | `security-scan.sh` | Weekly cron exists — review output monthly |
| 3 | Review backup retention | Archive old `/backup/mongodb/*` off-host |
| 4 | `docker builder prune` | If build cache > 20 GB |
| 5 | Certificate renewal dry-run | `certbot renew --dry-run` |
| 6 | Tabletop incident drill | See `DISASTER_RECOVERY.md` |

---

## Backup verification

| Schedule | Task |
|----------|------|
| Daily | Confirm latest `mongo-YYYY-MM-DD-0200.archive` exists |
| Monthly | **Restore drill to non-production mongo** (required for GA) |
| Quarterly | n8n volume export |

See `docs/ga/BACKUP_RESTORE_VALIDATION.md`.

---

## Certificate renewal

| Domain | Expiry | Path |
|--------|--------|------|
| `app.asoftechinsightz.com` | 17 Sep 2026 | `/etc/letsencrypt/live/` |

After renewal: `docker restart asoftech-edge-nginx`

---

## Incident handling

| Severity | Examples | Response |
|----------|----------|----------|
| **P0** | Site down, 502, data loss | Immediate — runbook + rollback |
| **P1** | Degraded API, disk > 90% | < 4 h |
| **P2** | Single feature broken | Next business day |

**Runbook:** `docs/operations/RUNBOOK.md`

### P0 quick path

1. `bash scripts/validate-production-stack.sh`
2. `docker logs asoftech-app --tail 100`
3. If deploy-related: rollback per runbook
4. Notify PO + engineering

---

## Escalation matrix

| Level | Role | Responsibility |
|-------|------|----------------|
| L1 | On-call ops | Health checks, restart, logs |
| L2 | Infrastructure lead | Docker, network, backups, disk |
| L3 | Engineering | Application defects (post-freeze: hotfix only with PO) |
| L4 | Product Owner | Commercial GA, feature flags, customer comms |
| L5 | Customer Success | Tenant issues, acceptance testing |

*Populate named contacts per org policy.*

---

## Deployment (ops — not in this program)

```bash
cd /opt/asoftech-insightz
git fetch origin && git reset --hard origin/main
docker compose up -d --build
bash scripts/validate-production-stack.sh
```

Requires PO approval during architecture freeze except hotfixes.

---

## Related documentation

| Doc | Purpose |
|-----|---------|
| `docs/operations/RUNBOOK.md` | Detailed procedures |
| `docs/production/PRODUCTION_DEPLOYMENT_GUIDE.md` | Deploy reference |
| `docs/ga/STORAGE_OPTIMIZATION_REPORT.md` | Disk cleanup |
| `docs/ga/MONITORING_VERIFICATION.md` | Alerts to configure |
