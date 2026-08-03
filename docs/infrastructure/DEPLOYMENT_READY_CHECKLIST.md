# Deployment Ready Checklist

**Date:** 3 August 2026  
**Program:** LeadEdge360 Infrastructure P0 Remediation  
**Use when:** Product Owner approves production RC deploy  
**Do not execute** until all mandatory items are checked  

---

## P0 infrastructure fixes applied (this session)

| Item | Status |
|------|--------|
| `deploy.yml` → `cd /opt/asoftech-insightz` | **DONE** (local repo; push required) |
| `deploy.sh` default `APP_DIR` | **DONE** → `/opt/asoftech-insightz` |
| `.github/DEPLOY_SETUP.md` paths | **DONE** |

**Not performed:** deploy, `docker compose`, restart, feature flags.

---

## Phase A — Access & automation

| # | Check | Owner | Status |
|---|-------|-------|--------|
| A-01 | SSH ops path works: `ssh asoftech-vps` → `leadedge360` | Infra | [x] Verified |
| A-02 | CI SSH: `asoftech` + `asoftech_ci` key on `187.127.179.138` | Infra | [ ] Not verified |
| A-03 | `gh auth login` on ops workstation OR `GH_TOKEN` for audit | DevOps | [ ] Missing |
| A-04 | GitHub secret `VPS_HOST` = SSH-reachable IP (`187.127.179.138`) | DevOps | [ ] Not verified |
| A-05 | GitHub secret `VPS_USER` = user accepting `VPS_SSH_KEY` | DevOps | [ ] Not verified |
| A-06 | GitHub secret `VPS_SSH_KEY` (private key, CI-only) | DevOps | [ ] Not verified |
| A-07 | GitHub secret `PUBLIC_URL` = `https://app.asoftechinsightz.com` | DevOps | [ ] Not verified |
| A-08 | Optional `VPS_PORT` if not 22 | DevOps | [ ] |
| A-09 | P0 workflow path fix **pushed** to GitHub `main` | DevOps | [ ] Pending push |
| A-10 | `workflow_dispatch` Deploy test (dry run or staging) | DevOps | [ ] |

---

## Phase B — Production environment (`.env`)

Path: **`/opt/asoftech-insightz/.env`** — existence only, non-empty values.

| # | Variable | Status (3 Aug 2026) | Required for deploy |
|---|----------|---------------------|-------------------|
| B-01 | `JWT_SECRET` | **PRESENT** | Yes |
| B-02 | `N8N_WEBHOOK_SECRET` | **PRESENT** | Yes |
| B-03 | `N8N_WEBHOOK_ORG_ID` | **MISSING** | Yes |
| B-04 | `N8N_PASSWORD` | **PRESENT** | Yes |
| B-05 | `CORS_ORIGINS` | **PRESENT** | Yes |
| B-06 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` (RAZORPAY_KEY_ID) | **MISSING** | Yes |
| B-07 | `RAZORPAY_KEY_SECRET` (RAZORPAY_SECRET) | **MISSING** | Yes |
| B-08 | `RAZORPAY_WEBHOOK_SECRET` | **MISSING** | Yes |
| B-09 | `SMTP_HOST` | **MISSING** | Yes |
| B-10 | `SMTP_USER` | **MISSING** | Yes |
| B-11 | `SMTP_PASS` (SMTP_PASSWORD) | **MISSING** | Yes |
| B-12 | `EMERGENT_LLM_KEY` | **MISSING** | Yes |

| # | Sprint-1 flags (must be explicit `false`) | Status |
|---|-------------------------------------------|--------|
| B-13 | `ENFORCE_PLAN_LIMITS=false` | [ ] Add to `.env` |
| B-14 | `WEB_JWT_BRIDGE=false` | [ ] Add to `.env` |
| B-15 | `AEO_SERVER_PROFILE=false` | [ ] Add to `.env` |
| B-16 | `ALLOW_PUBLIC_DEMO_ORG=false` | [ ] Add for production |

---

## Phase C — Git / RC parity

| # | Check | Current (3 Aug 2026) | Target |
|---|-------|----------------------|--------|
| C-01 | Deploy directory | `/opt/asoftech-insightz` | Same |
| C-02 | Running SHA | `0e1b7e8` | **Approved RC SHA** |
| C-03 | Running branch | `feature/homepage-phase1` | `main` or release tag |
| C-04 | Sprint-1 files on tree (E-002/E-004/security) | **Absent** | Present post-checkout |
| C-05 | `git remote` | `arnav02champ/AsoftechLeadEdge360` | Confirm PO-approved repo |
| C-06 | RC-2 Validation GREEN on release commit | [ ] | Required |

**Approved RC reference:** `origin/main` on VPS repo = `5cb6f18` (deploy.yml default) — **confirm with PO** vs local Sprint-1 RC artifact.

---

## Phase D — Pre-deploy backup (on VPS)

| # | Action | Status |
|---|--------|--------|
| D-01 | Mongo dump to `/opt/asoftech/backups/` or dated folder | [ ] |
| D-02 | Copy `.env`, `docker-compose.yml` | [ ] |
| D-03 | `docker compose images` snapshot | [ ] |
| D-04 | Edge nginx config `/opt/asoftech-edge/` | [ ] |
| D-05 | Backup integrity (file size / list) | [ ] |

---

## Phase E — Deploy execution (PO approval only)

| # | Step | Command / action | Status |
|---|------|------------------|--------|
| E-01 | Maintenance notice | CS / PO | [ ] |
| E-02 | `cd /opt/asoftech-insightz` | SSH | [ ] |
| E-03 | `git fetch && git reset --hard <approved-sha>` | Not `feature/homepage-phase1` unless PO says so | [ ] |
| E-04 | Verify `.env` complete (Phase B) | [ ] |
| E-05 | `docker compose up -d --build --remove-orphans` | **Only after PO GO** | [ ] |
| E-06 | Wait healthy: `asoftech-app`, `asoftech-mongo` | [ ] |
| E-07 | `curl -fsS https://app.asoftechinsightz.com/api/health` | [ ] |

---

## Phase F — Post-deploy smoke (no flag enable)

| # | Test | Expected | Status |
|---|------|----------|--------|
| F-01 | `/api/health` | `ok: true`, Mongo connected | [ ] |
| F-02 | `/signin` | 200 | [ ] |
| F-03 | Authenticated `/api/leads` | 200 | [ ] |
| F-04 | `/api/kpis` | 200 | [ ] |
| F-05 | Razorpay health | keys configured | [ ] |
| F-06 | SMTP health | configured | [ ] |
| F-07 | `backend_test.py` against prod URL | Pass / agreed subset | [ ] |
| F-08 | Feature flags still OFF | [ ] |

---

## Phase G — Explicit prohibitions

- [ ] **Do not** enable `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, or `ENFORCE_PLAN_LIMITS` until phased rollout PO sign-off.
- [ ] **Do not** begin Sprint 2.
- [ ] **Do not** deploy without completing Phase B secrets.

---

## Readiness gate

| Gate | Ready? |
|------|--------|
| Infrastructure P0 path fix | **YES** (pending git push) |
| Environment secrets | **NO** — 7 missing |
| Git parity | **NO** |
| GitHub Actions secrets | **UNKNOWN** |
| **Overall deploy ready** | **NO** |

See [FINAL_INFRASTRUCTURE_SIGNOFF.md](./FINAL_INFRASTRUCTURE_SIGNOFF.md).
