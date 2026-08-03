# LeadEdge360 — Enhancements, Roadmap & AI Strategy

**Version:** 1.0  
**Date:** 3 August 2026  
**Parent:** [LEADEDGE360_STRATEGIC_ASSESSMENT.md](./LEADEDGE360_STRATEGIC_ASSESSMENT.md)  

**Tag legend:**  
- **E** = Already Exists  
- **EN** = Enhancement (extend existing)  
- **N** = New Capability  
- **F** = Future Vision  

---

## Top 100 Recommended Enhancements

| # | Enhancement | Tag | Domain | Priority | Complexity | Dependency |
|---|-------------|-----|--------|----------|------------|------------|
| 1 | Lead CRUD + AI score | E | CRM | — | — | `route.js` |
| 2 | Pipeline statuses New→Won | E | CRM | — | — | `STATUSES` |
| 3 | KPI dashboard + charts | E | BI | — | — | `/api/kpis` |
| 4 | AEO 5-KPI row + Growth Engine UI | E | AEO | — | — | `AeoGrowthEngine.jsx` |
| 5 | 8 LLM prompt templates | E | AEO | — | — | `config/aeo/prompts/` |
| 6 | Rule-based growth recommendations | E | AEO | — | — | `recommendations.js` |
| 7 | Retail SKU + shelf-life AI | E | Retail | — | — | `retail-ai.js` |
| 8 | WhatsApp/FB/Google webhooks | E | Lead gen | — | — | `route.js` |
| 9 | n8n ingest + follow-up JSON (7) | E | Automation | — | — | `n8n/` |
| 10 | Razorpay one-time checkout | E | Billing | — | — | Sprint 19A |
| 11 | Mobile JWT API surface | E | Mobile | — | — | `mobile-routes.js` |
| 12 | Marketing site + pricing | E | Marketing | — | — | `(marketing)/` |
| 13 | DPDP consent + privacy | E | Compliance | — | — | signin, privacy |
| 14 | Executive `/dashboard` overview | E | Executive | — | — | `dashboard/page.js` |
| 15 | Server persist AEO profile (`users.preferences`) | EN | AEO | P0 | M | Cookie auth bridge |
| 16 | Web session bridge to JWT routes | EN | Platform | P0 | L | `tenant.js` |
| 17 | Follow-ups inbox (web) | EN | CRM | P1 | M | JWT bridge |
| 18 | Admin users web UI | EN | Admin | P1 | M | JWT bridge |
| 19 | WhatsApp conversation UI (web) | EN | WhatsApp | P1 | M | Existing mobile API |
| 20 | Plan limit enforcement (leads/users) | EN | Billing | P0 | M | `plan-entitlements.js` |
| 21 | Recurring Razorpay subscriptions | EN | Billing | P1 | L | `razorpay.js` |
| 22 | Invoice PDF generation | EN | Billing | P2 | M | Payments collection |
| 23 | `/billing` route stable on live | EN | Billing | P0 | S | Deploy parity |
| 24 | Hard product gating UI | EN | Billing | P1 | S | Entitlements |
| 25 | Lead detail page `/crm/leads/[id]` | EN | CRM | P2 | M | `SPRINT19_NAVIGATION_V2` |
| 26 | Pipeline kanban view | EN | CRM | P2 | L | Lead APIs |
| 27 | Bulk CSV lead import | N | Lead gen | P2 | M | Leads API |
| 28 | Custom lead sources UI | N | Lead gen | P2 | S | `POST /api/leads/sources` (doc only) |
| 29 | Lead assignment to real users | EN | CRM | P1 | M | Admin users |
| 30 | Replace hardcoded AGENTS | EN | CRM | P1 | S | Users collection |
| 31 | Opportunity entity + UI | N | CRM | P2 | L | New collection or status extension |
| 32 | Proposal document builder | N | Sales | P3 | L | CRM |
| 33 | Quotation PDF | N | Sales | P3 | L | Proposal |
| 34 | Invoice from Won lead | N | Sales | P3 | L | Billing |
| 35 | Customer record post-Won | EN | CRM | P2 | M | Extend leads |
| 36 | Activity timeline on lead detail | EN | CRM | P2 | M | `lead_activities` |
| 37 | Notes field enrichment UI | EN | CRM | P2 | S | Lead `message` |
| 38 | Search results page | EN | CRM | P2 | S | Header search exists |
| 39 | Agent performance coaching view | EN | CRM | P2 | M | `byAgent` KPI |
| 40 | Territory management admin | EN | CRM | P2 | M | Config vs hardcoded |
| 41 | Email SMTP production config | EN | Marketing | P0 | S | Env |
| 42 | Transactional email templates | N | Marketing | P2 | M | SMTP |
| 43 | Email campaign sequences | N | Marketing | P3 | L | Automation |
| 44 | In-app campaign wizard | N | Marketing | P3 | L | Campaigns |
| 45 | Social post scheduler | N | Marketing | P3 | L | External APIs |
| 46 | GBP post API integration | N | AEO | P3 | L | Google APIs |
| 47 | Review fetch from Google | N | AEO | P3 | L | GBP API |
| 48 | Auto review reply (approve flow) | EN | AEO | P2 | M | Review prompt exists |
| 49 | Blog AI generator + CMS | N | Content | P3 | L | Marketing |
| 50 | Landing page AI builder | F | Marketing | P4 | XL | CMS |
| 51 | Website broken-link monitor | F | SEO | P4 | L | External crawler |
| 52 | Keyword rank tracking | N | SEO | P3 | L | Third-party API |
| 53 | On-page SEO auditor | N | SEO | P3 | L | Crawler |
| 54 | Local page generator (publish) | EN | AEO | P2 | M | `local-page` prompt |
| 55 | FAQ publish to website | EN | AEO | P2 | M | FAQs in profile |
| 56 | AEO score history chart | EN | AEO | P2 | M | Server profile |
| 57 | Competitor profile tracking | F | BI | P4 | L | External data |
| 58 | Revenue forecast model | N | BI | P3 | L | `dashboard/revenue` API |
| 59 | Deal loss prediction | N | AI | P3 | L | Historical leads |
| 60 | Churn risk on stale leads | EN | AI | P2 | M | Rules exist partially |
| 61 | Executive AI narrative weekly | N | Executive | P3 | M | KPI + LLM |
| 62 | MRR dashboard wiring | EN | BI | P1 | S | `/api/metrics` |
| 63 | Cohort conversion analytics | N | BI | P3 | L | KPI history |
| 64 | POS / retail transaction link | EN | Retail | P2 | M | Metrics counter |
| 65 | Cross-product executive rollup | EN | Executive | P1 | M | Dashboard exists |
| 66 | Customer health score in-app | EN | CS | P2 | M | `CUSTOMER_HEALTH_MODEL` |
| 67 | NPS survey in-app | N | CS | P3 | M | Commercial toolkit |
| 68 | Onboarding checklist widget | EN | CS | P2 | M | Onboarding kit |
| 69 | Renewal reminder automation | N | CS | P2 | M | Billing subs |
| 70 | Expansion upsell prompts | EN | CS | P2 | S | Entitlements |
| 71 | Training module in-app | N | CS | P3 | L | Academy content |
| 72 | Partner portal | F | Partners | P5 | XL | Not started |
| 73 | Commission tracking | F | Partners | P5 | XL | NAV V2 deferred |
| 74 | Support ticket integration | N | Support | P3 | M | External helpdesk |
| 75 | Status page | EN | Ops | P2 | S | POST_DEPLOY |
| 76 | Audit log viewer (web) | EN | Enterprise | P2 | M | `audit_logs` |
| 77 | SSO (Scale) | F | Enterprise | P5 | XL | Marketing promise |
| 78 | Role-based nav (web) | EN | Enterprise | P2 | M | Admin roles API |
| 79 | Native mobile app (RN) | N | Mobile | P3 | XL | Mobile API |
| 80 | Push notifications delivery | EN | Mobile | P2 | M | `notifications` API |
| 81 | Offline lead capture mobile | N | Mobile | P3 | L | Offline strategy doc |
| 82 | OTP login web parity | EN | Auth | P2 | M | `mobile-routes` auth |
| 83 | Password login web | EN | Auth | P2 | M | Exists mobile |
| 84 | OAuth signup enable | EN | Auth | P1 | S | Health shows false |
| 85 | Trial auto-provisioning | EN | Billing | P1 | M | `trialProvisioningAvailable` |
| 86 | Webhook retry + monitoring | EN | Ops | P2 | M | n8n |
| 87 | Seed-reset guard production | EN | Ops | P0 | S | `seed-reset` API |
| 88 | Remove dead shadcn components | EN | Tech debt | P2 | S | TECH_DEBT_REPORT |
| 89 | Wire TanStack Query provider | EN | Tech debt | P3 | S | `providers.js` |
| 90 | Consolidate duplicate KPI components | EN | UI | P2 | S | Kpi vs KpiCard |
| 91 | Sales Agent (LLM) | N | AI Agent | P3 | L | `scoring.js` pattern |
| 92 | Marketing Agent | N | AI Agent | P3 | L | AEO prompts |
| 93 | SEO Agent | N | AI Agent | P3 | L | AEO + SEO EN |
| 94 | AEO Agent (orchestrator) | EN | AI Agent | P2 | M | Exists partial |
| 95 | CRM Agent (pipeline coach) | N | AI Agent | P3 | M | KPI + leads |
| 96 | Customer Success Agent | N | AI Agent | P3 | M | Health model |
| 97 | Business Consultant (daily briefing) | F | AI Agent | P4 | XL | All agents |
| 98 | Campaign Manager Agent | F | AI Agent | P4 | L | Campaigns N |
| 99 | Executive Advisor Agent | N | AI Agent | P3 | L | BI APIs |
| 100 | Autonomous growth loop (daily) | F | Platform | P5 | XL | Phase 5 vision |

---

## v2 Roadmap — Phased (reuse architecture)

### Phase 1 — Commercial GA (0–6 months post-freeze lift)

**Goal:** Paying MSME customers onboard with confidence on **existing** modules.

| Workstream | Deliverables | Reuse |
|------------|--------------|-------|
| Production truth | Close infra + auth validation; deploy parity | Ops checklists |
| Identity bridge | Cookie ↔ JWT for web follow-ups, admin, profile PATCH | `mobile-routes.js` |
| AEO persistence | Server profile; `auth/me` preferences read | `users` collection |
| Billing GA | Recurring subs OR clear annual manual; plan limits enforced | Sprint 19A |
| CRM polish | Lead detail route, real agents from users, search page | `leadedge360` |
| CS execution | Tenant #1 → Tenant #2 with captured metrics | CS docs |
| Tech debt | Remove worst dead UI; fix `/billing` live | TECH_DEBT |

**Exit criteria:** Tenant #1 Healthy tier; checkout works; WS3 PASS; expansion gates §2–3 green in `TENANT_EXPANSION_READINESS.md`.

---

### Phase 2 — Growth Automation (6–12 months)

**Goal:** MSME owner gets **daily automated growth actions** without marketing expertise.

| Workstream | Deliverables |
|------------|--------------|
| Follow-ups & tasks | Web inbox; n8n standard ops pack |
| Email | SMTP + transactional + simple sequences |
| WhatsApp | Web inbox; template library from `AI_CONTENT_LIBRARY` |
| Campaigns | Rule-triggered WA/email from lead status |
| CRM | Pipeline board; bulk import; opportunity object (minimal) |
| Retail cross-sell | Dashboard prompts when retail licensed |
| BI | Revenue API on web; MRR widget; weekly email digest |

**Exit criteria:** ≥3 automations active per tenant; follow-up SLA measurable.

---

### Phase 3 — AI Business Growth (12–18 months)

**Goal:** **AI Business Consultant** layer — specialized agents on existing LLM stack.

| Agent | Reuse | New |
|-------|-------|-----|
| AEO Agent | 8 prompts + rules | Orchestration, scheduling |
| Sales Agent | Scoring + pipeline | Deal coaching, loss reasons |
| Marketing Agent | Content library | Campaign drafts |
| SEO Agent | Local page prompt | Audit integration |
| CS Agent | Health model | Proactive nudges in UI |
| Executive Advisor | KPI APIs | Natural language briefings |

**Deliverables:** Agent panel on `/dashboard`; human-approve-then-publish for all external content; ROI tracking hooks in `COMMERCIAL_VALIDATION_TOOLKIT`.

---

### Phase 4 — Autonomous Business Platform (18–24 months)

**Goal:** Platform proposes and executes **approved** growth programs.

- Daily growth plan (“3 actions today”)  
- Auto-campaigns with budget caps  
- Review + GBP workflows with approval queue  
- Predictive pipeline + revenue forecast  
- Competitor watchlists (manual seed + alerts)  

**Constraint:** Human approval gates for customer-facing actions (India compliance + trust).

---

### Phase 5 — AI Business Operating System (24+ months)

**Goal:** Sign up once → continuous growth partner.

- Unified data graph: leads, customers, content, campaigns, revenue  
- Autonomous loops with guardrails  
- Industry playbooks (clinic, retail, services) as **config packs** atop `config/aeo/` pattern  
- Enterprise: SSO, audit, VPC option (Scale tier)  
- Marketplace: integrations (Zoho export, Tally, etc.) — **N**, not replacement  

---

## v3 Vision (3-year horizon)

LeadEdge360 becomes the **default AI growth layer for Indian MSMEs**:

1. **Invisible complexity** — owner sees “3 things to do today,” not CRM jargon  
2. **Channel-agnostic** — WhatsApp-first but equal web, Google, social  
3. **Proof-based** — every recommendation tied to KPI movement (`EXECUTIVE_KPI_GUIDE`)  
4. **Composable** — LeadEdge + Retail + future modules via entitlements  
5. **Partner channel** — agencies white-label growth playbooks (Phase 5)  

**Not v3:** Rip-and-replace ERP; generic global CRM clone.

---

## AI Agent Catalog (recommended)

| Agent | Role | Phase | Reuses |
|-------|------|-------|--------|
| **Sales Agent** | Prioritize leads, suggest next action, draft WA | 3 | `scoring.js`, leads API |
| **Marketing Agent** | Campaigns, captions, email copy | 3 | `AI_CONTENT_LIBRARY`, prompts |
| **SEO Agent** | Keywords, meta, local pages | 3 | AEO keywords, local-page prompt |
| **AEO Agent** | Profile gaps, FAQ, score improvement plan | 2–3 | `compute.js`, checklist |
| **CRM Agent** | Status hygiene, stale pipeline alerts | 3 | `kpis`, statuses |
| **Proposal Agent** | Follow-up on Proposal stage | 3 | Status + prompts |
| **Invoice Agent** | Post-Won billing assist | 4 | Billing module |
| **Customer Success Agent** | Health tier, renewal risk | 3 | Health model |
| **Support Agent** | Ticket triage suggestions | 4 | Contact API |
| **Business Consultant** | Daily executive briefing | 4 | All KPIs + agents |
| **Growth Advisor** | Weekly growth plan | 3 | Growth playbook |
| **Website Auditor** | Broken links, speed tips | 4 | External crawl |
| **Review Manager** | Reply drafts + pending queue | 2–3 | review-reply prompt |
| **Campaign Manager** | Multi-channel campaign build | 4 | n8n + new UI |
| **Content Creator** | Blogs, landing copy | 3 | prompt pattern |
| **Analytics Agent** | Explain KPI deltas | 3 | `kpis`, metrics |
| **Executive Advisor** | Board-ready summaries | 3 | WBR template |

**Implementation pattern (no architecture change):**  
`config/agents/*.json` prompts + `lib/agents/runAgent()` mirroring `runAeoPrompt()` in `scoring.js`; UI as panels in `AeoGrowthEngine` pattern.

---

## Long-term AI Business Growth Strategy

### North star

> **One signup → continuous, understandable growth guidance** for owners who do not know SEO, AEO, ads, or CRM.

### Strategic pillars

1. **Evidence-first AI** — Every suggestion links to a KPI or checklist item (already in AEO Phase-1).  
2. **Config over code** — Prompts, rules, checklists in `config/` (freeze-friendly).  
3. **Human-in-the-loop publish** — Draft → approve → external channel (GBP, WA, web).  
4. **India channel priority** — WhatsApp > Google > Facebook > web (already in n8n + sources).  
5. **Grow on CRM data** — More leads + statuses → better recommendations (growth scanner exists).  
6. **Module entitlements** — LeadEdge / Retail / future packs via `plan-entitlements.js`.  

### Data flywheel (reuse Mongo collections)

```
Leads + statuses + scores
  → KPI APIs
  → Rule recommendations
  → LLM drafts
  → Owner actions (status, WA, profile)
  → Updated KPIs / AEO score
  → Better predictions (Phase 3+)
```

### Competitive moat (documentation-based, not invented positioning)

- **AEO + CRM unified** — Already built; competitors rarely combine  
- **MSME India workflows** — WA, territories, ₹ pricing  
- **Dual product** — Retail expiry + leads for hybrid MSMEs  
- **CS playbooks shipped** — 18+ CS docs reduce time-to-value  

### Risks to strategy

| Risk | Mitigation |
|------|------------|
| Live ≠ RC | Close OPS-01 before scaling CS promises |
| sessionStorage profile | Phase 1 server sync |
| Over-promising autonomous AI | Phase tags in sales; approval gates |
| Enterprise distraction | Scale tier manual; Phase 5 SSO |
| LLM cost | Hybrid rules default; `llmCallsPerHour` cap exists |

### Success metrics (platform — from existing APIs)

Track weekly via `SUCCESS_METRICS_BASELINE.md`: leads, qualified, won, conversion, AEO score, active users, MRR when configured — **do not invent targets until Tenant #1 baseline captured**.

---

## Dependency graph (Phase 1 critical path)

```
OPS-01 SSH / deploy parity
    → CS-01 authenticated validation
    → CS-02 Tenant #1 metrics
    → EN-15 server AEO profile
    → EN-16 JWT web bridge
    → EN-20 plan limits
    → Phase 1 GA sign-off
```

---

**Related:** `docs/customer-success/EXECUTIVE_ACTION_REGISTER.md` · `docs/aeo/README.md` · `CHANGELOG_SPRINT19A.md`
