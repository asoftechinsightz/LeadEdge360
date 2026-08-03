# VPS Deployment Report — Controlled Pilot

**Program:** LeadEdge360 v1.0 Production VPS Deployment  
**Target:** `https://app.asoftechinsightz.com`  
**Release candidate:** Sprint 1 (E-002, E-003, E-004) + Phase 0 security remediation  
**Execution date:** 3 August 2026  
**Executor environment:** Operator workstation (Windows) — **not** VPS shell  

---

## Deployment status

| Field | Value |
|-------|-------|
| **Deployment status** | **NOT COMPLETED — BLOCKED** |
| **Verdict** | **NO GO** |
| **Reason** | No VPS SSH credentials; GitHub Actions not authenticated; mandatory production secrets incomplete on live host |

**Application code was not modified** during this deployment attempt. **No `docker compose up` was executed** from the operator environment.

---

## Phase 1 — Pre-deployment verification

### Infrastructure (external probes)

| Check | Result | Evidence |
|-------|--------|----------|
| DNS `app.asoftechinsightz.com` | **PASS** | A records `185.38.109.200`–`209` |
| SSL / HTTPS | **PASS** | `curl` ssl_verify=0; TLS handshake OK |
| Nginx | **PASS** | `Server: nginx/1.27.5` on `/signin` |
| Application responding | **PASS** | `GET /api/health` → 200 (~227 ms) |
| Mongo (via health API) | **PASS** | `checks.database.ok: true` |

### Infrastructure (VPS shell — not executed)

| Check | Status |
|-------|--------|
| Git SHA on VPS | **NOT VERIFIED** — SSH failed |
| Current running image tag | **NOT VERIFIED** |
| Docker version | **NOT VERIFIED** |
| Docker Compose version | **NOT VERIFIED** |
| Disk / memory / CPU on host | **NOT VERIFIED** |
| Running containers (`docker compose ps`) | **NOT VERIFIED** |
| SSL certificate expiry (on host) | **NOT VERIFIED** |

**SSH attempt:** `asoftech@187.127.179.138` → `Permission denied (publickey,password)`.

### Mandatory secrets verification

Secrets were inferred from **`GET /api/health`** (live pilot) and **cannot** confirm server-only vars without `.env` access.

| Secret | Required | Live health signal | Status |
|--------|----------|-------------------|--------|
| `JWT_SECRET` | Yes | Not exposed in health | **UNKNOWN** |
| `N8N_WEBHOOK_TOKEN` | Yes | Not exposed | **UNKNOWN** |
| `N8N_WEBHOOK_ORG_ID` | Yes | Not exposed | **UNKNOWN** |
| `N8N_BASIC_AUTH_PASSWORD` | Yes | Not exposed | **UNKNOWN** |
| `CORS_ORIGINS` | Yes | Not exposed | **UNKNOWN** |
| `RAZORPAY_KEY_ID` (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) | Yes | `razorpay.ok: false` — keys missing | **FAIL** |
| `RAZORPAY_SECRET` (`RAZORPAY_KEY_SECRET`) | Yes | Same | **FAIL** |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Not in health payload | **UNKNOWN** |
| `EMERGENT_LLM_KEY` | Yes | Not in health payload | **UNKNOWN** |
| `SMTP_HOST` | Yes | `smtp.ok: false` — missing | **FAIL** |
| `SMTP_USER` | Yes | Missing (`SMTP_USER` / `SMTP_PASS` in detail) | **FAIL** |
| `SMTP_PASSWORD` | Yes | Missing | **FAIL** |

**Pre-deploy gate:** Per charter, deployment **must stop** when mandatory secrets are missing. **At least Razorpay and SMTP are confirmed missing** on the live pilot. **Deploy was halted before Phase 2 backup.**

### Local release artifact

| Item | Value |
|------|-------|
| Local path | `asoftech-insightz-v1.2.0/asoftech-insightz` |
| Git repository | **No** — `fatal: not a git repository` |
| Intended package version | `0.1.0` (`package.json`) |
| Git SHA (local) | **N/A** |

### Live vs RC codebase alignment

| Signal | Live production | Sprint-1 RC (local) |
|--------|-----------------|---------------------|
| `/api/health` rich pilot payload | **Yes** | **No** — local uses `GET /api/` only |
| `/api/metrics` Prometheus text | **Yes** | **Not present** in local router |
| `/api/leads` unauthenticated | **401** `UNAUTHORIZED` | **401** after Phase 0 (different JSON shape) |
| `/api/agents` | **401** | **200** public in RC |
| `/billing` | **404** | Route may exist in RC App Router |
| Auth configured | `configured: false` on `/api/auth/me` | Emergent keys env-dependent |

**Conclusion:** Live host appears to run a **pilot fork**, not the approved Sprint-1 RC artifact in the local workspace. Deploying RC requires **git reset on VPS** to the approved commit after secrets are fixed.

---

## Phase 2 — Backup

| Item | Status |
|------|--------|
| Mongo dump | **NOT PERFORMED** — no SSH |
| Docker image tag snapshot | **NOT PERFORMED** |
| `docker-compose.yml` backup | **NOT PERFORMED** |
| `.env` backup | **NOT PERFORMED** |
| Nginx config backup | **NOT PERFORMED** |
| Backup integrity check | **NOT PERFORMED** |

---

## Phase 3 — Deploy

| Step | Status |
|------|--------|
| Pull approved release | **NOT PERFORMED** |
| Install dependencies | **NOT PERFORMED** |
| Production build | **NOT PERFORMED** |
| Docker image build | **NOT PERFORMED** |
| `docker compose up -d --build` | **NOT PERFORMED** |
| Container health wait | **NOT PERFORMED** |

**Alternative path not executed:** GitHub Actions `Deploy to VPS` (`workflow_dispatch`) — `gh` not authenticated on operator machine.

---

## Phase 4 — Feature flags

**Target (not applied — deploy not run):**

```env
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
```

Sprint-1 flags remain **OFF** per charter. No flag enablement performed.

---

## Phase 5 — Post-deployment route matrix (external only)

| Route | HTTP | Time (s) | Notes |
|-------|------|----------|-------|
| `/api/health` | 200 | ~0.23 | Pilot health JSON |
| `/api/metrics` | 200 | — | Prometheus text metrics |
| `/signin` | 200 | — | nginx + security headers present |
| `/dashboard` | 200 | — | |
| `/leadedge360` | 200 | ~0.23 | |
| `/pricing` | 301 | — | Redirect |
| `/contact` | 301 | — | Redirect |
| `/api/leads` | 401 | — | Auth required |
| `/api/kpis` | 401 | — | Auth required |
| `/api/auth/me` | 200 | — | `user:null`, `configured:false` |
| `/api/agents` | 401 | — | RC expects 200 — mismatch |
| `/billing` | 404 | — | Not found on live |

---

## Deployment score

| Dimension | Score / 100 |
|-----------|-------------|
| Pre-deploy gates | 35 |
| Backup | 0 |
| Deploy execution | 0 |
| Post-deploy verification | 45 |
| Smoke / regression | 20 |
| **Overall deployment score** | **22 / 100** |

---

## Required actions to complete deployment

### 1. Grant operator access

- SSH key for `asoftech@<VPS_HOST>` (or break-glass user), **or**
- `gh auth login` + trigger **Deploy to VPS** workflow with secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL`.

### 2. Complete mandatory `.env` on VPS (`/opt/asoftech/.env`)

Minimum before deploy:

```env
JWT_SECRET=<32+ random bytes>
N8N_WEBHOOK_TOKEN=<random>
N8N_WEBHOOK_ORG_ID=<tenant org id>
N8N_BASIC_AUTH_PASSWORD=<strong>
CORS_ORIGINS=https://app.asoftechinsightz.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<rzp_*>
RAZORPAY_KEY_SECRET=<secret>
RAZORPAY_WEBHOOK_SECRET=<random>
EMERGENT_LLM_KEY=<key>
EMERGENT_PROJECT_ID=<id>
EMERGENT_API_KEY=<key>
SMTP_HOST=<host>
SMTP_PORT=<port>
SMTP_USER=<user>
SMTP_PASS=<password>
ENFORCE_PLAN_LIMITS=false
WEB_JWT_BRIDGE=false
AEO_SERVER_PROFILE=false
ALLOW_PUBLIC_DEMO_ORG=false
```

### 3. On VPS (after secrets + backup)

```bash
cd /opt/asoftech
git fetch --all
git reset --hard <approved-release-sha>
# backup: mongodump, cp .env docker-compose.yml, nginx config
docker compose up -d --build --remove-orphans
docker compose ps
curl -fsS https://app.asoftechinsightz.com/api/health
```

### 4. Re-run smoke suite

`RC_API_BASE_URL=https://app.asoftechinsightz.com/api python backend_test.py` (from CI or ops host with Mongo if needed).

---

## GO / NO GO

| Environment | Verdict |
|-------------|---------|
| **Production VPS RC deploy** | **NO GO** |
| **Continue pilot on current build** | **CONDITIONAL GO** — app healthy, Mongo OK; billing/SMTP not configured |

**Do not enable** `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, or `ENFORCE_PLAN_LIMITS` until PO approves post-deployment verification.

**Await Product Owner approval** after a successful redeploy and full smoke pass.

---

## Related artifacts

- [POST_DEPLOYMENT_REPORT.md](./POST_DEPLOYMENT_REPORT.md)
- [SYSTEM_HEALTH_REPORT.md](./SYSTEM_HEALTH_REPORT.md)
- [SMOKE_TEST_REPORT.md](./SMOKE_TEST_REPORT.md)
- [DEPLOYMENT_LOG.md](./DEPLOYMENT_LOG.md)
