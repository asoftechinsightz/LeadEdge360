# Backup and Recovery

**Sprint-1.0 GA readiness** — operational documentation only.  
**Architecture freeze:** active. No schema or application changes.

---

## Scope

| Asset | Container / path | Volume |
|-------|------------------|--------|
| Application code | `/opt/asoftech-insightz` (git) | — |
| Application image | `asoftech-insightz-app` | — |
| MongoDB data | `asoftech-mongo` | `asoftech-insightz_mongo-data` |
| n8n workflows | `asoftech-n8n` | `asoftech-insightz_n8n-data` |
| TLS certificates | Host `/etc/letsencrypt` | — |
| Environment | `/opt/asoftech-insightz/.env` | — |
| Edge config | `/opt/asoftech-edge` | — |

---

## Application backup

| Method | What | Frequency | Status |
|--------|------|-----------|--------|
| Git | Source of truth on `main` | Every release | **Active** (`bcc6215`) |
| Docker image export | `docker save asoftech-insightz-app` | On major release | **Recommended** before GA |
| `.env` encrypted copy | Secrets off-host | On change | **Recommended** — not verified automated |

**Redeploy from git (no data loss for code):**

```bash
cd /opt/asoftech-insightz
git fetch origin && git reset --hard origin/main
docker compose build --no-cache && docker compose up -d
bash scripts/validate-production-stack.sh
```

---

## Mongo backup

| Item | Detail |
|------|--------|
| Cron | `0 2 * * * /usr/local/bin/mongo-backup.sh` (daily 02:00 UTC+5:30 host) |
| Volume | `asoftech-insightz_mongo-data` |
| Manual dump | `docker exec asoftech-mongo mongodump --archive=/tmp/backup.archive` |

**Verify:** Confirm backup script destination, retention, and off-host copy (not fully audited in read-only pass).

---

## Docker volumes

| Volume | Service | Backup approach |
|--------|---------|-----------------|
| `asoftech-insightz_mongo-data` | Mongo | Daily cron + volume snapshot |
| `asoftech-insightz_n8n-data` | n8n | Weekly snapshot recommended |
| `asoftech-insightz_grafana-data` | Grafana | Optional — dashboards export |
| `asoftech-insightz_prometheus-data` | Prometheus | Optional — metrics retention |

Inspect volume mount:

```bash
docker volume inspect asoftech-insightz_mongo-data
```

---

## n8n backup

| Method | Detail |
|--------|--------|
| Volume snapshot | `asoftech-insightz_n8n-data` |
| Export | n8n UI → workflow export (manual) |
| Edge dependency | `n8n:5678` on `asoftech_edge` |

---

## Rollback

| Scenario | Procedure | RTO |
|----------|-----------|-----|
| Bad app deploy | `git reset --hard <sha>` + `docker compose up -d --build` | ~15 min |
| Edge misconfig | Restore `/opt/asoftech-edge` from git or backup | ~10 min |
| Mongo corruption | Stop app → restore volume from backup → start | Depends on backup |
| Full VPS loss | Rebuild per `docs/production/DISASTER_RECOVERY.md` | ~1–2 h |

---

## Recovery Time Objective (RTO)

| Tier | Target | Current capability |
|------|--------|-------------------|
| App container restart | < 2 min | **Met** (`restart: always`) |
| App redeploy from git | < 15 min | **Met** (validated) |
| Mongo restore | < 4 h | **Depends on backup verification** |
| Full site disaster | < 4 h | **Documented**, untested full DR drill |

---

## Recovery Point Objective (RPO)

| Data | Target | Current |
|------|--------|---------|
| Application code | 0 (git) | **0** |
| Mongo | ≤ 24 h | **Daily backup cron** (verify off-host) |
| n8n | ≤ 7 d | **Manual / volume** — improve for GA |
| `.env` | On change | **Manual** — gap |

---

## Pre-GA recommendations

1. Verify `mongo-backup.sh` output location and test restore quarterly.
2. Encrypt and store `.env` off-host after completing missing secrets.
3. Document n8n volume backup schedule.
4. Run tabletop DR exercise (see `RUNBOOK.md`).

---

## Related

- `docs/production/DISASTER_RECOVERY.md`
- `RUNBOOK.md`
