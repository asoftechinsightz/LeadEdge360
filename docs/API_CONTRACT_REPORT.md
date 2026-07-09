# API Contract Report — RC1

**Generated:** 2026-06-22  
**Canonical spec:** `docs/openapi.yaml`, `docs/openapi.json`, `docs/API_INVENTORY.md`

## Summary

| Metric | Count | Target | Met |
|--------|-------|--------|-----|
| Dedicated route files | 220 | — | — |
| Catch-all legacy handler | 1 (`app/api/[[...path]]/route.js`) | 0 | ❌ |
| Documented in OpenAPI | ~180 paths | 100% | 🟡 ~82% |
| Guarded (auth required) | ~95% CRM routes | 100% | 🟡 |
| Public routes (intentional) | 12 | — | ✅ |

---

## HTTP methods

All dedicated routes implement explicit methods via Next.js App Router exports (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`).

Catch-all supports: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`.

---

## Request / response schema patterns

| Pattern | Example | Status |
|---------|---------|--------|
| Success envelope | `{ success: true, ...data }` | ✅ Standard on dedicated routes |
| Error envelope | `{ success: false, code, message }` | ✅ via `crmError`, `retailError`, etc. |
| Pagination | `{ items, pagination: { page, pageSize, total, hasMore } }` | ✅ WhatsApp, campaigns, leads list |
| Validation | `400` + `VALIDATION_FAILED` | ✅ |
| Auth | `401` + `UNAUTHORIZED` | ✅ |
| Plan gate | `403` + `PLAN_UPGRADE_REQUIRED` | ✅ retail, agents |
| Not found | `404` | ✅ |

---

## Authorization

| Guard | File | Scope |
|-------|------|-------|
| `requireAuthenticatedTenant` | `lib/tenant.js` | JWT bearer or session cookie |
| `guardCrmRequest` | `lib/crm/api-helpers.js` | CRM + RBAC |
| `guardRetailRequest` | `lib/retail/api-helpers.js` | Retail plan + feature |
| `guardWhatsAppRequest` | `lib/whatsapp/api-helpers.js` | WhatsApp module |
| `guardPortalRequest` | `lib/portal/api-helpers.js` | Customer portal |

**Tenant isolation:** All guarded handlers pass `orgId` from authenticated user into service layer queries.

---

## Rate limits

| Endpoint class | Limit | Implementation |
|----------------|-------|----------------|
| Public QR | 120/min/IP | `lib/qr/rate-limit.js` ✅ |
| AI agents | 20–200/hr/agent | `lib/agents/security.js` ✅ |
| Auth OTP | Documented 3/min/IP | ❌ Not implemented in `lib/otp.js` |
| Global API | Recommended nginx | `docs/SECURITY_HARDENING.md` |

---

## Undocumented / legacy endpoints (P1)

These exist in catch-all or mobile-routes but are **missing or incomplete in OpenAPI**:

| Path | Methods | Notes |
|------|---------|-------|
| `/api/mobile/*` | GET, POST | Mobile bootstrap — document in OpenAPI |
| `/api/lead-dashboard` | GET | Legacy alias |
| `/api/seed-reset` | POST | Dev only — block in production |
| `/api/whatsapp/send-template` | POST | Legacy; prefer `/whatsapp/threads/:id/messages` |
| Catch-all lead sub-routes | Various | Partially duplicated by dedicated `/api/leads/[id]/*` |

**Action:** Extend `docs/openapi.yaml` with mobile + legacy aliases before GA.

---

## Sprint 10 contracts (validated)

| Endpoint | Method | Request | Response |
|----------|--------|---------|----------|
| `/api/leads/:id/attachments` | GET, POST | multipart `file` | `{ items }` / `{ attachment }` |
| `/api/leads/:id/attachments/:attachmentId` | GET, DELETE | — | file stream / `{ deleted }` |
| `/api/retail/inventory/lookup?sku=` | GET | query `sku` | `{ product }` |
| `/api/retail/pos/payment-order` | POST | `{ items, paymentMethod }` | `{ order, key, amount }` |
| `/api/retail/pos/checkout` | POST | `{ items, paymentMethod, razorpay_* }` | `{ sale }` |
| `/api/whatsapp/templates` | GET | — | `{ items }` |
| `/api/whatsapp/threads/:id/messages` | POST | `{ text }` or `{ templateName, params }` | `{ thread, message }` |
| `/api/opportunities/:id` | PATCH | `{ stage }` | `{ opportunity }` |

Unit tests: `tests/sprint5` through `tests/sprint10-mobile-api.test.js` (41 tests passing).

---

## Swagger / Postman

| Artifact | Path | Status |
|----------|------|--------|
| OpenAPI 3 | `docs/openapi.yaml` | 🟡 Needs catch-all sync |
| Postman | `docs/postman-collection.json` | 🟡 |
| Error codes | `docs/error-codes.md` | ✅ |

---

## Contract validation score

| Area | Score |
|------|-------|
| Dedicated routes documented | 82% |
| Schema consistency | 90% |
| Auth on sensitive routes | 95% |
| Pagination standardization | 75% |
| **Overall API contract readiness** | **85%** |

**RC1 target (100%):** Not met — OpenAPI gap on legacy/catch-all routes.
