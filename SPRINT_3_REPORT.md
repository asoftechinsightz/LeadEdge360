# Sprint 3 — Reviews Delivery Report

**Date:** 22 June 2026  
**Status:** Code complete — VPS deploy deferred (batch with S2)

---

## Summary

Review campaigns, sendable review links, public rating page, and dashboard — API-first for web and mobile.

| Area | Status |
|------|--------|
| `lib/growth/reviews/service.js` | Done |
| APIs `/api/growth/reviews/*` | Done |
| Public `/api/public/review/{token}` + `/review/{token}` | Done |
| Mobile `/api/mobile/reviews/summary`, `/submit` | Done |
| `ReviewDashboard.tsx` + `/growth/reviews` | Done |
| Feature flag `reviews` | Done |
| Indexes + schemas | Done |
| `scripts/reviews-retest.mjs` | Done |
| `npm run build` | **PASS** |

---

## Flow

1. Create campaign (name, review URL, channel, message)
2. Send request → generates unique token + `/review/{token}` link
3. Customer opens link → rates 1–5 + optional comment
4. Dashboard shows sent/opened/completed + avg rating

---

## APIs

| Method | Path |
|--------|------|
| GET/POST | `/api/growth/reviews/campaigns` |
| GET/PUT/PATCH/DELETE | `/api/growth/reviews/campaigns/{id}` |
| POST | `/api/growth/reviews/campaigns/{id}/send` |
| GET | `/api/growth/reviews/campaigns/{id}/requests` |
| GET | `/api/growth/reviews/summary` |
| GET/POST | `/api/public/review/{token}` |
| GET | `/api/mobile/reviews/summary` |
| POST | `/api/mobile/reviews/submit` |

---

## VPS deploy (later)

```bash
npm run deploy:s2   # if S2 not yet deployed
npm run deploy:s3
```

Docs: `docs/ops/VPS_SPRINT_RUNBOOK.md`, `docs/ops/SPRINT_DATABASE_CHANGELOG.md` § S3.

---

## Next

Sprint 4 — WhatsApp + AI v1 (per IMPLEMENTATION_PLAN.md).
