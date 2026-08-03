# LeadEdge360 Mobile — Documentation Index

**Program:** LeadEdge360 Mobile App Development Documentation  
**Status:** AUTHORIZED — documentation only  
**Version:** Blueprint for LeadEdge360 Mobile v2  
**Product freeze:** LeadEdge360 v1.0 — no backend/API/database changes from this program  

---

## Purpose

This folder is the **Mobile Development Blueprint** for LeadEdge360 v2. It packages everything a mobile engineering team needs to build the app without modifying the frozen v1.0 product.

**Rules enforced by this program:**

- Documentation only — no mobile app code in this repo phase
- No API changes
- No database changes
- No backend changes
- Reuse existing contracts from `docs/openapi.json`, `docs/MOBILE_API_GUIDE.md`, `lib/mobile-routes.js`

---

## Canonical references (single source of truth)

| Document | Path | Use for |
|----------|------|---------|
| OpenAPI 3.1 | [`../openapi.json`](../openapi.json) | Endpoint contracts, schemas |
| Mobile API quick-start | [`../MOBILE_API_GUIDE.md`](../MOBILE_API_GUIDE.md) | Base URLs, SDK snippets, DPDP signup |
| Auth flows | [`../auth-flow.md`](../auth-flow.md) | OTP, password, refresh token sequences |
| Error codes | [`../error-codes.md`](../error-codes.md) | Client error handling |
| Postman | [`../postman-collection.json`](../postman-collection.json) | Integration testing |
| SQL schema (canonical prod) | [`../sql/01_schema.sql`](../sql/01_schema.sql) | Data model alignment |
| Codebase audit | [`../CODEBASE_AUDIT_REPORT.md`](../CODEBASE_AUDIT_REPORT.md) | Collections, dual auth, RBAC |
| Navigation V2 | [`../SPRINT19_NAVIGATION_V2.md`](../SPRINT19_NAVIGATION_V2.md) | Production web surfaces |
| JWT implementation | `lib/jwt.js` | Token TTLs, rotation |
| Mobile route handlers | `lib/mobile-routes.js` | JWT-authenticated endpoints |
| Main API router | `app/api/[[...path]]/route.js` | Leads, KPIs, agents (JWT + cookie) |

---

## Deliverables map

| Workstream | Document |
|------------|----------|
| 1 — PRD | [MOBILE_PRD.md](./MOBILE_PRD.md) |
| 2 — Information architecture | Sections in [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md) |
| 3 — Screen blueprints | [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md) |
| 4 — UX specification | [MOBILE_UX_GUIDELINES.md](./MOBILE_UX_GUIDELINES.md) |
| 5 — Technical architecture | [MOBILE_ARCHITECTURE.md](./MOBILE_ARCHITECTURE.md) |
| 6 — API consumption matrix | [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md) |
| 7 — Offline strategy | [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md) |
| 8 — Notifications | [MOBILE_NOTIFICATION_FRAMEWORK.md](./MOBILE_NOTIFICATION_FRAMEWORK.md) |
| 9 — Security | [MOBILE_SECURITY.md](./MOBILE_SECURITY.md) |
| 10 — Testing | [MOBILE_TEST_STRATEGY.md](./MOBILE_TEST_STRATEGY.md) |
| 11 — Release roadmap | [MOBILE_RELEASE_ROADMAP.md](./MOBILE_RELEASE_ROADMAP.md) |
| 12 — Developer handover | [MOBILE_DEVELOPER_GUIDE.md](./MOBILE_DEVELOPER_GUIDE.md) |

---

## API base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://app.asoftechinsightz.com/api` |
| Staging | `https://staging.asoftechinsightz.com/api` |
| Demo | `https://qualify-leads-hub.preview.emergentagent.com/api` |

---

## Data model summary (LeadEdge360)

Mobile consumes the same org-scoped entities as web:

- **orgs** — tenant, `plan`, `leadEnabled`, `retailEnabled`
- **users** — `role`: `admin`, `manager`, `agent` (+ `superadmin` in spec)
- **leads** — CRM record with AI `score`, `label`, `status`, `territory`, `assignedTo`
- **follow_ups** — tasks/reminders linked to `leadId`
- **lead_activities** — timeline on lead detail (read via `GET /leads/{id}`)
- **whatsapp_messages** — outbound log + conversation read
- **notifications** — read/mark read (server insert path limited today)
- **push_devices** — FCM/APNs token registration
- **subscriptions** — read via `GET /users/subscription`, `GET /admin/subscriptions`

**Lead pipeline statuses (fixed set):** `New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost`

There is **no separate** Customers, Invoices, Opportunities, or Proposals collection in v1.0 — mobile maps those UX labels to **leads** and **follow_ups** per existing model.

---

## Approval gate

After this documentation package is complete, **STOP**. Mobile development starts only after Product Owner approval.
