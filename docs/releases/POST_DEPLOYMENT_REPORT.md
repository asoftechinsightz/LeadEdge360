# Post-Deployment Report — Controlled Pilot

**Date:** 3 August 2026  
**Host:** `https://app.asoftechinsightz.com`  
**Deployment executed:** **No** (blocked pre-deploy)  
**Report type:** External post-state of **current live pilot** + expected post-RC state  

---

## Summary

The Sprint-1 RC was **not deployed** from the operator environment. This report records the **current production pilot** state after external verification, and defines **expected** post-deployment checks once RC is pushed.

| Item | Value |
|------|-------|
| Deployment completed | **No** |
| Live app status | **Running** (pilot) |
| Mongo | **Connected** |
| Feature flags (Sprint 1) | **Not verified on host** — assume unchanged |
| Post-deploy score (live) | **62 / 100** |

---

## Service health (live)

### Application

```json
{
  "ok": true,
  "status": "pilot",
  "checks": {
    "database": { "ok": true, "detail": "connected" },
    "smtp": { "ok": false, "detail": "missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS" },
    "razorpay": { "ok": false, "detail": "NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing" }
  },
  "pilot": {
    "pilotMode": true,
    "productionLike": true,
    "billing": { "keysConfigured": false, "checkoutEnabled": false },
    "smtp": { "configured": false, "mode": "dry_run" },
    "oauthSignupEnabled": false,
    "trialProvisioningAvailable": true
  }
}
```

**Probe time:** `2026-08-03T18:18:39Z` (health `time` field).

### Integrations

| Integration | Status | Detail |
|-------------|--------|--------|
| Mongo | **OK** | Health check connected |
| SMTP | **FAIL** | Env vars missing; dry-run mode |
| Razorpay | **FAIL** | Keys not configured |
| JWT | **UNKNOWN** | Not reported in health |
| Emergent Auth | **FAIL** | `configured: false` on `/api/auth/me` |
| Docker / Nginx | **PARTIAL** | Nginx 1.27.5 observed; Docker not inspected |

### Metrics snapshot (Prometheus text)

```
asoftech_process_uptime_seconds 22482
asoftech_nodejs_heap_used_bytes 70710504
asoftech_nodejs_rss_bytes 141127680
asoftech_active_tenants 0
asoftech_active_users_24h 1
asoftech_leads_created_total 0
```

Uptime ~6.2 hours at probe time (if metrics are accurate).

---

## Route verification (external)

| Route | Status | Expected after RC deploy |
|-------|--------|--------------------------|
| `/api/health` or `/api/` | 200 | 200 + `ok:true` |
| `/api/metrics` | 200 | 200 or documented absence |
| `/signin` | 200 | 200 |
| `/dashboard` | 200 | 200 |
| `/leadedge360` | 200 | 200 |
| `/pricing` | 301 | 200 or redirect OK |
| `/contact` | 301 | 200 or redirect OK |
| `/api/leads` (no auth) | 401 | 401 (Phase 0) unless `ALLOW_PUBLIC_DEMO_ORG=true` |
| `/api/kpis` (no auth) | 401 | 401 |
| `/api/auth/me` | 200 | 200 |
| `/billing` | 404 | 200 when route exists in RC |

---

## Security posture (external headers)

Observed on `/signin`:

- `X-Frame-Options: SAMEORIGIN`
- `Content-Security-Policy` with `frame-ancestors 'self'`
- `Strict-Transport-Security` expected at nginx layer
- `Referrer-Policy: strict-origin-when-cross-origin`

Aligns with hardened headers; full VPS secret audit still required.

---

## Feature flags (Phase 4 charter)

| Flag | Required at deploy | Verified |
|------|-------------------|----------|
| `ENFORCE_PLAN_LIMITS` | `false` | **Not verified** |
| `WEB_JWT_BRIDGE` | `false` | **Not verified** |
| `AEO_SERVER_PROFILE` | `false` | **Not verified** |

**No Sprint-1 features were enabled** during this session.

---

## Performance (external)

| Endpoint | Response time |
|----------|---------------|
| `/api/health` | ~227 ms |
| `/leadedge360` | ~228 ms |
| `/api/agents` | ~374 ms |

Full load testing not performed.

---

## Gaps blocking “post-deploy complete”

1. RC artifact not deployed — live code diverges from Sprint-1 RC.
2. Razorpay + SMTP secrets missing on live host.
3. Emergent auth not configured (`configured: false`).
4. No authenticated smoke (lead CRUD, KPIs, billing, admin).
5. No VPS-side backup verification.
6. Git SHA / Docker image tag unknown.

---

## Recommendation

| Verdict | Meaning |
|---------|---------|
| **NO GO** | RC deploy not completed |
| **CONDITIONAL GO** | Pilot remains online for read-only marketing; not ready for commercial billing or email |

**Next step:** Complete VPS deploy per [VPS_DEPLOYMENT_REPORT.md](./VPS_DEPLOYMENT_REPORT.md), then re-run this checklist with authenticated sessions and `backend_test.py`.

**Stop:** Await PO approval after successful RC deploy verification. Do not begin Sprint 2.
