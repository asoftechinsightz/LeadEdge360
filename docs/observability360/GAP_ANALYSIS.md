# Observability360 — Gap Analysis

**Date:** 3 July 2026  
**Updated:** 3 July 2026 — standalone product model  
**Current:** `Observability360` v0.4.0 (backend largely built); Business Suite = LeadEdge + Retail only  
**Target:** Standalone Observability360 GA with Banking360 first industry pack

---

## Gap Matrix

| Module | Current | Required | Gap | Priority | Source |
|--------|---------|----------|-----|----------|--------|
| **Authentication** | Gateway JWT (Trinetra) | Standalone Obs360 auth UI | Login/signup pages | Medium | `apps/web` + gateway |
| **RBAC** | Gateway roles | Production RBAC | Policy polish | Low | `apps/api-gateway` |
| **Organizations** | PG `tenants` | Multi-tenant SaaS | Onboarding flow | Medium | PostgreSQL |
| **Multi-tenancy** | `tenant_id` in PG | Isolated tenants | Smoke tests | Medium | Existing migrations |
| **API Gateway** | NestJS :4000 | Production gateway | Hardening, rate limits | Medium | `apps/api-gateway` |
| **Discovery Engine** | Built | Enterprise | Agent lifecycle UI | High | `services/discovery` |
| **Agent Management** | Partial | Full lifecycle | Deploy, health, upgrade | High | Sprint 2 |
| **CMDB** | Built | Live CMDB | UI completeness | Medium | `services/cmdb` |
| **Topology** | `/twin` page | Digital twin | Graph depth | High | `apps/web` |
| **Infrastructure Monitoring** | Service exists | Full stack | Dashboard polish | High | `services/observability` |
| **Application Monitoring** | OTLP ingest | APM | Service map UI | High | Sprint 6 |
| **Log Analytics** | OTLP logs | Search + tail | OpenSearch UI | High | Sprint 6 |
| **Distributed Tracing** | OTLP traces | End-to-end | Trace explorer | High | Sprint 6 |
| **Alerting** | Alerts table | Alert rules + ack | Notification channels | High | Sprint 5 |
| **AI Copilot** | Agents service | Full copilot | Unified panel | Medium | Sprint 9 |
| **Executive Dashboard** | Built | CIO/CISO view | KPI polish | Medium | `apps/web` |
| **Compliance** | Built | Continuous | Evidence UI | Medium | `services/compliance` |
| **Banking360** | Industry pack seed | BFSI GA | Dashboard templates | High | Sprint 8 |
| **Product UI** | Trinetra web → Obs360 brand | Full product | Auth + marketing | Medium | Sprint 1 |
| **Product integration** | ~~Suite merge~~ | **Standalone** | ~~Critical~~ **N/A** | — | **Cancelled** |
| **Deployment** | Docker dev | SaaS/Hybrid/On-prem prod | `docker-compose.prod` | High | Sprint 1 |

---

## Priority Summary

| Priority | Count | Modules |
|----------|-------|---------|
| **Critical** | 3 | Discovery agents, log/trace UI, production deploy |
| **High** | 10 | Topology, monitoring, alerting, Banking360 |
| **Medium** | 12 | Auth UI, AI, compliance, licensing |
| **Low** | 2 | RBAC polish, gateway hardening |

---

## Technical Debt vs Net-New

| Work type | Effort share | Approach |
|-----------|--------------|----------|
| **Reuse Observability360 as-is** | 55% | Already built — polish UI |
| **Standalone product shell** | 15% | Auth, marketing, deploy |
| **Net-new** | 20% | Agent UI, log viewer, alert channels |
| **Refactor debt** | 10% | CORS, Redis, E2E tests |

---

## Industry Pack Gaps

| Pack | Observability360 | Gap |
|------|----------------|-----|
| Banking360 | Industry pack + transactions | RBI dashboards (Sprint 8) |
| Retail360 (obs) | — | Store infra templates |
| Manufacturing360 | OT connectors | OT safety UI |
| Healthcare360 | HIPAA frameworks | PHI policies |
| Government360 | FedRAMP governance | Data residency UI |
| Telecom360 | Network flows | NetFlow dashboards |

---

## Risk-Adjusted Gap Closure Plan

1. **Do not rebuild** discovery, CMDB, OTLP — use `Observability360` (closes ~55% gap)
2. **Standalone auth** — gateway JWT + web login (no Suite dependency)
3. **Separate deploy** — `observability360.asoftechinsightz.com` + own Docker stack
4. **Banking360** — BFSI industry pack + transaction dashboards (Sprint 8)
5. **Production** — backup, pen test, HA smoke (Sprint 10)

---

## Gap Analysis Conclusion

| Metric | Value |
|--------|-------|
| Backend readiness (Observability360) | **~78%** |
| Standalone product readiness (UI + deploy) | **~45%** |
| Banking360 readiness | **~35%** (after core obs sprints) |
| Estimated calendar to GA | **10 sprints** — `Observability360/SPRINT_PLAN.md` |

**Recommendation:** Execute Sprint 1 in `Observability360` per [ARCHITECTURE.md](./ARCHITECTURE.md) v2.0.
