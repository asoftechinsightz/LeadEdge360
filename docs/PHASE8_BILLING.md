# Phase 8 — Billing Center V2

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Routes | `/payments`, `/invoices`, `/subscribe` |
| Shell | `/payments` + `/invoices` use `SuiteRouteLayout`; `/subscribe` standalone |

---

## Summary

Phase 8 unifies billing UI under `components/billing/`, replacing scattered monolithic pages with composable L4 components. Raw `fetch()` and hardcoded plan prices are replaced with React Query + `apiGet`/`apiPost` against existing billing APIs.

**No backend, API contract, or Razorpay integration changes.**

---

## Component inventory

| Component | Purpose |
|-----------|---------|
| `BillingCenter` | Unified hub at `/payments` — subscription, KPIs, invoices, payments tabs |
| `PlansGrid` | Subscribe page — fetches plans from API, Razorpay checkout |
| `PlanCard` | Plan display with subscribe CTA |
| `SubscriptionPanel` | Current plan + status from `/users/subscription` |
| `SubscriptionBadge` | Plan name badge |
| `InvoiceList` | Invoice KPIs + table |
| `PaymentHistory` | Payment records table |
| `PaymentStatus` | Status badge for invoices/payments |
| `useSubscribeCheckout` | Razorpay flow (`/billing/checkout` + `/billing/verify`) |
| `constants.js` | Currency/date formatters, status variants |

---

## Page composition

```js
// app/payments/page.js
import { BillingCenter } from '@/components/billing'
export default function PaymentsPage() {
  return <BillingCenter />
}

// app/invoices/page.js — InvoiceList + PageHeader
// app/subscribe/page.js — PlansGrid
```

---

## APIs wired

| Action | Endpoint |
|--------|----------|
| List plans | `GET /billing/plans` |
| Checkout | `POST /billing/checkout` |
| Verify payment | `POST /billing/verify` |
| My subscription | `GET /users/subscription` |
| List invoices | `GET /invoices` |
| List payments | `GET /payments` |
| Revenue summary | `GET /revenue/dashboard` |

**Note:** Billing UI uses `/api/billing/*` (not `/api/payments/create-order`) per `SOURCE_OF_TRUTH.md` R-08.

---

## Design-system adoption

- Inline KPI cards → `KPICard`
- Raw `fetch` / `suiteFetch` → `apiGet` / `apiPost` + React Query
- Hardcoded plan prices → `GET /billing/plans`
- Status strings → `PaymentStatus` badge
- Loading → `LoadingState`; empty tables → `EmptyState`
- Tabbed invoices/payments → design-system `Tabs`

---

## Verification

```bash
npm run build   # PASS
```

Manual:

1. Sign in → `/payments` — subscription panel, KPIs, tabs
2. `/invoices` — invoice table with KPIs
3. `/subscribe` — plans from API, Razorpay checkout (if configured)
4. Confirm payment history appears after subscription

---

## Phase gate

- [x] L4 `components/billing/` per governance
- [x] Real APIs only — no mock data
- [x] Razorpay pattern unchanged from `subscribe/page.js`
- [x] No frozen path edits (`lib/`, `app/api/`, `models/`)
- [x] Build passes

**Next:** Phase 9 — Mobile Readiness Hardening.

Approve Phase 8 to proceed.
