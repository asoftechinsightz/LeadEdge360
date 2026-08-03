# Infrastructure GO / NO GO

**Date:** 3 August 2026  
**Program:** LeadEdge360 Infrastructure Enablement  
**Scope:** VPS access, SSH, GitHub deploy path, environment secrets, deployment parity  
**Application changes:** **None**  
**Deployment executed:** **None**  

---

## Decision matrix

| Gate | Status | Blocker? |
|------|--------|----------|
| VPS reachable (HTTPS) | **PASS** | — |
| VPS SSH (ops break-glass) | **PASS** | — |
| VPS SSH (CI `asoftech` + `asoftech_ci`) | **UNKNOWN** | **Yes** until verified |
| Deploy directory documented correctly | **FAIL** | **Yes** — `/opt/asoftech` ≠ `/opt/asoftech-insightz` |
| Docker / Compose on host | **PASS** | — |
| Nginx / TLS edge | **PASS** | Cert valid until 17 Sep 2026 |
| GitHub Actions auth (workstation) | **FAIL** | **Yes** — `gh` not logged in |
| GitHub secrets (`VPS_*`, `PUBLIC_URL`) | **UNKNOWN** | **Yes** until verified in repo settings |
| Mandatory env secrets complete | **FAIL** | **Yes** — Razorpay, SMTP, org webhook, LLM |
| Running SHA = approved RC | **FAIL** | **Yes** — `0e1b7e8` on wrong branch |
| Sprint-1 code on running tree | **FAIL** | **Yes** — E-002/E-004 files missing |
| Feature flags explicitly OFF | **CONDITIONAL** | Missing from `.env` (defaults only) |

---

## Scores

| Dimension | Score / 100 |
|-----------|-------------|
| Network / DNS / TLS | 90 |
| SSH access (ops) | 85 |
| SSH access (CI) | 30 |
| Deploy automation alignment | 25 |
| Environment completeness | 40 |
| Deployment parity | 22 |
| **Infrastructure readiness** | **48 / 100** |

---

## Findings summary

### Resolved / enabled

1. **SSH works** via `ssh asoftech-vps` (`root@187.127.179.138`, key `asoftech_vps`).
2. **Actual topology documented** — app root `/opt/asoftech-insightz`, edge nginx in `asoftech-edge-nginx`.
3. **Partial secrets present** — JWT, CORS, n8n password (aliased), webhook secret (aliased).

### Still blocking VPS RC deploy

1. **Wrong deploy path** in `deploy.yml` (`/opt/asoftech`).
2. **Missing secrets** — Razorpay (3), SMTP (3), `N8N_WEBHOOK_ORG_ID`, `EMERGENT_LLM_KEY`.
3. **Git / parity** — running `feature/homepage-phase1` @ `0e1b7e8`, not Sprint-1 RC; epic files absent.
4. **GitHub Actions** — not validated; workstation `gh` unauthenticated.
5. **CI SSH identity** — `asoftech_ci` not tested; `asoftech@*` denied with ops key.
6. **DNS vs SSH IP** — document `187.127.179.138` for management; `185.38.109.x` for public HTTP.

---

## GO / CONDITIONAL GO / NO GO

| Verdict | **NO GO** |
|---------|-----------|

### For infrastructure approval to proceed

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | Populate missing `.env` secrets (see ENVIRONMENT_AUDIT) | Infra / PO |
| P0 | Fix `deploy.yml` → `/opt/asoftech-insightz` | DevOps |
| P0 | Pin VPS to **approved RC git SHA** (not `feature/homepage-phase1`) | DevOps |
| P1 | Verify GitHub secrets + run `workflow_dispatch` deploy dry-run | DevOps |
| P1 | Install `asoftech_ci` pubkey for deploy user `asoftech` | Infra |
| P1 | Standardize env aliases (`N8N_WEBHOOK_TOKEN` vs `SECRET`, etc.) | Infra |
| P2 | Set Sprint-1 flags explicitly `false` in `.env` | DevOps |

### What is allowed now

| Activity | Allowed? |
|----------|----------|
| Ops SSH read-only investigation | **YES** |
| Secret population in `.env` | **YES** (after PO approval) |
| `docker compose up` / deploy | **NO** — wait for infrastructure approval |
| Enable Sprint-1 feature flags | **NO** |
| Sprint 2 work | **NO** |

---

## Conditional path to **CONDITIONAL GO**

Infrastructure may move to **CONDITIONAL GO** when:

1. All mandatory secrets **PRESENT** (audit re-run).
2. `deploy.yml` path corrected and CI SSH validated end-to-end.
3. VPS checked out to **documented approved RC SHA** with Sprint-1 files present.
4. Explicit `ENFORCE_PLAN_LIMITS=false`, `WEB_JWT_BRIDGE=false`, `AEO_SERVER_PROFILE=false` in `.env`.

Then **Product Owner** may authorize deploy execution (separate gate).

---

## Conditional path to **GO**

**GO** for production RC deploy requires above plus:

1. Successful `docker compose up -d --build` from approved SHA (post-approval).
2. Post-deploy smoke PASS (`/api/health`, auth, leads, KPIs).
3. PO sign-off on deployment verification.

---

## Related reports

- [VPS_ACCESS_REPORT.md](./VPS_ACCESS_REPORT.md)
- [SSH_VALIDATION_REPORT.md](./SSH_VALIDATION_REPORT.md)
- [ENVIRONMENT_AUDIT.md](./ENVIRONMENT_AUDIT.md)
- [DEPLOYMENT_PARITY_REPORT.md](./DEPLOYMENT_PARITY_REPORT.md)

---

## Sign-off (awaiting)

| Role | Decision | Date |
|------|----------|------|
| Infrastructure | Audit complete — **NO GO** | 3 Aug 2026 |
| Product Owner | _pending_ | _pending_ |

**STOP:** No deployment, no `docker compose`, no restart, no feature flags until Infrastructure approval.
