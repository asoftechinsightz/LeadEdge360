# Security Revalidation

**Program:** Commercial GA Closure  
**Date:** 4 August 2026  
**SHA:** `bcc6215` / docs `336685f`  
**Mode:** Read-only — no fixes applied

---

## Summary

| Area | Result |
|------|--------|
| TLS / HTTPS | **PASS** |
| Security headers | **PASS** |
| JWT / CORS config | **PARTIAL** (secrets present; org id missing) |
| Docker hardening | **PASS** (non-root app) |
| Host firewall | **PARTIAL** (UFW active) |
| SSH hardening | **FAIL** (root + password auth) |
| Fail2Ban | **PASS** (active) |
| Commercial secrets | **FAIL** (see secret verification) |

---

## JWT

| Check | Status |
|-------|--------|
| `JWT_SECRET` in `.env` | ✓ Present |
| `WEB_JWT_BRIDGE` | `false` (production) |
| RC-2 cross-tenant test | PASS (CI reference) |

---

## TLS

| Item | Status |
|------|--------|
| Public URLs | HTTPS |
| HSTS | `max-age=31536000; includeSubDomains` |
| Certificate `app.asoftechinsightz.com` | Valid to **17 Sep 2026** |
| Termination | `asoftech-edge-nginx` |

---

## HTTP security headers

Probed: `https://app.asoftechinsightz.com/signin`

| Header | Present |
|--------|---------|
| Strict-Transport-Security | ✓ |
| X-Content-Type-Options | ✓ nosniff |
| X-Frame-Options | ✓ SAMEORIGIN |
| Referrer-Policy | ✓ strict-origin-when-cross-origin |
| Content-Security-Policy | ✓ frame-ancestors 'self' |

---

## CORS

| Check | Status |
|-------|--------|
| `CORS_ORIGINS` | ✓ Present |
| Value audit | Not performed (no value exposure) |

---

## Webhook auth

| Check | Status |
|-------|--------|
| `N8N_WEBHOOK_TOKEN` | ✓ Present |
| `N8N_WEBHOOK_ORG_ID` | ✗ Missing |
| Wrong-token rejection | PASS (RC-2 CI) |

---

## Docker user & container permissions

| Check | `asoftech-app` |
|-------|----------------|
| User | `uid=100(app)` — non-root |
| Privileged | `false` |
| ReadonlyRootfs | `false` |
| CapAdd | none |

---

## Firewall (UFW)

```
Status: active
22/tcp ALLOW Anywhere
```

**Notes:**

- Only SSH rule observed in summary output.
- Ports 80/443 served by Docker publishing — verify UFW Docker rules and cloud firewall separately.
- **Recommendation:** Restrict SSH to ops IP allowlist.

---

## Fail2Ban

```
systemctl: active
```

Service running — jail configuration not fully audited in read-only pass.

---

## SSH configuration

| Setting | Value | GA assessment |
|---------|-------|---------------|
| `PermitRootLogin` | **yes** | **FAIL** — prefer `prohibit-password` or disable |
| `PasswordAuthentication` | **yes** | **FAIL** — prefer key-only |
| `PubkeyAuthentication` | yes | PASS |

**Risk:** Brute-force surface on port 22 despite Fail2Ban.

---

## Cron / agent security

Hourly cron invokes `/api/agents/scheduled/run` with bearer token in crontab — **rotate token and move to env file** (ops recommendation, not fixed here).

---

## Sprint-1 feature flags (production)

All Sprint-1 enforcement flags **OFF** — consistent with pilot/RC posture.

---

## Commercial GA security gate

| Criterion | Result |
|-----------|--------|
| Transport + app headers | **PASS** |
| Host SSH hardening | **FAIL** |
| All commercial secrets | **FAIL** |

---

## Related

- `docs/ga/PRODUCTION_SECRET_VERIFICATION.md`
- `docs/operations/POST_DEPLOY_SECURITY_AUDIT.md`
