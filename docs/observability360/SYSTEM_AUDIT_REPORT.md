# Observability360 — System Audit Report

**Product:** AsoftechInsightz Observability360  
**Audit date:** 3 July 2026  
**Auditor role:** Lead Solution Architect (Phase 1 — audit only)  
**Repositories audited:** `asoftech-insightz` (primary), `Observability360` (Trinetra360 reuse), `360` (empty)

---

## 1. Executive Summary

| Item | Finding |
|------|---------|
| **Primary codebase** | `asoftech-insightz` — Next.js 14 SaaS monolith (LeadEdge360 + RetailEdge360) |
| **Observability360 status** | **Planned, not built** — route `/observability360` in design tokens only |
| **Reusable platform** | `Observability360` (Trinetra360) — full discovery, CMDB, OTLP observability stack (Phases 1–4 complete) |
| **Recommendation** | **Refactor + integrate** Trinetra360 services into Business Suite; do not rewrite from scratch |

---

## 2. Project Structure

```
asoftech-insightz/
├── app/                    # Next.js 14 App Router (74 pages, 226+ API routes)
├── components/             # 19 domain component folders + design-system
├── lib/                    # 40+ domain modules (261 files)
├── scripts/                # Deploy, QA, backup, certification, indexes
├── docs/                   # Operations, audit, OpenAPI, monitoring
├── infra/                  # Prometheus, Grafana, Nginx, Caddy, PM2
├── database/               # Migrations, schemas (reference)
├── e2e/                    # Playwright enterprise + smoke tests
├── tests/                  # Unit tests (24 files)
├── mobile/                 # Flutter companion app
├── middleware.js           # Edge rate limit + auth host redirect
├── Dockerfile              # Node 20 Alpine, standalone Next.js
└── docker-compose*.yml     # App, prod blue/green, monitoring
```

**Related:** `Observability360/` — monorepo with 12 microservices, NestJS gateway, Next.js web UI.

**Empty:** `360/` — placeholder directory, no code.

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20 |
| Framework | Next.js | 14.2.35 |
| UI | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.1 |
| Primary DB | MongoDB | 7 (driver 6.6.0) |
| Secondary DB | PostgreSQL (`pg`) | ^8.21.0 — **unused at runtime** |
| Cache | Redis | Optional in Docker — **not wired in app code** |
| Auth | JWT (HS256) + refresh tokens | jsonwebtoken ^9.0.3 |
| Payments | Razorpay | ^2.9.6 |
| Validation | Zod | 3.25.67 (limited use in API routes) |
| Charts | Recharts | 2.15.3 |
| E2E | Playwright | ^1.49.1 |
| Monitoring | Prometheus + Grafana | v2.54 / 11.2 |
| Package manager | Yarn | lockfile present |

**Trinetra360 stack (reuse candidate):** NestJS, Express microservices, PostgreSQL, Neo4j, Kafka, Python AI agents, OpenTelemetry.

---

## 4. Installed Packages (key)

**Production:** next, react, mongodb, axios, bcryptjs, jsonwebtoken, razorpay, nodemailer, zod, recharts, @tanstack/react-query, pg (dead weight).

**Dev:** @playwright/test, tailwindcss, postcss, mongodb-memory-server.

---

## 5. Docker Configuration

| File | Purpose |
|------|---------|
| `docker-compose.yml` | app + mongo:7; optional redis profile; n8n sidecar |
| `docker-compose.prod.yml` | Blue/green app, nginx TLS, redis |
| `docker-compose.monitoring.yml` | Prometheus, Grafana, node-exporter, cAdvisor, redis-exporter |
| `Dockerfile` | Multi-stage build, port 3000, standalone output |

---

## 6. Environment Variables

See `.env.example` — groups: Mongo, URLs/CORS, JWT/auth, pilot provisioning, Google/Meta, n8n/agents, Razorpay, Redis, monitoring, backups, SMTP/SMS, feature flags.

**Gap:** `METRICS_TOKEN` used in monitoring runbook but missing from `.env.example`.

---

## 7. Build Process

```bash
yarn build          # Next.js production build (standalone)
yarn test:unit      # Node unit tests
yarn test:e2e       # Playwright
yarn cert:go-live   # Certification suite
```

CI (`.github/workflows/ci.yml`): Node 20, yarn build, unit tests, Mongo bootstrap, E2E on push/PR.

---

## 8. Deployment Process

| Target | Mechanism |
|--------|-----------|
| VPS production | `scripts/ops/deploy-production.sh` — blue/green Docker |
| Sprint deploys | `scripts/vps-sprint-deploy.mjs` (s0–s6) |
| Monitoring | `scripts/ops/deploy-monitoring.sh` |
| Domain | `app.asoftechinsightz.com` |
| SSL | Let's Encrypt via nginx volume |

---

## 9. Existing APIs (summary)

**226 dedicated** `app/api/**/route.js` files + **legacy catch-all** `app/api/[[...path]]/route.js` (~2,700 LOC).

**Namespaces:** auth, leads, crm, campaigns, revenue, growth, qr, retail, agents, platform, integrations, marketing-engine, scanner, portal, partners, metrics, health, analytics, whatsapp, ai, subscriptions, privacy, onboarding.

**Observability-adjacent today:**
- `GET /api/metrics` — Prometheus exposition
- `GET /api/agents/observability` — agent metrics
- `GET /api/health/live`, `/api/health/ready`
- Ops UI: `/ops/events`, `/ops/ai-analytics`, `/ops/ai-timeline`

**Not present:** Discovery, CMDB, OTLP ingestion, distributed tracing, log analytics, topology APIs.

---

## 10. Existing UI Pages (summary)

74 pages — marketing, auth, suite CRM, LeadEdge360, RetailEdge360, growth tools, portal, partners, ops.

**Planned only:** `/observability360` (design tokens — `status: planned`).

---

## 11. Authentication

| Component | Path | Status |
|-----------|------|--------|
| JWT access/refresh | `lib/jwt.js` | Production-ready |
| Tenant resolution | `lib/tenant.js` | JWT → cookie → demo org |
| RBAC | `lib/rbac.js`, `lib/billing/check-role.js` | 6 roles |
| API guards | `lib/*/api-helpers.js` | Per-domain |
| Edge rate limit | `middleware.js` | Auth routes 40/min/IP |
| Portal auth | `lib/portal/*` | Separate surface |

---

## 12. Database Schema

**Runtime:** MongoDB only — 100+ collections, tenant key `orgId`, business ID `id` (UUID).

**Reference SQL:** `docs/sql/*.sql` — not used at runtime.

**Indexes:** `scripts/mongo-indexes.mjs` — 120 indexes across 52 collections.

---

## 13. Services / lib Modules

40+ domain modules under `lib/`: auth, billing, crm, leads, campaigns, growth, qr, retail, integrations, agents, events, audit, marketing-engine, whatsapp, ai, portal, security, etc.

**No:** discovery, cmdb, topology, otlp, trace, log-analytics services in this repo.

---

## 14. Middleware

| Layer | File |
|-------|------|
| Next.js edge | `middleware.js` |
| API guards | `lib/*/api-helpers.js` |
| Audit | `middleware/auditLog.js` |

---

## 15. Cron / Scheduled Jobs

| Job | Trigger |
|-----|---------|
| Mongo backup | VPS cron via `scripts/ops/install-backup-cron.sh` |
| Integration sync | `POST /api/integrations/scheduler/run` + `CRON_SECRET` |
| n8n workflows | Docker sidecar |

No in-process `node-cron` in application code.

---

## 16. Integrations

**Built:** Razorpay, WhatsApp webhooks, Google OAuth, Meta, Gmail/M365/Calendar (Integration Center), n8n, SMTP/MSG91.

**Planned (docs):** Slack, Teams, Zapier, Tally, Zoho Books (Phase 3–4 integration roadmap).

---

## 17. Reusable Modules (Trinetra360 / Observability360)

| Module | Trinetra360 path | Reuse for Observability360 |
|--------|------------------|---------------------------|
| Discovery Engine | `services/discovery/` | **Critical — port or API-integrate** |
| CMDB | `services/cmdb/` | **Critical** |
| Observability (OTLP) | `services/observability/` | **Critical** |
| Digital Twin / Topology | `apps/web` `/twin` + Neo4j | Sprint 4 |
| Transactions | `services/transactions/` | Sprint 7 (Banking360) |
| Security / SIEM | `services/security/` | Phase 2+ |
| Analytics / Predictive | `services/analytics/` | AI Copilot alignment |
| API Gateway | `apps/api-gateway/` | Unified API surface |
| Platform config | `packages/platform-config/` | SaaS/Hybrid/On-prem |

**Status:** Trinetra360 v0.4.0 — Phases 1–4 complete per `Observability360/docs/PROJECT_STATUS.md`.

---

## 18. Technical Debt (high level)

1. Legacy API catch-all (`[[...path]]`) — 2,700 LOC, inconsistent auth
2. `pg` dependency unused — remove or justify
3. Redis in Docker but not consumed by app
4. CORS `*` on API routes
5. OpenAPI shallow schemas (~256 paths, minimal request/response models)
6. Duplicate auth routes (`/login` vs `/signin`)
7. Observability360 product surface missing entirely
8. Two parallel codebases (Suite vs Trinetra360) — consolidation required

---

## 19. Existing Audit Artifacts (reference)

| Document | Date | Scope |
|----------|------|-------|
| `PLATFORM_AUDIT_REPORT.md` | Jun 2026 | Business Suite |
| `DATABASE_REVIEW.md` | Jun 2026 | Mongo schema |
| `API_REVIEW.md` | Jun 2026 | API standards |
| `GAP_ANALYSIS_REPORT.md` | Jun 2026 | Growth modules |
| `ARCHITECTURE_REVIEW.md` | Jun 2026 | Solution architecture |
| `SECURITY_AUDIT_REPORT.md` | Jun 2026 | Security RC |

This Observability360 audit **supersedes none** of the above; it adds the observability product lens.

---

## 20. Audit Conclusion

**Do not write new Observability360 features in isolation inside the Next.js monolith.**

**Recommended path:**
1. Complete Phase 1 audits (this document set)
2. Approve gap analysis and architecture
3. Integrate Trinetra360 microservices behind API gateway OR embed as workspace package
4. Build Observability360 UI shell in `asoftech-insightz` consuming unified APIs
5. Banking360 as industry pack on top (Sprint 8)

**Next deliverable:** `GAP_ANALYSIS.md`, `ARCHITECTURE.md`, `SPRINT_PLAN.md` (Observability360 track).
