# Deployment Parity Report

**Date:** 3 August 2026  
**Comparison:** Running production vs approved Sprint-1 RC (E-002, E-003, E-004)  

---

## Executive summary

| Dimension | Status |
|-----------|--------|
| Git SHA parity | **FAIL** — running branch ≠ `main` ≠ local RC artifact |
| Sprint-1 code parity | **FAIL** — E-002/E-004 files absent on running tree |
| Docker image | **Current** — rebuilt ~6 hours before audit |
| Deploy path parity | **FAIL** — workflow targets wrong directory |
| Feature flags | **Implicit OFF** — not set in `.env` |
| **Overall parity** | **FAIL** |

---

## Git state (VPS: `/opt/asoftech-insightz`)

| Item | Value |
|------|-------|
| **Running checkout SHA** | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| **Running branch** | `feature/homepage-phase1` |
| **Running commit message** | `Sprint17 industries and footer` |
| **Remote** | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |

### Reference branches / tags (same repo)

| Ref | SHA | Message |
|-----|-----|---------|
| `main` | `5cb6f189e15de610b50c9a3d184850a882d019b4` | LeadEdge360 CRM Backend Phase 1-6 stable build |
| `v1.2.0` (tag) | `6f4fea1dc68e7c6353f79ade020c09df575397b4` | Phase 7C download engine implemented |
| `v1.1.0` (tag) | `22b677c1a1c4f7a2b27f3f274af11426a42b3fef` | Phase 7A Reports APIs implemented |

### Approved RC reference (program)

| Source | SHA / identity | Notes |
|--------|----------------|-------|
| **GitHub Actions deploy.yml** | `origin/main` on reset | Would deploy `5cb6f18…` — **not** current running SHA |
| **Local RC workspace** (`asoftech-insightz-v1.2.0`) | **No git SHA** — not a git repository | Sprint-1 + Phase 0 security remediation |
| **RC-3 certification** | Workstation evidence; CI not run | Commercial GA **NO GO** |

**Neither `main` nor `v1.2.0` matches running `0e1b7e8`.** Local Downloads RC is a **separate artifact lineage** from GitHub `AsoftechLeadEdge360` tags.

---

## Sprint-1 epic file parity (on running tree)

| Epic | Expected artifact | On running deploy (`0e1b7e8`) |
|------|-------------------|-------------------------------|
| E-002 JWT bridge | `lib/request-actor.js` | **Absent** |
| E-002 | `lib/mobile-routes.js` bridge paths | Not verified file-level |
| E-003 AEO | `lib/aeo/*`, server profile flag | Not fully scanned |
| E-004 entitlements | `lib/billing/plan-entitlements.js` | **Absent** |
| Phase 0 security | `lib/security-config.js` | **Absent** |

**Conclusion:** Running build is **not** the certified Sprint-1 RC from local remediation workspace.

---

## Docker image parity

| Field | Value |
|-------|-------|
| Container | `asoftech-app` |
| Image name | `asoftech-insightz-app` |
| Image ID | `sha256:01f8d869dc1e306282a59e3354c6e8a6a929141b71534a81f2797a8e87f48296` |
| Container created | `2026-08-03T12:03:52Z` (~6h before audit) |
| Image size | ~1.2 GB |
| `package.json` version | `0.1.0` (name: `nextjs-mongo-template`) |

Image is **recent** but built from **`feature/homepage-phase1`** tree, not approved RC commit.

---

## Workflow / path parity

| Item | deploy.yml / docs | Production |
|------|-------------------|------------|
| Working directory | `/opt/asoftech` | **`/opt/asoftech-insightz`** |
| `git reset` target | `origin/main` | Checked out **`feature/homepage-phase1`** |
| Compose project | Implied single stack | **`/opt/asoftech-insightz/docker-compose.yml`** |

Automated deploy would **miss or fail** unless paths aligned.

---

## Runtime API parity (external signals)

| Signal | Running pilot | Sprint-1 RC (expected) |
|--------|---------------|------------------------|
| `/api/health` rich pilot JSON | **Yes** | May differ |
| `/api/metrics` Prometheus | **Yes** | Optional |
| `/api/leads` unauthenticated | 401 `UNAUTHORIZED` | 401 after Phase 0 |
| `/api/agents` | 401 | 200 public in RC |
| `/billing` route | 404 | May exist in RC App Router |
| Auth configured | `configured: false` | Env-dependent |

---

## Feature flag parity

| Flag | Required for deploy | On `.env` | Effective |
|------|---------------------|-----------|-----------|
| `ENFORCE_PLAN_LIMITS` | `false` | Missing | Default (likely false) |
| `WEB_JWT_BRIDGE` | `false` | Missing | Default (likely false) |
| `AEO_SERVER_PROFILE` | `false` | Missing | Default (likely false) |

**Charter satisfied** for “flags OFF” only by omission — not explicitly set.

---

## Parity score

| Area | Score / 100 |
|------|-------------|
| Git SHA vs `main` | 0 |
| Git SHA vs local RC | 0 (untracked SHA) |
| Sprint-1 code files | 15 |
| Deploy automation path | 20 |
| Docker freshness | 85 |
| Feature flags explicit | 50 |
| **Overall parity** | **22 / 100** |

---

## Required actions before RC deploy

1. **Tag and push** approved Sprint-1 RC commit to `arnav02champ/AsoftechLeadEdge360` (or correct remote).
2. **Checkout that SHA** on VPS at `/opt/asoftech-insightz` (not `feature/homepage-phase1`).
3. **Fix `deploy.yml`** path to `/opt/asoftech-insightz`.
4. **Rebuild** image from approved SHA only after env secrets complete ([ENVIRONMENT_AUDIT.md](./ENVIRONMENT_AUDIT.md)).
5. **Verify** E-002/E-003/E-004 files exist post-checkout before `docker compose up`.

**No deployment performed in this audit.**
