# Production Stabilization Validation Report

**Date:** 4 August 2026  
**Commit:** `542e285` — `chore(prod): Sprint-1.0 production stabilization`  
**VPS:** leadedge360 (`/opt/asoftech-insightz`)  
**Validator:** `scripts/validate-production-stack.sh`

---

## Summary

| Gate | Result |
|------|--------|
| P0 Docker networking (no manual `network connect`) | **PASS** |
| P0 Dockerfile runtime assets | **PASS** |
| P0 docker-compose networks / aliases | **PASS** |
| P0 Edge nginx DNS upstreams | **PASS** |
| P0 Healthchecks | **PASS** |
| Recovery: `docker compose down && up -d` | **PASS** |
| Recovery: `docker restart asoftech-app` | **PASS** |
| Recovery: `docker restart asoftech-edge-nginx` | **PASS** |
| Public HTTPS | **PASS** |

---

## Validation runs (automated)

### Run 1 — After `compose down && up -d` (initial deploy)

15/15 checks **PASS** (exit 0).

### Run 2 — After `docker restart asoftech-edge-nginx` + `docker restart asoftech-app`

15/15 checks **PASS** (exit 0).

### Run 3 — After second `compose down && up -d`

15/15 checks **PASS** (exit 0).

---

## Checklist detail

| # | Check | Result |
|---|--------|--------|
| 1 | `asoftech-app` running | PASS |
| 2 | `asoftech-mongo` running | PASS |
| 3 | `asoftech-n8n` running | PASS |
| 4 | `asoftech-edge-nginx` running | PASS |
| 5 | `HOSTNAME=0.0.0.0` | PASS |
| 6 | Listen `0.0.0.0:3000` | PASS |
| 7 | `/app/config/aeo/business-profile-fields.json` | PASS |
| 8 | `/app/public` | PASS |
| 9 | `/app/.next/static` | PASS |
| 10 | `/app/server.js` | PASS |
| 11 | Edge → `http://app:3000/api` | PASS |
| 12 | Edge → `n8n:5678` | PASS |
| 13 | App loopback `/api` | PASS |
| 14 | `asoftech-app` on `asoftech_edge` | PASS |
| 15 | `asoftech-n8n` on `asoftech_edge` | PASS |

---

## Public endpoints

| URL | Result |
|-----|--------|
| `https://app.asoftechinsightz.com/api` | `{"ok":true,...}` |
| `https://app.asoftechinsightz.com/signin` | HTTP 200 |

No 502 errors observed during validation window.

---

## Changes in this stabilization

| File | Change |
|------|--------|
| `docker-compose.yml` | Healthchecks; `depends_on` mongo healthy; `n8n` on `asoftech_edge` alias `n8n`; image tag |
| `Dockerfile` | `HEALTHCHECK`; `config/` copy (existing) |
| `deploy/edge/docker-compose.yml` | Edge healthcheck probes `app:3000/api` |
| `scripts/validate-production-stack.sh` | Automated validation |
| `docs/production/*` | Architecture and runbooks |

---

## GO / NO-GO

| Gate | Verdict |
|------|---------|
| Sprint-1.0 production stabilization | **GO** |
| Future deploys via `git pull && docker compose up -d --build` | **GO** (no manual network steps) |
| Sprint-2 features | **NO-GO** (out of scope) |

---

## Re-run validation

```bash
cd /opt/asoftech-insightz
bash scripts/validate-production-stack.sh
```
