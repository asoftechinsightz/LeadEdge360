# Sprint-1 Release Manifest

**Date:** 4 August 2026  
**Document type:** Release manifest (pre-publication)  
**Status:** **DRAFT** — Approved RC SHA not yet assigned  

---

## Release identity

| Field | Value |
|-------|-------|
| **Release name** | LeadEdge360 R1.1 Foundation GA — Sprint-1 RC |
| **Logical release ID** | `SPRINT1-RC-2026-08-03` |
| **Application version** | `0.1.0` (`package.json`) |
| **Release date** | **TBD** (deploy not authorized) |
| **Release owner** | Product Owner (AsoftechInsightz) |
| **Engineering contact** | Sprint-1 RC certification (RC-3) |

---

## Git & build

| Field | Value |
|-------|-------|
| **Approved RC SHA** | **TBD** — publish certified tree to GitHub |
| **Approved RC branch** | `main` (recommended) |
| **Pre-publication workstation tree** | `asoftech-insightz-v1.2.0/asoftech-insightz` |
| **GitHub remote (VPS)** | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |
| **Docker image tag (target)** | `asoftech-insightz-app:sprint1-rc-2026-08-03` or git-SHA tag |
| **Current production image** | `asoftech-insightz-app` (built `2026-08-03`, from `0e1b7e8` era) |

---

## Database

| Field | Value |
|-------|-------|
| **Database** | MongoDB 7 (`asoftech-mongo`) |
| **Schema version** | **No Sprint-1 migration** — flags OFF deploy requires no schema change |
| **DB name (compose)** | `asoftech_saas` (env: `DB_NAME`) |
| **Rollback** | No schema rollback scripts required for Sprint-1 flags |

---

## Feature flags (deploy defaults — all OFF)

| Flag | Deploy value | Epic |
|------|--------------|------|
| `ENFORCE_PLAN_LIMITS` | `false` | E-004 |
| `WEB_JWT_BRIDGE` | `false` | E-002 |
| `AEO_SERVER_PROFILE` | `false` | E-003 |
| `ALLOW_PUBLIC_DEMO_ORG` | `false` | Security (production) |
| `BILLING_TEST_MODE` | `false` | Security |

Sprint-1 **code ships disabled**; phased enable per [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md).

---

## Rollback version

| Field | Value |
|-------|-------|
| **Rollback git SHA** | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| **Rollback branch** | `feature/homepage-phase1` |
| **Rollback image** | Current `asoftech-insightz-app` @ container `2026-08-03T12:03:52Z` |
| **Rollback procedure** | [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) |

---

## Included epics & certification

| Epic | ID | RC-3 evidence |
|------|-----|---------------|
| Cookie ↔ JWT Bridge | E-002 | Implementation report; bridge tests PASS |
| Server AEO Profile | E-003 | Implementation report; AEO tests PASS |
| Plan limit enforcement | E-004 | Implementation report; billing tests PASS |
| Security Phase-0 | — | Security score 100/100 (RC-3); remediation docs |

**RC-3 overall:** 82/100 — Commercial GA **not** authorized at certification time.

---

## Dependencies (runtime)

| Package | RC tree version |
|---------|-----------------|
| `next` | 14.2.35 |
| `axios` | 1.19.0 |
| `mongodb` | 6.6.0 |
| Node (CI/VPS) | 20 |

---

## Sign-off block (pending publication)

| Role | SHA approval | Date |
|------|--------------|------|
| Engineering | Certified tree complete | 3 Aug 2026 |
| Product Owner | **Pending** — assign Approved RC SHA | _TBD_ |
| Infrastructure | **Pending** — post-publication | _TBD_ |

**This manifest is not valid for deploy until Approved RC SHA is filled and PO authorizes deploy.**
