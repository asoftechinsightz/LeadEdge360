# Sprint-1 Handover

**Date:** 4 August 2026  
**Release:** `SPRINT1-RC-2026-08-03`  
**From:** Sprint-1 RC certification / release engineering  
**To:** Engineering, Operations, Customer Success, Release Management  
**Deployment status:** **NOT EXECUTED**  

---

## Package index

| Document | Audience |
|----------|----------|
| [SPRINT1_RELEASE_PACKAGE.md](./SPRINT1_RELEASE_PACKAGE.md) | All — master package |
| [SPRINT1_DEPLOYMENT_SEQUENCE.md](./SPRINT1_DEPLOYMENT_SEQUENCE.md) | DevOps |
| [SPRINT1_PRODUCTION_SIGNOFF.md](./SPRINT1_PRODUCTION_SIGNOFF.md) | All stakeholders |
| [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) | All — blockers |
| [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md) | Release Mgmt |
| [RC_SOURCE_OF_TRUTH.md](./RC_SOURCE_OF_TRUTH.md) | Eng + DevOps |

---

## Developer handover

### What was built (Sprint-1)

| Epic | Key files | Flag |
|------|-----------|------|
| E-002 | `lib/request-actor.js`, `lib/mobile-routes.js`, `app/api/[[...path]]/route.js` | `WEB_JWT_BRIDGE` |
| E-003 | `lib/aeo/*` (profile, merge, compute) | `AEO_SERVER_PROFILE` |
| E-004 | `lib/billing/plan-entitlements.js`, route entitlement checks | `ENFORCE_PLAN_LIMITS` |
| Security | `lib/security-config.js`, `lib/jwt.js`, `lib/tenant.js`, `next.config.js` | env gates |

### Authoritative source (until SHA assigned)

- **Path:** `asoftech-insightz-v1.2.0/asoftech-insightz` (certified workstation copy)
- **Version:** `0.1.0`
- **Not authoritative:** VPS `feature/homepage-phase1` @ `0e1b7e8` or VPS `main` @ `5cb6f18` / `d96e63d`

### Tests (local / CI)

```bash
npm run test:bridge    # E-002 dispatch
npm run test:aeo       # E-003 merge/compute
npm run test:billing   # E-004 (requires Mongo)
npm run test:rc        # RC master runner
RC_API_BASE_URL=http://localhost:3000/api python backend_test.py
```

### Publication tasks for Eng

1. Export certified tree to `arnav02champ/AsoftechLeadEdge360` (or PO-approved repo).
2. Commit: `release: Sprint-1 RC (E-002, E-003, E-004, security Phase-0)`.
3. Include deploy path fix (`/opt/asoftech-insightz`) if not already in tree.
4. Tag: `sprint1-rc-2026-08-03`.
5. Record SHA in [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md).
6. Run `yarn build` on SHA; fix failures before deploy.

### Do not (without PO approval)

- Merge `feature/homepage-phase1` into RC without release plan.
- Enable Sprint-1 flags in production `.env`.
- Change API contracts or add Sprint 2 work.

### Reference docs

- [E-002_IMPLEMENTATION_REPORT](../releases/E-002_IMPLEMENTATION_REPORT.md)
- [E-003_IMPLEMENTATION_REPORT](../releases/E-003_IMPLEMENTATION_REPORT.md)
- [E-004_IMPLEMENTATION_REPORT](../releases/E-004_IMPLEMENTATION_REPORT.md)
- [SECURITY_REMEDIATION_REPORT](../security/SECURITY_REMEDIATION_REPORT.md)
- Design: `docs/engineering/design/E-002_*`, `E-003_*`, `E-004_*`

---

## Operations handover

### Production topology

| Component | Detail |
|-----------|--------|
| Host | `leadedge360` — `187.127.179.138` |
| SSH | `ssh asoftech-vps` (root + key) |
| App path | `/opt/asoftech-insightz` |
| Containers | `asoftech-app`, `asoftech-mongo`, `asoftech-n8n` |
| Edge | `asoftech-edge-nginx` |
| Public URL | `https://app.asoftechinsightz.com` |
| n8n | `https://flows.asoftechinsightz.com/` |

### Current production state (4 Aug 2026)

| Field | Value |
|-------|-------|
| Running container era | `feature/homepage-phase1` @ `0e1b7e8` |
| VPS disk git | `main` @ `d96e63d` (path fix only — **not pushed**) |
| Sprint-1 on prod | **Absent** |
| Health | App healthy; SMTP/Razorpay not configured |

### Deploy (when PO authorizes)

Follow [SPRINT1_DEPLOYMENT_SEQUENCE.md](./SPRINT1_DEPLOYMENT_SEQUENCE.md):

1. Backup Mongo + `.env` + compose.
2. Validate `.env` (secrets + flags OFF).
3. `git reset --hard <APPROVED_RC_SHA>` at `/opt/asoftech-insightz`.
4. `docker compose up -d --build --remove-orphans`.
5. Smoke tests Phase 5.

**Preferred:** GitHub Actions Deploy workflow after secrets verified.

### Rollback

| Type | Action |
|------|--------|
| Flags only | Set three Sprint-1 flags `false`; restart app |
| Full | `git reset --hard 0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` + rebuild |
| Guide | [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) |

### Monitoring

- [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md)
- Health: `GET /api/health`
- Metrics: `GET /api/metrics`

### Open ops blockers

See [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) P0-03, P0-04, P0-05, P0-08, P2-01.

### Reference docs

- [DEPLOYMENT_READY_CHECKLIST](../infrastructure/DEPLOYMENT_READY_CHECKLIST.md)
- [VPS_ACCESS_REPORT](../infrastructure/VPS_ACCESS_REPORT.md)
- [ENVIRONMENT_AUDIT](../infrastructure/ENVIRONMENT_AUDIT.md)
- [PRODUCTION_OPERATIONS_GUIDE.md](./PRODUCTION_OPERATIONS_GUIDE.md)

---

## Customer Success handover

### What users see at deploy (flags OFF)

| Feature | User-visible change? |
|---------|---------------------|
| E-002 Bridge | **No** — cookie paths behave as pre-Sprint-1 |
| E-003 AEO server profile | **No** — sessionStorage only |
| E-004 Plan limits | **No** — no blocking at caps |
| Security Phase-0 | **Yes** — demo CRM locked on prod if `ALLOW_PUBLIC_DEMO_ORG` false |

### Phased enablement (post-deploy)

Follow [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md):

| Phase | Flags | Observation |
|-------|-------|-------------|
| D-1 | OFF OFF OFF | 48–72h |
| D-2 | ON OFF OFF | 48h |
| D-3 | ON ON OFF | 48h |
| D-4 | ON ON ON | 7d pilot |

**PO approval required** for each phase.

### CS actions before go-live

| # | Action | Status |
|---|--------|--------|
| 1 | Tenant #1 WS3 checklist on RC/staging URL | **Pending** |
| 2 | Pilot tenant maintenance communication | **Pending** |
| 3 | Document support runbook for plan-limit errors (when E-004 ON) | Doc ready in ops guide |
| 4 | Confirm grandfather org IDs with PO (`GRANDFATHER_ORG_IDS`) | **Pending** |

### Support references

- [PRODUCTION_GO_LIVE_PLAYBOOK.md](./PRODUCTION_GO_LIVE_PLAYBOOK.md) — Phase E (CS)
- [RC3_PRODUCTION_GO_LIVE_CHECKLIST](../releases/RC3_PRODUCTION_GO_LIVE_CHECKLIST.md)
- Flag matrix: [SPRINT1_FEATURE_FLAG_MATRIX](../releases/SPRINT1_FEATURE_FLAG_MATRIX.md)

### Open CS blockers

WS3 checklist (T-01 in open items); staging validation on Approved RC SHA.

---

## Release Manager handover

### Release identity

| Field | Value |
|-------|-------|
| Release ID | `SPRINT1-RC-2026-08-03` |
| Name | LeadEdge360 R1.1 Foundation GA — Sprint-1 RC |
| Approved RC SHA | **TBD** |
| Rollback SHA | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| Decision | **NO GO** ([FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md)) |

### Documentation delivered (this program)

| Workstream | Artifact |
|------------|----------|
| Release package | [SPRINT1_RELEASE_PACKAGE.md](./SPRINT1_RELEASE_PACKAGE.md) |
| Deployment sequence | [SPRINT1_DEPLOYMENT_SEQUENCE.md](./SPRINT1_DEPLOYMENT_SEQUENCE.md) |
| Production sign-off | [SPRINT1_PRODUCTION_SIGNOFF.md](./SPRINT1_PRODUCTION_SIGNOFF.md) |
| Open items | [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) |
| Handover | This document |
| Prior RC publication | [SPRINT1_RC_INVENTORY.md](./SPRINT1_RC_INVENTORY.md), [RC_SOURCE_OF_TRUTH.md](./RC_SOURCE_OF_TRUTH.md), [GO_LIVE_GATE_MATRIX.md](./GO_LIVE_GATE_MATRIX.md) |

### RM checklist to reach GO

| # | Item | Ref |
|---|------|-----|
| 1 | Close all P0 in open items | [SPRINT1_OPEN_ITEMS.md](./SPRINT1_OPEN_ITEMS.md) |
| 2 | Update manifest with Approved SHA | [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md) |
| 3 | Obtain PO signed authorization | [DEPLOYMENT_AUTHORIZATION_REQUEST](../releases/DEPLOYMENT_AUTHORIZATION_REQUEST.md) |
| 4 | Re-run gate matrix — all GREEN or waived | [GO_LIVE_GATE_MATRIX.md](./GO_LIVE_GATE_MATRIX.md) |
| 5 | Schedule deploy window with CS | Playbook Phase A |
| 6 | File post-deploy reports | `docs/releases/*` templates |
| 7 | Issue new decision: GO or NO GO | [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) |

### What was NOT done (by charter)

- No git push, merge, deploy
- No container restart
- No feature flag changes
- No GitHub Actions execution

### Escalation

| Issue | Escalate to |
|-------|-------------|
| GitHub repo access | PO + Infra |
| Production secrets | PO |
| Commercial / Razorpay | PO + Commercial |
| Deploy authorization | PO only |
| Technical rollback | DevOps → PO |

---

## Handover acceptance

| Team | Package received | Questions | Date |
|------|------------------|-----------|------|
| Engineering | | | |
| Operations | | | |
| Customer Success | | | |
| Release Management | | | |

**Awaiting:** PO publication authorization and Approved RC SHA assignment.
