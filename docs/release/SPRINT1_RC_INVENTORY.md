# Sprint-1 Release Candidate Inventory

**Date:** 4 August 2026  
**Release:** R1.1 Foundation GA — Sprint-1 RC  
**Epics:** E-002 · E-003 · E-004  
**Status:** RC **defined** on certified workstation tree — **not published** to GitHub  

---

## Authoritative Sprint-1 source tree

| Attribute | Value |
|-----------|-------|
| **Tree label** | `SPRINT1-RC-2026-08-03` (logical) |
| **Physical path** | `asoftech-insightz-v1.2.0/asoftech-insightz` (certified workstation copy) |
| **Package version** | `0.1.0` (`package.json`) |
| **Git repository** | **None** on certification workstation — SHA **pending publication** |
| **Certification** | RC-3 ([RC3_RELEASE_CERTIFICATION.md](../releases/RC3_RELEASE_CERTIFICATION.md)) |
| **Not authoritative for RC** | VPS `AsoftechLeadEdge360` @ `feature/homepage-phase1` or `main` (missing Sprint-1 deliverables) |

This inventory is the **single RC content definition** until PO assigns a Git SHA on remote.

---

## Deliverable verification

### E-002 — Cookie ↔ JWT Bridge

| Item | Path / artifact | In RC tree? |
|------|-----------------|-------------|
| Design | `docs/engineering/design/E-002_COOKIE_JWT_BRIDGE_DESIGN.md` | ✓ |
| Implementation report | `docs/releases/E-002_IMPLEMENTATION_REPORT.md` | ✓ |
| `lib/request-actor.js` | `isWebJwtBridgeEnabled()`, `resolveAuthDispatch()` | ✓ |
| `lib/mobile-routes.js` | Bridge + JWT mobile handlers | ✓ |
| `app/api/[[...path]]/route.js` | JWT-first + cookie bridge dispatch | ✓ |
| Flag | `WEB_JWT_BRIDGE` in `.env.example` (default `false`) | ✓ |
| Tests | `scripts/test-jwt-bridge.mjs`, `npm run test:bridge` | ✓ |
| RC flag matrix | `scripts/rc/flag-matrix.mjs` | ✓ |

### E-003 — Server AEO Profile

| Item | Path / artifact | In RC tree? |
|------|-----------------|-------------|
| Design | `docs/engineering/design/E-003_SERVER_AEO_PROFILE_DESIGN.md` | ✓ |
| Implementation report | `docs/releases/E-003_IMPLEMENTATION_REPORT.md` | ✓ |
| `lib/aeo/profile.js` | Server profile load/save | ✓ |
| `lib/aeo/preferences-merge.js` | `AEO_SERVER_PROFILE` gate | ✓ |
| `lib/aeo/compute.js`, `actions.js`, `prompts.js`, `recommendations.js` | AEO compute stack | ✓ |
| Flag | `AEO_SERVER_PROFILE` in `.env.example` (default `false`) | ✓ |
| Tests | `scripts/test-aeo-compute.mjs`, `npm run test:aeo` | ✓ |

### E-004 — Plan Limit Enforcement

| Item | Path / artifact | In RC tree? |
|------|-----------------|-------------|
| Design | `docs/engineering/design/E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md` | ✓ |
| Implementation report | `docs/releases/E-004_IMPLEMENTATION_REPORT.md` | ✓ |
| `lib/billing/plan-entitlements.js` | `checkEntitlement()`, flag gate | ✓ |
| `lib/billing/activate-payment.js`, `org-billing.js`, `audit.js` | Billing activation | ✓ |
| `app/api/[[...path]]/route.js` | Entitlement checks on gated routes | ✓ |
| Flag | `ENFORCE_PLAN_LIMITS`, `GRANDFATHER_ORG_IDS` in `.env.example` | ✓ |
| Tests | `scripts/simulate-billing-flow.mjs`, `npm run test:billing` | ✓ |

### Security Phase-0 remediation

| Item | Path / artifact | In RC tree? |
|------|-----------------|-------------|
| `lib/security-config.js` | JWT, webhook, CORS, billing simulate gates | ✓ |
| `lib/jwt.js` | `getJwtSecret()` | ✓ |
| `lib/tenant.js` | `isPublicDemoAllowed()`, unauthenticated gate | ✓ |
| `next.config.js` | Security headers via `getSecurityHeaders()` | ✓ |
| `docker-compose.yml` | n8n password required | ✓ |
| Dependency bumps | `axios@1.19.0`, `next@14.2.35` in `package.json` | ✓ |
| Security docs | `docs/security/SECURITY_*_REPORT.md` (3 post-remediation) | ✓ |
| Audit baseline | `docs/security/01`–`15` | ✓ |

### RC validation & automation

| Item | Path | In RC tree? |
|------|------|-------------|
| RC-2 workflow | `.github/workflows/rc-validation.yml` | ✓ |
| Deploy workflow (path fixed locally) | `.github/workflows/deploy.yml` | ✓ |
| RC master runner | `scripts/rc-ci-runner.mjs` | ✓ |
| RC suites | `scripts/rc/security.mjs`, `performance.mjs`, `deployment.mjs`, `flag-matrix.mjs` | ✓ |
| RC-2/RC-3 report generators | `scripts/generate-rc2-reports.mjs`, `generate-rc3-certification.mjs`, etc. | ✓ |
| API regression | `backend_test.py` | ✓ |
| RC artifacts | `docs/releases/rc2-artifacts/`, `rc3-artifacts/` | ✓ |

### Documentation (release & ops)

| Area | Location | In RC tree? |
|------|----------|-------------|
| Sprint-1 reports | `docs/releases/E-002|003|004_*.md`, `RC3_*.md` | ✓ |
| Production ops | `docs/release/PRODUCTION_*.md` | ✓ |
| Security | `docs/security/*` | ✓ |
| Infrastructure | `docs/infrastructure/*` | ✓ |
| Env template | `.env.example` | ✓ |
| Deploy bootstrap | `deploy.sh`, `DEPLOYMENT.md`, `.github/DEPLOY_SETUP.md` | ✓ |

---

## RC certification evidence (workstation)

| Suite | Result (RC-3) |
|-------|----------------|
| `test:aeo` | PASS |
| `test:bridge` | PASS |
| `test:billing` | PASS (Mongo) |
| Security suite | 5/5 |
| Performance suite | 4/4 |
| Flag matrix | 24/24 |
| `yarn build` | Not run / FAIL |
| GitHub Actions RC-2 | Not executed |
| `backend_test.py` | Not run against prod build |

---

## Gaps vs production VPS (inventory only)

Sprint-1 RC files **absent** on VPS Git branches `main` and `feature/homepage-phase1`:

- `lib/security-config.js`
- `lib/request-actor.js`
- `lib/billing/plan-entitlements.js`
- Full E-002/E-003/E-004 integration as certified locally

**Publication action:** Commit certified tree to GitHub; tag `sprint1-rc-2026-08-03`; record SHA in [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md).

---

## Inventory verdict

| Question | Answer |
|----------|--------|
| Sprint-1 deliverables complete in RC tree? | **YES** (certified workstation copy) |
| RC published as single Git SHA? | **NO** |
| Ready for deploy from GitHub today? | **NO** |

See [RC_SOURCE_OF_TRUTH.md](./RC_SOURCE_OF_TRUTH.md) and [GO_LIVE_GATE_MATRIX.md](./GO_LIVE_GATE_MATRIX.md).
