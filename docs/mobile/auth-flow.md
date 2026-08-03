# Authentication Flow — Dual Auth (JWT + Cookie Bridge)

**Epic:** E-002  
**Date:** 3 August 2026

---

## JWT path (mobile — unchanged)

```mermaid
sequenceDiagram
  participant App as Mobile App
  participant API as route.js
  participant Mobile as mobile-routes.js
  participant JWT as jwt.js
  participant DB as MongoDB

  App->>API: Request + Authorization Bearer
  API->>Mobile: mobileRoute()
  Mobile->>JWT: verifyAccessToken()
  JWT-->>Mobile: userId, orgId, role
  Mobile->>DB: handler (orgId filter)
  DB-->>App: JSON response
```

---

## Cookie bridge path (E-002)

```mermaid
sequenceDiagram
  participant Browser
  participant API as route.js
  participant Tenant as tenant.js
  participant Mobile as mobile-routes.js
  participant DB as MongoDB

  Browser->>API: Request + emergent_session cookie
  API->>API: WEB_JWT_BRIDGE enabled?
  API->>Tenant: resolveWebActor()
  Tenant-->>API: userId, orgId, role, user
  API->>Mobile: cookieBridgeRoute(user)
  Mobile->>DB: same handler as JWT
  DB-->>Browser: JSON response
```

---

## Dispatch order in `route.js`

1. **Bearer present** → `mobileRoute` (JWT verify) — always first  
2. **Bridged root, no Bearer, flag ON** → `resolveWebActor` + `cookieBridgeRoute`  
3. **Bridged root, no Bearer, flag OFF** → 404  
4. **Legacy roots** (`leads`, `kpis`, `billing`, …) → existing cookie handlers  

The bridge does **not** issue JWT to the browser and does **not** change Emergent OAuth login.
