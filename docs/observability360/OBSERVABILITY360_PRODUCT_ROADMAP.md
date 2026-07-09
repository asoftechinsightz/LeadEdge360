# Observability360 — Product Roadmap

**Version:** 1.0  
**Date:** 3 July 2026  
**Horizon:** 12 months  
**First industry pack:** Banking360

---

## Vision

**Observability360** is a **standalone** enterprise observability product — unifying discovery, CMDB, monitoring, logs, traces, alerting, and AI-driven operations across IT, cloud, network, OT, and business transactions.

Built on the **Trinetra360 engine** in `Observability360` — **not** embedded in LeadEdge360 or RetailEdge360.

---

## Product Lines (AsoftechInsightz portfolio)

| Product | Status | Repository | Target market |
|---------|--------|------------|---------------|
| **LeadEdge360** | ✅ GA Pilot | `asoftech-insightz` | CRM, marketing, growth |
| **RetailEdge360** | 🟡 Foundation | `asoftech-insightz` | Retail POS + inventory |
| **Observability360** | 🟡 Sprint 1 | `Observability360` | Enterprise IT/OT ops |
| **Banking360** (obs pack) | 🔵 Sprint 8 | `Observability360` | BFSI regulated |
| Retail360 (obs pack) | ⚪ Planned | Retail infra |
| Manufacturing360 | ⚪ Planned | OT + plant floor |
| Healthcare360 | ⚪ Planned | HIPAA workloads |
| Government360 | ⚪ Planned | FedRAMP, data residency |
| Telecom360 | ⚪ Planned | Network-centric |

---

## Phase Timeline

### Phase 1 — Audit (Current) ✅
- Complete system, feature, DB, API, UI, code, security, infra audits
- Gap analysis and architecture approval
- **No feature code**

### Phase 2 — Product foundation (Sprints 1–3)
- Observability360 branding, standalone auth, production deploy
- Discovery + CMDB UI polish
- No Business Suite merge

### Phase 3 — Core Observability (Sprints 4–7)
- Topology, infra monitoring, APM, logs, traces
- Alerting, business transaction monitoring

### Phase 4 — Industry & AI (Sprints 8–9)
- Banking360 pack
- AI Copilot unified

### Phase 5 — Production (Sprint 10)
- Hardening, pen test, VPS GA
- Documentation, training, SLA

---

## Banking360 (First Industry Pack)

**Source:** Trinetra360 industry pack `bfsi` + transaction templates

| Capability | Description |
|------------|-------------|
| RBI-CSF compliance | Continuous control validation |
| Transaction monitoring | UPI, NEFT, RTGS, IMPS end-to-end |
| Fraud correlation | Payment velocity + infra anomalies |
| Revenue at risk | Executive KPI from forecasts |
| Audit evidence | Auto-collected per CI |

---

## Deployment Roadmap

| Quarter | Milestone |
|---------|-----------|
| Q3 2026 | Audit complete, Sprint 1–3 integration |
| Q4 2026 | Core observability MVP, private beta |
| Q1 2027 | Banking360, SaaS GA |
| Q2 2027 | Hybrid/on-prem GA, Manufacturing360 preview |

---

## Licensing SKUs (proposed)

| SKU | Includes |
|-----|----------|
| Observability360 Starter | Discovery, CMDB, basic metrics |
| Observability360 Professional | + APM, logs, alerts |
| Observability360 Enterprise | + traces, AI copilot, compliance |
| Banking360 Pack | + BFSI frameworks, transaction monitoring |
| Industry add-ons | Retail, healthcare, government, telecom |

---

## Success Metrics

| Metric | Target (12 months) |
|--------|------------------|
| Assets auto-discovered | 95% within 72h |
| CMDB accuracy | > 98% |
| Mean time to insight | < 5 minutes |
| Banking360 pilot customers | 3 regulated BFSI |
| Platform uptime (SaaS) | 99.9% |
| Customer NPS | > 50 |

---

## Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| Trinetra360 v0.4.0 | Observability360 | ✅ Complete |
| Business Suite auth | asoftech-insightz | ✅ Complete |
| VPS infrastructure | DevOps | ✅ Ready |
| External pen test | Security | ❌ Scheduled Sprint 10 |
| Meta WhatsApp (Suite) | Parallel track | Independent |

---

## Document Index

| Document | Purpose |
|----------|---------|
| `SYSTEM_AUDIT_REPORT.md` | As-is state |
| `FEATURE_AUDIT.md` | Module inventory |
| `GAP_ANALYSIS.md` | To-be gaps |
| `ARCHITECTURE.md` | Target architecture |
| `SPRINT_PLAN.md` | Execution plan |
| `Observability360/docs/PROJECT_STATUS.md` | Trinetra360 status |
