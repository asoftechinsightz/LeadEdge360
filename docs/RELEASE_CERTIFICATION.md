# Release Certification — RC3 (Production Operations)

**Generated:** 2026-06-22  
**Prior:** RC2 — GO pilot / NO GO public GA

---

## Release status

# ⛔ NO GO — Public General Availability

# ✅ GO — Controlled Pilot (5–10 customers on Hostinger VPS)

# ✅ GO — Enterprise GA Pilot v1.0 (certified 2026-07-03)

# ⛔ NO GO — Public General Availability

**Certification complete:** E2E 110/110, a11y 5/5, PAT PASSED, load capacity + edge green. See [`GA_PILOT_SIGNOFF.md`](./GA_PILOT_SIGNOFF.md) and [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md).

**Pilot operations:** Onboard 5–10 customers via provisioned tenants, operate 2–4 weeks, then decide public GA after pen test. See [`LAUNCH_WAR_ROOM.md`](./LAUNCH_WAR_ROOM.md).

---

## RC3 deliverables

| Area | RC2 | RC3 |
|------|-----|-----|
| Rolling deploy + rollback | ❌ | ✅ `deploy-production.sh` |
| Docker prod (Redis, Nginx) | partial | ✅ `docker-compose.prod.yml` |
| Monitoring (Prometheus/Grafana) | docs only | ✅ compose + dashboards |
| Load test scripts | ❌ | ✅ Node + k6 |
| Security scans (OWASP/deps) | partial | ✅ automated |
| DR restore drill | runbook | ✅ `restore-drill.sh` |
| Android release build | manual | ✅ `build-android-release.sh` |
| `/api/metrics` endpoint | ❌ | ✅ Prometheus scrape |
| Production Acceptance Test | ❌ | ✅ `npm run production:acceptance` |
| Launch War Room | ❌ | ✅ `npm run launch:warroom` |

Validate: `npm run test:rc3`  
Post-deploy gate: `npm run production:acceptance`  
Daily pilot ops: `npm run launch:warroom` — see [`LAUNCH_WAR_ROOM.md`](./LAUNCH_WAR_ROOM.md)

---

## GA acceptance gates

| Criterion | RC3 status |
|-----------|------------|
| Zero-downtime deploy verified | 🟡 Script ready — run on staging |
| Load test capacity (20 VU, loopback) | ✅ 7/7, p95 &lt; 300ms |
| Load test edge (HTTPS smoke) | ✅ 7/7 (`meetsEdgeTarget`) |
| Monitoring + alerts live | ✅ Prometheus + Grafana :3031 |
| Backup schedule (7/4/12 retention) | ✅ `backup-schedule.sh` |
| Restore drill RTO ≤ 4h | 🟡 Run on production clone |
| OWASP + dependency scan | ✅ Automated |
| External penetration test | ❌ Required |
| Pilot uptime ≥ 99.9% | 🟡 Measure during Stage 2 |
| Zero P0/P1 defects | 🟡 Track in pilot |

---

## Pilot success metrics (Stage 2–3)

| Metric | Target |
|--------|--------|
| Uptime | ≥ 99.9% |
| API p95 latency | < 300 ms |
| P0 defects | 0 |
| Tenant data leakage | 0 |
| Backup + restore | Verified on clone |
| Rollback drill | Successful on staging |
| Customer satisfaction | Qualitative feedback from 5–10 pilots |

---

## Rollout stages

| Stage | Audience | Duration | Exit criteria |
|-------|----------|----------|---------------|
| Internal QA | Team | 2–3 days | Health + smoke pass |
| Staging | Pre-prod | 1 week | Load test pass |
| Pilot | 5–10 customers | 2 weeks | Metrics green |
| GA | Public | — | All gates ✅ |

---

## Sign-off

| Role | Pilot | Public GA |
|------|-------|-----------|
| Engineering | ✅ GO | ⏸ Pending pen test |
| Security | ✅ GO (pilot) | ❌ Pending pen test |
| DevOps | ✅ GO | ⏸ Pending 1k VU + DR drill |
| Product | ✅ Onboard 5–10 pilots | ❌ |

---

## Related documents

- [`MONITORING_RUNBOOK.md`](./MONITORING_RUNBOOK.md)
- [`LOAD_TEST_PLAN.md`](./LOAD_TEST_PLAN.md)
- [`PEN_TEST_CHECKLIST.md`](./PEN_TEST_CHECKLIST.md)
- [`BACKUP_DISASTER_RECOVERY.md`](./BACKUP_DISASTER_RECOVERY.md)
- [`ANDROID_RELEASE_RC3.md`](./ANDROID_RELEASE_RC3.md)
- [`ops/deployments/RC3_PRODUCTION_OPS.md`](./ops/deployments/RC3_PRODUCTION_OPS.md)
- [`rc3-validation-last-run.json`](./rc3-validation-last-run.json)
