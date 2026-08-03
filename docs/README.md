# AsoftechInsightz — Documentation index

This folder contains **everything a developer needs** to integrate, deploy and operate AsoftechInsightz.

## API

| File | Purpose |
|---|---|
| [`openapi.json`](./openapi.json)                 | OpenAPI 3.1 spec — import into Swagger Editor / Stoplight / Insomnia |
| [`postman-collection.json`](./postman-collection.json) | Postman v2.1 collection with auto-populated tokens |
| [`auth-flow.md`](./auth-flow.md)                 | Mermaid sequence diagrams for OTP / password / refresh flows |
| [`error-codes.md`](./error-codes.md)             | Canonical error code matrix |
| [`MOBILE_API_GUIDE.md`](./MOBILE_API_GUIDE.md)   | Quick-start with Kotlin / Swift / React-Native SDK snippets |

## Database

| File | Purpose |
|---|---|
| [`sql/01_schema.sql`](./sql/01_schema.sql)       | PostgreSQL DDL — 14 tables, triggers, FKs |
| [`sql/02_indexes.sql`](./sql/02_indexes.sql)     | All indexes incl. trigram for full-text search |
| [`sql/03_seed.sql`](./sql/03_seed.sql)           | Permissions, plans, products, system tenant, super-admin |
| [`sql/init-db.sh`](./sql/init-db.sh)             | One-shot creator (run as `postgres` user) |
| [`sql/utility-queries.sql`](./sql/utility-queries.sql) | DPDP erasure, table stats |

## Deployment

| File | Purpose |
|---|---|
| [`POSTGRES_DEPLOYMENT.md`](./POSTGRES_DEPLOYMENT.md) | Postgres install on Ubuntu, tuning, backup, restore |
| [`nginx.conf`](./nginx.conf)                     | Nginx reverse-proxy + TLS + rate-limiting |
| [`SECURITY_HARDENING.md`](./SECURITY_HARDENING.md)| SSH, UFW, Fail2ban, app-layer hardening |
| [`POST_DEPLOY_CHECKLIST.md`](./POST_DEPLOY_CHECKLIST.md) | 50-item go-live checklist |
| Root `DEPLOYMENT.md` (already in repo)           | Master deployment guide — Docker Compose path |
| Root `deploy.sh` (already in repo)               | One-shot VPS bootstrapper (Phases 2–7) |
| Root `.github/workflows/deploy.yml`              | GitHub Actions CI/CD on push to main |
| Root `n8n/*.json`                                 | 4 ready-to-import n8n workflows |

## Customer Success & GTM

| File | Purpose |
|---|---|
| [`customer-success/PO_CUSTOMER_READINESS_REPORT.md`](./customer-success/PO_CUSTOMER_READINESS_REPORT.md) | Executive readiness decision |
| [`customer-success/CUSTOMER_ONBOARDING_KIT.md`](./customer-success/CUSTOMER_ONBOARDING_KIT.md) | Tenant onboarding |
| [`customer-success/`](./customer-success/) | Sales, CS, marketing, training, KPI guide (18 files) |
| [`aeo/post-deployment/`](./aeo/post-deployment/) | AEO pilot validation + 30-day plans |

## Strategy & roadmap

| File | Purpose |
|---|---|
| [`strategy/LEADEDGE360_STRATEGIC_ASSESSMENT.md`](./strategy/LEADEDGE360_STRATEGIC_ASSESSMENT.md) | CPO assessment, gaps, maturity scores |
| [`strategy/LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md`](./strategy/LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md) | Top 100, v2–v5 roadmap, AI agents |
| [`strategy/LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md`](./strategy/LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md) | BG OS architecture, 20-section execution plan |
| [`strategy/LEADEDGE360_PLATFORM_CURRENT_STATE.md`](./strategy/LEADEDGE360_PLATFORM_CURRENT_STATE.md) | **Repository inventory (read-only, no roadmap)** |
| [`strategy/LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md`](./strategy/LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md) | **Enterprise strategy, matrices, backlog (no code)** |
| [`strategy/LEADEDGE360_ENGINEERING_EXECUTION_PROGRAM.md`](./strategy/LEADEDGE360_ENGINEERING_EXECUTION_PROGRAM.md) | **Engineering execution program — epics, stories, checklists** |

### Engineering — Sprint 0 readiness

| Doc | Purpose |
|-----|---------|
| [`engineering/SPRINT0_REPOSITORY_VALIDATION.md`](./engineering/SPRINT0_REPOSITORY_VALIDATION.md) | Repo structure, build, deps, docker, CI |
| [`engineering/SPRINT0_ARCHITECTURE_VALIDATION.md`](./engineering/SPRINT0_ARCHITECTURE_VALIDATION.md) | Routes, auth, data flows (read-only) |
| [`engineering/SPRINT0_REUSE_CATALOG.md`](./engineering/SPRINT0_REUSE_CATALOG.md) | Reusable assets for epics |
| [`engineering/SPRINT0_TECH_DEBT.md`](./engineering/SPRINT0_TECH_DEBT.md) | Prioritized debt register |
| [`engineering/SPRINT1_EXECUTION_READY.md`](./engineering/SPRINT1_EXECUTION_READY.md) | E-001–E-004 readiness |

### Engineering — Sprint 1 technical design

| Doc | Purpose |
|-----|---------|
| [`engineering/design/SPRINT1_TECHNICAL_DESIGN_OVERVIEW.md`](./engineering/design/SPRINT1_TECHNICAL_DESIGN_OVERVIEW.md) | Program overview, merge order, PO decisions |
| [`engineering/design/E-002_COOKIE_JWT_BRIDGE_DESIGN.md`](./engineering/design/E-002_COOKIE_JWT_BRIDGE_DESIGN.md) | E-002 full design package |
| [`engineering/design/E-003_SERVER_AEO_PROFILE_DESIGN.md`](./engineering/design/E-003_SERVER_AEO_PROFILE_DESIGN.md) | E-003 full design package |
| [`engineering/design/E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md`](./engineering/design/E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md) | E-004 full design package |
