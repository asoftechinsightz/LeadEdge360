# Observability360 — Architecture (Standalone Product)

**Version:** 2.0  
**Date:** 3 July 2026  
**Status:** Approved direction — **separate product, no Suite merge**

---

## 1. Architecture principles

1. **Standalone product** — Observability360 is not embedded in LeadEdge360 or RetailEdge360
2. **Reuse Trinetra360 engine** — `Observability360` monorepo is the single source of truth
3. **API-first** — REST + OTLP at the Observability360 gateway
4. **Multi-topology** — SaaS, Hybrid, On-prem via `DEPLOYMENT_MODE`
5. **Industry packs** — Banking360, Retail360, etc. as Observability360 modules only
6. **Sibling products** — CRM/retail remain in `asoftech-insightz` with zero runtime coupling

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Client Layer                                      │
│  Browser · Mobile · OTLP Collectors · Discovery Agents · Webhooks        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Observability360 Web (Next.js) :3000                        │
│  Marketing · Sign-in · Dashboards · Industry packs · AI copilot         │
│  Own JWT session · tenant_id · RBAC                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         Observability360 API Gateway (NestJS) :4000                    │
│  Auth · Tenant resolution · Cache · OpenAPI · Rate limit · OTLP proxy   │
└─────────────────────────────────────────────────────────────────────────┘
          │              │              │              │              │
          ▼              ▼              ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │Discovery │  │   CMDB   │  │Observ-   │  │Transact- │  │ Security │
    │  :4001   │  │  :4002   │  │ability   │  │  ions    │  │  :4006   │
    └──────────┘  └──────────┘  │  :4003   │  │  :4005   │  └──────────┘
                                └──────────┘  └──────────┘
          │              │              │              │
          ▼              ▼              ▼              ▼
    ┌─────────────────────────────────────────────────────────┐
    │ Compliance · Remediation · Analytics · Quantum ·         │
    │ Governance · AI Agents (:4004–:4010, :5000)              │
    └─────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Data Layer (Observability360 only)                │
│  PostgreSQL · Neo4j · Redis · Kafka · OpenSearch · Prometheus          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Sibling products (separate deploy — no shared runtime)                  │
│  LeadEdge360 / RetailEdge360 — Next.js + MongoDB — asoftech-insightz    │
└─────────────────────────────────────────────────────────────────────────┘
         Optional future: SSO federation only (not platform merge)
```

---

## 3. What we do NOT do

| Anti-pattern | Reason |
|--------------|--------|
| `/observability360/*` routes inside Business Suite | Couples CRM release cycle to observability |
| `app/api/observability360/[...path]` proxy | Hides gateway; breaks OTLP and WebSocket paths |
| Shared Mongo `orgId` as primary tenant key | Wrong data model for time-series and CMDB |
| Product switcher includes Observability360 | Implies single monolith; use external link instead |
| Duplicate microservices in `asoftech-insightz` | Already built in Observability360 |

---

## 4. Module ownership

| Module | Location | Notes |
|--------|----------|-------|
| Auth & orgs | `apps/api-gateway` + `apps/web` | Standalone user/tenant tables in PostgreSQL |
| Discovery | `services/discovery` | Agents, K8s, AWS, SNMP, OT connectors |
| CMDB | `services/cmdb` | CIs, relationships, impact |
| Observability | `services/observability` | Metrics, logs, traces, network |
| Transactions | `services/transactions` | Business flow monitoring |
| Security | `services/security` | Fraud, SIEM, anomalies |
| Compliance | `services/compliance` | Frameworks + industry packs |
| AI agents | `ai-agents/` | LangGraph RCA, recommendations |
| Platform config | `packages/platform-config` | SaaS / Hybrid / On-prem |

---

## 5. Authentication

**Default (GA):** Observability360-native auth

- Users and organizations stored in PostgreSQL (`tenants`, `users` migrations)
- JWT issued by Observability360 gateway
- RBAC roles: `admin`, `operator`, `viewer`, `auditor`

**Optional (post-GA):** Enterprise SSO

- OIDC/SAML IdP — same email across products, **separate sessions**
- No requirement to read LeadEdge360 Mongo user collection

---

## 6. Deployment topology

| Mode | Web | Gateway | Data |
|------|-----|---------|------|
| **SaaS** | `observability360.asoftechinsightz.com` | `api.observability360...` | Managed Postgres + Redis |
| **Hybrid** | Cloud UI | Customer VPC gateway | Data plane on-prem |
| **On-prem** | Customer domain | Customer LAN | Full stack local |

Nginx terminates TLS; Docker Compose profiles `core` and `full`.

See `Observability360/docs/DEPLOYMENT-TOPOLOGY.md`.

---

## 7. Marketing cross-link (asoftech-insightz)

The Business Suite site may host a **marketing page** at `/products/observability360` that:

- Describes the product
- Links to `https://observability360.asoftechinsightz.com` for sign-up
- Captures leads into existing `marketing/leads` API with `product: observability360`

No observability dashboards or APIs run inside the Suite app.

---

## 8. Banking360 (first industry pack)

Banking360 is an **Observability360** pack:

- BFSI controls in `services/compliance` industry pack
- Transaction templates in `services/transactions`
- Dashboards in `apps/web` under `/compliance` and `/transactions`

Not a LeadEdge360 growth module.

---

## 9. Repository map

| Path | Role |
|------|------|
| `Observability360/` | **Primary codebase** — implement here |
| `360/README.md` | Product entry pointer |
| `asoftech-insightz/docs/observability360/` | Audit + architecture reference |
| `asoftech-insightz/` | LeadEdge + Retail only |

---

## 10. Migration from v1.0 architecture (deprecated)

v1.0 proposed Suite shell + JWT proxy + product switcher. **Superseded by v2.0** per product decision (3 Jul 2026): develop Observability360 as separate product.

Execution plan: `Observability360/SPRINT_PLAN.md`.
