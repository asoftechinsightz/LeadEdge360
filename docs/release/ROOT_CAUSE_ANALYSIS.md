# RC-2 Docker Build — Root Cause Analysis

**Date:** 4 August 2026  
**Release:** Sprint-1 RC `v1.0.0-rc1`  
**SHA:** `bd35ea1034fc2f42a88d061de90db17b01b691c5`  
**Workflow:** RC-2 Validation — [Run #1](https://github.com/asoftechinsightz/LeadEdge360/actions/runs/30843140432)  
**Investigation scope:** Read-only reproduction + log inspection (no deploy, no push, no merge)  

---

## Executive summary

| Field | Value |
|-------|-------|
| **Root cause** | `yarn build` inside Docker **builder** stage runs without `MONGO_URL`; `lib/mongo.js` instantiates `MongoClient` at import time; Next.js page-data collection crashes |
| **First failing CI step** | `Docker image build` (`docker build -t asoftech-rc2:ci .`) |
| **Actual failing command** | `RUN yarn build` in Dockerfile builder stage (line 12) |
| **Exit code** | `1` |
| **Fix without app code?** | **YES** — Dockerfile build-time `ENV` or CI `docker build --build-arg` |
| **GO / NO GO for CI-only fix** | **GO** |

---

## Task 1 — Log inspection

### GitHub Actions (authenticated logs)

Workflow logs require sign-in (API log download returned **403** without token). Public run summary confirms:

| Item | Value |
|------|-------|
| Workflow | RC-2 Validation |
| Run ID | `30843140432` |
| Status | `completed` / `failure` |
| Duration | ~4m 33s |
| Artifacts | `rc2-validation` (4.86 KB) |
| Annotations | `rc2-validate` — Process completed with exit code **1** (×2) |

### Job step timeline (from jobs API + annotations)

| Step | Conclusion |
|------|------------|
| Set up job | success |
| Initialize containers (mongo service) | success |
| Checkout | success |
| Setup Node 20 | success |
| Install dependencies | success |
| **RC-2 automated suites (Mongo)** | **success** |
| **Production build** (`yarn build`) | **success** |
| Record build success | success |
| **Docker image build** | **failure** ← first failing step |
| Record docker failure | success |
| Start app for API regression | (downstream of docker fail) |
| Final RC-2 gate | failure |

### Reproduced error (VPS `docker build` on SHA `bd35ea1`)

Identical to CI Docker step — build fails in builder stage, not in Docker daemon or compose:

```
#11 [builder 5/5] RUN yarn build
...
#11 27.86 TypeError: Cannot read properties of undefined (reading 'startsWith')
#11 27.86     at connectionStringHasValidScheme (/app/node_modules/mongodb-connection-string-url/lib/index.js:9:30)
#11 27.86     at new ConnectionString (...)
#11 27.86     at new MongoClient (/app/node_modules/mongodb/lib/mongo_client.js:51:63)
#11 27.86     at 41004 (/app/.next/server/app/api/[[...path]]/route.js:1:2225)
...
#11 27.86 > Build error occurred
#11 27.86 Error: Failed to collect page data for /api/[[...path]]
...
#11 28.07 error Command failed with exit code 1.
#11 ERROR: process "/bin/sh -c yarn build" did not complete successfully: exit code: 1

Dockerfile:12
>>> RUN yarn build
ERROR: failed to build: failed to solve: process "/bin/sh -c yarn build" did not complete successfully: exit code: 1
```

**Stack trace chain:** `MongoClient(undefined)` → `connectionStringHasValidScheme` → `startsWith` on undefined URI.

---

## Task 2 — Failure classification

| Category | Verdict | Notes |
|----------|---------|-------|
| Dockerfile | **Contributing** | Builder stage runs `yarn build` with no build-time env |
| docker compose | **Not involved** | CI runs `docker build` directly, not compose |
| Missing files | **No** | Compile succeeded; failure at page-data collection |
| Next.js build | **Surface symptom** | `Failed to collect page data for /api/[[...path]]` |
| package.json / lockfile | **No** | `yarn install` and compile succeeded |
| node version | **No** | Node 20; standalone `yarn build` passed in same job |
| environment | **Root cause** | `MONGO_URL` unset inside Docker build context |
| GitHub runner | **No** | Reproduced on VPS with same SHA |

### Why standalone `yarn build` passed but Docker `yarn build` failed

RC-2 workflow sets job-level `env` (including `MONGO_URL`) for all steps **except** processes inside `docker build`, which use only Dockerfile `ENV`/`ARG` unless passed via `--build-arg`.

```yaml
# rc-validation.yml — job env applies to host yarn build, NOT inside docker build
env:
  MONGO_URL: mongodb://localhost:27017
  DB_NAME: asoftech_saas_rc2
  ...
```

| Build context | `MONGO_URL` | Result |
|---------------|-------------|--------|
| Host `yarn build` (CI step) | Set by workflow | **PASS** |
| Docker `RUN yarn build` | Not set in Dockerfile | **FAIL** |

---

## Task 3 — Fix without application code?

**Yes.** Two CI/CD-only options (no business logic change):

### Option A — Dockerfile builder `ENV` (recommended minimal fix)

Add build-time placeholders in **builder** stage only (not copied to runner stage artifacts):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
ENV MONGO_URL=mongodb://mongo:27017
ENV DB_NAME=asoftech_saas
ENV NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV JWT_SECRET=docker-build-placeholder-min-16-chars
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build
```

Runtime container still uses `.env` / compose — builder `ENV` does not affect runner stage.

### Option B — Workflow `docker build --build-arg` + Dockerfile `ARG`

`rc-validation.yml`:

```yaml
- name: Docker image build
  run: |
    docker build -t asoftech-rc2:ci . \
      --build-arg MONGO_URL=mongodb://localhost:27017 \
      --build-arg DB_NAME=asoftech_saas_rc2 \
      --build-arg NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
      --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
      --build-arg JWT_SECRET=rc2-test-secret
```

Dockerfile builder:

```dockerfile
ARG MONGO_URL=mongodb://mongo:27017
ARG DB_NAME=asoftech_saas
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG JWT_SECRET=docker-build-placeholder-min-16-chars
ENV MONGO_URL=$MONGO_URL DB_NAME=$DB_NAME ...
```

### Option C — Application code (NOT recommended for Sprint-1 freeze)

Defer `MongoClient` creation to `getDb()` first call in `lib/mongo.js`. Correct long-term pattern but touches application infrastructure module — **out of scope** unless PO waives freeze.

---

## Root cause (precise)

**Module-level MongoDB client initialization in `lib/mongo.js` executes during Next.js static page-data collection when `MONGO_URL` is undefined inside the Docker build container.**

### Affected files (read-only analysis)

| File | Role |
|------|------|
| `lib/mongo.js` | Lines 6–12: `new MongoClient(uri)` at import when `uri = process.env.MONGO_URL` is undefined |
| `app/api/[[...path]]/route.js` | Imports `getDb` from `@/lib/mongo` — triggers mongo module load at build |
| `Dockerfile` | Line 12: `RUN yarn build` without build-time env |
| `.github/workflows/rc-validation.yml` | `docker build` step does not pass build env into image build |

### Impact

| Area | Impact |
|------|--------|
| RC-2 Docker gate | **FAIL** — blocks RC-2 final gate |
| GitHub Release `v1.0.0-rc1` | **Blocked** — release not created pending green RC-2 |
| Production deploy | **Not triggered** — Deploy workflow failed earlier on `rc-ci-runner` (separate issue) |
| Runtime production | **No impact** — failure is build-time only; prod has `MONGO_URL` in `.env` |

---

## Fix recommendation

| Priority | Action | Files |
|----------|--------|-------|
| **P0** | Add builder-stage `ENV` placeholders in Dockerfile | `Dockerfile` |
| **P1** | Align `docker build` in RC-2 with same vars via `--build-arg` (optional if Dockerfile has defaults) | `.github/workflows/rc-validation.yml` |
| **P2** (post-Sprint-1) | Lazy Mongo init in `lib/mongo.js` | `lib/mongo.js` |

### Minimal PR scope (prepared, **not pushed**)

**Branch name (suggested):** `fix/rc2-docker-build-env`  
**Files changed:** 1–2 (Dockerfile required; workflow optional)  
**Lines:** ~6–15  

**PR title:** `fix(ci): supply build-time env for Docker yarn build`  
**PR body:** Fixes RC-2 Docker step by providing `MONGO_URL` during image build; no runtime or feature changes.

---

## Risk

| Risk | Level | Mitigation |
|------|-------|------------|
| Placeholder secrets in builder image layer | **Low** | Multi-stage build; runner stage does not inherit builder ENV |
| Wrong DB at build time | **None** | Build only needs valid connection string format, not live DB |
| Regression in prod runtime | **None** | No application code change in Option A/B |
| Masking lazy-init debt | **Low** | Document P2 lazy-init for post-Sprint-1 |

---

## Estimated effort

| Task | Effort |
|------|--------|
| Dockerfile ENV fix | **15 minutes** |
| Workflow build-arg alignment | **15 minutes** |
| Re-run RC-2 Validation | **5 minutes** (CI wait ~5 min) |
| Create GitHub Release on green | **10 minutes** |
| **Total** | **~1 hour** |

---

## Application code change (if PO requires Option C — DO NOT IMPLEMENT)

| File | Exact change | Exact reason | Exact impact |
|------|--------------|--------------|--------------|
| `lib/mongo.js` | Move `new MongoClient(uri)` + `connect()` inside `getDb()` behind `if (!global._mongoClientPromise)` guard; throw clear error if `!uri` at runtime | Prevent import-time DB connection during Next.js build | Build succeeds without `MONGO_URL`; runtime behavior unchanged when env set; **infrastructure module change** — not feature logic |

---

## GO / NO GO

| Decision | Verdict |
|----------|---------|
| **CI/CD-only fix (Option A)** | **GO** |
| **Application code fix required** | **NO** — not required for RC-2 Docker gate |
| **Deploy Sprint-1 RC** | **NO GO** — awaiting PO authorization + green RC-2 + separate Deploy/rc-ci-runner issues |

---

## References

- Workflow run: https://github.com/asoftechinsightz/LeadEdge360/actions/runs/30843140432
- Reproduced on VPS: `docker build` at `/tmp/sprint1-publish` @ `bd35ea1`
- Approved RC SHA: `bd35ea1034fc2f42a88d061de90db17b01b691c5`
- Tag: `v1.0.0-rc1`

**STOP:** No deployment, merge, push, or feature development performed during this investigation.
