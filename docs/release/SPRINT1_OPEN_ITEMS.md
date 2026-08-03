# Sprint-1 Open Items

**Date:** 4 August 2026  
**Release:** `SPRINT1-RC-2026-08-03`  
**Purpose:** Single register of all blockers for publication and deployment  
**Status:** **16 open items** — deploy **NOT authorized**  

---

## Summary

| Priority | Count | Meaning |
|----------|-------|---------|
| **P0** | 8 | Must close before deploy authorization |
| **P1** | 5 | Must close or PO-waive before Commercial GA / full QA sign-off |
| **P2** | 3 | Pre-deploy hygiene — close before or during deploy window |

---

## P0 — Deploy blockers

| ID | Item | Owner | Expected resolution |
|----|------|-------|-------------------|
| P0-01 | **Approved RC SHA does not exist** — certified tree not on GitHub | PO + Eng | PO approves repo; Eng publishes certified tree; tag `sprint1-rc-2026-08-03`; record SHA in manifest |
| P0-02 | **Sprint-1 RC not on production Git** — `lib/security-config.js`, `lib/request-actor.js`, `lib/billing/plan-entitlements.js` absent on VPS `main` and `feature/homepage-phase1` | Eng + DevOps | Publish RC SHA; VPS `git reset --hard <sha>` before build (post PO GO) |
| P0-03 | **GitHub push failed** — VPS local `d96e63d` not on remote (`Repository not found`) | Infra + PO | Fix `arnav02champ/AsoftechLeadEdge360` access or correct remote URL; push path fix + RC |
| P0-04 | **Production secrets incomplete** — `N8N_WEBHOOK_ORG_ID`, Razorpay (3), SMTP (3), `EMERGENT_LLM_KEY` **MISSING** | PO + Infra | PO supplies credentials; append to `/opt/asoftech-insightz/.env`; `chmod 600` |
| P0-05 | **GitHub Actions secrets unverified** — `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL` | DevOps | `gh auth login`; `gh secret list`; populate missing secrets |
| P0-06 | **RC-2 Validation not GREEN** on published SHA | DevOps + Eng | Push RC; run `.github/workflows/rc-validation.yml` on SHA; all jobs green |
| P0-07 | **PO deployment authorization not signed** | PO | Sign [DEPLOYMENT_AUTHORIZATION_REQUEST](../releases/DEPLOYMENT_AUTHORIZATION_REQUEST.md) after P0-01–P0-06 |
| P0-08 | **VPS runtime misalignment** — disk `main` @ `d96e63d`; running container from `0e1b7e8` / `feature/homepage-phase1` | DevOps | Align git + rebuild container on Approved RC SHA during authorized deploy |

---

## P1 — QA / Commercial / certification

| ID | Item | Owner | Expected resolution |
|----|------|-------|-------------------|
| P1-01 | **Overall RC score 82/100** — below 90 target | Eng | Close regression + build gates; re-run RC-3; or PO documents waiver |
| P1-02 | **Regression 92.3%** — target 100% | QA + Eng | Run `backend_test.py`; fix or document accepted gaps |
| P1-03 | **`yarn build` / Docker build not passed** on certification host | Eng | `yarn build` + `docker compose build` on Approved SHA; log in RC artifact |
| P1-04 | **`backend_test.py` not executed** against production-mode build | QA | Run against staging/prod URL post-publication; record in regression report |
| P1-05 | **Commercial readiness 49/100** — Razorpay/checkout not live on prod | PO + Commercial | Configure Razorpay; validate webhook; separate Commercial GA decision |

---

## P2 — Pre-deploy hygiene

| ID | Item | Owner | Expected resolution |
|----|------|-------|-------------------|
| P2-01 | **Mongo + config backup not performed** | DevOps | Execute Phase 2 of [SPRINT1_DEPLOYMENT_SEQUENCE.md](./SPRINT1_DEPLOYMENT_SEQUENCE.md) before deploy |
| P2-02 | **Sprint-1 flags not explicit `false`** in production `.env` | DevOps | Add `ENFORCE_PLAN_LIMITS=false`, `WEB_JWT_BRIDGE=false`, `AEO_SERVER_PROFILE=false`, `ALLOW_PUBLIC_DEMO_ORG=false` |
| P2-03 | **Post-deploy smoke not executed** | QA + DevOps | Run Phase 5 smoke after authorized deploy; file [SMOKE_TEST_REPORT](../releases/SMOKE_TEST_REPORT.md) |

---

## Additional tracked items (not deploy P0 but affect sign-off)

| ID | Item | Owner | Expected resolution |
|----|------|-------|-------------------|
| T-01 | Customer Success WS3 pilot checklist not closed on target RC | CS | Execute on staging/RC URL; [RC3_PRODUCTION_GO_LIVE_CHECKLIST](../releases/RC3_PRODUCTION_GO_LIVE_CHECKLIST.md) |
| T-02 | Live HTTP flag matrix on staging not executed | QA | CS staging session with 4 flag combinations |
| T-03 | Workstation certified tree not a git repository | Eng | `git init` + push or export to GitHub repo |
| T-04 | PO security decision checklist unsigned | PO + Security | [15_PO_SECURITY_DECISION](../security/15_PO_SECURITY_DECISION.md) |
| T-05 | CI SSH path (`asoftech` + `asoftech_ci` key) not verified | Infra | Validate Actions SSH user separate from ops `root` |
| T-06 | npm audit — 2 high (next/postcss), 1 moderate (uuid) | Eng | Track; upgrade path post-Sprint-1 if PO approves |

---

## Closure workflow

```
P0-01 Publication → P0-03 Push → P0-05 Secrets (GH) → P0-04 Secrets (VPS)
    → P0-06 RC-2 green → P1 build/test → P2 backup + env → P0-07 PO sign → P0-08 Deploy
```

**Current step:** P0-01 (publication) — **not started**.

---

## Cross-reference

| Document | Role |
|----------|------|
| [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) | Prior NO GO decision |
| [GO_LIVE_GATE_MATRIX.md](./GO_LIVE_GATE_MATRIX.md) | Gate colors |
| [SPRINT1_PRODUCTION_SIGNOFF.md](./SPRINT1_PRODUCTION_SIGNOFF.md) | Stakeholder status |
| [DEPLOYMENT_READY_CHECKLIST](../infrastructure/DEPLOYMENT_READY_CHECKLIST.md) | Infra checklist |

**No item in this register authorizes deploy until PO explicitly approves after P0 closure.**
