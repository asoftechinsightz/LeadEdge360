# High Risk Findings

---

## H-01 — Permissive CORS (`*`)

| | |
|--|--|
| **Severity** | High |
| **Files** | `next.config.js` (lines 44–46), `app/api/[[...path]]/route.js` OPTIONS (lines 725–728) |
| **Evidence** | `Access-Control-Allow-Origin: *`, `Allow-Headers: *` |
| **Risk** | Any origin can call API from browser; increases CSRF/credential theft impact if cookies used cross-site. |
| **Recommendation** | Set `CORS_ORIGINS` to explicit production origin(s); remove wildcard in production. |

---

## H-02 — Clickjacking / weak frame policy

| | |
|--|--|
| **Severity** | High |
| **Files** | `next.config.js` (lines 42–43) |
| **Evidence** | `X-Frame-Options: ALLOWALL`, `Content-Security-Policy: frame-ancestors *;` |
| **Risk** | App embeddable in malicious frames; UI redress / clickjacking on authenticated sessions. |
| **Recommendation** | Use `SAMEORIGIN` or `DENY` and restrict `frame-ancestors` to self. Align with `docs/nginx.conf` (SAMEORIGIN). |

---

## H-03 — Webhook lead ingest: arbitrary `orgId`

| | |
|--|--|
| **Severity** | High |
| **Files** | `app/api/[[...path]]/route.js` (lines 664–668) |
| **Evidence** | `const targetOrgId = body.orgId \|\| DEMO_ORG_ID` — caller supplies org |
| **Risk** | With valid webhook token, attacker injects leads into **any** tenant org; pollutes CRM, triggers AI scoring cost, bypasses per-tenant onboarding. |
| **Recommendation** | Map webhook channel → fixed orgId server-side; or validate orgId against allowlist; never trust body alone. |

---

## H-04 — Lead assignment IDOR (`userId` without org check)

| | |
|--|--|
| **Severity** | High |
| **Files** | `app/api/[[...path]]/route.js` (lines 369–371) |
| **Evidence** | `db.collection('users').findOne({ id: body.userId })` — no `orgId` filter |
| **Risk** | Authenticated tenant user may resolve display name from another org's user id (info leak); assignment metadata confusion. |
| **Recommendation** | `findOne({ id: body.userId, orgId })` before assign. |

---

## H-05 — `BILLING_TEST_MODE` payment simulation endpoint

| | |
|--|--|
| **Severity** | High (if misconfigured in prod) |
| **Files** | `app/api/[[...path]]/route.js` (lines 591–632), `.env.example` |
| **Evidence** | `POST /api/billing/simulate` active when `BILLING_TEST_MODE=true` |
| **Risk** | Free subscription activation without Razorpay payment. |
| **Recommendation** | Ensure `BILLING_TEST_MODE=false` on VPS; add deploy checklist assertion; block route when `NODE_ENV=production` (code change). |

---

## H-06 — n8n default admin password in compose

| | |
|--|--|
| **Severity** | High |
| **Files** | `docker-compose.yml` (lines 42–44) |
| **Evidence** | `N8N_BASIC_AUTH_PASSWORD=changeme` |
| **Risk** | Workflow takeover, webhook abuse, credential theft if port 5678 exposed. |
| **Recommendation** | Strong password before deploy; do not publish 5678 publicly without auth gateway. |

---

## H-07 — Unauthenticated demo tenant data access

| | |
|--|--|
| **Severity** | High (shared demo context) |
| **Files** | `lib/tenant.js` (lines 67–68), `app/api/[[...path]]/route.js` |
| **Evidence** | No session → `orgId: DEMO_ORG_ID`, `isDemo: true`; leads/kpis readable/writable under demo org |
| **Risk** | Shared demo workspace: any visitor can read/modify demo leads/products; data pollution; misleading KPIs for evaluators. |
| **Recommendation** | Disable demo seed on production or require auth for all CRM mutations; separate demo deployment. |

---

## H-08 — Axios SSRF / DoS (dependency)

| | |
|--|--|
| **Severity** | High |
| **Files** | `package.json` (`axios@1.10.0`) |
| **Evidence** | npm audit GHSA-4hjh-wcwx-xvwj, GHSA-pmwg-cvhr-8vh7 |
| **Risk** | SSRF via proxy bypass; DoS via large payloads if axios used against user-controlled URLs. |
| **Recommendation** | Upgrade axios; audit outbound URL allowlists in app code. |
