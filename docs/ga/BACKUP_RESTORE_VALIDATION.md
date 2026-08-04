# Backup Restore Validation

**Program:** Commercial GA Closure  
**Date:** 4 August 2026  
**Mode:** Documentation-only — **no production overwrite, no restore executed**

---

## Scope

| Asset | Method | Validated in this program |
|-------|--------|---------------------------|
| MongoDB | `mongo-backup.sh` → `/backup/mongodb/` | **Artifact inventory** |
| Docker volumes | Named volumes on host | **Size inventory** |
| n8n | `asoftech-insightz_n8n-data` volume | **Documented procedure only** |

---

## Mongo backup — verified artifacts

| Item | Finding |
|------|---------|
| Script | `/usr/local/bin/mongo-backup.sh` — **exists** |
| Schedule | Cron `0 2 * * *` (daily 02:00) |
| Destination | `/backup/mongodb/mongo-YYYY-MM-DD-HHMM.archive` |
| Permissions | `chmod 600` on archives |
| Method | `mongodump` via `docker exec asoftech-mongo` with auth user `asofadmin` |
| Archive count | **54** files observed |
| Latest backup | `mongo-2026-08-04-0200.archive` (~176 MB) |
| Recent cadence | Daily files Jul 26 – Aug 4, 2026 |

**Conclusion:** Backup **generation** is operational and consistent.

---

## Mongo restore — documentation-only procedure

**Not executed** (program constraint: do not overwrite production).

### Documented restore drill (staging / maintenance window)

```bash
# 1. Stop writers
cd /opt/asoftech-insightz && docker compose stop app

# 2. Copy archive to staging container or restore into isolated mongo instance
ARCHIVE=/backup/mongodb/mongo-2026-08-04-0200.archive
docker run --rm -v "$ARCHIVE:/backup.archive:ro" mongo:7 \
  mongorestore --archive=/backup.archive --gzip --drop

# 3. Validate document counts vs production metrics
# 4. Only after PO approval: restore to production volume with maintenance window
```

### Restore validation checklist (for future drill)

| Step | Pass criteria |
|------|---------------|
| Restore to **non-production** mongo | Completes without error |
| Sample collections | `organizations`, `leads`, `users` readable |
| App smoke against restored DB | `/api` ok, login works |
| RPO measurement | Backup age at restore time ≤ 24 h |

| Gate | Status |
|------|--------|
| Backup files exist | **PASS** |
| Live restore drill completed | **NOT DONE** |
| Commercial GA backup gate | **FAIL** (restore unverified) |

---

## Docker volume backup

| Volume | Size (approx.) | Backup status |
|--------|----------------|---------------|
| `asoftech-insightz_mongo-data` | ~597 MB | Covered by mongodump cron |
| `asoftech-insightz_n8n-data` | ~1.8 MB | **No automated backup observed** |
| `asoftech-insightz_prometheus-data` | ~1.2 GB | Optional metrics retention |
| `asoftech-insightz_grafana-data` | ~1.1 MB | Dashboard export recommended |

**Recommendation:** Weekly volume snapshot or `docker run` tar of `n8n-data` before GA.

---

## n8n backup

| Item | Status |
|------|--------|
| Volume | `asoftech-insightz_n8n-data` |
| Automated backup | **Not observed** |
| Manual export | n8n UI workflow export (documented in runbook) |

---

## RTO / RPO (from documentation)

| Metric | Target | Current evidence |
|--------|--------|------------------|
| RPO (Mongo) | ≤ 24 h | Daily backups — **met for generation** |
| RTO (app redeploy) | ~15 min | Validated in stabilization |
| RTO (mongo restore) | < 4 h | **Untested** |

---

## Commercial GA gate

| Criterion | Result |
|-----------|--------|
| Backup process documented | **PASS** |
| Backup artifacts current | **PASS** |
| Restore process verified (drill) | **FAIL** |

---

## Related

- `docs/operations/BACKUP_AND_RECOVERY.md`
- `OPERATIONS_HANDOVER.md`
