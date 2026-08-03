# RC-3 Production Go-Live Checklist

**Release:** R1.1 Foundation GA  
**Date:** 3 August 2026  
**Prerequisite:** RC-3 certification gates + staging checklist complete  

---

## Commercial GA gates (all required)

| Gate | Target | Status |
|------|--------|--------|
| Overall RC score | ≥ 90 | [ ] |
| Regression automation | 100% | [ ] |
| Security score | ≥ 95 | [ ] |
| Performance score | ≥ 90 | [ ] |
| Deployment | PASS (build + Docker + health) | [ ] |
| Feature flag matrix | 100% (live + automated) | [ ] |
| GitHub Actions RC-2 Validation | GREEN | [ ] |
| WS3 Tenant #1 | CS checklist complete | [ ] |
| PO epic sign-off | E-002, E-003, E-004 | [ ] |

**If any gate is open → Commercial GA = NO GO**

---

## Pre-production deploy

- [ ] Merge approved release branch to production pipeline branch (per E-001)
- [ ] RC-2 Validation workflow green on release commit
- [ ] Download artifact `rc2-validation` / `rc3-results.json`
- [ ] Production `.env` — all flags **OFF** for initial deploy:
  - `ENFORCE_PLAN_LIMITS=false`
  - `WEB_JWT_BRIDGE=false`
  - `AEO_SERVER_PROFILE=false`
- [ ] `MONGO_URL`, `DB_NAME`, JWT, webhook token, Razorpay, Emergent LLM set
- [ ] `docker build` + deploy via approved pipeline
- [ ] `GET https://<prod>/api/` → ok
- [ ] `backend_test.py` against production smoke URL (read-only tests only)

---

## Phased flag rollout (after stable flags-OFF period)

| Phase | Flags | Duration | Rollback |
|-------|-------|----------|----------|
| 1 | OFF OFF OFF | 48–72h baseline | Redeploy flags OFF |
| 2 | ON OFF OFF | Pilot tenant | Set ENFORCE only OFF |
| 3 | ON ON OFF | + bridge | Set WEB_JWT_BRIDGE OFF |
| 4 | ON ON ON | + AEO server | Set AEO_SERVER_PROFILE OFF |

Use `GRANDFATHER_ORG_IDS` only with PO approval for Tenant #1.

---

## Production monitoring (first 48 hours)

- [ ] 401/403/402 rates on `/api/leads`, `/api/products`, `/api/users/me`
- [ ] Audit: `aeo.profile.updated`, `subscription.activated`
- [ ] Error budget: bridge 404 vs 401 confusion
- [ ] n8n webhook success rate
- [ ] Razorpay webhook delivery
- [ ] LLM recommendation latency (Emergent)

---

## Rollback (verified)

- [ ] All Sprint 1 flags → `false`, redeploy (< 5 min)
- [ ] No database schema rollback required
- [ ] Mobile JWT clients unaffected when bridge OFF
- [ ] Server AEO data retained when profile flag OFF

---

## Sprint 2 / product scope

- [ ] **Sprint 2 NOT authorized** until this checklist + PO approval
- [ ] Do **not** begin: Customer 360, Opportunities, Campaign Engine, AI Agents, Native Mobile

---

## Production sign-off

| Gate | Verdict |
|------|---------|
| Commercial GA | GO / CONDITIONAL GO / NO GO |
| Production pilot (single tenant) | |
| Full commercial rollout | |

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering lead | | | |
| CS / Ops lead | | | |

---

## Exact actions before Commercial GA

1. Initialize git repo / push to GitHub hosting with `.github/workflows/rc-validation.yml`
2. Run **RC-2 Validation** workflow — confirm all steps green
3. Re-run `node scripts/assemble-rc3-evidence.mjs` with GHA artifact or update `rc3-results.json` `githubActionsExecuted: true`
4. Complete [RC3_STAGING_CHECKLIST.md](./RC3_STAGING_CHECKLIST.md) on staging
5. Execute Tenant #1 CS checklist (Phase 5) with PO-approved flags
6. PO written sign-off on E-002, E-003, E-004
7. Re-score RC ≥ 90 with `node scripts/generate-rc3-certification.mjs`
