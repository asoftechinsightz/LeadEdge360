# Phase 9 — Mobile Readiness Hardening

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Scope | Shared types, API client, mobile data views, documentation |
| Backend | **No changes** |

---

## Summary

Phase 9 closes the frontend gaps identified in `docs/MOBILE_READINESS_ASSESSMENT.md`: shared TypeScript DTOs, JWT refresh in the API client, React Query hooks, and mobile-optimized card views for suite data tables.

---

## Deliverables

### 1. Shared types (`src/types/`)

| File | Types |
|------|-------|
| `api.ts` | `ApiError`, `PaginationMeta`, `PaginatedResponse` |
| `auth.ts` | `User`, `AuthTokens`, `Subscription` |
| `lead.ts` | `Lead`, `LeadInput`, `LeadsListResponse` |
| `billing.ts` | `Invoice`, `Payment`, `BillingPlan`, `RevenueDashboard` |
| `dashboard.ts` | `DashboardKpis`, `RecentActivity` |
| `retail.ts` | `RetailProduct`, `RetailKpis` |
| `notification.ts` | `Notification` |

Mirrors `docs/openapi.json` — usable by web, React Native, and future codegen.

### 2. API client hardening (`src/lib/`)

| File | Enhancement |
|------|-------------|
| `auth-storage.ts` | Centralized token read/write/clear |
| `api.ts` | Auto-refresh on 401 via `POST /auth/refresh-token`; retry original request |

### 3. React Query hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useAuth` | Client auth state from localStorage |
| `useLeads` | Typed leads list query |

### 4. Mobile data views (L2 + L4)

| Component | Change |
|-----------|--------|
| `DataCard` (L2) | Touch-friendly card row for mobile lists |
| `LeadTable` | Card view below 768px |
| `InventoryTable` | Card view below 768px |
| `InvoiceList` | Card view below 768px |
| `PaymentHistory` | Card view below 768px |

Uses existing `hooks/use-mobile.jsx` (768px breakpoint). Desktop tables unchanged.

### 5. Documentation

| Doc | Purpose |
|-----|---------|
| `docs/MOBILE_PRODUCTS_API.md` | R-03 `/api/products` disambiguation for mobile teams |
| This file | Phase 9 completion record |

---

## Post-Phase 9 readiness scores

| Dimension | Before (Phase 1) | After (Phase 9) |
|-----------|------------------|-----------------|
| Shared TypeScript models | Weak | **Good** — `src/types/` |
| API client abstraction | Weak | **Good** — JWT + refresh |
| React Query | Partial | **Mounted** — `app/providers.js` in layout |
| Responsive suite tables | Partial | **Improved** — mobile card views |
| Mobile suite navigation | Partial | **Done** — Phase 3 `MobileNav` |
| Overall frontend mobile readiness | 4/10 | **7/10** |

Backend remains **8/10** (unchanged).

---

## Verification

```bash
npm run build   # PASS
```

Manual (mobile viewport ≤768px):

1. `/leadedge360/leads` — lead cards instead of wide table
2. `/retailedge360` — SKU cards with actions
3. `/invoices` — invoice cards
4. `/payments` — payment cards in Payments tab
5. Let access token expire → confirm refresh or redirect to `/signin`

---

## Phase gate

- [x] `src/types/` per governance
- [x] API client JWT + refresh (no contract changes)
- [x] Mobile card views for primary data tables
- [x] R-03 documented for mobile teams
- [x] No frozen path edits
- [x] Build passes

**Deferred (Phase 10):** PWA manifest, openapi-typescript codegen, E2E mobile viewport tests, zod runtime validation.

**Next:** Phase 10 — Enterprise QA & Production Readiness.

Approve Phase 9 to proceed.
