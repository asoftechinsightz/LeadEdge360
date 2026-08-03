# Final Pre-Deployment Checklist

**Date:** 4 August 2026  
**Release:** Sprint-1 RC (E-002, E-003, E-004) + Phase 0 security  
**Deployment authorized:** **NO** — see [DEPLOYMENT_AUTHORIZATION_REQUEST.md](./DEPLOYMENT_AUTHORIZATION_REQUEST.md)  

---

## Status at checkpoint

| Workstream | Status |
|------------|--------|
| Sprint-1 engineering | Complete (certified locally) |
| Security remediation | Complete (docs) |
| Deploy path fix (GitHub `main`) | **Committed on VPS** `d96e63d` — **push failed** |
| GitHub CLI secrets | **Not verified** |
| Production secrets | **7 MISSING** |
| RC SHA alignment | **NOT ALIGNED** |
| Deploy executed | **NO** |

---

## Mandatory gates (all required before deploy)

### A. GitHub

| # | Item | Status |
|---|------|--------|
| A-01 | `deploy.yml` → `/opt/asoftech-insightz` on remote `main` | [ ] Push `d96e63d` or re-apply |
| A-02 | `deploy.sh` default `APP_DIR` | [ ] Same commit on remote |
| A-03 | `DEPLOY_SETUP.md` paths | [ ] Same commit on remote |
| A-04 | `gh auth login` + `gh secret list` | [ ] |
| A-05 | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL` | [ ] Unverified |
| A-06 | RC-2 Validation GREEN on approved SHA | [ ] |

### B. VPS environment (`/opt/asoftech-insightz/.env`)

| # | Variable | Status |
|---|----------|--------|
| B-01 | `N8N_WEBHOOK_ORG_ID` | **MISSING** |
| B-02 | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **MISSING** |
| B-03 | `RAZORPAY_KEY_SECRET` | **MISSING** |
| B-04 | `RAZORPAY_WEBHOOK_SECRET` | **MISSING** |
| B-05 | `SMTP_HOST` | **MISSING** |
| B-06 | `SMTP_USER` | **MISSING** |
| B-07 | `SMTP_PASS` | **MISSING** |
| B-08 | `EMERGENT_LLM_KEY` | **MISSING** |
| B-09 | `ENFORCE_PLAN_LIMITS=false` | [ ] Add explicit |
| B-10 | `WEB_JWT_BRIDGE=false` | [ ] Add explicit |
| B-11 | `AEO_SERVER_PROFILE=false` | [ ] Add explicit |

### C. Release alignment

| # | Item | Status |
|---|------|--------|
| C-01 | Approved RC SHA named by PO | [ ] See RC_SHA_ALIGNMENT_REPORT |
| C-02 | VPS checked out to approved SHA | [ ] Currently **misaligned** |
| C-03 | Sprint-1 files present on target SHA | [ ] Not on GitHub `main` today |
| C-04 | Backup completed | [ ] |

### D. Execution (PO authorization only)

| # | Item | Status |
|---|------|--------|
| D-01 | PO signs DEPLOYMENT_AUTHORIZATION_REQUEST | [ ] |
| D-02 | `docker compose up -d --build` | [ ] **Do not run** until GO |
| D-03 | Post-deploy smoke | [ ] |
| D-04 | Feature flags remain OFF | [ ] |

---

## VPS git state warning (4 Aug 2026)

Infrastructure attempt left VPS repo on **`main`** with **local commit** `d96e63d` (path fix). **Push to GitHub failed** (`Repository not found`). Running container was built from **`feature/homepage-phase1`** @ `0e1b7e8`.

**Before deploy:** restore intended branch/SHA or rebuild from approved RC after alignment.

---

## Explicit prohibitions until GO

- No `git pull` / reset on production without PO approval  
- No `docker compose`  
- No `systemctl restart`  
- No feature flag enablement  
- No application deployment  

---

## Related

- [RC_SHA_ALIGNMENT_REPORT.md](./RC_SHA_ALIGNMENT_REPORT.md)
- [PRODUCTION_SECRET_AUDIT.md](./PRODUCTION_SECRET_AUDIT.md)
- [DEPLOYMENT_AUTHORIZATION_REQUEST.md](./DEPLOYMENT_AUTHORIZATION_REQUEST.md)
- `docs/infrastructure/FINAL_INFRASTRUCTURE_SIGNOFF.md`
