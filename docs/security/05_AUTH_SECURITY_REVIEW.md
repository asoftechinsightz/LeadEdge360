# Authentication Security Review

## Surfaces

| Surface | Implementation | Files |
|---------|----------------|-------|
| Web (cookie) | Emergent `emergent_session` | `lib/auth.js`, `lib/tenant.js` |
| Mobile (JWT) | Bearer access + refresh rotation | `lib/jwt.js`, `lib/mobile-routes.js` |
| Bridge (E-002) | Cookie → shared handlers when `WEB_JWT_BRIDGE=true` | `lib/request-actor.js`, `lib/tenant.js` |
| Password / OTP | Mobile auth routes | `lib/mobile-routes.js`, `lib/otp.js` |

---

## Cookie authentication

| Check | Status | Notes |
|-------|--------|-------|
| HttpOnly cookie | Pass | `emergent_session` set httpOnly |
| Secure flag | Conditional | Only when `NODE_ENV=production` |
| SameSite | Pass | `lax` |
| Session verification | Pass | Remote verify to Emergent API |
| Logout | Pass | Cookie deleted on `/api/auth/logout` |

**Finding:** Unauthenticated users fall through to **demo org** (`DEMO_ORG_ID`) — not a session bypass but shared anonymous CRM context (H-07).

---

## JWT authentication

| Check | Status | Notes |
|-------|--------|-------|
| Algorithm | Pass | `jsonwebtoken` default HS256 |
| Issuer check | Pass | `issuer: 'asoftechinsightz'` on verify |
| Secret strength | **Fail** | Default `dev-secret-change-me` (C-01) |
| Access TTL | Pass | 900s default configurable |
| Refresh storage | Pass | Hashed, rotated, revocable |
| Bearer on bridge roots | Pass | JWT path preferred when Bearer present |

---

## Cookie ↔ JWT bridge (E-002)

| Check | Status | Notes |
|-------|--------|-------|
| Flag default OFF | Pass | `WEB_JWT_BRIDGE=false` |
| Bridged roots limited | Pass | `BRIDGE_ROOTS` in `request-actor.js` |
| Legacy leads unchanged | Pass | Cookie leads stay on legacy handler |
| Cross-tenant tests | Pass | RC security suite (automated) |

---

## Admin authorization

| Check | Status | Notes |
|-------|--------|-------|
| Admin routes role gate | Pass | `admin`/`superadmin` in `handleAdmin` |
| Agent denied admin | Pass | 403 on agent for `/admin/users` |
| Org-scoped admin queries | Pass | `orgId: user.orgId` on user list/mutations |

---

## Tenant isolation (auth context)

| Check | Status | Notes |
|-------|--------|-------|
| JWT maps to user.orgId | Pass | `resolveTenant` / `requireAuth` |
| Mobile handlers use `user.orgId` | Pass | Majority of `mobile-routes.js` |
| Cross-tenant JWT test | Pass | Automated RC suite |

---

## Session expiration & replay

| Mechanism | Assessment |
|-----------|------------|
| Access token expiry | Enforced by JWT `exp` |
| Refresh rotation | Old token revoked on rotate |
| Refresh replay | Second use fails after rotation |
| Emergent session | Managed by Emergent; 7d maxAge on cookie |

---

## CSRF / fixation

| Topic | Assessment |
|-------|------------|
| CSRF on cookie POST | **Partial** — SameSite=Lax; no CSRF token |
| Session fixation | Emergent issues new session token on callback |
| Open redirect | Callback redirects fixed to `/dashboard` (pass) |

---

## Privilege escalation paths reviewed

| Path | Result |
|------|--------|
| PATCH admin user role | Scoped `{ id, orgId }` |
| Billing verify | `pending.orgId !== orgId` → 403 |
| Plan limits | Flag OFF by default; grandfather env-only |

---

## Recommendations (no code changes in this audit)

1. Set `JWT_SECRET` before any mobile API production use (C-01).
2. Keep `WEB_JWT_BRIDGE=false` until staging validation complete.
3. Restrict CORS to app origin.
4. Add nginx rate limits on `/api/auth/*` and mobile OTP routes.
