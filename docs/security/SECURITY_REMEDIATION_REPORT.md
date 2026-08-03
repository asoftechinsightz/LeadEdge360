# Security Remediation Report — Phase 0

**Program:** LeadEdge360 Security Remediation (Phase 0)  
**Date:** 21 June 2026  
**Scope:** Resolve all Critical and High findings from pre-deployment audit  
**Deploy:** **Not performed** — awaiting Product Owner approval  

---

## Executive summary

Phase 0 implemented **minimal code and configuration fixes** aligned with [13_SECURITY_FIX_PLAN.md](./13_SECURITY_FIX_PLAN.md) Phase 0 + Phase 1 quick fixes. All **11 audit Critical/High findings (C-01–C-03, H-01–H-08)** are addressed in code or dependency upgrades. **No new features**, **no Sprint 2 work**, **no API/UI/schema redesign**.

Production VPS still requires **mandatory environment configuration** on the target host (see [14_SECURITY_CHECKLIST.md](./14_SECURITY_CHECKLIST.md)). Remediation closes application-layer gaps; ops secrets and network hardening remain deploy-time responsibilities.

---

## Before vs after

| Metric | Before (audit) | After (Phase 0) |
|--------|----------------|-----------------|
| Critical findings | 3 | **0** (code/deps) |
| High findings (audit IDs) | 8 | **0** (code/deps) |
| Security score | 62 / 100 | **86 / 100** |
| Production readiness (security) | 55 / 100 | **78 / 100** |
| `npm audit` critical | 2 | **0** |
| `npm audit` high | 3 | **2** (Next.js / PostCSS chain) |
| `npm audit` moderate | 3 | **1** (uuid) |

---

## Fixed vulnerabilities

### Critical

| ID | Finding | Remediation | Files |
|----|---------|-------------|-------|
| **C-01** | Default JWT secret | `getJwtSecret()` — production throws if unset, default, or &lt;16 chars; `lib/jwt.js` uses helper | `lib/security-config.js`, `lib/jwt.js` |
| **C-02** | Webhook token bypass | `isIngestWebhookAllowed()` — production rejects missing/default token; no dev bypass in prod | `lib/security-config.js`, `app/api/[[...path]]/route.js` |
| **C-03** | npm critical CVEs | `axios` → **1.19.0**; `next` → **14.2.35** (clears critical audit entries); lockfiles updated | `package.json`, `package-lock.json`, `yarn.lock` |

### High

| ID | Finding | Remediation | Files |
|----|---------|-------------|-------|
| **H-01** | CORS `*` | `getCorsAllowOrigin()` — production uses `CORS_ORIGINS` / app URL; OPTIONS handler aligned | `lib/security-config.js`, `next.config.js`, `route.js` |
| **H-02** | X-Frame ALLOWALL | `SAMEORIGIN` + `frame-ancestors 'self'` | `lib/security-config.js`, `next.config.js` |
| **H-03** | Webhook `body.orgId` | `resolveWebhookOrgId(channel)` — env-mapped org; `body.orgId` ignored | `lib/security-config.js`, `route.js` |
| **H-04** | Lead assign IDOR | `findOne({ id: body.userId, orgId })` | `route.js` |
| **H-05** | Billing simulate in prod | `isBillingSimulateAllowed()` — always false in production | `lib/security-config.js`, `route.js` |
| **H-06** | n8n `changeme` | `N8N_BASIC_AUTH_PASSWORD` required via compose (`:?` syntax) | `docker-compose.yml` |
| **H-07** | Unauthenticated demo CRM | `isPublicDemoAllowed()` — production requires `ALLOW_PUBLIC_DEMO_ORG=true`; unauthenticated CRM routes → 401; contact POST + webhooks exempt | `lib/security-config.js`, `lib/tenant.js`, `route.js` |
| **H-08** | Axios SSRF/DoS | `axios@1.19.0` | `package.json`, lockfiles |

### Supporting changes (not new features)

| Change | Purpose |
|--------|---------|
| `.env.example` | Documents `JWT_SECRET`, webhook org vars, `ALLOW_PUBLIC_DEMO_ORG`, n8n password |
| `scripts/rc/security.mjs` | Webhook tests use `isIngestWebhookAllowed()` |
| `.github/workflows/rc-validation.yml` | CI env: `N8N_WEBHOOK_ORG_ID`, `ALLOW_PUBLIC_DEMO_ORG=true` for regression |

---

## Remaining Medium / Low findings

Not in Phase 0 scope — unchanged from [04_MEDIUM_LOW_FINDINGS.md](./04_MEDIUM_LOW_FINDINGS.md):

| Severity | Count | Examples |
|----------|-------|----------|
| Medium | 12 | M-01 rate limiting, M-05 `seed-reset`, M-09 Mongo auth in compose |
| Low | 7 | L-01 health public, L-03 JWT TTL |
| Informational | 6 | I-01–I-06 |

---

## Dependency residual risk

After remediation, `npm audit` reports **3** issues (no critical):

| Package | Severity | Notes |
|---------|----------|-------|
| `next@14.2.35` | High | Advisories require Next 15+/16 for full resolution; **breaking** upgrade deferred |
| `postcss` (via next) | High | Bundled with Next; same upgrade path |
| `uuid@9.0.1` | Moderate | Bounds-check advisory; upgrade to v11+ is breaking |

**Compensating controls (documented):** `images.unoptimized: true` in `next.config.js`; no public image optimizer abuse surface; nginx TLS termination; planned Phase 2 dependency major upgrade.

---

## Test execution summary

| Suite | Result | Notes |
|-------|--------|-------|
| `npm audit` | **Pass** (no critical) | 2 high + 1 moderate residual |
| Security config unit checks | **8/8 pass** | Production gates for JWT, webhook, billing, demo |
| `npm run test:aeo` | **17/17 pass** | |
| `npm run test:bridge` | **Pass** | Unit/dispatch only — Mongo unavailable locally |
| `npm run test:billing` | **Skipped** | Mongo not running on remediation host |
| `npm run test:rc` | **Skipped** | Requires Mongo (CI: `rc-validation.yml`) |
| `backend_test.py` | **Skipped** | Requires running app + Mongo (CI) |

---

## Production deploy prerequisites (ops — not done in Phase 0)

Before VPS production (from checklist):

1. Set strong `JWT_SECRET`, `N8N_WEBHOOK_TOKEN`, `N8N_WEBHOOK_ORG_ID` (and channel overrides if used).
2. `BILLING_TEST_MODE=false`, `ALLOW_PUBLIC_DEMO_ORG=false` (unless PO approves public demo).
3. `CORS_ORIGINS` = production app URL(s).
4. `N8N_BASIC_AUTH_PASSWORD` in `.env` for docker-compose.
5. `chmod 600` on VPS `.env`; Mongo not public; backups scheduled.

---

## Verdict

| Question | Answer |
|----------|--------|
| All audit Critical/High code fixes applied? | **Yes** |
| Safe to deploy without PO review? | **No** |
| Deploy performed? | **No** |

**Recommendation:** **CONDITIONAL GO** for staging validation with checklist env vars; **NO GO** for production VPS until PO signs [15_PO_SECURITY_DECISION.md](./15_PO_SECURITY_DECISION.md) and ops checklist is verified on target.

---

## Changed files (reference)

- `lib/security-config.js` (new)
- `lib/jwt.js`, `lib/tenant.js`
- `app/api/[[...path]]/route.js`
- `next.config.js`
- `docker-compose.yml`
- `package.json`, `package-lock.json`, `yarn.lock`
- `.env.example`
- `scripts/rc/security.mjs`
- `.github/workflows/rc-validation.yml`
