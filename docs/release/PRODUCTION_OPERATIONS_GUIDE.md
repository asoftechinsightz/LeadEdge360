# LeadEdge360 — Production Operations Guide

**Release:** R1.1 Foundation GA (Sprint 1)  
**Audience:** Infrastructure · DevOps · Customer Success · Product Owner  
**Last updated:** 3 August 2026  
**Scope:** Operational readiness only — no product development  

---

## 1. Purpose

This guide consolidates how LeadEdge360 is built, validated, deployed, and operated for a **controlled production pilot**. It assumes Sprint 1 epics (E-004, E-002, E-003) are code-complete with feature flags default **OFF**.

**Related documents:**

| Document | Use |
|----------|-----|
| [PRODUCTION_GO_LIVE_PLAYBOOK.md](./PRODUCTION_GO_LIVE_PLAYBOOK.md) | Step-by-step go-live |
| [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md) | Flag phases |
| [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) | Rollback |
| [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md) | Dashboards & alerts |
| [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) | GO / NO-GO status |

---

## 2. System overview

| Layer | Technology | Notes |
|-------|------------|-------|
| Application | Next.js 14 (standalone) | `node server.js` in container |
| API | `/api/*` monolith router | Cookie + JWT paths |
| Database | MongoDB 7 | Single `DB_NAME` database |
| Automation | n8n | Webhooks, workflows |
| Billing | Razorpay | Server + public key |
| AI / AEO | Emergent LLM | Scoring + recommendations |
| Auth | Emergent session cookie | Mobile: JWT |

**Default production posture:** all Sprint 1 flags **OFF** until PO approves phased enablement.

---

## 3. GitHub Actions — review (Workstream 1)

### 3.1 Workflows in repository

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| RC-2 Validation | `.github/workflows/rc-validation.yml` | PR/push `main`/`staging`, `workflow_dispatch` | Full RC gate: tests, build, Docker, API regression, artifacts |
| Deploy to VPS | `.github/workflows/deploy.yml` | Push `main`, `workflow_dispatch` | Test job → build → SSH deploy → smoke |

### 3.2 Verified configuration

| Item | RC-2 Validation | Deploy |
|------|-----------------|--------|
| Node version | 20 | 20 |
| Package cache | `cache: yarn` | `cache: yarn` |
| Mongo service | `mongo:7`, port 27017 | `mongo:7`, port 27017 |
| Mongo health probe | Yes (`mongosh ping`) | **No** — recommend adding |
| Frozen lockfile | `yarn install --frozen-lockfile` | Yes |
| Docker build | Yes (`docker build`) | On VPS via `compose up --build` |
| Artifact upload | `rc2-validation` (30 days) | **No** — recommend adding test log artifact |
| Smoke test | `GET /api/` via local curl | `GET $PUBLIC_URL/api/` |

### 3.3 Required GitHub secrets (Deploy workflow)

| Secret | Used for |
|--------|----------|
| `VPS_HOST` | SSH target |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | Private key |
| `VPS_PORT` | SSH port (optional, default 22) |
| `PUBLIC_URL` | Build-time `NEXT_PUBLIC_*` + smoke URL |

**Not in GitHub (must live on VPS `.env`):** `MONGO_URL`, `JWT_SECRET`, `EMERGENT_*`, `RAZORPAY_*`, `N8N_WEBHOOK_TOKEN`, feature flags.

Deploy workflow **merges** only `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL` from secrets; other `.env` keys are preserved on the server.

### 3.4 Test execution matrix

| Step | Command / script | Mongo required |
|------|------------------|----------------|
| RC suites | `node scripts/rc-ci-runner.mjs` | Yes |
| AEO | `npm run test:aeo` | No |
| Bridge | `npm run test:bridge` | Yes |
| Billing | `npm run test:billing` | Yes |
| Security / perf / flags | `scripts/rc/*.mjs` | Partial |
| API regression | `backend_test.py` | Yes (running app) |
| Build | `yarn build` | No |
| Docker | `docker build -t asoftech-rc2:ci .` | No |

### 3.5 Reliability findings & recommendations

| ID | Finding | Risk | Recommendation (workflow-only) |
|----|---------|------|------------------------------|
| W-01 | `rc-validation.yml` uses `continue-on-error: true` on RC suites | Failed suites may be ignored until final gate | Remove `continue-on-error` or fail job immediately on `rc-ci-runner` exit 1 |
| W-02 | `rc2-append-results.mjs` requires existing `rc2-results.json` | Build record steps fail if runner crashes early | Add workflow step to seed empty results file before suites |
| W-03 | Deploy `test` job Mongo lacks health options | Flaky test job on slow Mongo start | Mirror RC-2 `options: --health-cmd mongosh ping` |
| W-04 | Deploy test job has no timeout | Hung tests block deploy indefinitely | Add `timeout-minutes: 20` (match RC-2) |
| W-05 | Test scripts importing `mobile-routes` may not exit cleanly | CI job hangs after PASS | Set step `timeout-minutes`; monitor job duration; long-term fix in test harness |
| W-06 | RC-2 `yarn start` step missing `JWT_SECRET` in env | Rare auth edge cases in API regression | Add `JWT_SECRET` to start-app env block |
| W-07 | No `concurrency` group on deploy | Parallel pushes could double-deploy | Add `concurrency: group: production, cancel-in-progress: true` |
| W-08 | RC-2 gate reads stale partial `rc2-results.json` | False pass/fail | Ensure runner always writes results before append steps |

**No application logic changes required** for the above — workflow and artifact hygiene only.

### 3.6 Operator commands

```bash
# Manual RC validation (requires Mongo on localhost:27017)
MONGO_URL=mongodb://localhost:27017 DB_NAME=asoftech_saas_rc2 \
  JWT_SECRET=rc2-test-secret N8N_WEBHOOK_TOKEN=rc2-test-webhook-token \
  node scripts/rc-ci-runner.mjs

# Regenerate RC-2 markdown reports
node scripts/generate-rc2-reports.mjs

# RC-3 certification from evidence file
node scripts/assemble-rc3-evidence.mjs
node scripts/generate-rc3-certification.mjs
```

---

## 4. Docker deployment — review (Workstream 2)

### 4.1 Dockerfile (`Dockerfile`)

| Aspect | Status | Detail |
|--------|--------|--------|
| Multi-stage build | ✅ | deps → builder → runner |
| Base image | `node:20-alpine` | Matches CI |
| Standalone output | ✅ | `output: 'standalone'` in `next.config.js` |
| Non-root user | ✅ | `app` user in runner stage |
| Exposed port | 3000 | `HOSTNAME=0.0.0.0` |
| CMD | `node server.js` | Correct for standalone |

**Finding D-01:** Build stage runs full `yarn build` inside Docker — requires network for Google Fonts on first build (same as CI Ubuntu).

### 4.2 docker-compose.yml

| Service | Image / build | Ports | Volumes | Restart |
|---------|---------------|-------|---------|---------|
| `app` | Build context `.` | 3000:3000 | None | `always` |
| `mongo` | `mongo:7` | None (internal) | `mongo-data` | `always` |
| `n8n` | `n8nio/n8n:latest` | 5678:5678 | `n8n-data` | `always` |

| Aspect | Status | Notes |
|--------|--------|-------|
| `depends_on: mongo` | ✅ | App waits for container start, not Mongo readiness |
| Health checks | ❌ | **Recommend** `healthcheck` on `app` and `mongo` |
| Env | `env_file: .env` + `MONGO_URL` override | Compose sets `mongodb://mongo:27017` |
| n8n ↔ app link | Not in `depends_on` | n8n independent; webhooks use public URL |

**Finding D-02:** No `healthcheck` on `app` — orchestrators cannot auto-restart unhealthy containers.

**Finding D-03:** `n8n` default password `changeme` — must change before production.

**Finding D-04:** `n8n` `WEBHOOK_URL=http://localhost:5678/` — update to public URL for production workflows.

### 4.3 Environment variables (`.env.example`)

| Category | Variables | Pilot notes |
|----------|-----------|-------------|
| Core | `MONGO_URL`, `DB_NAME`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_APP_URL` | Required |
| Auth | `EMERGENT_PROJECT_ID`, `EMERGENT_API_KEY`, `JWT_SECRET` (mobile) | Required for full surface |
| Billing | `RAZORPAY_*`, `BILLING_TEST_MODE` | Test keys on staging |
| Sprint 1 flags | `ENFORCE_PLAN_LIMITS`, `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE` | Default `false` |
| Grandfather | `GRANDFATHER_ORG_IDS` | Tenant #1 only with PO approval |
| Webhooks | `N8N_WEBHOOK_TOKEN` | Must not be default string |
| LLM | `EMERGENT_LLM_KEY` | AEO recommendations |

### 4.4 VPS deploy path (from `deploy.yml`)

1. `cd /opt/asoftech`
2. `git fetch && git reset --hard origin/main`
3. Merge `.env` overrides for public URLs
4. `docker compose pull && docker compose up -d --build --remove-orphans`
5. `docker image prune -f`
6. GitHub Action smoke: `curl $PUBLIC_URL/api/`

---

## 5. Roles & responsibilities

| Role | Pre-pilot | During pilot | Escalation |
|------|-----------|--------------|------------|
| **Infrastructure** | VPS, Mongo backups, TLS, secrets | Disk, CPU, container health | P1 outage |
| **DevOps** | CI green, Docker, deploy pipeline | Deploy/rollback execution | Failed deploy |
| **Customer Success** | WS3 Tenant #1 checklist | User comms, pilot feedback | User-blocking defects |
| **Product Owner** | Sign-off, flag approval | Flag phase gates, pilot scope | Scope / GA decision |

---

## 6. Rollback (summary)

Full detail: [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md)

**Fast path (< 5 min):** set all Sprint 1 flags to `false` in `/opt/asoftech/.env`, then `docker compose up -d --build`. No DB migration rollback required.

---

## 7. Monitoring (summary)

Full detail: [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md)

Minimum smoke: `GET /api/` returns `{"ok":true,...}`.

---

## 8. Incident response (summary)

| Severity | Example | Response |
|----------|---------|----------|
| P1 | App down, Mongo down, payment broken | Rollback flags OFF; restore Mongo from backup if needed |
| P2 | Elevated 402/403, bridge 404 spike | Disable offending flag; CS notify pilot tenant |
| P3 | AEO save errors, n8n webhook failures | Toggle `AEO_SERVER_PROFILE` OFF; fix token/workflow |

**War room:** DevOps (lead) + Eng on-call + PO for flag decisions.

**Communication:** CS templates for pilot tenant; status page if public impact.

---

## 9. Feature flag rollout (summary)

See [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md).

Order: **OFF OFF OFF** → **ON OFF OFF** → **ON ON OFF** → **ON ON ON**.

---

## 10. Current certification status

| Gate | Status |
|------|--------|
| RC-3 release certification | Complete (documentation) |
| Commercial GA | **NOT AUTHORIZED** |
| GitHub Actions RC-2 green | **Pending** (run on hosted repo) |
| WS3 Tenant #1 | Checklist prepared, not executed |

See [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md).

---

## 11. Document control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-08-03 | Release program | Initial production ops guide |
