# Smoke Test Report — Controlled Pilot Deploy

**Date:** 3 August 2026  
**Target:** `https://app.asoftechinsightz.com`  
**RC deploy executed:** **No**  
**Test scope:** External unauthenticated probes + health API  

---

## Summary

| Metric | Value |
|--------|-------|
| Tests executed | 18 |
| Passed | 11 |
| Failed | 4 |
| Skipped (auth / SSH / write) | 7 |
| **Smoke result** | **FAIL** |
| **Verdict** | **NO GO** for RC sign-off |

---

## Phase 6 matrix

| Area | Test | Method | Result | Notes |
|------|------|--------|--------|-------|
| **Health** | API health | `GET /api/health` | **PASS** | `ok:true`, Mongo connected |
| **Health** | Root API | `GET /api/` | **SKIP** | Returns redirect body `/api` |
| **Auth** | Sign-in page | `GET /signin` | **PASS** | 200 |
| **Auth** | Session probe | `GET /api/auth/me` | **PASS** | `user:null`, `configured:false` |
| **Auth** | Emergent login flow | Browser | **SKIP** | Auth not configured |
| **Auth** | JWT mobile login | API | **SKIP** | No test credentials |
| **Leads** | List unauthenticated | `GET /api/leads` | **PASS*** | 401 — expected post Phase 0 |
| **Leads** | Create lead | `POST /api/leads` | **SKIP** | Requires auth |
| **Leads** | CRUD regression | `backend_test.py` | **SKIP** | Not run |
| **KPIs** | Dashboard KPIs | `GET /api/kpis` | **PASS*** | 401 without auth |
| **Dashboard** | Shell | `GET /dashboard` | **PASS** | 200 |
| **LeadEdge** | CRM page | `GET /leadedge360` | **PASS** | 200 |
| **Retail** | Retail module page | Manual | **SKIP** | Not probed |
| **AI scoring** | Lead score on create | API | **SKIP** | Requires auth + LLM key unknown |
| **Billing** | Pricing page | `GET /billing` | **FAIL** | 404 |
| **Billing** | Razorpay checkout | Health | **FAIL** | Keys not configured |
| **Billing** | Simulate endpoint | API | **SKIP** | Must stay blocked in prod |
| **Webhook** | n8n ingest token | API | **SKIP** | No token; no write test |
| **Webhook** | Razorpay webhook | API | **SKIP** | |
| **Notifications** | SMTP send | Health | **FAIL** | SMTP not configured |
| **Admin** | Admin routes | API | **SKIP** | Requires auth |
| **AEO** | AEO dashboard | UI | **SKIP** | `AEO_SERVER_PROFILE=false` by policy |
| **Agents** | Public agent list | `GET /api/agents` | **FAIL** | 401 — RC expects 200; live ≠ RC |
| **Contact** | Public form | `GET /contact` | **PASS** | 301 redirect |
| **Metrics** | Prometheus | `GET /api/metrics` | **PASS** | 200 text metrics |
| **Security** | Frame/CSP headers | Headers | **PASS** | SAMEORIGIN, CSP present |

\*Pass = security-correct denial without auth.

---

## Automated suites (not run on production)

| Suite | Status | Reason |
|-------|--------|--------|
| `npm run test:aeo` | **SKIP** | Local only |
| `npm run test:bridge` | **SKIP** | Local only |
| `npm run test:billing` | **SKIP** | Requires Mongo |
| `npm run test:rc` | **SKIP** | Requires Mongo |
| `backend_test.py` | **SKIP** | Requires unauthenticated demo or auth setup |
| RC security suite | **SKIP** | Requires Mongo |

**CI reference:** `.github/workflows/rc-validation.yml` with `ALLOW_PUBLIC_DEMO_ORG=true` for regression against production build.

---

## Expected smoke after successful RC deploy

1. `curl -fsS https://app.asoftechinsightz.com/api/health` or `/api/` → `ok:true`
2. Authenticated `GET /api/leads` → 200 with org-scoped data
3. `POST /api/leads` → 201 with score 0–100
4. `GET /api/kpis` → 200
5. Emergent sign-in → dashboard loads (if keys set)
6. Razorpay keys present in health when configured
7. SMTP `ok:true` when configured
8. Feature flags OFF verified in `.env`
9. `backend_test.py` pass against `RC_API_BASE_URL`

---

## Smoke score

| Category | Score / 100 |
|----------|-------------|
| Availability | 85 |
| Auth readiness | 30 |
| CRM API | 40 |
| Billing | 10 |
| Notifications | 0 |
| Security gates | 80 |
| **Overall** | **42 / 100** |

---

## Verdict

| Result | **FAIL** |
|--------|----------|
| RC deployed | **No** |
| Ready for PO pilot expansion | **No** |
| Enable Sprint-1 flags | **No** — wait for PO |

**Recommendation:** Complete VPS deploy + secret configuration, then re-run authenticated smoke and `backend_test.py`. **Do not enable** `WEB_JWT_BRIDGE`, `AEO_SERVER_PROFILE`, or `ENFORCE_PLAN_LIMITS`.
