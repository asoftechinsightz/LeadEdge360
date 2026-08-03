# LeadEdge360 — Production Go-Live Playbook

**Release:** R1.1 Foundation GA  
**Audience:** DevOps (execute) · CS · PO (sign-off)  
**Last updated:** 3 August 2026  

---

## How to use this playbook

Execute phases in order. Do **not** skip to Commercial GA until all gates in [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md) are closed.

**Companion docs:** [PRODUCTION_OPERATIONS_GUIDE.md](./PRODUCTION_OPERATIONS_GUIDE.md) · [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md) · [PRODUCTION_ROLLBACK_GUIDE.md](./PRODUCTION_ROLLBACK_GUIDE.md) · [PRODUCTION_MONITORING_GUIDE.md](./PRODUCTION_MONITORING_GUIDE.md)

---

## Phase A — Pre-deployment

### A1. Certification gates

| # | Item | Owner | Done |
|---|------|-------|------|
| A1-01 | RC-2 Validation workflow **GREEN** on release commit | DevOps | [ ] |
| A1-02 | RC score ≥ 90 (artifact `rc2-validation`) | Eng | [ ] |
| A1-03 | Regression 100%, Security ≥ 95, Performance ≥ 90 | Eng | [ ] |
| A1-04 | PO sign-off E-002, E-003, E-004 | PO | [ ] |
| A1-05 | Staging checklist complete | CS + Eng | [ ] |
| A1-06 | Tenant #1 WS3 checklist executed on staging | CS | [ ] |

### A2. Infrastructure

| # | Item | Owner | Done |
|---|------|-------|------|
| A2-01 | VPS disk > 30% free | Infra | [ ] |
| A2-02 | TLS certificate valid > 30 days | Infra | [ ] |
| A2-03 | Mongo backup job tested (restore drill) | Infra | [ ] |
| A2-04 | GitHub secrets: `VPS_*`, `PUBLIC_URL` verified | DevOps | [ ] |
| A2-05 | `/opt/asoftech/.env` complete (see `.env.example`) | DevOps | [ ] |
| A2-06 | n8n admin password changed from default | DevOps | [ ] |
| A2-07 | `N8N_WEBHOOK_TOKEN` strong random | DevOps | [ ] |

### A3. Production `.env` — initial (flags OFF)

```env
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
GRANDFATHER_ORG_IDS=
```

| # | Item | Done |
|---|------|------|
| A3-01 | All three flags explicitly `false` | [ ] |
| A3-02 | `MONGO_URL=mongodb://mongo:27017` (compose network) | [ ] |
| A3-03 | `NEXT_PUBLIC_*` match production URL | [ ] |
| A3-04 | Razorpay keys (live vs test per PO decision) | [ ] |
| A3-05 | `EMERGENT_LLM_KEY` set | [ ] |

---

## Phase B — Deployment

| # | Step | Command / action | Owner | Done |
|---|------|------------------|-------|------|
| B-01 | Announce maintenance window (if needed) | CS → pilot tenant | CS | [ ] |
| B-02 | Confirm `main` is release commit | `git log -1` on VPS | DevOps | [ ] |
| B-03 | Trigger deploy | Push to `main` or `workflow_dispatch` Deploy | DevOps | [ ] |
| B-04 | Watch GitHub Actions | `test` job → `build-and-deploy` green | DevOps | [ ] |
| B-05 | Verify containers | `docker compose ps` all `running` | DevOps | [ ] |
| B-06 | Verify image rebuild | `docker compose images` timestamp | DevOps | [ ] |

**Manual deploy (break-glass):**

```bash
cd /opt/asoftech
git fetch --all && git reset --hard origin/main
docker compose up -d --build --remove-orphans
docker image prune -f
```

---

## Phase C — Smoke tests (immediate)

| # | Test | Expected | Done |
|---|------|----------|------|
| C-01 | `curl -fsS $PUBLIC_URL/api/` | `"ok":true` | [ ] |
| C-02 | Login via Emergent (PO or CS user) | Dashboard loads | [ ] |
| C-03 | `GET /api/leads` (authenticated) | 200, org-scoped data | [ ] |
| C-04 | `GET /api/kpis` | 200 | [ ] |
| C-05 | Create test lead (non-prod name prefix) | 201, then delete | [ ] |
| C-06 | n8n UI reachable (ops network) | Login works | [ ] |
| C-07 | Razorpay dashboard test event (if configured) | — | [ ] |

**Automated (from CI or ops workstation):**

```bash
RC_API_BASE_URL=https://<PUBLIC_URL>/api python backend_test.py
```

Use **read-only** subset in production if write tests are not approved.

---

## Phase D — Feature flags (phased)

Do **not** enable all flags on day 1. Follow [FEATURE_FLAG_ROLLOUT_PLAN.md](./FEATURE_FLAG_ROLLOUT_PLAN.md).

| Phase | Flags | Minimum observation before next phase |
|-------|-------|--------------------------------------|
| D-1 | OFF OFF OFF | 48–72 hours stable |
| D-2 | ON OFF OFF | 48 hours |
| D-3 | ON ON OFF | 48 hours |
| D-4 | ON ON ON | 7 days pilot |

PO approval required for each phase advance.

---

## Phase E — Customer Success

| # | Action | Owner | Done |
|---|--------|-------|------|
| E-01 | Notify pilot tenant of go-live window | CS | [ ] |
| E-02 | Share flag rollout schedule (no surprise bridge/limits) | CS | [ ] |
| E-03 | Confirm Tenant #1 support channel (email/WhatsApp) | CS | [ ] |
| E-04 | Distribute training links (`docs/customer-success/`) | CS | [ ] |
| E-05 | Grandfather policy communicated if `GRANDFATHER_ORG_IDS` set | CS + PO | [ ] |
| E-06 | Capture baseline screenshots (dashboard, AEO, leads) | CS | [ ] |

---

## Phase F — Monitoring setup

| # | Item | Reference | Done |
|---|------|-----------|------|
| F-01 | Synthetic health on `/api/` | Monitoring guide §3 | [ ] |
| F-02 | Container CPU/memory alerts | Monitoring guide §6 | [ ] |
| F-03 | Mongo disk alert | Monitoring guide §5 | [ ] |
| F-04 | GitHub Actions failure alert | Ops guide §3 | [ ] |
| F-05 | On-call rotation confirmed | — | [ ] |

---

## Phase G — 48-hour observation

| Checkpoint | Review | Owner |
|------------|--------|-------|
| Hour 0 | Smoke + monitoring live | DevOps |
| Hour 4 | Error rate, health | DevOps |
| Hour 24 | 401/403/402 baseline (flags OFF) | Eng |
| Hour 48 | PO go/no-go for flag phase D-2 | PO |

**48h checklist:**

- [ ] Zero P1 incidents
- [ ] Health synthetic 100% (excluding planned maintenance)
- [ ] No unexpected Mongo growth / connection errors
- [ ] CS zero blocking tickets from pilot tenant
- [ ] Audit logs flowing (`subscription.activated` if billing tested)

---

## Phase H — 7-day observation (pilot)

| Day | Focus |
|-----|-------|
| 1–2 | Flags OFF stability |
| 3–4 | Phase D-2 if approved (`ENFORCE_PLAN_LIMITS`) |
| 5–6 | Phase D-3 if approved (`WEB_JWT_BRIDGE`) |
| 7 | Phase D-4 decision (`AEO_SERVER_PROFILE`) |

**7-day checklist:**

- [ ] All approved flag phases completed without rollback
- [ ] Monitoring dashboards reviewed daily
- [ ] WS3 scenarios re-validated on production (CS sign-off)
- [ ] PO pilot retrospective scheduled

---

## Phase I — Pilot exit criteria

| Criterion | Target | Met |
|-----------|--------|-----|
| Uptime (health check) | ≥ 99.5% | [ ] |
| P1 incidents | 0 unresolved | [ ] |
| Regression / RC gates | Met on hosted CI | [ ] |
| CS Tenant #1 checklist | 100% executed | [ ] |
| PO pilot satisfaction | Documented | [ ] |
| Rollback drill | Executed once on staging | [ ] |

**Pilot exit outcomes:**

- **Proceed to expanded pilot** — same flags, more tenants with PO approval
- **Hold** — flags OFF, fix blockers
- **Rollback** — see rollback guide

---

## Phase J — Commercial GA

Commercial GA requires **all** items in [FINAL_RELEASE_DECISION.md](./FINAL_RELEASE_DECISION.md).

| # | Gate | Done |
|---|------|------|
| J-01 | RC ≥ 90 on hosted CI | [ ] |
| J-02 | Regression 100% | [ ] |
| J-03 | Security ≥ 95 | [ ] |
| J-04 | Performance ≥ 90 | [ ] |
| J-05 | Deployment PASS | [ ] |
| J-06 | Feature flags validated live + automated | [ ] |
| J-07 | WS3 complete | [ ] |
| J-08 | PO written Commercial GA authorization | [ ] |
| J-09 | Legal/commercial contracts (if applicable) | [ ] |
| J-10 | Sprint 2 **not** started without new PO charter | [ ] |

---

## Sign-off sheet

| Phase | Role | Name | Date | Approved |
|-------|------|------|------|----------|
| Pre-deploy | PO | | | [ ] |
| Deploy | DevOps | | | [ ] |
| Smoke | Eng | | | [ ] |
| 48h | PO | | | [ ] |
| 7-day pilot | PO + CS | | | [ ] |
| Commercial GA | PO | | | [ ] |
