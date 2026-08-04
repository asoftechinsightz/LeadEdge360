# Production Health Report

**Date:** 4 August 2026 (UTC)  
**Host:** `leadedge360` (`187.127.179.138`)  
**Deployed SHA:** `bcc6215` (`main`)  
**Mode:** Read-only audit — no changes made

---

## Executive summary

| Area | Status |
|------|--------|
| Application | **Healthy** — all core containers up, healthchecks green |
| Edge / TLS | **Healthy** — edge nginx healthy, cert valid to Sep 2026 |
| Mongo | **Healthy** — container healthy, daily backup cron |
| Monitoring stack | **Running** — Grafana, Prometheus, node-exporter, cAdvisor |
| Disk | **Warning** — root 81% used |
| Commercial integrations | **Partial** — several env secrets missing (see WS1) |

---

## Application

| Item | Status |
|------|--------|
| Container `asoftech-app` | Up, **healthy** |
| Deploy path | `/opt/asoftech-insightz` |
| Image | `asoftech-insightz-app` |
| Bind | `0.0.0.0:3000` |
| `HOSTNAME` | `0.0.0.0` |
| Process user | `app` (uid 100, non-root) |
| Memory | ~38 MiB |
| CPU | ~0% at idle |
| Sprint-1 flags | OFF (`ENFORCE_PLAN_LIMITS`, `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, etc.) |

### Health endpoints

| Endpoint | Result |
|----------|--------|
| `GET /api` (public) | `200` — `{"ok":true,...}` |
| `GET /signin` | `200` |
| `GET /leadedge360` | `200` |
| Edge → `http://app:3000/api` | `200` (~77 ms internal) |
| Public `https://app.asoftechinsightz.com/api` | `200` (~477 ms TTFB) |

---

## Docker

| Container | Status | Health |
|-----------|--------|--------|
| `asoftech-app` | Up | healthy |
| `asoftech-mongo` | Up | healthy |
| `asoftech-n8n` | Up | no healthcheck |
| `asoftech-edge-nginx` | Up | healthy |
| `asoftech-marketing` | Up | — |
| `asoftech-grafana` | Up 4 weeks | healthy |
| `asoftech-prometheus` | Up 4 weeks | healthy |
| `asoftech-node-exporter` | Up 4 weeks | — |
| `asoftech-cadvisor` | Up 4 weeks | healthy |

**Orphan / legacy:** `rc2-mongo` (27018), OpsEdge360 stack — separate projects.

**Privileged:** `false` on `asoftech-app`. **Read-only rootfs:** `false`.

---

## Mongo

| Item | Value |
|------|--------|
| Container | `asoftech-mongo` (`mongo:7`) |
| Health | healthy |
| Volume | `asoftech-insightz_mongo-data` |
| App connection | `mongodb://mongo:27017` (compose override) |
| Memory | ~98 MiB |
| Backup cron | `0 2 * * * /usr/local/bin/mongo-backup.sh` (daily) |

---

## Nginx (edge)

| Item | Value |
|------|--------|
| Container | `asoftech-edge-nginx` (`nginx:1.27-alpine`) |
| Published ports | 80, 443 |
| Config path | `/opt/asoftech-edge/nginx.conf` |
| Upstream app | `app:3000` (Docker DNS on `asoftech_edge`) |
| Health | healthy (probes `app:3000/api`) |

Host systemd `nginx` is **not** active; edge container owns 80/443.

---

## Disk

| Mount | Size | Used | Avail | Use% |
|-------|------|------|-------|------|
| `/` (`/dev/sda1`) | 193G | 156G | 38G | **81%** |

**Action:** Plan cleanup or volume expansion before GA traffic growth.

---

## CPU & memory (host)

| Metric | Value |
|--------|--------|
| Uptime | 30 days |
| Load average | 0.19, 0.74, 0.70 |
| RAM total | 15 GiB |
| RAM available | ~9.9 GiB |
| Swap | not reported in audit |

---

## SSL / certificates

| Domain | Expiry |
|--------|--------|
| `app.asoftechinsightz.com` | **17 Sep 2026** |

TLS terminated at `asoftech-edge-nginx`. Cert path: `/etc/letsencrypt/live/`.

---

## Background jobs & cron

| Schedule | Job |
|----------|-----|
| Daily 02:00 | `mongo-backup.sh` |
| Weekly 03:00 | `security-scan.sh` |
| Monthly 04:00 | `docker-cleanup.sh` |
| Hourly | Agent scheduled API call (`/api/agents/scheduled/run`) |

Cron entries observed on VPS root crontab. Agent job uses bearer auth (verify token rotation in ops review).

---

## n8n

| Item | Value |
|------|--------|
| Container | `asoftech-n8n` |
| Port | 5678 (host published) |
| Edge upstream | `n8n:5678` on `asoftech_edge` |
| Volume | `asoftech-insightz_n8n-data` |
| Basic auth | `N8N_BASIC_AUTH_PASSWORD` present in `.env` |

---

## Grafana / Prometheus

| Service | Port (host) | Status |
|---------|-------------|--------|
| Grafana | `127.0.0.1:3031` | healthy |
| Prometheus | `127.0.0.1:9090` | healthy |
| node-exporter | `127.0.0.1:9100` | up |
| cAdvisor | `127.0.0.1:8080` | healthy |

**Note:** Monitoring stack is running; application-specific dashboards/alerts for Sprint-1 app should be verified in Grafana UI (not automated in this audit).

---

## Logs

| Source | Access |
|--------|--------|
| App | `docker logs asoftech-app` |
| Edge | `docker logs asoftech-edge-nginx` |
| Mongo | `docker logs asoftech-mongo` |
| Agent cron | `/var/log/leadedge-cron.log` |
| n8n | `docker logs asoftech-n8n` |

Centralized log aggregation not confirmed in this read-only audit.

---

## Workstream 1 — Environment variable audit

Charter names → `.env` key checked (values **not** exposed):

| Variable | Status | Notes |
|----------|--------|-------|
| JWT_SECRET | ✓ Present | |
| MONGO_URL | ✓ Present | |
| DB_NAME | ✓ Present | |
| N8N_WEBHOOK_TOKEN | ✓ Present | Aliased from legacy `N8N_WEBHOOK_SECRET` in `.env` |
| N8N_WEBHOOK_ORG_ID | ✗ Missing | Required for production webhook lead ingest |
| N8N_BASIC_AUTH_PASSWORD | ✓ Present | |
| SMTP_HOST | ✗ Missing | |
| SMTP_USER | ✗ Missing | |
| SMTP_PASSWORD (`SMTP_PASS`) | ✗ Missing | |
| RAZORPAY_KEY_ID (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) | ✗ Missing | |
| RAZORPAY_SECRET (`RAZORPAY_KEY_SECRET`) | ✗ Missing | |
| RAZORPAY_WEBHOOK_SECRET | ✗ Missing | |
| EMERGENT_LLM_KEY | ✗ Missing | AI scoring / RevenueShield |
| CORS_ORIGINS | ✓ Present | |

**Summary:** 7 present · 7 missing

---

## Related docs

- `BACKUP_AND_RECOVERY.md`
- `MONITORING_BASELINE.md`
- `POST_DEPLOY_SECURITY_AUDIT.md`
- `PERFORMANCE_BASELINE.md`
