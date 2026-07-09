# AsoftechInsightz — Documentation index

This folder contains **everything a developer needs** to integrate, deploy and operate AsoftechInsightz.

## Enterprise RC3 (Production Operations)

| File | Purpose |
|---|---|
| [`RELEASE_CERTIFICATION.md`](./RELEASE_CERTIFICATION.md) | RC3 GO/NO GO — pilot vs public GA |
| [`MONITORING_RUNBOOK.md`](./MONITORING_RUNBOOK.md) | Prometheus, Grafana, alerts |
| [`LOAD_TEST_PLAN.md`](./LOAD_TEST_PLAN.md) | 1k concurrent user scenarios |
| [`PEN_TEST_CHECKLIST.md`](./PEN_TEST_CHECKLIST.md) | External pen test + OWASP |
| [`ANDROID_RELEASE_RC3.md`](./ANDROID_RELEASE_RC3.md) | Signed APK/AAB pipeline |
| [`ops/deployments/RC3_PRODUCTION_OPS.md`](./ops/deployments/RC3_PRODUCTION_OPS.md) | RC3 sign-off record |
| [`rc3-validation-last-run.json`](./rc3-validation-last-run.json) | Automated RC3 gate output |

Run validation: `npm run test:rc3`  
Post-deploy gate: `npm run production:acceptance` — see [`PRODUCTION_ACCEPTANCE_TEST.md`](./PRODUCTION_ACCEPTANCE_TEST.md)

## Launch War Room (pilot operations)

| File | Purpose |
|---|---|
| [`LAUNCH_WAR_ROOM.md`](./LAUNCH_WAR_ROOM.md) | Technical + business + financial KPI tracker |
| [`LAUNCH_READINESS_MOBILE_SAAS.md`](./LAUNCH_READINESS_MOBILE_SAAS.md) | Mobile + SaaS pilot GO/NO GO |
| [`war-room/latest.json`](./war-room/latest.json) | Latest automated snapshot |
| [`war-room/financial-overrides.json`](./war-room/financial-overrides.json) | Manual financial KPIs |

Run daily: `npm run launch:warroom`

**VPS path:** `/opt/asoftech-insightz` — if `npm run production:acceptance` is missing, sync latest code or run `bash scripts/ops/verify-pat-files.sh`.

## Enterprise RC2 (GA readiness)

| File | Purpose |
|---|---|
| [`RELEASE_CERTIFICATION.md`](./RELEASE_CERTIFICATION.md) | **GO / NO GO** verdict — RC2 pilot vs public GA |
| [`BACKUP_DISASTER_RECOVERY.md`](./BACKUP_DISASTER_RECOVERY.md) | Backup retention, restore drill |
| [`ENTERPRISE_FEATURE_MATRIX.md`](./ENTERPRISE_FEATURE_MATRIX.md) | Web / Mobile / API / DB parity matrix |
| [`API_CONTRACT_REPORT.md`](./API_CONTRACT_REPORT.md) | HTTP contracts, auth, OpenAPI gaps |
| [`DATABASE_VALIDATION.md`](./DATABASE_VALIDATION.md) | Collections, indexes, tenant isolation |
| [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md) | JWT, RBAC, uploads, rate limits |
| [`PERFORMANCE_REPORT.md`](./PERFORMANCE_REPORT.md) | Latency targets and benchmarks |
| [`MOBILE_WEB_GAP_REPORT.md`](./MOBILE_WEB_GAP_REPORT.md) | Web/mobile parity (100% CRM) |
| [`MOBILE_RELEASE_REPORT.md`](./MOBILE_RELEASE_REPORT.md) | Android release checklist |
| [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) | Docker, env, rollback |
| [`../database/migrations/`](../database/migrations/) | Idempotent MongoDB migrations |
| [`rc2-validation-last-run.json`](./rc2-validation-last-run.json) | Automated RC2 validation output |
| [`openapi-build-report.json`](./openapi-build-report.json) | OpenAPI path coverage report |

Run validation: `node scripts/rc2-validation.mjs` or `npm run test:rc2`

## Enterprise RC1 (archive)

Prior RC1 docs and [`rc1-validation-last-run.json`](./rc1-validation-last-run.json) remain for audit trail.

## Frontend V2 (start here)

| File | Purpose |
|---|---|
| **[`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md)** | **Single authoritative reference** for V2 brand, constraints, routes, APIs, phases |
| [`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md) | Component layers, naming, styling, data, and phase delivery rules |
| [`DESIGN_SYSTEM_GUIDE.md`](./DESIGN_SYSTEM_GUIDE.md) | Phase 2 enterprise design system guide |
| [`COMPONENT_LIBRARY.md`](./COMPONENT_LIBRARY.md) | Core component API reference |
| [`DESIGN_TOKENS_REFERENCE.md`](./DESIGN_TOKENS_REFERENCE.md) | Token catalog |
| [`THEME_MIGRATION_PLAN.md`](./THEME_MIGRATION_PLAN.md) | Legacy → themed migration plan |
| [`PHASE2_BUILD_VERIFICATION.md`](./PHASE2_BUILD_VERIFICATION.md) | Phase 2 build/install/dev verification |
| [`docs/screenshots/phase2/`](../screenshots/phase2/) | Phase 2 visual previews |
| [`src/design-tokens/tokens.json`](../src/design-tokens/tokens.json) | Machine-readable design tokens (import via `src/design-tokens/index.js`) |
| [`FRONTEND_V2_MASTER_PLAN.md`](./FRONTEND_V2_MASTER_PLAN.md) | Phase 1 audit archive |
| [`API_INVENTORY.md`](./API_INVENTORY.md) | Detailed API endpoint list (reference) |
| [`ROUTE_INVENTORY.md`](./ROUTE_INVENTORY.md) | Detailed route map (reference) |
| [`COMPONENT_INVENTORY.md`](./COMPONENT_INVENTORY.md) | Component inventory (reference) |
| [`UI_GAP_ANALYSIS.md`](./UI_GAP_ANALYSIS.md) | UI gap analysis (reference) |
| [`MOBILE_READINESS_ASSESSMENT.md`](./MOBILE_READINESS_ASSESSMENT.md) | Mobile readiness (reference) |
| [`RISK_REGISTER.md`](./RISK_REGISTER.md) | Risk register (reference) |

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
