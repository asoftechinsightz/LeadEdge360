# Sprint 1 — Execution Readiness (E-001–E-004)

**Date:** 3 August 2026  
**Prerequisite:** Product Freeze v1.0 lift for **E-002–E-004** code work  
**E-001:** Ops/CS validation — can proceed without freeze lift (no app code)  

**Sprint 1 readiness score:** **55 / 100** — codebase ready to extend; **E-001 blockers** prevent confident GA execution.

---

## Epic readiness summary

| Epic | Ready to start? | Blocker |
|------|-----------------|---------|
| **E-001** | ✅ Yes (ops/CS) | SSH / Tenant credentials |
| **E-002** | 🟡 Planned | Freeze lift + E-001 recommended |
| **E-003** | 🟡 Planned | Freeze lift; E-002 recommended for PATCH |
| **E-004** | 🟡 Planned | Freeze lift |

---

## E-001 — Production Validation Closure

| Field | Content |
|-------|---------|
| **Tag** | Enhancement (operations) |
| **Current implementation** | Health/metrics HTTP APIs; handover checklists; no eng code required |
| **Dependencies** | `VPS_SSH_KEY` / `asoftech_ci`; Tenant #1 credentials; `PUBLIC_URL` |
| **Risks** | SSH timeout/denied (documented 2 Aug 2026); smoke test env mismatch |
| **Files involved** | `docs/operations/runtime-handover/*`, `deploy.yml`, `docker-compose.yml` — **update docs only** |
| **Reusable modules** | `GET /api`, `/api/health` (if separate), `/api/metrics` |
| **Acceptance criteria** | `02_INFRASTRUCTURE_CHECKLIST` complete; `03_AUTHENTICATED_VALIDATION` PASS; Git SHA in matrix; n8n state documented |
| **Definition of Done** | OPS-01, OPS-02, OPS-03, CS-01 closed in action register |

### E-001 checklist

- [ ] SSH to production with authorized key  
- [ ] `docker exec` AEO paths in container (OPS-02)  
- [ ] Record image tag / Git SHA in `04_RUNTIME_RECONCILIATION_MATRIX.md`  
- [ ] Run WS3 authenticated validation with Tenant #1  
- [ ] Import/verify 7 n8n workflows (OPS-08)  
- [ ] Probe Razorpay/SMTP/LLM on `/api/health`  
- [ ] Populate `TENANT1_SUCCESS_DASHBOARD.md` (CS-02 after CS-01)  

---

## E-002 — Cookie ↔ JWT Bridge

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Current implementation** | `mobileRoute()` in `lib/mobile-routes.js` invoked from `route.js` L210 — **JWT Bearer only** inside handlers |
| **Dependencies** | PO freeze lift; `resolveTenant()` from `lib/tenant.js`; regression tests for mobile JWT |
| **Risks** | **TD-H01** — wrong org mapping = data leak; breaking mobile auth; dual code paths if copy-paste instead of extract |
| **Files involved** | `app/api/[[...path]]/route.js`, `lib/mobile-routes.js`, `lib/tenant.js`, `lib/jwt.js` |
| **Reusable modules** | All `handleFollowups`, `handleWhatsapp`, `handleAdmin`, `handleUsers`, `handleDashboard`, `handleNotifications` |
| **Acceptance criteria** | Web cookie session performs follow-up CRUD, admin user list, WA thread — same `orgId` as JWT; cross-tenant 403 |
| **Test cases** | WS3 follow-ups/admin/WA steps; mobile JWT regression suite; `backend_test.py` subset if wired |
| **Rollout** | `WEB_JWT_BRIDGE=true` env flag |
| **Documentation** | `MOBILE_API_GUIDE.md`, `auth-flow.md` |

### Implementation sequence (post-freeze)

1. Extract shared handler functions from `mobile-routes.js` accepting `{ db, orgId, userId, role }`.  
2. Implement `resolveWebActor(request)` parallel to JWT verify.  
3. Route cookie requests to shared handlers before/after `mobileRoute` null return.  
4. Feature flag + security tests.  
5. Enable E-006, E-007, E-008 UI epics.

### Files touched (planned)

| File | Change type |
|------|-------------|
| `lib/mobile-routes.js` | Extract handlers |
| `lib/tenant.js` | Optional web actor helper |
| `app/api/[[...path]]/route.js` | Cookie dispatch paths |
| `docs/mobile/MOBILE_API_GUIDE.md` | Bridge section |

---

## E-003 — Server AEO Profile

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Current implementation** | Client-only `sessionStorage` in `lib/aeo/profile.js`; `AeoGrowthEngine.jsx` loads/saves locally; compute on client |
| **Dependencies** | E-002 recommended for `PATCH /api/users/me` or extended `auth/me`; PO freeze lift |
| **Risks** | **TD-H02** — KPI drift if sessionStorage overrides server; migration for existing browser data |
| **Files involved** | `lib/aeo/profile.js`, `components/aeo/AeoGrowthEngine.jsx`, `lib/tenant.js`, `route.js` (`auth/me`), `users` collection |
| **Reusable modules** | `compute.js`, `business-profile-fields.json`, `readiness-checklist.json`, n8n AEO workflows |
| **Acceptance criteria** | Profile persists across browsers; `auth/me` returns `preferences.aeoProfile`; completeness % matches server; `npm run test:aeo` extended |
| **Test cases** | `scripts/test-aeo-compute.mjs`; WS3 AEO profile steps; manual cross-browser |
| **Rollout** | Server-first load; optional sessionStorage fallback flag for rollback |
| **Documentation** | `docs/aeo/`, onboarding kit CS-06 close |

### Schema change (planned — PO approval)

| Collection | Field | Type |
|------------|-------|------|
| `users` | `preferences.aeoProfile` | object |
| `users` | `preferences.aeoChecklistState` | object (optional) |

**Note:** Mongo flexible schema — no migration script; document shape in epic PR.

### Files touched (planned)

| File | Change type |
|------|-------------|
| `app/api/[[...path]]/route.js` or bridged users | GET/PATCH preferences |
| `components/aeo/AeoGrowthEngine.jsx` | Load/save API |
| `lib/aeo/profile.js` | Server hydrate helpers |
| `scripts/test-aeo-compute.mjs` | Server profile cases |
| `n8n/aeo-*.json` | Ops note: server field |

---

## E-004 — Plan Limit Enforcement

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Current implementation** | `lib/billing/plan-entitlements.js` defines `leadsPerMonth`, `maxUsers`; `activate-payment.js` sets org flags; **no enforcement on create** |
| **Dependencies** | PO freeze lift; billing status accurate on `orgs` |
| **Risks** | **TD-H03** — existing tenants over limit blocked; CS communication required |
| **Files involved** | `lib/billing/plan-entitlements.js`, `app/api/[[...path]]/route.js` (POST leads, products, admin user create), UI create dialogs |
| **Reusable modules** | `getEntitlementsForPlan`, `getOrgBillingContext`, `orgs` plan field |
| **Acceptance criteria** | Starter blocked at 500 leads/month; user create blocked at maxUsers; retail POST blocked when `retailEnabled: false`; clear 402/403 + upgrade message |
| **Test cases** | `npm run test:billing`; simulate at-cap POST; manual Growth vs Starter |
| **Rollout** | `ENFORCE_PLAN_LIMITS=true`; optional grandfather for Tenant #1 via env |
| **Documentation** | Pricing page, commercial toolkit |

### Implementation sequence (planned)

1. Add `checkEntitlement(db, orgId, action)` using org plan + counts.  
2. Wire `POST /api/leads`.  
3. Wire admin user create (mobile handler — after E-002 or parallel JWT path).  
4. Wire `POST /api/products`.  
5. UI error surfaces on dialogs.

### Files touched (planned)

| File | Change type |
|------|-------------|
| `lib/billing/plan-entitlements.js` | `checkEntitlement()` export |
| `app/api/[[...path]]/route.js` | Guard POST paths |
| `lib/mobile-routes.js` | Admin user create guard |
| `app/(application)/leadedge360/page.js` | Error UX |
| `scripts/simulate-billing-flow.mjs` | Limit cases |

---

## Cross-epic dependency graph

```
E-001 (ops validation)
    ├── CS-01 WS3 ──► unblocks Tenant metrics
    ├── OPS parity ──► confident deploy for E-002–004
    └── n8n/keys ──► full module validation

PO freeze lift
    ├── E-004 (can parallel E-002)
    ├── E-002 ──► enables web admin user limit check cleanly
    └── E-003 (PATCH path via E-002 recommended)
```

**Recommended Sprint 1 engineering order after freeze lift:** E-004 → E-002 → E-003 (E-004 smallest blast radius).

---

## Sprint 1 story mapping

| Story ID | Epic | Ready |
|----------|------|-------|
| E-001-S1–S5 | E-001 | ✅ |
| E-002-S1–S5 | E-002 | After freeze |
| E-003-S1–S5 | E-003 | After freeze |
| E-004-S1–S4 | E-004 | After freeze |

See `LEADEDGE360_ENGINEERING_EXECUTION_PROGRAM.md` §4.

---

## Out of scope for Sprint 1

E-005–E-017, shadcn cleanup, partner portal, agents, campaigns, mobile app, SEO module.

---

## Sprint 1 exit criteria

| Criterion | Owner |
|-----------|-------|
| E-001 complete | Ops + CS |
| E-002–E-004 merged to staging | Eng |
| WS3 PASS on web follow-ups path (if E-002 shipped) | CS |
| `test:aeo` + `test:billing` green | Eng |
| PO accepts R1.1 release | PO |
| No open P1 for shipped scope | TPM |

**STOP** — Execution readiness documented. No implementation.
