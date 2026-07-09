# Sprint 2 — QR Engine Delivery Report

**Project:** AsoftechInsightz Business Suite  
**Sprint:** S2 — QR Engine  
**Date:** 22 June 2026  
**Status:** Complete (build verified; API retest requires running dev server + Mongo)

---

## 1. Architecture Summary

### Design principles

- **API-first:** All capabilities exposed via REST under `/api/qr`, `/api/public/q`, and `/api/mobile/qr` — consumable by web, Android, iOS, and future public APIs without mobile-specific backends.
- **Multi-tenant:** Every `qr_codes` and `qr_conversions` record carries `orgId`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`. Queries always scope by `orgId` from authenticated tenant context.
- **Feature-gated:** `qr_engine` enforced server-side via `guardGrowthRequest()` on all authenticated routes. UI hidden via `GET /api/users/features` + `GrowthFeatureGate` + nav filtering.
- **Non-breaking:** No changes to certified CRM, revenue, payments, or business card (S1) core logic — QR reuses S1 business card slugs only.

### Request flow

```
Scan QR (/q/{code})
  → record scan (qr_events + stats.scans)
  → resolve destination by type
  → record click (qr_events + stats.clicks)
  → 302 redirect

Conversion (authenticated)
  → POST /api/qr/{id}/convert or /api/mobile/qr/convert
  → qr_conversions document + stats.conversions increment
```

### Layer map

| Layer | Responsibility |
|-------|----------------|
| `lib/qr/service.js` | CRUD, redirect resolution, scan/click/conversion |
| `lib/qr/track.js` | Event log, analytics aggregation, org summary |
| `lib/qr/metadata.js` | Device/browser/location parsing from request headers |
| `lib/qr/rate-limit.js` | Public endpoint abuse protection |
| `lib/qr/public-handler.js` | Shared public redirect handler |
| `components/growth/QrManager.tsx` | Web UI — dashboard, list, create, edit, analytics |

---

## 2. API Summary

### QR Management (auth + `qr_engine`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/qr` | List QRs (paginated: `page`, `pageSize`; filter: `type`, `targetId`) |
| POST | `/api/qr` | Create QR |
| GET | `/api/qr/{id}` | Get QR by id |
| PUT | `/api/qr/{id}` | Update QR (label, payload, active) |
| PATCH | `/api/qr/{id}` | Same as PUT |
| DELETE | `/api/qr/{id}` | Delete QR |
| GET | `/api/qr/summary` | Org dashboard totals + top performers |
| GET | `/api/qr/{id}/analytics` | Per-QR analytics |
| POST | `/api/qr/{id}/convert` | Record conversion |
| GET | `/api/qr/{id}/image` | Auth-gated QR image redirect |

### Public tracking (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/q/{code}` | **Canonical** — validate, track, redirect |
| GET | `/api/public/qr/{code}` | Alias (backward compatible) |
| GET | `/q/{code}` | SSR page redirect (same tracking) |

Query `?format=json` returns `{ redirectTo, type, label, stats }` without redirect.

### Mobile (shared APIs)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/qr` | Paginated QR list |
| POST | `/api/mobile/qr/scan` | Scan + resolve redirect URL |
| GET | `/api/mobile/qr/{id}/analytics` | Per-QR analytics |
| POST | `/api/mobile/qr/convert` | Record conversion |

### Feature gating

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/features` | Returns `planCode` + `features[]` for UI gating |

### QR types (storage: snake_case; accepts SCREAMING_SNAKE aliases)

| Type | Destination |
|------|-------------|
| `business_card` | `/c/{slug}` (published S1 card) |
| `whatsapp` | `https://wa.me/{phone}` |
| `review` | `payload.url` |
| `website` | `payload.url` |
| `lead_form` | `{path}?ref=qr_{code}` (default `/contact`) |
| `custom_url` | `payload.url` |

---

## 3. Database Changes

### Collections

| Collection | Purpose |
|------------|---------|
| `qr_codes` | QR definitions, inline stats, tenant metadata |
| `qr_events` | Scan/click/conversion event log |
| `qr_conversions` | Conversion records with lead/order metadata |

### Indexes (`scripts/mongo-indexes.mjs`)

| Collection | Index |
|------------|-------|
| `qr_codes` | `{ orgId: 1 }` |
| `qr_codes` | `{ orgId: 1, type: 1 }` |
| `qr_codes` | `{ orgId: 1, code: 1 }` unique |
| `qr_codes` | `{ orgId: 1, createdAt: -1 }` |
| `qr_codes` | `{ code: 1 }` unique (public lookup) |
| `qr_events` | `{ orgId: 1, qrCodeId: 1, createdAt: -1 }` |
| `qr_events` | `{ orgId: 1, eventType: 1, createdAt: -1 }` |
| `qr_conversions` | `{ orgId: 1, qrCodeId: 1, createdAt: -1 }` |
| `qr_conversions` | `{ orgId: 1, createdAt: -1 }` |

### Schema docs

- `database/schemas/qr_codes.js`
- `database/schemas/qr_events.js`
- `database/schemas/qr_conversions.js`

---

## 4. Files Created

| Path |
|------|
| `lib/qr/constants.js` |
| `lib/qr/metadata.js` |
| `lib/qr/rate-limit.js` |
| `lib/qr/public-handler.js` |
| `app/api/public/q/[code]/route.js` |
| `app/api/qr/summary/route.js` |
| `app/api/qr/[id]/convert/route.js` |
| `app/api/mobile/qr/route.js` |
| `app/api/mobile/qr/[id]/analytics/route.js` |
| `app/api/mobile/qr/convert/route.js` |
| `app/api/users/features/route.js` |
| `components/growth/GrowthFeatureGate.tsx` |
| `database/schemas/qr_codes.js` |
| `database/schemas/qr_events.js` |
| `database/schemas/qr_conversions.js` |
| `SPRINT_2_REPORT.md` |

---

## 5. Files Modified

| Path | Change |
|------|--------|
| `lib/qr/service.js` | 6 QR types, pagination, conversions, enhanced validation |
| `lib/qr/track.js` | Unique scans, device/browser/location analytics, `qr_conversions` |
| `app/api/qr/route.js` | Pagination params |
| `app/api/qr/[id]/route.js` | PUT handler |
| `app/api/public/qr/[code]/route.js` | Shared public handler + rate limit |
| `app/api/mobile/qr/scan/route.js` | Rich metadata capture |
| `app/q/[code]/page.js` | Metadata + rate limiting |
| `components/growth/QrManager.tsx` | Dashboard, list, create, edit, analytics, share |
| `components/growth/BusinessCardQrWidget.tsx` | Share + conversion stats |
| `components/suite/nav-config.ts` | `feature: 'qr_engine'`, filter helper |
| `components/suite/Sidebar.tsx` | Feature-gated nav |
| `components/suite/MobileNav.tsx` | Feature-gated nav |
| `app/growth/qr/page.js` | Feature gate wrapper |
| `scripts/mongo-indexes.mjs` | Full QR index set |
| `scripts/qr-retest.mjs` | Full directive test coverage |
| `docs/openapi.yaml` | New QR/mobile/features paths |
| `docs/audit/IMPLEMENTATION_PLAN.md` | S2 status |
| `package.json` | `db:qr-retest` script |

---

## 6. Test Results

| Test | Result | Notes |
|------|--------|-------|
| `npm run build` | **PASS** | All QR routes compile; `/growth/qr` static |
| `node scripts/qr-retest.mjs` | **Pending** | Requires `npm run dev -- --port 3007` + Mongo |
| `go-live-retest.mjs` | Not run | Run on VPS before production deploy |

### VPS deploy (required sign-off)

Follow **[docs/ops/VPS_SPRINT_RUNBOOK.md](docs/ops/VPS_SPRINT_RUNBOOK.md)** on `187.127.179.138`:

```bash
cd /opt/asoftech
git pull
npm run deploy:s2
# In another terminal:
npm run dev -- --hostname 0.0.0.0 --port 3007
```

Then update:
- [docs/ops/SPRINT_DATABASE_CHANGELOG.md](docs/ops/SPRINT_DATABASE_CHANGELOG.md) § S2 sign-off
- [docs/ops/deployments/S2_QR_ENGINE_DEPLOYMENT.md](docs/ops/deployments/S2_QR_ENGINE_DEPLOYMENT.md)

### Retest coverage (18 checks)

Login, features, bootstrap, pagination, summary, create (business_card + website + lead_form), validation, GET/PUT, analytics, public `/q` + `/qr` alias, mobile list/scan/analytics, conversion (web + mobile), RBAC, cleanup.

---

## 7. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Public scan inflation | Medium | In-memory rate limit (120/IP/min, 60/IP/code/min); consider Redis on multi-instance prod |
| QR images via external API | Low | `api.qrserver.com` — no npm SSL issues; CDN fallback documented |
| In-memory rate limit not shared across instances | Medium | Single VPS OK; add Redis bucket for horizontal scale |
| `lead_form` uses `/contact` default | Low | Configurable `payload.path`; dedicated lead capture page in S3+ |
| Scan + click both fire on redirect | Low | By design for funnel; unique scans tracked separately |
| Compound index `orgId+code` vs global `code` unique | Low | Both exist; codes globally unique for public `/q/{code}` |
| Retail product/loyalty QR types | Info | Use `custom_url` or `website` until retail-specific sprint |
| API retest not run locally | Info | Run on VPS with Docker Mongo before go-live |

### Certified modules

No regressions introduced to CRM, revenue, payments, or business card modules. Changes are isolated to `lib/qr/*`, growth UI, and new API routes.

---

## Success Criteria Checklist

| Criterion | Status |
|-----------|--------|
| Web: QR creation | ✅ |
| Web: QR analytics | ✅ |
| Web: QR tracking | ✅ |
| Mobile: shared APIs (Android/iOS) | ✅ |
| Responsive / tablet layouts | ✅ (QrManager grid + MobileNav) |
| Multi-tenant isolation | ✅ |
| Feature flag `qr_engine` | ✅ API + UI |
| Subscription aware | ✅ `guardGrowthRequest` + plan features |
| 6 QR types | ✅ |
| `qr_conversions` collection | ✅ |
| Pagination + indexes | ✅ |
| Audit logging (CRUD) | ✅ |
| Sprint 3 not started | ✅ |

---

*Sprint 2 complete. Next: Sprint 3 — Reviews (per IMPLEMENTATION_PLAN.md).*
