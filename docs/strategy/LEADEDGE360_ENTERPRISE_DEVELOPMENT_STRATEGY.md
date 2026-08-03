# LeadEdge360 — Enterprise Development Strategy & Implementation Backlog

**Version:** 1.0  
**Date:** 3 August 2026  
**Status:** Strategy & backlog — **no code changes** (Product Freeze v1.0 until PO lift)  
**Audience:** CPO, CTO, Engineering, CS, GTM  

**Single sources of truth:**  
- [LEADEDGE360_PLATFORM_CURRENT_STATE.md](./LEADEDGE360_PLATFORM_CURRENT_STATE.md)  
- [LEADEDGE360_STRATEGIC_ASSESSMENT.md](./LEADEDGE360_STRATEGIC_ASSESSMENT.md)  
- [LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md](./LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md)  
- [LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md)  
- `docs/customer-success/` · `docs/aeo/` · `docs/mobile/` · `docs/operations/`  

**Tag legend:**  
- **E** = Already Exists  
- **EN** = Enhancement (extend existing)  
- **N** = New Capability  
- **F** = Future Vision  

---

## 1. Executive Summary

LeadEdge360 today is an **AI-augmented dual-product workspace** (LeadEdge360 CRM + RetailEdge360 + embedded AEO Growth Engine) on a **Next.js + MongoDB + Emergent LLM + n8n + Razorpay** monolith. It is **not yet** the full AI Business Growth Operating System described in product vision — but **Phase-1 foundations are credible and must be extended, not replaced**.

**Maturity (evidence-based):** Product 47 · Commercial 38 · AI 41 (`STRATEGIC_ASSESSMENT`).

**Pilot state:** READY WITH CONDITIONS — Tenant #1 metrics **NOT CAPTURED**; infra SSH checklist incomplete; authenticated validation **PENDING** (`docs/operations/runtime-handover/`, `EXECUTIVE_ACTION_REGISTER.md`).

**Transformation path (extend-only):**

| Horizon | Outcome | Mechanism |
|---------|---------|-----------|
| **M0 (now)** | Pilot truth | Ops + CS validation closure |
| **M1 (GA)** | Commercial GA | Auth bridge, server AEO profile, plan limits, billing hardening |
| **M2** | Growth automation | Web follow-ups, email/SMTP, WA inbox, campaigns |
| **M3** | AI Business Growth | Agent panel on existing LLM gateway |
| **M4** | Revenue workspace | Opportunity, quote, invoice |
| **M5** | Enterprise + OS vision | SSO, industry packs, autonomous consultant |

**Principles (non-negotiable):**  
- No architecture redesign · No technology replacement · No duplicate modules  
- Reuse `route.js`, `mobile-routes.js`, `lib/scoring.js`, `lib/aeo/*`, `AeoGrowthEngine.jsx`, n8n JSON, billing stack  
- Human approval before external publish (WA, GBP, email, social)  
- Every recommendation tied to existing KPIs (`EXECUTIVE_KPI_GUIDE.md`) — no invented metrics  

**Backlog size:** 17 prioritized epics (E-001–E-017) + Top 100 enhancements (#1–100 in `ENHANCEMENTS_AND_ROADMAP`) + 30 domain work packages below.

---

## 2. Gap Analysis

### 2.1 Vision vs current (summary)

| Layer | Current (v1.0) | Target (BG OS) | Gap class |
|-------|----------------|----------------|-----------|
| Onboarding | Dashboard + client AEO profile | Learn business once, persist everywhere | EN |
| Lead gen | Webhooks + manual + API | + landing pages, magnets, ads ROI | N |
| CRM | Pipeline + score | + opportunities, quotes, Customer 360 | N / EN |
| Marketing | Static site + drafts | Full marketing suite in-app | N |
| SEO | — | Audits, keywords, on-page | N |
| AEO | Strong RC | + server sync, audits, publish workflow | EN |
| Automation | 7 n8n JSON | + in-app triggers, email sequences | EN / N |
| AI | Scoring + 8 prompts | + agents, forecasting, consultant | N / F |
| BI | KPI charts | + cohorts, forecast, narrative | EN / N |
| Mobile | JWT API only | Native app + web parity | N / EN |
| Enterprise | DPDP, tenant isolation | SSO, RBAC web, SLA | F |

### 2.2 Critical gaps (blocking GA)

| # | Gap | Tag | Priority | Evidence |
|---|-----|-----|----------|----------|
| G-01 | Production deploy parity + SSH validation | EN | P0 | `runtime-handover/02` incomplete |
| G-02 | Authenticated Tenant #1 validation | EN | P0 | `03_AUTHENTICATED_VALIDATION` PENDING |
| G-03 | Cookie ↔ JWT bridge (web uses mobile APIs) | EN | P0 | `TECHNICAL_DEBT`, mobile-only followups |
| G-04 | AEO profile server persistence | EN | P0 | `sessionStorage` only (`lib/aeo/profile.js`) |
| G-05 | Plan limit enforcement | EN | P0 | `plan-entitlements.js` not enforced |
| G-06 | Recurring billing / invoices | EN / N | P1 | `BILLING_GAP_ANALYSIS` |
| G-07 | Tenant operational proof | EN | P0 | `TENANT1_SUCCESS_DASHBOARD` NOT CAPTURED |
| G-08 | n8n active on production | NOT VERIFIED | P1 | Ops import status unknown |
| G-09 | SMTP / Razorpay on live | EN | P0 | Health often false on live probes |

### 2.3 Gap by business objective (signup → autonomous consultant)

| Objective | Exists | Gap |
|-----------|--------|-----|
| Learn the business | AEO profile UI | Server persist; industry packs |
| Identify opportunities | Rule scanner | Daily agent plan |
| Improve visibility | AEO KPIs + prompts | SEO audit; GBP API |
| Generate leads | Webhooks, CRM | Landing builder, magnets |
| Nurture leads | n8n WA follow-up | Web inbox, email sequences |
| Automate follow-ups | Mobile `follow_ups` | Web UI + triggers |
| Retention / repeat | Won status | Customer 360, CS health |
| Generate content | 8 LLM prompts | Campaign + blog agents |
| Improve SEO / AEO | AEO stack | SEO module, publish workflow |
| Suggest campaigns | Rules | Campaign entity + agent |
| Track KPIs | `kpis`, charts | Marketing/revenue dashboards |
| Recommend actions | `recommendations.js` | Agent panel |
| Forecast revenue | Mobile revenue API | Web BI + model |
| Daily guidance | — | Business Consultant (F) |
| Autonomous consultant | — | Phase 5 (F) |

---

## 3. Business Capability Matrix

| Domain | E | EN | N | F | Maturity | Phase |
|--------|---|----|----|---|----------|-------|
| Lead Generation | Webhooks, API, manual | Source UI, real agents | Bulk import, landing | Ads manager | Medium | 1–4 |
| CRM (core) | Full LeadEdge360 | Detail route, kanban | — | — | High | 1–2 |
| Contacts | Fields on lead | Contact entity | Dedicated CRM contacts | — | Low | 2 |
| Companies | `company` field | Company record | Company 360 | — | Low | 2–3 |
| Customer 360 | — | Won + activities | Unified view | — | Missing | 3 |
| Sales Pipeline | 6 statuses, charts | Kanban | Opportunity object | — | Medium | 2–3 |
| Opportunity Mgmt | Metrics counter | — | Entity + UI | — | Missing | 3 |
| Proposal | Status `Proposal` | Doc builder | PDF | — | Low | 3–4 |
| Quotation | — | — | Quote PDF | — | Missing | 4 |
| Invoice | — | — | Invoice + PDF | — | Missing | 4 |
| Payments | Razorpay order | Live stability | — | — | Medium | 1 |
| Subscriptions | Records on org | Recurring Razorpay | Trials | — | Low | 1–2 |
| Billing | Sprint 19A core | Limits, invoices | — | — | Medium | 1 |
| Customer Success | 18+ docs | Health widget | NPS in-app | — | Docs high / product low | 2–3 |
| Marketing (site) | Full marketing site | — | Campaign OS | — | Medium | 1–3 |
| SEO | — | — | Audit, keywords | Auto-optimize | Missing | 3–4 |
| AEO | Full RC | Server profile | Audits | Auto-publish | High RC | 1–3 |
| Google Business | URL + draft prompt | Publish workflow | GBP API | — | Low | 2–3 |
| Website (tenant) | — | — | Auditor | Hosted CMS | Missing | 3–4 |
| Landing Pages | — | Export HTML | AI builder | Hosted | Missing | 4 |
| Blog | Static page | — | AI + CMS | — | Low | 3–4 |
| Content | 8 prompts | Content library link | Calendar | — | Medium | 2–3 |
| WhatsApp | WA link, ingest, API | Web inbox | Campaigns | — | Medium | 1–2 |
| Email | — | SMTP | Sequences | — | Missing | 2 |
| SMS | — | — | Provider integration | — | Missing | 4+ |
| Campaigns | — | — | Entity + wizard | Auto | Missing | 3 |
| Automation | 7 n8n JSON | Ops standard | In-app triggers | Builder | Medium | 1–3 |
| Reviews | Profile + reply prompt | Approval queue | Auto-reply | — | Low | 2–3 |
| Reputation | Review health KPI | — | Multi-platform | — | Low | 3 |
| Analytics / BI | KPI APIs, charts | MRR widget | Cohorts | — | Medium | 2–3 |
| Executive KPIs | `/dashboard` | Narrative card | — | — | Medium | 1–3 |
| Forecasting | — | Revenue API web | ML forecast | — | Missing | 3–4 |
| AI Recommendations | Rules + scanner | Stale/churn rules | Agent narratives | — | Medium | 2–3 |
| AI Agents | — | AEO partial | 15 agents | Consultant | Missing | 3–5 |
| Partner Portal | — | — | — | Full portal | Missing | 5 |
| Admin Portal | JWT APIs | Web UI | — | — | Low | 1–2 |
| Mobile | JWT API | Push delivery | Native app | — | API high | 2–3 |
| Notifications | Mobile API | Web UI | — | — | Partial | 2 |
| Support | Contact API | — | Ticket integration | — | Low | 3 |
| Training | Academy docs | Checklist widget | In-app academy | — | Docs only | 3 |
| Settings | DPDP, billing page | Profile PATCH | Org settings UI | — | Low | 1–2 |

---

## 4. Technical Capability Matrix

| Layer | Component | Status | Tag | Extend via |
|-------|-----------|--------|-----|------------|
| Frontend | Next.js 14 App Router | E | — | New pages in `app/(application)/` |
| Frontend | Recharts dashboards | E | — | New chart widgets |
| Frontend | shadcn/ui (13/48 used) | E / EN | EN | Reuse unused primitives |
| API | `route.js` catch-all | E | — | New roots under same handler |
| API | `mobile-routes.js` | E | EN | Bridge to cookie session |
| Auth | Emergent OAuth cookie | E | — | — |
| Auth | JWT mobile stack | E | EN | Web parity |
| Data | MongoDB `orgId` | E | — | New collections Phase 2+ |
| AI | `lib/scoring.js` | E | EN | `runAgentPrompt` pattern |
| AI | `lib/aeo/*` | E | EN | Server profile |
| AI | `config/aeo/*` | E | EN | `config/agents/`, `config/campaigns/` |
| Automation | n8n + webhooks | E | EN | New workflow JSON |
| Billing | `lib/billing/*` | E | EN | Recurring, enforcement |
| Deploy | Docker Compose | E | EN | Ops checklist |
| Caching | — | ❌ | N | Redis Phase 4+ (F) |
| Services layer | — | ❌ | — | Extend `lib/` not new `services/` |
| E2E tests | — | ❌ | N | Playwright Phase 2 |
| CI API tests | `backend_test.py` orphaned | EN | EN | Wire to CI |

---

## 5. AI Capability Matrix

| Capability | Status | Tag | Reuse | Phase |
|------------|--------|-----|-------|-------|
| Lead scoring (LLM + rules) | E | — | `aiScore`, `ruleScore` | — |
| Shelf-life prediction | E | — | `retail-ai.js` | — |
| AEO composite score | E | — | `compute.js` | — |
| Rule recommendations | E | — | `recommendations.js` | — |
| 8 generative prompts | E | — | `config/aeo/prompts/` | — |
| LLM gateway (Emergent) | E | — | `scoring.js` | — |
| LLM rate limit | E | — | `defaults.json` `llmCallsPerHour` | — |
| Server profile context | EN | EN | `users.preferences` | 1 |
| Daily growth recommendations | N | N | recommendations + agent | 2–3 |
| Business health monitoring | EN | EN | CS health rules → in-app | 2 |
| Marketing suggestions | EN | EN | prompts + Marketing Agent | 3 |
| SEO suggestions | N | N | new audit prompts | 3 |
| AEO suggestions | E | EN | existing stack | 1–2 |
| Review suggestions | E | EN | `review-reply` prompt | 2 |
| Lead recovery | EN | EN | stale rules + n8n WA | 2 |
| Lost deal recovery | N | N | Lost status + Sales Agent | 3 |
| Sales coaching | N | N | `byAgent` + Sales Agent | 3 |
| Executive coaching | N | N | Executive Advisor | 3 |
| Growth opportunities | EN | EN | growth scanner | 2 |
| Competitor tracking | F | F | — | 4+ |
| Campaign optimization | F | F | Campaign Agent | 4 |
| Revenue forecasting | N | N | `dashboard/revenue` | 3–4 |
| Customer health | EN | EN | `CUSTOMER_HEALTH_MODEL` | 2 |
| Renewal prediction | N | N | billing + CS Agent | 3 |
| Cross-sell / upsell | EN | EN | entitlements prompts | 2 |
| Multi-agent orchestration | F | F | `lib/agents/` | 3–5 |
| Autonomous consultant loop | F | F | Business Consultant | 5 |

---

## 6. Marketing Capability Matrix

| Capability | Status | Tag | Reuse | Phase |
|------------|--------|-----|-------|-------|
| Marketing website | E | — | `(marketing)/` | — |
| Pricing + checkout CTA | E | — | `pricing/page.js` | — |
| Contact form | E | — | `POST /api/contact` | — |
| GTM asset pack | E (docs) | — | `MARKETING_ASSETS.md` | — |
| AI content library | E (docs) | EN | `AI_CONTENT_LIBRARY.md` | 2 |
| Website audit | ❌ | N | audit prompts | 3 |
| SEO audit | ❌ | N | SEO Agent | 3 |
| AEO audit | EN | EN | AEO compute gaps | 2 |
| Keyword tracking | ❌ | N | third-party API | 3 |
| GBP optimization | EN | EN | `gbp-post` prompt | 2 |
| AI blog writer | ❌ | N | prompt pattern | 3–4 |
| AI landing page builder | ❌ | F | LLM + export | 4 |
| Social planner (IG/FB/LinkedIn) | ❌ | N | `social-caption` prompt | 3 |
| WhatsApp campaigns | EN | EN | `whatsapp.js`, n8n | 2 |
| Email campaigns | ❌ | N | SMTP + templates | 2 |
| Content calendar | ❌ | N | `campaigns` collection | 3 |
| Review management | EN | EN | review prompt + queue | 2–3 |
| Ad spend / ROI | ❌ | F | webhook leads only today | 4+ |
| Campaign wizard | ❌ | N | new UI | 3 |

---

## 7. CRM Capability Matrix

| Capability | Status | Tag | Reuse | Phase |
|------------|--------|-----|-------|-------|
| Lead CRUD | E | — | `route.js` leads | — |
| AI score Hot/Warm/Cold | E | — | `scoring.js` | — |
| 6-stage pipeline | E | — | `STATUSES` | — |
| KPI API + 4 charts | E | — | `GET /api/kpis` | — |
| Territory / source filters | E | — | leadedge360 | — |
| Agent assignment | EN | EN | assign API; hardcoded AGENTS | 1 |
| Lead detail dialog | E | — | leadedge360 | — |
| Lead detail route | EN | EN | leads API | 2 |
| Activity log | E | — | `lead_activities` | — |
| Activity timeline UI | EN | EN | lead detail | 2 |
| Rescore | E | — | rescore endpoint | — |
| WhatsApp deep link | E | — | lead row | — |
| Follow-ups (tasks) | EN | EN | `follow_ups` mobile API | 1 |
| WA conversation | EN | EN | mobile whatsapp API | 1 |
| Bulk CSV import | ❌ | N | POST leads | 2 |
| Pipeline kanban | EN | EN | `byStatus` | 2 |
| Opportunity module | ❌ | N | new collection | 3 |
| Proposal documents | ❌ | N | `documents` collection | 3–4 |
| Quotation | ❌ | N | proposal flow | 4 |
| Invoice from Won | ❌ | N | billing + leads | 4 |
| Customer 360 | ❌ | N | leads + activities + billing | 3 |
| Contact entity | EN | EN | fields on lead | 2 |
| Company entity | EN | EN | `company` field | 2 |
| Search page | EN | EN | header search | 2 |
| Team admin (web) | EN | EN | admin mobile API | 1 |

---

## 8. Customer Success Capability Matrix

| Capability | Status | Tag | Reuse | Phase |
|------------|--------|-----|-------|-------|
| Onboarding kit | E (docs) | EN | widget on dashboard | 2 |
| AI growth playbook | E (docs) | — | CS execution | — |
| Sales playbook | E (docs) | — | GTM | — |
| CS playbook | E (docs) | — | CS execution | — |
| Executive KPI guide | E (docs) | EN | bind KPIs to UI | 1 |
| Health model | E (docs) | EN | in-app score | 2 |
| Weekly WBR template | E (docs) | EN | automated digest | 2 |
| Commercial validation toolkit | E (docs) | — | Day 30 pack | — |
| Training academy | E (docs) | N | in-app modules | 3 |
| Tenant success dashboard | E (docs) | EN | live data feed | 0–1 |
| In-app NPS | ❌ | N | toolkit templates | 3 |
| Renewal automation | ❌ | N | billing subs | 2 |
| CS Agent nudges | ❌ | N | health + agent | 3 |
| ROI calculator in-app | ❌ | N | commercial toolkit | 3 |

---

## 9. Automation Capability Matrix

| Capability | Status | Tag | Reuse | Phase |
|------------|--------|-----|-------|-------|
| WA lead ingest | E | — | n8n + webhook | — |
| FB lead ingest | E | — | n8n + webhook | — |
| Google lead ingest | E | — | n8n + webhook | — |
| WA stale follow-up | E | — | n8n JSON | — |
| AEO profile reminder | E | — | n8n JSON | — |
| AEO FAQ nudge | E | — | n8n JSON | — |
| AEO review reminder | E | — | n8n JSON | — |
| Production n8n active | NOT VERIFIED | EN | ops import | 0–1 |
| Email automation | ❌ | N | SMTP | 2 |
| Status-change triggers | ❌ | N | route.js hooks | 2 |
| In-app workflow builder | ❌ | F | n8n remains backend IO | 4 |
| Invoice/renewal auto | ❌ | N | billing webhook | 2–3 |
| Webhook retry monitoring | EN | EN | ops + n8n | 2 |

---

## 10. AI Agent Architecture

### 10.1 Design principles

1. **Single LLM gateway:** `lib/scoring.js` → Emergent OpenAI proxy (`EMERGENT_LLM_KEY`, `gpt-4o-mini`) — **no new vendor**.  
2. **Config-driven agents:** `config/agents/{agent-id}.json` mirroring `config/aeo/prompts/*.json`.  
3. **Orchestration:** `lib/agents/registry.js` → `context.js` → `run.js` calling existing `runAeoPrompt` pattern.  
4. **Human approval** before WA, GBP, email, social publish.  
5. **Rule fallback** when LLM fails (`ruleScore`, `recommendations.js`).  
6. **Audit:** extend `audit_logs` with `agentId`, `action` — no new collection required.  
7. **Rate limits:** per-agent caps from `config/aeo/defaults.json` `llmCallsPerHour`.

### 10.2 Orchestration diagram

```
/dashboard (Growth Command Center)
├── AeoGrowthEngine.jsx        [E] compute + prompts + recommendations
├── Agent Panel                [N] Phase 3 — same panel pattern
└── Executive KPIs             [E] KpiCard + charts

lib/agents/context.js          [N] profile, kpis, leads slice (server)
lib/agents/run.js              [N] → lib/scoring.runAgentPrompt()
lib/aeo/compute.js             [E]
lib/aeo/recommendations.js     [E]
GET /api/kpis, /api/metrics    [E]

Emergent LLM API               [E]
n8n (heavy IO: send, ingest)   [E]
```

### 10.3 Agent catalog

| Agent | Tag | Phase | Reuses | New |
|-------|-----|-------|--------|-----|
| Sales Agent | N | 3 | `aiScore`, statuses, WA links | Coaching narrative |
| Marketing Agent | N | 3 | 8 prompts, content library | Campaign drafts |
| CRM Agent | N | 3 | `kpis`, `byAgent`, statuses | Pipeline hygiene |
| SEO Agent | N | 3 | keywords, local-page prompt | Audit integration |
| AEO Agent | EN | 2–3 | Full AEO stack | Orchestration |
| Content Agent | N | 3 | prompt pattern | Blog/landing drafts |
| WhatsApp Agent | EN | 2 | `whatsapp.js`, WA prompts | Scheduled sends |
| Email Agent | N | 2 | SMTP + templates | Sequences |
| Campaign Agent | F | 4 | n8n + campaigns | Multi-channel |
| Customer Success Agent | N | 3 | health model doc | Proactive nudges |
| Business Consultant | F | 4 | all agents | Daily briefing |
| Executive Advisor | N | 3 | KPI APIs, WBR | NL summaries |
| Operations Agent | N | 4 | `/api/health`, metrics | Ops alerts |
| Analytics Agent | N | 3 | `kpis`, mobile dashboard | Explain deltas |
| Growth Advisor | N | 3 | growth playbook | Weekly plan |
| Review Manager | EN | 2–3 | review-reply prompt | Approval queue |
| Proposal Agent | N | 3 | Proposal status | Doc drafts |
| Invoice Agent | N | 4 | billing collections | Post-Won assist |
| Industry Expert Agent | F | 5 | `config/industry/` | Vertical packs |

### 10.4 AI Business Growth continuous loop

| Beat | Mechanism | Tag | Phase |
|------|-----------|-----|-------|
| Morning briefing | Executive Advisor + KPIs | N | 3 |
| Profile gaps | AEO Agent + checklist | EN | 1–2 |
| Stale leads | CRM Agent + n8n WA | EN | 2 |
| Content draft | Marketing/Content Agent | EN | 2–3 |
| Campaign suggestion | Campaign Agent + rules | N | 3 |
| Review reply draft | Review Manager | EN | 2 |
| Revenue outlook | Analytics Agent + revenue API | N | 3 |
| Health alert | CS Agent + health widget | N | 2–3 |
| Weekly growth plan | Growth Advisor | N | 3 |
| Autonomous daily OS | Business Consultant | F | 5 |

---

## 11. Component Reuse Matrix

| New / enhanced capability | Reuse UI | Reuse lib | Reuse config |
|---------------------------|----------|-----------|--------------|
| Server AEO profile | `AeoGrowthEngine.jsx` | `profile.js`, `compute.js` | `business-profile-fields.json` |
| Agent panel | `AeoGrowthEngine` panel pattern | `scoring.js`, `actions.js` | `config/agents/` |
| Follow-ups web | `AppShell`, `Table`, `Dialog` | — | — |
| WA inbox web | Same + message list pattern | `whatsapp.js` | — |
| Admin users web | `AppShell`, forms | mobile admin handlers | — |
| Pipeline kanban | leadedge360 cards | — | — |
| Customer health | `KpiCard` | health rules (from CS doc) | — |
| Campaign wizard | AEO LLM button pattern | `runAeoPrompt` | `config/campaigns/` |
| Billing recurring | `/pricing`, `/billing` | `activate-payment.js` | `plan-entitlements.js` |
| Onboarding checklist | `KpiCard` row | — | onboarding kit sections |
| Executive narrative | `/dashboard` top card | agent run | — |
| Marketing dashboard | `KpiCard` + Recharts | `kpis` | — |
| Opportunity UI | lead detail dialog pattern | — | — |
| Quote/invoice | billing page pattern | `razorpay.js` | — |

---

## 12. API Reuse Matrix

| Capability | Existing API | Extension (same handler) | Bridge (JWT → cookie) |
|------------|--------------|--------------------------|------------------------|
| Leads | `GET/POST/PATCH/DELETE /api/leads` | bulk import, sources | — |
| KPIs | `GET /api/kpis` | history for AEO chart | — |
| Retail KPIs | `GET /api/retail-kpis` | — | — |
| Billing | `/api/billing/*` | recurring, invoices | — |
| Webhooks | `/api/webhooks/*` | retry metadata | — |
| Auth | `/api/auth/*` | `preferences` on me | — |
| Follow-ups | mobile `followups/*` | — | **E-002 bridge** |
| Dashboard revenue | mobile `dashboard/revenue` | — | **E-002 bridge** |
| WhatsApp | mobile `whatsapp/*` | — | **E-002 bridge** |
| Notifications | mobile `notifications/*` | — | **E-002 bridge** |
| Admin | mobile `admin/*` | — | **E-002 bridge** |
| Campaigns | — | `GET/POST /api/campaigns` | Phase 2 |
| Agents | `invokeAeoPrompt` pattern | `invokeAgent(agentId)` | Phase 3 |
| Growth audit | — | `GET /api/growth/audit` | Phase 2 |
| Opportunities | — | `/api/opportunities` | Phase 3 |
| Documents | — | `/api/documents` | Phase 3–4 |

**Rule:** Extend `route.js` and shared functions extracted from `mobile-routes.js` — do not create parallel API servers.

---

## 13. Database Reuse Matrix

| Collection | Status | Enhance | New fields / collections |
|------------|--------|---------|--------------------------|
| `leads` | E | EN | `documentIds[]`, opportunity link Phase 3 |
| `lead_activities` | E | — | — |
| `follow_ups` | E | EN | web bridge |
| `users` | E | EN | `preferences.aeoProfile`, `agentSettings` |
| `orgs` | E | EN | enforce entitlements |
| `payments` | E | EN | recurring metadata |
| `subscriptions` | E | EN | Razorpay sub ids |
| `audit_logs` | E | EN | `agentId`, `action` |
| `whatsapp_messages` | E | EN | web inbox |
| `notifications` | E | EN | web UI |
| `products` | E | — | — |
| `consent_log` | E | — | — |
| `contact_requests` | E | — | — |
| `campaigns` | ❌ | N | Phase 2 metadata |
| `documents` | ❌ | N | Phase 3 proposals/quotes |
| `invoices` | ❌ | N | Phase 4 |
| `opportunities` | ❌ | N | Phase 3 (or extend leads) |

**No Postgres migration.** `docs/sql/` remains reference only.

---

## 14. UI Reuse Matrix

| Surface | Route | Components | Status |
|---------|-------|------------|--------|
| Growth command | `/dashboard` | `KpiCard`, `AeoGrowthEngine`, product cards | E |
| Sales CRM | `/leadedge360` | charts, table, dialogs, AEO strip | E |
| Retail | `/retailedge360` | charts, SKU table | E |
| Billing | `/billing` | status cards | E |
| Marketing | `(marketing)/*` | `SiteShell`, pricing | E |
| Follow-ups | — | reuse `AppShell` + `Table` | N Phase 1 |
| WA inbox | — | reuse message list pattern | N Phase 1 |
| Admin | — | reuse forms + admin API | N Phase 1 |
| Agent panel | `/dashboard` | extend `AeoGrowthEngine` | N Phase 3 |
| Marketing dashboard | — | `KpiCard` + charts | N Phase 3 |
| Pipeline kanban | `/leadedge360` or sub-route | drag cards from table data | EN Phase 2 |
| Settings | — | `AppShell` + profile forms | EN Phase 2 |

**Tech debt (EN):** consolidate inline `Kpi` vs `KpiCard`; wire unused shadcn gradually; wire TanStack Query in `providers.js`.

---

## 15. Priority Matrix

| Priority | Theme | Epics / IDs | Horizon |
|----------|-------|-------------|---------|
| **P0** | Pilot truth | E-001, G-01–G-02, G-07, G-09 | M0 now |
| **P0** | GA blockers | E-002, E-003, E-004, EN #15–16, #20, #23 | M1 |
| **P1** | Team & channels | E-005–E-008, EN #17–19, #21, #29–30, #41, #62 | M1–M2 |
| **P2** | CRM & marketing depth | E-009–E-012, EN #25–27, #48, #54–55, #66–68 | M2 |
| **P3** | AI agents & BI | E-013–E-015, EN #91–96, #99, N #58–61 | M3 |
| **P4** | Revenue workspace | Quote, invoice, Campaign Agent | M4 |
| **P5** | Enterprise & OS vision | SSO, partner portal, autonomous loop | M5 |

---

## 16. Phase-wise Roadmap

### Phase 0 — Pilot truth (now, pre-freeze lift)

| Deliverable | Owner | Exit |
|-------------|-------|------|
| Close `02_INFRASTRUCTURE_CHECKLIST` | Ops | SSH + Docker parity |
| `03_AUTHENTICATED_VALIDATION` PASS | CS | Tenant #1 credentials |
| Populate `TENANT1_SUCCESS_DASHBOARD` | CS | Real `/api/kpis` |
| Import n8n workflows | Ops | NOT VERIFIED → verified |
| Razorpay/SMTP/LLM keys on prod | Ops | Health green |

### Phase 1 — Commercial GA (0–6 mo post-freeze)

**Epics:** E-002, E-003, E-004, E-005 (partial), E-006, E-007, E-008  
**Enhancements:** #15–20, #23–24, #29–30, #41, #62, #85–87  
**Exit:** Tenant #1 Healthy; checkout works; limits enforced; web follow-ups live.

### Phase 2 — Growth Automation (6–12 mo)

**Epics:** E-009–E-012, E-014 (start)  
**Enhancements:** #25–28, #35–40, #42–44, #48, #54–55, #60, #66–70, #80, #86  
**Exit:** ≥3 automations per tenant; email SMTP live; WA web inbox; pipeline board.

### Phase 3 — AI Business Growth (12–18 mo)

**Epics:** E-013, E-015 (start), E-016 (start)  
**Enhancements:** #31, #52–53, #58–61, #67, #71, #74, #91–96, #99  
**Exit:** Agent panel with 3+ agents; human-approve publish; revenue on web.

### Phase 4 — Autonomous Business Platform (18–24 mo)

**Deliverables:** Daily growth plan, auto-campaigns (capped), quote/invoice MVP, forecast, competitor watchlists (manual seed)  
**Enhancements:** #32–34, #49, #97–98, #100 (start)  
**Exit:** Business Consultant briefing; proposal-to-invoice path.

### Phase 5 — AI Business OS (24+ mo)

**Deliverables:** SSO, industry config packs, partner channel, autonomous loops with guardrails, marketplace integrations  
**Enhancements:** #72–73, #77, #50–51, #57, #100  
**Exit:** Enterprise Scale tier technically deliverable.

---

## 17. MVP Definition

**MVP = Commercial GA** — not full vision.

### In MVP (E + required EN)

| Item | Tag |
|------|-----|
| LeadEdge360 CRM core | E |
| AI lead scoring | E |
| `/dashboard` executive snapshot + AEO | E |
| RetailEdge360 (entitlement-gated) | E |
| WA/FB/Google capture + n8n ops pack | E |
| Razorpay checkout + **enforced limits** | E + EN |
| Server AEO profile | EN |
| Web follow-ups + admin users + WA inbox | EN |
| CS onboarding kit with **captured metrics** | EN |
| DPDP + legal pages | E |

### Out of MVP

| Item | Tag |
|------|-----|
| AI agent orchestra | N / F |
| Landing page generator | F |
| Proposal/quote/invoice PDF | N |
| Autonomous daily consultant | F |
| Native mobile app | N |
| SSO / enterprise RBAC | F |
| SEO audit platform | N |
| Partner portal | F |

---

## 18. Commercial GA Scope

| Workstream | Scope | Tag | Evidence |
|------------|-------|-----|----------|
| Legal / DPDP | Consent flows live | E | signin, `consent_log` |
| Pricing | Starter/Growth on `/pricing` | E | pricing page |
| Checkout | Razorpay prod keys; `/billing` stable | EN | Sprint 19A |
| Entitlements | `leadEnabled`, `retailEnabled`, limits enforced | EN | `plan-entitlements.js` |
| Onboarding | Execute `CUSTOMER_ONBOARDING_KIT.md` | E (docs) | CS |
| Proof | Tenant #1 case study template with real KPIs | EN | CS |
| Expansion | `TENANT_EXPANSION_READINESS.md` gates | E (docs) | CS |
| Support | enquiry@asoftechinsightz.com | E | marketing |
| Recurring billing | Annual manual OR Razorpay subs | EN | billing gap |
| Training | External academy docs | E (docs) | `TRAINING_ACADEMY.md` |

**GA gate:** PO sign-off when M1 exit + no open P1 in `EXECUTIVE_ACTION_REGISTER.md`.

---

## 19. Enterprise Scope

| Requirement | Tag | Phase | Notes |
|-------------|-----|-------|-------|
| RBAC web UI | EN | 2 | Reuse admin JWT APIs |
| Audit log viewer | EN | 2 | `audit_logs` exists |
| Multi-user provisioning web | EN | 1–2 | Admin web UI |
| Plan limits + usage reporting | EN | 1 | Enforcement |
| SSO (Scale tier) | F | 5 | Marketing promise |
| Dedicated VPC / on-prem deploy | F | 5 | Docker pattern exists |
| 99.95% SLA + status page | EN / N | 5 | Ops |
| Multi-region Mongo | F | 5+ | NOT VERIFIED at load |
| Data residency documentation | EN | — | DPDP present |
| Partner / commission portal | F | 5 | NAV V2 deferred |
| White-label agency mode | F | 5 | Config packs |

**Enterprise readiness today:** ~25/100 — MSME pilot suitable, not enterprise GA.

---

## 20. Future Vision

**North star:** One signup → LeadEdge360 becomes the owner's **AI-powered Business Growth Team** — invisible complexity, WhatsApp-first India workflows, evidence-tied recommendations, composable modules via entitlements.

**3-year pillars (v3):**

1. Owner sees "3 things to do today" — not CRM jargon  
2. Channel-agnostic growth (WA > Google > Facebook > web)  
3. Every AI action tied to KPI movement  
4. LeadEdge + Retail + future packs via `plan-entitlements.js`  
5. Partner channel white-label playbooks (Phase 5)  

**Data flywheel (reuse Mongo):**

```
Leads + statuses + scores → KPI APIs → rules → LLM drafts → owner actions → updated KPIs → better predictions (Phase 3+)
```

**Not in vision:** Rip-and-replace ERP; generic global CRM clone; microservices split.

**Autonomous AI Business Consultant (Phase 5):** Multi-agent daily loop with human approval gates for all customer-facing actions — India compliance + MSME trust.

---

## Domain Work Packages (full template)

Each domain below uses evidence from `PLATFORM_CURRENT_STATE` and strategy docs. Fields not applicable marked —.

---

### D-01 Lead Generation

| Field | Content |
|-------|---------|
| **Current capability** | Manual CRM entry, `POST /api/leads`, WA/FB/Google webhooks + n8n ingest, `source` field, AI score on create | **E** |
| **Existing components** | `leadedge360/page.js` create dialog; n8n `*-ingest.json` (3) |
| **Reusable APIs** | `POST /api/leads`, `POST /api/webhooks/{channel}` |
| **Reusable database** | `leads`, `lead_activities` |
| **Reusable UI** | Create lead dialog, source charts |
| **Reusable AI** | `aiScore()` on create |
| **Reusable automation** | n8n ingest workflows |
| **Missing** | Landing pages, lead magnets, Instagram ingest, ads ROI, bulk import, form builder UI | **N / F** |
| **Business value** | Top-of-funnel scale without owner marketing skill |
| **Customer value** | Leads from WA/FB/Google auto-captured and scored |
| **Priority** | P1 (import P2); magnets P3 |
| **Dependencies** | E-002 bridge; n8n ops |
| **Complexity** | M (import) · L (landing builder) |
| **Implementation** | EN: bulk POST leads; N: `campaigns` + landing export HTML; extend webhooks pattern for IG |
| **Acceptance criteria** | Import 500 leads tenant-scoped; webhook creates scored lead |
| **Testing** | `simulate` webhook; import integration test |
| **Release phase** | Phase 2 (import) · Phase 4 (landing) |

---

### D-02 CRM (core)

| Field | Content |
|-------|---------|
| **Current capability** | Full LeadEdge360: CRUD, filters, KPIs, charts, detail dialog, rescore, assign | **E** |
| **Existing components** | `leadedge360/page.js`, `AppShell`, Recharts |
| **Reusable APIs** | `/api/leads/*`, `/api/kpis` |
| **Reusable database** | `leads`, `lead_activities` |
| **Reusable UI** | Table, dialogs, charts |
| **Reusable AI** | `scoring.js` |
| **Reusable automation** | Status change → activity log |
| **Missing** | Detail route, kanban, real user agents, search page | **EN** |
| **Business value** | Core revenue workflow |
| **Customer value** | One place for pipeline |
| **Priority** | P0–P2 |
| **Dependencies** | E-002, E-003 |
| **Complexity** | M |
| **Implementation** | Extend existing page; no second CRM module |
| **Acceptance criteria** | WS3 CRM checklist PASS |
| **Testing** | Auth validation checklist; manual E2E |
| **Release phase** | Phase 1–2 |

---

### D-03 Contacts

| Field | Content |
|-------|---------|
| **Current capability** | Name, phone, email on lead document | **EN** (embedded) |
| **Reusable APIs** | Leads API |
| **Reusable database** | `leads` fields |
| **Missing** | Dedicated contact entity, contact list, dedup | **N** |
| **Priority** | P2 |
| **Phase** | 2 |
| **Tag** | EN → N |

---

### D-04 Companies

| Field | Content |
|-------|---------|
| **Current capability** | `company` string on lead | **EN** |
| **Missing** | Company records, multiple contacts per company | **N** |
| **Priority** | P2 |
| **Phase** | 2–3 |

---

### D-05 Customer 360

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Reusable** | `leads` Won, `lead_activities`, billing status on org, `whatsapp_messages` |
| **Missing** | Unified customer view post-Won | **N** |
| **Priority** | P2 |
| **Phase** | 3 |
| **Implementation** | Single page composing existing APIs — no new architecture |

---

### D-06 Sales Pipeline

| Field | Content |
|-------|---------|
| **Current capability** | 6 statuses, `byStatus` chart, status PATCH | **E** |
| **Missing** | Kanban board, drag-drop | **EN** |
| **Priority** | P2 |
| **Phase** | 2 |

---

### D-07 Opportunity Management

| Field | Content |
|-------|---------|
| **Current capability** | Metrics counter on live deploy only | **NOT VERIFIED UI** |
| **Missing** | Opportunity entity + UI | **N** |
| **Priority** | P2–P3 |
| **Phase** | 3 |
| **Implementation** | New `opportunities` collection OR extend leads with `type` — prefer extend leads first per minimal schema rule |

---

### D-08 Proposal

| Field | Content |
|-------|---------|
| **Current capability** | Pipeline status `Proposal` | **E** (status only) |
| **Missing** | Proposal document builder, PDF | **N** |
| **Reusable AI** | New prompt in `config/agents/proposal.json` |
| **Priority** | P3 |
| **Phase** | 3–4 |

---

### D-09 Quotation

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Dependencies** | Proposal, `documents` collection |
| **Priority** | P3 |
| **Phase** | 4 |
| **Tag** | **N** |

---

### D-10 Invoice

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Reusable** | `payments`, Razorpay, Won leads |
| **Priority** | P3 |
| **Phase** | 4 |
| **Tag** | **N** |

---

### D-11 Payments

| Field | Content |
|-------|---------|
| **Current capability** | Razorpay order, verify, webhook | **E** |
| **Missing** | Live key stability, invoice linkage | **EN** |
| **Priority** | P0 |
| **Phase** | 1 |

---

### D-12 Subscriptions

| Field | Content |
|-------|---------|
| **Current capability** | `subscriptions` collection, org entitlements on activate | **E** |
| **Missing** | Recurring Razorpay subs, trials | **EN / N** |
| **Priority** | P1 |
| **Phase** | 1–2 |

---

### D-13 Billing

| Field | Content |
|-------|---------|
| **Current capability** | Plans, checkout, verify, status, `/billing` UI | **E** |
| **Missing** | Limit enforcement, recurring, PDF invoices | **EN** |
| **Priority** | P0–P1 |
| **Phase** | 1 |

---

### D-14 Customer Success (in-product)

| Field | Content |
|-------|---------|
| **Current capability** | 18+ CS docs, health model external | **E (docs)** |
| **Missing** | Health widget, NPS, in-app playbooks | **EN / N** |
| **Reusable** | `kpis`, `CUSTOMER_HEALTH_MODEL.md` rules |
| **Priority** | P2 |
| **Phase** | 2–3 |

---

### D-15 Marketing (platform)

| Field | Content |
|-------|---------|
| **Current capability** | Marketing site, pricing, contact, GTM docs | **E** |
| **Missing** | Campaign OS, calendars, audits | **N** |
| **Priority** | P2–P3 |
| **Phase** | 2–3 |

---

### D-16 SEO

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Reusable AI** | `local-page` prompt, keywords in profile |
| **Missing** | On-page audit, keyword tracking | **N** |
| **Priority** | P3 |
| **Phase** | 3 |
| **Tag** | **N** (SEO Agent) |

---

### D-17 AEO

| Field | Content |
|-------|---------|
| **Current capability** | Full Growth Engine: 5 KPIs, 8 prompts, rules, checklist | **E** |
| **Missing** | Server profile, score history, publish workflow | **EN** |
| **Priority** | P0 |
| **Phase** | 1–2 |

---

### D-18 Google Business

| Field | Content |
|-------|---------|
| **Current capability** | GBP URL field, `gbp-post` prompt draft | **E / EN** |
| **Missing** | GBP API posting, review fetch | **N** |
| **Priority** | P2–P3 |
| **Phase** | 2–3 |

---

### D-19 Website (tenant)

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Missing** | Site auditor, health monitor | **N / F** |
| **Priority** | P3–P4 |
| **Phase** | 3–4 |

---

### D-20 Landing Pages

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Missing** | AI builder, hosting/export | **F** |
| **Priority** | P4 |
| **Phase** | 4 |

---

### D-21 Blog

| Field | Content |
|-------|---------|
| **Current capability** | Static blog marketing page | **EN** — dynamic posts NOT VERIFIED |
| **Missing** | CMS, AI writer | **N** |
| **Priority** | P3 |
| **Phase** | 3–4 |

---

### D-22 Content

| Field | Content |
|-------|---------|
| **Current capability** | 8 LLM prompts, `AI_CONTENT_LIBRARY.md` | **E** |
| **Missing** | Calendar, versioned drafts in DB | **N** |
| **Priority** | P2–P3 |
| **Phase** | 2–3 |

---

### D-23 WhatsApp

| Field | Content |
|-------|---------|
| **Current capability** | `wa.me` links, ingest webhook, mobile send/template/conversation | **E** |
| **Missing** | Web inbox, campaign sends | **EN** |
| **Priority** | P1 |
| **Phase** | 1–2 |

---

### D-24 Email

| Field | Content |
|-------|---------|
| **Current capability** | SMTP env (often missing on live) | **EN** |
| **Missing** | Templates, sequences, campaigns | **N** |
| **Priority** | P1–P2 |
| **Phase** | 2 |

---

### D-25 SMS

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Priority** | P4+ |
| **Phase** | 4+ |
| **Tag** | **N / F** |

---

### D-26 Campaigns

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Reusable** | n8n, `runAeoPrompt`, webhooks |
| **Missing** | `campaigns` collection, wizard UI | **N** |
| **Priority** | P3 |
| **Phase** | 3 |

---

### D-27 Automation (orchestration)

| Field | Content |
|-------|---------|
| **Current capability** | 7 n8n JSON workflows | **E** |
| **Missing** | In-app triggers, email auto, builder | **EN / N / F** |
| **Priority** | P1–P2 |
| **Phase** | 1–2 |

---

### D-28 Reviews & Reputation

| Field | Content |
|-------|---------|
| **Current capability** | Review health KPI, `review-reply` prompt | **E / EN** |
| **Missing** | Fetch reviews, approval queue, multi-platform | **N** |
| **Priority** | P2 |
| **Phase** | 2–3 |

---

### D-29 Analytics & BI

| Field | Content |
|-------|---------|
| **Current capability** | `kpis`, `retail-kpis`, charts, `/api/metrics` | **E** |
| **Missing** | Cohorts, marketing dashboard, cohort funnel | **N** |
| **Priority** | P2–P3 |
| **Phase** | 2–3 |

---

### D-30 Executive KPIs

| Field | Content |
|-------|---------|
| **Current capability** | `/dashboard`, `EXECUTIVE_KPI_GUIDE.md` mapping | **E** |
| **Missing** | AI narrative card, marketing/revenue split | **EN / N** |
| **Priority** | P1–P3 |
| **Phase** | 1–3 |

---

### D-31 Forecasting

| Field | Content |
|-------|---------|
| **Current capability** | Mobile `dashboard/revenue` JWT API | **EN** |
| **Missing** | Web UI, predictive model | **N** |
| **Priority** | P3 |
| **Phase** | 3–4 |

---

### D-32 AI Recommendations

| Field | Content |
|-------|---------|
| **Current capability** | `recommendations.js`, growth scanner in AEO UI | **E** |
| **Missing** | Agent narratives, scheduled refresh | **EN / N** |
| **Priority** | P2 |
| **Phase** | 2–3 |

---

### D-33 AI Agents

| Field | Content |
|-------|---------|
| **Current capability** | — (AEO partial orchestration) | **EN partial** |
| **Missing** | Registry, panel, 15 agents | **N / F** |
| **Priority** | P3 |
| **Phase** | 3–5 |
| **See** | §10 AI Agent Architecture |

---

### D-34 Partner Portal

| Field | Content |
|-------|---------|
| **Current capability** | — | **❌** |
| **Priority** | P5 |
| **Phase** | 5 |
| **Tag** | **F** |

---

### D-35 Admin Portal

| Field | Content |
|-------|---------|
| **Current capability** | JWT `admin/*` APIs | **E** |
| **Missing** | Web UI for users, roles, subscriptions | **EN** |
| **Priority** | P1 |
| **Phase** | 1 |

---

### D-36 Mobile

| Field | Content |
|-------|---------|
| **Current capability** | Full JWT API, OpenAPI, mobile docs program | **E** |
| **Missing** | Native app, web parity | **N / EN** |
| **Priority** | P2–P3 |
| **Phase** | 2–3 |
| **Freeze** | Backend frozen per `docs/mobile/README.md` until PO lift |

---

### D-37 Notifications

| Field | Content |
|-------|---------|
| **Current capability** | Mobile notifications + push devices API | **E** |
| **Missing** | Web notification center | **EN** |
| **Priority** | P2 |
| **Phase** | 2 |

---

### D-38 Support

| Field | Content |
|-------|---------|
| **Current capability** | `POST /api/contact`, contact_requests collection | **E** |
| **Missing** | Ticket/helpdesk integration | **N** |
| **Priority** | P3 |
| **Phase** | 3 |

---

### D-39 Training

| Field | Content |
|-------|---------|
| **Current capability** | `TRAINING_ACADEMY.md` | **E (docs)** |
| **Missing** | In-app academy | **N** |
| **Priority** | P3 |
| **Phase** | 3 |

---

### D-40 Settings

| Field | Content |
|-------|---------|
| **Current capability** | DPDP, billing page, sign-in profile via Emergent | **E / EN** |
| **Missing** | Org settings UI, AEO profile server PATCH, notification prefs web | **EN** |
| **Priority** | P1 |
| **Phase** | 1–2 |

---

## Implementation Backlog (Epics)

| Epic | Title | Tag | Priority | Phase | Est. | Dependencies |
|------|-------|-----|----------|-------|------|--------------|
| E-001 | Production validation closure | EN | P0 | 0 | S (ops) | SSH access |
| E-002 | Cookie↔JWT bridge | EN | P0 | 1 | M | — |
| E-003 | Server AEO profile | EN | P0 | 1 | M | E-002 optional |
| E-004 | Plan limit enforcement | EN | P0 | 1 | S | — |
| E-005 | Recurring billing | EN | P1 | 1–2 | L | Razorpay |
| E-006 | Follow-ups web UI | EN | P1 | 1 | M | E-002 |
| E-007 | Admin users web | EN | P1 | 1 | M | E-002 |
| E-008 | WA inbox web | EN | P1 | 1 | M | E-002 |
| E-009 | Lead detail route | EN | P2 | 2 | M | — |
| E-010 | Pipeline kanban | EN | P2 | 2 | M | — |
| E-011 | Bulk import | N | P2 | 2 | M | — |
| E-012 | SMTP + email templates | N | P2 | 2 | M | Ops SMTP |
| E-013 | Agent registry + 3 agents | N | P3 | 3 | L | E-003 |
| E-014 | Campaign entity + n8n | N | P3 | 3 | L | E-012 |
| E-015 | Opportunity + quote start | N | P3 | 3 | L | CRM |
| E-016 | Native mobile MVP | N | P3 | 3 | XL | OpenAPI |
| E-017 | Industry config packs | N | P4 | 4 | M | `config/aeo` pattern |

### Epic template example — E-003 Server AEO profile

| Field | Content |
|-------|---------|
| **Business value** | Profile survives devices; CS trusts completeness KPI |
| **Customer value** | No re-entry; team sees same business data |
| **Reusable components** | `AeoGrowthEngine.jsx`, `lib/aeo/profile.js`, `business-profile-fields.json` |
| **APIs** | Extend `GET /api/auth/me`; PATCH via bridged `/users/me` |
| **Database** | `users.preferences.aeoProfile` |
| **AI** | All prompts use server profile in context |
| **Automation** | n8n AEO reminders read server state |
| **Security** | Tenant-scoped |
| **Acceptance** | Profile persists across browsers; completeness % matches server |
| **Testing** | Extend `test-aeo-compute.mjs`; WS3 checklist |
| **Release** | R1.1 post-freeze lift |

---

## Digital Marketing Platform Design (suite map)

| Suite module | Tag | Phase | Reuse anchor |
|--------------|-----|-------|--------------|
| Website audit | N | 3 | audit prompts + KPI gaps |
| SEO audit | N | 3 | SEO Agent |
| AEO audit | EN | 2 | `compute.js` + checklist |
| Keyword tracking | N | 3 | profile keywords + external API |
| GBP optimization | EN | 2 | `gbp-post` prompt |
| AI blog writer | N | 3–4 | prompt pattern |
| AI landing builder | F | 4 | LLM + HTML export |
| Social planners (IG/FB/LinkedIn) | N | 3 | `social-caption` prompt |
| WA campaigns | EN | 2 | `whatsapp.js`, n8n |
| Email campaigns | N | 2 | SMTP + templates |
| Content calendar | N | 3 | `campaigns` collection |
| Review management | EN | 2–3 | review prompt + queue |

**Principle:** Draft in LeadEdge360 → human approve → publish externally until CMS integrated.

---

## Testing Strategy (platform)

| Layer | Current | Target | Phase |
|-------|---------|--------|-------|
| AEO compute | `npm run test:aeo` | + server profile cases | 1 |
| Billing | `npm run test:billing` | + recurring | 1–2 |
| API integration | `backend_test.py` orphaned | CI staging | 2 |
| E2E | testIds unused | Playwright critical paths | 2 |
| Auth validation | `03_AUTHENTICATED_VALIDATION` | CS manual + screenshots | 0 |
| Agent outputs | — | Golden JSON per prompt | 3 |
| n8n | POST_DEPLOY smoke | Per-tenant checklist | 0–1 |
| Load testing | NOT VERIFIED | Before enterprise | 5 |

---

## Release train

| Release | Contents | Gate |
|---------|----------|------|
| R0 | Docs + pilot validation | M0 |
| R1.1 | E-002–004 | PO freeze lift |
| R1.2 | E-005–008 | M1 |
| R2.0 | E-009–012, E-014 start | M2 |
| R3.0 | E-013, agents, revenue web | M3 |
| R4.0 | Quote/invoice, advanced automation | M4 |

---

## Dependency critical path

```
OPS-01 SSH / deploy parity
  → CS-01 authenticated validation
  → CS-02 Tenant #1 metrics
  → E-003 server AEO profile
  → E-002 JWT web bridge
  → E-004 plan limits
  → Phase 1 GA sign-off
```

---

## Evidence gaps (do not invent)

| Item | Label |
|------|-------|
| Tenant #1 CRM metrics | NOT CAPTURED |
| Live AEO in production container | NOT VERIFIED |
| n8n active on VPS | NOT CAPTURED |
| Load/performance at scale | NOT VERIFIED |
| Customer NPS / feedback | NOT CAPTURED |
| Blog dynamic posts | NOT VERIFIED |
| OpenAPI paths without handlers | NOT VERIFIED |

---

## Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 3 Aug 2026 | Enterprise strategy + backlog from approved sources |

**STOP** — Strategy complete. Implementation requires PO authorization to lift Product Freeze v1.0.

**Related:** [LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md) (Top 100 #1–100) · `docs/customer-success/EXECUTIVE_ACTION_REGISTER.md`
