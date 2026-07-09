# 90-Day Customer Acquisition Plan

**Goal:** Onboard **50 paying customer organizations** in 90 days  
**Internal operations tenant:** `asoftechinsightz` (real data)  
**Demo tenant:** `client-demo` (sales presentations only)  
**Start:** GA Pilot v1.0 certified (2026-07-03)

---

## Targets

| Milestone | Day | Cumulative customers | Focus |
|-----------|-----|---------------------|-------|
| Pilot wave 1 | 0–14 | 5–10 | Prove onboarding + PAT per tenant |
| Scale wave | 15–45 | 25 | Repeatable provision + training |
| Growth wave | 46–75 | 40 | Partner/referral + marketing outbound |
| Close 50 | 76–90 | **50** | Enterprise + retail bundles |

**Revenue assumption (illustrative):** 50 × avg ₹4,999/mo Growth = ₹2.5L MRR at day 90 (adjust per actual plan mix).

---

## Funnel (internal production CRM)

Track in **`asoftechinsightz`** org — not demo tenant:

```
Awareness → Lead → Qualified → Demo → Trial/Pilot → Paid → Renewed
```

| Stage | CRM status | Owner | Target (90d) |
|-------|------------|-------|--------------|
| Leads captured | New / Contacted | Marketing + Sales | 500+ |
| Qualified | Qualified | Sales | 150 |
| Demo completed | Proposal | Sales (via `client-demo`) | 80 |
| Pilot provisioned | Negotiation | Engineering + CS | 60 |
| Paying active | Won | Finance | **50** |
| Renewed | Active subscription | CS | 45+ (90% retention) |

---

## Weekly cadence

| Week | Sales | Engineering | CS / Ops |
|------|-------|-------------|----------|
| 1–2 | 20 outbound touches/day | Pilot #1–5 provision + PAT | Onboarding calls |
| 3–6 | 2 demos/day | Provision ≤3 customers/week | Weekly check-in per pilot |
| 7–9 | Partner channel launch | Automate provision checklist | Health dashboard review |
| 10–12 | Close enterprise deals | Load test at 100 VU if >30 tenants | Renewal prep |

---

## Dashboards to monitor (internal tenant)

| Dashboard | KPI | Target |
|-----------|-----|--------|
| Leads | New leads / week | ≥40 |
| Opportunities | Pipeline value | Growing WoW |
| Conversion | Lead → paid % | ≥10% |
| Revenue | MRR from **customer** subscriptions module | Track separately from platform fees |
| Renewals | Churn % | <10% monthly |
| Customer health | Active logins / org | ≥70% weekly |
| Marketing ROI | Cost per qualified lead | Decreasing |

**Platform ops dashboards** (Grafana): uptime ≥99.9%, p95 <300ms.

---

## Customer onboarding (repeatable)

Per customer (~30 min engineering + 30 min CS):

```bash
# 1. Provision
npm run pilot:provision

# 2. Optional retail seed
DEMO_ORG_ID={slug} DEMO_ADMIN_EMAIL=... DEMO_ADMIN_PASSWORD=... \
node scripts/provision-client-demo.mjs

# 3. Validate
export CERT_ADMIN_EMAIL=...
npm run production:acceptance
```

Full runbook: [`CUSTOMER_ONBOARDING_RUNBOOK.md`](./CUSTOMER_ONBOARDING_RUNBOOK.md)

---

## Tenant tracker (update weekly)

| # | Company | orgId | Plan | Provisioned | PAT | Go-live | MRR |
|---|---------|-------|------|-------------|-----|---------|-----|
| — | AsoftechInsightz (internal) | `asoftechinsightz` | ENTERPRISE | ✅ | ✅ | — | — |
| 0 | Demo presenter | `client-demo` | ENTERPRISE | ✅ | ✅ | — | — |
| 1 | First Customer | `first-customer` | ENTERPRISE | ✅ | ✅ | Pending handoff | — |
| 2–50 | | | | | | | |

---

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Provision bottleneck | Documented runbook; unique phone per tenant |
| Subscription bugs block internal ops | Internal tenant bypass (`tenant-policy.js`) |
| Demo data in production CRM | Guard scripts + configure-internal-tenant audit |
| Platform outage | PAT per deploy; Grafana alerts; rollback script |
| Razorpay delay | Invoice manually; enable keys before scale wave |
| Support overload | Limit pilot wave 1 to 10; template training deck |

---

## Success criteria (day 90)

- [ ] **50** customer orgs provisioned with PAT PASS
- [ ] Internal `asoftechinsightz` CRM reflects real acquisition funnel
- [ ] Zero P0 defects; zero tenant leakage
- [ ] Uptime ≥99.9% over 90-day window
- [ ] External pen test scheduled or complete
- [ ] Public GA decision documented in `RELEASE_CERTIFICATION.md`

---

## Related

- [`BUSINESS_OPERATIONS_READINESS.md`](./BUSINESS_OPERATIONS_READINESS.md)
- [`INTERNAL_PRODUCTION_TENANT.md`](./INTERNAL_PRODUCTION_TENANT.md)
- [`GA_PILOT_SIGNOFF.md`](./GA_PILOT_SIGNOFF.md)
