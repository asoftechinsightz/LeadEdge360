# Asoftech Business Suite — Mobile API Integration Report

**Phase 1 deliverable** · Analysis complete before Flutter development  
**Date:** June 2026  
**Backend:** Existing AsoftechInsightz Next.js API (`/api/*`)  
**OpenAPI:** `docs/openapi.json` (mobile JWT contract), `docs/openapi.yaml` (Business Suite skeleton)  
**Production base URL:** `https://asoftechinsightz.com/api` (VPS: `http://127.0.0.1:3000/api`)

---

## Executive Summary

The AsoftechInsightz backend is **production-ready for a mobile LeadEdge360 MVP** with ~40 mobile-first endpoints already implemented in `lib/mobile-routes.js` and `app/api/[[...path]]/route.js`. Authentication uses **JWT + refresh token rotation** with multi-tenant `orgId` scoping. Offline sync primitives exist (`/mobile/sync`, `/mobile/bootstrap`).

**RetailEdge360 mobile** has **partial** API coverage (inventory, KPIs, stores) but **no dedicated POS, billing, purchases, or GST invoice mobile APIs** — these require new backend endpoints or web-view fallback for v1.

**Recommendation:** Build Flutter in two releases:
1. **v1.0** — Business Suite shell + LeadEdge360 (reuse 95% existing APIs)
2. **v1.1** — RetailEdge360 POS module (after 8–12 new retail mobile APIs)

---

## System Architecture

```
┌─────────────────┐     Bearer JWT      ┌──────────────────────────────┐
│  Flutter App    │ ──────────────────► │  Next.js /api/*              │
│  (Riverpod/Dio) │                     │  ├── app/api/**/route.js     │
└────────┬────────┘                     │  ├── [[...path]] catch-all   │
         │                              │  └── lib/mobile-routes.js    │
         │ flutter_secure_storage       └──────────────┬───────────────┘
         │ Hive/SQLite cache                             │
         ▼                                               ▼
┌─────────────────┐                          ┌─────────────────┐
│  Offline queue  │                          │  MongoDB        │
│  + sync engine  │ ◄── GET /mobile/sync ─── │  org-scoped     │
└─────────────────┘                          └─────────────────┘
```

| Layer | Path | Role |
|-------|------|------|
| Dedicated routes | `app/api/<module>/.../route.js` | 211 files; wins over catch-all |
| Catch-all | `app/api/[[...path]]/route.js` | Legacy + mobile bulk router |
| Mobile handlers | `lib/mobile-routes.js` | OpenAPI-aligned JWT auth surface |
| Tenant | `lib/tenant.js` | JWT → `user.orgId` |
| JWT | `lib/jwt.js` | Access 15 min, refresh 30 days, rotation |

---

## Authentication

### Endpoints (public unless noted)

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/login-password` | `{ email, password, device? }` | `AuthTokens` |
| POST | `/auth/login-otp` | `{ phone }` | `{ ok, devOtp? }` |
| POST | `/auth/verify-otp` | `{ destination, code, purpose }` | `AuthTokens` |
| POST | `/auth/register` | `{ email, phone, password, fullName, dpdpConsent?, tenantName? }` | `{ userId, otpSent }` |
| POST | `/auth/forgot-password` | `{ destination }` | `{ ok }` |
| POST | `/auth/reset-password` | `{ destination, code, newPassword }` | `{ ok }` |
| POST | `/auth/refresh-token` | `{ refreshToken }` | `AuthTokens` (rotated) |
| POST | `/auth/logout` | `{ refreshToken? }` | `{ ok }` |
| GET | `/auth/me` | — | `{ user, isDemo, configured }` |
| GET | `/users/me` | JWT | User profile |
| PATCH | `/users/me` | `{ fullName?, picture?, phone?, preferences? }` | Updated user |
| POST | `/users/change-password` | `{ currentPassword, newPassword }` | `{ ok }` |

### AuthTokens shape

```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<opaque hex>",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "orgId": "asoftechinsightz",
    "email": "admin@asoftechinsightz.com",
    "fullName": "...",
    "role": "admin",
    "products": ["leadedge360", "retailedge360"],
    "activeProduct": "leadedge360",
    "businessSuiteEnabled": true,
    "subscriptionTier": "starter"
  }
}
```

### Mobile auth flow

1. `POST /auth/login-password` → store tokens in `flutter_secure_storage`
2. All requests: `Authorization: Bearer <accessToken>`
3. On **401** → `POST /auth/refresh-token` → replace both tokens (rotation)
4. On refresh failure → logout, clear storage, show login
5. Optional biometric: unlock secure storage only (no separate API)

### JWT claims

```javascript
{ sub: userId, tenantId: orgId, role, perms: [], iss: 'asoftechinsightz', exp }
```

**Note:** `perms` is always `[]` — RBAC uses `user.role` from DB on server.

### Environment

| Variable | Default | Mobile impact |
|----------|---------|---------------|
| `JWT_ACCESS_TTL` | 900s | Refresh proactively at ~13 min |
| `JWT_REFRESH_TTL` | 30 days | Re-login monthly |
| `REQUIRE_AUTH` | false (prod: true) | Anonymous blocked in production |

---

## Multi-Tenant & Product Switching

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/products` | JWT | `{ products, activeProduct, businessSuiteEnabled, subscriptionTier }` |
| POST | `/products/switch` | JWT | `{ success, activeProduct }` body: `{ product }` |
| GET | `/users/features` | JWT/Cookie | Org plan features for UI gating |
| GET | `/users/subscription` | JWT | `{ plan, subscription }` |

**Tenant scoping:** Mobile never sends `orgId` — derived from JWT → user document.

**Product codes:** `leadedge360`, `retailedge360` (must be in `user.products` array).

---

## Error Handling

### Envelope (mobile-routes / OpenAPI)

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Email or password is incorrect.",
  "details": {},
  "traceId": "req_..."
}
```

### Catch-all / CRM routes (alternate shape)

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "detail": {}
}
```

**Flutter recommendation:** Normalize both in a Dio interceptor — check `code`, `error`, or HTTP status.

### Key codes (see `docs/error-codes.md`)

| HTTP | Code | Action |
|------|------|--------|
| 401 | `AUTH_TOKEN_EXPIRED` | Refresh token |
| 401 | `AUTH_REFRESH_INVALID` | Force re-login |
| 403 | `PERMISSION_DENIED` | Show upgrade / contact admin |
| 403 | `PLAN_UPGRADE_REQUIRED` | Retail/growth feature gate |
| 429 | `RATE_LIMITED` | Backoff (auth: 40/min/IP) |

---

## Pagination Patterns

| Endpoint | Query params | Meta shape |
|----------|--------------|------------|
| `GET /leads` | `page`, `pageSize`, `status`, `label`, `q`, `assignedTo` | `{ leads, meta: { page, pageSize, total } }` |
| `GET /mobile-leads` | `page`, `limit` | `{ leads, page, totalPages }` |
| `GET /sales/leads` | `page`, `limit`, `status`, `label`, `q` | `{ items, page, limit, total, pages }` |
| `GET /followups` | `page`, `pageSize`, `status`, `dueFrom`, `dueTo` | `{ followups, meta: { page, pageSize, total, hasMore } }` |
| `GET /activities` | `limit`, `cursor`, `filter`, `search` | Cursor-based |

**Default page size:** 20 (`GET /mobile/config` returns `pageSize: 20`, `syncBatchSize: 1000`).

---

## Business Suite — Mobile Shell APIs

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/mobile/bootstrap` | Cold start: stats + 20 recent leads + activities |
| GET | `/mobile/config` | `{ pageSize, syncBatchSize, timelineBatchSize, version }` |
| GET | `/mobile/home` | Dashboard stats + recent leads/activities |
| GET | `/mobile/summary` | Combined lead/followup/task dashboards |
| GET | `/notifications` | `{ notifications, unread }` |
| POST | `/notifications/:id/read` | Mark read |
| POST | `/notifications/devices` | FCM token registration `{ platform, token, deviceName? }` |
| GET/PATCH | `/notifications/settings` | Push/email/WhatsApp prefs |
| GET | `/health/live` | Public liveness |
| GET | `/health/ready` | Public readiness |

---

## LeadEdge360 — Core CRM APIs

### Lead list & search

| Method | Path | Notes |
|--------|------|-------|
| GET | `/mobile-leads` | **Preferred mobile list** — paginated |
| GET | `/sales/leads` | Sales view, score-sorted |
| GET | `/leads` | Full filters (territory, source, date range) |
| GET | `/lead-search` | Quick search, max 25 |
| GET | `/global-search` | Cross-entity |
| GET | `/mobile/lead-priority` | Priority-scored list |
| POST | `/leads` | Create `{ name*, phone*, email?, company?, source?, territory? }` |
| GET | `/leads/:id` | Full detail (dedicated route) |
| GET | `/mobile/leads/:id` | **Mobile aggregate:** lead + timeline + tasks + followups + notes |

### Lead mutations (mobile-optimized)

| Method | Path | Body |
|--------|------|------|
| PATCH | `/mobile/leads/:id/status` | `{ status }` |
| PATCH | `/mobile/leads/:id/assign` | `{ assignedTo }` |
| POST | `/mobile/leads/:id/note` | `{ note }` |
| POST | `/mobile/leads/:id/task` | `{ title, description?, dueAt? }` |
| POST | `/mobile/leads/:id/followup` | `{ title, dueAt }` |
| POST | `/leads/:id/status` | `{ status, reason? }` |
| POST | `/leads/:id/assign` | `{ assignedTo \| userId }` |
| POST | `/leads/:id/rescore` | — |
| PATCH | `/leads/:id` | Partial lead update |

### Lead detail sub-resources (REST)

| Method | Path |
|--------|------|
| GET/POST | `/leads/:id/notes` |
| GET/POST | `/leads/:id/timeline` |
| GET/POST | `/leads/:id/followups` |
| GET/POST | `/leads/:id/tasks` |
| GET | `/leads/:id/assignments` |
| GET | `/leads/:id/status-history` |
| GET | `/leads/:id/activity` |

### Follow-ups (standalone module)

| Method | Path |
|--------|------|
| GET | `/followups` |
| POST | `/followups` |
| PATCH | `/followups/:id` |
| DELETE | `/followups/:id` |
| POST | `/followups/:id/close` |
| GET | `/followups/reminders` |

### Sales pipeline

| Method | Path |
|--------|------|
| GET | `/opportunities/pipeline` |
| GET | `/opportunities/dashboard` |
| POST | `/opportunities/move` |
| GET/POST | `/opportunities` |
| GET | `/sales/queue` |
| GET | `/sales/workload` |
| GET | `/sales/priority` |
| POST | `/sales/leads/bulk-workflow` |

### Dashboards & analytics

| Method | Path |
|--------|------|
| GET | `/dashboard/kpis` |
| GET | `/dashboard/followups-due` |
| GET | `/dashboard/revenue` |
| GET | `/dashboard/sales-performance` |
| GET | `/kpis` |
| GET | `/lead-dashboard` |
| GET | `/mobile/analytics` |
| GET | `/mobile/analytics/trends` |
| GET | `/analytics/conversion` |
| GET | `/analytics/sources` |
| GET | `/analytics/funnel` |
| GET | `/lead-scoring/dashboard` |

### WhatsApp

| Method | Path |
|--------|------|
| POST | `/whatsapp/send` |
| POST | `/whatsapp/send-template` |
| GET | `/whatsapp/conversation/:leadId` |
| GET/POST | `/whatsapp/threads` |

### AI Assistant (reuse existing)

| Method | Path | Use in mobile |
|--------|------|---------------|
| POST | `/ai/suggest` | Lead reply suggestions, nurture copy |
| POST | `/ai/score` | Rescore lead on device |

Request `/ai/suggest`: `{ leadId, intent?, lead? }` → `{ suggestion, engine }`

### Proposals & invoices (LeadEdge sales)

| Method | Path | Plan gate |
|--------|------|-----------|
| GET/POST | `/proposals` | Growth+ |
| POST | `/proposals/auto-generate` | Growth+ |
| GET | `/proposals/:id/pdf` | Growth+ |
| GET/POST | `/invoices` | Revenue permission |

---

## Offline Sync APIs

| Method | Path | Query | Response |
|--------|------|-------|----------|
| GET | `/mobile/sync` | `since?` (ISO timestamp) | `{ success, count, leads[] }` max 1000 |
| GET | `/mobile/sync/changes` | `since?` | `{ success, count, changes[] }` timeline, max 500 |

### Recommended offline strategy

1. **Bootstrap:** `GET /mobile/bootstrap` on login → cache to Hive
2. **Background sync:** Poll `/mobile/sync?since=<lastSyncAt>` every 5–15 min
3. **Timeline delta:** `/mobile/sync/changes?since=` for activity feed
4. **Write queue:** POST mutations queued locally; retry with exponential backoff
5. **Conflict:** Server `updatedAt` wins; show merge UI for notes only

**Gap:** No bulk push endpoint for offline writes — use individual POST/PATCH per entity.

---

## RetailEdge360 — Available vs Missing

### Available today (reuse)

| Method | Path | Module |
|--------|------|--------|
| GET/POST | `/retail/inventory` | SKU list/create |
| DELETE | `/retail/inventory/:id` | Delete SKU |
| POST | `/retail/inventory/:id/repredict` | AI shelf-life |
| GET | `/retail/kpis` | Retail dashboard KPIs |
| GET | `/retail/stores` | Store list |
| POST | `/products` | Legacy product create (catch-all) |
| GET | `/retail-kpis` | Legacy KPIs |

**Auth:** `guardRetailRequest` — requires retail plan + `retail_inventory` feature.

### Missing for mobile POS (document why new APIs needed)

| Feature | Status | Recommendation |
|---------|--------|----------------|
| POS cart / checkout | **Missing** | New `POST /retail/pos/sale` |
| Barcode scan lookup | **Missing** | New `GET /retail/inventory/by-barcode/:code` |
| Billing / receipt print | **Missing** | New `GET /retail/sales/:id/receipt` |
| GST invoice generation | **Partial** (invoices module is CRM) | New retail invoice endpoint |
| Purchases / GRN | **Missing** | New purchase module APIs |
| Customer (retail) CRUD | **Partial** (`/customers`) | Reuse CRM customers or retail-specific |
| Sales history list | **Missing** | New `GET /retail/sales` |
| Inventory adjust/stock in-out | **Missing** | Extend inventory service |

**v1 workaround:** Retail tab opens responsive web `/retailedge360` in WebView until APIs ship.

---

## Growth Module (optional mobile)

| Method | Path |
|--------|------|
| GET/POST | `/growth/business-card` |
| GET/POST | `/qr` |
| POST | `/mobile/qr/scan` |
| POST | `/mobile/reviews/submit` |
| GET | `/mobile/reviews/summary` |

---

## Notifications & FCM

```json
POST /notifications/devices
{
  "platform": "android",
  "token": "<FCM registration token>",
  "deviceName": "Pixel 8"
}
```

Server stores device tokens per user/org for push dispatch (implement FCM sender on backend if not already wired).

---

## Settings & branding

| Method | Path |
|--------|------|
| GET/PUT | `/settings/branding` |
| GET | `/onboarding/status` |
| GET/POST | `/onboarding/progress` |
| GET | `/privacy/export` |
| POST | `/privacy/consent` |

---

## Data Models (Dart generation source)

Primary schemas in `docs/openapi.json`:

| Model | Key fields |
|-------|------------|
| `User` | id, tenantId/orgId, email, phone, fullName, role, products, activeProduct |
| `Lead` | id, name, phone, company, score, label, status, assignedToName, territory, source |
| `FollowUp` | id, leadId, title, dueAt, status, channel, notes |
| `Notification` | id, channel, type, title, body, readAt |
| `AuthTokens` | accessToken, refreshToken, expiresIn, user |

**Field mapping notes:**
- API uses `orgId` in DB; OpenAPI says `tenantId` — map both to same Dart field
- Lead list may return `company` instead of `name` (scanner leads)
- Follow-up status: API uses `pending`/`open` interchangeably in places — normalize in repository

---

## Missing APIs Summary

| Priority | Gap | Impact | Action |
|----------|-----|--------|--------|
| P0 | Retail POS/billing/sales | Retail module blocked | 8–12 new endpoints (Phase 2 backend) |
| P1 | OpenAPI coverage ~40 paths vs ~350 actual | Codegen incomplete | Extend `docs/openapi.json` or hand-write Dart models |
| P1 | Bulk offline write sync | Slow offline recovery | Optional `POST /mobile/sync/push` |
| P2 | Biometric auth API | N/A — client-only | No backend needed |
| P2 | SSL pinning certs | Client config | Document prod cert pins |
| P2 | Unified error envelope | Parser complexity | Backend normalization (optional) |
| P3 | OAuth Google login | Not available | Password + OTP only |
| P3 | Assignment history on mobile detail | Partial | `GET /leads/:id/assignments` exists — include in mobile aggregate |

---

## Recommendations for Flutter Development

### Phase 2 — Project setup (after this report)

```
mobile/
├── lib/
│   ├── core/           # dio, auth, theme, errors, constants
│   ├── data/           # repositories, datasources, models
│   ├── domain/         # entities, use cases (optional thin layer)
│   ├── features/
│   │   ├── auth/
│   │   ├── shell/      # product selection, notifications, profile
│   │   ├── leadedge360/
│   │   ├── retailedge360/
│   │   └── ai_assistant/
│   └── shared/         # widgets, extensions
├── test/
└── integration_test/
```

### API client

- **Dio** with interceptors: auth header, refresh on 401, error normalization, request logging (dev only)
- **Base URL** config: `https://asoftechinsightz.com/api`
- Generate models from OpenAPI where possible; hand-map mobile aggregate responses

### Priority module order

1. Auth + secure storage + refresh
2. Business Suite shell (splash, product switch, bootstrap)
3. LeadEdge360 dashboard + lead list + lead detail
4. Follow-ups, tasks, notes, timeline
5. Pipeline + analytics + WhatsApp deep links
6. Offline sync engine
7. AI Assistant (wrap `/ai/suggest`)
8. RetailEdge360 (after backend POS APIs or WebView fallback)
9. FCM notifications

### Design system alignment

- Match web: dark theme primary, LeadEdge blue accents
- Reference: `components/design-system/`, `docs/DESIGN_SYSTEM_GUIDE.md`
- Material 3 + custom glass cards for enterprise feel

### Security checklist

- [ ] `flutter_secure_storage` for refresh token
- [ ] Access token in memory only
- [ ] Certificate pinning (prod)
- [ ] `flutter_jailbreak_detection` / root check
- [ ] Session timeout (15 min idle → refresh or logout)
- [ ] Hive encryption for offline lead cache
- [ ] No secrets in APK (use `--dart-define` for env)

### CI/CD

- GitHub Actions: `flutter analyze`, `flutter test`, `flutter build apk --release`
- Flavors: `dev`, `staging`, `production`
- Play Store: AAB signing, ProGuard/R8

---

## OpenAPI Reference

| File | Coverage |
|------|----------|
| `docs/openapi.json` | Auth, users, leads, followups, dashboard, whatsapp, notifications, admin (~40 paths) |
| `docs/openapi.yaml` | Business Suite skeleton (~25 paths, incomplete) |

Import `docs/openapi.json` into Swagger UI or use `openapi_generator` for Dart DTOs.

---

## Key Source Files

| File | Purpose |
|------|---------|
| `lib/mobile-routes.js` | Mobile JWT API handlers |
| `app/api/[[...path]]/route.js` | Catch-all + `/mobile/*` routes |
| `lib/jwt.js` | Token lifecycle |
| `lib/tenant.js` | Multi-tenant resolution |
| `lib/leads/service.js` | Lead detail normalization |
| `docs/error-codes.md` | Error code matrix |
| `src/lib/api.ts` | Web client refresh pattern (mirror in Dio) |

---

## Phase 1 Sign-Off

| Criterion | Status |
|-----------|--------|
| All REST endpoints discovered | ✅ ~350+ documented |
| Auth flow documented | ✅ |
| Multi-tenant understood | ✅ |
| Pagination & errors documented | ✅ |
| Missing APIs identified | ✅ |
| Retail gaps documented | ✅ |
| Flutter code started | ❌ **Blocked until approval** |

**Next step:** Approve this report → begin Flutter project scaffold (Phase 2).

---

## Related docs

- `docs/openapi.json` — Mobile API contract
- `docs/error-codes.md` — Error handling
- `docs/DESIGN_SYSTEM_GUIDE.md` — UI alignment
- `docs/sales/REAL_ESTATE_HOT_LEAD_PLAYBOOK.md` — Sales flows (in-app copy reference)
