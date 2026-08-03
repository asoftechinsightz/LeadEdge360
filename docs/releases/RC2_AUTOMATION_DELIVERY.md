# RC-2 Engineering Automation — Delivery Note

**Date:** 3 August 2026  
**Purpose:** Close RC-1 gaps (B-RC-01–05) without product feature changes  

---

## What was added

| Workstream | Deliverable |
|------------|-------------|
| RC-01 CI | `.github/workflows/rc-validation.yml` — full RC-2 pipeline |
| RC-01 CI | `.github/workflows/deploy.yml` — `test` job before deploy |
| RC-02 Mongo | GitHub Actions `mongo:7` service |
| RC-03 Flags | `scripts/rc/flag-matrix.mjs` — 4 combinations (24 checks) |
| RC-04 Regression | `backend_test.py` env `RC_API_BASE_URL`; CI API regression step |
| RC-05 Security | `scripts/rc/security.mjs` — isolation, webhook, validation |
| RC-06 Performance | `scripts/rc/performance.mjs` — compute/dispatch/entitlement benches |
| RC-07 Deployment | `scripts/rc/deployment.mjs` — env template, Docker, compose |
| Orchestration | `scripts/rc-ci-runner.mjs`, `scripts/rc2-append-results.mjs` |
| Reports | `scripts/generate-rc2-reports.mjs` → `docs/releases/RC2_*.md` |

## Commands

```bash
# Full RC-2 (requires Mongo)
MONGO_URL=mongodb://localhost:27017 DB_NAME=asoftech_saas_rc2 npm run test:rc

# Regenerate markdown from artifacts
npm run test:rc:reports
```

## Artifacts

- `docs/releases/rc2-artifacts/rc2-results.json` — machine-readable results
- `docs/releases/RC2_TEST_SUMMARY.md`
- `docs/releases/RC2_SECURITY_SUMMARY.md`
- `docs/releases/RC2_PERFORMANCE_SUMMARY.md`
- `docs/releases/RC2_DEPLOYMENT_SUMMARY.md`
- `docs/releases/RC2_GO_LIVE_SCORECARD.md`
