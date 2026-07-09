# Risk Register — AsoftechInsightz Business Suite V2

> **Reference register only.** Canonical constraints and phase gates: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §2, §12

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Review Cycle:** Update at each phase gate

---

## 1. Risk Summary

| ID | Risk | Likelihood | Impact | Severity | Owner Phase |
|----|------|------------|--------|----------|-------------|
| R-01 | Accidental backend/API modification | Medium | Critical | **Critical** | All |
| R-02 | Broken `/payments` nav link | High | Medium | **High** | Phase 3 |
| R-03 | `/api/products` path conflict | Medium | High | **High** | Phase 7 / Backend awareness |
| R-04 | No frontend route protection | High | High | **High** | Phase 3 |
| R-05 | Inconsistent suite navigation | High | Medium | **High** | Phase 3 |
| R-06 | Monolithic page refactor breaks features | Medium | High | **High** | Phase 6–7 |
| R-07 | Brand migration breaks existing pages | Medium | Medium | **Medium** | Phase 2 |
| R-08 | Dual payment API confusion | Medium | Medium | **Medium** | Phase 8 |
| R-09 | Demo tenant data leakage | Medium | High | **High** | Phase 3 |
| R-10 | Repository `.bak` file clutter | High | Low | **Low** | Phase 10 |
| R-11 | React Query migration breaks data flow | Medium | Medium | **Medium** | Phase 5–9 |
| R-12 | Mobile `/api/products` blocked by JWT handler | Medium | High | **High** | Phase 7 / Mobile |
| R-13 | CSP / X-Frame-Options security headers | Low | High | **Medium** | Phase 10 |
| R-14 | No TypeScript — runtime type errors | High | Medium | **Medium** | Phase 9 |
| R-15 | VPS subdomain redirects not configured | Medium | Medium | **Medium** | Phase 10 |
| R-16 | RetailEdge360 "Coming Soon" vs live page | Medium | Low | **Low** | Phase 7 |
| R-17 | Emergent Auth dead code confusion | Low | Low | **Low** | Docs only |
| R-18 | Performance regression from design system | Medium | Medium | **Medium** | Phase 2–5 |
| R-19 | Accessibility non-compliance | High | Medium | **Medium** | Phase 10 |
| R-20 | Scope creep into backend changes | Medium | Critical | **Critical** | All |

---

## 2. Detailed Risk Entries

### R-01: Accidental Backend/API Modification

| Field | Detail |
|-------|--------|
| **Description** | Frontend modernization could inadvertently modify API routes, Mongo models, auth, billing, or tenant logic |
| **Likelihood** | Medium |
| **Impact** | Critical — production data and payment flows at risk |
| **Mitigation** | Strict phase gates; code review checklist; only modify `components/`, `app/*/page.js`, `app/globals.css`, `tailwind.config.js`; never touch `lib/`, `models/`, `app/api/` |
| **Residual Risk** | Low with discipline |

### R-02: Broken `/payments` Navigation Link

| Field | Detail |
|-------|--------|
| **Description** | `DashboardHeader.tsx` links to `/payments` but no page exists — users get 404 |
| **Likelihood** | High (already occurring) |
| **Impact** | Medium — trust erosion, blocked billing workflow |
| **Mitigation** | Phase 3: either create placeholder route or remove link until Phase 8 |
| **Residual Risk** | None after Phase 8 |

### R-03: `/api/products` Path Conflict

| Field | Detail |
|-------|--------|
| **Description** | Mobile JWT handler returns user's product suite list; RetailEdge handler returns inventory — same path `/api/products` |
| **Likelihood** | Medium |
| **Impact** | High — RetailEdge360 frontend may get wrong data without Bearer token; mobile apps may get inventory instead of product list |
| **Mitigation** | Frontend V2: always send JWT on retail calls; document for mobile teams; **do not change API** per constraints |
| **Residual Risk** | Medium until backend path separation (out of scope) |

### R-04: No Frontend Route Protection

| Field | Detail |
|-------|--------|
| **Description** | No `middleware.js`; suite pages accessible without authentication; API falls back to demo tenant |
| **Likelihood** | High |
| **Impact** | High — unauthorized access to demo data, confusion between demo and real data |
| **Mitigation** | Phase 3: client-side auth guard in AppShell; redirect to `/signin` if no token; consider Next.js middleware (frontend-only, no auth logic changes) |
| **Residual Risk** | Medium — true security requires API-side enforcement (already exists for JWT routes) |

### R-05: Inconsistent Suite Navigation

| Field | Detail |
|-------|--------|
| **Description** | Only `/leadedge360` and `/retailedge360` use DashboardHeader; `/proposals`, `/invoices`, `/revenue` use marketing navbar |
| **Likelihood** | High (current state) |
| **Impact** | Medium — disorienting UX, unprofessional appearance |
| **Mitigation** | Phase 3: unified AppShell layout for all suite routes |
| **Residual Risk** | None after Phase 3 |

### R-06: Monolithic Page Refactor Breaks Features

| Field | Detail |
|-------|--------|
| **Description** | Extracting `leadedge360/page.js` (~429 lines) and `retailedge360/page.js` into components risks breaking API calls, filters, dialogs |
| **Likelihood** | Medium |
| **Impact** | High — core product functionality regression |
| **Mitigation** | Extract incrementally; preserve exact API call patterns; manual QA checklist per feature; no API contract changes |
| **Residual Risk** | Low with testing |

### R-07: Brand Migration Breaks Existing Pages

| Field | Detail |
|-------|--------|
| **Description** | Changing CSS variables and Tailwind tokens in Phase 2 may cause visual regressions across 25 pages |
| **Likelihood** | Medium |
| **Impact** | Medium — inconsistent appearance during transition |
| **Mitigation** | Phase 2: update tokens first; create component standards doc; migrate pages per phase, not all at once |
| **Residual Risk** | Low |

### R-08: Dual Payment API Confusion

| Field | Detail |
|-------|--------|
| **Description** | Subscribe page uses `/api/billing/checkout` + `/api/billing/verify`; dedicated `/api/payments/*` routes also exist |
| **Likelihood** | Medium |
| **Impact** | Medium — developers may wire wrong endpoints in Billing Center V2 |
| **Mitigation** | Phase 8: document which endpoints subscribe page uses; replicate same pattern in Billing Center; do not change either API |
| **Residual Risk** | Low |

### R-09: Demo Tenant Data Leakage

| Field | Detail |
|-------|--------|
| **Description** | `lib/tenant.js` falls back to `DEMO_ORG_ID = 'demo-org'` for unauthenticated API calls |
| **Likelihood** | Medium |
| **Impact** | High — users may see demo data thinking it's their data |
| **Mitigation** | Phase 3: AppShell auth guard; Phase 5+: never render dashboards without valid JWT; show explicit "demo mode" banner if demo tenant detected |
| **Residual Risk** | Medium (backend behavior unchanged) |

### R-10: Repository `.bak` File Clutter

| Field | Detail |
|-------|--------|
| **Description** | Numerous `.bak` snapshot files throughout repo create confusion about canonical source |
| **Likelihood** | High |
| **Impact** | Low — developer confusion, accidental edits |
| **Mitigation** | Phase 10: cleanup with approval; add to `.gitignore` |
| **Residual Risk** | None after cleanup |

### R-11: React Query Migration Breaks Data Flow

| Field | Detail |
|-------|--------|
| **Description** | Mounting `providers.js` and migrating from raw `fetch` to React Query may change caching/refetch behavior |
| **Likelihood** | Medium |
| **Impact** | Medium — stale data or missing refetches |
| **Mitigation** | Migrate one page at a time; keep same API URLs; test mutation → invalidation patterns |
| **Residual Risk** | Low |

### R-12: Mobile API `/api/products` Blocked

| Field | Detail |
|-------|--------|
| **Description** | Mobile JWT handler intercepts `/api/products` before retail handler |
| **Likelihood** | Medium |
| **Impact** | High — RetailEdge360 web and mobile retail features may fail |
| **Mitigation** | Ensure Bearer token on all retail API calls; document conflict in API inventory; mobile apps use different endpoint if needed |
| **Residual Risk** | Medium |

### R-13: Permissive Security Headers

| Field | Detail |
|-------|--------|
| **Description** | `next.config.js` sets `X-Frame-Options: ALLOWALL` and `CSP: frame-ancestors *` |
| **Likelihood** | Low (exploit requires specific conditions) |
| **Impact** | High — clickjacking vulnerability |
| **Mitigation** | Phase 10 security audit; tighten headers for production (frontend config change only) |
| **Residual Risk** | Medium until hardened |

### R-14: No TypeScript — Runtime Type Errors

| Field | Detail |
|-------|--------|
| **Description** | Codebase is primarily JavaScript; API responses untyped; refactoring risks silent bugs |
| **Likelihood** | High |
| **Impact** | Medium — runtime errors in production |
| **Mitigation** | Phase 9: add `src/types/`; migrate new components to `.tsx`; gradual adoption |
| **Residual Risk** | Medium during transition |

### R-15: VPS Subdomain Redirects Not Configured

| Field | Detail |
|-------|--------|
| **Description** | `leadedge360.asoftechinsightz.com` → `app.asoftechinsightz.com/leadedge360` not in Next.js config |
| **Likelihood** | Medium |
| **Impact** | Medium — product URLs don't work as specified in master directive |
| **Mitigation** | Phase 10 deployment plan; configure nginx redirects per `docs/nginx.conf` |
| **Residual Risk** | None after deployment |

### R-16: RetailEdge360 "Coming Soon" Label

| Field | Detail |
|-------|--------|
| **Description** | Product selection page marks RetailEdge360 as "Coming Soon" but dashboard is implemented |
| **Likelihood** | Medium |
| **Impact** | Low — user confusion |
| **Mitigation** | Phase 7: update product-selection page copy |
| **Residual Risk** | None |

### R-17: Emergent Auth Dead Code

| Field | Detail |
|-------|--------|
| **Description** | `lib/auth.js` stubbed; `/api/auth/login` still references Emergent; catch-all callback routes exist |
| **Likelihood** | Low |
| **Impact** | Low — confusion for developers |
| **Mitigation** | Document in audit; do not modify backend |
| **Residual Risk** | Low |

### R-18: Performance Regression

| Field | Detail |
|-------|--------|
| **Description** | Adding design system, AppShell, charts, and React Query may increase bundle size and TTI |
| **Likelihood** | Medium |
| **Impact** | Medium — slower dashboards |
| **Mitigation** | Code split by route group; lazy load charts; Lighthouse audit in Phase 10 |
| **Residual Risk** | Low with optimization |

### R-19: Accessibility Non-Compliance

| Field | Detail |
|-------|--------|
| **Description** | No skip links, incomplete ARIA, no keyboard table navigation, contrast not verified |
| **Likelihood** | High |
| **Impact** | Medium — enterprise procurement blockers |
| **Mitigation** | Phase 10: WCAG 2.1 AA audit; fix in design system components |
| **Residual Risk** | Low after Phase 10 |

### R-20: Scope Creep into Backend Changes

| Field | Detail |
|-------|--------|
| **Description** | UI gaps (e.g., `/api/products` conflict, missing auth middleware) may tempt backend fixes |
| **Likelihood** | Medium |
| **Impact** | Critical — violates master directive constraints |
| **Mitigation** | Document workarounds in frontend; escalate backend issues separately; never modify `lib/`, `models/`, `app/api/` during V2 phases |
| **Residual Risk** | Low with governance |

---

## 3. Risk Heat Map

```
Impact →
         Low      Medium    High      Critical
Likelihood ↓
High     R-10     R-05      R-04      —
         R-16     R-14      R-02
                  R-19

Medium   R-17     R-07      R-03      R-01
                  R-08      R-06      R-20
                  R-11      R-09
                  R-15      R-12
                  R-18

Low      —        R-13      —         —
```

---

## 4. Phase-Specific Risk Focus

| Phase | Top Risks to Monitor |
|-------|---------------------|
| Phase 2 (Design System) | R-07, R-18 |
| Phase 3 (AppShell) | R-02, R-04, R-05, R-09 |
| Phase 4 (Marketing) | R-07, R-18 |
| Phase 5 (Dashboard) | R-06, R-09, R-11 |
| Phase 6 (LeadEdge360) | R-06, R-03, R-11 |
| Phase 7 (RetailEdge360) | R-03, R-12, R-16 |
| Phase 8 (Billing) | R-08, R-02 |
| Phase 9 (Mobile) | R-14, R-11, R-12 |
| Phase 10 (QA) | R-13, R-15, R-19, R-10 |

---

## 5. Constraints Compliance Checklist

Use at every phase gate:

- [ ] No MongoDB collection changes
- [ ] No database schema changes
- [ ] No backend architecture changes
- [ ] No API contract changes
- [ ] No authentication flow changes
- [ ] No Razorpay integration changes
- [ ] No lead scoring logic changes
- [ ] No billing logic changes
- [ ] No mock data introduced
- [ ] Real APIs only
- [ ] Screenshots generated
- [ ] Commit created
- [ ] Stopped for approval

---

## 6. Escalation Path

| Severity | Action |
|----------|--------|
| Critical | Stop work; escalate to stakeholder before proceeding |
| High | Document workaround; implement frontend-only mitigation; flag for post-V2 backend review |
| Medium | Track in phase notes; resolve within phase if frontend-only |
| Low | Backlog for Phase 10 or cleanup |

---

## 7. Review Schedule

| When | Action |
|------|--------|
| Phase gate (each phase) | Review open risks; update status |
| Phase 5 complete | Re-assess R-04, R-09 (auth/demo) |
| Phase 9 complete | Re-assess R-14, R-12 (mobile/types) |
| Phase 10 complete | Close all mitigated risks; final report |
