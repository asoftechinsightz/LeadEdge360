# Phase 0 Foundation — Agent Runtime Prerequisites

**Date:** 2026-06-22  
**Depends on:** Sprint 0 hardening complete  
**Pairs with:** `SPRINT0_HARDENING_DEPLOYMENT.md`

---

## What was added

| Component | Path | Purpose |
|-----------|------|---------|
| Event bus | `lib/events/bus.js`, `lib/events/types.js` | `platform_events` collection for agent triggers |
| Platform events API | `app/api/platform/events/route.js` | Admin read of recent events |
| Audit extension | `lib/audit/service.js` | `actorType`, `agentId`, `confidence`, `explanation` |
| Plan map | `lib/billing/plan-map.js` | Razorpay ↔ `PLAN_FEATURES` unification |
| Mock→live config | `src/services/api/config.ts`, `lib/env/runtime.js` | UAT/prod default to live APIs |
| Geo Finder live | `components/leadedge360/enterprise/GeoLeadFinder.tsx` | POST `/scanner/jobs` + convert |
| Scanner POST | `app/api/scanner/jobs/route.js` | Create + run scan |
| Foundation retest | `scripts/foundation-retest.mjs` | Smoke test plan map + events |

## Event types emitted

- `lead.created` — POST `/leads`, growth audit
- `lead.deleted` / `lead.restored` — soft delete / restore
- `proposal.won` — mark won
- `proposal.converted_to_invoice` — convert to invoice
- `scanner.job.completed` — scan finished
- `scanner.result.converted` — result → CRM lead
- `subscription.changed` — Razorpay verify

---

## Staging `.env` (port 3007)

```env
NEXT_PUBLIC_APP_ENV=uat
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_APP_URL=http://187.127.179.138:3007
REQUIRE_AUTH=true
DEV_AUTH_BYPASS=false
GROWTH_AUDIT_ORG_ID=demo-org
```

---

## Deploy on VPS

```bash
cd /opt/asoftech
bash scripts/vps-sprint0-staging-deploy.sh
# includes deploy:s0h → foundation-retest + uat-retest + go-live
```

Or foundation only:

```bash
export RETEST_API_BASE=http://127.0.0.1:3007/api
npm run db:indexes
npm run db:foundation-retest
```

---

## Sign-off

| Step | Status |
|------|--------|
| Event bus wired | ☐ |
| Plan map unified | ☐ |
| Geo Finder live scan | ☐ |
| Mock API off on UAT | ☐ |
| foundation-retest PASS | ☐ |
| sprint0-staging-uat PASS | ☐ |
