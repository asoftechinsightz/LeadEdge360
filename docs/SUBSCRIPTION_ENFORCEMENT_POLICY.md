# Subscription Enforcement Policy

**Applies to:** LeadEdge360 / RetailEdge360 multi-tenant SaaS  
**Effective:** GA Pilot v1.0  
**Code:** `lib/billing/tenant-policy.js`, `lib/billing/require-plan.js`, `lib/billing/check-feature.js`

---

## Principles

1. **Subscription logic stays fully implemented** — required for customer onboarding, billing, and lifecycle testing.
2. **Internal production tenant is exempt** — AsoftechInsightz operations must never be interrupted by expiry or suspension.
3. **All customer orgs use standard enforcement** — trial, starter, professional, enterprise, renewal, expiry, suspension, reactivation.
4. **Reporting vs enforcement** — internal tenant may have `EXPIRED` or `SUSPENDED` rows in `subscriptions` for testing; effective access remains ACTIVE.

---

## Enforcement matrix

| Check | Customer tenant | Internal production (`asoftechinsightz`) | Demo (`client-demo`) |
|-------|-----------------|------------------------------------------|----------------------|
| `getSubscription()` | Active/TRIAL only | Always effective ACTIVE | Active/TRIAL only |
| `requirePlan()` | Throws if missing/wrong plan | **Bypass** — returns ENTERPRISE | Enforced |
| `hasFeatureForOrg()` | Plan feature list | **Always true** | Enforced |
| API route guards (CRM, AI, retail) | Enforced | **Bypass** | Enforced |
| Customer `customer_subscriptions` lifecycle | Full lifecycle | N/A (B2B CRM subs) | Sample data OK |

---

## Customer subscription lifecycle (enforced)

| Stage | Status | Platform behaviour |
|-------|--------|-------------------|
| Trial | `TRIAL` | Access per trial plan; `trialEndsAt` monitored |
| Active | `ACTIVE` | Full plan features |
| Past due | `PAST_DUE` | Dunning step 1 |
| Grace | `GRACE_PERIOD` | Limited grace before suspension |
| Suspended | `SUSPENDED` | `requirePlan` fails → API blocked |
| Cancelled / expired | `CANCELLED`, `EXPIRED` | No active subscription |
| Reactivation | `ACTIVE` | After payment (`reactivateAfterPayment`) |

Service: `lib/subscriptions/service.js`  
Org-level gate: `lib/billing/get-subscription.js` (status filter)

---

## Plan codes and features

| Plan | Code | Key capabilities |
|------|------|------------------|
| Starter | `STARTER` | Lead capture, landing pages, business card |
| Growth | `BUSINESS_GROWTH` | CRM, proposals, invoices, retail inventory |
| Professional | `PROFESSIONAL` | + review automation, advanced analytics |
| Enterprise | `ENTERPRISE` | + partners, white-label, API, multi-branch |

Feature map: `lib/billing/plan-features.js`  
Alias resolution: `lib/billing/plan-map.js`

---

## Internal production bypass

**Trigger:** Any of:

- `orgId === 'asoftechinsightz'`
- `org.orgType === 'internal_production'`
- `org.internalProduction === true`
- `org.subscriptionEnforcement === 'none'`

**Effect:**

```javascript
// Effective subscription (even if DB says EXPIRED)
{
  planCode: 'ENTERPRISE',
  status: 'ACTIVE',
  enforcementBypass: true,
  recordedStatus: '<actual DB status>'
}
```

---

## Provisioning defaults

| Script | orgType | enforcement |
|--------|---------|-------------|
| `npm run ops:configure-internal-tenant` | `internal_production` | `none` |
| `npm run pilot:provision` | `customer` | `standard` |
| `provision-client-demo.mjs` | `demo` | `standard` |

---

## Validation commands

```bash
# PAT with internal admin — should PASS regardless of subscription DB status
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
npm run production:acceptance

# PAT with customer admin — enforcement active
export CERT_ADMIN_EMAIL=admin@firstcustomer.com
npm run production:acceptance

# Tenant isolation
node scripts/tenant-isolation-check.mjs
```

---

## Razorpay (deferred for pilot)

Subscription **recording** works without live keys. Payment collection for customers requires `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` before live billing.

Internal production tenant does not require Razorpay for daily operations.
