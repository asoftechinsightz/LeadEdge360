# Deployment Authorization Request

**Date:** 4 August 2026  
**From:** Infrastructure / Release Engineering  
**To:** Product Owner  
**Subject:** Sprint-1 RC production deploy — **authorization withheld**  

---

## Request

Authorize production deployment of **Sprint-1 Release Candidate** (E-002, E-003, E-004) with feature flags **OFF**, after closing blockers below.

**Current recommendation:** **Do not authorize deploy.**

---

## Final decision matrix

| Prerequisite | Ready? | Evidence |
|--------------|--------|----------|
| **GitHub Ready?** | **NO** | Path fix commit `d96e63d` on VPS `main` only; **push failed**; `gh` not authenticated locally |
| **VPS Ready?** | **PARTIAL** | SSH OK; app healthy; git on `main` @ `d96e63d` (disk ≠ running container SHA) |
| **Secrets Complete?** | **NO** | 8 variables **MISSING** ([PRODUCTION_SECRET_AUDIT.md](./PRODUCTION_SECRET_AUDIT.md)) |
| **RC SHA Aligned?** | **NO** | Running `0e1b7e8` ≠ certified RC (no published SHA) |
| **Deployment Authorized?** | **NO** | This document |

---

## Verdict

# **NO GO**

Deployment is **not authorized**. All incomplete prerequisites must be closed before explicit PO deploy approval.

---

## Workstream results (4 Aug 2026)

### Workstream 1 — GitHub push

| Item | Result |
|------|--------|
| Local Downloads workspace | **Not a git repo** — cannot push from workstation |
| VPS commit on `main` | **`d96e63d`** — `infra: align deploy path to /opt/asoftech-insightz (P0)` |
| Files in commit | `deploy.yml`, `deploy.sh`, `.github/DEPLOY_SETUP.md` |
| `git push origin main` | **FAILED** — `Repository not found` |
| Remote | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |

### Workstream 2 — GitHub Actions secrets

| Secret | Verified? |
|--------|-----------|
| `VPS_HOST` | **NO** — `gh auth login` required |
| `VPS_USER` | **NO** |
| `VPS_SSH_KEY` | **NO** |
| `PUBLIC_URL` | **NO** |

**Action:** `gh auth login` → `gh secret list` on repo with deploy workflow.

### Workstream 3 — VPS secrets

All 8 target variables **MISSING**. No population performed.

### Workstream 4 — Release alignment

| Item | Value |
|------|-------|
| Running (container era) | `0e1b7e8` / `feature/homepage-phase1` |
| Certified Sprint-1 RC SHA | **Not on GitHub** |
| Alignment | **FAIL** — see [RC_SHA_ALIGNMENT_REPORT.md](./RC_SHA_ALIGNMENT_REPORT.md) |

---

## Blockers requiring PO / Infra action

| Priority | Blocker | Owner |
|----------|---------|-------|
| P0 | Publish Sprint-1 RC to GitHub; name **Approved RC SHA** | PO / Eng |
| P0 | Fix GitHub push (`Repository not found` / repo access) | Infra |
| P0 | Populate 8 missing `.env` secrets | PO + Infra |
| P0 | Verify GitHub Actions secrets | DevOps |
| P1 | Push or cherry-pick `d96e63d` path fix to remote `main` | DevOps |
| P1 | Restore VPS git to approved SHA before build | DevOps |
| P1 | RC-2 Validation GREEN on approved SHA | Eng |

---

## What PO authorization would enable (not yet approved)

1. Backup Mongo + `.env` on VPS  
2. `git reset --hard <APPROVED_RC_SHA>` at `/opt/asoftech-insightz`  
3. `docker compose up -d --build`  
4. Post-deploy smoke ([FINAL_PRE_DEPLOYMENT_CHECKLIST.md](./FINAL_PRE_DEPLOYMENT_CHECKLIST.md))  
5. **Still do not enable** `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, `ENFORCE_PLAN_LIMITS` until phased rollout PO sign-off  

---

## Explicit STOP (in effect)

Until **GO** is issued:

- No `git pull` / reset on production  
- No `docker compose`  
- No `systemctl restart`  
- No feature flag changes  
- No application deployment  

---

## Sign-off

| Role | Decision | Date |
|------|----------|------|
| Infrastructure | **NO GO** — prerequisites incomplete | 4 Aug 2026 |
| Product Owner | _Awaiting_ — deploy **not authorized** | _pending_ |

Upon PO approval after blockers close, update this document to **GO** and execute [FINAL_PRE_DEPLOYMENT_CHECKLIST.md](./FINAL_PRE_DEPLOYMENT_CHECKLIST.md).
