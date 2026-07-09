# Business Operations Readiness

**Tenant:** `asoftechinsightz` (internal production)  
**Platform:** `https://app.asoftechinsightz.com`  
**Readiness date:** 2026-07-03

---

## Executive summary

AsoftechInsightz is configured to **run the business on LeadEdge360** using the internal production tenant. Platform certification (E2E, PAT, load) is complete. Customer pilots proceed in parallel via provisioned tenants.

---

## Operational modules

| Function | Module / route | Status | Data source |
|----------|----------------|--------|-------------|
| CRM | `/leads`, `/opportunities`, `/customers` | ✅ PAT + E2E | Real leads only |
| Marketing | `/campaigns`, Marketing Engine | ✅ API | Real campaigns |
| AI Workspace | `/ops/ai`, AI insights on leads | ✅ API | Production inference |
| Customer success | Tasks, follow-ups, conversations | ✅ CRM embedded | Real accounts |
| Analytics | `/revenue`, `/dashboard` | ✅ PAT | Real revenue aggregates |
| Monitoring | Grafana :3031, Prometheus | ✅ Deployed | Infrastructure metrics |
| Finance | Invoices, proposals, subscriptions | ✅ PAT | Real billing records |
| Operations | Launch war room, backups, PAT | ✅ Scripts | Ops automation |
| Retail (optional) | `/retailedge360` | ✅ PAT | Real inventory if used |

---

## Daily operations rhythm

| Time | Action | Command |
|------|--------|---------|
| Morning | Health snapshot | `npm run launch:warroom` |
| Per deploy | Acceptance gate | `npm run production:acceptance` |
| Weekly | Backup verify | Check `/opt/asoftech/backups/daily/` |
| Weekly | Grafana review | `http://127.0.0.1:3031` (VPS) |
| On incident | Rollback | `bash scripts/ops/rollback-production.sh` |

---

## Internal tenant configuration

```bash
cd /opt/asoftech-insightz
source .env
npm run ops:configure-internal-tenant
```

Ensures:

- `orgType: internal_production`
- Subscription enforcement **bypassed**
- `demo: false` — no sample data policy violations
- ENTERPRISE effective access for all platform features

See [`INTERNAL_PRODUCTION_TENANT.md`](./INTERNAL_PRODUCTION_TENANT.md).

---

## Dashboards for business management

Use **internal production data** (`asoftechinsightz` org) for:

| Dashboard | Metrics |
|-----------|---------|
| LeadEdge360 Dashboard | Pipeline value, lead velocity, hot leads |
| Revenue | MRR, ARR, forecast, paid vs pending |
| Opportunities | Stage conversion, win rate |
| Customers | Health, active subscriptions, churn signals |
| Marketing | Campaign performance, ROI (when campaigns live) |
| Grafana (ops) | API latency, uptime, error rates |

**Do not** use `client-demo` or pilot customer data for company KPIs.

---

## Workflow automations

| Workflow | Tool | Tenant |
|----------|------|--------|
| Lead capture → scoring | LeadEdge360 + AI scoring | Internal |
| Opportunity → proposal → invoice | CRM revenue module | Internal |
| Pilot customer onboarding | `pilot:provision` | Customer orgs |
| Sales demo | `demo@` → `client-demo` | Demo only |
| WhatsApp templates | `/api/whatsapp/templates` | Per-tenant |
| Marketing Engine daily run | `/api/marketing-engine/daily/run` | Internal config |

---

## Data hygiene

| ✅ Do | ❌ Don't |
|-------|---------|
| Log real prospects in `asoftechinsightz` | Run `provision-client-demo` on internal org |
| Use `client-demo` for sales presentations | Copy demo leads into production org |
| Provision customers via `pilot:provision` | Enable public signup on production |
| Archive/export real data for reporting | Seed `PILOT_SEED_SAMPLE` on internal org |

---

## Readiness gates

| Gate | Status |
|------|--------|
| Platform PAT | ✅ PASSED |
| E2E regression | ✅ 110/110 |
| Load capacity | ✅ 7/7 |
| Internal tenant policy (code) | ✅ `tenant-policy.js` |
| Internal tenant config (VPS) | 🟡 Run `ops:configure-internal-tenant` |
| Pilot #1 customer | ✅ `first-customer` live |
| Razorpay live billing | ⏸ Deferred |
| 50-customer acquisition plan | 📋 See 90-day plan |

---

## Escalation

| Severity | Response |
|----------|----------|
| P0 — data leak, auth bypass | Stop acquisitions, rollback, 4h fix |
| P1 — CRM down for all tenants | Hotfix 24h |
| P2 — single-module cosmetic | Next sprint |

---

## Related documents

- [`90_DAY_CUSTOMER_ACQUISITION_PLAN.md`](./90_DAY_CUSTOMER_ACQUISITION_PLAN.md)
- [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md)
- [`GA_PILOT_SIGNOFF.md`](./GA_PILOT_SIGNOFF.md)
- [`LAUNCH_WAR_ROOM.md`](./LAUNCH_WAR_ROOM.md)
