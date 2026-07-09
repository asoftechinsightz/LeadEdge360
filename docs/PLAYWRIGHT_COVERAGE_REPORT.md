# Playwright Coverage Report

**Generated:** 2026-07-02T21:38:08.896Z
**Spec files:** 8
**Modules with E2E flag:** 49 / 49 (100%)
**Last production run:** 106/106 passed (100%)
**Target URL:** https://app.asoftechinsightz.com
**Run at:** 2026-07-02T20:58:00.000Z

## Existing specs

| File | Coverage |
|------|----------|
| e2e/smoke.spec.js | Health, sign-in page, mobile viewport |
| e2e/crm-workflow.spec.js | Territories, campaigns, invoices, PDF export |
| e2e/enterprise/module-navigation.spec.js | All suite route navigation after login |
| e2e/enterprise/api-modules.spec.js | Full module API smoke (40+ endpoints) |
| e2e/enterprise/crud-workflows.spec.js | CRM CRUD: leads, opportunities, invoices, campaigns |
| e2e/enterprise/retail-workflows.spec.js | RetailEdge360 UI + POS API |
| e2e/enterprise/ui-patterns.spec.js | Auth, search, mobile, security, lead detail |
| e2e/enterprise/accessibility.spec.js | WCAG axe-core (signin, signup, dashboard, leads) |

## Modules needing Playwright tests


## Run commands

```bash
E2E_BASE_URL=https://app.asoftechinsightz.com \
CERT_ADMIN_EMAIL=demo@asoftechinsightz.com \
CERT_ADMIN_PASSWORD=... \
npm run test:e2e
```