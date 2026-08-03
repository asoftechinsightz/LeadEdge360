# LeadEdge360 — Engineering Execution Program

**Version:** 1.0  
**Date:** 3 August 2026  
**Role:** Lead Architect / Technical Program Manager  
**Status:** Engineering planning only — **no code, no migrations, no API creation until Product Freeze v1.0 lifted**  
**Audience:** Engineering, QA, DevOps, PO, CS  

**Authoritative inputs:**  
- [LEADEDGE360_PLATFORM_CURRENT_STATE.md](./LEADEDGE360_PLATFORM_CURRENT_STATE.md)  
- [LEADEDGE360_STRATEGIC_ASSESSMENT.md](./LEADEDGE360_STRATEGIC_ASSESSMENT.md)  
- [LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md](./LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md)  
- [LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md](./LEADEDGE360_BUSINESS_GROWTH_OS_ARCHITECTURE.md)  
- [LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md)  
- `docs/customer-success/` · `docs/aeo/` · `docs/mobile/` · `docs/operations/`  

**Tag legend:** **Existing** · **Enhancement** · **New Capability** · **Future Vision**

---

## 1. Engineering Program Charter

### 1.1 Purpose

Convert the approved enterprise strategy into an **incremental, extend-only engineering program** that ships Commercial GA (M1) then Growth Automation (M2) then AI Business Growth (M3+) without redesigning the Next.js monolith.

### 1.2 Scope

| In scope | Out of scope |
|----------|--------------|
| Epics E-001–E-017 and mapped user stories | Microservices split |
| Web parity for JWT mobile APIs (bridge) | Replacing MongoDB, Emergent LLM, n8n, Razorpay |
| Server AEO profile, plan enforcement, billing hardening | Duplicate CRM/marketing modules |
| Agent layer on `lib/scoring.js` | New frontend frameworks |
| n8n workflow extensions | Postgres runtime migration |
| Native mobile MVP (Phase 3) | Implementation during freeze |

### 1.3 Success criteria

| Milestone | Engineering exit |
|-----------|------------------|
| **M0** | Ops checklists PASS; authenticated validation PASS; Tenant #1 KPIs captured in CS docs |
| **M1 (GA)** | E-002–E-004 + E-006–E-008 shipped; limits enforced; profile server-persisted |
| **M2** | E-009–E-012; email + pipeline board; bulk import |
| **M3** | E-013–E-016 (partial); agent panel; campaigns start |
| **M4** | E-015 completion; quote/invoice path |
| **M5** | E-017; enterprise features per strategy |

### 1.4 Team model (recommended)

| Role | Responsibility |
|------|----------------|
| TPM / Lead Architect | Charter, dependencies, release train |
| Full-stack (2) | `route.js`, pages, `lib/` extensions |
| Platform / DevOps | Docker, deploy, n8n ops, secrets |
| QA | Checklists, WS3 validation, regression |
| CS liaison | Acceptance on onboarding/health widgets |
| PO | Freeze lift, epic prioritization, GA sign-off |

### 1.5 Constraints

- Product Freeze v1.0: no engineering until PO lift (`docs/aeo/README.md`, CS readiness report).  
- Mobile backend freeze until PO lift (`docs/mobile/README.md`).  
- Human approval before external publish (WA, email, GBP, social).  
- KPIs must map to `EXECUTIVE_KPI_GUIDE.md` — no invented metrics.  
- Tenant #1 baselines **NOT CAPTURED** — do not set numeric targets until CS-02 closed.

### 1.6 Reuse mandate

All work must prefer: `app/api/[[...path]]/route.js`, `lib/mobile-routes.js`, `lib/scoring.js`, `lib/aeo/*`, `components/aeo/AeoGrowthEngine.jsx`, `components/dashboard/KpiCard.jsx`, `components/layout/AppShell.jsx`, `lib/billing/*`, `n8n/*.json`.

---

## 2. Engineering Milestone Plan

| ID | Milestone | Calendar (post-freeze) | Releases | Epics |
|----|-----------|------------------------|----------|-------|
| **EM-0** | Pilot truth | Month 0 | R0 | E-001 |
| **EM-1** | Foundation GA | Months 1–3 | R1.1 | E-002, E-003, E-004 |
| **EM-2** | Team & monetization | Months 3–6 | R1.2 | E-005, E-006, E-007, E-008 |
| **EM-3** | CRM & channels depth | Months 6–9 | R2.0 | E-009, E-010, E-011, E-012 |
| **EM-4** | AI growth layer | Months 9–15 | R3.0 | E-013, E-014 (start), E-015 (start) |
| **EM-5** | Mobile + verticals | Months 12–18 | R3.1 | E-016, E-017 |
| **EM-6** | Revenue workspace | Months 18–24 | R4.0 | E-015 complete, invoice path |

**Critical path:** E-001 → E-002 → E-004 → E-003 → E-006–E-008 → GA gate.

---

## 3. Epic Breakdown (E-001–E-017)

Each epic uses the standard template below. Stories reference IDs in §4.

---

### E-001 — Production Validation Closure

| Field | Content |
|-------|---------|
| **Tag** | Enhancement (ops) |
| **Phase** | 0 / EM-0 |
| **Business objective** | Tenant #1 and CS can trust live = RC; unblock case study and expansion gates |
| **Technical objective** | Close infra + authenticated validation with runtime evidence in existing handover docs only |
| **Current components** | `docker-compose.yml`, `deploy.yml`, `docs/operations/runtime-handover/*`, `POST_DEPLOY_CHECKLIST.md` |
| **Reusable APIs** | `GET /api/health`, `GET /api/metrics` (probes) |
| **Reusable DB** | — (read-only validation) |
| **Reusable UI** | — |
| **Reusable AI** | — |
| **Reusable n8n** | Import smoke for 7 JSON workflows |
| **Dependencies** | VPS SSH (`VPS_SSH_KEY` / `asoftech_ci`); Tenant #1 credentials |
| **Implementation sequence** | 1) Infra checklist 2) Deploy parity 3) Auth WS3 4) Update handover matrices only |
| **Acceptance criteria** | `02_INFRASTRUCTURE_CHECKLIST` complete; `03_AUTHENTICATED_VALIDATION` PASS; Git SHA recorded; n8n import verified or documented NOT VERIFIED |
| **Regression risks** | None (no app code) |
| **Security** | SSH key handling; no secrets in docs |
| **Performance** | Baseline `/api/health` latency recorded |
| **Test cases** | HTTP probes; authenticated CRM/AEO/billing paths per WS3 |
| **Rollout** | Ops-only; no deploy change unless parity gap found |
| **Rollback** | N/A |
| **Documentation** | Update `runtime-handover/01–06`; `EXECUTIVE_ACTION_REGISTER` close OPS-01, CS-01 |
| **Definition of Done** | PO acknowledges M0 exit; CS-02 unblocked |

---

### E-002 — Cookie ↔ JWT Bridge

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-1 |
| **Business objective** | Web users get follow-ups, admin, WA, notifications without separate mobile login |
| **Technical objective** | Cookie session (`lib/tenant.js`) invokes same handlers as `lib/mobile-routes.js` with shared auth context |
| **Current components** | `lib/auth.js`, `lib/tenant.js`, `lib/jwt.js`, `lib/mobile-routes.js`, `route.js` |
| **Reusable APIs** | All mobile roots: `followups`, `dashboard/*`, `whatsapp/*`, `notifications/*`, `admin/*`, `users/me` PATCH |
| **Reusable DB** | `users`, `follow_ups`, `whatsapp_messages`, `notifications`, `push_devices` |
| **Reusable UI** | `AppShell.jsx` (new nav items only — no new layout) |
| **Reusable AI** | — |
| **Reusable n8n** | — |
| **Dependencies** | E-001 recommended; PO freeze lift |
| **Implementation sequence** | 1) Extract shared handler functions from `mobile-routes.js` 2) `resolveWebUser()` → JWT-equivalent context 3) Cookie-safe routes in `route.js` OR internal dispatch 4) Web UI epics E-006–E-008 |
| **Acceptance criteria** | Web cookie user can CRUD follow-ups; list WA conversation; admin list users — same data as JWT |
| **Regression risks** | Auth bypass if bridge maps wrong `orgId`; mobile JWT paths break |
| **Security** | Tenant isolation unchanged; no token leakage to client; audit admin actions |
| **Performance** | No double DB round-trips per request |
| **Test cases** | Cookie session vs JWT same `orgId` isolation; 403 cross-tenant; mobile regression suite |
| **Rollout** | Feature flag `WEB_JWT_BRIDGE=true`; pilot tenant first |
| **Rollback** | Flag off; mobile-only restored |
| **Documentation** | `MOBILE_API_GUIDE.md` bridge section; `auth-flow.md` update |
| **Definition of Done** | WS3 follow-ups/admin/WA steps PASS on web |

---

### E-003 — Server AEO Profile

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-1 |
| **Business objective** | Business profile persists across devices; CS trusts completeness KPI |
| **Technical objective** | `users.preferences.aeoProfile` + checklist state; hydrate `AeoGrowthEngine` from `auth/me` |
| **Current components** | `lib/aeo/profile.js`, `lib/aeo/compute.js`, `components/aeo/AeoGrowthEngine.jsx`, `config/aeo/business-profile-fields.json` |
| **Reusable APIs** | `GET /api/auth/me`; bridged `PATCH /api/users/me` (E-002) |
| **Reusable DB** | `users` (extend document) |
| **Reusable UI** | `AeoGrowthEngine.jsx` — load/save hooks only |
| **Reusable AI** | `compute.js`, all 8 prompts use profile context |
| **Reusable n8n** | `aeo-profile-reminder.json`, `aeo-faq-nudge.json`, `aeo-review-reminder.json` |
| **Dependencies** | E-002 optional but recommended for PATCH path |
| **Implementation sequence** | 1) Schema on `users` 2) `auth/me` read 3) PATCH save 4) UI hydrate + deprecate sessionStorage primary 5) n8n reads server state |
| **Acceptance criteria** | Profile survives browser switch; AEO KPIs match server profile; `test-aeo-compute` extended |
| **Regression risks** | Stale sessionStorage override; KPI drift vs CRM territories |
| **Security** | Profile tenant-scoped; no PII in logs |
| **Performance** | One extra field on `auth/me`; acceptable |
| **Test cases** | `npm run test:aeo`; manual completeness % match |
| **Rollout** | All tenants after staging validation |
| **Rollback** | Read sessionStorage fallback flag |
| **Documentation** | `docs/aeo/` profile persistence note; onboarding kit step update |
| **Definition of Done** | WS3 AEO profile steps PASS; CS onboarding kit aligned |

---

### E-004 — Plan Limit Enforcement

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-1 |
| **Business objective** | Commercial integrity; Starter/Growth/Scale limits meaningful |
| **Technical objective** | Enforce `lib/billing/plan-entitlements.js` on `POST /api/leads`, user create, retail SKU create |
| **Current components** | `plan-entitlements.js`, `org-billing.js`, `activate-payment.js`, `route.js` |
| **Reusable APIs** | `GET /api/billing/status`, `auth/me` entitlements |
| **Reusable DB** | `orgs`, `subscriptions`, `leads`, `users`, `products` |
| **Reusable UI** | Upgrade CTA on `/pricing`; soft gate on create dialogs |
| **Reusable AI** | — |
| **Reusable n8n** | — |
| **Dependencies** | — |
| **Implementation sequence** | 1) `checkEntitlement(org, action)` helper 2) Wire lead POST 3) Wire user admin create 4) Wire product POST 5) UI error messages |
| **Acceptance criteria** | Starter cannot exceed lead cap; Growth retail gated; 403/402 with clear message |
| **Regression risks** | Existing tenants over limit blocked — CS communication needed |
| **Security** | Enforcement server-side only |
| **Performance** | Count query per create — index `orgId` on leads |
| **Test cases** | `npm run test:billing`; simulate at cap |
| **Rollout** | Grandfather option via env for pilot tenant if PO approves |
| **Rollback** | Env `ENFORCE_PLAN_LIMITS=false` |
| **Documentation** | Pricing page alignment; `COMMERCIAL_VALIDATION_TOOLKIT` |
| **Definition of Done** | Billing test green; PO sign-off on limit behavior |

---

### E-005 — Recurring Billing

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1–2 / EM-2 |
| **Business objective** | Retention revenue; MRR trackable in `/api/metrics` |
| **Technical objective** | Razorpay subscriptions OR documented annual renewal flow; extend `activate-payment.js` |
| **Current components** | `lib/razorpay.js`, `lib/billing/activate-payment.js`, `billing/page.js`, `pricing/page.js` |
| **Reusable APIs** | `/api/billing/checkout`, `verify`, `webhooks/razorpay`, `status` |
| **Reusable DB** | `payments`, `subscriptions`, `orgs`, `audit_logs` |
| **Reusable UI** | `/billing`, `/billing/success`, `/pricing` |
| **Reusable AI** | — |
| **Reusable n8n** | — |
| **Dependencies** | Razorpay prod keys (E-001); E-004 |
| **Implementation sequence** | 1) Gap analysis doc implementation 2) Sub create API 3) Webhook renewal 4) MRR in metrics 5) CS renewal playbook link |
| **Acceptance criteria** | Renewal extends `subscriptions`; MRR reflects in metrics when configured |
| **Regression risks** | One-time checkout break; webhook signature failures |
| **Security** | Razorpay signature verify unchanged |
| **Performance** | Webhook idempotent |
| **Test cases** | `simulate-billing-flow.mjs`; renewal webhook mock |
| **Rollout** | New checkouts only; existing subs manual |
| **Rollback** | Revert to one-time orders |
| **Documentation** | `CHANGELOG` entry; billing gap closure |
| **Definition of Done** | PO chooses subs vs annual manual; tests pass |

---

### E-006 — Follow-ups Web UI

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-2 |
| **Business objective** | Sales team manages tasks in browser; CS follow-up SLA measurable |
| **Technical objective** | Web page under `AppShell` calling bridged `followups/*` APIs |
| **Current components** | `mobile-routes.js` followups handlers; `follow_ups` collection |
| **Reusable APIs** | `followups` CRUD, reminders, close (bridged) |
| **Reusable DB** | `follow_ups`, `leads` |
| **Reusable UI** | `AppShell`, `Table`, `Dialog`, `Badge` (shadcn) |
| **Reusable AI** | — |
| **Reusable n8n** | `whatsapp-followup-automation.json` |
| **Dependencies** | **E-002** |
| **Implementation sequence** | 1) Route `/leadedge360/followups` or tab on leadedge360 2) List due/overdue 3) Create from lead 4) Close/remind |
| **Acceptance criteria** | CRUD parity with mobile OpenAPI; due list matches `dashboard/followups-due` |
| **Regression risks** | Mobile followups regression |
| **Security** | Same org scoping as mobile |
| **Performance** | Paginate list |
| **Test cases** | WS3 follow-up steps; API contract tests |
| **Rollout** | With E-002 flag |
| **Rollback** | Hide nav item |
| **Documentation** | `CUSTOMER_SUCCESS_PLAYBOOK.md` web steps |
| **Definition of Done** | CS validates SLA workflow |

---

### E-007 — Admin Users Web UI

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-2 |
| **Business objective** | Teams scale without mobile-only admin |
| **Technical objective** | Web admin for users CRUD via bridged `admin/*` |
| **Current components** | `mobile-routes.js` admin handlers; `users` collection |
| **Reusable APIs** | `admin/users`, roles (as implemented) |
| **Reusable DB** | `users`, `orgs` |
| **Reusable UI** | `AppShell`, forms, `Table` |
| **Reusable AI** | — |
| **Reusable n8n** | — |
| **Dependencies** | **E-002**, E-004 for user limits |
| **Implementation sequence** | 1) Users list 2) Invite/create 3) Role display 4) Deactivate |
| **Acceptance criteria** | Admin can add user within plan limit; replaces hardcoded `AGENTS` display path |
| **Regression risks** | Orphan users; role escalation |
| **Security** | Admin role check; audit log entry |
| **Performance** | Small teams — no issue |
| **Test cases** | Admin vs non-admin 403; limit enforcement with E-004 |
| **Rollout** | Growth/Scale tenants first |
| **Rollback** | Hide admin nav |
| **Documentation** | Onboarding kit team setup |
| **Definition of Done** | E-030 hardcoded agents replaced in UI |

---

### E-008 — WhatsApp Inbox Web

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 1 / EM-2 |
| **Business objective** | WA channel parity in browser; nurture without phone |
| **Technical objective** | Web inbox: conversation per lead, send, template via bridged `whatsapp/*` |
| **Current components** | `lib/whatsapp.js`, `whatsapp_messages`, mobile WA handlers |
| **Reusable APIs** | `whatsapp/send`, `send-template`, `conversation/:leadId` |
| **Reusable DB** | `whatsapp_messages`, `leads` |
| **Reusable UI** | `AppShell`, message list pattern, lead link |
| **Reusable AI** | `wa-outreach` prompt from AEO |
| **Reusable n8n** | ingest + follow-up workflows |
| **Dependencies** | **E-002**; `WHATSAPP_*` env |
| **Implementation sequence** | 1) Inbox list 2) Thread view 3) Send message 4) Template picker 5) Link to lead row |
| **Acceptance criteria** | Send stores in `whatsapp_messages`; thread matches mobile API |
| **Regression risks** | WA Cloud API rate limits; template approval |
| **Security** | No WA tokens in client; server-side send only |
| **Performance** | Paginate threads |
| **Test cases** | Mock WA in staging; WS3 WA steps |
| **Rollout** | Env-gated WA tenants |
| **Rollback** | Hide inbox; deep links remain |
| **Documentation** | `AI_CONTENT_LIBRARY` WA section |
| **Definition of Done** | CS WA playbook executable on web |

---

### E-009 — Lead Detail Route

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 2 / EM-3 |
| **Business objective** | Shareable lead URL; deeper CRM adoption |
| **Technical objective** | `/leadedge360/leads/[id]` page using existing leads GET |
| **Current components** | `leadedge360/page.js` dialog logic; `GET /api/leads` |
| **Reusable APIs** | `GET/PATCH /api/leads/:id`, activities |
| **Reusable DB** | `leads`, `lead_activities` |
| **Reusable UI** | Dialog content → full page; `AppShell` |
| **Reusable AI** | score display, rescore button |
| **Reusable n8n** | — |
| **Dependencies** | — |
| **Implementation sequence** | 1) Dynamic route 2) Migrate dialog fields 3) Activity timeline (EN #36) 4) Deep link from table |
| **Acceptance criteria** | URL loads lead; status/score update works; 404 cross-tenant |
| **Regression risks** | Dialog/table drift |
| **Security** | orgId check on :id |
| **Performance** | Single lead fetch |
| **Test cases** | E2E open lead URL |
| **Rollout** | Default enabled |
| **Rollback** | Redirect to table + dialog |
| **Documentation** | Training academy CRM module |
| **Definition of Done** | SPRINT19_NAV lead detail requirement addressed |

---

### E-010 — Pipeline Kanban

| Field | Content |
|-------|---------|
| **Tag** | Enhancement |
| **Phase** | 2 / EM-3 |
| **Business objective** | Visual pipeline for non-technical owners |
| **Technical objective** | Kanban by `STATUSES` using `GET /api/leads` + status PATCH |
| **Current components** | `byStatus` chart data; `STATUSES` in `route.js` |
| **Reusable APIs** | leads GET, PATCH status |
| **Reusable DB** | `leads` |
| **Reusable UI** | Card columns; optional shadcn scroll area |
| **Reusable AI** | score badge on cards |
| **Reusable n8n** | — |
| **Dependencies** | E-009 optional |
| **Implementation sequence** | 1) Column layout 2) Drag → PATCH status 3) Filter territory 4) Link to detail |
| **Acceptance criteria** | Drag updates status + `lead_activities` |
| **Regression risks** | Concurrent status updates |
| **Security** | Same as PATCH status |
| **Performance** | Client-side filter if &lt;10k leads per tenant |
| **Test cases** | Status transition matrix |
| **Rollout** | Toggle view on leadedge360 |
| **Rollback** | Table-only view |
| **Documentation** | Sales playbook pipeline section |
| **Definition of Done** | CS sales playbook demo ready |

---

### E-011 — Bulk Lead Import

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 2 / EM-3 |
| **Business objective** | Fast onboarding from spreadsheets |
| **Technical objective** | CSV upload → batch `POST /api/leads` with scoring |
| **Current components** | `POST /api/leads`, `aiScore` |
| **Reusable APIs** | Extend leads POST or new `POST /api/leads/import` in same handler |
| **Reusable DB** | `leads`, `lead_activities` |
| **Reusable UI** | `Dialog` + file input on leadedge360 |
| **Reusable AI** | `aiScore` per row (batch with rate limit) |
| **Reusable n8n** | — |
| **Dependencies** | E-004 limits |
| **Implementation sequence** | 1) CSV parser 2) Validate rows 3) Batch insert 4) Progress UI 5) Error report |
| **Acceptance criteria** | 500 rows tenant-scoped; duplicates policy documented |
| **Regression risks** | LLM rate limit; DB load |
| **Security** | File size cap; no formula injection |
| **Performance** | Background job or chunked insert |
| **Test cases** | Import at cap; partial failure report |
| **Rollout** | Growth tier+ |
| **Rollback** | Disable import endpoint |
| **Documentation** | Onboarding kit import step |
| **Definition of Done** | Tenant onboarding &lt;1h for 200 leads |

---

### E-012 — SMTP + Email Templates

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 2 / EM-3 |
| **Business objective** | Email nurture without external ESP for MVP |
| **Technical objective** | Transactional send via SMTP env; template files; optional sequence trigger |
| **Current components** | SMTP env in health check; `AI_CONTENT_LIBRARY` email copy |
| **Reusable APIs** | New `POST /api/email/send` in `route.js` (internal/n8n) — **planned, not implemented** |
| **Reusable DB** | Optional `email_log` — **new collection Phase 2 only if PO approves** |
| **Reusable UI** | Template preview in marketing section later |
| **Reusable AI** | Email body drafts via `runAeoPrompt` pattern |
| **Reusable n8n** | New workflow JSON for sequences — extend pattern |
| **Dependencies** | Ops SMTP (E-001); E-002 for web triggers |
| **Implementation sequence** | 1) `lib/email.js` wrapper 2) Templates dir 3) Send API 4) n8n sequence 5) Status-change trigger hook |
| **Acceptance criteria** | Health `smtp: true`; test email delivered; sequence on stale lead |
| **Regression risks** | Spam reputation; credential leak |
| **Security** | SMTP creds server-only; opt-in consent |
| **Performance** | Queue sends; rate limit |
| **Test cases** | Staging SMTP mock |
| **Rollout** | Per-tenant SMTP or platform SMTP |
| **Rollback** | Disable send API |
| **Documentation** | Marketing automation playbook |
| **Definition of Done** | CS email nurture step in playbook |

---

### E-013 — Agent Registry + 3 Agents

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 3 / EM-4 |
| **Business objective** | AI consultant layer; daily actionable narratives |
| **Technical objective** | `lib/agents/registry.js`, `run.js`; panel on `/dashboard`; AEO + Sales + Executive Advisor |
| **Current components** | `lib/scoring.js`, `lib/aeo/actions.js`, `AeoGrowthEngine.jsx`, `config/aeo/prompts/` |
| **Reusable APIs** | `invokeAeoPrompt` pattern; `GET /api/kpis`, `metrics` |
| **Reusable DB** | `audit_logs` extend fields |
| **Reusable UI** | Agent panel clone of AEO LLM buttons |
| **Reusable AI** | Emergent LLM gateway; 3 new `config/agents/*.json` |
| **Reusable n8n** | — |
| **Dependencies** | **E-003**; PO freeze lift for mobile backend if shared |
| **Implementation sequence** | 1) Registry 2) Context gatherer 3) Run + rate limit 4) UI panel 5) Audit |
| **Acceptance criteria** | Agent returns KPI-linked advice; `llmCallsPerHour` respected |
| **Regression risks** | LLM cost; hallucinated metrics |
| **Security** | No auto-publish; audit agentId |
| **Performance** | Cache daily briefing per org |
| **Test cases** | Golden JSON fixtures for 3 agents |
| **Rollout** | Growth tier+ |
| **Rollback** | Hide agent panel |
| **Documentation** | `AI_BUSINESS_GROWTH_PLAYBOOK.md` agent section |
| **Definition of Done** | 3 agents demo in WBR template |

---

### E-014 — Campaign Entity + n8n

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 3 / EM-4 |
| **Business objective** | Structured campaigns across WA/email |
| **Technical objective** | `campaigns` collection metadata; n8n executes sends |
| **Current components** | n8n patterns; E-012 email; E-008 WA |
| **Reusable APIs** | Planned `GET/POST /api/campaigns` in `route.js` |
| **Reusable DB** | **New:** `campaigns` (PO-approved new collection) |
| **Reusable UI** | Campaign list + wizard (AEO button pattern) |
| **Reusable AI** | Marketing Agent drafts |
| **Reusable n8n** | New workflow: campaign-execute.json |
| **Dependencies** | E-012, E-008 |
| **Implementation sequence** | 1) Collection schema 2) CRUD API 3) Wizard UI 4) n8n trigger 5) Approval queue |
| **Acceptance criteria** | Campaign creates draft; approved send via n8n |
| **Regression risks** | Duplicate sends |
| **Security** | Approval required; webhook token |
| **Performance** | n8n handles bulk IO |
| **Test cases** | Dry-run mode |
| **Rollout** | Pilot campaign per tenant |
| **Rollback** | Disable campaign POST |
| **Documentation** | Marketing assets campaign section |
| **Definition of Done** | One end-to-end WA campaign per pilot |

---

### E-015 — Opportunity + Quote Start

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 3–4 / EM-4–6 |
| **Business objective** | Revenue pipeline beyond lead status |
| **Technical objective** | `opportunities` or extended leads; quote draft via prompt |
| **Current components** | Proposal status; `documents` planned |
| **Reusable APIs** | leads + new opportunity routes in `route.js` |
| **Reusable DB** | **New:** `opportunities`, `documents` (PO-approved) |
| **Reusable UI** | Lead detail + opportunity tab |
| **Reusable AI** | Proposal Agent prompt |
| **Reusable n8n** | — |
| **Dependencies** | E-009; CRM stable |
| **Implementation sequence** | 1) Schema 2) CRUD 3) Link to lead 4) Quote draft LLM 5) PDF later Phase 4 |
| **Acceptance criteria** | Opportunity CRUD; quote text export |
| **Regression risks** | Duplicate with lead status |
| **Security** | Tenant scope |
| **Performance** | Normal CRUD |
| **Test cases** | Opportunity → Won flow |
| **Rollout** | Phase 3 MVP without PDF |
| **Rollback** | Hide opportunity UI |
| **Documentation** | Sales playbook proposal section |
| **Definition of Done** | Metrics `opportunities_won` align with data |

---

### E-016 — Native Mobile MVP

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 3 / EM-5 |
| **Business objective** | Field sales on phone |
| **Technical objective** | React Native/Expo app on existing OpenAPI — **no backend rewrite** |
| **Current components** | `docs/openapi.json`, `docs/mobile/MOBILE_SCREEN_BLUEPRINTS.md` |
| **Reusable APIs** | Full `mobile-routes.js` surface |
| **Reusable DB** | — (client only) |
| **Reusable UI** | — (new client) |
| **Reusable AI** | — |
| **Reusable n8n** | — |
| **Dependencies** | Mobile backend freeze lift; E-002 for parity docs |
| **Implementation sequence** | 1) Auth screens 2) Dashboard 3) Leads 4) Follow-ups 5) Push |
| **Acceptance criteria** | OpenAPI contract tests pass from app |
| **Regression risks** | API drift vs app |
| **Security** | Secure token storage |
| **Performance** | Offline per `MOBILE_OFFLINE_STRATEGY.md` Phase 3 |
| **Test cases** | Device farm smoke |
| **Rollout** | App store beta |
| **Rollback** | Web-only |
| **Documentation** | `docs/mobile/` program update |
| **Definition of Done** | MOBILE_PRD MVP scope met |

---

### E-017 — Industry Config Packs

| Field | Content |
|-------|---------|
| **Tag** | New Capability |
| **Phase** | 4 / EM-5 |
| **Business objective** | Vertical GTM without code forks |
| **Technical objective** | `config/industry/*.json` mirroring `config/aeo/` pattern |
| **Current components** | `config/aeo/defaults.json`, checklist, prompts |
| **Reusable APIs** | Profile + AEO compute read industry pack |
| **Reusable DB** | `orgs.industry` field on org |
| **Reusable UI** | Industry picker in AEO profile |
| **Reusable AI** | Industry Expert Agent (Future partial) |
| **Reusable n8n** | — |
| **Dependencies** | E-003 |
| **Implementation sequence** | 1) Schema 2) Retail/services packs 3) UI picker 4) Checklist weights per industry |
| **Acceptance criteria** | Switch industry updates checklist weights |
| **Regression risks** | Wrong defaults for existing tenants |
| **Security** | Config read-only in prod |
| **Performance** | JSON load at boot |
| **Test cases** | Per-industry compute tests |
| **Rollout** | Opt-in per tenant |
| **Rollback** | Default horizontal pack |
| **Documentation** | GTM vertical one-pagers |
| **Definition of Done** | 2 industry packs shipped |

---

## 4. Story Breakdown (by Epic)

### E-001 Stories

| ID | Story | Tag | Points |
|----|-------|-----|--------|
| E-001-S1 | Complete SSH infra checklist with runtime evidence | Enhancement | 3 |
| E-001-S2 | Record Git SHA + Docker image parity in reconciliation matrix | Enhancement | 2 |
| E-001-S3 | Execute authenticated validation WS3 with Tenant #1 | Enhancement | 5 |
| E-001-S4 | Verify/import n8n workflows; document active state | Enhancement | 3 |
| E-001-S5 | Confirm Razorpay/SMTP/LLM keys on prod health | Enhancement | 2 |

### E-002 Stories

| ID | Story | Tag | Points |
|----|-------|-----|--------|
| E-002-S1 | Extract shared handlers from `mobile-routes.js` | Enhancement | 5 |
| E-002-S2 | Map cookie session to org/user context for web | Enhancement | 5 |
| E-002-S3 | Wire cookie dispatch for followups routes | Enhancement | 3 |
| E-002-S4 | Wire cookie dispatch for admin + whatsapp + notifications | Enhancement | 5 |
| E-002-S5 | Feature flag + cross-tenant security tests | Enhancement | 3 |

### E-003 Stories

| ID | Story | Tag | Points |
|----|-------|-----|--------|
| E-003-S1 | Add `preferences.aeoProfile` to users schema | Enhancement | 2 |
| E-003-S2 | Extend `auth/me` with profile + checklist state | Enhancement | 3 |
| E-003-S3 | PATCH profile via bridged users/me | Enhancement | 3 |
| E-003-S4 | Hydrate AeoGrowthEngine from server on load | Enhancement | 5 |
| E-003-S5 | Extend test-aeo-compute for server profile | Enhancement | 2 |

### E-004 Stories

| ID | Story | Tag | Points |
|----|-------|-----|--------|
| E-004-S1 | Implement `checkEntitlement(org, action)` | Enhancement | 3 |
| E-004-S2 | Enforce on POST leads | Enhancement | 2 |
| E-004-S3 | Enforce on admin user create + product POST | Enhancement | 3 |
| E-004-S4 | UI upgrade CTA on limit errors | Enhancement | 2 |

### E-005 Stories

| ID | Story | Tag | Points |
|----|-------|-----|--------|
| E-005-S1 | Implement Razorpay subscription create (or annual doc flow) | Enhancement | 8 |
| E-005-S2 | Webhook renewal handler | Enhancement | 5 |
| E-005-S3 | MRR in `/api/metrics` | Enhancement | 3 |
| E-005-S4 | Billing page renewal UX | Enhancement | 3 |

### E-006–E-008 Stories (summary)

| Epic | Key stories | Points (total) |
|------|-------------|----------------|
| E-006 | List due, CRUD, create from lead, close | 13 |
| E-007 | Users list, create, deactivate, role display | 13 |
| E-008 | Thread list, send, template, lead link | 13 |

### E-009–E-012 Stories (summary)

| Epic | Key stories | Points |
|------|-------------|--------|
| E-009 | Dynamic route, timeline, deep links | 13 |
| E-010 | Kanban columns, drag PATCH, filters | 13 |
| E-011 | CSV parse, batch insert, error report | 13 |
| E-012 | email lib, templates, send API, n8n sequence | 13 |

### E-013–E-017 Stories (summary)

| Epic | Key stories | Points |
|------|-------------|--------|
| E-013 | registry, context, 3 agents, panel, audit | 21 |
| E-014 | campaigns schema, CRUD, wizard, n8n | 21 |
| E-015 | opportunity CRUD, quote draft | 21 |
| E-016 | RN auth, leads, followups, push | 34 |
| E-017 | industry JSON packs, picker, compute | 13 |

**Estimation note:** Fibonacci; team velocity to be measured post-freeze.

---

## 5. Dependency Matrix

| Epic | Depends on | Blocks |
|------|------------|--------|
| E-001 | SSH, Tenant creds | All validation-dependent work |
| E-002 | E-001 (recommended), freeze lift | E-006, E-007, E-008, E-003 PATCH |
| E-003 | E-002 (recommended) | E-013, E-017 |
| E-004 | — | E-005, E-011, E-007 |
| E-005 | E-001 keys, E-004 | MRR reporting |
| E-006 | E-002 | CS SLA metrics |
| E-007 | E-002, E-004 | Real agent assignment |
| E-008 | E-002 | E-014 WA campaigns |
| E-009 | — | E-010, E-015 |
| E-010 | — | — |
| E-011 | E-004 | — |
| E-012 | E-001 SMTP | E-014 |
| E-013 | E-003 | — |
| E-014 | E-012, E-008 | — |
| E-015 | E-009 | Invoice Phase 4 |
| E-016 | freeze lift, OpenAPI | — |
| E-017 | E-003 | — |

---

## 6. Component Reuse Matrix

| Workstream | Reuse components | New UI (minimal) |
|------------|------------------|------------------|
| CRM | `leadedge360/page.js`, dialogs, charts | Detail route, kanban |
| Lead Gen | create dialog | import dialog |
| AEO | `AeoGrowthEngine.jsx` | — |
| Executive | `KpiCard`, `/dashboard` | narrative card |
| Follow-ups | `AppShell`, `Table` | followups page |
| Admin | `AppShell`, forms | admin page |
| WA | `AppShell` | inbox page |
| Billing | `billing/page.js` | renewal widgets |
| Agents | `AeoGrowthEngine` panel | agent panel |
| Campaigns | AEO LLM buttons | wizard |
| Mobile | — | RN app (external) |

---

## 7. API Reuse Matrix

| Workstream | Existing endpoints | Extension (same `route.js`) |
|------------|-------------------|------------------------------|
| CRM | `leads/*`, `kpis` | import, detail implicit |
| Lead Gen | `POST leads`, webhooks | import |
| AEO | `auth/me` | preferences |
| Billing | `billing/*` | subs |
| Follow-ups | mobile `followups/*` | cookie bridge |
| WA | mobile `whatsapp/*` | cookie bridge |
| Admin | mobile `admin/*` | cookie bridge |
| Email | — | `email/send` (planned) |
| Campaigns | — | `campaigns/*` (planned) |
| Opportunities | — | `opportunities/*` (planned) |
| Agents | `invokeAeoPrompt` | `invokeAgent` (planned) |
| Analytics | `kpis`, `metrics`, mobile `dashboard/*` | bridge revenue |

**Rule:** No parallel API server.

---

## 8. Database Impact Matrix

| Collection | Epic touch | Change type |
|------------|------------|-------------|
| `users` | E-003, E-007 | Enhancement: `preferences` |
| `orgs` | E-004, E-005, E-017 | Enhancement: entitlements enforced, `industry` |
| `leads` | E-004, E-011, E-015 | Read/write; optional link fields |
| `follow_ups` | E-006 | Existing — web bridge |
| `whatsapp_messages` | E-008 | Existing |
| `payments` | E-005 | Enhancement |
| `subscriptions` | E-005 | Enhancement |
| `audit_logs` | E-013, E-007 | Enhancement fields |
| `campaigns` | E-014 | **New** (PO approval) |
| `opportunities` | E-015 | **New** (PO approval) |
| `documents` | E-015 | **New** (PO approval) |
| `email_log` | E-012 | **New** optional |

**No migration tool required** — Mongo schema-flexible; document PO-approved new collections.

---

## 9. UI Impact Matrix

| Route | Epic | Change |
|-------|------|--------|
| `/dashboard` | E-013 | Agent panel |
| `/leadedge360` | E-006, E-010, E-011 | tabs/views |
| `/leadedge360/leads/[id]` | E-009 | New page |
| `/leadedge360/followups` | E-006 | New page |
| `/admin/users` | E-007 | New page |
| `/whatsapp` or inbox | E-008 | New page |
| `/billing` | E-005 | Renewal UI |
| `/pricing` | E-004 | Limit CTAs |
| Nav `AppShell` | E-006–E-008 | New items only |

**No new layout shell** — extend `AppShell` nav config.

---

## 10. AI Impact Matrix

| Workstream | Existing | Epic | Change |
|------------|----------|------|--------|
| Lead scoring | `aiScore` | — | Existing |
| AEO compute | `compute.js` | E-003 | Server profile input |
| AEO prompts | 8 JSON | E-003, E-017 | Context + industry |
| Recommendations | `recommendations.js` | E-013 | Agent narratives |
| Retail AI | `retail-ai.js` | — | Existing |
| Agents | — | E-013 | `config/agents/`, registry |
| Campaign copy | prompts | E-014 | Marketing Agent |
| Proposal draft | — | E-015 | Proposal Agent prompt |
| Email draft | — | E-012 | prompt pattern |

**Gateway:** Always `lib/scoring.js` / Emergent — no new vendor.

---

## 11. Automation Impact Matrix

| Workflow | File | Epic | Change |
|----------|------|------|--------|
| WA ingest | `whatsapp-lead-ingest.json` | — | Existing |
| FB ingest | `facebook-lead-ingest.json` | — | Existing |
| Google ingest | `google-lead-ingest.json` | — | Existing |
| WA follow-up | `whatsapp-followup-automation.json` | E-006 | Ops + web UI |
| AEO profile reminder | `aeo-profile-reminder.json` | E-003 | Read server profile |
| AEO FAQ nudge | `aeo-faq-nudge.json` | E-003 | Same |
| AEO review reminder | `aeo-review-reminder.json` | E-003 | Same |
| Email sequence | **new JSON** | E-012 | New workflow |
| Campaign execute | **new JSON** | E-014 | New workflow |

---

## 12. Security Checklist

| # | Item | Epic / Phase | Status |
|---|------|--------------|--------|
| S-01 | Tenant `orgId` on all new queries | All | Existing pattern |
| S-02 | Cookie bridge cannot escalate to other org | E-002 | Required |
| S-03 | Admin actions audit logged | E-007, E-013 | Enhancement |
| S-04 | WA/email send server-side only | E-008, E-012 | Required |
| S-05 | Human approval before external publish | E-012–E-014 | Required |
| S-06 | Razorpay signature verify on renewal | E-005 | Existing |
| S-07 | Webhook token on n8n | All | Existing |
| S-08 | `seed-reset` disabled in production | E-001 | Enhancement |
| S-09 | CSV import size/type limits | E-011 | New |
| S-10 | LLM prompts no secrets in context | E-013 | Required |
| S-11 | JWT refresh rotation unchanged | E-002 | Regression test |
| S-12 | DPDP consent before marketing email | E-012 | Required |
| S-13 | Rate limiting (nginx) verified | E-001 | NOT VERIFIED |
| S-14 | Secrets only in `.env` | Ops | Existing |

---

## 13. Performance Checklist

| # | Item | Epic | Target |
|---|------|------|--------|
| P-01 | KPI compute &lt;2s for 10k leads | — | Existing acceptable |
| P-02 | Lead list paginated | E-009+ | Enhancement |
| P-03 | Bulk import chunked | E-011 | No UI block |
| P-04 | LLM timeout 9s + fallback | E-013 | Existing |
| P-05 | `llmCallsPerHour` enforced | E-013 | Existing cap |
| P-06 | WA inbox paginated | E-008 | Required |
| P-07 | Bundle size — remove dead shadcn | Tech debt | EN #88 |
| P-08 | Load test before enterprise | M5 | NOT VERIFIED |
| P-09 | n8n offloads bulk sends | E-012–E-014 | Design |
| P-10 | Cache daily agent briefing | E-013 | Optional |

---

## 14. Testing Strategy

| Layer | Tool / doc | Coverage target |
|-------|------------|-------------------|
| AEO compute | `npm run test:aeo` | E-003 extensions |
| Billing | `npm run test:billing`, `simulate-billing-flow.mjs` | E-004, E-005 |
| API contract | `backend_test.py` → CI | E-002 bridge |
| Auth validation | `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` | E-001, all releases |
| OpenAPI | `docs/openapi.json` vs handlers | E-016 |
| E2E | Playwright (introduce R2.0) | Critical paths |
| Agent golden files | JSON fixtures | E-013 |
| n8n smoke | POST_DEPLOY | E-001, E-014 |
| Regression | WS3 subset per release | All |
| Manual CS | WBR + onboarding kit | M1+ |

---

## 15. QA Checklist (per release)

| # | Check |
|---|-------|
| Q-01 | `npm run build` succeeds |
| Q-02 | `test:aeo` + `test:billing` green |
| Q-03 | WS3 authenticated paths PASS |
| Q-04 | Cross-tenant isolation spot check |
| Q-05 | Billing checkout smoke (staging) |
| Q-06 | CRM create → score → status → activity |
| Q-07 | AEO profile save/load |
| Q-08 | Follow-ups CRUD web (post E-002) |
| Q-09 | No regression on mobile JWT APIs |
| Q-10 | `/api/health` green post-deploy |
| Q-11 | CS sign-off on release notes |
| Q-12 | PO freeze scope respected |

---

## 16. DevOps Checklist

| # | Item | Reference |
|---|------|-----------|
| D-01 | Docker compose app/mongo/n8n | `docker-compose.yml` |
| D-02 | GitHub Actions deploy | `deploy.yml` |
| D-03 | Env vars documented | `.env.example` |
| D-04 | nginx TLS/HSTS | `SECURITY_HARDENING.md` |
| D-05 | Backup Mongo | POST_DEPLOY |
| D-06 | n8n workflow import runbook | `n8n/` + POST_DEPLOY |
| D-07 | Razorpay webhook URL stable | billing |
| D-08 | Feature flags in env | E-002, E-004 |
| D-09 | Git SHA in health/metrics | E-001 |
| D-10 | Staging environment parity | E-001 |
| D-11 | Rollback image tag documented | §19 |
| D-12 | Secrets rotation procedure | SECURITY_HARDENING |

---

## 17. Production Readiness Checklist

| Gate | Requirement | Owner |
|------|-------------|-------|
| PR-01 | M0 complete (E-001) | Ops + CS |
| PR-02 | No open P1 in action register | PO |
| PR-03 | Freeze lifted for scope | PO |
| PR-04 | Staging = prod parity | DevOps |
| PR-05 | Health: mongo, razorpay, smtp, llm | Ops |
| PR-06 | Tenant #1 metrics captured | CS |
| PR-07 | Expansion gates documented | CS |
| PR-08 | Rollback tested on staging | DevOps |
| PR-09 | On-call / support path | Support |
| PR-10 | Release notes + CHANGELOG | Eng |

---

## 18. Release Plan

| Release | Date (relative) | Contents | Env |
|---------|-----------------|----------|-----|
| **R0** | M0 | Docs + validation only | Prod probe |
| **R1.1** | +1 mo post-freeze | E-002, E-003, E-004 | Staging → pilot |
| **R1.2** | +2 mo | E-005, E-006, E-007, E-008 | Pilot → GA cohort |
| **R2.0** | +6 mo | E-009–E-012 | GA tenants |
| **R3.0** | +12 mo | E-013, E-014 start, E-015 start | Growth tier |
| **R3.1** | +15 mo | E-016 beta, E-017 | Mobile beta |
| **R4.0** | +18 mo | E-015 complete, invoice path | Scale |

**Cadence:** Bi-weekly deploy to staging; monthly prod after QA gate.

---

## 19. Rollback Plan

| Scenario | Action | Owner |
|----------|--------|-------|
| Bridge auth bug | `WEB_JWT_BRIDGE=false`; redeploy previous image | DevOps |
| Profile corruption | Fallback read sessionStorage; restore user doc from backup | Eng |
| Limit enforcement blocks tenants | `ENFORCE_PLAN_LIMITS=false` | PO + Eng |
| Billing webhook failure | Pause webhook; manual `activate-payment` | Eng |
| Bad agent output | Hide agent panel; no auto-publish | Eng |
| Campaign misfire | Disable campaign POST; stop n8n workflow | Ops |
| Full rollback | Redeploy `docker-compose` previous tag from CI | DevOps |
| Data rollback | Mongo point-in-time restore | DevOps |

**Requirement:** Every prod deploy records previous image tag in `04_RUNTIME_RECONCILIATION_MATRIX.md`.

---

## 20. Engineering Governance

### 20.1 Change control

| Rule | Detail |
|------|--------|
| Freeze | No code until PO lift |
| Epic approval | PO signs epic before sprint |
| New collections | PO approves (`campaigns`, `opportunities`, `documents`) |
| Navigation | No new top-level product without PO (freeze rule) |
| API surface | Extend `route.js`; update OpenAPI when mobile affected |

### 20.2 Definition of Ready (story)

- Linked epic; acceptance criteria; reuse components listed; security noted; test approach defined.

### 20.3 Definition of Done (story)

- Code merged; tests pass; docs updated; WS3 subset if user-facing; no P1 regression; feature flag if risky.

### 20.4 Ceremonies

| Ceremony | Frequency |
|----------|-----------|
| Sprint planning | 2 weeks |
| Backlog grooming | Weekly |
| Release readiness | Pre-deploy |
| WBR engineering slice | Weekly with CS |
| PO demo | End of sprint |

### 20.5 Quality gates

Build → unit scripts → staging deploy → WS3 → CS sign-off → prod.

### 20.6 Technical debt budget

20% sprint capacity for EN #88–90 (shadcn, TanStack Query, KpiCard consolidate).

---

## Engineering Workstreams (detailed)

Each workstream: **Tag** · **Epics** · **Engineering focus** · **Reuse** · **Phase**

---

### WS-CRM — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-006, E-009, E-010, E-011, E-015 (partial) |
| **Focus** | LeadEdge360 depth without second CRM module |
| **Reuse** | `leadedge360/page.js`, `route.js` leads, `kpis`, `lead_activities` |
| **New** | Detail route, kanban, import, opportunity tab |
| **Phase** | 1–4 |
| **DoD** | SPRINT19_NAV CRM items addressed |

---

### WS-LEADGEN — **Existing** + **Enhancement** + **New**

| Item | Detail |
|------|--------|
| **Epics** | E-011, webhooks ops (E-001) |
| **Focus** | Capture scale; bulk import |
| **Reuse** | `POST /api/leads`, `aiScore`, n8n ingest JSON (3) |
| **Future** | Landing builder (F) — not in program until Phase 4+ |
| **Phase** | 0–2 |

---

### WS-AEO — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-003, E-017 |
| **Focus** | Server profile; industry packs |
| **Reuse** | Full `lib/aeo/*`, `AeoGrowthEngine`, `config/aeo/*` |
| **Docs** | `docs/aeo/` program |
| **Phase** | 1, 4 |

---

### WS-AI-GROWTH — **Existing** + **Enhancement** + **New**

| Item | Detail |
|------|--------|
| **Epics** | E-003, E-013 |
| **Focus** | Growth Engine + agents on same stack |
| **Reuse** | `compute.js`, `recommendations.js`, `scoring.js` |
| **Phase** | 1, 3 |

---

### WS-SEO — **Future Vision** + **New** (Phase 3)

| Item | Detail |
|------|--------|
| **Epics** | Part of E-013 SEO Agent |
| **Focus** | On-page audit prompts; keyword field reuse from profile |
| **Reuse** | `local-page` prompt, AEO keywords |
| **Not in M1–M2** | No standalone SEO module |

---

### WS-MARKETING-AUTO — **New** (Phase 2–3)

| Item | Detail |
|------|--------|
| **Epics** | E-012, E-014 |
| **Focus** | SMTP, sequences, n8n triggers |
| **Reuse** | `AI_CONTENT_LIBRARY`, n8n pattern |
| **Phase** | 2–3 |

---

### WS-CAMPAIGNS — **New** (Phase 3)

| Item | Detail |
|------|--------|
| **Epics** | E-014 |
| **Focus** | `campaigns` collection + wizard |
| **Reuse** | E-008 WA, E-012 email, Marketing Agent |

---

### WS-WHATSAPP — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-008, E-001 n8n |
| **Reuse** | `lib/whatsapp.js`, webhooks, mobile API, n8n |
| **Phase** | 0–2 |

---

### WS-EMAIL — **New** (Phase 2)

| Item | Detail |
|------|--------|
| **Epics** | E-012 |
| **Reuse** | SMTP env, content library |
| **Phase** | 2 |

---

### WS-CS — **Enhancement** (docs **Existing**)

| Item | Detail |
|------|--------|
| **Epics** | E-006, health widget (post E-003), E-001 validation |
| **Reuse** | `CUSTOMER_HEALTH_MODEL.md`, onboarding kit |
| **In-app** | Health widget, checklist — Phase 2 |
| **Phase** | 0–3 |

---

### WS-BILLING — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-004, E-005 |
| **Reuse** | Sprint 19A full stack |
| **Phase** | 1–2 |

---

### WS-SUBSCRIPTIONS — **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-005 |
| **Reuse** | `subscriptions`, `activate-payment.js` |
| **Phase** | 1–2 |

---

### WS-OPPORTUNITY — **New** (Phase 3)

| Item | Detail |
|------|--------|
| **Epics** | E-015 |
| **Reuse** | Lead link, Proposal status |
| **Phase** | 3–4 |

---

### WS-PROPOSAL / WS-QUOTATION / WS-INVOICE — **New** (Phase 3–4)

| Item | Detail |
|------|--------|
| **Epics** | E-015 (+ invoice epic future) |
| **Reuse** | Proposal Agent, billing, Razorpay |
| **Phase** | 3–4 |
| **Note** | Quote PDF and invoice = Phase 4 deliverables |

---

### WS-CUSTOMER360 — **New** (Phase 3)

| Item | Detail |
|------|--------|
| **Epics** | Composes E-009, E-008, E-005, activities |
| **Reuse** | Existing APIs only — composition page |
| **Phase** | 3 |

---

### WS-ANALYTICS — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-002 bridge revenue, E-005 MRR |
| **Reuse** | `kpis`, `retail-kpis`, `metrics`, mobile dashboard |
| **Future** | Cohorts (N) Phase 3+ |
| **Phase** | 1–3 |

---

### WS-EXEC-DASHBOARD — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-013 narrative card |
| **Reuse** | `/dashboard`, `KpiCard`, AEO full section |
| **Phase** | 1, 3 |

---

### WS-AI-AGENTS — **New** (Phase 3)

| Item | Detail |
|------|--------|
| **Epics** | E-013 |
| **Reuse** | `scoring.js`, `config/aeo/prompts` pattern |
| **Phase** | 3 |

---

### WS-MOBILE — **Existing** API + **New** client

| Item | Detail |
|------|--------|
| **Epics** | E-016, E-002 parity |
| **Reuse** | `mobile-routes.js`, OpenAPI, `docs/mobile/` |
| **Freeze** | Backend until PO lift |
| **Phase** | 3 |

---

### WS-ADMIN — **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-007 |
| **Reuse** | mobile `admin/*` |
| **Phase** | 1 |

---

### WS-PARTNER — **Future Vision**

| Item | Detail |
|------|--------|
| **Epics** | None in E-001–E-017 |
| **Phase** | 5+ |
| **Note** | Deferred per NAV V2 |

---

### WS-SECURITY — **Existing** + **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | Cross-cutting; E-002, E-004, E-007, E-013 |
| **Reuse** | `SECURITY_HARDENING.md`, tenant isolation |
| **Phase** | All |

---

### WS-PERFORMANCE — **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | Tech debt EN #88; E-011 chunking |
| **Phase** | 2+ |

---

### WS-INFRA / WS-DEVOPS — **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | E-001 |
| **Reuse** | Docker, compose, deploy.yml, ops docs |
| **Phase** | 0 ongoing |

---

### WS-TESTING — **Enhancement**

| Item | Detail |
|------|--------|
| **Epics** | All — WS3, Playwright R2.0 |
| **Reuse** | test scripts, validation checklists |
| **Phase** | 0+ |

---

## Feature Tag Index (workstream → tag)

| Feature area | Primary tag |
|--------------|-------------|
| LeadEdge CRM core | Existing |
| AI scoring | Existing |
| AEO Growth Engine UI | Existing |
| Executive dashboard | Existing |
| Razorpay one-time | Existing |
| JWT mobile APIs | Existing |
| n8n workflows (JSON) | Existing |
| Cookie-JWT bridge | Enhancement |
| Server AEO profile | Enhancement |
| Plan limits | Enhancement |
| Follow-ups web | Enhancement |
| Admin web | Enhancement |
| WA inbox web | Enhancement |
| Recurring billing | Enhancement |
| Lead detail / kanban | Enhancement |
| Bulk import | New Capability |
| SMTP / email | New Capability |
| Agent registry | New Capability |
| Campaigns entity | New Capability |
| Opportunities | New Capability |
| Native mobile app | New Capability |
| Industry packs | New Capability |
| Landing builder | Future Vision |
| Partner portal | Future Vision |
| Autonomous consultant | Future Vision |
| SSO | Future Vision |

---

## Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 3 Aug 2026 | Initial engineering execution program |

**STOP** — Program ready for sprint planning after PO lifts Product Freeze v1.0.

**Related:** [LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md](./LEADEDGE360_ENTERPRISE_DEVELOPMENT_STRATEGY.md) · `docs/customer-success/EXECUTIVE_ACTION_REGISTER.md` · `docs/operations/runtime-handover/03_AUTHENTICATED_VALIDATION_CHECKLIST.md`
