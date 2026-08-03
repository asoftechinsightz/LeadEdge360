# Critical Vulnerabilities

**Audit date:** 3 August 2026  
**Action:** Block production VPS deploy until resolved or explicitly waived by PO with compensating controls.

---

## C-01 — Default JWT signing secret

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Files** | `lib/jwt.js` |
| **Evidence** | `const SECRET = process.env.JWT_SECRET \|\| 'dev-secret-change-me'` (line 10) |
| **Risk** | Attacker forges Bearer tokens for any `userId`/`tenantId`/`role` → full mobile API access, cross-tenant data access if combined with valid user IDs. |
| **Recommendation** | Set `JWT_SECRET` to ≥32 bytes cryptographically random on VPS **before** deploy. Fail application start if unset in production (future code change). Verify secret not in git. |

---

## C-02 — n8n webhook token bypass (lead ingest)

| Field | Detail |
|-------|--------|
| **Severity** | Critical |
| **Files** | `app/api/[[...path]]/route.js` (`ingestWebhookAllowed`, lines 120–124) |
| **Evidence** | `if (!token \|\| token === 'change-me-to-a-long-random-string') return true` |
| **Risk** | Unauthenticated `POST /api/webhooks/whatsapp|facebook|google` creates leads when token missing or matches `.env.example` default. Spam, quota exhaustion, fraudulent leads. |
| **Recommendation** | Set strong `N8N_WEBHOOK_TOKEN` in production `.env`. **Reject** requests when token unset in production (code change recommended in fix plan). Rotate token if example value was ever deployed. |

---

## C-03 — npm dependency critical CVEs

| Field | Detail |
|-------|--------|
| **Severity** | Critical (supply chain) |
| **Files** | `package.json`, `package-lock.json` / `yarn.lock` |
| **Evidence** | `npm audit`: **8 vulnerabilities (2 critical, 3 high, 3 moderate)** — includes `axios@1.10.0` (SSRF/DoS advisories GHSA-4hjh-wcwx-xvwj, GHSA-pmwg-cvhr-8vh7, etc.) |
| **Risk** | Server-side request abuse, DoS, or auth bypass via dependency flaws in production Node process. |
| **Recommendation** | Upgrade `axios` to ≥1.15.1; run `npm audit` after upgrades; pin lockfile; CI gate on audit for high/critical. See [09_DEPENDENCY_SECURITY_REPORT.md](./09_DEPENDENCY_SECURITY_REPORT.md). |
