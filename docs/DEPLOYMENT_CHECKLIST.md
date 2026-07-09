# Deployment Checklist — RC1

**Generated:** 2026-06-22  
**Target environments:** Development → Staging → Production

---

## Infrastructure inventory

| Component | Status | Location |
|-----------|--------|----------|
| Docker | ✅ | `Dockerfile` (Node 20 Alpine, standalone Next.js) |
| Docker Compose | ✅ | `docker-compose.yml` |
| PM2 | ❌ | Not used — Docker restart policy instead |
| Nginx | 🟡 | `docs/nginx.conf` (reference only) |
| SSL | 🟡 | Terminate at Caddy/nginx on VPS |
| Redis | ❌ | Not in compose — sessions in MongoDB |
| MongoDB | ✅ | mongo:7 in compose + volume `mongo-data` |
| n8n | ✅ | Optional workflow sidecar |
| Health checks | ✅ | App + Mongo healthcheck in compose |
| Auto restart | ✅ | `restart: unless-stopped` |
| Graceful shutdown | 🟡 | Node SIGTERM default |
| Blue/green | ❌ | Single container — use image tag rollback |

---

## Environment variables (required production)

| Variable | Purpose |
|----------|---------|
| `MONGO_URL` | MongoDB connection |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Auth signing (min 32 chars) |
| `NEXT_PUBLIC_BASE_URL` | App URL |
| `NEXT_PUBLIC_APP_URL` | Same / canonical |
| `REQUIRE_AUTH=true` | Disable demo tenant |
| `RAZORPAY_KEY_SECRET` | Billing + retail POS |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client checkout |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC |
| `WHATSAPP_ACCESS_TOKEN` | Optional Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional Meta |
| `SMTP_*` | Email delivery |
| `N8N_WEBHOOK_TOKEN` | Agent webhooks |

Full list: `lib/env/runtime.js`, `docs/SECURITY_HARDENING.md`

---

## Secrets

- [ ] `.env` never committed (`.gitignore` verified)
- [ ] GitHub Actions secrets: `VPS_*`, `PUBLIC_URL`
- [ ] Rotate JWT secret before GA
- [ ] Razorpay webhook secret matches dashboard

---

## Storage & uploads

| Type | Path | Backup |
|------|------|--------|
| MongoDB data | Docker volume `mongo-data` | Daily snapshot |
| Uploaded files | `public/uploads/{orgId}/` | Sync to object storage (recommended) |
| Report exports | Temp / DB refs | Regenerable |
| n8n workflows | Volume `n8n-data` | Export JSON backup |

**Note:** App container is `read_only: true` with `tmpfs: /tmp`.

---

## Pre-deploy (each environment)

```bash
yarn install --frozen-lockfile
yarn build
node --test tests/*.test.js
node database/migrations/run.mjs up --dry-run
node database/migrations/run.mjs up
docker compose build
docker compose up -d
curl -fsS https://<host>/api/health/ready
curl -fsS https://<host>/api/health/live
```

---

## Staging validation

- [ ] Login (password + OTP + Google)
- [ ] Lead CRUD + attachments
- [ ] Opportunity stage change
- [ ] Invoice with GST line items
- [ ] Retail POS cash + Razorpay test mode
- [ ] WhatsApp template send (sandbox)
- [ ] Subscription checkout
- [ ] Playwright E2E: `npm run test:e2e`
- [ ] Cert E2E: `npm run cert:e2e`

---

## Production deploy (VPS)

Workflow: `.github/workflows/deploy.yml`

1. Push to `main` triggers build + SSH deploy
2. `git reset --hard origin/main` on VPS `/opt/asoftech`
3. Merge secrets into `.env`
4. `docker compose pull && up -d --build`
5. Smoke: `curl $PUBLIC_URL/api/` → `{ ok: true }`

### Rollback

```bash
git checkout <previous-tag>
docker compose up -d --build
node database/migrations/run.mjs down   # if indexes changed
```

---

## Monitoring & alerts

| Signal | Endpoint / tool |
|--------|-----------------|
| Liveness | `GET /api/health/live` |
| Readiness | `GET /api/health/ready` |
| Platform health | `GET /api/platform/health` |
| Logs | Docker json-file (10m × 5 rotation) |
| Metrics | 🟡 Not wired — add Prometheus RC2 |
| Alerts | 🟡 Manual VPS monitoring |

---

## Backup & restore

```bash
# Backup
docker exec asoftech-mongo mongodump --archive=/data/db/backup-$(date +%F).gz --gzip

# Restore
docker exec -i asoftech-mongo mongorestore --archive --gzip < backup.gz
```

---

## Zero-downtime

**Current:** Single-instance Docker — **rolling restart only** (~30–60s blip).

**RC2 target:** Second app instance + load balancer for true zero-downtime.

---

## Deployment readiness score: **82/100**
