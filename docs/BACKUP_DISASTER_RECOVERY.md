# Backup & Disaster Recovery — RC2

**Generated:** 2026-06-22

## Retention policy

| Tier | Retention |
|------|-----------|
| Daily | 7 days |
| Weekly | 4 weeks |
| Monthly | 12 months |

## Pre-deploy backup (mandatory)

Before **staging** or **production** migration:

```bash
# MongoDB full dump
docker exec asoftech-mongo mongodump --archive=/data/db/backup-pre-deploy-$(date +%F).gz --gzip

# Copy archive off-host
docker cp asoftech-mongo:/data/db/backup-pre-deploy-YYYY-MM-DD.gz ./backups/

# Uploads
tar -czf backups/uploads-$(date +%F).tar.gz public/uploads/

# Environment (secrets store — do NOT commit)
cp .env backups/env-backup-$(date +%F).env.sample   # redact secrets manually

# Nginx / TLS (on VPS)
sudo cp /etc/nginx/sites-available/asoftech backups/nginx-$(date +%F).conf
sudo tar -czf backups/ssl-$(date +%F).tar.gz /etc/letsencrypt/live/
```

## Restore procedure (test quarterly)

```bash
# Stop app
docker compose stop app

# Restore MongoDB
docker exec -i asoftech-mongo mongorestore --archive --gzip --drop < backups/backup-pre-deploy-YYYY-MM-DD.gz

# Restore uploads
tar -xzf backups/uploads-YYYY-MM-DD.tar.gz -C .

# Start app
docker compose up -d app
curl -fsS https://<host>/api/health/ready
```

## Migration safety

**Never run migrations directly on production without:**

1. Production clone restore to staging
2. `node database/migrations/run.mjs up --dry-run` on clone
3. `node database/migrations/run.mjs up` on clone
4. `node database/migrations/run.mjs down` rollback test on clone
5. Application smoke test on clone
6. Scheduled maintenance window for production

```bash
node scripts/migration-validate.mjs
```

## RPO / RTO targets (GA)

| Metric | Target |
|--------|--------|
| RPO (data loss) | ≤ 24h (daily backup) |
| RTO (restore) | ≤ 4h (documented runbook) |

## Monitoring alerts (configure at GA)

- MongoDB disk > 80%
- Backup job failure
- `/api/health/ready` non-200 for 2 min
- Payment webhook failure rate > 5%
