# Business Card Test Report — Sprint 1

**Module:** Digital Business Card  
**Date:** 2026-06-22  
**Status:** Implementation complete — automated retest pending dev server + Mongo

## Scope

| Area | Deliverable |
|------|-------------|
| Service | `lib/growth/business-card/service.js` — CRUD, publish, slug, stats, audit |
| Guards | `lib/growth/api-helpers.js` — plan + `business_card` feature flag |
| API | `/api/growth/business-card`, `[id]`, `[id]/publish`, `/api/public/card/[slug]`, `/api/media/upload` |
| UI | `BusinessCardEditor`, `/growth/business-card`, public `/c/[slug]` |
| Indexes | `business_cards` — orgId+id, slug unique, orgId+updatedAt |
| Nav | Marketing → Business Card; Settings → Company → Edit Business Card |

## Automated retest

Skipped if MongoDB is not installed locally. When Mongo is available:

```bash
node scripts/mongo-bootstrap.mjs   # indexes + admin + sample card
npm run dev
node scripts/business-card-retest.mjs
```

## Manual UAT checklist

- [ ] Sign in as `admin@asoftechinsightz.com` / `ChangeMe@2025` (dev bypass or seeded Mongo)
- [ ] Open **Marketing → Business Card**
- [ ] Fill business name, phone, email, address; upload logo (&lt; 2MB)
- [ ] Save → Publish → Copy link
- [ ] Open `/c/{slug}` on mobile viewport — call, WhatsApp, email, maps buttons work
- [ ] View count increments on refresh
- [ ] Settings → Company shows **Edit Business Card** link

## Feature gating

- Plan: STARTER and above (`GROWTH_PLANS` in `api-helpers.js`)
- Feature flag: `business_card` in `lib/billing/plan-features.js`
- Unauthenticated public read: `/api/public/card/[slug]` and `/c/[slug]` only for `published: true`

## Build

Run `npm run build` after Sprint 1 changes — must pass before merge.

## Notes

- Logo uploads stored under `public/uploads/{orgId}/`
- QR widget deferred to Sprint 2 per `SPRINT_PLAN.md`
