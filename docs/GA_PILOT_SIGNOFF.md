# Enterprise GA Pilot v1.0 — Sign-Off Checklist

**Tag:** `v1.0.0-rc3-pilot`  
**Environment:** `https://app.asoftechinsightz.com`  
**Signed:** 2026-07-03  
**Verdict:** ✅ **GO — Controlled Pilot (5–10 customers)**

---

## Certification gates

| Gate | Command / artifact | Result | Date |
|------|-------------------|--------|------|
| Production Acceptance | `npm run production:acceptance` | ✅ PASSED (`promotionAllowed: true`) | 2026-07-02 |
| Enterprise E2E (Chromium) | `npm run test:e2e:enterprise` | ✅ **110/110** (~40s, 0 flaky) | 2026-07-02 |
| Accessibility (axe) | `npm run test:e2e:enterprise:a11y` | ✅ **5/5** | 2026-07-02 |
| Load — capacity | `LOAD_TEST_BASE_URL=http://127.0.0.1:3000` | ✅ **7/7** (`meetsCapacityTarget`) | 2026-07-02 |
| Load — edge smoke | `LOAD_TEST_PROFILE=edge` + HTTPS | ✅ **7/7** (`meetsEdgeTarget`) | 2026-07-03 |
| Backups | PAT backup freshness | ✅ Daily archive &lt;24h | 2026-07-02 |
| Monitoring | Grafana + Prometheus | ✅ Up (Grafana :3031) | 2026-07-02 |
| Public signup | `PUBLIC_SIGNUP_ENABLED=false` | ✅ Disabled | 2026-07-02 |
| SSL / HSTS / CSP | PAT infrastructure | ✅ Present | 2026-07-02 |

**Reports:** `docs/enterprise-e2e-results.json` · `docs/load-test-last-run.json` · `docs/deployments/production-acceptance-*.json`

---

## Deferred (non-blocking for pilot)

| Item | Status | Required before public GA |
|------|--------|---------------------------|
| Razorpay live keys | ⏸ Missing (PAT warns) | Yes — live payments |
| External penetration test | ❌ Not started | Yes |
| Full 1k-VU k6 ramp | ⏸ Optional | Recommended |
| Firefox / WebKit E2E matrix | ⏸ Missing system libs | No (Chromium certified) |
| Color-contrast a11y (serious) | ⏸ Logged as warnings | Polish |
| MSG91 OTP / public signup | ✅ Signup disabled | Re-enable if open registration |

---

## Pilot operating parameters

| Parameter | Value |
|-----------|-------|
| Target customers | 5–10 |
| Pilot duration | 2–4 weeks |
| Uptime target | ≥ 99.9% |
| API p95 target | &lt; 300 ms (loopback PAT: 93 ms) |
| P0 defects | 0 tolerance |
| Tenant leakage | 0 tolerance |
| Onboarding | Provisioned only — no public signup |

---

## Sign-off

| Role | Pilot v1.0 | Public GA |
|------|------------|-----------|
| Engineering | ✅ GO | ⏸ After pilot + pen test |
| QA / Automation | ✅ GO | ⏸ |
| DevOps | ✅ GO | ⏸ |
| Security | ✅ GO (pilot scope) | ❌ Pending external pen test |
| Product | ✅ GO — onboard pilots | ❌ |

---

## Next actions

1. **Onboard pilots** — follow [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md)
2. **Daily ops** — `npm run launch:warroom` + Grafana dashboards
3. **Per deploy** — `npm run production:acceptance` must return PASSED
4. **Week 2–4** — collect feedback, track P0/P1, measure uptime
5. **Pilot exit** — load test 1k VU + pen test → public GA decision

---

## Related documents

- [`INTERNAL_PRODUCTION_TENANT.md`](./INTERNAL_PRODUCTION_TENANT.md)
- [`SUBSCRIPTION_ENFORCEMENT_POLICY.md`](./SUBSCRIPTION_ENFORCEMENT_POLICY.md)
- [`90_DAY_CUSTOMER_ACQUISITION_PLAN.md`](./90_DAY_CUSTOMER_ACQUISITION_PLAN.md)
- [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md)
