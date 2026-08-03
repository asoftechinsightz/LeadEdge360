# Sprint-1 Release Package

**Document type:** Official release package — single source of truth  
**Date:** 4 August 2026  
**Release ID:** `SPRINT1-RC-2026-08-03`  
**Status:** **DRAFT** — Approved RC SHA pending publication  
**Deployment:** **NOT AUTHORIZED**  

---

## Purpose

This document is the authoritative Sprint-1 release package for Engineering, DevOps, QA, Customer Success, and Product Owner. It consolidates version identity, scope, security, environment, flags, rollback, and limitations.

**Companion index:**

| Document | Role |
|----------|------|
| [SPRINT1_RC_INVENTORY.md](./SPRINT1_RC_INVENTORY.md) | Deliverable checklist |
| [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md) | Manifest fields (SHA, image tag) |
| [RC_SOURCE_OF_TRUTH.md](./RC_SOURCE_OF_TRUTH.md) | Git alignment |
| [SPRINT1_DEPLOYMENT_SEQUENCE.md](./SPRINT1_DEPLOYMENT_SEQUENCE.md) | Deploy order |
| [SPRINT1_PRODUCTION_SIGNOFF.md](./SPRINT1_PRODUCTION_SIGNOFF.md) | Stakeholder sign-off |
| [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) | All blockers |
| [SPRINT1_HANDOVER.md](./SPRINT1_HANDOVER.md) | Team handover |

---

## Version

| Field | Value |
|-------|-------|
| **Application version** | `0.1.0` (`package.json`) |
| **Logical release ID** | `SPRINT1-RC-2026-08-03` |
| **Approved RC SHA** | **TBD** — assign on GitHub publication |
| **Approved RC branch** | `main` (recommended) |
| **Certified source tree** | `asoftech-insightz-v1.2.0/asoftech-insightz` (workstation) |
| **GitHub remote (VPS)** | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |
| **Docker image tag (target)** | `asoftech-insightz-app:sprint1-rc-2026-08-03` or git-SHA tag |
| **Release date** | **TBD** (awaiting PO deploy authorization) |
| **Release owner** | Product Owner (AsoftechInsightz) |

---

## Release name

**LeadEdge360 R1.1 Foundation GA — Sprint-1 Release Candidate**

Marketing label: **Sprint-1 RC** (E-002 · E-003 · E-004 + Security Phase-0).

---

## Approved features

Features ship in code but remain **disabled at deploy** via feature flags (default OFF).

| Feature | Epic | Flag | Deploy default |
|---------|------|------|----------------|
| Cookie ↔ JWT bridge for selected mobile API paths | E-002 | `WEB_JWT_BRIDGE` | `false` |
| Server-side AEO profile load/save | E-003 | `AEO_SERVER_PROFILE` | `false` |
| Plan limit enforcement (leads, products, webhooks, users) | E-004 | `ENFORCE_PLAN_LIMITS` | `false` |
| Grandfather org exemption list | E-004 | `GRANDFATHER_ORG_IDS` | empty |
| Security Phase-0 gates (JWT, webhook, CORS, demo org) | Security | env vars | enforced in production paths |
| RC validation automation | RC-2/RC-3 | — | CI + local scripts |
| Phased flag rollout playbook | Ops | — | documented |

**Not in Sprint-1 scope:** Sprint 2, new API contracts, schema migrations, Commercial GA checkout live on prod.

---

## Included epics

| Epic | ID | Summary | Evidence |
|------|-----|---------|----------|
| Cookie ↔ JWT Bridge | E-002 | JWT-first dispatch; cookie bridge to shared mobile handlers when flag ON | [E-002_IMPLEMENTATION_REPORT](../releases/E-002_IMPLEMENTATION_REPORT.md) |
| Server AEO Profile | E-003 | Server profile via `preferences.aeoProfile`; gated by `AEO_SERVER_PROFILE` | [E-003_IMPLEMENTATION_REPORT](../releases/E-003_IMPLEMENTATION_REPORT.md) |
| Plan Limit Enforcement | E-004 | `checkEntitlement()` on gated routes; billing activation integration | [E-004_IMPLEMENTATION_REPORT](../releases/E-004_IMPLEMENTATION_REPORT.md) |

**RC-3 certification:** Overall 82/100 — Commercial GA **not** authorized at certification time ([RC3_RELEASE_CERTIFICATION](../releases/RC3_RELEASE_CERTIFICATION.md)).

---

## Security fixes (Phase-0)

All **11 Critical/High** audit findings addressed in certified RC tree:

| ID | Finding | Fix summary |
|----|---------|-------------|
| C-01 | Default JWT secret | `getJwtSecret()` throws in production when weak/missing |
| C-02 | Webhook token bypass | `isIngestWebhookAllowed()` — no dev bypass in production |
| C-03 | npm critical CVEs | `axios@1.19.0`, `next@14.2.35` |
| H-01 | CORS `*` | `getCorsAllowOrigin()` — production uses `CORS_ORIGINS` |
| H-02 | Frame policy | `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'` |
| H-03 | Webhook org trust | `resolveWebhookOrgId()` — `body.orgId` ignored |
| H-04 | Lead assign IDOR | `findOne({ id, orgId })` scope |
| H-05 | Billing simulate in prod | `isBillingSimulateAllowed()` false in production |
| H-06 | n8n default password | `N8N_BASIC_AUTH_PASSWORD` required in compose |
| H-07 | Unauthenticated demo CRM | `isPublicDemoAllowed()` + 401 on CRM routes |
| H-08 | Axios CVEs | Upgraded to 1.19.0 |

**Reports:** [SECURITY_REMEDIATION_REPORT](../security/SECURITY_REMEDIATION_REPORT.md), [SECURITY_RETEST_REPORT](../security/SECURITY_RETEST_REPORT.md), [SECURITY_SCORECARD](../security/SECURITY_SCORECARD.md).

**RC-3 security score:** 100/100 (code). Production host **does not** contain Phase-0 code until RC is deployed.

---

## Database version

| Field | Value |
|-------|-------|
| **Engine** | MongoDB **7** (`mongo:7` image) |
| **Container** | `asoftech-mongo` |
| **Database name** | `asoftech_saas` (`DB_NAME`) |
| **Schema version** | **No Sprint-1 migration** — flags OFF deploy requires no schema change |
| **Rollback** | No schema rollback scripts required for Sprint-1 flag rollback |

---

## Docker version

| Component | Version / image |
|-----------|-----------------|
| **Compose format** | `3.9` |
| **App base image** | `node:20-alpine` (multi-stage Dockerfile) |
| **App container** | `asoftech-app` (build from repo `Dockerfile`) |
| **Mongo** | `mongo:7` |
| **n8n** | `n8nio/n8n:latest` |
| **Node runtime** | 20 |
| **Next.js** | 14.2.35 |
| **Production app path** | `/opt/asoftech-insightz` |

**Note:** Production VPS may use a hardened `docker-compose.yml` (read-only rootfs, healthcheck) that differs from the minimal RC tarball compose. Preserve VPS hardening during deploy reconciliation.

---

## Environment requirements

### Required variables (production)

Path: `/opt/asoftech-insightz/.env` — template: `.env.example`

| Category | Variables | Prod status (4 Aug 2026) |
|----------|-----------|--------------------------|
| Core | `MONGO_URL`, `DB_NAME`, `NEXT_PUBLIC_*`, `CORS_ORIGINS` | Partial — core present |
| Auth | `JWT_SECRET` (≥16 chars) | **PRESENT** |
| n8n | `N8N_BASIC_AUTH_PASSWORD`, `N8N_WEBHOOK_TOKEN`, `N8N_WEBHOOK_ORG_ID` | Token present; **ORG_ID MISSING** |
| Razorpay | `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | **MISSING** |
| SMTP | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | **MISSING** |
| AI | `EMERGENT_LLM_KEY` | **MISSING** |
| Security | `ALLOW_PUBLIC_DEMO_ORG=false`, `BILLING_TEST_MODE=false` | Not explicitly set |
| Sprint-1 flags | `ENFORCE_PLAN_LIMITS`, `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE` | Not explicitly set (must be `false`) |

### Infrastructure

| Requirement | Value |
|-------------|-------|
| VPS host | `leadedge360` / `187.127.179.138` |
| SSH | `ssh asoftech-vps` (ops) |
| Public URL | `https://app.asoftechinsightz.com` |
| Edge | `asoftech-edge-nginx` |
| GitHub Actions secrets | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL` — **unverified** |
| Disk | >30% free recommended |
| TLS | Valid certificate on public URL |

---

## Feature flags

Deploy charter: **all Sprint-1 flags OFF** at first production deploy.

| Flag | Default (`.env.example`) | Deploy value | Epic |
|------|--------------------------|--------------|------|
| `ENFORCE_PLAN_LIMITS` | `false` | `false` | E-004 |
| `WEB_JWT_BRIDGE` | `false` | `false` | E-002 |
| `AEO_SERVER_PROFILE` | `false` | `false` | E-003 |
| `ALLOW_PUBLIC_DEMO_ORG` | `false` | `false` | Security |
| `BILLING_TEST_MODE` | `false` | `false` | Security |
| `GRANDFATHER_ORG_IDS` | empty | PO-defined (e.g. Tenant #1) | E-004 |

**Rollout after deploy:** [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md) — PO approval per phase.

**Matrix:** [SPRINT1_FEATURE_FLAG_MATRIX](../releases/SPRINT1_FEATURE_FLAG_MATRIX.md) — 24/24 automated combinations PASS (RC-3).

---

## Rollback SHA

| Field | Value |
|-------|-------|
| **Rollback git SHA** | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| **Rollback branch** | `feature/homepage-phase1` |
| **Rollback image era** | `asoftech-insightz-app` container created `2026-08-03T12:03:52Z` |
| **Procedure** | [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) |

Flag rollback (no redeploy): set all three Sprint-1 flags to `false` and restart app container.

---

## Known limitations

| # | Limitation | Impact | Mitigation |
|---|------------|--------|------------|
| L1 | **Approved RC SHA not published** | No single Git authoritative commit | Publish certified tree; tag `sprint1-rc-2026-08-03` |
| L2 | **Sprint-1 code not on production Git** | Running prod lacks E-002/E-003/E-004 + security-config | Deploy approved SHA only after PO GO |
| L3 | **VPS disk ≠ running container** | Disk `main` @ `d96e63d`; container from `0e1b7e8` | Align before build |
| L4 | **GitHub push failed** | Path fix `d96e63d` not on remote | Fix repo access; push |
| L5 | **7+ production secrets missing** | SMTP dry-run; Razorpay not configured | PO supplies credentials |
| L6 | **RC score 82/100** | Below 90 target | Close regression/build gates |
| L7 | **`yarn build` not passed** on certification host | Docker build gate open | Run build before deploy |
| L8 | **`backend_test.py` not run** on prod-mode build | API regression gate open | Run against staging/prod URL |
| L9 | **Commercial readiness 49/100** | Checkout not live | Separate Commercial GA track |
| L10 | **Live HTTP flag matrix on staging** | Not executed in RC-1/RC-3 | CS staging validation |
| L11 | **No standalone rollback script** | Manual git + compose rollback | Follow rollback guide |
| L12 | **npm audit** | 2 high (next/postcss chain), 1 moderate (uuid) | Track; not Sprint-1 deploy blocker per RC-3 |
| L13 | **Workstation tree not a git repo** | Cannot push from Downloads copy | Init git or export to GitHub repo |

---

## Publication status

| Question | Answer |
|----------|--------|
| Release package document complete? | **YES** (this document + companions) |
| Code published to GitHub as Approved RC SHA? | **NO** |
| Ready for deployment? | **NO** — see [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) |

**STOP:** No deployment, push, merge, container restart, or GitHub Actions until Product Owner authorization.
