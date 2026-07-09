# Observability360 — API Audit

**Date:** 3 July 2026  
**Total route files:** 226 dedicated + 1 legacy catch-all  
**OpenAPI:** `docs/openapi.yaml` (~256 paths, shallow schemas)

---

## 1. API Architecture

| Pattern | Status |
|---------|--------|
| Dedicated `app/api/*/route.js` | ✅ Growing (226 files) |
| Legacy catch-all | ⚠️ ~2,700 LOC — technical debt |
| Service layer (`lib/*/service.js`) | ✅ Standard for new modules |
| Guard helpers (`guard*Request`) | ✅ Per domain |
| Plan/feature gating | ✅ `hasFeatureForOrg`, `requirePlan` |
| Validation | ⚠️ Mostly manual throws, limited Zod |
| Error format | `{ code, message }` per API_REVIEW standards |

---

## 2. Authentication Matrix

| Guard | Used by | Security |
|-------|---------|----------|
| `guardCrmRequest` | CRM, leads | ✅ Auth + RBAC |
| `guardGrowthRequest` | Growth, QR, cards | ✅ Auth + plan + feature |
| `guardIntegrationRead/Admin` | Integrations | ✅ |
| `guardRevenueRequest` | Billing | ✅ |
| `resolveTenant` only | Some analytics (fixed in S0) | ⚠️ Verify all routes |
| Public | `/api/public/*`, webhooks | ✅ By design |
| `METRICS_TOKEN` | `/api/metrics` | ✅ Optional bearer |
| `CRON_SECRET` | Scheduler | ✅ Header auth |

---

## 3. Endpoint Inventory by Domain

| Domain | Routes | Observability360 relevance |
|--------|--------|---------------------------|
| `health` | 2 | ✅ Reuse pattern |
| `metrics` | 1 | ✅ App metrics only |
| `agents/observability` | 1 | Partial — agent metrics |
| `platform` | 12 | Events, AI ops |
| `integrations` | 11 | Connector pattern reuse |
| `analytics` | 3 | Executive analytics — not infra |
| `scanner` | 11 | External scan — not discovery |
| **discovery** | 0 | ❌ Required |
| **cmdb** | 0 | ❌ Required |
| **observability/otlp** | 0 | ❌ Required |
| **topology/twin** | 0 | ❌ Required |
| **alerts** | 0 | ❌ Required |

---

## 4. Sample API Audit Rows

### Authentication — `POST /api/auth/login`
| Field | Value |
|-------|-------|
| Method | POST |
| Auth | Public |
| Validation | Email/password manual |
| Response | JWT + refresh cookie |
| Performance | Mongo lookup + bcrypt |
| Security | Rate limited (middleware + Mongo) |
| Swagger | Listed |
| Reusable | **YES** — Production ready |

### Leads — `GET /api/leads`
| Field | Value |
|-------|-------|
| Method | GET |
| Auth | `guardCrmRequest` |
| Validation | Query pagination |
| Response | `{ items, page, limit, total }` |
| Performance | Indexed on `orgId` |
| Security | Tenant-scoped |
| Swagger | Listed |
| Reusable | **YES** |

### Metrics — `GET /api/metrics`
| Field | Value |
|-------|-------|
| Method | GET |
| Auth | Optional `METRICS_TOKEN` / IP allowlist |
| Response | Prometheus text format |
| Performance | In-memory counters |
| Security | ✅ Restricted in nginx |
| Swagger | Partial |
| Reusable | **YES** — extend for Observability360 exporters |

### Legacy catch-all — `app/api/[[...path]]/route.js`
| Field | Value |
|-------|-------|
| Methods | GET/POST/PUT/DELETE |
| Auth | **Inconsistent** |
| Validation | Mixed |
| Security | **Risk** — certified paths frozen |
| Recommendation | **Do not extend** — migrate to dedicated routes |

---

## 5. Trinetra360 APIs (reuse via gateway)

**Base:** `http://localhost:4000/api/v1` (production: `api.trinetra360.example.com`)

| Domain | Endpoints | Status |
|--------|-----------|--------|
| Discovery | `/discovery/scan`, `/connectors` | ✅ Built |
| CMDB | `/cmdb/cis`, `/stats`, relationships | ✅ Built |
| Observability | `/observability/v1/metrics|logs|traces` | ✅ OTLP JSON |
| Twin | `/twin/graph` | ✅ Built |
| Transactions | `/transactions/*` | ✅ Built |
| Security | `/security/*` | ✅ Built |
| Analytics | `/analytics/forecasts` | ✅ Built |
| Executive | `/executive/kpis` | ✅ Built |

**Integration pattern:** Proxy from `asoftech-insightz` Next.js API routes OR shared API gateway subdomain.

---

## 6. Swagger / OpenAPI Coverage

| Metric | Value |
|--------|-------|
| OpenAPI version | 3.0.3 |
| Paths documented | ~256 |
| Request schemas | Minimal |
| Response schemas | `Error`, `PaginatedList` only |
| Coverage vs implementation | ~60% route inventory, ~15% contract depth |

**Action:** Generate OpenAPI from Trinetra360 gateway (NestJS Swagger) and merge into Observability360 spec.

---

## 7. Unused / Deprecated APIs

| Item | Recommendation |
|------|----------------|
| Catch-all duplicates | Audit against dedicated routes; deprecate gradually |
| `lib/auth.js` Emergent stub | Remove or document as noop |
| Legacy `/login` page vs `/signin` | Consolidate |

---

## 8. API Audit Conclusion

| Category | Score | Priority |
|----------|-------|----------|
| CRM/Growth APIs | 90% | Maintain |
| Auth APIs | 88% | Maintain |
| Platform health/metrics | 75% | Extend |
| Observability APIs | 0% | **Critical — import Trinetra360** |
| OpenAPI quality | 40% | Sprint 1 cleanup |
| Security consistency | 72% | Finish S0 tenant fixes |

**No new Observability360 APIs should be invented in the monolith** until architecture approves gateway integration pattern.
