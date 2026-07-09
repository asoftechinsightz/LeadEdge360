# Launch War Room

**Purpose:** Single pane for **technical health**, **business performance**, and **financial runway** during the controlled pilot and through GA.

**Cadence:** Daily standup (5 min) · Weekly exec review (30 min)

---

## Quick commands

```bash
# Post-deploy gate — must PASS before customer traffic
npm run production:acceptance

# War room snapshot (technical + business from /api/metrics)
npm run launch:warroom
```

Reports land in `docs/war-room/latest.json` and `docs/war-room/latest.md`.

---

## Pilot gate (non-negotiable)

| Gate | Command / signal | Pass criteria |
|------|------------------|---------------|
| Production Acceptance | `npm run production:acceptance` | `verdict: PASSED`, `promotionAllowed: true` |
| War room health | `npm run launch:warroom` | Uptime 🟢, backup 🟢, PAT PASSED |

**Do not onboard paying pilot customers until PAT passes on the VPS.**

---

## Technical KPIs

| KPI | Source | Target (pilot) | Owner |
|-----|--------|----------------|-------|
| Uptime | UptimeRobot → `/api/health/live` | ≥ **99.9%** | DevOps |
| API latency | PAT + Prometheus | p95 **< 300 ms** | Engineering |
| Error rate | Prometheus `asoftech_http_errors_total` | **< 5%** | Engineering |
| Database health | `/api/health/ready` → `mongo: connected` | **100%** during window | DevOps |
| Backup success | `backup-schedule.sh` + latest `.archive.gz` | **≤ 48h** age | DevOps |
| Active alerts | Grafana / Prometheus | **0 critical** firing | DevOps |

---

## Business KPIs

| KPI | Source | Review |
|-----|--------|--------|
| New organizations | `/api/metrics` → `asoftech_active_tenants` | Weekly |
| Active users (24h) | `asoftech_active_users_24h` | Daily |
| Leads created | `asoftech_leads_created_total` | Daily |
| Opportunities won | `asoftech_opportunities_won_total` | Weekly |
| Retail POS transactions | `asoftech_pos_transactions_total` | Daily |
| MRR (INR) | `asoftech_mrr_inr` | Weekly |
| Customer retention | Manual — `financial-overrides.json` | Monthly |

---

## Financial KPIs (manual)

Edit `docs/war-room/financial-overrides.json` each week:

| KPI | Field |
|-----|-------|
| Cash in bank | `cashInBankInr` |
| Monthly burn | `monthlyBurnInr` |
| Accounts receivable | `accountsReceivableInr` |
| New contracts signed | `newContractsSigned` |
| Customer retention % | `customerRetentionPct` |

MRR is auto-pulled from subscriptions when the app is live.

---

## War room dashboard (Grafana)

Import `infra/grafana/dashboards/asoftech-overview.json` and extend with business panels from `/api/metrics`.

Deploy monitoring:

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

---

## Pilot timeline (recommended)

| Week | Focus | Exit |
|------|-------|------|
| 0 | Deploy VPS, PAT PASS, war room live | 5 internal users |
| 1–2 | Onboard **5–10 pilot customers** | Real workflows, zero P0 |
| 3–4 | Stabilize, collect references | NPS + case studies |
| 5+ | Load test + pen test → GA decision | Public launch |

---

## Escalation

| Severity | Action |
|----------|--------|
| P0 (data leak, auth bypass, payment failure) | Stop onboarding, rollback, fix within 4h |
| P1 (feature broken for all pilots) | Fix within 24h |
| P2 | Next sprint |

---

## Related docs

- [`PRODUCTION_ACCEPTANCE_TEST.md`](./PRODUCTION_ACCEPTANCE_TEST.md)
- [`RELEASE_CERTIFICATION.md`](./RELEASE_CERTIFICATION.md)
- [`MONITORING_RUNBOOK.md`](./MONITORING_RUNBOOK.md)
- [`LAUNCH_READINESS_MOBILE_SAAS.md`](./LAUNCH_READINESS_MOBILE_SAAS.md)
