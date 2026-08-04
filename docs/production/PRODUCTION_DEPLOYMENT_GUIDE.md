# Production Deployment Guide

**Sprint-1.0 stabilization** — infrastructure only, no feature changes.

## Prerequisites

| Item | Location / command |
|------|-------------------|
| VPS path (app) | `/opt/asoftech-insightz` |
| VPS path (edge) | `/opt/asoftech-edge` |
| Git remote | `git@github.com:asoftechinsightz/LeadEdge360.git` |
| External networks | `asoftech_edge`, `opsedge360_default` |

### First-time network bootstrap (fresh VPS)

```bash
docker network create asoftech_edge
docker network create opsedge360_default   # required by edge stack + OpsEdge
```

## Standard deploy (no manual docker network connect)

```bash
cd /opt/asoftech-insightz
git fetch origin
git checkout main
git reset --hard origin/main   # or approved RC SHA

docker compose build --no-cache
docker compose up -d
```

Edge stack (if not already running):

```bash
cd /opt/asoftech-edge
docker compose up -d
```

## Validate

```bash
cd /opt/asoftech-insightz
bash scripts/validate-production-stack.sh
```

Expected: all `PASS`, exit 0.

Manual spot check:

```bash
docker exec asoftech-edge-nginx wget -qO- http://app:3000/api
curl -fsS https://app.asoftechinsightz.com/api
curl -fsS -o /dev/null -w '%{http_code}\n' https://app.asoftechinsightz.com/signin
```

## Environment

Copy `.env.example` → `.env`. Required keys documented in release package.

Sprint-1 flags (initial production):

```env
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
ALLOW_PUBLIC_DEMO_ORG=false
BILLING_TEST_MODE=false
```

**Name mapping** (legacy VPS `.env`):

| Legacy | App expects |
|--------|-------------|
| `N8N_PASSWORD` | `N8N_BASIC_AUTH_PASSWORD` |
| `N8N_USER` | `N8N_BASIC_AUTH_USER` |
| `N8N_WEBHOOK_SECRET` | `N8N_WEBHOOK_TOKEN` |
| `RAZORPAY_KEY_ID` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| `RAZORPAY_SECRET` | `RAZORPAY_KEY_SECRET` |
| `SMTP_PASSWORD` | `SMTP_PASS` |

Compose sets `HOSTNAME=0.0.0.0` and `PORT=3000` — do not remove.

## Reboot survival

All services use `restart: always` (app stack) or `unless-stopped` (edge). Docker daemon restart brings containers back; `asoftech_edge` is external and persists.

## Rollback

```bash
cd /opt/asoftech-insightz
git reset --hard <previous-sha>
docker compose build --no-cache && docker compose up -d
```

## P1 recommendations (not blocking)

| Item | Recommendation |
|------|----------------|
| Pin image tags | Use `mongo:7.0.x`, `n8nio/n8n:1.x.x` instead of `:latest` |
| Resource limits | Add `deploy.resources` limits on app/mongo in high-traffic env |
| Log rotation | Configure Docker `logging` driver max-size |
| Secrets | Prefer Docker secrets or external vault over flat `.env` for Razorpay/SMTP |
| Orphan monitoring stack | `docker compose up --remove-orphans` or separate compose project name |
| Remove compose `version` key | Already removed (obsolete in Compose v2) |

## Related docs

- `DOCKER_ARCHITECTURE.md`
- `NETWORK_TOPOLOGY.md`
- `PRODUCTION_HEALTHCHECKS.md`
- `DISASTER_RECOVERY.md`
