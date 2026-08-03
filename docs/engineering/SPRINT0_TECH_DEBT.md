# Sprint 0 — Technical Debt Register

**Date:** 3 August 2026  
**Source:** `docs/TECHNICAL_DEBT_REPORT.md` + Sprint 0 validation  
**Action:** Document only — **DO NOT FIX** in Sprint 0  

---

## High priority

| ID | Debt | Evidence | Sprint 1 impact |
|----|------|----------|-----------------|
| TD-H01 | Cookie vs JWT split blocks web follow-ups/admin/WA | `mobile-routes.js` JWT-only | **E-002** |
| TD-H02 | AEO profile `sessionStorage` only | `lib/aeo/profile.js` | **E-003** |
| TD-H03 | Plan limits defined but not enforced | `plan-entitlements.js` unused on POST | **E-004** |
| TD-H04 | Missing `public/` + download 404s | No `public/`; `download/page.js` | CS messaging; not Sprint 1 core |
| TD-H05 | `mongo.js` connects at module load — build fails without `MONGO_URL` | Build validation | CI ok; local dev friction |
| TD-H06 | 36 unused shadcn components (bundle/repo bloat) | 48 ui files, 13 used | Defer cleanup — don't block Sprint 1 |
| TD-H07 | JWT `dev-secret-change-me` default if `JWT_SECRET` unset | `lib/jwt.js` L10 | Ops must set before mobile/bridge prod |
| TD-H08 | Production validation incomplete | `EXECUTIVE_ACTION_REGISTER` OPS-01–03 | **E-001** gate |
| TD-H09 | OpenAPI documents unimplemented POST routes | openapi vs `route.js` | E-002/E-007 align spec or remove |
| TD-H10 | Hardcoded `AGENTS` array vs real users | `route.js` L22–30 | E-007 |

---

## Medium priority

| ID | Debt | Evidence |
|----|------|----------|
| TD-M01 | Duplicate KPI: `KpiCard` vs inline `Kpi` | `leadedge360` vs `retailedge360` |
| TD-M02 | Duplicate constants: STATUSES, SOURCES, TERRITORIES | UI vs `route.js` |
| TD-M03 | Plan prices duplicated: `razorpay.js` vs `pricing/page.js` | Manual sync risk |
| TD-M04 | 11 unused direct npm dependencies | axios, swr, zod, etc. |
| TD-M05 | TanStack Query provider not mounted | `app/providers.js` orphaned |
| TD-M06 | Dual toast systems (sonner vs shadcn toast) | Dead toast stack |
| TD-M07 | `subscriptions` collection weak write/read parity | TECH_DEBT §4.3 |
| TD-M08 | `notifications` no insert path in codebase | Mobile read-only surface |
| TD-M09 | Broken Tailwind dynamic classes `bg-${accent}` | leadedge360, retailedge360 |
| TD-M10 | Permissive CSP / X-Frame-Options | `next.config.js` headers |
| TD-M11 | `next-themes` without ThemeProvider | `sonner.jsx` |
| TD-M12 | `backend_test.py` not in CI | Orphaned test suite |
| TD-M13 | n8n production state NOT VERIFIED | OPS-08 |
| TD-M14 | `.env.example` incomplete (JWT, WA, MSG91) | Code vs template |
| TD-M15 | `EnterpriseNavigation.jsx` orphaned | Sprint 19 target unused |
| TD-M16 | Recurring billing not implemented | `BILLING_GAP_ANALYSIS` |
| TD-M17 | `/billing` live 404 reported historically | CS-05; verify in E-001 |

---

## Low priority

| ID | Debt | Evidence |
|----|------|----------|
| TD-L01 | Dead imports (Tabs, useMemo, icons) | leadedge360, Navbar, signin |
| TD-L02 | Orphaned hooks `use-toast`, `use-mobile` | hooks/ |
| TD-L03 | `testIds` registry unused | `lib/constants/testIds/` |
| TD-L04 | `POST /api/seed-reset` curl-only | No UI guard documented |
| TD-L05 | `loginUrl` fallback `/auth/setup` no page | `lib/auth.js` |
| TD-L06 | Postgres SQL docs unused at runtime | `docs/sql/` |
| TD-L07 | Duplicate nav link lists | Navbar, Footer, dropdown |
| TD-L08 | Chart tooltip style copy-paste | Both dashboard pages |
| TD-L09 | `memory/test_credentials.md` empty stub | Agent artifact |
| TD-L10 | n8n default password `changeme` in compose | docker-compose |

---

## Debt by engineering workstream

| Workstream | High | Medium | Low |
|------------|------|--------|-----|
| CRM | TD-H10 | TD-M01, M02 | TD-L01 |
| AEO | TD-H02 | — | — |
| Billing | TD-H03, H08 | TD-M16, M17 | — |
| Auth / Platform | TD-H01, H07 | TD-M14 | TD-L05 |
| Mobile | TD-H01 | TD-M08 | — |
| UI / Bundle | TD-H06 | TD-M04–M06, M11 | TD-L02–L03 |
| Ops / Deploy | TD-H05, H08 | TD-M13 | TD-L10 |
| API / Docs | TD-H09 | TD-M07 | TD-L04 |
| Security | TD-H07 | TD-M10 | — |

---

## Sprint 1 debt policy

| Rule | Detail |
|------|--------|
| Fix in Sprint 1 | Only debt directly in E-001–E-004 scope |
| Do not expand | No shadcn purge, no Postgres, no partner portal |
| Document new debt | Any bridge shortcut must be logged |

**STOP** — No fixes applied.
