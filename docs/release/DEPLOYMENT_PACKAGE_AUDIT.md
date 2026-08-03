# Deployment Package Audit

**Date:** 4 August 2026  
**Scope:** Sprint-1 RC deployment package (certified workstation tree)  
**Deploy executed:** **NO**  

---

## Summary

| Area | Status |
|------|--------|
| Docker Compose | **GREEN** (RC tree) |
| Deployment scripts | **YELLOW** — path fixed locally; remote push pending |
| Rollback scripts | **YELLOW** — documented procedures, no standalone rollback script |
| Environment template | **GREEN** |
| Health endpoints | **GREEN** (RC); production also has `/api/health` |
| Smoke tests | **YELLOW** — scripts present; prod smoke not run |
| Feature flag defaults | **GREEN** in `.env.example` |

---

## Docker Compose

| Check | RC tree | Notes |
|-------|---------|-------|
| `docker-compose.yml` | ✓ | `app`, `mongo`, `n8n` |
| App port | `3000` | VPS binds `127.0.0.1:3000` in production compose |
| `env_file: .env` | ✓ | |
| Mongo volume | `mongo-data` | |
| n8n password gate | `${N8N_BASIC_AUTH_PASSWORD:?...}` | Phase-0 security |
| Healthcheck | RC compose: basic | VPS production compose: `wget` healthcheck on app |
| **VPS production compose** | Extended | `read_only`, `tmpfs`, mongo auth env — differs from RC tarball compose |

**Note:** Production VPS uses a **hardened** `docker-compose.yml` at `/opt/asoftech-insightz/docker-compose.yml` (not identical to certified RC minimal compose). Deploy must reconcile or preserve VPS hardening.

---

## Deployment scripts

| Artifact | Path | RC tree | VPS `main` | Status |
|----------|------|---------|------------|--------|
| GitHub Deploy workflow | `.github/workflows/deploy.yml` | ✓ `/opt/asoftech-insightz` | ✓ (local `d96e63d`) | **YELLOW** — not on remote |
| RC validation workflow | `.github/workflows/rc-validation.yml` | ✓ | Missing on VPS branches | **YELLOW** |
| Bootstrap script | `deploy.sh` | ✓ `APP_DIR=/opt/asoftech-insightz` | Partial | **GREEN** (local) |
| Setup guide | `.github/DEPLOY_SETUP.md` | ✓ | — | **GREEN** |
| CI runner | `scripts/rc-ci-runner.mjs` | ✓ | Missing on VPS | RC-only |
| Post-deploy smoke (VPS) | `scripts/ops/post-deploy-smoke.sh` | — | On VPS `main` only | Ops extension |

---

## Rollback scripts

| Mechanism | Present? | Location |
|-----------|----------|----------|
| Automated rollback script | **No** standalone file | — |
| Flag rollback (env) | Documented | [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) |
| Git redeploy rollback | Documented | `git reset --hard <sha>` + `docker compose up` |
| Mongo restore | Documented | `mongodump` / restore procedures |
| Rollback SHA recorded | ✓ | [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md) → `0e1b7e8` |

**Status:** **YELLOW** — procedures exist; no single executable rollback script in RC tree.

---

## Environment template

| Check | Status |
|-------|--------|
| `.env.example` | ✓ Complete Sprint-1 + security vars |
| `JWT_SECRET`, webhook, CORS | Documented |
| `ENFORCE_PLAN_LIMITS`, `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE` | Default `false` |
| Razorpay, SMTP, Emergent | Documented (placeholders) |
| `N8N_WEBHOOK_ORG_ID`, `ALLOW_PUBLIC_DEMO_ORG` | Documented |
| Production `.env` complete | **NO** — 7 vars missing ([PRODUCTION_SECRET_AUDIT](../releases/PRODUCTION_SECRET_AUDIT.md)) |

---

## Health endpoints

| Endpoint | RC tree | Production live |
|----------|---------|-----------------|
| `GET /api/` | ✓ `{ ok: true }` | Redirect/variant |
| `GET /api/health` | — (RC uses `/api/`) | ✓ Pilot health JSON |
| `GET /api/metrics` | — | ✓ Prometheus text |
| Docker healthcheck | Compose-dependent | ✓ `asoftech-app` healthy |

**Smoke target:** Use `/api/health` or `/api/` per environment; align in post-deploy checklist.

---

## Smoke tests

| Test | Path | RC tree | Last run |
|------|------|---------|----------|
| API regression | `backend_test.py` | ✓ | Not on prod RC build |
| Bridge | `npm run test:bridge` | ✓ | PASS (RC-3) |
| AEO | `npm run test:aeo` | ✓ | PASS (RC-3) |
| Billing | `npm run test:billing` | ✓ | PASS (RC-3, Mongo) |
| RC master | `npm run test:rc` | ✓ | PASS (RC-3, Mongo) |
| Deploy workflow smoke | `curl PUBLIC_URL/api/` | In `deploy.yml` | Not executed |
| VPS post-deploy | `scripts/ops/post-deploy-smoke.sh` | VPS only | Not run |

**Status:** **YELLOW** — unit/RC suites pass locally; full production smoke pending authorized deploy.

---

## Feature flag defaults

| Source | `ENFORCE` | `WEB_JWT_BRIDGE` | `AEO_SERVER` |
|--------|-----------|------------------|--------------|
| `.env.example` | `false` | `false` | `false` |
| RC code defaults | off unless `true` | off unless `true` | off unless `true` |
| Production `.env` | not set | not set | not set |
| Deploy charter | **must be false** | **must be false** | **must be false** |

**Status:** **GREEN** in package; **YELLOW** on VPS (implicit defaults — should set explicit `false` before deploy).

---

## Dockerfile & build

| Item | RC tree |
|------|---------|
| `Dockerfile` | ✓ Multi-stage, non-root runner |
| `next.config.js` `standalone` | ✓ |
| `yarn build` / `npm run build` | Required before image |
| RC-3 build gate | **Not passed** on workstation |

---

## Package audit verdict

| Deploy package ready? | **CONDITIONAL** |
| Blockers | RC not on GitHub; prod secrets incomplete; build/CI gates open; VPS compose drift |

No deployment package was transferred or executed.
