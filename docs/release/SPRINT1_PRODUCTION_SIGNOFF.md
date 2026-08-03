# Sprint-1 Production Sign-off

**Date:** 4 August 2026  
**Release:** `SPRINT1-RC-2026-08-03`  
**Deployment authorized:** **NO**  
**Publication complete:** **Partial** — documentation package; Git SHA pending  

---

## How to use

Each stakeholder section lists items as **Approved**, **Pending**, or **Rejected**.  
**Deploy requires:** all P0 items Approved (or PO-waived in writing); no Rejected P0 items.

---

## Engineering

### Approved

| Item | Evidence |
|------|----------|
| E-002 Cookie ↔ JWT Bridge implemented | [E-002_IMPLEMENTATION_REPORT](../releases/E-002_IMPLEMENTATION_REPORT.md) |
| E-003 Server AEO Profile implemented | [E-003_IMPLEMENTATION_REPORT](../releases/E-003_IMPLEMENTATION_REPORT.md) |
| E-004 Plan limit enforcement implemented | [E-004_IMPLEMENTATION_REPORT](../releases/E-004_IMPLEMENTATION_REPORT.md) |
| Security Phase-0 code complete in certified tree | [SECURITY_REMEDIATION_REPORT](../security/SECURITY_REMEDIATION_REPORT.md) |
| `test:bridge` PASS (8 checks) | RC-3 |
| `test:aeo` PASS | RC-3 |
| `test:billing` PASS (Mongo) | RC-3 |
| Feature flag matrix 24/24 PASS | RC-3 |
| RC validation scripts in tree | [SPRINT1_RC_INVENTORY.md](./SPRINT1_RC_INVENTORY.md) |
| Deploy path fix in local tree (`deploy.yml`, `deploy.sh`) | Local / VPS `d96e63d` |

### Pending

| Item | Blocker |
|------|---------|
| Approved RC SHA on GitHub | Publication not done |
| `yarn build` / Docker build PASS on release SHA | Not run on certification host |
| `backend_test.py` on production-mode build | Not executed |
| RC score ≥ 90 (current 82) | Regression 92.3% |
| RC-2 Validation GREEN on published SHA | GitHub Actions not run |
| Merge `feature/homepage-phase1` vs clean RC publish | PO decision on publication strategy |

### Rejected

| Item | Reason |
|------|--------|
| Deploy from current VPS Git without publication | Sprint-1 files absent on VPS branches |
| Deploy from workstation copy without Git SHA | Not authoritative for automation |

---

## QA

### Approved

| Item | Evidence |
|------|----------|
| Unit/dispatch tests for bridge | `npm run test:bridge` PASS |
| AEO merge/compute tests | `npm run test:aeo` PASS |
| Billing simulation (Mongo) | `npm run test:billing` PASS |
| Security RC suite 5/5 | RC-3 |
| Performance RC suite 4/4 | RC-3 |
| Flag combination automation 24/24 | RC-3 |

### Pending

| Item | Blocker |
|------|---------|
| `backend_test.py` full regression on target URL | Not run |
| Live HTTP flag matrix on staging | Not executed |
| Post-deploy smoke suite | Deploy not authorized |
| Regression 100% (current 92.3%) | Open gate |
| Staging checklist complete | [RC3_STAGING_CHECKLIST](../releases/RC3_STAGING_CHECKLIST.md) |

### Rejected

| Item | Reason |
|------|--------|
| Production smoke sign-off | No deploy occurred |
| QA GO for Commercial GA | RC-3 Commercial GA NO |

---

## Security

### Approved

| Item | Evidence |
|------|----------|
| C-01 through C-03 remediated in RC tree | Security retest PASS |
| H-01 through H-08 remediated in RC tree | Security retest PASS |
| RC-3 security score 100/100 (code) | [RC3_SECURITY_CERTIFICATE](../releases/RC3_SECURITY_CERTIFICATE.md) |
| `lib/security-config.js` centralized gates | Code review |
| n8n password required in compose | `docker-compose.yml` |
| Dependency upgrades (axios, next) | `package.json` |

### Pending

| Item | Blocker |
|------|---------|
| Phase-0 code on production host | RC not deployed |
| Production secrets complete | 7 vars missing |
| `ALLOW_PUBLIC_DEMO_ORG=false` explicit on prod | Not set |
| npm audit highs (next/postcss) | Tracked — 2 high, 1 moderate |
| PO security decision checklist | [15_PO_SECURITY_DECISION](../security/15_PO_SECURITY_DECISION.md) unsigned |

### Rejected

| Item | Reason |
|------|--------|
| Security sign-off for production state | Running prod lacks Phase-0 code |
| Webhook org ID unset | `N8N_WEBHOOK_ORG_ID` missing |

---

## Infrastructure

### Approved

| Item | Evidence |
|------|----------|
| SSH ops access (`asoftech-vps` → `leadedge360`) | [SSH_VALIDATION_REPORT](../infrastructure/SSH_VALIDATION_REPORT.md) |
| Production app healthy (`asoftech-app`) | System health reports |
| Mongo running (`asoftech-mongo`) | Health API `database.ok: true` |
| Correct app path identified (`/opt/asoftech-insightz`) | Infra audit |
| Edge nginx (`asoftech-edge-nginx`) operational | VPS audit |
| Deploy path fix documented locally | `d96e63d` on VPS disk |

### Pending

| Item | Blocker |
|------|---------|
| GitHub push of path fix / RC | `Repository not found` |
| GitHub Actions secrets verified | `gh` not authenticated |
| VPS aligned to Approved RC SHA | SHA TBD |
| VPS disk ↔ container alignment | Disk `d96e63d` vs container `0e1b7e8` |
| Pre-deploy backup | Not performed |
| CI SSH user/key for Actions | Not verified |
| Production `.env` complete | 7 secrets missing |

### Rejected

| Item | Reason |
|------|--------|
| Infrastructure GO for deploy | [INFRASTRUCTURE_GO_NO_GO](../infrastructure/INFRASTRUCTURE_GO_NO_GO.md) NO GO |
| Deploy from `origin/main` today | `5cb6f18` lacks Sprint-1 RC |

---

## Customer Success

### Approved

| Item | Evidence |
|------|----------|
| Feature flag rollout plan documented | [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md) |
| Production operations guide | [PRODUCTION_OPERATIONS_GUIDE.md](./PRODUCTION_OPERATIONS_GUIDE.md) |
| Go-live playbook for CS phases | [PRODUCTION_GO_LIVE_PLAYBOOK.md](./PRODUCTION_GO_LIVE_PLAYBOOK.md) |
| Flags OFF deploy strategy (no user-visible Sprint-1 change day 1) | Release charter |

### Pending

| Item | Blocker |
|------|---------|
| Tenant #1 WS3 pilot checklist on target RC | [RC3_PRODUCTION_GO_LIVE_CHECKLIST](../releases/RC3_PRODUCTION_GO_LIVE_CHECKLIST.md) |
| Staging validation of E-002/E-003/E-004 | Staging not on RC SHA |
| Maintenance window communication plan | Awaiting deploy date |
| CS training on phased flag rollout | Awaiting PO flag schedule |
| Pilot tenant smoke (manual) | Post-deploy |

### Rejected

| Item | Reason |
|------|--------|
| CS GO for go-live | WS3 checklist not closed |
| User-facing Sprint-1 enablement | Flags must stay OFF at deploy |

---

## Commercial

### Approved

| Item | Evidence |
|------|----------|
| E-004 billing code present (flag-gated) | E-004 report |
| Plan entitlements logic tested locally | `test:billing` PASS |
| Commercial flag OFF at deploy documented | Manifest |

### Pending

| Item | Blocker |
|------|---------|
| Razorpay keys on production | All 3 missing |
| Live checkout / webhook validation | Keys required |
| Commercial readiness score (49/100) | Below GA threshold |
| PO decision live vs test Razorpay keys | Awaiting PO |

### Rejected

| Item | Reason |
|------|--------|
| Commercial GA authorization | RC-3 Commercial GA **NO** |
| Billing live on production | `razorpay.ok: false` on health API |

---

## Product Owner

### Approved

| Item | Evidence |
|------|----------|
| Sprint-1 epic scope (E-002, E-003, E-004) | Engineering reports |
| Flags OFF deploy charter | Release package |
| Documentation release package structure | This program |

### Pending

| Item | Blocker |
|------|---------|
| Assign Approved RC SHA | Git publication |
| Authorize GitHub publication | Repo access / push |
| Sign deployment authorization | [DEPLOYMENT_AUTHORIZATION_REQUEST](../releases/DEPLOYMENT_AUTHORIZATION_REQUEST.md) |
| Approve rollback SHA acceptance (`0e1b7e8`) | Documented default |
| Waivers for RC score &lt; 90 (if any) | Not granted |
| Supply production secrets | 7 credentials |
| Approve deploy date / maintenance window | TBD |
| Per-phase flag rollout approvals | Post-deploy |

### Rejected

| Item | Reason |
|------|--------|
| Production deployment authorization | [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) NO GO |
| Sprint-1 Ready for Publication (Git SHA) | SHA TBD |

---

## Sign-off summary

| Stakeholder | Approved | Pending | Rejected | Deploy GO? |
|-------------|----------|---------|----------|------------|
| Engineering | 10 | 6 | 2 | **NO** |
| QA | 6 | 5 | 2 | **NO** |
| Security | 7 | 5 | 2 | **NO** |
| Infrastructure | 6 | 7 | 2 | **NO** |
| Customer Success | 4 | 5 | 2 | **NO** |
| Commercial | 3 | 4 | 2 | **NO** |
| Product Owner | 3 | 8 | 2 | **NO** |

**Overall production deploy sign-off:** **NOT APPROVED**

**Next:** Close P0 items in [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md); PO re-signs when ready.

---

## Signature block (for PO use after blockers closed)

| Role | Name | Approved RC SHA | Date | Signature |
|------|------|-----------------|------|-----------|
| Product Owner | | | | |
| Engineering | | | | |
| QA | | | | |
| Security | | | | |
| Infrastructure | | | | |
| Customer Success | | | | |
| Commercial | | | | |
| Release Management | | | | |

**STOP** — No deployment until PO authorization document signed.
