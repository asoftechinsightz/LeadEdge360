# Internal Production Tenant — AsoftechInsightz

**Org ID:** `asoftechinsightz` (override: `INTERNAL_PRODUCTION_ORG_ID`)  
**Purpose:** Operate the AsoftechInsightz business on LeadEdge360 with **real production data only**  
**Status:** Internal Production — not a demo tenant

---

## Role

The internal production tenant is how AsoftechInsightz runs its own:

- CRM (leads, opportunities, customers)
- Marketing and campaigns
- AI workspace and automations
- Customer success workflows
- Analytics and revenue reporting
- Finance and operations

It is the **dogfood environment** for GA pilot validation and the **authoritative source** for business KPIs.

---

## Tenant classification

| Tenant | orgId example | orgType | Subscription enforcement | Data |
|--------|---------------|---------|--------------------------|------|
| **Internal production** | `asoftechinsightz` | `internal_production` | **Bypassed** | Real operational data only |
| **Customer** | `first-customer`, pilot slugs | `customer` | **Standard** | Customer-owned data |
| **Demo** | `client-demo` | `demo` | Standard (presenter) | Sample / representative data |
| **Development** | `demo-org` (local only) | `development` | N/A | Local dev only |

---

## Configuration

### Platform flags (MongoDB `orgs` collection)

```json
{
  "id": "asoftechinsightz",
  "name": "AsoftechInsightz",
  "orgType": "internal_production",
  "internalProduction": true,
  "subscriptionEnforcement": "none",
  "demo": false,
  "pilot": false,
  "businessSuiteEnabled": true,
  "leadEnabled": true,
  "retailEnabled": true,
  "multiTenant": true,
  "productionReady": true
}
```

### Apply on VPS

```bash
cd /opt/asoftech-insightz
source .env
npm run ops:configure-internal-tenant
# Preview:
node scripts/ops/configure-internal-production-tenant.mjs --dry-run
```

Report: `docs/deployments/internal-production-tenant-config.json`

---

## Subscription behaviour

| Aspect | Internal production | Customer tenants |
|--------|--------------------|------------------|
| Expiry blocks API | **No** | Yes |
| Suspension blocks features | **No** | Yes |
| `requirePlan()` | Always passes (ENTERPRISE effective) | Enforced |
| `hasFeatureForOrg()` | Always `true` | Plan-gated |
| DB subscription record | Kept for **reporting & testing** | Authoritative |

Implementation: `lib/billing/tenant-policy.js`, `lib/billing/get-subscription.js`

---

## Production data rules

**Never** in `asoftechinsightz`:

- Dummy leads (`demo-lead-*` prefix)
- Fake customers or mock revenue
- Sample invoices for training
- `provision-client-demo.mjs` seed data
- `PILOT_SEED_SAMPLE` from pilot provision

**Allowed:**

- Real prospects and customers acquired by the business
- Live campaigns, proposals, invoices
- Actual revenue and renewal metrics

Sample data belongs only in **`client-demo`** (demo presenter tenant).

---

## Admin access

| Field | Value |
|-------|-------|
| URL | `https://app.asoftechinsightz.com/signin` |
| Admin email | `admin@asoftechinsightz.com` (or `CERT_ADMIN_EMAIL`) |
| Org | `asoftechinsightz` |

Demo presenter account (`demo@asoftechinsightz.com` → `client-demo`) remains separate for sales demos.

---

## Related documents

- [`SUBSCRIPTION_ENFORCEMENT_POLICY.md`](./SUBSCRIPTION_ENFORCEMENT_POLICY.md)
- [`TENANT_ISOLATION_VALIDATION.md`](./TENANT_ISOLATION_VALIDATION.md)
- [`BUSINESS_OPERATIONS_READINESS.md`](./BUSINESS_OPERATIONS_READINESS.md)
- [`90_DAY_CUSTOMER_ACQUISITION_PLAN.md`](./90_DAY_CUSTOMER_ACQUISITION_PLAN.md)
- [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md)
