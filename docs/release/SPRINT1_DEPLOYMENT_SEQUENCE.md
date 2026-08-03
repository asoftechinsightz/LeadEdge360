# Sprint-1 Deployment Sequence

**Date:** 4 August 2026  
**Release:** `SPRINT1-RC-2026-08-03`  
**Audience:** DevOps (execute) · Eng · CS · PO (approve)  
**Status:** **DOCUMENTATION ONLY** — not executed  

---

## Preconditions (must be true before Phase 1)

| # | Gate | Owner | Status |
|---|------|-------|--------|
| P0-1 | Approved RC SHA recorded in [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md) | PO + Eng | **Pending** |
| P0-2 | RC-2 Validation **GREEN** on Approved SHA | DevOps | **Pending** |
| P0-3 | Production secrets complete ([SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md)) | Infra + PO | **Pending** |
| P0-4 | GitHub Actions secrets verified | DevOps | **Pending** |
| P0-5 | PO signed [DEPLOYMENT_AUTHORIZATION_REQUEST](../releases/DEPLOYMENT_AUTHORIZATION_REQUEST.md) | PO | **Pending** |
| P0-6 | [SPRINT1_PRODUCTION_SIGNOFF.md](./SPRINT1_PRODUCTION_SIGNOFF.md) — no RED items in P0 | All | **Pending** |

**Do not proceed** if any P0 precondition is open.

---

## Phase 1 — Pre-deployment

### 1.1 Release verification

| Step | Action | Owner | Verify |
|------|--------|-------|--------|
| 1.1.1 | Confirm Approved RC SHA with PO | PO | SHA matches manifest |
| 1.1.2 | `git fetch --all` on VPS | DevOps | Remote reachable |
| 1.1.3 | `git log -1 <approved-sha>` — message includes Sprint-1 RC | DevOps | E-002/E-003/E-004 present in tree |
| 1.1.4 | Verify `lib/security-config.js`, `lib/request-actor.js`, `lib/billing/plan-entitlements.js` exist | Eng | File check |
| 1.1.5 | Confirm deploy path in workflow: `/opt/asoftech-insightz` | DevOps | `deploy.yml` on remote `main` |

### 1.2 Announcement

| Step | Action | Owner |
|------|--------|-------|
| 1.2.1 | Notify pilot tenant / CS of maintenance window (if needed) | CS |
| 1.2.2 | Confirm rollback SHA communicated: `0e1b7e8` | Release Mgmt |

### 1.3 Certification cross-check

| Step | Action | Expected |
|------|--------|----------|
| 1.3.1 | RC-2 workflow green on SHA | All jobs pass |
| 1.3.2 | RC score ≥ 90 (or PO waiver documented) | Artifact / scorecard |
| 1.3.3 | Security ≥ 95, Performance ≥ 90 | RC-3 evidence |
| 1.3.4 | Regression 100% (or PO waiver) | Test reports |

---

## Phase 2 — Backup

Execute on VPS **before** any `git reset` or `docker compose up --build`.

| Step | Action | Command / path | Owner |
|------|--------|----------------|-------|
| 2.1 | Create dated backup directory | e.g. `/opt/asoftech/backups/sprint1-rc-YYYYMMDD/` | DevOps |
| 2.2 | Mongo dump | `docker exec asoftech-mongo mongodump --out /tmp/dump` + copy off container | DevOps |
| 2.3 | Copy `.env` | `cp /opt/asoftech-insightz/.env <backup-dir>/` | DevOps |
| 2.4 | Copy `docker-compose.yml` | Same backup dir | DevOps |
| 2.5 | Snapshot running images | `docker compose images` → log file | DevOps |
| 2.6 | Edge nginx config | `/opt/asoftech-edge/` if applicable | Infra |
| 2.7 | Verify backup integrity | File sizes / `ls -la` backup dir | DevOps |
| 2.8 | Record current SHA + image ID in [DEPLOYMENT_LOG](../releases/DEPLOYMENT_LOG.md) | Manual entry | Release Mgmt |

**Status (4 Aug 2026):** **Not performed.**

---

## Phase 3 — Environment validation

Path: `/opt/asoftech-insightz/.env`

| Step | Check | Expected |
|------|-------|----------|
| 3.1 | `JWT_SECRET` set (≥16 chars) | Present |
| 3.2 | `N8N_WEBHOOK_TOKEN` strong | Present |
| 3.3 | `N8N_WEBHOOK_ORG_ID` set | Present |
| 3.4 | Razorpay trio set (live vs test per PO) | Present |
| 3.5 | SMTP trio set | Present |
| 3.6 | `EMERGENT_LLM_KEY` set | Present |
| 3.7 | `CORS_ORIGINS` = production app URL (not `*`) | Present |
| 3.8 | `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_APP_URL` match prod | Present |
| 3.9 | `ENFORCE_PLAN_LIMITS=false` | Explicit |
| 3.10 | `WEB_JWT_BRIDGE=false` | Explicit |
| 3.11 | `AEO_SERVER_PROFILE=false` | Explicit |
| 3.12 | `ALLOW_PUBLIC_DEMO_ORG=false` | Explicit |
| 3.13 | `BILLING_TEST_MODE=false` | Explicit |
| 3.14 | `chmod 600 .env` | Permissions |
| 3.15 | Disk free > 30% | `df -h` |
| 3.16 | TLS cert valid > 30 days | Infra check |

**Live health check (pre-deploy baseline):**

```bash
curl -fsS https://app.asoftechinsightz.com/api/health
```

Record `database.ok`, `smtp.ok`, `razorpay.ok` for post-deploy comparison.

---

## Phase 4 — Deployment order

**Execute only after PO explicit GO and Phases 1–3 complete.**

### Option A — GitHub Actions (preferred)

| Step | Action | Owner |
|------|--------|-------|
| 4A.1 | Confirm `main` (or release branch) = Approved RC SHA on GitHub | DevOps |
| 4A.2 | Trigger Deploy workflow (`push` to `main` or `workflow_dispatch`) | DevOps |
| 4A.3 | Watch `test` job → green | DevOps |
| 4A.4 | Watch `build-and-deploy` → green | DevOps |
| 4A.5 | Workflow runs: `git reset --hard origin/main`, `docker compose up -d --build` at `/opt/asoftech-insightz` | Automated |

### Option B — Manual break-glass (PO-approved only)

```bash
ssh asoftech-vps
cd /opt/asoftech-insightz
git fetch --all
git reset --hard <APPROVED_RC_SHA>
docker compose up -d --build --remove-orphans
docker image prune -f
```

| Step | Action | Owner |
|------|--------|-------|
| 4B.1 | SSH to VPS | DevOps |
| 4B.2 | `cd /opt/asoftech-insightz` | DevOps |
| 4B.3 | `git reset --hard <APPROVED_RC_SHA>` | DevOps |
| 4B.4 | `docker compose up -d --build --remove-orphans` | DevOps |
| 4B.5 | `docker compose ps` — all `running` / app `healthy` | DevOps |
| 4B.6 | `docker compose images` — timestamp updated | DevOps |

**Do not** enable feature flags during deploy.

**Not executed (4 Aug 2026).**

---

## Phase 5 — Smoke tests

Run immediately after containers healthy (< 15 minutes post-deploy).

### 5.1 Automated / scripted

| # | Test | Command / action | Expected |
|---|------|------------------|----------|
| S1 | API root | `curl -fsS $PUBLIC_URL/api/` | `"ok":true` |
| S2 | Health | `curl -fsS $PUBLIC_URL/api/health` | `database.ok: true` |
| S3 | Metrics | `curl -fsS $PUBLIC_URL/api/metrics` | Prometheus text (if exposed) |
| S4 | API regression | `RC_API_BASE_URL=$PUBLIC_URL/api python backend_test.py` | PO-approved subset PASS |
| S5 | Bridge unit (ops workstation) | `npm run test:bridge` on SHA | PASS |
| S6 | VPS post-deploy script | `scripts/ops/post-deploy-smoke.sh` (if on tree) | PASS |

### 5.2 Manual (CS + Eng)

| # | Test | Expected |
|---|------|----------|
| S7 | Login via Emergent (PO or CS user) | Dashboard loads |
| S8 | `GET /api/leads` authenticated | 200, org-scoped |
| S9 | `GET /api/kpis` | 200 |
| S10 | Create test lead (prefixed name) → delete | 201 / cleanup |
| S11 | n8n UI (ops network) | Login works |
| S12 | Verify flags still OFF (behavior: no plan blocks, bridge 404 for cookie on JWT-only paths) | Baseline |

Record results in [SMOKE_TEST_REPORT](../releases/SMOKE_TEST_REPORT.md).

---

## Phase 6 — Rollback

Trigger rollback if: smoke P0 failure, error rate spike, data integrity issue, or PO directive.

### 6.1 Fast flag rollback (no code change)

```bash
# Edit .env — set all three to false
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
docker compose up -d app
```

### 6.2 Full git rollback

```bash
cd /opt/asoftech-insightz
git reset --hard 0e1b7e826f60926e2f98ac529cf77dd468a9bcfc
docker compose up -d --build --remove-orphans
```

### 6.3 Mongo restore (if data issue)

Restore from Phase 2 dump per [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md).

| Step | Action | Owner |
|------|--------|-------|
| 6.R1 | PO authorizes rollback | PO |
| 6.R2 | Execute 6.1 or 6.2 | DevOps |
| 6.R3 | Re-run smoke S1–S8 | QA |
| 6.R4 | Document in DEPLOYMENT_LOG | Release Mgmt |

---

## Phase 7 — Success criteria

Deploy is **successful** when all criteria met:

| # | Criterion | Verify |
|---|-----------|--------|
| SC1 | `asoftech-app` container healthy | `docker compose ps` |
| SC2 | Git on VPS = Approved RC SHA | `git rev-parse HEAD` |
| SC3 | Smoke S1–S8 PASS | Smoke report |
| SC4 | No P0 errors in app logs (15 min) | Log review |
| SC5 | `ENFORCE_PLAN_LIMITS`, `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE` = `false` | `.env` |
| SC6 | `GET /api/health` — `database.ok: true` | curl |
| SC7 | PO accepts deploy completion | Sign-off |
| SC8 | CS notified — pilot tenant status | CS ticket |

**Feature flag phases** (D-1 through D-4) begin only after SC1–SC7 and per [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md).

---

## Phase 8 — Post-deploy monitoring (first 72 hours)

| Activity | Owner | Reference |
|----------|-------|-----------|
| Watch error rates / latency | DevOps | [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md) |
| CS pilot tenant check | CS | [RC3_PRODUCTION_GO_LIVE_CHECKLIST](../releases/RC3_PRODUCTION_GO_LIVE_CHECKLIST.md) |
| No flag changes without PO | All | Rollout plan |

---

## Sequence summary

```
Pre-deploy gates → Backup → Env validation → Deploy (Actions or manual)
    → Smoke → Success criteria → Monitor 72h → Phased flags (PO)
```

**Current state:** Sequence documented; **zero phases executed** awaiting publication + PO authorization.
