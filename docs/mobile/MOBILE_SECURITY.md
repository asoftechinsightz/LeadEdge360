# LeadEdge360 Mobile — Security Architecture

**Version:** 1.0  
**Basis:** `lib/jwt.js`, `docs/auth-flow.md`, `lib/mobile-routes.js`  
**Constraint:** Client security only — no server changes  

---

## 1. Authentication model

| Mechanism | Web LeadEdge360 | Mobile LeadEdge360 |
|-----------|-----------------|-------------------|
| Primary | Emergent OAuth cookie | JWT Bearer |
| Session store | `emergent_session` cookie | Access + refresh tokens |
| Tenant binding | User `orgId` | JWT `tenantId` claim |

Mobile **must not** embed Emergent OAuth web flow as primary auth.

---

## 2. JWT access token

| Property | Value (`lib/jwt.js`) |
|----------|----------------------|
| Algorithm | HS256 |
| TTL | 900s (15 min) default `JWT_ACCESS_TTL` |
| Issuer | `asoftechinsightz` |
| Claims | `sub` (userId), `tenantId`, `role`, `perms` |
| Storage | **Memory only** — never persist access token to disk |

---

## 3. Refresh token

| Property | Value |
|----------|-------|
| Type | Opaque 40-byte hex |
| TTL | 30 days default `JWT_REFRESH_TTL` |
| Server storage | Hashed in `auth_refresh_tokens` collection |
| Rotation | New refresh on every `POST /auth/refresh-token` |
| Client storage | **Keychain / Keystore** via Expo SecureStore |

Logout: `POST /auth/logout` with `refreshToken` body → server revokes hash.

---

## 4. Biometric login

**Client-only app lock** — does not replace server auth.

| Step | Behavior |
|------|----------|
| After first password/OTP login | Offer enable Face ID / fingerprint |
| Subsequent opens | Biometric → unlock SecureStore → refresh if needed |
| Fallback | Device PIN or password re-entry |

Biometric gate protects local tokens and cached PII — not a second JWT.

---

## 5. PIN (optional app lock)

- 4–6 digit local PIN hashed with device-specific salt
- 5 failures → require full password login
- PIN stored hashed in SecureStore

---

## 6. Encryption

| Layer | Approach |
|-------|----------|
| Transport | TLS 1.2+ to API (HTTPS only) |
| Local DB | SQLCipher or encrypted SQLite (Phase 1 offline) |
| SecureStore | OS-backed encryption |
| Logs | Never log tokens, passwords, OTP, full phone numbers in production |

---

## 7. Secure storage map

| Asset | Location |
|-------|----------|
| Refresh token | SecureStore |
| Biometric/PIN flags | SecureStore |
| Access token | Memory |
| Lead PII cache | Encrypted SQLite |
| Analytics IDs | Non-sensitive prefs |

---

## 8. Certificate pinning

**Recommended for production:**

- Pin leaf or intermediate for `app.asoftechinsightz.com`
- Fallback: standard system CA validation if pin rotation process documented
- Implement via `react-native-ssl-pinning` or Expo config plugin

**Staging:** pinning optional for dev builds.

---

## 9. Session timeout

| Event | Action |
|-------|--------|
| Access expired | Auto refresh |
| Refresh expired / revoked | Clear storage → Sign In |
| User logout | Revoke refresh + clear all caches |
| 30 days inactive | Refresh fails → sign in |
| Admin suspends account | `AUTH_ACCOUNT_SUSPENDED` on next API call → sign out |

Optional: background idle timeout (30 min) → require biometric only (tokens remain).

---

## 10. RBAC enforcement

| Layer | Enforcement |
|-------|-------------|
| Server | `requireAuth()`, `admin` role checks in `mobile-routes.js` |
| Client | Hide UI actions by `user.role` from JWT/user object |
| Agent filter | `GET /leads?assignedTo=` for “my leads” mode |

**Never trust client-only gating** — server returns 403 for unauthorized admin calls.

### Role capabilities (from `GET /admin/roles`)

| Permission bundle | Roles |
|-------------------|-------|
| `leads.*`, `followups.*`, `dashboard.read`, `whatsapp.send` | agent, manager, admin |
| `admin.users` | manager, admin |
| `*` | admin |

---

## 11. DPDP compliance (signup)

Mobile register screen must collect `dpdpConsent` object per `MOBILE_API_GUIDE.md`:

- Essential processing (required)
- Analytics (optional)
- Marketing (optional)
- Links to `/privacy` and `/terms` on web

Store consent version `1.0` matching server.

---

## 12. Threat mitigations

| Threat | Mitigation |
|--------|------------|
| Token theft | Short access TTL, refresh rotation, SecureStore |
| MITM | TLS + certificate pinning |
| Jailbreak/root | Document risk; optional jailbreak detection Phase 5 |
| Screenshot leakage | Optional FLAG_SECURE on lead detail (Android) |
| Clipboard | Clear clipboard after copy phone |

---

## 13. Security testing

See [MOBILE_TEST_STRATEGY.md](./MOBILE_TEST_STRATEGY.md) — security section.

---

## Related

- [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)
- [`../auth-flow.md`](../auth-flow.md)
