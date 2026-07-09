# Sprint 0 — Stabilization Report

**Date:** 23 June 2026  
**Status:** Complete  
**Theme:** Harden platform — zero new product features

---

## Tasks Completed

| ID | Task | Status | Files |
|----|------|--------|-------|
| S0-01 | MongoDB index script | ✅ | `scripts/mongo-indexes.mjs` |
| S0-03 | Remove hardcoded org IDs | ✅ | `app/api/growth-audit/route.js`, `app/api/catalog/route.js` |
| S0-04 | Tenant-scope analytics | ✅ | `app/api/analytics/*` |
| S0-04b | Tenant-scope lead-scoring | ✅ | `app/api/lead-scoring/*` |
| S0-05 | Auth guard on outreach | ✅ | `app/api/outreach/email/*` |
| S0-06 | Rate limit `/api/auth/*` | ✅ | `middleware.js` |
| S0-07 | Fix httpClient mock leak | ✅ | `src/services/api/adapters/httpClient.ts` |
| S0-08 | Align `.env.example` | ✅ | `.env.example` |
| S0-09 | Tenant isolation script | ✅ | `scripts/tenant-isolation-check.mjs` |
| S0-10 | OpenAPI skeleton | ✅ | `docs/openapi.yaml` |
| S0-11 | PROFESSIONAL tier + feature flags | ✅ | `lib/billing/plan-features.js` |
| S0-12 | `hasFeatureForOrg()` helper | ✅ | `lib/billing/check-feature.js` |
| S0-14 | Readiness checklist update | ✅ | `PRODUCTION_READINESS_CHECKLIST.md` |

---

## Key Changes

### Tenant isolation
- Analytics, lead-scoring, outreach, and catalog routes now use `guardCrmRequest` + `orgId` filters
- Public growth-audit uses `GROWTH_AUDIT_ORG_ID` env (fallback: `demo-org`)

### Billing
- Added **PROFESSIONAL** plan tier
- New feature flags: `business_card`, `qr_engine`, `reviews`, `whatsapp_pro`, `ai_assistant`, `review_automation`

### Performance
- 20 MongoDB indexes defined in `scripts/mongo-indexes.mjs`

### Security
- In-memory rate limit: 40 req/min per IP on `/api/auth/*`

---

## Verification Commands

```powershell
# Index migration (dry run)
node scripts/mongo-indexes.mjs --dry-run

# Apply indexes (requires MongoDB)
node scripts/mongo-indexes.mjs

# Build
npm run build

# Retest (requires server on 3007 + MongoDB)
node scripts/go-live-retest.mjs
node scripts/tenant-isolation-check.mjs
```

---

## Next Sprint

**Sprint 1 — Digital Business Card** per `SPRINT_PLAN.md`
