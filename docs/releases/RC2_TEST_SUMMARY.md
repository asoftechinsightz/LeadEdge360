# RC-2 Test Summary

**Generated:** 2026-08-03T17:23:27.914Z  
**Checks:** 40/42 (95.2%)

## npm scripts

| Script | Result |
|--------|--------|
| npm:test:aeo | PASS |
| npm:test:bridge | FAIL |
| npm:test:billing | FAIL |

## Suites

| Suite | Passed | Total |
|-------|--------|-------|
| feature-flag-matrix | 24 | 24 |
| deployment | 15 | 15 |

## API regression

| Test | Result |
|------|--------|
| backend_test.py | FAIL |

**RC score (computed):** 72/100

**Note:** Partial workstation run (no local Mongo/Docker). GitHub Actions workflow RC-2 Validation runs the full matrix — projected RC >= 90 when all steps pass.
