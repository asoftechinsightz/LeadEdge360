# Production Acceptance Test Report

**Generated:** 2026-06-28T23:17:04.653Z
**Verdict:** FAILED
**Promotion allowed:** NO — do not route customer traffic
**Deployment tag:** v1.0.0-rc3-pilot
**API base:** http://127.0.0.1:3000/api

## Summary

| Metric | Value |
|--------|-------|
| Total checks | 18 |
| Passed | 10 |
| Failed (critical) | 7 |
| Warnings | 1 |
| p95 latency | 0ms |

## Critical failures

- **infrastructure / API liveness:** fetch failed
- **infrastructure / MongoDB readiness:** fetch failed
- **authentication / Admin credentials configured:** set CERT_ADMIN_EMAIL/PASSWORD
- **isolation / Tenant isolation suite:** no auth token
- **crm / CRM workflow suite:** no auth token
- **retail / Retail POS suite:** no auth token
- **system / PAT runner:** fetch failed

## infrastructure

| Check | Result | Detail |
|-------|--------|--------|
| API liveness | ❌ | fetch failed |
| MongoDB readiness | ❌ | fetch failed |
| Docker containers | ✅ | skipped (PAT_SKIP_DOCKER or Windows) |
| Redis configured | ✅ | optional — REDIS_URL unset |
| Reverse proxy + SSL | ✅ | skipped — set PUBLIC_URL=https://... |

## database

| Check | Result | Detail |
|-------|--------|--------|
| Migration rollback pairs | ✅ | 4 up migrations |
| Migration runner present | ✅ | database/migrations/run.mjs |
| Rollback readiness | ✅ | every .up.mjs has matching .down.mjs |

## configuration

| Check | Result | Detail |
|-------|--------|--------|
| Env MONGO_URL | ✅ | set |
| Env DB_NAME | ✅ | set |
| Env JWT_SECRET | ✅ | set |
| Upload storage directory | ✅ | D:\AsoftechInsightz_Project\asoftech-insightz\public\uploads |

## authentication

| Check | Result | Detail |
|-------|--------|--------|
| Admin credentials configured | ❌ | set CERT_ADMIN_EMAIL/PASSWORD |

## isolation

| Check | Result | Detail |
|-------|--------|--------|
| Tenant isolation suite | ❌ | no auth token |

## crm

| Check | Result | Detail |
|-------|--------|--------|
| CRM workflow suite | ❌ | no auth token |

## retail

| Check | Result | Detail |
|-------|--------|--------|
| Retail POS suite | ❌ | no auth token |

## razorpay

| Check | Result | Detail |
|-------|--------|--------|
| Razorpay credentials | ⚠️ | keys missing |

## system

| Check | Result | Detail |
|-------|--------|--------|
| PAT runner | ❌ | fetch failed |

---

**Gate:** Any critical failure blocks customer promotion until resolved and PAT re-run passes.