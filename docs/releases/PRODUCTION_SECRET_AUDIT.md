# Production Secret Audit

**Date:** 4 August 2026  
**Host:** `leadedge360` (`187.127.179.138`)  
**Env file:** `/opt/asoftech-insightz/.env`  
**Method:** Non-empty line detection (`grep -c '^KEY=.`) — **values not read or reported**  

---

## Executive summary

| Metric | Value |
|--------|-------|
| Variables audited (this pass) | 8 |
| **PRESENT** | 0 |
| **MISSING** | 8 |
| Populate action taken | **None** — no credentials available to agent |
| Deploy blocked by secrets | **YES** |

---

## Charter variables (Workstream 3)

| Variable | `.env` key | Status | Health API |
|----------|------------|--------|------------|
| `N8N_WEBHOOK_ORG_ID` | `N8N_WEBHOOK_ORG_ID` | **MISSING** | — |
| `RAZORPAY_KEY_ID` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **MISSING** | `razorpay.ok: false` |
| `RAZORPAY_SECRET` | `RAZORPAY_KEY_SECRET` | **MISSING** | keys missing |
| `RAZORPAY_WEBHOOK_SECRET` | `RAZORPAY_WEBHOOK_SECRET` | **MISSING** | — |
| `SMTP_HOST` | `SMTP_HOST` | **MISSING** | `smtp.ok: false` |
| `SMTP_USER` | `SMTP_USER` | **MISSING** | missing SMTP_USER |
| `SMTP_PASSWORD` | `SMTP_PASS` | **MISSING** | missing SMTP_PASS |
| `EMERGENT_LLM_KEY` | `EMERGENT_LLM_KEY` | **MISSING** | — |

---

## Previously verified present (prior audit — not re-required this pass)

| Variable | Status |
|----------|--------|
| `JWT_SECRET` | **PRESENT** |
| `N8N_WEBHOOK_SECRET` | **PRESENT** |
| `N8N_PASSWORD` | **PRESENT** |
| `CORS_ORIGINS` | **PRESENT** |

---

## External corroboration

`GET https://app.asoftechinsightz.com/api/health` (4 Aug 2026):

- `database.ok: true`
- `smtp.ok: false` — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` missing
- `razorpay.ok: false` — `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` missing
- `billing.keysConfigured: false`
- `smtp.mode: dry_run`

---

## Population status

| Action | Performed? |
|--------|------------|
| Edit `/opt/asoftech-insightz/.env` | **NO** |
| Restart containers | **NO** |
| Expose secret values in logs/docs | **NO** |

**Reason:** Production credentials must be supplied by Product Owner / finance / Emergent / Razorpay / SMTP provider. Agent cannot invent live keys.

---

## PO / Infra actions to complete secrets

1. Obtain live or pilot values from:
   - Razorpay dashboard (key ID, secret, webhook secret)
   - SMTP provider (host, user, password)
   - Emergent console (`EMERGENT_LLM_KEY`)
   - Operations (`N8N_WEBHOOK_ORG_ID` — target tenant org for ingest)
2. Append to `/opt/asoftech-insightz/.env` via SSH (`ssh asoftech-vps`).
3. `chmod 600 .env`
4. Re-run presence audit (grep counts or health endpoint).
5. **Do not** restart app until PO deploy authorization (or restart only after explicit GO).

Example keys to add (values from PO):

```env
N8N_WEBHOOK_ORG_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
EMERGENT_LLM_KEY=
```

---

## Sprint-1 flags (explicit OFF — not populated)

| Flag | In `.env` | Required |
|------|-----------|----------|
| `ENFORCE_PLAN_LIMITS` | Missing | `false` |
| `WEB_JWT_BRIDGE` | Missing | `false` |
| `AEO_SERVER_PROFILE` | Missing | `false` |

---

## Verdict

| Secrets complete? | **NO** |
| Blocker for deployment authorization | **YES** |

See [DEPLOYMENT_AUTHORIZATION_REQUEST.md](./DEPLOYMENT_AUTHORIZATION_REQUEST.md).
