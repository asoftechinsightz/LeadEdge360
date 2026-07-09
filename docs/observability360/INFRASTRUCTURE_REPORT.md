# Observability360 — Infrastructure Report

**Date:** 3 July 2026  
**Target deployment:** Ubuntu 24.04 LTS, Docker, Nginx, SSL — `app.asoftechinsightz.com`

---

## 1. Docker Infrastructure

### Development (`docker-compose.yml`)
| Service | Image | Port | Healthcheck |
|---------|-------|------|-------------|
| app | Built Dockerfile | 3000 | ✅ HTTP probe |
| mongo | mongo:7 | 5432→5432 | ✅ `pg_isready` equivalent |
| redis | redis:7-alpine | 6379 | Optional profile |
| n8n | n8nio/n8n | 5678 | Workflow automation |

### Production (`docker-compose.prod.yml`)
| Service | Role |
|---------|------|
| app-blue / app-green | Blue/green zero-downtime deploy |
| nginx | TLS termination, rate limit, static |
| redis | Sessions/cache (infra only) |

### Monitoring (`docker-compose.monitoring.yml`)
| Service | Port | Purpose |
|---------|------|---------|
| prometheus | 9090 | Metrics scrape |
| grafana | 3001 | Dashboards |
| node-exporter | 9100 | Host metrics |
| cAdvisor | 8080 | Container metrics |
| redis-exporter | 9121 | Redis metrics |

### Observability360 additions (planned)
| Service | Source | Port |
|---------|--------|------|
| postgres | Trinetra360 | 5432 |
| api-gateway | Trinetra360 | 4000 |
| discovery..governance | Trinetra360 services | 4001–4010 |
| neo4j | Twin graph | 7687 |
| kafka | Event bus (optional) | 9092 |
| jaeger | Tracing UI | 16686 |

**Docker profile strategy (Trinetra360):** `core` (postgres, redis, kafka) + `full` (neo4j, opensearch, prometheus).

---

## 2. Nginx & SSL

| File | Purpose |
|------|---------|
| `infra/nginx/asoftech-production.conf` | Production reverse proxy |
| `infra/nginx/upstream.conf` | Blue/green upstream |
| `docs/nginx.conf` | Reference config |

**TLS:** Let's Encrypt at `/etc/letsencrypt/live/app/`  
**Headers:** HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy  
**Rate limit:** `/api/auth/` — `limit_req`  
**Metrics:** `/api/metrics` IP-restricted  
**Health:** `/healthz` → `ok`

### Observability360 routing (planned)
```
app.asoftechinsightz.com/          → Next.js (suite + observability360 UI)
app.asoftechinsightz.com/api/      → Next.js API (existing)
api.asoftechinsightz.com/          → Trinetra360 gateway (new subdomain)
grafana.asoftechinsightz.com/      → Grafana (optional)
```

---

## 3. Storage & Volumes

| Volume | Data | Backup |
|--------|------|--------|
| `postgres_data` | CRM (future obs) | `mongo-backup.sh` |
| `mongo_data` | Business Suite | Daily cron |
| `neo4j_data` | Digital twin | TBD |
| `grafana_data` | Dashboards | Low priority |
| Uploads | `public/uploads` | `ops:verify-uploads` |

---

## 4. Backup Procedures

| Script | Schedule | Retention |
|--------|----------|-----------|
| `scripts/ops/backup-schedule.sh` | Daily 02:00 | 7 days |
| Weekly tier | Sunday | 4 weeks |
| Monthly tier | 1st | 12 months |
| `scripts/ops/restore-drill.sh` | Quarterly | DR validation |

**Gap:** No automated PostgreSQL backup until Trinetra360 stack deployed.

---

## 5. Monitoring & Health

| Endpoint | Type | Consumer |
|----------|------|----------|
| `GET /api/health/live` | Liveness | Docker/K8s |
| `GET /api/health/ready` | Readiness | Docker/K8s |
| `GET /api/metrics` | Prometheus | Prometheus |
| `GET /healthz` | Edge | nginx LB |

**Alerts (`infra/prometheus/alerts.yml`):** AppNotReady, HighErrorRate, LoginFailuresSpike, MongoBackupStale.

**Gap:** Alertmanager not wired; no PagerDuty/Slack integration in repo.

---

## 6. Redis

| Item | Status |
|------|--------|
| Docker service | ✅ Available |
| App integration | ❌ Not used — rate limits use Mongo |
| Trinetra360 cache | ✅ `@trinetra360/cache` |

**Action:** Wire Redis for gateway cache when Observability360 API load increases.

---

## 7. CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `ci.yml` | push/PR | build, unit, E2E, certification |
| `deploy.yml` | push main | SSH rsync, docker compose, smoke |
| `security-scan.yml` | PR | dependency + OWASP |
| `load-test.yml` | manual | k6 load test |

---

## 8. VPS Deployment Checklist (Phase 5)

| Step | Status | Tool |
|------|--------|------|
| 1. Validate repo + env | ✅ | `ops:validate-env` |
| 2. Build production images | ✅ | Dockerfile |
| 3. Run automated tests | ✅ | CI |
| 4. Database migrations | 🟡 | Mongo indexes; PG migrations for Obs360 |
| 5. Docker Compose up | ✅ | `deploy-production.sh` |
| 6. Container health | ✅ | healthchecks |
| 7. Nginx reverse proxy | ✅ | prod compose |
| 8. SSL certificates | ✅ | certbot |
| 9. Environment variables | ✅ | `.env` on VPS |
| 10. Auto-restart | ✅ | `restart: unless-stopped` |
| 11. Log rotation | ✅ | json-file driver |
| 12. Daily DB backups | ✅ | cron install script |
| 13. App backup procedures | ✅ | documented |
| 14. Monitoring endpoints | ✅ | Prometheus stack |
| 15. Verify APIs | ✅ | `post-deploy-smoke.sh` |
| 16. Verify auth | ✅ | PAT scripts |
| 17. Verify dashboards | 🟡 | Grafana default |
| 18. Deployment report | ✅ | sprint deployment logs |

---

## 9. Infrastructure Recommendations

| Priority | Action |
|----------|--------|
| P0 | Add PostgreSQL + Trinetra360 services to prod compose overlay |
| P0 | Subdomain `api.` for gateway — separate from Next.js |
| P1 | Wire Redis into gateway cache |
| P1 | PostgreSQL backup script parallel to Mongo |
| P2 | Alertmanager + notification channel |
| P2 | OpenSearch for log analytics (Trinetra360 full profile) |

**Infrastructure readiness for Observability360:** **65%** — monitoring stack exists; observability data plane not deployed.
