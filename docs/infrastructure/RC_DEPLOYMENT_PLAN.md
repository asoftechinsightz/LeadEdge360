# RC Deployment Plan

**Date:** 3 August 2026  
**Release:** Sprint-1 RC (E-002, E-003, E-004) + Phase 0 security  
**Status:** **PLAN ONLY** — no deploy executed  

---

## Objective

Deploy the PO-approved Release Candidate to production VPS at **`/opt/asoftech-insightz`** with Sprint-1 feature flags **OFF**, after infrastructure blockers are closed.

---

## Preconditions (must be green)

| # | Gate | Owner |
|---|------|-------|
| 1 | [FINAL_INFRASTRUCTURE_SIGNOFF.md](./FINAL_INFRASTRUCTURE_SIGNOFF.md) — Infrastructure **GO** | Infra PO |
| 2 | [PRODUCTION_ENVIRONMENT_STATUS.md](./PRODUCTION_ENVIRONMENT_STATUS.md) — all mandatory secrets **PRESENT** | Infra |
| 3 | [GITHUB_ACTIONS_STATUS.md](./GITHUB_ACTIONS_STATUS.md) — secrets verified | DevOps |
| 4 | PO approves specific **git SHA** (not `feature/homepage-phase1` unless explicit) | PO |
| 5 | RC-2 Validation workflow **GREEN** on that SHA | Eng |
| 6 | Backup completed per [DEPLOYMENT_READY_CHECKLIST.md](./DEPLOYMENT_READY_CHECKLIST.md) Phase D | DevOps |

---

## Target topology

```
GitHub (arnav02champ/AsoftechLeadEdge360)
        │ push main / workflow_dispatch
        ▼
GitHub Actions: Deploy to VPS
        │ SSH (VPS_USER + VPS_SSH_KEY)
        ▼
VPS leadedge360 (187.127.179.138)
  /opt/asoftech-insightz
    docker compose: app, mongo, n8n
        ▲
asoftech-edge-nginx (TLS, routing)
        ▲
https://app.asoftechinsightz.com
```

---

## Planned execution sequence

### Step 1 — Freeze & communicate

- Announce maintenance window (if needed).
- Record current SHA: `0e1b7e8` (`feature/homepage-phase1`).
- Confirm rollback SHA for fast revert.

### Step 2 — Backup (VPS)

```bash
ssh asoftech-vps   # root@187.127.179.138
BACKUP=/opt/asoftech/backups/pre-rc-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP"
cd /opt/asoftech-insightz
docker exec asoftech-mongo mongodump --archive="$BACKUP/mongo.archive.gz" --gzip
cp .env docker-compose.yml "$BACKUP/"
docker compose images > "$BACKUP/images.txt"
cp -r /opt/asoftech-edge/nginx.conf "$BACKUP/" 2>/dev/null || true
git rev-parse HEAD > "$BACKUP/git-sha.txt"
```

### Step 3 — Environment

- Populate missing secrets in `/opt/asoftech-insightz/.env` (see PRODUCTION_ENVIRONMENT_STATUS).
- Set explicitly:

```env
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
ALLOW_PUBLIC_DEMO_ORG=false
```

- `chmod 600 .env`

### Step 4 — Code sync

**Option A — GitHub Actions (preferred after P0 push):**

1. Push workflow fix + approved RC to `main` (or trigger with workflow_dispatch from release branch if policy changes).
2. Monitor Actions: `test` job → `build-and-deploy`.
3. Confirm SSH script uses `/opt/asoftech-insightz`.

**Option B — Manual break-glass (ops SSH):**

```bash
cd /opt/asoftech-insightz
git fetch --all
git checkout main   # or approved branch
git reset --hard <APPROVED_RC_SHA>
```

### Step 5 — Build & start (PO GO only)

```bash
cd /opt/asoftech-insightz
docker compose up -d --build --remove-orphans
docker compose ps
```

Wait until `asoftech-app` and `asoftech-mongo` report healthy.

### Step 6 — Smoke tests

```bash
curl -fsS https://app.asoftechinsightz.com/api/health
curl -fsS -o /dev/null -w '%{http_code}\n' https://app.asoftechinsightz.com/signin
# Authenticated: GET /api/leads, /api/kpis
RC_API_BASE_URL=https://app.asoftechinsightz.com/api python backend_test.py
```

### Step 7 — Sign-off

- Update deployment reports in `docs/releases/`.
- PO verifies smoke results.
- **Do not** enable Sprint-1 flags until [FEATURE_FLAG_ROLLOUT_PLAN](../release/FEATURE_FLAG_ROLLOUT_PLAN.md).

---

## SHA strategy

| Ref | SHA | Notes |
|-----|-----|-------|
| **Current production** | `0e1b7e8` | `feature/homepage-phase1` — Sprint17 homepage |
| **VPS `main`** | `5cb6f18` | CRM Phase 1-6 stable |
| **Tag `v1.2.0`** | `6f4fea1` | Older tagged release on same repo |
| **Approved Sprint-1 RC** | **PO must confirm** | Local `asoftech-insightz-v1.2.0` artifact may differ from GitHub tree |

**Deploy must not proceed** until PO names a single authoritative SHA.

---

## Rollback (if needed)

```bash
cd /opt/asoftech-insightz
git reset --hard <PREVIOUS_SHA>   # e.g. 0e1b7e8
docker compose up -d --build --remove-orphans
# Restore .env from backup if changed
```

See [PRODUCTION_ROLLBACK_GUIDE](../release/PRODUCTION_ROLLBACK_GUIDE.md).

---

## Out of scope (this plan)

- Application code changes
- Database schema migrations
- Enabling `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, `ENFORCE_PLAN_LIMITS`
- Sprint 2 work

---

## Current readiness

| Item | Ready? |
|------|--------|
| Deploy path in workflow | **YES** (local; push pending) |
| Secrets on VPS | **NO** |
| SHA parity | **NO** |
| PO deploy authorization | **NO** |

**Do not execute Steps 5–7 until Infrastructure and PO sign-off.**
