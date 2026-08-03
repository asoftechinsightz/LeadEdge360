# LeadEdge360 Mobile — Product Requirements Document (PRD)

**Version:** 1.0 (Blueprint)  
**Product:** LeadEdge360 Mobile v2  
**Basis:** LeadEdge360 v1.0 API + OpenAPI spec — no new business logic  
**Status:** Documentation only  

---

## 1. Vision

Give field sales teams and sales managers a **native mobile command center** for LeadEdge360: capture leads in the field, act on AI scores, complete follow-ups, message prospects on WhatsApp, and read pipeline KPIs — using the **same org, RBAC, and API contracts** as the web product.

The mobile app is a **client** of the existing AsoftechInsightz API. It does not introduce new server-side workflows.

---

## 2. Goals

| Goal | Measure |
|------|---------|
| Reduce lead response time | Time from lead creation to first contact |
| Increase follow-up completion | % follow-ups closed within SLA |
| Improve field capture | Leads created via mobile vs web |
| Parity with web CRM data | Same lead records visible on web and mobile |
| Secure enterprise auth | JWT + refresh + optional biometric gate |

---

## 3. Target users

| Role | API role | Primary mobile jobs |
|------|----------|---------------------|
| Sales Agent | `agent` | My leads, follow-ups, WhatsApp, quick status updates |
| Sales Manager | `manager` | Team pipeline, assign leads, KPIs, follow-up oversight |
| Admin | `admin` | User list, product access flags, subscription read |
| Superadmin | `superadmin` | Same as admin (spec); platform ops out of mobile v1 |

Permissions reference: `GET /admin/roles` returns `admin`, `manager`, `agent` permission bundles (`lib/mobile-routes.js`).

---

## 4. Business objectives

1. **Commercial readiness** — paying orgs can run daily sales ops from mobile without web-only gaps for core CRM.
2. **India field-sales fit** — territory-aware leads, WhatsApp-first follow-up, offline-tolerant capture.
3. **DPDP compliance** — consent captured at registration per `POST /auth/register` `dpdpConsent` object.
4. **Single subscription** — one org login accesses LeadEdge360 per `leadEnabled` on org (`GET /admin/product-access`).

---

## 5. Success metrics

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| Weekly active agents (mobile) | ≥ 60% of licensed agents |
| Mobile lead creates / week | ≥ 30% of total lead creates |
| Follow-up completion (mobile) | ≥ 40% of closed follow-ups |
| Crash-free sessions | ≥ 99.5% |
| Auth refresh success rate | ≥ 99% |
| API p95 latency (client perceived) | < 2s on 4G |

---

## 6. Feature priorities

### P0 — Must ship (Phase 1: Core CRM)

- Splash, sign-in (password + OTP), DPDP consent on register
- Dashboard KPIs (`GET /dashboard/kpis`, `GET /dashboard/followups-due`)
- Lead list with search/filter (`GET /leads`)
- Lead detail with activity + follow-ups (`GET /leads/{id}`)
- Create lead (`POST /leads`) — field capture / “scanner” form flow
- Update status, assign (`POST /leads/{id}/status`, `POST /leads/{id}/assign`, `PATCH /leads/{id}`)
- Follow-ups list/create/close (`GET/POST /followups`, `POST /followups/{id}/close`)
- Push device registration (`POST /notifications/devices`)
- Profile + logout (`GET/PATCH /users/me`, `POST /auth/logout`)
- Offline cache + queued writes for leads and follow-ups

### P1 — Should ship (Phase 1–2)

- WhatsApp send + conversation (`POST /whatsapp/send`, `GET /whatsapp/conversation/{leadId}`)
- Sales performance (`GET /dashboard/sales-performance`)
- Revenue chart (`GET /dashboard/revenue`)
- Notification inbox (`GET /notifications`, `POST /notifications/{id}/read`)
- Notification preferences (`GET/PATCH /notifications/settings`)
- Change password (`POST /users/change-password`)
- Subscription read (`GET /users/subscription`)

### P2 — Phase 2+ (Customer Success surfaces)

- Tasks UI = follow-ups (no separate Tasks API)
- Meetings UI = follow-ups with `channel` field
- Conversations = WhatsApp conversation screen
- “Customer 360” = enriched lead detail (same `GET /leads/{id}`)
- Admin: users CRUD (`GET/POST/PATCH/DELETE /admin/users`)

### P3 — Later phases (no v1.0 API — UI placeholders only in roadmap)

- Dedicated Invoices, Business Registry, barcode Scanner API
- AI copilot chat (no mobile chat API in v1.0)
- Growth Hub beyond existing dashboard endpoints

---

## 7. Release plan (summary)

See [MOBILE_RELEASE_ROADMAP.md](./MOBILE_RELEASE_ROADMAP.md) for phased delivery.

| Phase | Theme | Ship criteria |
|-------|-------|---------------|
| 1 | Core CRM | P0 complete, offline lead sync, store submission |
| 2 | Customer Success | WhatsApp, notifications, admin users |
| 3 | Growth | Revenue/performance analytics depth |
| 4 | AI | Rescore UX, score explainability (`POST /leads/{id}/rescore`) |
| 5 | Enterprise | Advanced admin, SSO prep (client-only; no new APIs) |

---

## 8. Out of scope (v1.0 mobile blueprint)

| Item | Reason |
|------|--------|
| New REST endpoints | Product freeze |
| Mongo/schema migrations | Product freeze |
| RetailEdge360 mobile product | Separate product; `retailEnabled` flag exists but retail APIs are web cookie routes (`/products`, `/retail-kpis`) — not in mobile JWT surface |
| Recurring billing / checkout on mobile | Web marketing `/pricing` + Razorpay; mobile reads subscription only |
| Custom roles CRUD | OpenAPI lists `POST /admin/roles` but **not implemented** (TECHNICAL_DEBT_REPORT) |
| Server-generated push payloads | `notifications` collection has limited writer; app uses local reminders + device registration |
| Separate Customer / Opportunity / Invoice entities | Not in Common Data Model — use **leads** |
| Emergent OAuth cookie login | Web-only; mobile uses JWT auth routes |
| n8n workflow configuration | Server/integration ops |

---

## 9. Assumptions & dependencies

- Production API at `https://app.asoftechinsightz.com/api` exposes OpenAPI-documented JWT routes.
- `JWT_SECRET`, `MSG91_AUTH_KEY` (OTP SMS) configured on server for production auth.
- WhatsApp sends require Meta Cloud API credentials (`lib/whatsapp.js`).
- Mobile uses **Bearer JWT** for all authenticated calls; leads/KPIs also accept JWT via `resolveTenant()` in main router.

---

## 10. Related documents

- [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md) — screen-to-endpoint matrix
- [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md) — per-screen specs
- [MOBILE_SECURITY.md](./MOBILE_SECURITY.md) — auth and storage
