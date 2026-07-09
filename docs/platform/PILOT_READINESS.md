# LeadEdge360 — Pilot Readiness Guide

**Certification status:** **GO WITH MINOR OBSERVATIONS** (runtime VPS, June 2026)  
**Action plan:** [Post-Certification Action Plan](./POST_CERTIFICATION_ACTION_PLAN.md)  
**Purpose:** Prepare the platform for onboarding the first pilot customers  
**Companion docs:** [AsoftechInsightz Validation](./ASOFTECHINSIGHTZ_PILOT_VALIDATION.md), [Go-Live Certification Report](./GO_LIVE_CERTIFICATION_REPORT.md), [Operations Runbook](./OPERATIONS_RUNBOOK.md), [Runtime Certification Report](./RUNTIME_CERTIFICATION_REPORT.md)

---

## 1. Pilot Scope

**Recommended pilot:** 1–3 enterprise customers across different industries (e.g., Hospital, BFSI, Manufacturing) to validate multi-tenant isolation, AI workforce, and end-to-end revenue workflows.

**Out of scope for pilot:** Marketplace third-party agents beyond core 12 + Compliance/Renewal, custom LLM fine-tuning, multi-region deployment.

---

## 2. Customer Onboarding Checklist

### Pre-onboarding (Sales + Engineering)

- [ ] Signed pilot agreement and data processing terms (DPDP)
- [ ] Industry identified (maps to industry profile)
- [ ] Subscription plan selected (STARTER / BUSINESS_GROWTH / ENTERPRISE)
- [ ] Production environment ready (`NEXT_PUBLIC_APP_ENV=production`)
- [ ] Runtime certification passed (`npm run cert:runtime` → **GO** or **GO WITH MINOR OBSERVATIONS**)
- [ ] Post-cert sync verified (`npm run pilot:verify`)
- [ ] Razorpay live or pilot payment mode agreed
- [ ] SMTP/email domain configured for campaigns
- [ ] n8n workflows scoped (if customer uses automation)

### Org provisioning

Automated via **`npm run pilot:provision`** — see [Pilot Provisioning](./PILOT_PROVISIONING.md).

- [ ] Run dry-run: `npm run pilot:provision -- --dry-run`
- [ ] Provision org with unique `orgId` (not `demo-org`)
- [ ] Verify admin login and `ENTERPRISE` subscription
- [ ] Confirm industry profile and AI workforce settings applied
- [ ] Confirm branding, GST, proposal/invoice prefixes in Settings
- [ ] Optional sample data: `npm run pilot:provision -- --seed-sample`
- [ ] Configure approval rules for proposal-ai, meeting-scheduler-ai, document-ai
- [ ] Set `org_webhook_config` if n8n integration required
- [ ] Verify `DEV_AUTH_BYPASS=false` and no demo seed in prod DB

### Data & templates

- [ ] Import or create initial lead/opportunity templates
- [ ] Configure proposal/invoice templates for customer
- [ ] Set territory and user assignments
- [ ] Optional: import legacy leads (CSV) with orgId scoped

### AI workforce

- [ ] Enable required agents (default: all 12 core)
- [ ] Set token/cost budget appropriate to pilot tier
- [ ] Test one event per agent (see Section 6)
- [ ] Confirm Emergent LLM key active for scoring

### Go-live verification

- [ ] Admin login works
- [ ] Lead → Opportunity → Proposal → Invoice → Payment flow tested
- [ ] Activity feed shows events
- [ ] Notifications delivered
- [ ] `/ops/agents` shows healthy queue
- [ ] Audit log entries present for key actions

### Handoff

- [ ] Administrator guide shared (Section 4)
- [ ] AI Workforce guide shared (Section 5)
- [ ] Support channel established (email/Slack)
- [ ] Monitoring dashboard access for ops team

---

## 3. Demo Checklist

Use for sales demos and `NEXT_PUBLIC_APP_ENV=demo`.

### Environment

- [ ] `NEXT_PUBLIC_APP_ENV=demo` or development with demo badge visible
- [ ] `demo-org` seeded (`npm run db:bootstrap` if needed)
- [ ] Demo credentials documented for presenters only (not shared publicly)

### Demo flow (30-minute script)

1. [ ] **Dashboard** — revenue, leads, AI ops overview
2. [ ] **Lead creation** — show `lead.created` in activity feed
3. [ ] **Lead Qualification AI** — run worker, show scored lead
4. [ ] **Sales AI** — follow-up task created
5. [ ] **Opportunity + Proposal** — Proposal AI + approval step
6. [ ] **Invoice + Payment** — mock payment in demo mode
7. [ ] **Customer Success AI** — post-win task
8. [ ] **CEO AI** — analytics / briefing summary
9. [ ] **AI Workforce Settings** — pause agent, change budget
10. [ ] **Industry switch** — show profile change (Hospital → Retail)

### Demo safety

- [ ] `NEXT_PUBLIC_USE_MOCK_API=true` in demo (no live payment charges)
- [ ] No production customer data in demo org
- [ ] Demo reset procedure documented (re-run bootstrap or clear demo-org)
- [ ] Simulated integrations only (mock payments, optional mock SMTP)

### Demo reset

```bash
# Re-seed demo org (non-production only)
npm run db:bootstrap
```

Verify `demo-org` leads/customers restored; agent tasks cleared or reset as needed.

---

## 4. Production Checklist

### Secrets & auth

- [ ] `JWT_SECRET` — unique, ≥32 random bytes
- [ ] `DEV_AUTH_BYPASS=false`
- [ ] `REQUIRE_AUTH=true`
- [ ] `RAZORPAY_*` — live keys in production
- [ ] `EMERGENT_LLM_KEY` — production key
- [ ] `N8N_WEBHOOK_TOKEN` — rotated from default
- [ ] `AGENT_CRON_SECRET` — set for scheduled endpoints

### Application

- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `NEXT_PUBLIC_USE_MOCK_API=false`
- [ ] `NEXT_PUBLIC_APP_URL` — correct HTTPS domain
- [ ] `npm run build` succeeds on release commit
- [ ] `npm run db:indexes` applied to production DB

### Infrastructure

- [ ] HTTPS via reverse proxy
- [ ] MongoDB Atlas M10+ with backup enabled
- [ ] Cron: agent worker (1 min), scheduled jobs (15 min)
- [ ] Health monitoring on `/api/health/ready`
- [ ] Log retention ≥ 30 days

### Data

- [ ] No `demo-org` data in production database
- [ ] Each customer has isolated `orgId`
- [ ] Audit logging enabled and reviewed weekly

### Certification

- [ ] `npm run cert:runtime` — decision **GO** or **GO WITH MINOR OBSERVATIONS**
- [ ] `npm run pilot:verify` — repository + routes in sync
- [ ] `go-live-retest.mjs` — ≥90% pass
- [ ] `tenant-isolation-retest.mjs` — all pass

---

## 5. Administrator Guide

### Access

- URL: `https://<your-domain>/login`
- Role: Organization Admin or higher
- MFA: enable when available (roadmap)

### Key areas

| Area | Path | Purpose |
|------|------|---------|
| Leads & Sales | `/sales/leads` | Pipeline management |
| Opportunities | `/sales/opportunities` | Deal tracking |
| Proposals | `/sales/proposals` | Quotes and approvals |
| Invoices | `/finance/invoices` | Billing |
| Customers | `/customers` | Account management |
| Campaigns | `/marketing/campaigns` | Marketing automation |
| Activities | `/activities` | Unified activity feed |
| Notifications | `/notifications` | Alert center |
| AI Workforce | `/settings` → AI Workforce | Agent config |
| AI Ops | `/ops/agents` | Queue and SLA monitoring |
| AI Analytics | `/ops/ai-analytics` | Usage and cost |

### User management

- Create users with appropriate roles (admin, sales, finance, etc.)
- Portal customers use separate `portal_customer` role — cannot access admin APIs

### Approval workflow

Agents with `requiresApproval: true` (proposal-ai, meeting-scheduler-ai, document-ai) create tasks in `awaiting_approval`. Admins approve from AI Ops or notifications before execution completes.

### Audit

All significant actions write to `audit_logs`. Export via compliance APIs if required for customer audits.

---

## 6. Sales Guide

### Value proposition

LeadEdge360 combines CRM, revenue operations, and an **AI Workforce** of 12 agentic employees that automate lead qualification, proposals, finance, marketing, and executive reporting — with human approval gates for high-risk actions.

### Pilot pitch flow

1. **Problem** — manual lead follow-up, slow proposals, no unified activity view
2. **Demo** — live lead → AI qualification → proposal → payment (30 min script)
3. **Differentiator** — event-driven AI employees with memory, approvals, and audit trail
4. **Industry fit** — apply Hospital / BFSI / Manufacturing profile in settings
5. **Pilot terms** — 30–90 days, defined success metrics (see Section 8)

### What to promise in pilot

- Multi-tenant secure CRM with AI assistance
- Configurable AI workforce per org
- Proposal and invoice automation with approval controls
- Activity feed and notifications for full visibility
- Ops support during pilot period

### What not to promise yet

- Fully autonomous LLM agents for all workflows (some handlers are rule-assisted)
- CSAT analytics integration
- Unlimited scale without infrastructure upgrade

---

## 7. AI Workforce Guide

### The 12 core agents

| Agent | When it runs | Human approval? |
|-------|--------------|-----------------|
| Lead Qualification AI | New/updated lead | No |
| Sales AI | Tasks, follow-ups | No |
| Proposal AI | New opportunity | **Yes** |
| Meeting Scheduler AI | Hot lead/opp | **Yes** |
| Marketing AI | Campaign events | No |
| Geo Scanner AI | Scanner results | No |
| Customer Success AI | Deal won, payment | No |
| Finance AI | Invoice/payment | No |
| Revenue Intelligence AI | Pipeline changes | No |
| Churn Prediction AI | Payment, follow-ups | No |
| Document AI | Document upload | **Yes** |
| CEO AI | Wins, payments, weekly | No |

### Configuration (Settings → AI Workforce)

- **Enable/disable** agents per org
- **Business hours** — restrict auto-run outside hours
- **Monthly budget** — token/cost cap; dispatch blocks when exceeded
- **Industry profile** — adjusts defaults and templates
- **Approval rules** — override per agent

### Monitoring

- `/ops/agents` — queue depth, failures, SLA
- `/ops/ai-analytics` — cost, usage by agent
- Approve pending tasks promptly to avoid pipeline stalls

### Troubleshooting for admins

| Symptom | Action |
|---------|--------|
| Agent not triggering | Check enabled + event occurred; run worker |
| Task awaiting approval | Approve or reject in AI Ops |
| Budget exceeded | Increase monthly limit or wait for reset |
| Poor AI quality | Verify LLM key; check industry profile |

---

## 8. Known Limitations

1. **LLM depth** — Some agent handlers use rule-based logic with optional Emergent LLM scoring; not all agents use full tool-calling LLM loops yet.
2. **Automated tests** — Certification relies on retest scripts, not Jest/Playwright CI.
3. **Meeting/renewal events** — Partially driven by scheduled scans (`/api/agents/scheduled/run`); not all calendar systems integrated.
4. **CSAT** — Not integrated into workforce analytics.
5. **Scale** — Single-instance worker suitable for pilot; 100+ orgs needs dedicated worker infrastructure.
6. **Runtime certification** — Must pass on staging/production MongoDB before full GO.

---

## 9. Recommended Monitoring — First 30 Days

### Daily (automated alerts)

| Metric | Threshold | Action |
|--------|-----------|--------|
| `/health/ready` down | Any failure | Page on-call |
| `agent_tasks` failed | > 5 per org/day | Review errors, retry |
| Queue depth | > 50 queued > 1 hr | Scale worker frequency |
| Payment webhooks failed | Any | Check Razorpay dashboard |
| API p95 latency | > 3 s | Check Mongo indexes |

### Weekly (manual review)

- [ ] Audit log sample for pilot orgs
- [ ] AI cost vs budget per org (`/ops/ai-analytics`)
- [ ] Tenant isolation spot check
- [ ] Customer feedback session notes
- [ ] Defect triage — critical/high resolved within SLA

### Pilot success metrics

| Metric | Target |
|--------|--------|
| E2E lead-to-invoice flow | 100% success for test cases |
| Agent task success rate | ≥ 95% |
| API availability | ≥ 99.5% |
| Critical defects | 0 open |
| Customer admin NPS (informal) | ≥ 8/10 |

---

## 10. Industry-Specific Pilot Notes

| Industry | Profile | Focus workflows |
|----------|---------|-----------------|
| Hospital | `hospital` | Lead qualification, compliance-ai, document-ai |
| Retail | `retail` | Campaigns, geo scanner, churn |
| Manufacturing | `manufacturing` | Long-cycle proposals, finance-ai |
| BFSI | `bfsi` | Approval gates, audit, compliance-ai |
| Education | `education` | Renewal-ai, customer success |

Apply profile before UAT with customer stakeholders.

---

## 11. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering lead | | | |
| Product owner | | | |
| Security | | | |
| Pilot customer sponsor | | | |

**Pilot start date:** _______________  
**Pilot review date (day 30):** _______________

---

*After successful pilot: freeze major architecture changes; focus on feedback, defects, and incremental enhancements.*
