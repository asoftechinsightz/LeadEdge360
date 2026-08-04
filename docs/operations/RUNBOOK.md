# Operations Runbook

**LeadEdge360 Sprint-1.0** — production operations  
**Host:** leadedge360 (`187.127.179.138`)  
**App path:** `/opt/asoftech-insightz`  
**Edge path:** `/opt/asoftech-edge`

---

## 1. Deployment

### Standard release

```bash
cd /opt/asoftech-insightz
git fetch origin && git reset --hard origin/main   # or approved SHA
docker compose build --no-cache
docker compose up -d
bash scripts/validate-production-stack.sh
```

### Edge stack

```bash
cd /opt/asoftech-edge
docker compose up -d
```

### Fresh network bootstrap (new VPS only)

```bash
docker network create asoftech_edge
docker network create opsedge360_default
```

---

## 2. Rollback

```bash
cd /opt/asoftech-insightz
git log -5 --oneline
git reset --hard <previous-sha>
docker compose build --no-cache && docker compose up -d
bash scripts/validate-production-stack.sh
curl -fsS https://app.asoftechinsightz.com/api
```

---

## 3. Restart services

```bash
# App only
docker restart asoftech-app

# Full stack
cd /opt/asoftech-insightz && docker compose restart

# Edge
docker restart asoftech-edge-nginx

# Mongo (brief outage)
docker restart asoftech-mongo
# Wait for healthy, then verify app
```

---

## 4. Log collection

```bash
docker logs asoftech-app --tail 200
docker logs asoftech-edge-nginx --tail 200
docker logs asoftech-mongo --tail 100
docker logs asoftech-n8n --tail 100
tail -100 /var/log/leadedge-cron.log
```

Export bundle:

```bash
mkdir -p /tmp/incident-$(date +%Y%m%d)
docker logs asoftech-app > /tmp/incident-*/app.log 2>&1
docker logs asoftech-edge-nginx > /tmp/incident-*/edge.log 2>&1
```

---

## 5. Health verification

```bash
cd /opt/asoftech-insightz
bash scripts/validate-production-stack.sh

# Quick checks
docker compose ps
docker inspect asoftech-app --format '{{.State.Health.Status}}'
curl -fsS https://app.asoftechinsightz.com/api
curl -fsS -o /dev/null -w '%{http_code}\n' https://app.asoftechinsightz.com/signin
```

---

## 6. Incident response

### Symptom: 502 Bad Gateway

1. `docker ps` — is `asoftech-app` healthy?
2. `docker exec asoftech-app printenv HOSTNAME` → must be `0.0.0.0`
3. `docker exec asoftech-edge-nginx wget -qO- http://app:3000/api`
4. If fail: `bash scripts/validate-production-stack.sh`
5. See `docs/infrastructure/EDGE_502_ROOT_CAUSE_AND_FIX.md`

### Symptom: 500 on API routes

1. `docker logs asoftech-app --tail 50`
2. Check runtime assets: `docker exec asoftech-app ls /app/config/aeo/`
3. Rebuild if missing: `docker compose build --no-cache && docker compose up -d`

### Symptom: Mongo connection errors

1. `docker inspect asoftech-mongo --format '{{.State.Health.Status}}'`
2. `docker logs asoftech-mongo`
3. Verify `MONGO_URL=mongodb://mongo:27017` in compose override

### Escalation

1. Capture logs (section 4)
2. Record SHA: `git rev-parse HEAD`
3. PO / engineering notification
4. Consider rollback (section 2)

---

## 7. Backup restore

### Mongo (high level)

```bash
cd /opt/asoftech-insightz
docker compose stop app
# Restore from /usr/local/bin/mongo-backup.sh output per ops procedure
docker compose start mongo
# wait healthy
docker compose up -d app
```

See `BACKUP_AND_RECOVERY.md` for RTO/RPO.

### n8n

Restore volume `asoftech-insightz_n8n-data` from snapshot or redeploy workflows from export.

---

## 8. Certificate renewal

Let's Encrypt via certbot on host; certs mounted into edge nginx at `/etc/letsencrypt`.

```bash
# Typical certbot renewal (host)
certbot renew --dry-run
docker restart asoftech-edge-nginx
```

Current expiry: **17 Sep 2026** (`app.asoftechinsightz.com`).

---

## 9. Emergency contacts

| Role | Contact |
|------|---------|
| Infrastructure / VPS | Asoftech ops (SSH `asoftech-vps`) |
| Product Owner | PO sign-off for production changes |
| Engineering | LeadEdge360 maintainers |
| Customer Success | Blocked until authenticated validation complete |

Update with named contacts per org policy.

---

## 10. Cron jobs (host)

| Schedule | Script |
|----------|--------|
| Daily 02:00 | `/usr/local/bin/mongo-backup.sh` |
| Weekly 03:00 | `/usr/local/bin/security-scan.sh` |
| Monthly | `/usr/local/bin/docker-cleanup.sh` |
| Hourly | Agent scheduled API (`/api/agents/scheduled/run`) |

Verify cron after OS updates: `crontab -l`

---

## Related documentation

- `docs/production/PRODUCTION_DEPLOYMENT_GUIDE.md`
- `BACKUP_AND_RECOVERY.md`
- `MONITORING_BASELINE.md`
- `POST_DEPLOY_SECURITY_AUDIT.md`
