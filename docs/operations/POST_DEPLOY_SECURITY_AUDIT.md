# Post-Deploy Security Audit

**Date:** 4 August 2026  
**SHA:** `bcc6215`  
**Mode:** Read-only — no code or configuration changes

---

## Summary

| Area | Result |
|------|--------|
| TLS | **Pass** — HTTPS, HSTS, cert valid to Sep 2026 |
| Security headers | **Pass** — HSTS, CSP frame-ancestors, XFO, nosniff |
| Docker hardening | **Pass** — non-root app user, not privileged |
| JWT / auth config | **Partial** — `JWT_SECRET` present |
| CORS | **Pass** — `CORS_ORIGINS` present |
| Webhook auth | **Partial** — token present; `N8N_WEBHOOK_ORG_ID` missing |
| Commercial secrets | **Fail** — Razorpay, SMTP, Emergent LLM missing |
| Cron security | **Review** — hourly agent job uses bearer token in crontab |

**Overall:** Suitable for **RC / limited pilot** with flags OFF. **Full commercial GA** requires completing missing secrets and ops hardening.

---

## HTTP security headers

Probed: `https://app.asoftechinsightz.com/signin`

| Header | Present | Value (summary) |
|--------|---------|-----------------|
| Strict-Transport-Security | ✓ | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | ✓ | `nosniff` |
| X-Frame-Options | ✓ | `SAMEORIGIN` |
| Referrer-Policy | ✓ | `strict-origin-when-cross-origin` |
| Content-Security-Policy | ✓ | `frame-ancestors 'self'` |
| Permissions-Policy | Not observed on signin | May vary by route |

Headers applied via `next.config.js` → `getSecurityHeaders()` in `lib/security-config.js`.

---

## JWT

| Check | Status |
|-------|--------|
| `JWT_SECRET` in `.env` | ✓ Present |
| Min length enforcement | Application-level (production requires ≥16 chars — not verified without value) |
| Sprint-1 flags | `WEB_JWT_BRIDGE=false` — bridge disabled in production |

RC-2 security suite: JWT cross-tenant isolation **PASS** (CI).

---

## CORS

| Check | Status |
|-------|--------|
| `CORS_ORIGINS` in `.env` | ✓ Present |
| Wildcard in production | Should be explicit app URL — verify value in ops review (not exposed here) |

---

## Webhook authentication

| Check | Status |
|-------|--------|
| `N8N_WEBHOOK_TOKEN` | ✓ Present (from legacy `N8N_WEBHOOK_SECRET` alias) |
| `N8N_WEBHOOK_ORG_ID` | ✗ Missing |
| Default token rejection | Verified in RC-2 security suite |

Inbound webhook routes require valid token when configured (`lib/security-config.js`).

---

## Docker user & capabilities

| Check | `asoftech-app` |
|-------|----------------|
| User | `uid=100(app)` — **non-root** |
| Privileged | `false` |
| CapAdd | none |
| ReadonlyRootfs | `false` |

**P1 recommendation:** Consider `read_only: true` with tmpfs for `/tmp` (future hardening, not implemented).

---

## TLS

| Item | Status |
|------|--------|
| Public URLs | HTTPS only (HTTP → 301) |
| Termination | `asoftech-edge-nginx` |
| Certificate | Let's Encrypt |
| `app.asoftechinsightz.com` expiry | **17 Sep 2026** |
| Protocol | TLS 1.2+ (nginx config) |

---

## Secrets inventory (presence only)

| Secret | Status |
|--------|--------|
| JWT_SECRET | ✓ |
| N8N_WEBHOOK_TOKEN | ✓ |
| N8N_BASIC_AUTH_PASSWORD | ✓ |
| N8N_WEBHOOK_ORG_ID | ✗ |
| EMERGENT_LLM_KEY | ✗ |
| Razorpay (3 keys) | ✗ |
| SMTP (3 keys) | ✗ |

Missing secrets block billing, email, and LLM features in production — not a transport security issue but a **commercial readiness** gap.

---

## Sprint-1 feature flags (production)

| Flag | Value | Implication |
|------|-------|-------------|
| ENFORCE_PLAN_LIMITS | false | Plan limits not enforced |
| WEB_JWT_BRIDGE | false | Cookie bridge off |
| AEO_SERVER_PROFILE | false | AEO server persistence off |
| ALLOW_PUBLIC_DEMO_ORG | false | Demo CRM gated |
| BILLING_TEST_MODE | false | Live billing mode expected when Razorpay configured |

---

## RC-2 security regression (reference)

Automated suite (Mongo service): **5/5 PASS**

- Invalid AEO URL rejected
- Webhook wrong token rejected
- Webhook correct token accepted
- JWT cross-tenant isolation
- Agent denied admin

---

## Recommendations (no code changes in this program)

1. Complete missing `.env` secrets before commercial GA.
2. Move cron bearer token to env file or Docker secret; rotate token.
3. Schedule quarterly TLS and header re-scan.
4. Enable Grafana alerts on 502 and disk usage.
5. Document authenticated CS smoke (`docs/operations/runtime-handover/`).

---

## Related

- `docs/security/` reports
- `PRODUCTION_HEALTH_REPORT.md`
- `GA_READINESS_SCORECARD.md`
