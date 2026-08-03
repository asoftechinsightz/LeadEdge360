# LeadEdge360 Mobile — Screen Blueprint Library

**Version:** 1.0  
**Status:** Blueprint — specifications only  
**Rule:** Every data screen maps to existing APIs; screens without APIs are marked **ROADMAP** (no invented endpoints).

---

## Conventions

| Field | Meaning |
|-------|---------|
| **API** | Existing endpoint(s) from OpenAPI / `mobile-routes.js` / `route.js` |
| **Auth** | `JWT` = Bearer required; `Public` = no auth |
| **Offline** | Cache / queue behavior per [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md) |

---

## 1. Splash

| Attribute | Spec |
|-----------|------|
| Purpose | Brand moment; bootstrap auth + offline DB |
| Entry | Cold start |
| API | None |
| Auth | Public |
| Layout | Logo, product name “LeadEdge360”, version |
| Logic | Check SecureStore refresh token → Main or Auth stack |
| States | Loading (init DB), error (corrupt storage → clear + Sign In) |

---

## 2. Sign In

| Attribute | Spec |
|-----------|------|
| Purpose | Authenticate sales user |
| API | `POST /auth/login-password`, `POST /auth/login-otp`, `POST /auth/verify-otp` (purpose: `login`) |
| Auth | Public |
| Tabs | Password \| OTP |
| Fields | Email + password; or phone → OTP |
| DPDP | Link to Privacy/Terms (hosted web URLs) |
| Success | Store tokens → Dashboard |
| Errors | `AUTH_INVALID_CREDENTIALS`, `AUTH_ACCOUNT_SUSPENDED` |
| Offline | Block login except cached session refresh attempt |

---

## 3. Register (with DPDP)

| Attribute | Spec |
|-----------|------|
| Purpose | New org + user signup |
| API | `POST /auth/register`, `POST /auth/verify-otp` (purpose: `signup`) |
| Auth | Public |
| Required fields | `email`, `phone`, `password`, `fullName`, `dpdpConsent` |
| DPDP UI | Essential (required), Analytics (opt), Marketing (opt) per MOBILE_API_GUIDE |
| Flow | Register → OTP screen → tokens on verify |
| Offline | Not available |

---

## 4. Workspace Selection

| Attribute | Spec |
|-----------|------|
| Purpose | Confirm tenant + product access (not multi-org picker in v1) |
| API | `GET /users/me`, `GET /users/subscription`, `GET /admin/product-access` (admin) |
| Auth | JWT |
| Display | Org/workspace name, plan, LeadEdge360 enabled |
| Action | Continue → Dashboard |
| Note | If `leadEnabled` false, show read-only message + support contact (no API to self-enable) |

---

## 5. Dashboard

| Attribute | Spec |
|-----------|------|
| Purpose | Executive snapshot for mobile |
| API | `GET /dashboard/kpis`, `GET /dashboard/followups-due`, optional `GET /dashboard/sales-performance` |
| Auth | JWT |
| Widgets | Total/open/won/hot leads, conversion, avg score; due follow-ups count; overdue badge |
| Actions | Tap KPI → Leads filtered; tap follow-ups → Tasks |
| Offline | Show cached KPIs + stale timestamp |
| Empty | First-time org with zero leads → CTA “Add lead” |

---

## 6. Leads (list)

| Attribute | Spec |
|-----------|------|
| Purpose | Pipeline inbox |
| API | `GET /leads` (query: `q`, `status`, `label`, `territory`, `source`, `assignedTo`, `page`, `pageSize`, `sort`) |
| Auth | JWT |
| Row | Name, company, score badge, label (Hot/Warm/Cold), status, territory |
| Filters | Bottom sheet: status, label, territory, source, assignee |
| Search | Debounced `q` |
| FAB | New lead / field capture |
| Offline | Cached list + pull-to-refresh when online |
| Pagination | `meta.hasMore` |

---

## 7. Lead Details

| Attribute | Spec |
|-----------|------|
| Purpose | Single lead command center |
| API | `GET /leads/{id}`, `PATCH /leads/{id}`, `POST /leads/{id}/status`, `POST /leads/{id}/assign`, `POST /leads/{id}/rescore` |
| Auth | JWT |
| Sections | Header (score, label, reasons), contact actions (call, WhatsApp deep link), status stepper, assignee, activity timeline, follow-ups list |
| Actions | Change status, assign, rescore, add follow-up, send WhatsApp |
| Offline | Cached detail; queue status/assign mutations |
| Empty activities | “No activity yet” |

---

## 8. Scanner / Field Capture

| Attribute | Spec |
|-----------|------|
| Purpose | Fast lead capture in field (form-first; camera optional client-only) |
| API | `POST /leads`, `GET /leads/sources` |
| Auth | JWT |
| Fields | `name`, `phone` (required), `email`, `company`, `message`, `budget`, `territory`, `source`, `whatsapp` |
| Note | **No barcode/OCR API** — camera may pre-fill form locally only; submission uses `POST /leads` (auto-score + auto-assign server-side) |
| Offline | Queue `POST /leads` with client-generated draft id |
| Success | Navigate to Lead Details |

---

## 9. Opportunities

| Attribute | Spec |
|-----------|------|
| Purpose | Pipeline view for qualified deals |
| API | `GET /leads?status=Qualified` (+ optional `status=Proposal` toggle) |
| Auth | JWT |
| Note | **Not a separate entity** — filtered Leads list UI variant |
| Offline | Same as Leads list cache |

---

## 10. Proposals

| Attribute | Spec |
|-----------|------|
| Purpose | Deals in proposal stage |
| API | `GET /leads?status=Proposal` |
| Auth | JWT |
| Row highlight | `budget` field from lead |
| Offline | Cached |

---

## 11. Invoices

| Attribute | Spec |
|-----------|------|
| Status | **ROADMAP — Phase 5 Enterprise** |
| API | **None in v1.0** |
| Blueprint | Placeholder screen in roadmap only; link lead `budget` on Won leads as interim read-only revenue hint via `GET /dashboard/revenue` |
| Do not ship | Until Product Owner defines invoice APIs |

---

## 12. Customers

| Attribute | Spec |
|-----------|------|
| Purpose | Customer list for reps |
| API | `GET /leads` (default sort; optional filter `status` ≠ Lost) |
| Auth | JWT |
| Note | **Customers = leads** in Common Data Model |
| Offline | Cached |

---

## 13. Customer 360

| Attribute | Spec |
|-----------|------|
| Purpose | Full relationship view for one customer |
| API | Same as **Lead Details** + `GET /whatsapp/conversation/{leadId}`, `GET /followups?leadId=` (filter client-side from lead detail payload) |
| Auth | JWT |
| Sections | Profile, deals (status history), comms, tasks |
| Offline | Cached lead + messages |

---

## 14. Conversations

| Attribute | Spec |
|-----------|------|
| Purpose | WhatsApp thread per lead |
| API | `GET /whatsapp/conversation/{leadId}`, `POST /whatsapp/send`, `POST /whatsapp/send-template` |
| Auth | JWT |
| List entry | Leads tab Messages or Lead detail |
| Composer | Text message; template picker if configured |
| Offline | Read cache; queue outbound sends |
| Error | `WHATSAPP_API_ERROR`, `LEAD_NOT_FOUND` |

---

## 15. Notifications (inbox)

| Attribute | Spec |
|-----------|------|
| Purpose | In-app notification center |
| API | `GET /notifications`, `POST /notifications/{id}/read` |
| Auth | JWT |
| Badge | `unread` count from response |
| Offline | Last fetched list |
| Note | Server may return empty until notification writer ships |

---

## 16. Tasks

| Attribute | Spec |
|-----------|------|
| Purpose | Task list for reps |
| API | `GET /followups`, `POST /followups`, `PATCH /followups/{id}`, `POST /followups/{id}/close`, `DELETE /followups/{id}` |
| Auth | JWT |
| Note | **Tasks = follow_ups** collection |
| Grouping | Today / Upcoming / Overdue |
| Offline | Cache + queue |

---

## 17. Meetings

| Attribute | Spec |
|-----------|------|
| Purpose | Scheduled meetings with leads |
| API | `GET /followups` filtered `channel` ∈ `call`, `meeting`, `visit` (client filter on existing records) |
| Auth | JWT |
| Create | `POST /followups` with `dueAt`, `channel` |
| Offline | Same as Tasks |

---

## 18. Growth Hub

| Attribute | Spec |
|-----------|------|
| Purpose | Growth analytics for managers |
| API | `GET /dashboard/revenue`, `GET /dashboard/sales-performance`, `GET /dashboard/kpis` |
| Auth | JWT |
| Role | Manager+ recommended |
| Phase | Phase 3 roadmap depth; Phase 1 may show subset on Dashboard |
| Offline | Cached charts with stale label |

---

## 19. Business Registry

| Attribute | Spec |
|-----------|------|
| Status | **ROADMAP — out of scope v1.0** |
| API | **None** |
| Note | Do not implement until Product Bible defines registry APIs |

---

## 20. Settings

| Attribute | Spec |
|-----------|------|
| Purpose | App preferences |
| API | `GET /notifications/settings`, `PATCH /notifications/settings`, `PATCH /users/me` (preferences) |
| Auth | JWT |
| Sections | Notifications toggles, app lock (biometric/PIN client), language (future) |
| Offline | Local prefs + sync settings when online |

---

## 21. Profile

| Attribute | Spec |
|-----------|------|
| Purpose | User profile |
| API | `GET /users/me`, `PATCH /users/me`, `POST /users/change-password` |
| Auth | JWT |
| Display | Name, email, phone, role, picture |
| Offline | Cached profile |

---

## 22. Support

| Attribute | Spec |
|-----------|------|
| Purpose | Help and contact |
| API | None (static) |
| Content | `enquiry@asoftechinsightz.com`, +91-7307911405, links to web `/contact`, `/privacy`, `/terms` |
| Auth | JWT optional |

---

## 23. Admin — Users (More drawer)

| Attribute | Spec |
|-----------|------|
| Purpose | Tenant user management |
| API | `GET/POST/PATCH/DELETE /admin/users`, `GET /admin/roles` |
| Auth | JWT + role `admin` or `manager` per server check |
| Offline | Read-only cache |

---

## 24. Subscription (read-only)

| Attribute | Spec |
|-----------|------|
| Purpose | Show plan status |
| API | `GET /users/subscription`, `GET /admin/subscriptions` (admin) |
| Auth | JWT |
| Note | No mobile checkout — deep link to web `/pricing` |

---

## Screen count summary

| Category | Screens | API-backed |
|----------|---------|------------|
| Auth | 5 | Yes (auth routes) |
| Core CRM | 8 | Yes |
| Messaging | 2 | Yes |
| Growth | 1 | Yes (dashboard) |
| Settings | 4 | Partial |
| Roadmap-only | 2 | Invoices, Business Registry |

---

## Related

- [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md) — full matrix
- [MOBILE_UX_GUIDELINES.md](./MOBILE_UX_GUIDELINES.md) — visual and state patterns
