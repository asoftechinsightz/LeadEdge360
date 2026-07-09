# Observability360 — Database Audit

**Date:** 3 July 2026  
**Primary store:** MongoDB (`MONGO_URL`, `DB_NAME`)  
**Reference SQL:** `docs/sql/` (not runtime)  
**Reuse candidate:** PostgreSQL schema in `Observability360/database/migrations/`

---

## 1. Connection Pattern

| File | Role |
|------|------|
| `lib/mongo.js` | Runtime singleton `getDb()` |
| `lib/mongo-connect.js` | Scripts, Docker host rewrite, validation |
| `lib/tenant.js` | Resolves `orgId` from JWT/session |

**Tenant key:** `orgId` (UUID string) on all business collections.

---

## 2. Collection Inventory (~100+)

### Tenancy & Auth
| Collection | Purpose | Indexes |
|------------|---------|---------|
| `orgs` | Organizations | Via users |
| `users` | Users, roles, credentials | Unique `email` |
| `auth_refresh_tokens` | Refresh token hashes | TTL-style cleanup |
| `auth_otps`, `auth_otp_rate_limits` | OTP flow | Rate limit keys |
| `auth_login_attempts`, `auth_login_anomalies` | Brute-force tracking | Compound orgId |

### CRM / Sales
| Collection | Purpose | Relationships |
|------------|---------|---------------|
| `leads` | Lead records | → territories, assignments, timeline |
| `lead_timeline`, `lead_notes`, `lead_tasks` | Activity | `leadId`, `orgId` |
| `opportunities` | Pipeline | → proposals |
| `proposals`, `proposal_items` | Quotes | → customers |
| `customers` | Accounts | → invoices, portal |
| `territories` | Sales territories | → leads |

### Marketing & Growth
| Collection | Purpose |
|------------|---------|
| `campaigns`, `campaign_executions` | Campaign runs |
| `business_cards` | Digital cards | Unique `slug` |
| `qr_codes`, `qr_events`, `qr_conversions` | QR tracking |
| `review_campaigns`, `review_requests` | Reputation |
| `scanner_results`, `scanner_jobs` | Website scanner |

### Revenue & Billing
| Collection | Purpose |
|------------|---------|
| `subscriptions`, `subscription_plans` | SaaS billing |
| `invoices`, `payments` | Revenue |
| `webhook_events` | Razorpay events |

### Platform / Agents / Events
| Collection | Purpose |
|------------|---------|
| `platform_events` | Event bus persistence |
| `audit_logs`, `audit_log_chain` | Immutable audit |
| `agent_tasks`, `agent_memory`, `agent_tool_calls` | AI agents |
| `org_integrations`, `integration_sync_jobs` | Integration Center |

### Retail (foundation)
| Collection | Purpose |
|------------|---------|
| `retail_stores`, `retail_products`, `retail_inventory`, `retail_sales` | RetailEdge360 |

### **Missing for Observability360**
| Required collection / table | Status |
|----------------------------|--------|
| `configuration_items` (CMDB) | ❌ Not in Mongo — exists in Trinetra360 PostgreSQL |
| `relationships` (topology) | ❌ |
| `discovery_connectors` | ❌ |
| `network_flows` | ❌ |
| `telemetry_metrics` / OTLP store | ❌ (only Prometheus app metrics) |
| `distributed_traces` | ❌ |
| `log_entries` (searchable) | ❌ |
| `alerts` (observability) | ❌ |

---

## 3. Index Audit (`scripts/mongo-indexes.mjs`)

**Total:** 120 index definitions across **52 collections**.

| Quality | Assessment |
|---------|------------|
| Tenant scoping | ✅ Most compound indexes lead with `orgId` |
| Unique constraints | ✅ email, slug, qr code, review token |
| Sparse indexes | ✅ Optional fields |
| **Gap** | Event/agent collections heavily indexed; no observability telemetry indexes |

**Performance risk:** Collections without indexes in `mongo-indexes.mjs` may still exist (marketing engine creates own indexes).

---

## 4. Normalization & Data Quality Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| Duplicate org concepts | Medium | `orgs` vs script references to `organizations` |
| Legacy `products` vs `retail_products` | Low | Retail migration incomplete |
| Embedded vs referenced | Medium | Mixed patterns across modules |
| No CMDB graph | **Critical** | Cannot model infrastructure dependencies |
| SQL reference unused | Low | `docs/sql/` creates confusion |
| `pg` package unused | Low | Dead dependency |

---

## 5. Trinetra360 PostgreSQL Schema (reuse)

**Path:** `Observability360/database/migrations/`

| Table | Purpose | Reuse priority |
|-------|---------|----------------|
| `configuration_items` | CMDB CIs (17 types) | **P0** |
| `relationships` | Graph edges | **P0** |
| `discovery_connectors` | Connector config | **P0** |
| `business_services`, `service_maps` | Service mapping | P1 |
| `network_flows` | NetFlow/IPFIX | P1 |
| `business_transactions` | Transaction monitoring | P1 (Banking360) |
| `alerts` | Alert store | P1 |
| `compliance_*` | Compliance engine | P2 |
| `predictive_forecasts` | AI analytics | P2 |

**Recommendation:** Deploy PostgreSQL alongside Mongo for Observability360 domain OR federate to Trinetra360 services via API.

---

## 6. Backup & Retention

| Mechanism | Path |
|-----------|------|
| Daily/weekly/monthly | `scripts/ops/backup-schedule.sh` |
| Restore | `scripts/mongo-restore.sh` |
| DR log | `dr_recovery_log` collection |

Mongo backup does **not** cover Trinetra360 PostgreSQL — separate procedure required if integrated.

---

## 7. Database Audit Conclusion

| Area | Score | Action |
|------|-------|--------|
| CRM/Marketing data model | 85% | Maintain — no breaking changes |
| Index coverage | 80% | Run indexes on all envs |
| Observability data model | 5% | Import Trinetra360 schema |
| Multi-tenant isolation | 75% | Fix remaining analytics/catalog gaps |
| Normalization | 70% | Document canonical collections |

**Priority:** Add Observability360 data plane (PostgreSQL from Trinetra360) without migrating existing Mongo CRM data.
