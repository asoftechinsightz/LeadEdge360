# Mobile Readiness Assessment — AsoftechInsightz

> **Reference assessment only.** Canonical API authority: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §9 · `docs/openapi.json`

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Target Platforms:** Android, iOS, Flutter (future)  
**Assessment Scope:** API reusability, shared models, responsive design, DTO consistency

---

## 1. Executive Summary

| Dimension | Score | Status |
|-----------|-------|--------|
| API surface for mobile | **Strong** | OpenAPI spec, JWT auth, mobile-specific endpoints |
| Shared TypeScript models | **Weak** | No `src/types/` or shared DTO layer in frontend |
| API client abstraction | **Weak** | Raw `fetch()` in pages; axios installed but unused |
| Responsive web layouts | **Partial** | Marketing pages responsive; dashboards basic |
| Auth token handling | **Adequate** | JWT + refresh documented; client-side only |
| Offline / sync support | **Backend-ready** | `/api/mobile/sync/*` endpoints exist |
| Push notifications | **Backend-ready** | `/api/notifications/devices` exists |
| Overall mobile readiness | **API: 8/10 · Frontend: 4/10** | Backend ahead of frontend |

**Verdict:** The backend is **production-ready for native mobile apps**. The web frontend requires hardening (Phases 2–9) to establish shared models, API client, and responsive patterns that native apps can also consume.

---

## 2. API Mobile Readiness

### 2.1 Documented API Contract

| Asset | Path | Quality |
|-------|------|---------|
| OpenAPI 3.1 spec | `docs/openapi.json` | Production-grade; auth, leads, dashboard, WhatsApp, notifications, admin |
| Postman collection | `docs/postman-collection.json` | Auto-populates tokens and leadId |
| Mobile quick-start | `docs/MOBILE_API_GUIDE.md` | Kotlin + Swift SDK starter snippets |
| Auth flow docs | `docs/auth-flow.md` | OTP, password, refresh flows |
| Error codes | `docs/error-codes.md` | RFC-7807 problem+json |

**Base URLs documented:**

| Environment | URL |
|-------------|-----|
| Production | `https://app.asoftechinsightz.com/api` |
| Staging | `https://staging.asoftechinsightz.com/api` |
| Local | `http://localhost:3000/api` |

### 2.2 Mobile-Specific API Endpoints

| Endpoint | Purpose | Mobile-Optimized |
|----------|---------|------------------|
| `GET /api/mobile/home` | Home screen data | Yes |
| `GET /api/mobile/summary` | Summary widgets | Yes |
| `GET /api/mobile/bootstrap` | App bootstrap config | Yes |
| `GET /api/mobile/config` | Feature flags / config | Yes |
| `GET /api/mobile/sync` | Full sync payload | Yes |
| `GET /api/mobile/sync/changes` | Delta sync | Yes |
| `GET /api/mobile/leads/[id]` | Lead detail | Yes |
| `POST /api/mobile/leads/[id]/note` | Quick note | Yes |
| `POST /api/mobile/leads/[id]/task` | Quick task | Yes |
| `POST /api/mobile/leads/[id]/followup` | Quick follow-up | Yes |
| `PATCH /api/mobile/leads/[id]/status` | Status update | Yes |
| `PATCH /api/mobile/leads/[id]/assign` | Assignment | Yes |
| `GET /api/mobile/analytics` | Analytics summary | Yes |
| `GET /api/mobile/analytics/trends` | Trend data | Yes |
| `GET /api/mobile/audit-logs` | Audit trail | Yes |
| `GET /api/mobile/reports` | Report list | Yes |
| `GET /api/mobile/reports/[id]/download` | Report download | Yes |
| `GET /api/mobile/lead-priority` | Priority leads | Yes |
| `GET /api/mobile-leads` | Mobile lead list | Yes |

### 2.3 JWT Auth Flow (Mobile-Ready)

| Step | Endpoint | Implementation |
|------|----------|----------------|
| Register | `POST /api/auth/register` | `lib/mobile-routes.js` |
| OTP login | `POST /api/auth/login-otp` → `verify-otp` | Used by web signin |
| Password login | `POST /api/auth/login-password` | Used by web signin |
| Token refresh | `POST /api/auth/refresh-token` | Documented with interceptor pattern |
| Profile | `GET /api/users/me` | JWT required |
| Subscription | `GET /api/users/subscription` | JWT required |

**Token storage (web):** `localStorage` — native apps should use secure storage (Keychain/Keystore).

### 2.4 Push Notifications API

| Endpoint | Purpose |
|----------|---------|
| `POST /api/notifications/devices` | Register device token |
| `GET /api/notifications` | Notification inbox |
| `POST /api/notifications/[id]/read` | Mark read |
| `GET, PATCH /api/notifications/settings` | Notification preferences |

**Gap:** No web notification center UI; API is ready for mobile.

---

## 3. Shared Models & DTOs

### 3.1 Current State

| Item | Status |
|------|--------|
| `src/types/` directory | **Does not exist** |
| TypeScript usage | Minimal (2 `.tsx` files only) |
| OpenAPI → TypeScript codegen | **Not configured** |
| Shared Lead/User/Subscription types | Defined in OpenAPI only |
| Frontend type safety | None — plain JS objects from `fetch().json()` |

### 3.2 OpenAPI Schemas Available for Codegen

From `docs/openapi.json`:

- `User`, `AuthTokens`, `Lead`, `LeadInput`
- `PaginationMeta`, `Error`
- Tags: Auth, Users, Leads, FollowUps, Dashboard, WhatsApp, Notifications, Admin, Webhooks

### 3.3 Recommended Shared Model Structure (Phase 9)

```
src/
├── types/
│   ├── auth.ts          # User, AuthTokens, Role
│   ├── lead.ts          # Lead, LeadInput, LeadStatus
│   ├── dashboard.ts     # KPI, RevenueMetric
│   ├── billing.ts       # Subscription, Plan, Invoice
│   ├── retail.ts        # Product, RetailKpi
│   ├── notification.ts  # Notification, DeviceToken
│   └── api.ts           # PaginationMeta, ApiError
├── api/
│   ├── client.ts        # Fetch wrapper with JWT injection
│   ├── auth.ts          # Auth API methods
│   ├── leads.ts         # Lead API methods
│   ├── dashboard.ts     # Dashboard API methods
│   └── billing.ts       # Billing API methods
└── hooks/
    ├── useAuth.ts
    ├── useLeads.ts
    └── useDashboard.ts
```

**Flutter equivalent:** Generate Dart models from same OpenAPI spec.

**Native equivalent:** Kotlin/Swift data classes from OpenAPI (snippets already in `MOBILE_API_GUIDE.md`).

---

## 4. API Client Reusability

### 4.1 Current Web Pattern

```javascript
// Typical pattern in app/leadedge360/page.js
fetch('/api/leads?' + params.toString()).then(r => r.json())
```

**Issues for mobile reuse:**

| Issue | Impact |
|-------|--------|
| No auth header injection | Mobile must implement separately |
| No error normalization | Inconsistent error handling |
| No token refresh on 401 | Mobile guide shows pattern; web does not implement |
| No request/response typing | Runtime errors possible |
| Relative URLs (`/api/...`) | Mobile needs absolute base URL |

### 4.2 Installed but Unused

| Package | Purpose | Status |
|---------|---------|--------|
| `axios` | HTTP client | Installed, unused |
| `@tanstack/react-query` | Caching, mutations | `providers.js` exists, not mounted |
| `swr` | Data fetching | Installed, unused |

### 4.3 Phase 9 Target: Shared API Client

```typescript
// Proposed lib/api-client.ts (no API contract changes)
class ApiClient {
  constructor(baseUrl: string, tokenStore: TokenStore) {}
  async get<T>(path: string, params?: Record<string, string>): Promise<T>
  async post<T>(path: string, body: unknown): Promise<T>
  // Auto-attach Bearer token, refresh on 401
}
```

Same interface usable by:
- Next.js web app (via React Query hooks)
- React Native / Expo (future)
- Flutter via platform channel or Dart port

---

## 5. Responsive Design Assessment

### 5.1 Marketing Pages

| Page | Responsive | Notes |
|------|------------|-------|
| Homepage (GIX) | Good | Grid layouts, mobile-friendly sections |
| About, Products, etc. | Good | Tailwind responsive classes |
| Navbar | Good | Mobile menu via dropdown |
| Contact, Growth Audit | Adequate | Form layouts adapt |

### 5.2 Business Suite Pages

| Page | Responsive | Notes |
|------|------------|-------|
| LeadEdge360 | Partial | Table overflows on mobile; filters stack |
| RetailEdge360 | Partial | Table-heavy; limited mobile optimization |
| Proposals, Invoices, Revenue | Partial | Basic card grids |
| DashboardHeader | Partial | Nav hidden below `lg` breakpoint — **no mobile menu** |
| Product Selection | Good | 2-column grid collapses |
| Sign-in | Good | Card-centered layout |
| Subscribe | Adequate | Plan cards stack |

### 5.3 Responsive Gaps

| Gap | Severity | Phase |
|-----|----------|-------|
| No mobile suite navigation (hamburger/sidebar) | High | Phase 3 |
| Data tables not horizontally scrollable/card-view on mobile | High | Phase 6–7 |
| DashboardHeader nav hidden on mobile with no alternative | High | Phase 3 |
| No touch-optimized interactions (swipe, pull-to-refresh) | Medium | Phase 9 |
| Fixed desktop-first chart sizes | Medium | Phase 6–7 |

### 5.4 Hooks Available

| Hook | File | Usage |
|------|------|-------|
| `useIsMobile` | `hooks/use-mobile.jsx` | Sidebar dependency only — should be used in AppShell |

---

## 6. DTO Consistency Assessment

### 6.1 API Response Patterns

| Pattern | Consistency |
|---------|-------------|
| JSON responses | Consistent |
| Error format (RFC-7807) | Documented in OpenAPI; not validated in frontend |
| Pagination (`page`, `pageSize`, `total`, `hasMore`) | Documented; web pages don't use pagination |
| Tenant scoping via JWT | Consistent on mobile routes |
| Date formats (ISO 8601) | Assumed consistent |

### 6.2 Known Inconsistencies

| Issue | Detail |
|-------|--------|
| `/api/products` dual meaning | Product suite list (JWT) vs retail inventory (tenant) |
| Dual payment APIs | `/api/billing/*` vs `/api/payments/*` |
| Demo tenant fallback | Unauthenticated calls get `demo-org` data |

### 6.3 DTO Recommendations (Phase 9)

1. Generate TypeScript types from `docs/openapi.json` (e.g., `openapi-typescript`)
2. Add runtime validation with zod schemas matching OpenAPI
3. Document `/api/products` disambiguation for mobile teams
4. Create shared `ApiError` type for consistent error UI

---

## 7. Platform-Specific Readiness

### 7.1 Android

| Requirement | Status |
|-------------|--------|
| REST API with JWT | Ready |
| Kotlin Retrofit snippet | Documented in `MOBILE_API_GUIDE.md` |
| Token refresh interceptor | Documented |
| Push notification registration | API ready |
| Offline sync | `/api/mobile/sync/*` ready |

### 7.2 iOS

| Requirement | Status |
|-------------|--------|
| REST API with JWT | Ready |
| Swift URLSession snippet | Documented in `MOBILE_API_GUIDE.md` |
| Keychain token storage | Documented pattern |
| Push notification registration | API ready |
| Offline sync | `/api/mobile/sync/*` ready |

### 7.3 Flutter

| Requirement | Status |
|-------------|--------|
| REST API with JWT | Ready |
| Dart models from OpenAPI | Not generated yet |
| Shared business logic | No Flutter project in repo |
| Responsive web as PWA base | Partial |

---

## 8. Web-as-Mobile-Preview Strategy

Until native apps ship, the responsive web app can serve as a mobile preview:

| Approach | Feasibility |
|----------|-------------|
| PWA manifest + service worker | Not implemented — Phase 9 candidate |
| Mobile-first AppShell | Phase 3 |
| Bottom navigation for mobile | Phase 3 |
| Card-view table alternatives | Phase 6–7 |

---

## 9. Phase 9 Hardening Checklist (Planned)

| Task | Priority |
|------|----------|
| Create `src/types/` from OpenAPI schemas | High |
| Implement shared `ApiClient` with JWT + refresh | High |
| Mount React Query providers | High |
| Add responsive AppShell with mobile nav | High |
| Implement card-view for tables on mobile | Medium |
| Add PWA manifest (optional) | Low |
| Generate Flutter/Dart models | Medium |
| Document `/api/products` conflict for mobile teams | High |
| Add E2E mobile viewport tests | Medium |

---

## 10. Conclusion

**Backend mobile readiness: STRONG.** The API surface, OpenAPI documentation, JWT auth, sync endpoints, and notification APIs provide a solid foundation for Android, iOS, and Flutter applications without any backend changes.

**Frontend mobile readiness: NEEDS WORK.** The web app lacks shared TypeScript models, API client abstraction, responsive suite navigation, and mobile-optimized data views. Phases 2–3 (design system + AppShell) and Phase 9 (hardening) will close these gaps while preserving all existing API contracts.

**No backend modifications required** for mobile readiness hardening.
