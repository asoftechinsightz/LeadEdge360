# Tenant Isolation Validation

**Objective:** Confirm production, demo, development, and customer tenants remain isolated; subscription bypass applies only to internal production.

---

## Tenant map (production VPS)

| Tenant | orgId | Admin example | Data type | Subscription |
|--------|-------|---------------|-----------|--------------|
| Internal production | `asoftechinsightz` | `admin@asoftechinsightz.com` | Real business | Bypass |
| Demo presenter | `client-demo` | `demo@asoftechinsightz.com` | Sample | Standard |
| Customer pilot #1 | `first-customer` | `admin@firstcustomer.com` | Customer | Standard |
| Customer pilot #N | `{slug}` | per provision | Customer | Standard |

---

## Isolation checks (automated)

### 1. PAT isolation suite

```bash
npm run production:acceptance
```

| Check | Expected |
|-------|----------|
| Foreign lead ID blocked | 404 |
| Unauthenticated CRM blocked | 401 |
| Search tenant-scoped | 404 for foreign org |

### 2. Tenant isolation script

```bash
node scripts/tenant-isolation-check.mjs
```

Validates cross-tenant read/write boundaries on CRM collections.

### 3. Enterprise E2E

```bash
E2E_BASE_URL=https://app.asoftechinsightz.com \
CERT_ADMIN_EMAIL=demo@asoftechinsightz.com \
npm run test:e2e:enterprise
```

110/110 — includes RBAC and API module isolation.

---

## Subscription enforcement validation

### Internal production — must NOT block

```bash
# 1. Configure internal tenant
npm run ops:configure-internal-tenant

# 2. (Optional test) Set subscription to EXPIRED in Mongo for asoftechinsightz only
# 3. PAT with internal admin — must still PASS
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='...'
npm run production:acceptance
```

**Pass criteria:** CRM, retail, AI routes return 200; no `ACTIVE_SUBSCRIPTION_REQUIRED` errors.

### Customer tenant — must block when expired

```bash
# In mongosh — TEST ONLY on pilot org, not internal
# db.subscriptions.updateOne({ orgId: 'first-customer' }, { $set: { status: 'EXPIRED' } })

# API call should fail plan gate
# Restore: { status: 'ACTIVE' }
```

**Pass criteria:** `requirePlan` throws; guarded APIs return 402/403 plan error.

---

## Data isolation validation

| Rule | Validation |
|------|------------|
| Demo script never touches `asoftechinsightz` | `provision-client-demo.mjs` — `PRODUCTION_ORG_GUARD` |
| Demo leads only in demo org | Query: `db.leads.find({ id: /^demo-lead-/ })` → all `orgId: client-demo` |
| No sample data in internal org | `configure-internal-production-tenant.mjs` warns on `demo-lead-*` in `asoftechinsightz` |
| Customer data scoped | All queries filter `{ orgId: tenant.orgId }` |

### Manual spot checks

```javascript
// mongosh asoftech_saas
db.leads.distinct('orgId')
db.users.find({}, { email: 1, orgId: 1 })
db.orgs.find({}, { id: 1, orgType: 1, demo: 1, subscriptionEnforcement: 1 })
```

---

## Environment isolation

| Environment | URL / DB | Notes |
|-------------|----------|-------|
| Production VPS | `app.asoftechinsightz.com` | `asoftech_saas` |
| Local dev | `localhost:3000` | `demo-org` fallback when auth bypass |
| Demo tenant | Production URL | `client-demo` org only |

`PUBLIC_SIGNUP_ENABLED=false` — no uncontrolled tenant creation on production.

---

## Sign-off checklist

- [ ] `npm run ops:configure-internal-tenant` executed on VPS
- [ ] PAT passes for `admin@asoftechinsightz.com` (internal)
- [ ] PAT passes for customer admin (`admin@firstcustomer.com`)
- [ ] `tenant-isolation-check.mjs` PASS
- [ ] E2E 110/110 on production
- [ ] No `demo-lead-*` records in `asoftechinsightz` org
- [ ] `client-demo` contains sample data only
- [ ] Customer orgs have `orgType: customer`, `subscriptionEnforcement: standard`

---

## Related

- [`INTERNAL_PRODUCTION_TENANT.md`](./INTERNAL_PRODUCTION_TENANT.md)
- [`SUBSCRIPTION_ENFORCEMENT_POLICY.md`](./SUBSCRIPTION_ENFORCEMENT_POLICY.md)
