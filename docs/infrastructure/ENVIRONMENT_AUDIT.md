# Environment Audit

**Date:** 3 August 2026  
**Host:** `leadedge360` (`187.127.179.138`)  
**Env file:** `/opt/asoftech-insightz/.env` (40 lines, 33 key assignments)  
**Method:** Read-only key-name inventory + non-empty line detection (`grep -c '^KEY=.'`) — **values not reported**  

---

## Summary

| Category | Present | Missing |
|----------|---------|---------|
| Security / webhook | 4 | 1 |
| Billing | 0 | 3 |
| SMTP | 0 | 3 |
| LLM | 0 | 1 |
| Sprint-1 flags | 0 | 3 |

**Runtime health API** (`GET /api/health`) corroborates: SMTP and Razorpay **not configured** at application level.

---

## Mandatory variables (charter checklist)

| Variable (charter name) | `.env` key checked | Status | Notes |
|------------------------|-------------------|--------|-------|
| `JWT_SECRET` | `JWT_SECRET` | **PRESENT** | Non-empty line in `.env`; present in container env |
| `N8N_WEBHOOK_TOKEN` | `N8N_WEBHOOK_SECRET` | **PRESENT** | **Alias mismatch** — production uses `N8N_WEBHOOK_SECRET`, not `N8N_WEBHOOK_TOKEN` |
| `N8N_WEBHOOK_ORG_ID` | `N8N_WEBHOOK_ORG_ID` | **MISSING** | Not in `.env` key list |
| `N8N_BASIC_AUTH_PASSWORD` | `N8N_PASSWORD` | **PRESENT** | **Alias mismatch** — compose uses `N8N_USER` / `N8N_PASSWORD` |
| `CORS_ORIGINS` | `CORS_ORIGINS` | **PRESENT** | |
| `RAZORPAY_KEY_ID` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **MISSING** | Health: keys not configured |
| `RAZORPAY_SECRET` | `RAZORPAY_KEY_SECRET` | **MISSING** | Health: keys not configured |
| `RAZORPAY_WEBHOOK_SECRET` | `RAZORPAY_WEBHOOK_SECRET` | **MISSING** | |
| `SMTP_HOST` | `SMTP_HOST` | **MISSING** | Health: missing SMTP vars |
| `SMTP_USER` | `SMTP_USER` | **MISSING** | |
| `SMTP_PASSWORD` | `SMTP_PASS` | **MISSING** | Charter name `SMTP_PASSWORD`; file uses `SMTP_PASS` pattern — **not found** |
| `EMERGENT_LLM_KEY` | `EMERGENT_LLM_KEY` | **MISSING** | |

---

## Sprint-1 feature flags (deploy charter — must be OFF)

| Variable | In `.env` | Runtime note |
|----------|-----------|----------------|
| `ENFORCE_PLAN_LIMITS` | **MISSING** | Not set — defaults apply in app |
| `WEB_JWT_BRIDGE` | **MISSING** | Not set |
| `AEO_SERVER_PROFILE` | **MISSING** | Not set |
| `ALLOW_PUBLIC_DEMO_ORG` | **MISSING** | Not set |

**No flag changes were made** during this audit.

---

## Additional keys in `.env` (names only)

Present in file but outside charter checklist:

`AGENT_CRON_SECRET`, `CERT_ADMIN_EMAIL`, `CERT_ADMIN_PASSWORD`, `DB_NAME`, `DEV_AUTH_BYPASS`, `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACES_API_KEY`, `GRAFANA_HOST_PORT`, `GRAFANA_URL`, `MARKETING_LEAD_ORG_ID`, `MONGO_PASSWORD`, `MONGO_URL`, `MONGO_USERNAME`, `N8N_ENABLED`, `N8N_USER`, `N8N_WEBHOOK_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_USE_MOCK_API`, `PILOT_VERSION`, `PUBLIC_SIGNUP_ENABLED`, `PUBLIC_URL`, `RETEST_API_BASE`

---

## Container runtime env (key names only)

Keys observed in `asoftech-app` container related to audit:

`CORS_ORIGINS`, `JWT_SECRET`, `N8N_ENABLED`, `N8N_PASSWORD`, `N8N_USER`, `N8N_WEBHOOK_SECRET`, `N8N_WEBHOOK_URL`

Not observed in container env key list: Razorpay, SMTP, Emergent LLM, Sprint-1 flags, `N8N_WEBHOOK_ORG_ID`.

---

## Health API integration status

| Integration | Health `checks` | Matches `.env` audit |
|-------------|-----------------|----------------------|
| Database | `ok: true` | Mongo credentials in `.env` |
| SMTP | `ok: false` — missing SMTP_* | **Yes** |
| Razorpay | `ok: false` — keys missing | **Yes** |
| OAuth signup | `oauthSignupEnabled: false` | Emergent not configured |

---

## Alias / documentation gaps

| Charter / RC name | Production name | Action (infra docs only) |
|-------------------|-----------------|--------------------------|
| `N8N_WEBHOOK_TOKEN` | `N8N_WEBHOOK_SECRET` | Align docs or add both keys on deploy |
| `N8N_BASIC_AUTH_PASSWORD` | `N8N_PASSWORD` | Align compose env naming |
| `SMTP_PASSWORD` | `SMTP_PASS` | Standardize in `.env.example` vs pilot |
| Deploy path | `/opt/asoftech` vs `/opt/asoftech-insightz` | Fix runbooks / workflow |

---

## Pre-deploy gate (charter)

**Would block deployment:** Missing Razorpay (3), SMTP (3), `N8N_WEBHOOK_ORG_ID`, `EMERGENT_LLM_KEY`.

**Present:** JWT, webhook secret (aliased), n8n password (aliased), CORS.

---

## Verdict

| Environment ready for RC deploy | **NO** — 7+ mandatory vars missing |
| Values modified during audit | **NO** |
| Secrets exposed in this report | **NO** |

Await infrastructure approval before populating missing secrets and redeploying.
