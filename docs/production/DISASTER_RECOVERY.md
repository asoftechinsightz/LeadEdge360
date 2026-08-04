# Disaster Recovery

## Scope

Sprint-1 production: app, mongo, n8n, edge nginx. **Data:** Mongo volume `mongo-data`, n8n volume `n8n-data`.

## RTO / RPO targets (operational)

| Tier | RTO | RPO |
|------|-----|-----|
| App redeploy from git | ~15 min | 0 (code from git) |
| Mongo restore from backup | Depends on backup cadence | Backup interval |
| Full VPS rebuild | ~1–2 h | Last backup |

## Scenarios

### 1. App container crash / bad deploy

```bash
cd /opt/asoftech-insightz
git reset --hard <last-known-good-sha>
docker compose build --no-cache && docker compose up -d
bash scripts/validate-production-stack.sh
```

### 2. Edge 502 after deploy

1. Run `scripts/validate-production-stack.sh`
2. Check `HOSTNAME` → must be `0.0.0.0`
3. Check `asoftech-app` on `asoftech_edge` with alias `app`
4. See `docs/infrastructure/EDGE_502_ROOT_CAUSE_AND_FIX.md`

### 3. Mongo data corruption

```bash
docker compose stop app
# restore mongo-data from backup (host path via docker volume)
docker volume inspect asoftech-insightz_mongo-data
docker compose up -d
```

**Recommendation:** schedule `mongodump` to off-host storage (P1).

### 4. VPS total loss

1. Provision VPS, install Docker
2. `docker network create asoftech_edge && docker network create opsedge360_default`
3. Restore TLS certs to `/etc/letsencrypt` or re-run certbot
4. Clone repo to `/opt/asoftech-insightz`, restore `.env` and volumes
5. Deploy edge: `/opt/asoftech-edge`
6. `docker compose up -d` app stack
7. Validate script + public URLs

### 5. GitHub unavailable

Keep last good image on host: `docker save asoftech-insightz-app > backup.tar`. Restore with `docker load`.

## Backups (recommended)

| Asset | Method | Frequency |
|-------|--------|-----------|
| Mongo | `mongodump` / volume snapshot | Daily |
| n8n | volume snapshot | Weekly |
| `.env` | encrypted off-host copy | On change |
| TLS certs | certbot + `/etc/letsencrypt` backup | Monthly |

## Contacts / runbook

- **Infra:** VPS `leadedge360` (`187.127.179.138`)
- **App path:** `/opt/asoftech-insightz`
- **Edge path:** `/opt/asoftech-edge`
- **Validation:** `scripts/validate-production-stack.sh`

## Post-incident

1. Record SHA deployed
2. Update `docs/production/PRODUCTION_STABILIZATION_VALIDATION.md` if process changed
3. PO sign-off for production-affecting incidents
