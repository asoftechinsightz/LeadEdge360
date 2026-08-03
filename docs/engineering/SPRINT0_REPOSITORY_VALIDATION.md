# Sprint 0 — Repository Validation

**Date:** 3 August 2026  
**Method:** Static analysis + local build attempt (validation workstation)  
**Scope:** Read-only — no code changes  
**Package:** `nextjs-mongo-template` v0.1.0  

---

## Executive summary

| Check | Result |
|-------|--------|
| Repository structure | ✅ Expected layout present |
| Broken imports (app code) | ✅ None found in traced import graph |
| Build (local, no env) | ❌ Fails — `MONGO_URL` undefined at page data collection |
| Build (local, MONGO_URL set) | ❌ Fails — Google Fonts fetch (TLS/cert on workstation) |
| Build (CI per `deploy.yml`) | ✅ Expected to pass — placeholders set |
| Prior successful build | ✅ `.next/` artifacts present in workspace |
| TypeScript | N/A — JavaScript only (no `tsconfig` app code) |
| Lint script | Present (`next lint`) — **NOT RUN** on validation workstation |
| Security headers | ⚠️ Permissive CSP / frame options in `next.config.js` |

**Repository health score (this pass):** **62 / 100**

---

## 1. Repository structure

| Path | Status | Notes |
|------|--------|-------|
| `app/` | ✅ | App Router: marketing, application, API, signin, legacy `app/app` |
| `components/` | ✅ | aeo, dashboard, layout, site, ui (48 files) |
| `lib/` | ✅ | Core business logic — no `services/` layer |
| `config/aeo/` | ✅ | 13 JSON config files |
| `hooks/` | ⚠️ | 2 files — orphaned (see dead code) |
| `n8n/` | ✅ | 7 workflow JSON files |
| `scripts/` | ✅ | `test-aeo-compute.mjs`, `simulate-billing-flow.mjs` |
| `docs/` | ✅ | Strategy + ops + CS + aeo + mobile |
| `public/` | ❌ | **Missing** — no project `public/` directory |
| `database/` | ❌ | Not present — Mongo runtime only |
| `mobile/` (app) | ❌ | Docs only |
| `docker-compose.yml` | ✅ | app + mongo + n8n |
| `Dockerfile` | ✅ | Multi-stage standalone |
| `.github/workflows/deploy.yml` | ✅ | yarn build + SSH deploy |

---

## 2. Build validation

### 2.1 Local attempt (3 Aug 2026)

| Step | Result |
|------|--------|
| `npm run build` without `MONGO_URL` | **FAIL** — `MongoClient` `connectionStringHasValidScheme` — `lib/mongo.js` initializes client at module load |
| `npm run build` with `MONGO_URL=mongodb://localhost:27017` | **FAIL** — `next/font` Google Fonts TLS (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) — environment-specific |
| Compile phase (first attempt) | **PASS** — "Compiled successfully" before page data collection |

### 2.2 CI build (`deploy.yml`)

Sets: `MONGO_URL`, `DB_NAME`, `NEXT_PUBLIC_*` — aligns with required build-time env. **Expected green on GitHub Actions.**

### 2.3 Test scripts

| Script | Status on workstation |
|--------|----------------------|
| `npm run test:aeo` | **NOT RUN** — Sprint 0 documentation-only pass |
| `npm run test:billing` | **NOT RUN** — Sprint 0 documentation-only pass |
| `backend_test.py` | Orphaned — not in `package.json` or CI |

---

## 3. Broken imports

**Method:** Import graph from `app/`, `components/`, `lib/` — all `@/` aliases resolve via Next.js.

| Finding | Severity |
|---------|----------|
| No missing `@/components` or `@/lib` targets in application code | ✅ |
| `lib/aeo/profile.js` imports `@/lib/aeo/compute` — valid | ✅ |
| Dead import: `Tabs*` in `leadedge360/page.js` | Low — compiles, unused |
| `EnterpriseNavigation.jsx`, `WorkspacePlaceholder.jsx` | Not imported anywhere — orphaned files, not broken imports |

**Circular dependencies:** None detected in `lib/` chain (`mongo` ← leaf; `scoring` → `prompts`; `profile` → `compute`; `tenant` → `auth`/`mongo`; `mobile-routes` → multiple libs; `route.js` → top). **NOT VERIFIED** by automated cycle detector — manual trace only.

---

## 4. Dead code

| Category | Count | Source |
|----------|-------|--------|
| Unused shadcn/ui components | 36 of 48 | `TECHNICAL_DEBT_REPORT.md` |
| Orphaned hooks | 2 | `hooks/use-toast.js`, `hooks/use-mobile.jsx` |
| Orphaned layout components | 2 | `EnterpriseNavigation.jsx`, `WorkspacePlaceholder.jsx` |
| `app/providers.js` | Not wired in `layout.js` | TanStack Query unused |
| Dead imports | 4 files | TECH_DEBT §4.1 |
| `backend_test.py`, `test_result.md` | Orphaned artifacts | — |

---

## 5. Duplicate components & APIs

### 5.1 UI duplicates

| Pattern | Locations |
|---------|-----------|
| `KpiCard` (shared) | `components/dashboard/KpiCard.jsx` — used in `leadedge360` |
| Inline `Kpi` | `retailedge360/page.js` L31–43 — duplicate pattern |
| Lead vs Product dialogs | `leadedge360` vs `retailedge360` — parallel structure |

### 5.2 Constant duplicates

| Constant | Locations |
|----------|-----------|
| `STATUSES`, `SOURCES`, `TERRITORIES` | `route.js` vs `leadedge360/page.js` |
| Plan prices | `lib/razorpay.js` PLANS vs `pricing/page.js` |
| `AGENTS` | Hardcoded in `route.js` only |

### 5.3 API duplicates / drift

| Issue | Detail |
|-------|--------|
| Single catch-all | ✅ No duplicate API servers |
| OpenAPI vs implementation | 3 paths documented but not implemented (POST sources, admin roles/subs) |
| Cookie web vs JWT mobile | **Parallel auth surfaces** — not duplicate routes but split access (E-002 target) |

---

## 6. Unused npm dependencies

**Direct app imports never use (per `TECHNICAL_DEBT_REPORT.md`):**

`axios`, `lodash` (direct), `@tanstack/react-table`, `swr`, `dayjs`, `date-fns` (direct), `zod`, `@hookform/resolvers`, `react-hook-form` (pages).

**Note:** `lodash`, `date-fns` pulled transitively by `recharts`, `react-day-picker`.

**Unused Radix packages:** Many correspond to unused shadcn components.

---

## 7. Environment variables

### 7.1 Documented in `.env.example`

`MONGO_URL`, `DB_NAME`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `CORS_ORIGINS`, `EMERGENT_LLM_KEY`, `EMERGENT_PROJECT_ID`, `EMERGENT_API_KEY`, Razorpay trio, `BILLING_TEST_MODE`, `N8N_WEBHOOK_TOKEN`.

### 7.2 Used in code but **missing from `.env.example`**

| Variable | Used in | Risk |
|----------|---------|------|
| `JWT_SECRET` | `lib/jwt.js` (defaults to dev secret) | **High** if unset in prod |
| `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL` | `lib/jwt.js` | Medium |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN` | `lib/whatsapp.js` | WA features off |
| `MSG91_*` | `lib/otp.js` | OTP dev mode without keys |
| `NODE_ENV` | cookies secure flag | — |
| `PILOT_MODE` | Referenced in strategy docs | NOT VERIFIED in code grep |

### 7.3 n8n workflow env (external)

`ASOFTECH_API`, `ASOFTECH_ORG_ID`, `N8N_WEBHOOK_TOKEN` — required in n8n container, not app `.env.example`.

---

## 8. TypeScript / JavaScript

| Item | Status |
|------|--------|
| Application language | JavaScript (`.js` / `.jsx`) |
| `next build` type check | Runs as part of build — passed compile phase |
| ESLint | `next lint` configured — not executed this pass |

---

## 9. Security warnings (config-level)

| Item | Location | Finding |
|------|----------|---------|
| `X-Frame-Options: ALLOWALL` | `next.config.js` | Non-standard; weak clickjacking posture |
| `Content-Security-Policy: frame-ancestors *` | `next.config.js` | Permissive embedding |
| `Access-Control-Allow-Origin: *` | `next.config.js` default | Broad CORS |
| `JWT_SECRET` dev default | `lib/jwt.js` | Must be set in production |
| `seed-reset` API | `route.js` | Dev utility — must be guarded in prod (E-001 / EN #87) |

---

## 10. Docker configuration

| Item | Status |
|------|--------|
| `docker-compose.yml` | ✅ app, mongo:7, n8n |
| `Dockerfile` | ✅ standalone output; copies `public` from builder |
| Empty `public/` in repo | ⚠️ Docker COPY may get empty dir — OK if no static assets |
| n8n basic auth default password | ⚠️ `changeme` — must change in prod |
| Postgres service | Commented out — correct for Mongo runtime |

---

## 11. GitHub Actions

| Item | Status |
|------|--------|
| Trigger | `main` push + `workflow_dispatch` |
| Build | `yarn install --frozen-lockfile` + `yarn build` with env placeholders |
| Deploy | SSH rsync + `docker compose up -d --build` |
| Smoke | `curl` `/api/` expects `ok:true` — **note:** health root returns `name` not `ok` — **potential smoke mismatch** (verify handler) |
| Secrets | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL` |

**Smoke test discrepancy:** `route.js` L126 returns `{ ok: true, name: ... }` — grep should match `ok`.

---

## 12. n8n workflow references

| File | Target API | Header |
|------|------------|--------|
| `whatsapp-lead-ingest.json` | `POST {{ASOFTECH_API}}/api/webhooks/whatsapp` | `X-Webhook-Token` |
| `facebook-lead-ingest.json` | `POST .../webhooks/facebook` | Same pattern |
| `google-lead-ingest.json` | `POST .../webhooks/google` | Same |
| `whatsapp-followup-automation.json` | App API for stale leads | Token |
| `aeo-profile-reminder.json` | Reminder pattern | — |
| `aeo-faq-nudge.json` | FAQ nudge | — |
| `aeo-review-reminder.json` | Review reminder | — |

**Production active state:** NOT VERIFIED (`EXECUTIVE_ACTION_REGISTER` OPS-08).

---

## 13. Missing static assets

| Asset | Referenced by | Impact |
|-------|---------------|--------|
| `public/downloads/*.tar.gz` | `app/download/page.js` | 404 |
| `public/downloads/*.zip` | Same | 404 |
| Project `public/` directory | — | Absent |

---

## 14. Findings summary

| Severity | Count | Examples |
|----------|-------|----------|
| **High** | 5 | Missing `public/`, build requires `MONGO_URL` at import time, JWT default secret, 36 dead UI components, download 404s |
| **Medium** | 8 | OpenAPI drift, unused deps, env.example incomplete, n8n not verified, smoke/ops SSH |
| **Low** | 6 | Dead imports, orphaned hooks, dual toast stack |

---

## 15. Recommended pre-Sprint 1 actions (documentation / ops — no code in Sprint 0)

1. Complete E-001 ops validation on authorized host with full env.  
2. Extend `.env.example` with JWT, WA, MSG91 keys (doc-only PR after freeze lift).  
3. Run `test:aeo` and `test:billing` on CI or staging.  
4. Confirm GitHub smoke test against `/api` response shape.  
5. Document n8n import runbook execution for OPS-08.

**STOP** — Repository validation complete. No files modified.
