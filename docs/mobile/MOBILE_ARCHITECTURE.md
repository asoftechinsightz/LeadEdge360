# LeadEdge360 Mobile — Technical Architecture & Information Architecture

**Version:** 1.0  
**Status:** Blueprint — no code  

---

## Part A — Technical architecture

### A.1 Platform recommendation

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **React Native (Expo)** | **Recommended** | Aligns with Next.js/JS stack; existing RN axios snippet in `MOBILE_API_GUIDE.md`; faster hire pool for AsoftechInsightz web team |
| Flutter | Alternative | Strong UI consistency; requires Dart toolchain; no shared code with web |

**Decision:** React Native with **Expo** (managed workflow) for Phase 1, with optional dev client for native modules (biometrics, secure storage).

### A.2 Layered architecture

```
┌─────────────────────────────────────────┐
│  Screens (feature modules)              │
├─────────────────────────────────────────┤
│  UI components (design system)          │
├─────────────────────────────────────────┤
│  State (Zustand + React Query)          │
├─────────────────────────────────────────┤
│  Domain services (leads, auth, sync)    │
├─────────────────────────────────────────┤
│  API client (axios + interceptors)      │
├─────────────────────────────────────────┤
│  Offline (SQLite/Watermelon + queue)    │
├─────────────────────────────────────────┤
│  Platform (secure storage, push, bio)   │
└─────────────────────────────────────────┘
```

### A.3 State management

| Layer | Tool | Responsibility |
|-------|------|----------------|
| Server state | **TanStack Query (React Query)** | Leads, dashboard, follow-ups; cache, retry, stale-while-revalidate |
| Session | **Zustand** | `accessToken` in memory, user profile snapshot |
| Offline queue | **Zustand + persisted SQLite** | Pending mutations with idempotency keys |
| Navigation params | React Navigation | Screen args, deep link state |

### A.4 Navigation

- **Library:** `@react-navigation/native` v6+
- **Structure:** Root stack → Auth stack | Main app
- **Main app:** Bottom tabs + per-tab native stacks + modal stack (compose lead, filters)
- **Deep linking:** `leadedge360://` scheme + universal links `https://app.asoftechinsightz.com/mobile/...` (host maps to screens; no server change required for custom scheme)

### A.5 API layer

- **HTTP:** `axios` with base URL from env (`EXPO_PUBLIC_API_URL`)
- **Auth interceptor:** Attach `Authorization: Bearer`; on 401 `AUTH_TOKEN_EXPIRED`, call `POST /auth/refresh-token`, retry once
- **Error mapper:** Map `code` from `error-codes.md` to user strings
- **Tenant scope:** Implicit via JWT `tenantId` — never send `orgId` in body unless API requires

Reference implementation pattern: `docs/MOBILE_API_GUIDE.md` React Native section.

### A.6 Authentication flow (mobile)

1. `POST /auth/login-password` or OTP: `login-otp` → `verify-otp`
2. Store `refreshToken` in **Keychain/Keystore** (expo-secure-store)
3. Keep `accessToken` in memory only (15 min default, `lib/jwt.js`)
4. Optional app lock: biometric/PIN before revealing tokens (client-only gate)

Web Emergent cookie auth is **not** used on mobile.

### A.7 Secure storage

| Data | Storage |
|------|---------|
| Refresh token | Expo SecureStore / Keychain |
| Access token | Memory |
| User profile cache | Encrypted SQLite or SecureStore JSON |
| Offline lead DB | SQLite with SQLCipher (Phase 1 offline) |
| DPDP consent flags | SecureStore at register |

### A.8 Offline database

- **Engine:** SQLite via `expo-sqlite` or WatermelonDB
- **Tables (client):** `leads_cache`, `followups_cache`, `sync_queue`, `sync_meta`
- **Strategy:** See [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)

### A.9 Push notifications

- **Registration:** `POST /notifications/devices` with FCM/APNs token
- **Delivery:** FCM (Android) + APNs (iOS) — server push sender not fully implemented; combine with **local notifications** for follow-up reminders (`GET /followups/reminders`)

### A.10 Analytics & crash reporting

| Concern | Tool (recommended) |
|---------|-------------------|
| Analytics | Firebase Analytics or PostHog (events: lead_created, followup_closed) |
| Crash | Sentry React Native |
| Performance | Firebase Performance or Sentry transactions |

No server-side analytics API in v1.0 — client SDK only.

### A.11 Environment configuration

```env
EXPO_PUBLIC_API_URL=https://app.asoftechinsightz.com/api
EXPO_PUBLIC_APP_ENV=production
```

---

## Part B — Mobile information architecture

### B.1 Navigation model

```
Root
├── AuthStack (unauthenticated)
│   ├── Splash
│   ├── SignIn
│   ├── Register + DPDP
│   ├── OTP Verify
│   ├── Forgot Password
│   └── Reset Password
└── MainApp (authenticated)
    ├── BottomTabs
    │   ├── Home (Dashboard)
    │   ├── Leads
    │   ├── Tasks (Follow-ups)
    │   ├── Messages (WhatsApp hub)
    │   └── More (drawer entry)
    ├── LeadStack (from Leads tab)
    │   ├── LeadList
    │   ├── LeadDetail
    │   ├── LeadCreate / Field Capture
    │   └── LeadFilters (modal)
    ├── MoreDrawer / MoreStack
    │   ├── Profile
    │   ├── Settings
    │   ├── Notifications
    │   ├── Subscription
    │   ├── Admin (role-gated)
    │   └── Support
    └── Global modals
        ├── Workspace / Product banner (read-only access flags)
        └── Notification detail
```

### B.2 Bottom tabs (Phase 1)

| Tab | Icon | Primary screen | API backbone |
|-----|------|----------------|--------------|
| Home | Dashboard | Dashboard | `/dashboard/kpis`, `/dashboard/followups-due` |
| Leads | Target | Lead list | `/leads` |
| Tasks | Checklist | Follow-ups | `/followups` |
| Messages | Chat | Conversation picker (leads with phone) | `/whatsapp/conversation/{id}` |
| More | Menu | Drawer | Profile, settings |

**Opportunities / Proposals:** Sub-filters on **Leads** tab (`status=Qualified`, `status=Proposal`) — not separate bottom tabs (no distinct API).

### B.3 Drawer (More)

| Item | Screen | Role gate |
|------|--------|-----------|
| Profile | Profile | All |
| Notifications | Notification inbox | All |
| Growth | Dashboard revenue/performance | Manager+ |
| Customers | Lead list (saved filter: active) | All |
| Settings | Settings | All |
| Admin users | Admin users | `admin` |
| Support | Support / help links | All |
| Sign out | — | All |

### B.4 Screen hierarchy (depth)

| Level | Examples |
|-------|----------|
| L0 | Splash |
| L1 | Bottom tabs |
| L2 | List screens (Leads, Tasks) |
| L3 | Detail (Lead detail, Conversation) |
| L4 | Actions (status change, assign, compose WhatsApp) |

### B.5 Deep links

| URI | Screen | Params |
|-----|--------|--------|
| `leadedge360://lead/{id}` | Lead detail | `id` |
| `leadedge360://followup/{id}` | Task detail | `id` |
| `leadedge360://notifications` | Notification inbox | — |
| `leadedge360://login` | Sign in | — |

Push notification payloads should include `type` + `entityId` matching above (client convention; server payload format TBD).

### B.6 Offline flow (IA)

1. User opens app offline → **cached** dashboard + lead list if previously synced
2. Banner: “Offline — changes will sync when connected”
3. Create lead / edit → **queue** → optimistic UI
4. On reconnect → sync queue → refresh React Query caches

### B.7 Notifications entry points

| Source | Entry |
|--------|-------|
| OS push | Deep link to lead/followup |
| In-app inbox | More → Notifications |
| Badge on tab | Unread count from `GET /notifications` |
| Local reminder | Follow-up due → local notification from cached `followups` |

---

## Part C — Cross-cutting concerns

### C.1 RBAC in UI

Derive from JWT `role` on user object + `GET /admin/roles` permission names:

| Capability | agent | manager | admin |
|------------|-------|---------|-------|
| View all org leads | ✓ | ✓ | ✓ |
| Assign any lead | — | ✓ | ✓ |
| Admin users | — | ✓ | ✓ |
| Product access toggle | — | — | ✓ |

Agent-scoped views: filter `GET /leads?assignedTo={self}` when UX mode is “My pipeline”.

### C.2 Product / workspace selection

v1.0 users have **one `orgId`**. “Workspace selection” screen is a **read-only** confirmation showing org name + `GET /users/subscription` plan + `GET /admin/product-access` for LeadEdge360 enabled flag — not multi-org switching.

### C.3 Relationship to web LeadEdge360

Mobile is a **peer client** to `/leadedge360` web dashboard. Same `leads` collection, same statuses, same scoring on `POST /leads`.

---

## Related documents

- [MOBILE_SCREEN_BLUEPRINTS.md](./MOBILE_SCREEN_BLUEPRINTS.md)
- [MOBILE_API_MAPPING.md](./MOBILE_API_MAPPING.md)
- [MOBILE_OFFLINE_STRATEGY.md](./MOBILE_OFFLINE_STRATEGY.md)
- [MOBILE_SECURITY.md](./MOBILE_SECURITY.md)
