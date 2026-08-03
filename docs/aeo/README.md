# AEO Enablement Program — Documentation Index

**Program:** Answer Engine Optimization (AEO) for LeadEdge360  
**Status:** Phase-1 implemented — post-deployment validation complete (see `post-deployment/`) — **STOP** await PO review  
**Product freeze:** Active — no new APIs, collections, navigation, or architecture changes  

---

## Objective

Enable AEO capabilities by **recomposing** existing dashboards, **extending metadata** in allowed JSON fields, **configuring** AI prompt templates, and **orchestrating** existing automation surfaces — without changing backend contracts.

**E-003 (R1.1):** When `AEO_SERVER_PROFILE=true`, business profile and checklist state persist under `users.preferences.aeoProfile` / `aeoChecklistState` via `GET /api/auth/me` and `PATCH /api/users/me` (cookie bridge). Default remains browser `sessionStorage`.

---

## Deliverables

| # | Document | Workstreams |
|---|----------|-------------|
| 1 | [AEO_FUNCTIONAL_SPECIFICATION.md](./AEO_FUNCTIONAL_SPECIFICATION.md) | WS1–WS7 overview |
| 2 | [AEO_USER_JOURNEY.md](./AEO_USER_JOURNEY.md) | End-user flows |
| 3 | [AEO_DASHBOARD_SPECIFICATION.md](./AEO_DASHBOARD_SPECIFICATION.md) | WS2 executive cards |
| 4 | [AEO_AI_RECOMMENDATION_CATALOG.md](./AEO_AI_RECOMMENDATION_CATALOG.md) | WS3 prompts + rules |
| 5 | [AEO_AUTOMATION_RULES.md](./AEO_AUTOMATION_RULES.md) | WS7 n8n + follow-ups |
| 6 | [AEO_EXECUTIVE_KPI_MAPPING.md](./AEO_EXECUTIVE_KPI_MAPPING.md) | KPI → API mapping |
| 7 | [AEO_RELEASE_IMPACT_ASSESSMENT.md](./AEO_RELEASE_IMPACT_ASSESSMENT.md) | Compatibility + risk |
| 8 | [AEO_IMPLEMENTATION_READINESS_REPORT.md](./AEO_IMPLEMENTATION_READINESS_REPORT.md) | Validation + STOP gate |
| 9 | [AEO_PHASE1_RELEASE_VALIDATION_REPORT.md](./AEO_PHASE1_RELEASE_VALIDATION_REPORT.md) | Pre-deploy engineering validation |

### Post-deployment (pilot validation — documentation only)

| Pack | Location |
|------|----------|
| Post-deployment validation (WS1–WS10) | [post-deployment/10_PO_DECISION_PACK.md](./post-deployment/10_PO_DECISION_PACK.md) |

---

## Allowed change types (Product Owner)

| Allowed | Examples |
|---------|----------|
| Configuration files | `config/aeo/checklist.json`, prompt templates |
| Metadata in existing JSON | `users.preferences.aeo`, `tenants.settings` (Postgres), Mongo `orgs` optional nested object |
| Dashboard composition | Reorder/label existing `KpiCard` components on `/dashboard`, `/leadedge360` |
| AI prompt templates | Strings in `lib/scoring.js` / shared LLM helper — same endpoint, new prompts |
| Documentation | This folder |

| Forbidden | |
|-----------|---|
| New API routes | |
| New Mongo collections / SQL tables | |
| Auth, routing, navigation changes | |
| New modules / microservices | |

---

## Canonical platform references

| Capability | Existing artifact |
|------------|-----------------|
| Lead AI scoring | `lib/scoring.js` (`aiScore`, `ruleScore`) |
| Retail AI pattern | `lib/retail-ai.js` |
| CRM KPIs | `GET /api/kpis`, `GET /api/dashboard/kpis` |
| Dashboard cards | `KpiCard` in `leadedge360/page.js`, `dashboard/page.js` |
| Follow-ups / reminders | `GET /api/followups`, `GET /api/dashboard/followups-due`, `GET /api/followups/reminders` |
| WhatsApp content | `POST /api/whatsapp/send`, templates, `wa.me` links |
| Automation | `n8n/whatsapp-followup-automation.json`, webhook ingest flows |
| User preferences | `PATCH /api/users/me` → `preferences` |
| Tenant settings (canonical SQL) | `tenants.settings` JSONB |
| Lead extension fields | `leads.meta` JSONB (Postgres canonical) |

**Not in v1.0:** dedicated reviews, FAQ, or Google Business Profile APIs.

---

## Approval gate

Complete documentation → **STOP** → Product Owner approval before implementation.
