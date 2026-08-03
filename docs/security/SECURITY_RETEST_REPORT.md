# Security Retest Report — Phase 0

**Date:** 21 June 2026  
**Type:** Post-remediation verification (local + static)  
**Baseline:** [01_EXECUTIVE_SECURITY_SUMMARY.md](./01_EXECUTIVE_SECURITY_SUMMARY.md) (3 Aug 2026 audit)  

---

## Retest methodology

1. Static verification of remediated code paths against [02_CRITICAL_VULNERABILITIES.md](./02_CRITICAL_VULNERABILITIES.md) and [03_HIGH_RISK_FINDINGS.md](./03_HIGH_RISK_FINDINGS.md).
2. `npm audit` on updated lockfiles.
3. Automated suites per remediation charter: AEO, bridge, billing, RC/security (where environment permits).
4. Targeted unit checks for `lib/security-config.js` production gates.

**Not executed:** Live penetration test, VPS config audit, full `backend_test.py` against production build (requires Mongo + running Next server — delegated to CI).

---

## Finding retest matrix

| ID | Retest | Result | Evidence |
|----|--------|--------|----------|
| C-01 | JWT secret enforcement | **PASS** | `getJwtSecret()` throws in production when weak/missing; `signAccessToken` uses helper |
| C-02 | Webhook bypass removed | **PASS** | Production: missing/default `N8N_WEBHOOK_TOKEN` → `isIngestWebhookAllowed` false |
| C-03 | Dependency critical CVEs | **PASS** | `npm audit`: 0 critical; axios 1.19.0, next 14.2.35 |
| H-01 | CORS restricted | **PASS** | `getCorsAllowOrigin()`; no `*` in production path |
| H-02 | Frame policy | **PASS** | `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'` |
| H-03 | Webhook org trust | **PASS** | `resolveWebhookOrgId(id)`; no `body.orgId` |
| H-04 | Lead assign org scope | **PASS** | `findOne({ id: body.userId, orgId })` |
| H-05 | Billing simulate prod block | **PASS** | `isBillingSimulateAllowed()` false when `NODE_ENV=production` |
| H-06 | n8n default password | **PASS** | `docker-compose.yml`: `${N8N_BASIC_AUTH_PASSWORD:?...}` |
| H-07 | Demo org gate | **PASS** | `unauthenticated` + 401 except webhooks/contact POST |
| H-08 | Axios CVEs | **PASS** | axios 1.19.0; not in audit high/critical set |

---

## Automated test results

### `npm audit`

```
3 vulnerabilities (1 moderate, 2 high)
- next@14.2.35 (high) — advisories; fix requires Next 16 (breaking)
- postcss via next (high)
- uuid@9.0.1 (moderate)
```

| Severity | Pre-audit | Post-remediation |
|----------|-----------|------------------|
| Critical | 2 | **0** |
| High | 3 | **2** |
| Moderate | 3 | **1** |
| **Total** | **8** | **3** |

### Security config unit suite (local)

| Check | Result |
|-------|--------|
| Prod webhook rejects missing header | PASS |
| Prod webhook accepts valid token | PASS |
| Prod rejects default example webhook token | PASS |
| Prod billing simulate blocked | PASS |
| Prod public demo blocked | PASS |
| Prod webhook org from env | PASS |
| Prod JWT secret accepted when strong | PASS |
| Dev public demo allowed | PASS |

**Total: 8 passed, 0 failed**

### `npm run test:aeo`

**17 passed, 0 failed**

### `npm run test:bridge`

**PASS** — dispatch/unit tests (8 checks). Mongo integration skipped (no local Mongo).

### `npm run test:billing`

**NOT RUN** — `MongoServerSelectionError: ECONNREFUSED 127.0.0.1:27017`

### RC security suite (`scripts/rc/security.mjs`)

**NOT RUN** — requires Mongo. Expected **PASS** in CI with existing RC-2 workflow + updated webhook helper.

### API regression (`backend_test.py`)

**NOT RUN** — requires `yarn start` + Mongo. CI step in `rc-validation.yml` with `ALLOW_PUBLIC_DEMO_ORG=true`.

---

## Attack surface retest (manual static)

| Vector | Pre | Post |
|--------|-----|------|
| Forge JWT without secret | Possible with default | **Blocked** in production startup/use |
| Webhook ingest without token | Allowed in dev/default | **401** in production |
| Cross-tenant lead via webhook orgId | Possible | **Blocked** — server-side org map |
| Cross-org user on lead assign | Possible | **Blocked** — org-scoped user lookup |
| Free billing via simulate | Possible if env mis-set | **404** in production regardless of env |
| Clickjacking via frame embed | ALLOWALL | **SAMEORIGIN** |
| Any-origin browser API calls | CORS `*` | Restricted origin in production |
| n8n UI default password | `changeme` | Compose fails without env password |

---

## Regression risk assessment

| Area | Risk | Mitigation |
|------|------|------------|
| Unauthenticated CRM in CI | Tests use demo org | `ALLOW_PUBLIC_DEMO_ORG=true` in `rc-validation.yml` |
| Public contact form in prod | Must work without login | `contact` POST exempt from 401; uses `DEMO_ORG_ID` |
| Webhook ingest | Must bypass session | `webhooks` root exempt from unauthenticated gate |
| Marketing demo CRM in prod | Intentionally disabled | Set `ALLOW_PUBLIC_DEMO_ORG=true` only if PO approves |

---

## Retest conclusion

| Criterion | Status |
|-----------|--------|
| All audit Critical/High retested | **PASS** (static + unit) |
| Critical npm audit cleared | **PASS** |
| Full Mongo-dependent suites | **PENDING CI** |
| Production VPS config | **NOT TESTED** (ops) |

**Retest verdict:** Application-layer remediation **verified**. Full regression **conditional on CI** with Mongo. Production **not retested** on live VPS.
