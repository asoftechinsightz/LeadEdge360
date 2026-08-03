# LeadEdge360 — Business Growth OS Architecture & Execution Plan

**Version:** 1.0  
**Date:** 3 August 2026  
**Status:** Architecture & planning — **no code changes** (Product Freeze v1.0)  
**Audience:** CPO, CTO, Engineering (post-freeze), CS, GTM  

**Related:**  
- [LEADEDGE360_STRATEGIC_ASSESSMENT.md](./LEADEDGE360_STRATEGIC_ASSESSMENT.md)  
- [LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md)  
- `docs/customer-success/` · `docs/aeo/` · `docs/mobile/`  

---

## Executive framing

LeadEdge360’s **mission** (AI Business Growth OS) exceeds its **current implementation** (dual-product CRM workspace + client AEO + n8n automation + mobile API). The correct path is **extension on the existing Next.js + MongoDB + Emergent LLM + n8n stack** — not replacement.

**Current maturity:** Product 47 · Commercial 38 · AI 41 (see Strategic Assessment).  
**Pilot operations:** READY WITH CONDITIONS — Tenant #1 metrics NOT CAPTURED.

---

## 1. Current Capability Assessment

### 1.1 By product pillar (vision vs codebase)

| Pillar | Already exists | Partial | Missing | Evidence |
|--------|----------------|---------|---------|----------|
| **1. AI Lead Generation** | WA/FB/Google webhooks, manual lead, API POST, referral source, AI score | Campaign tracking via `bySource` | Instagram ingest, landing builder, partner leads, form builder UI | `route.js`, `n8n/` |
| **2. CRM** | Lead CRUD, 6 statuses, score, territories, charts, activities, WA link | Company on lead, notes in `message` | Contact/Company entities, Opportunity UI, Proposal/Quote/Invoice docs, Customer 360, web follow-ups | `leadedge360/page.js`, `mobile-routes.js` |
| **3. AI Growth Engine** | AEO score, completeness, FAQ, local, review KPIs; 8 prompts; rules; checklist | SEO as separate score | Website health audit, daily plan in-app | `AeoGrowthEngine.jsx`, `config/aeo/` |
| **4. Digital Marketing** | Marketing site, contact API, content prompts | GBP/review drafts (manual publish) | Site/SEO/AEO audits, calendar, blog CMS, email/SMS campaigns | `(marketing)/`, prompts |
| **5. Business Automation** | 7 n8n workflows, status pipeline | Proposal = status only | In-app workflows, invoice/renewal auto, lead assignment to real users | `n8n/`, entitlements |
| **6. Customer Success** | 18+ CS docs, health model (external) | — | In-app health, NPS, ROI widgets | `docs/customer-success/` |
| **7. Executive Intelligence** | `/dashboard`, KPI APIs, charts, `/api/metrics` | Revenue API (JWT only) | Forecasting, marketing/sales split dashboards, AI narrative | `dashboard/page.js` |

### 1.2 Industry focus (today)

| Industry | Fit today | Extension path |
|----------|-----------|----------------|
| Retail | **Strong** — RetailEdge360 | Entitlements `retailEnabled` |
| Services | **Strong** — LeadEdge + AEO | Default MSME playbook |
| Healthcare / Education / etc. | **Generic** — no vertical packs | `config/industry/*.json` (future config, not new architecture) |
| Real Estate / Finance | **Generic** — territory + pipeline | Industry Expert Agent + templates |

**Vertical features:** NOT VERIFIED as industry-specific code — all horizontal today.

### 1.3 Module inventory (reuse anchors)

| Module | Path | Role |
|--------|------|------|
| API router | `app/api/[[...path]]/route.js` | All web + webhook routes |
| Mobile API | `lib/mobile-routes.js` | JWT: followups, dashboard, admin, WA |
| Lead AI | `lib/scoring.js` | `aiScore`, `runAeoPrompt` |
| Retail AI | `lib/retail-ai.js` | Shelf-life prediction |
| AEO core | `lib/aeo/*`, `components/aeo/` | Growth Engine UI + logic |
| Billing | `lib/billing/*`, `lib/razorpay.js` | Sprint 19A |
| Tenant | `lib/tenant.js` | `orgId`, Emergent cookie |
| Automation | `n8n/*.json` | External workflows |
| UI shell | `AppShell`, `KpiCard`, shadcn subset | Application chrome |

---

## 2. Gap Analysis

### 2.1 Vision pillars → gap summary

| Gap class | Examples | Phase |
|-----------|----------|-------|
| **Auth / platform** | Cookie vs JWT split; no web follow-ups/admin | 1 GA |
| **Persistence** | AEO profile `sessionStorage` only | 1 GA |
| **Commercial** | No recurring billing; limits not enforced | 1 GA |
| **CRM depth** | No opportunity, quotation, invoice, customer 360 | 2 |
| **Marketing execution** | No audits, calendars, campaigns in-app | 2–3 |
| **Automation UX** | n8n only; no in-app workflow builder | 2–3 |
| **AI agents** | No orchestration layer | 3 |
| **Autonomy** | No daily consultant loop | 4–5 |
| **Enterprise** | SSO, web RBAC, SLA | 5 |
| **Production proof** | Tenant #1 data NOT CAPTURED | 0 (now) |

### 2.2 Duplicate / debt (do not rebuild)

| Item | Action |
|------|--------|
| `/app/*` stubs vs `/leadedge360` | **Enhance** — redirect to real pages; don’t duplicate CRM |
| `Kpi` inline vs `KpiCard` | **Consolidate** UI component |
| 36 unused shadcn components | **Remove** from bundle over time |
| OpenAPI paths without handlers | **Implement or remove** from spec |
| Postgres SQL docs vs Mongo runtime | **Keep docs** as reference only |

---

## 3. Component Reuse Matrix

| New capability | Reuse UI | Reuse lib | Reuse API | Reuse config | Reuse automation |
|----------------|----------|-----------|-----------|--------------|------------------|
| Server AEO profile | `AeoGrowthEngine.jsx` | `profile.js` → PATCH users | Extend `auth/me` | `business-profile-fields.json` | — |
| Web follow-ups | `AppShell`, `Table`, `Dialog` | — | Bridge to `mobile-routes` followups | — | — |
| Daily growth plan | `AeoGrowthEngine` recommendations panel | `recommendations.js` | `kpis` + profile | `readiness-checklist.json` | n8n reminders |
| Campaign drafts | AEO LLM buttons pattern | `runAeoPrompt` | — | New `config/campaigns/` prompts | n8n send |
| Pipeline board | `leadedge360` table + `byStatus` | — | `GET /api/leads` | — | — |
| Executive briefing | `/dashboard` | `compute.js` | `kpis`, `metrics` | — | — |
| AI agents | `AeoGrowthEngine` panel pattern | `scoring.js` LLM call | Existing endpoints | `config/aeo/prompts/` → `config/agents/` | n8n |
| Customer health in-app | `KpiCard` | Health rules from CS doc | `kpis` + adoption | — | — |
| Billing recurring | `/pricing`, `/billing` | `activate-payment.js` | Razorpay subs API | `plan-entitlements.js` | webhook |
| Mobile app | — | All `mobile-routes.js` | OpenAPI | `docs/mobile/` | push API |

---

## 4. AI Agent Architecture

### 4.1 Principles

- **Single LLM gateway:** `lib/scoring.js` → Emergent OpenAI proxy (`EMERGENT_LLM_KEY`, `gpt-4o-mini`).
- **Config-driven agents:** JSON prompts like `config/aeo/prompts/*.json` → `config/agents/{agent-id}.json`.
- **No new LLM vendor** in Phase 1–3.
- **Human approval** before external publish (WA, GBP, email, social).
- **Rule fallback** when LLM fails (existing `ruleScore`, `recommendations.js`).

### 4.2 Orchestration model (extend, not replace)

```
┌─────────────────────────────────────────────────────────┐
│  /dashboard — Growth Command Center                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ AEO Engine  │  │ Agent Panel  │  │ Executive KPIs  │ │
│  │ (exists)    │  │ (Phase 3)    │  │ (exists)        │ │
│  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘ │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          ▼                 ▼                  ▼
   lib/aeo/compute    lib/agents/run.js   GET /api/kpis
   lib/aeo/recommendations   │            GET /api/metrics
          │                 │                  │
          └────────┬────────┴──────────────────┘
                   ▼
            lib/scoring.runAgentPrompt()
                   │
                   ▼
         Emergent LLM API (existing)
```

### 4.3 Agent catalog → existing reuse

| Agent | Phase | Reuses today |
|-------|-------|--------------|
| Sales Agent | 3 | `aiScore`, lead statuses, WA deep links |
| Marketing Agent | 3 | 8 AEO prompts, `AI_CONTENT_LIBRARY` |
| CRM Agent | 3 | `kpis`, `byAgent`, stale lead rules |
| SEO Agent | 3 | keywords, local-page prompt |
| AEO Agent | 2–3 | Full AEO stack |
| CS Agent | 3 | `CUSTOMER_HEALTH_MODEL` rules |
| Proposal Agent | 3 | Proposal status + followups |
| Invoice Agent | 4 | Billing collections (future invoice docs) |
| Campaign Agent | 4 | n8n + new campaign config |
| WhatsApp Agent | 2 | `lib/whatsapp.js`, WA prompts |
| Email Agent | 2 | SMTP + new templates |
| Analytics Agent | 3 | `kpis`, mobile `dashboard/*` |
| Growth Consultant | 3 | `recommendations.js` + agents |
| Business Consultant | 4 | Multi-agent daily plan |
| Executive Advisor | 3 | KPI APIs + LLM summary |
| Operations Agent | 4 | `/api/health`, metrics |
| Industry Expert Agent | 5 | Config packs per vertical |

### 4.4 Agent runtime (proposed — post-freeze)

| Piece | Design |
|-------|--------|
| `lib/agents/registry.js` | Maps agentId → prompt file + required context keys |
| `lib/agents/context.js` | Gathers profile, kpis, leads slice (server-side) |
| `lib/agents/run.js` | Calls `runAeoPrompt` pattern with agent template |
| Rate limit | Reuse `llmCallsPerHour` from `config/aeo/defaults.json` |
| Audit | Extend `audit_logs` with `agentId`, `action` (no new collection required) |

---

## 5. Unified Business Growth Architecture

### 5.1 Layer model (current + target)

| Layer | Current | Target (same stack) |
|-------|---------|---------------------|
| **Experience** | Dashboard, LeadEdge, Retail, Marketing | + Agent panel, campaigns, follow-ups inbox |
| **Growth intelligence** | AEO compute + rules | + Agent orchestration + daily plan |
| **CRM & revenue** | Leads + statuses | + Opportunities, quotes, invoices (collections) |
| **Capture** | Webhooks + forms | + Landing pages (generated, hosted) |
| **Automation** | n8n | + In-app triggers; n8n for heavy IO |
| **Data** | Mongo collections | + extend `users.preferences`, optional `campaigns`, `documents` |
| **AI** | Emergent LLM | Same gateway, more prompts/agents |
| **Mobile** | JWT API | Native client on same API |

### 5.2 Data model extensions (minimal — extend schema)

| Collection | Change type | Purpose |
|------------|-------------|---------|
| `users` | **Enhance** | `preferences.aeoProfile`, `preferences.agentSettings` |
| `leads` | **Enhance** | Already has `budget`, `company`; add `documentIds[]` later |
| `follow_ups` | **Reuse** | Already used by mobile — bridge to web |
| `orgs` | **Reuse** | Plan, entitlements — enforce limits |
| `campaigns` | **New** (Phase 2) | Campaign metadata; sends via n8n/WA/email |
| `documents` | **New** (Phase 3) | Proposal/quote PDF refs |
| `invoices` | **New** (Phase 3) | Links to Razorpay + lead |

**Rule:** No Postgres migration; no microservices split.

### 5.3 API strategy (extend `route.js` + bridge JWT)

| Need | Approach |
|------|----------|
| Web follow-ups | Call `mobile-routes` handlers from cookie session OR duplicate thin handlers in `route.js` with shared service functions |
| Profile PATCH | Extend `GET/PATCH /api/auth/me` with `preferences` (read-only first) |
| Campaigns | `GET/POST /api/campaigns` (Phase 2) |
| Agents | Server action `invokeAgent(agentId)` mirroring `invokeAeoPrompt` |
| Audits | `GET /api/growth/audit` — LLM + rules, no external crawl in Phase 2 |

---

## 6. Development Backlog (prioritized epics)

| Epic | Priority | Business value | Reuse | Est. |
|------|----------|----------------|-------|------|
| E-001 Production validation closure | P0 | Trust for Tenant #1 | Ops docs | S (ops) |
| E-002 Cookie↔JWT bridge | P0 | Unlocks 40% of mobile APIs on web | `mobile-routes.js` | M |
| E-003 Server AEO profile | P0 | Multi-device growth | `users`, AEO UI | M |
| E-004 Plan limit enforcement | P0 | Commercial integrity | `plan-entitlements.js` | S |
| E-005 Recurring billing | P1 | Retention revenue | Razorpay, `activate-payment` | L |
| E-006 Follow-ups web UI | P1 | CS workflow | Follow-ups API | M |
| E-007 Admin users web | P1 | Team scaling | Admin API | M |
| E-008 WA inbox web | P1 | Channel parity | `whatsapp_messages` | M |
| E-009 Lead detail route | P2 | CRM depth | Leads API | M |
| E-010 Pipeline kanban | P2 | Sales UX | `byStatus`, leads | M |
| E-011 Bulk import | P2 | Onboarding speed | POST leads | M |
| E-012 SMTP + email templates | P2 | Marketing automation | Env + templates | M |
| E-013 Agent registry + 3 agents | P3 | AI consultant start | `scoring.js`, AEO | L |
| E-014 Campaign entity + n8n | P3 | Growth automation | n8n | L |
| E-015 Opportunity + quote | P3 | Revenue pipeline | New collections | L |
| E-016 Native mobile MVP | P3 | Field sales | OpenAPI | XL |
| E-017 Industry config packs | P4 | Vertical GTM | `config/aeo` pattern | M |

Each epic in delivery uses the **implementation template** in §6.1.

### 6.1 Enhancement template (example: E-003 Server AEO profile)

| Field | Content |
|-------|---------|
| **Business value** | Profile survives device switch; CS can trust completeness KPI |
| **Customer value** | No re-entry; team sees same business data |
| **Technical design** | Store `preferences.aeoProfile` + `checklistState` on `users`; hydrate `AeoGrowthEngine` from `auth/me` |
| **Reusable components** | `AeoGrowthEngine.jsx`, `lib/aeo/profile.js`, `business-profile-fields.json` |
| **Required APIs** | Extend `GET /api/auth/me`; `PATCH` via bridged `/users/me` or new cookie-safe PATCH |
| **Required UI** | Load on mount instead of sessionStorage-only; save calls API |
| **Automation** | n8n AEO reminders read server profile via follow-up API |
| **AI integration** | Prompts use server profile in context |
| **Security** | Tenant-scoped; no cross-org read |
| **Performance** | Single document read per dashboard load |
| **Acceptance criteria** | Profile persists across browsers; completeness % matches server |
| **Testing** | Extend `test-aeo-compute.mjs`; manual WS3 checklist |
| **Release** | Behind PO freeze lift; no navigation change |

---

## 7. Milestone Plan

| Milestone | Target | Exit criteria |
|-----------|--------|---------------|
| **M0** Pilot truth | Now | CS-01 + OPS-01 closed |
| **M1** Foundation GA | +3 mo | E-002–004 done; Tenant #1 Healthy |
| **M2** Team & automation | +6 mo | E-005–008; n8n standard per tenant |
| **M3** Growth OS core | +12 mo | E-012–014; 3 agents live |
| **M4** Revenue workspace | +18 mo | Opportunity, quote, invoice MVP |
| **M5** Enterprise & scale | +24 mo | SSO, audit UI, industry packs |

---

## 8. MVP Definition

### 8.1 MVP = **Commercial GA** (not full vision)

**In MVP:**

- LeadEdge360 CRM (exists)  
- AEO Growth Engine with **server profile** (enhance)  
- RetailEdge360 (entitlement-gated)  
- WA/FB/Google capture + n8n pack (ops)  
- Razorpay checkout + **enforced limits** (enhance)  
- Web follow-ups + admin users (bridge)  
- `/dashboard` executive snapshot (exists)  
- CS onboarding kit execution with **captured metrics**  

**Out of MVP:**

- AI agent orchestra  
- Landing page generator  
- Invoice/proposal PDF  
- Autonomous daily consultant  
- Native mobile app  
- SSO / enterprise  

---

## 9. Commercial GA Plan

| Workstream | Actions | Owner |
|------------|---------|-------|
| Legal / DPDP | Consent flows live | Product |
| Pricing | Starter/Growth on `/pricing` | GTM |
| Checkout | Razorpay keys on prod; `/billing` stable | Ops |
| Entitlements | `leadEnabled`, `retailEnabled`, limits enforced | Eng (post-freeze) |
| Onboarding | `CUSTOMER_ONBOARDING_KIT.md` | CS |
| Proof | Tenant #1 → case study template | CS |
| Expansion | `TENANT_EXPANSION_READINESS.md` gates | PO |
| Support | Enquiry@asoftechinsightz.com | Support |

**GA decision gate:** PO sign-off when M1 exit criteria met + no open P1 in `EXECUTIVE_ACTION_REGISTER.md`.

---

## 10. Enterprise Scale Roadmap

| Capability | Phase | Notes |
|------------|-------|-------|
| RBAC web UI | 2 | Reuse admin APIs |
| Audit log viewer | 2 | `audit_logs` exists |
| Plan limits + SSO | 5 | Scale tier promise |
| Dedicated CSM | Commercial | Not product |
| VPC / on-prem | 5 | Deploy pattern only |
| 99.95% SLA | 5 | Ops + status page |
| Multi-region Mongo | 5+ | NOT VERIFIED — architecture allows later |

---

## 11. Mobile Strategy

| Layer | Strategy |
|-------|----------|
| **API** | **Already exists** — ship OpenAPI as contract; no backend rewrite |
| **Phase 1** | Web responsive (exists) |
| **Phase 2** | React Native / Expo app — JWT auth, screens from `MOBILE_SCREEN_BLUEPRINTS.md` |
| **Phase 3** | Offline queue per `MOBILE_OFFLINE_STRATEGY.md` |
| **Parity** | Bridge web to same APIs before native ships (follow-ups, notifications) |
| **Freeze** | No mobile backend changes until PO lifts (`docs/mobile/README.md`) |

---

## 12. AI Automation Strategy

| Layer | Today | Target |
|-------|-------|--------|
| **Scoring** | Hybrid + LLM on lead create/rescore | Same + batch rescore jobs |
| **Content** | 8 AEO prompts, user-triggered | Scheduled agent runs + approval queue |
| **Recommendations** | Rule engine | Rules + agent narratives |
| **Automation IO** | n8n | n8n + in-app triggers (status change → workflow) |
| **Guardrails** | `llmCallsPerHour` | Per-agent limits + audit |
| **Evaluation** | Manual CS review | Prompt version in config JSON |

**Do not** add separate ML platform — extend config + `scoring.js`.

---

## 13. Customer Success Strategy

| Layer | Implementation |
|-------|----------------|
| **Playbooks** | **Exists** — `docs/customer-success/` (18 files) |
| **Health model** | **Exists** — external rules → **in-app widget** (Phase 2) |
| **Onboarding** | Kit + checklist widget on dashboard |
| **Weekly rhythm** | `WEEKLY_BUSINESS_REVIEW.md` |
| **Commercial validation** | `COMMERCIAL_VALIDATION_TOOLKIT.md` at Day 30 |
| **Risk** | CS Agent + health tier alerts (Phase 3) |
| **Training** | `TRAINING_ACADEMY.md` → in-app (Phase 3) |

**Tenant #1 today:** execution blocked until auth validation — NOT CAPTURED.

---

## 14. Digital Marketing Strategy

| Capability | Phase | Reuse |
|------------|-------|-------|
| GTM copy | **Now** | `MARKETING_ASSETS.md` |
| AI drafts (WA, email, social) | 2 | `AI_CONTENT_LIBRARY`, prompts |
| GBP/review assist | 2 | `gbp-post`, `review-reply` prompts |
| SEO/AEO audits | 3 | New audit prompts + KPI gaps |
| Content calendar | 3 | New UI + `campaigns` collection |
| Blog/landing generator | 4 | LLM + hosted pages (subdomain or export HTML) |
| Paid ads integration | 4+ | Webhooks exist for FB/Google leads only |

**Principle:** **Draft in LeadEdge360 → publish externally** until CMS integrated.

---

## 15. Executive Dashboard Strategy

### 15.1 Dashboard map (reuse routes)

| Dashboard | Route | Data source | Status |
|-----------|-------|-------------|--------|
| **Growth command** | `/dashboard` | `kpis`, `retail-kpis`, AEO | **Exists** |
| **Sales** | `/leadedge360` | `kpis`, leads, charts | **Exists** |
| **Retail** | `/retailedge360` | `retail-kpis`, products | **Exists** |
| **Marketing** | — | — | **Missing** — Phase 3 |
| **Customer** | — | — | **Missing** — Phase 3 |
| **Revenue** | Mobile JWT `/dashboard/revenue` | **Partial** — bridge to web |
| **Executive narrative** | `/dashboard` top card | Agent + KPIs | Phase 3 |

### 15.2 KPI contract

All executive KPIs must map to `EXECUTIVE_KPI_GUIDE.md` — **no invented metrics**.

---

## 16. Security Review

| Area | Status | Evidence |
|------|--------|----------|
| TLS / HSTS | Deployed | Live validation |
| Tenant isolation | `orgId` on queries | `tenant.js`, `route.js` |
| DPDP consent | Sign-in + banner | `DpdpConsentBanner`, consent_log |
| Secrets in `.env` | Required | SECURITY_HARDENING |
| Webhook tokens | `N8N_WEBHOOK_TOKEN` | n8n + route |
| JWT mobile | Refresh rotation | `jwt.js` |
| Rate limits | Partial | nginx docs |
| Agent actions audit | **Enhance** | Extend `audit_logs` |
| LLM data residency | Emergent proxy | Same as scoring |
| Production SSH | **Open risk** | runtime-handover |

**No architecture change** — harden ops + extend audit for agents.

---

## 17. Performance Review

| Area | Assessment |
|------|------------|
| API shape | Single monolith — low latency for pilot scale |
| KPI computation | In-memory over tenant leads — OK for &lt;10k leads |
| LLM calls | 9s timeout + fallback — acceptable |
| Bundle size | **Debt** — unused shadcn inflates build |
| Caching | None documented — add Redis later if needed (Phase 4+) |
| Metrics | `/api/metrics` for ops |

**Load testing:** NOT VERIFIED FROM CODEBASE — required before enterprise scale.

---

## 18. Release Plan

| Release | Contents | Freeze |
|---------|----------|--------|
| **R0** | Documentation + pilot validation (now) | Active |
| **R1.1** | E-002–004 (bridge, profile, limits) | PO lift |
| **R1.2** | E-005–008 (billing, follow-ups, admin, WA) | |
| **R2.0** | Campaigns, email, pipeline board | |
| **R3.0** | Agent panel (3 agents), revenue dashboard web | |
| **R4.0** | Quote/invoice, advanced automation | |

**Branching:** `main` deploy per `deploy.yml` — feature flags via env (`PILOT_MODE`, plan entitlements).

---

## 19. Testing Strategy

| Layer | Today | Target |
|-------|-------|--------|
| AEO compute | `npm run test:aeo` | Extend for server profile |
| Billing | `npm run test:billing`, `simulate-billing-flow.mjs` | Recurring tests |
| API | `backend_test.py` (orphaned) | Wire to CI against staging |
| E2E | testIds unused | Playwright on critical paths |
| Auth validation | `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` | CS manual + screenshots |
| Agent outputs | — | Golden-file JSON for prompts |
| n8n | POST_DEPLOY smoke | Per-tenant checklist |

---

## 20. Production Rollout Plan

| Stage | Audience | Criteria |
|-------|----------|----------|
| **Pilot** | Tenant #1 | M0 complete; metrics captured |
| **Pilot+** | Tenant 2–5 | M1; expansion readiness |
| **GA** | Open MSME signup | M1 + PO GA decision |
| **Scale** | Enterprise deals | M5 features |

| Step | Action |
|------|--------|
| 1 | Ops: `02_INFRASTRUCTURE_CHECKLIST.md` |
| 2 | CS: `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` |
| 3 | Enable Razorpay/SMTP/LLM keys per tenant tier |
| 4 | Import n8n workflows |
| 5 | CS kickoff per onboarding kit |
| 6 | Weekly WBR + `SUCCESS_METRICS_BASELINE.md` |
| 7 | Day 30 commercial pack |

**Live pilot note (03 Aug 2026):** `active_tenants: 0`, `active_users_24h: 0` in metrics — rollout must verify real tenant activity after onboarding.

---

## Target experience → delivery mapping

| Experience beat | Exists | Enhancement | Phase |
|-----------------|--------|-------------|-------|
| AI analyzes business | Partial (rules) | Agent + profile | 1–3 |
| AI builds profile | UI exists | Server persist | 1 |
| Missing opportunities | Growth scanner | Daily plan agent | 2–3 |
| Generates content | 8 prompts | + campaigns | 2–3 |
| Improves SEO/AEO | AEO KPIs | Audits + agents | 2–3 |
| Recommends campaigns | Rules | Campaign Agent | 3 |
| Automates follow-ups | n8n | Web inbox + rules | 1–2 |
| Predicts revenue | — | Revenue API + model | 3–4 |
| Identifies risks | CS doc | Health in-app + CS Agent | 2–3 |
| Next actions | Recommendations | Consultant panel | 3 |
| Daily OS | — | Business Consultant | 4–5 |

---

## Success metrics (platform — existing instrumentation)

| Vision metric | Instrument |
|---------------|------------|
| Lead generation ↑ | `kpis.total`, `trend`, `bySource` |
| Conversion ↑ | `kpis.conversion`, `won` |
| Retention | Won + repeat leads; renewal intent (CS toolkit) |
| SEO/AEO | AEO KPI row |
| Manual work ↓ | Follow-up SLA; automation logs |
| 360° view | Dashboard + CRM + retail + (future revenue) |

**Baselines:** NOT CAPTURED until Tenant #1 — use `SUCCESS_METRICS_BASELINE.md`.

---

## Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 3 Aug 2026 | Initial BG OS architecture on existing stack |

**STOP** — Awaiting PO authorization to lift freeze and begin Epic E-002+.
