# Mobile API Guide — Web Cookie Bridge (E-002)

**Epic:** E-002 Cookie ↔ JWT Bridge  
**Base URL:** `https://app.asoftechinsightz.com/api`

---

## Overview

Mobile clients continue to use **JWT Bearer** tokens. The web workspace uses **Emergent cookie** sessions (`emergent_session`). When `WEB_JWT_BRIDGE=true`, the same mobile handler implementations serve cookie-authenticated browser requests for JWT-only roots.

**No new routes.** Same paths, methods, and response shapes as OpenAPI.

---

## Auth matrix

| Root | Mobile (JWT) | Web cookie (bridge ON) | Web cookie (bridge OFF) |
|------|--------------|------------------------|-------------------------|
| `followups` | Bearer required | Cookie session | 404 |
| `dashboard` | Bearer required | Cookie session | 404 |
| `whatsapp` | Bearer required | Cookie session | 404 |
| `notifications` | Bearer required | Cookie session | 404 |
| `admin` | Bearer + admin role | Cookie + admin role | 404 |
| `users` | Bearer required | Cookie session | 404 |
| `leads`, `kpis`, `billing` | Cookie or JWT (unchanged) | Cookie or JWT | Cookie or JWT |
| `auth/register`, login, etc. | Public / JWT per endpoint | Unchanged | Unchanged |

---

## Feature flag

```env
WEB_JWT_BRIDGE=false   # default — zero behavior change
WEB_JWT_BRIDGE=true    # staging / pilot — cookie can invoke bridged handlers
```

Rollback: set `WEB_JWT_BRIDGE=false` and redeploy. No data migration.

---

## Error responses

| Condition | HTTP | Body |
|-----------|------|------|
| Bridge off, cookie on bridged path | 404 | `{ "error": "Not found" }` |
| Bridge on, no valid cookie | 401 | `{ "error": "Not signed in" }` |
| Invalid JWT (mobile) | 401 | `{ "code": "AUTH_TOKEN_INVALID", ... }` |
| Non-admin on `/admin/*` | 403 | `{ "code": "PERMISSION_DENIED", ... }` |
| Cross-tenant resource | 404 / empty set | Queries always filter `orgId` |

---

## Implementation references

- Shared handlers: `lib/mobile-routes.js` (`dispatchBridgedHandlers`)
- Cookie actor: `lib/tenant.js` (`resolveWebActor`)
- Dispatch policy: `lib/request-actor.js`
- Router: `app/api/[[...path]]/route.js`

See [auth-flow.md](./auth-flow.md) for sequence diagrams.

---

## Mobile regression

Mobile JWT clients are unaffected. Bearer requests are dispatched to `mobileRoute()` before any cookie bridge logic. Run `npm run test:bridge` on staging before enabling the flag in production.
