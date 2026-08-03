# LeadEdge360 Mobile — API Consumption Matrix

**Version:** 1.0  
**Base URL:** `https://app.asoftechinsightz.com/api`  
**Rule:** No new APIs — all endpoints exist in OpenAPI or codebase today  

**Auth legend:** `JWT` = `Authorization: Bearer <accessToken>`; `Public` = no Bearer required.

**Offline legend:** `R` = read cache, `Q` = queue mutation, `—` = online only.

---

## Authentication

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Register | `/auth/register` | POST | Public | — | — | 409 email/phone in use |
| OTP Verify | `/auth/verify-otp` | POST | Public | — | — | OTP errors per `error-codes.md` |
| Sign In (password) | `/auth/login-password` | POST | Public | — | — | 401 invalid credentials |
| Sign In (OTP send) | `/auth/login-otp` | POST | Public | — | — | 404 phone |
| Forgot password | `/auth/forgot-password` | POST | Public | — | — | Always 200 (no leak) |
| Reset password | `/auth/reset-password` | POST | Public | — | — | Invalid OTP |
| Token refresh | `/auth/refresh-token` | POST | Public* | — | — | 401 → sign out |
| Logout | `/auth/logout` | POST | JWT optional | — | — | Clear local tokens always |
| Verify email | `/auth/verify-email` | POST | Public | — | — | Invalid token |

\*Refresh uses body `refreshToken`, not access token.

---

## Users / profile

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Profile | `/users/me` | GET | JWT | R | On reconnect | 401 refresh |
| Profile edit | `/users/me` | PATCH | JWT | Q | Push patch | Validation |
| Change password | `/users/change-password` | POST | JWT | — | — | 401 wrong password |
| Subscription | `/users/subscription` | GET | JWT | R | Pull | — |

---

## Dashboard & growth

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Dashboard KPIs | `/dashboard/kpis` | GET | JWT | R | Pull-to-refresh | Retry |
| Follow-ups due | `/dashboard/followups-due` | GET | JWT | R | Pull | Retry |
| Growth / revenue | `/dashboard/revenue` | GET | JWT | R | Pull | Query `range` |
| Sales performance | `/dashboard/sales-performance` | GET | JWT | R | Pull | — |
| Dashboard (alt KPIs) | `/kpis` | GET | JWT† | R | Pull | Cookie or JWT tenant |

†Main router `GET /kpis` uses `resolveTenant()` — JWT Bearer supported.

---

## Leads

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Lead list | `/leads` | GET | JWT† | R | Pull + pagination | Empty list OK |
| Lead detail | `/leads/{id}` | GET | JWT† | R | Pull | 404 |
| Create lead / capture | `/leads` | POST | JWT† | Q | Queue POST | 400 name/phone |
| Update lead | `/leads/{id}` | PATCH | JWT† | Q | Queue PATCH | 404 |
| Update status | `/leads/{id}/status` | POST | JWT† | Q | Queue | Invalid status |
| Assign lead | `/leads/{id}/assign` | POST | JWT† | Q | Queue | 400 |
| Rescore | `/leads/{id}/rescore` | POST | JWT† | — | Online | 404 |
| Delete lead | `/leads/{id}` | DELETE | JWT† | Q | Queue | 404 |
| Sources list | `/leads/sources` | GET | JWT† | R | Pull | — |
| Agents (assign UI) | `/agents` | GET | JWT† | R | Pull | Static seed list |

†Implemented in `app/api/[[...path]]/route.js` with JWT via `resolveTenant()`.

### Lead list query parameters (existing)

`q`, `status`, `label`, `territory`, `source`, `assignedTo`, `role`, `agent`, `createdFrom`, `createdTo`, `sort`, `page`, `pageSize`

---

## Follow-ups (Tasks / Meetings)

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Task list | `/followups` | GET | JWT | R | Pull | Filter query params |
| Create task | `/followups` | POST | JWT | Q | Queue | 400 leadId/title/dueAt |
| Update task | `/followups/{id}` | PATCH | JWT | Q | Queue | 404 |
| Close task | `/followups/{id}/close` | POST | JWT | Q | Queue | 404 |
| Cancel task | `/followups/{id}` | DELETE | JWT | Q | Queue | Soft cancel |
| Reminders | `/followups/reminders` | GET | JWT | R | Pull | `withinHours` |

---

## WhatsApp (Conversations)

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Conversation | `/whatsapp/conversation/{leadId}` | GET | JWT | R | Pull | Empty messages |
| Send text | `/whatsapp/send` | POST | JWT | Q | Queue | `WHATSAPP_API_ERROR` |
| Send template | `/whatsapp/send-template` | POST | JWT | Q | Queue | Template errors |

Client may also open `https://wa.me/{phone}` for native WhatsApp app (no API).

---

## Notifications

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Inbox | `/notifications` | GET | JWT | R | Pull | `unreadOnly` param |
| Mark read | `/notifications/{id}/read` | POST | JWT | Q | Queue | — |
| Register device | `/notifications/devices` | POST | JWT | — | On login/refresh | 400 platform/token |
| Settings | `/notifications/settings` | GET | JWT | R | Pull | — |
| Settings update | `/notifications/settings` | PATCH | JWT | Q | Push | — |

---

## Admin (role-gated)

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Users list | `/admin/users` | GET | JWT admin | R | Pull | 403 |
| Invite user | `/admin/users` | POST | JWT admin | — | — | 409 email |
| Update user | `/admin/users/{id}` | PATCH | JWT admin | Q | Push | 403 |
| Delete user | `/admin/users/{id}` | DELETE | JWT admin | — | — | Soft delete |
| Roles list | `/admin/roles` | GET | JWT admin | R | — | Read-only |
| Subscriptions | `/admin/subscriptions` | GET | JWT admin | R | Pull | May be empty |
| Product access | `/admin/product-access` | GET | JWT admin | R | Pull | — |
| Toggle product | `/admin/product-access` | POST | JWT admin | — | — | `leadEnabled` / `retailEnabled` |

---

## Workspace / product

| Screen | API | Method | Auth | Offline Cache | Sync | Error handling |
|--------|-----|--------|------|---------------|------|----------------|
| Workspace | `/users/me` + `/users/subscription` | GET | JWT | R | Pull | — |
| Product flags | `/admin/product-access` | GET | JWT admin | R | Pull | — |

---

## Screens without API (do not call)

| Screen | Status |
|--------|--------|
| Invoices | ROADMAP — no endpoint |
| Business Registry | ROADMAP — no endpoint |
| Splash | Local only |

---

## Webhooks (not for mobile client)

`POST /webhooks/whatsapp`, `/webhooks/facebook`, `/webhooks/google`, `/webhooks/razorpay` — server-to-server only.

---

## Billing (web-only checkout)

Mobile does **not** implement `POST /billing/checkout` or `verify` — subscription read only via `/users/subscription`.

---

## Error handling matrix (global)

| HTTP | Code | Client action |
|------|------|---------------|
| 401 | `AUTH_TOKEN_EXPIRED` | Refresh + retry once |
| 401 | `AUTH_TOKEN_INVALID` | Sign out |
| 401 | `AUTH_REFRESH_INVALID` | Sign out |
| 403 | `PERMISSION_DENIED` | Show message, hide action |
| 404 | `LEAD_NOT_FOUND`, etc. | Remove stale cache row |
| 429 | OTP limits | Show retry timer |
| 502/503 | Integration errors | Backoff retry max 3 |

Reference: [`../error-codes.md`](../error-codes.md)

---

## OpenAPI & Postman

- Full schemas: [`../openapi.json`](../openapi.json)
- Collection: [`../postman-collection.json`](../postman-collection.json)

---

## Related

- [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md)
- [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)
