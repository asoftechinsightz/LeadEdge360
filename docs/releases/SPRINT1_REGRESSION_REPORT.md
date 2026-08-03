# Sprint 1 — Regression Report (RC-1)

**Date:** 3 August 2026  
**Scope:** E-002 + E-003 + E-004 integrated with existing CRM, AEO, billing, mobile APIs  

**Method:** Automated scripts (where Mongo available) + static code/trace review. No application code modified during RC-1.

---

## Phase 1 — Functional regression

| Area | Baseline expectation | RC-1 result | Evidence |
|------|---------------------|-------------|----------|
| Lead creation | POST `/api/leads` + AI score | ✅ Code path unchanged; E-004 guard before `aiScore` | `route.js` |
| Lead update | PATCH `/api/leads/:id` | ✅ No Sprint 1 changes | `route.js` |
| Lead AI score | `aiScore()` on create/rescore | ✅ Unchanged scoring module | `lib/scoring` |
| Lead pipeline | status/assign endpoints | ✅ Unchanged | `route.js` |
| Retail product create | POST `/api/products` | ✅ E-004 guard before `predictShelfLife` | `route.js` |
| Dashboard KPIs | GET `/api/kpis` | ✅ Unchanged cookie/JWT tenant resolve | `route.js` |
| CRM charts | LeadEdge360 client charts | ✅ No structural change | `leadedge360/page.js` |
| Notifications | JWT mobile handler | ✅ Shared handler via bridge when ON | `mobile-routes.js` |
| Followups | JWT + optional bridge | ✅ Shared `dispatchBridgedHandlers` | E-002 |
| WhatsApp | JWT + optional bridge | ✅ Unchanged send/store logic | `mobile-routes.js` |
| Mobile APIs (JWT) | Bearer-first dispatch | ✅ `resolveAuthDispatch` → jwt | `route.js` |
| Admin APIs | Role check in handler | ✅ Unchanged + E-004 on user create | `handleAdmin` |
| AEO dashboard | `AeoGrowthEngine` | ✅ Extended load/save; compute unchanged | `AeoGrowthEngine.jsx` |
| AEO recommendations | Rule-based | ✅ Unchanged | `recommendations.js` |
| AEO prompt execution | `invokeAeoPrompt` | ✅ Unchanged | `actions.js` |
| Profile persistence | E-003 server path | ✅ When flags ON | `profile.js` |
| Session migration | One-time merge | ✅ `mergeSessionProfileOnce` | `profile.js` |
| Plan enforcement | 402/403 when ON | ✅ `checkEntitlement` | `plan-entitlements.js` |
| Upgrade messaging | Toast on limit codes | ✅ LeadEdge + RetailEdge | UI pages |

---

## Automated test execution (RC-1 workstation)

| Command | Result | Notes |
|---------|--------|-------|
| `npm run test:aeo` | **PASS** (17/17) | Compute + E-003 merge validation |
| `npm run test:bridge` | **PASS** (8/8 dispatch) | Mongo integration skipped |
| `npm run test:billing` | **FAIL** | `ECONNREFUSED` Mongo localhost |
| `backend_test.py` | **Not run** | Requires deployed `/app/.env` + live API |
| `npm run build` | **FAIL** | Google Fonts TLS on validation workstation |

---

## Epic interaction regression

| Interaction | Risk | RC-1 assessment |
|-------------|------|-----------------|
| E-004 blocks lead before AI | Double work avoided | ✅ Guard order correct |
| E-002 bridge + E-004 admin user create | Shared handler runs entitlement | ✅ `checkEntitlement` in `handleAdmin` |
| E-003 PATCH via E-002 bridge | Cookie save needs bridge | ✅ Documented; fallback to sessionStorage |
| Cookie leads with bridge OFF | mobileRoute null for leads | ✅ No 401 regression |
| JWT mobile followups | Bearer path unchanged | ✅ |

---

## Regression verdict

| Category | Score (0–100) |
|----------|---------------|
| Code-level regression confidence | **86** |
| Automated regression execution | **62** (Mongo/build gaps) |
| **Regression RC subscore** | **74** |

**Critical regressions found:** None in static review.  
**Unverified:** Live CRM flows, mobile JWT smoke (`backend_test.py`), billing activation matrix.
