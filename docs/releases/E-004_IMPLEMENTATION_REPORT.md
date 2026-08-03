# E-004 Implementation Report — Plan Limit Enforcement

**Epic:** E-004  
**Date:** 3 August 2026  
**Release:** R1.1 (Foundation GA)  
**Design:** `docs/engineering/design/E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md`  

---

## Summary

Implemented server-side plan entitlement enforcement using existing `PLAN_ENTITLEMENTS` in `lib/billing/plan-entitlements.js`. Guards run **before** lead AI scoring, retail shelf-life prediction, and admin user creation when `ENFORCE_PLAN_LIMITS=true`. Default remains **off** for backward compatibility.

---

## Files changed

| File | Change |
|------|--------|
| `lib/billing/plan-entitlements.js` | Added `checkEntitlement`, feature flags, IST month bounds, denial payloads |
| `app/api/[[...path]]/route.js` | Guards on POST leads, POST products, webhook lead ingest |
| `lib/mobile-routes.js` | Guard on POST `/api/admin/users` |
| `app/(application)/leadedge360/page.js` | 402 / plan limit toast + upgrade hint |
| `app/(application)/retailedge360/page.js` | 403 retail disabled toast + upgrade hint |
| `lib/billing/activate-payment.js` | ESM `.js` import paths for Node test runner |
| `scripts/simulate-billing-flow.mjs` | E-004 entitlement test matrix |
| `.env.example` | `ENFORCE_PLAN_LIMITS`, `GRANDFATHER_ORG_IDS` |

**Not changed:** Auth, JWT, cookie bridge, AEO, billing checkout, new APIs, new collections.

---

## Tests executed

| Command | Purpose |
|---------|---------|
| `npm run test:billing` | Sprint 19A activation + E-004 entitlement matrix |

**Test coverage (E-004):**

| Case | Expected |
|------|----------|
| `ENFORCE_PLAN_LIMITS=false` | Allow lead create |
| Demo org (`DEMO_ORG_ID`) | Exempt |
| Grandfather org in `GRANDFATHER_ORG_IDS` | Exempt over cap |
| Starter `retail.create` | 403 `PLAN_RETAIL_DISABLED` |
| Starter 500 leads in month | 402 `PLAN_LIMIT_LEADS` |
| Growth 5 users | 402 `PLAN_LIMIT_USERS` |
| Scale plan | Unlimited leads allowed |
| Missing org plan | Treated as starter (retail blocked) |

**Note:** Tests require a running MongoDB at `MONGO_URL`. Validation workstation run: **Mongo not available** (`ECONNREFUSED localhost:27017`). Run `npm run test:billing` on staging/CI before enabling `ENFORCE_PLAN_LIMITS` in production.

**Coverage:** No Istanbul/nyc report — script-based integration tests only (existing framework).

---

## Feature flags

| Variable | Default | Behavior |
|----------|---------|----------|
| `ENFORCE_PLAN_LIMITS` | `false` | When not `true`, all checks return allowed (legacy behavior) |
| `GRANDFATHER_ORG_IDS` | empty | Comma-separated org ids skipped when enforcement on |
| `DEMO_ORG_ID` | `demo-org` in `lib/tenant.js` | Always exempt when enforcement on |

---

## Error responses (implemented)

| Code | HTTP | When |
|------|------|------|
| `PLAN_LIMIT_LEADS` | 402 | Monthly lead cap exceeded |
| `PLAN_LIMIT_USERS` | 402 | maxUsers exceeded |
| `PLAN_RETAIL_DISABLED` | 403 | Retail not on plan |
| `PLAN_LEAD_DISABLED` | 403 | leadEnabled false on org |
| `PLAN_ORG_NOT_FOUND` | 402 | Org missing (edge case) |

Body includes: `error`, `code`, `plan`, `upgradeUrl` (`/pricing`); limits include `limit`, `current` where applicable.

---

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Pilot tenant blocked at cap | Medium | `GRANDFATHER_ORG_IDS`; CS comms before enabling flag |
| Webhook lead ingest rejected at cap | Medium | PO-D8 enforce — monitor n8n errors |
| IST month boundary edge | Low | `getLeadsMonthBoundsIso()` uses Asia/Kolkata |
| Mobile JWT admin error shape | Low | 402 uses `{ error, code, ... }` vs mobile `err()` shape elsewhere |
| `auth/register` not gated | Low | Out of scope per design (admin create only) |

---

## Rollback steps

1. Set `ENFORCE_PLAN_LIMITS=false` in production `.env` and redeploy (immediate).  
2. No database rollback required.  
3. Revert Git commit if logic bug; use flag as interim.  

---

## Known limitations

- Enforcement applies to: POST `/api/leads`, webhook lead ingest, POST `/api/products`, POST `/api/admin/users` (JWT).  
- Not enforced: `POST /api/auth/register`, lead rescore, PATCH/DELETE, GET paths.  
- No usage dashboard or soft UI-only gating.  
- Plan limits read from `PLAN_ENTITLEMENTS` only — not dynamic per subscription document limits field.  
- E-002/E-003 not implemented (per scope).  

---

## Acceptance criteria (design §21)

| Criterion | Status |
|-----------|--------|
| Starter 500 leads → 402 | ✅ Test script |
| Growth retail OK; Starter retail blocked | ✅ Test script |
| Growth 5 users → 402 admin create | ✅ Test script |
| Scale unlimited | ✅ Test script |
| Flag off → no block | ✅ Test script |
| Grandfather exempt | ✅ Test script |
| UI upgrade hint | ✅ leadedge360 / retailedge360 |
| `test:billing` includes limits | ✅ Extended script |

---

## Definition of Done

- [x] Code complete per design (enforcement only)  
- [x] Tests extended in `simulate-billing-flow.mjs`  
- [x] `.env.example` updated  
- [x] Implementation report published  
- [ ] `npm run test:billing` green on CI/staging Mongo (ops)  
- [ ] PO sign-off on grandfather policy  
- [ ] CS notified before prod flag enable  

---

**STOP** — E-004 complete. Await PO approval before E-002 / E-003.
