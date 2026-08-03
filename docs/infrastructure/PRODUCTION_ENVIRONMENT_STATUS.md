# Production Environment Status

**Date:** 3 August 2026  
**Host:** `leadedge360` (`187.127.179.138`)  
**Public URL:** `https://app.asoftechinsightz.com`  
**App root:** `/opt/asoftech-insightz`  
**Method:** SSH read-only + `grep -c '^KEY=.'` (non-empty line detection)  

---

## Summary

| Area | Status |
|------|--------|
| Application | **Running** — health 200 |
| MongoDB | **Healthy** |
| Edge Nginx | **Running** (healthy) |
| SSL | **Valid** until 17 Sep 2026 |
| Secrets completeness | **INCOMPLETE** — 5 present, 7 missing |
| Sprint-1 flags in `.env` | **Not set** (defaults apply) |

**No values were read or reported.** PRESENT = non-empty key in `/opt/asoftech-insightz/.env`.

---

## Mandatory variables

| Variable (audit name) | `.env` key | Status |
|-----------------------|------------|--------|
| `JWT_SECRET` | `JWT_SECRET` | **PRESENT** |
| `N8N_WEBHOOK_SECRET` | `N8N_WEBHOOK_SECRET` | **PRESENT** |
| `N8N_WEBHOOK_ORG_ID` | `N8N_WEBHOOK_ORG_ID` | **MISSING** |
| `N8N_PASSWORD` | `N8N_PASSWORD` | **PRESENT** |
| `CORS_ORIGINS` | `CORS_ORIGINS` | **PRESENT** |
| `RAZORPAY_KEY_ID` | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **MISSING** |
| `RAZORPAY_SECRET` | `RAZORPAY_KEY_SECRET` | **MISSING** |
| `RAZORPAY_WEBHOOK_SECRET` | `RAZORPAY_WEBHOOK_SECRET` | **MISSING** |
| `SMTP_HOST` | `SMTP_HOST` | **MISSING** |
| `SMTP_USER` | `SMTP_USER` | **MISSING** |
| `SMTP_PASSWORD` | `SMTP_PASS` | **MISSING** |
| `EMERGENT_LLM_KEY` | `EMERGENT_LLM_KEY` | **MISSING** |

---

## Health API corroboration

`GET /api/health` (external, 3 Aug 2026):

| Check | Result |
|-------|--------|
| `database` | `ok: true` — connected |
| `smtp` | `ok: false` — missing SMTP_* |
| `razorpay` | `ok: false` — keys missing |
| `pilotMode` | `true` |
| `oauthSignupEnabled` | `false` |

Aligns with `.env` audit (SMTP + Razorpay missing).

---

## Feature flags (not modified)

| Flag | In `.env` | Charter target |
|------|-----------|----------------|
| `ENFORCE_PLAN_LIMITS` | Not set | `false` |
| `WEB_JWT_BRIDGE` | Not set | `false` |
| `AEO_SERVER_PROFILE` | Not set | `false` |
| `ALLOW_PUBLIC_DEMO_ORG` | Not set | `false` (production) |

---

## Runtime snapshot (SSH)

| Item | Value |
|------|-------|
| Git SHA | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| Branch | `feature/homepage-phase1` |
| Commit | `Sprint17 industries and footer` |
| App container | `asoftech-app` — Up, healthy |
| App image | `asoftech-insightz-app` |
| Image / container created | `2026-08-03T12:03:52Z` |
| Mongo | `asoftech-mongo` — running, healthy |
| Edge nginx | `asoftech-edge-nginx` — Up 2h, healthy |
| Local health | `http://127.0.0.1:3000/api/health` → 200 |

---

## SSL

| Field | Value |
|-------|-------|
| Subject | `CN=asoftechinsightz.com` |
| Not before | 19 Jun 2026 |
| Not after | **17 Sep 2026** |
| Probe | HTTPS OK |

---

## Actions required (infra only)

1. Add **MISSING** keys to `/opt/asoftech-insightz/.env` (PO supplies values).
2. Add explicit Sprint-1 flags `false` before RC deploy.
3. Re-run presence audit after population (same `grep -c` method).

**No deployment performed.** No `.env` edits during this audit.
