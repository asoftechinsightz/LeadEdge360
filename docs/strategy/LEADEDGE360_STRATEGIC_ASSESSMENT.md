# LeadEdge360 — Strategic Product Assessment

**Version:** 1.0  
**Date:** 3 August 2026  
**Authors:** CPO / Architecture / AI / CRM / GTM synthesis (documentation pass)  
**Method:** Full repository + docs review — **no code changes**  
**Product freeze:** v1.0 active  

**Companion docs:**  
- [LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md) — Top 100, v2/v3 roadmap, AI strategy  
- `docs/customer-success/` — GTM & pilot execution  
- `docs/aeo/` — AI Growth Engine specs  

---

## 1. Executive Summary

**LeadEdge360 today** is an **AI-augmented dual-product workspace** inside Asoftech Insightz: **LeadEdge360** (lead CRM + scoring + pipeline KPIs) and **RetailEdge360** (SKU shelf-life AI), plus a **client-side AI Growth Engine (AEO)** for MSME visibility, wrapped in marketing site, Emergent cookie auth, Razorpay one-time checkout (Sprint 19A), and a **JWT mobile API surface** without a shipped native app.

**What it is not yet:** An autonomous AI Business Growth Operating System, full marketing automation platform, or enterprise CRM. The **vision documentation and CS/GTM packs exceed live production validation** — Tenant #1 operational data is **NOT CAPTURED**; infra parity and authenticated validation remain open (`docs/operations/runtime-handover/`).

**Ultimate goal alignment:** Phase-1 AEO + rule recommendations + n8n ingest/follow-up are **credible foundations** for “digital business partner” — but **80%+ of TARGET PLATFORM capabilities are Partial, Not Started, or Future Vision**.

**Strategic recommendation:** Execute **Commercial GA hardening** on existing modules (auth bridge, profile persistence, billing recurrence, plan enforcement, production validation), then **Growth Automation** (campaigns, follow-ups web, GBP workflow), then **AI Business Growth** (agents, content publishing, BI), without replacing Next.js + MongoDB + Emergent LLM architecture.

### Maturity scores (evidence-based)

| Score | Value | Rationale |
|-------|-------|-------------|
| **Product Maturity** | **47 / 100** | Core CRM + retail + AEO RC strong; nav stubs, mobile UI gap, production unverified |
| **Commercial Readiness** | **38 / 100** | GTM docs ready; Tenant #1 evidence absent; checkout/SMTP often unconfigured on live |
| **AI Maturity** | **41 / 100** | Scoring + 8 AEO prompts + rules; no agents, no autonomous loops, profile not server-persisted |

### PO decision (pilot operations)

**READY WITH CONDITIONS** — documentation and platform core exist; **pilot business execution blocked** until CS-01 + OPS-01 closed (`EXECUTIVE_ACTION_REGISTER.md`).

---

## 2. Product Capability Map

| Domain | Already developed | Partial | Not started | Primary evidence |
|--------|-------------------|---------|-------------|------------------|
| **Lead generation** | Webhooks (WA/FB/Google), manual lead, API POST | n8n ops-dependent | Landing page builder, ads manager | `route.js` webhooks; `n8n/*.json` |
| **CRM** | `/leadedge360` full table, status, score, charts | Agent list hardcoded | Customer 360, opportunities UI | `leadedge360/page.js`, `route.js` |
| **Opportunity** | Metrics counter only | — | Opportunity module | `/api/metrics`; no UI |
| **Proposal** | Status `Proposal` in pipeline | — | Proposal docs/PDF | `STATUSES` in `route.js` |
| **Quotation / Invoice** | — | — | Not started | NOT VERIFIED |
| **Payments** | Razorpay order + verify + webhook | Recurring, invoices | — | `lib/billing/*`, `CHANGELOG_SPRINT19A` |
| **Customer success** | 18 CS docs, health model | Live tenant data | In-app CS workflows | `docs/customer-success/` |
| **Marketing** | Marketing pages, contact API | Campaign execution | Ad platform integration | `(marketing)/` routes |
| **SEO / AEO** | AEO dashboard, 8 prompts, rules, checklist | Server profile sync | Auto-publish to web | `components/aeo/`, `config/aeo/` |
| **Google Business** | GBP URL field, post draft prompt | — | API posting | AEO prompts |
| **Social** | Social caption prompt | — | Scheduling, analytics | `social-caption.json` |
| **Website** | Marketing site | — | Site auditor, CMS | static pages |
| **WhatsApp** | Deep links, ingest webhook, WA API (mobile) | n8n automation | Inbox web UI | `lib/whatsapp.js`, n8n |
| **Email** | — | SMTP env (often missing) | Campaigns | `/api/health` smtp check |
| **Automation** | 7 n8n JSON workflows | Import/active on VPS NOT CAPTURED | Visual workflow builder in-app | `n8n/` |
| **Reviews** | Profile metrics + reply prompt | — | Auto-post replies | AEO profile fields |
| **Analytics / BI** | KPI APIs, charts, `/api/metrics` | Executive rollup UI partial | Forecasting, cohorts | `kpis`, `mobile-routes` dashboard |
| **Executive dashboard** | `/dashboard` + KPI row | `/app` stubs redirect | Full command center | `dashboard/page.js` |
| **AI recommendations** | Rule engine + LLM prompts | — | Autonomous agent loops | `lib/aeo/recommendations.js` |
| **AI agents** | — | — | Not started | Future vision |
| **Mobile** | JWT API (`mobile-routes.js`) | — | Native app | `docs/mobile/` |
| **Admin / settings** | JWT admin APIs | — | Web admin UI | `mobile-routes.js` |
| **Billing / subscription** | One-time checkout, entitlements | Limits not enforced | Recurring subs | Sprint 19A |
| **Training** | Training academy docs | — | In-app academy | `TRAINING_ACADEMY.md` |
| **Partner management** | — | — | Not started | `SPRINT19_NAVIGATION_V2` 0/10 |

---

## 3. Current Architecture Assessment

| Layer | Assessment | Evidence |
|-------|------------|----------|
| **Pattern** | Next.js 14 App Router monolith + single catch-all API | `app/api/[[...path]]/route.js` |
| **Data** | MongoDB multi-tenant (`orgId`) | `lib/mongo.js`, `lib/tenant.js` |
| **Auth web** | Emergent OAuth cookie | `lib/auth.js` |
| **Auth mobile** | JWT + OTP + password | `lib/jwt.js`, `mobile-routes.js` |
| **AI** | Emergent OpenAI proxy, shared `lib/scoring.js` | `EMERGENT_LLM_KEY` |
| **Automation** | External n8n + webhook token | `n8n/`, webhooks in `route.js` |
| **Deploy** | Docker Compose (app, mongo, n8n) | `docker-compose.yml` |
| **Strengths** | Fast iteration, unified API, AEO config-driven, billing activation path | Codebase |
| **Constraints** | Cookie vs JWT split blocks web follow-ups/admin; no microservices | `TECHNICAL_DEBT_REPORT`, `SPRINT19_NAVIGATION_V2` |
| **Scalability** | Single-node Mongo suitable for pilot; no sharding/caching layer documented | NOT VERIFIED at load |
| **Security** | DPDP consent, tenant isolation, webhook tokens; secrets in `.env` | `SECURITY_HARDENING.md` |
| **Tech debt** | 36 unused UI components, 11 unused npm deps, stub `/app/*` | `TECHNICAL_DEBT_REPORT.md` |

**Verdict:** Architecture is **appropriate for MSME pilot**; **reuse and extend** — do not replace.

---

## 4. Business Capability Assessment

| Capability | Maturity | Notes |
|------------|----------|-------|
| MSME onboarding (documented) | High | `CUSTOMER_ONBOARDING_KIT.md` |
| MSME onboarding (live Tenant #1) | **NOT CAPTURED** | No auth validation |
| Lead-to-Won workflow | Medium (product) | Status pipeline in CRM |
| Multi-channel capture | Medium | Requires n8n ops |
| AI-guided growth (AEO) | Medium (RC) | Unconfirmed on live VPS |
| Retail expiry intelligence | Medium | RetailEdge360 complete core |
| Self-serve monetization | Low–Medium | One-time Razorpay; keys often missing |
| Enterprise sales motion | Low | Scale plan = contact form |
| Partner / channel | Not started | Partners route redirects |

---

## 5. AI Capability Assessment

| Capability | Status | Evidence |
|------------|--------|----------|
| Lead scoring (LLM + rules) | **Already exists** | `lib/scoring.js` `aiScore()` |
| Shelf-life prediction | **Already exists** | `lib/retail-ai.js` |
| AEO composite score | **Already exists** | `lib/aeo/compute.js` |
| Rule recommendations | **Already exists** | `lib/aeo/recommendations.js` |
| Generative content (8 templates) | **Already exists** | `config/aeo/prompts/*.json` |
| LLM via Emergent proxy | **Already exists** | Same as scoring |
| Profile persistence (server) | **Enhancement needed** | `sessionStorage` only |
| Deal loss prediction | **Not started** | — |
| Revenue forecast | **Not started** | Mobile `dashboard/revenue` API only |
| Competitor tracking | **Not started** | — |
| Autonomous daily consultant | **Future vision** | — |
| Multi-agent orchestration | **Future vision** | — |

---

## 6. CRM Assessment

| Feature | Status | Evidence |
|---------|--------|----------|
| Lead CRUD | **Exists** | `route.js` leads |
| Status pipeline (6 stages) | **Exists** | `STATUSES` |
| AI score + Hot/Warm/Cold | **Exists** | `scoring.js` |
| Territories + sources | **Exists** | Filters, charts |
| Agent assignment | **Partial** | Hardcoded `AGENTS`; assign API exists |
| Lead detail dialog | **Exists** | `leadedge360/page.js` |
| Rescore | **Exists** | `POST /api/leads/:id/rescore` |
| WhatsApp deep link | **Exists** | Lead row |
| Activities audit | **Exists** | `lead_activities` |
| Follow-ups (web) | **Missing** | JWT-only `mobile-routes.js` |
| Opportunities module | **Missing** | Metrics counter only |
| Proposal documents | **Missing** | Status only |
| Customer 360 | **Missing** | — |
| Bulk import CSV | **Missing** | — |
| Team user admin (web) | **Missing** | JWT admin APIs |

---

## 7. Marketing Assessment

| Feature | Status | Evidence |
|---------|--------|----------|
| Marketing website | **Exists** | `(marketing)/` |
| Pricing page + checkout CTA | **Exists** | `pricing/page.js` |
| Contact form | **Exists** | `POST /api/contact` |
| GTM asset pack | **Exists** | `MARKETING_ASSETS.md` |
| Email campaigns | **Not started** | SMTP often unconfigured |
| In-app campaign manager | **Not started** | — |
| Social scheduling | **Not started** | Caption prompt only |
| Landing page AI builder | **Future vision** | — |
| Ad spend / ROI tracking | **Not started** | — |

---

## 8. SEO & AEO Assessment

| Feature | Status | Evidence |
|---------|--------|----------|
| Business profile checklist | **Exists** | `readiness-checklist.json` |
| 5 AEO KPIs on dashboard | **Exists** | `AeoGrowthEngine.jsx` |
| FAQ, description, GBP, review prompts | **Exists** | 8 prompt files |
| Local visibility from territory KPIs | **Exists** | `compute.js` + `kpis.byTerritory` |
| Rule-based growth scanner | **Exists** | `recommendations.js` |
| Server-side profile + sync | **Enhancement** | sessionStorage |
| Auto blog / landing pages | **Future vision** | — |
| Live AEO on production VPS | **NOT VERIFIED** | `runtime-handover` |
| Public AEO API | **Not started** (by design freeze) | — |

---

## 9. Lead Generation Assessment

| Channel | Status | Evidence |
|---------|--------|----------|
| Manual web entry | **Exists** | CRM dialog |
| Website API | **Exists** | `POST /api/leads` |
| WhatsApp ingest | **Exists** | webhook + n8n |
| Facebook Lead Ads | **Exists** | webhook + n8n |
| Google Lead Form | **Exists** | webhook + n8n |
| Referral source tracking | **Exists** | `source` field |
| Paid ads management | **Not started** | — |
| SEO content engine | **Partial** | AEO drafts manual publish |
| Lead magnets / landing pages | **Not started** | — |

---

## 10. Customer Success Assessment

| Asset | Status |
|-------|--------|
| Onboarding kit, playbooks, health model | **Complete** (docs) |
| Training academy | **Complete** (docs) |
| Weekly WBR template | **Complete** |
| Tenant #1 dashboard | **Template only** — NOT CAPTURED |
| In-app health score | **Not started** | Model is external doc |
| Automated CS playbooks in product | **Not started** | — |
| NPS / ROI in product | **Not started** | Toolkit templates only |

---

## 11. Automation Assessment

| Automation | Status | Evidence |
|------------|--------|----------|
| n8n lead ingest (3 channels) | **Exists** (JSON) | `n8n/*-ingest.json` |
| WhatsApp follow-up automation | **Exists** (JSON) | `whatsapp-followup-automation.json` |
| AEO reminders (profile, FAQ, review) | **Exists** (JSON) | `aeo-*.json` |
| In-app workflow builder | **Not started** | — |
| Email automation | **Not started** | — |
| Active on production | **NOT CAPTURED** | Ops validation pending |

---

## 12. Business Intelligence Assessment

| BI capability | Status | Evidence |
|---------------|--------|----------|
| CRM KPI API | **Exists** | `GET /api/kpis` |
| Retail KPI API | **Exists** | `GET /api/retail-kpis` |
| 14-day trend chart | **Exists** | `kpis.trend` |
| Source / territory / agent breakdown | **Exists** | CRM charts |
| Mobile dashboard revenue API | **Exists** (JWT) | `mobile-routes.js` |
| Executive `/dashboard` | **Exists** | Combined KPIs + AEO |
| MRR metric | **Partial** | `/api/metrics` — often 0 |
| Forecasting / churn prediction | **Not started** | — |
| Cohort / funnel analytics | **Not started** | — |
| Competitor intelligence | **Not started** | — |

---

## 13. Executive Dashboard Assessment

| Element | Status | Location |
|---------|--------|----------|
| Workspace overview | **Exists** | `/dashboard` |
| Lead KPIs (4) | **Exists** | total, hot, conversion, retail risk |
| AEO Growth Engine | **Exists** | Full section |
| Product cards | **Exists** | LeadEdge + Retail links |
| Plan badge | **Partial** | From `auth/me` billing |
| `/app` executive modules | **Not started** | Redirects only |
| Mobile executive advisor | **Future vision** | — |

---

## 14. Mobile Readiness Assessment

| Layer | Score component | Evidence |
|-------|-----------------|----------|
| API completeness | **High** | 30+ endpoints in `mobile-routes.js` |
| OpenAPI / docs | **High** | `docs/openapi.json`, `docs/mobile/` |
| Native app | **Not started** | No RN/Flutter |
| Web parity | **Low** | Follow-ups, admin, WA inbox JWT-only |
| Offline strategy | **Documented only** | `MOBILE_OFFLINE_STRATEGY.md` |
| Product freeze on mobile backend | **Active** | `docs/mobile/README.md` |

**Mobile readiness:** **API-ready, client-not-shipped** — ~55/100 API layer, ~15/100 end-user delivery.

---

## 15. Commercial Readiness Assessment

| Gate | Status | Source |
|------|--------|--------|
| Pricing & positioning | Ready | `/pricing`, `MARKETING_ASSETS.md` |
| Sales / CS playbooks | Ready | `docs/customer-success/` |
| Self-serve checkout | Partial | Sprint 19A; Razorpay often off on live |
| Recurring billing | Not started | `BILLING_GAP_ANALYSIS.md` |
| Tenant #1 proof | **NOT CAPTURED** | `TENANT1_SUCCESS_DASHBOARD.md` |
| Expansion criteria | Documented | `TENANT_EXPANSION_READINESS.md` |
| Legal (DPDP, terms) | Exists | `/privacy`, consent flows |

---

## 16. Enterprise Readiness Assessment

| Requirement | Status |
|-------------|--------|
| SSO | **Future** (Scale plan mentions) |
| Audit logs | **Partial** — billing `audit_logs` |
| RBAC web UI | **Missing** — JWT admin only |
| Multi-user provisioning web | **Missing** |
| Plan limit enforcement | **Missing** |
| SLA / status page | **NOT CAPTURED** |
| VPC / on-prem | **Future** (Scale marketing) |
| Data residency docs | Partial — DPDP |

**Enterprise readiness:** **Low (~25/100)** — suitable for MSME pilot, not enterprise GA.

---

## 17. Production Readiness Assessment

| Check | Status | Evidence |
|-------|--------|----------|
| HTTPS / health | **Observed** | `/api/health` 03 Aug 2026 |
| Mongo connected | **Observed** | Same |
| Git SHA / Docker parity | **Open** | SSH blocked |
| AEO on live container | **Unconfirmed** | Reconciliation matrix |
| Authenticated validation | **PENDING** | WS3 checklist |
| Tenant activity in metrics | **0** tenants/users in probe | `/api/metrics` |
| SMTP / Razorpay on live | **Often false** | Health checks |

**Production readiness for Tenant #1 pilot execution:** **NOT READY** without closing `EXECUTIVE_ACTION_REGISTER` P1 items.

---

## 18. Gap Analysis

### Current vs future capability (summary)

| Layer | Current (v1.0) | Future (AI BG OS) |
|-------|----------------|-------------------|
| User model | Owner + manual ops users | Self-serve team + roles |
| Growth | AEO checklist + drafts | Autonomous consultant |
| CRM | Pipeline + score | Full revenue workspace |
| Marketing | Static site + n8n | Campaign OS |
| BI | KPI charts | Predictive executive AI |
| Automation | External n8n | In-app + agents |

### Critical gaps (blocking GA)

1. Web cookie ↔ JWT bridge (follow-ups, admin, profile)  
2. Server persistence for AEO profile  
3. Production deploy parity + validation  
4. Recurring billing + plan enforcement  
5. Tenant #1 operational proof  

### Missing automation

- Email sequences, in-app workflow UI, auto-publish to GBP/social, review auto-reply  

### Missing AI

- Agents, deal/revenue prediction, competitor monitor, website auditor  

### Missing executive insights

- Unified revenue forecast, cohort dashboards, AI advisor narrative  

---

## 19. Priority Matrix

| Priority | Theme | Examples | Horizon |
|----------|-------|----------|---------|
| **P0** | Production truth | Infra checklist, auth validation, deploy parity | Now |
| **P0** | GA blockers | Profile server sync, cookie-JWT bridge, plan limits | Phase 1 GA |
| **P1** | Growth automation | Follow-ups web UI, n8n ops standard, email SMTP | Phase 2 |
| **P1** | Commercial | Recurring Razorpay, invoices, billing page stable | Phase 1–2 |
| **P2** | CRM depth | Lead detail route, pipeline board, bulk import | Phase 2 |
| **P2** | Marketing execution | Campaign templates in-app, WA inbox web | Phase 2–3 |
| **P3** | AI agents (specialized) | AEO, Sales, CS agents on existing prompts | Phase 3 |
| **P4** | Autonomous OS | Daily consultant, auto-campaigns, forecasting | Phase 4–5 |

---

## 20–22. Maturity Scores (detail)

### Product Maturity — 47/100

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Core CRM | 20% | 72 | LeadEdge360 functional |
| Retail module | 10% | 70 | RetailEdge360 functional |
| AEO / growth | 15% | 55 | Strong RC; live unverified |
| Platform / nav | 10% | 35 | Stubs, split auth |
| Billing | 10% | 45 | 19A foundation; gaps |
| Mobile delivery | 10% | 25 | API only |
| Docs / CS | 10% | 85 | Excellent packs |
| Production validated | 15% | 20 | Tenant #1 NOT CAPTURED |

### Commercial Readiness — 38/100

| Dimension | Score | Notes |
|-----------|-------|-------|
| GTM collateral | 80 | Complete |
| Pricing / packaging | 65 | Defined |
| Checkout live | 30 | Often unconfigured |
| Pilot proof | 10 | No tenant data |
| Expansion playbook | 50 | Documented gates |
| Legal / compliance | 60 | DPDP present |

### AI Maturity — 41/100

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scoring / prediction | 65 | Leads + retail |
| Generative content | 55 | 8 AEO prompts |
| Recommendations | 50 | Rules + scanner |
| Personalization | 25 | No server profile |
| Agents / autonomy | 10 | Not started |
| MLOps / eval | 15 | Manual prompts only |

---

## 23. Top 100 Enhancements

See **[LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md)** § Top 100 (each tagged: Already Exists / Enhancement / New Capability / Future Vision).

---

## 24–26. Roadmap & Vision

See **[LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md](./LEADEDGE360_ENHANCEMENTS_AND_ROADMAP.md)** for:

- Phase 1–5 roadmap (Commercial GA → Autonomous OS)  
- v2 / v3 vision  
- AI agent catalog  
- Long-term AI Business Growth strategy  

---

## Phase 2 answers — Product vision snapshot

| Question | Answer |
|----------|--------|
| **What is it today?** | Dual-product AI CRM workspace + AEO growth panel for Indian MSMEs |
| **Problems solved** | Scattered leads, slow prioritization, weak visibility, retail expiry risk |
| **Customers** | MSMEs/SMBs (services, retail); Tier 1–2 India; solopreneur to 20-seat sales |
| **Modules** | LeadEdge360, RetailEdge360, AEO, marketing site, billing (partial) |
| **Workflows** | Capture → score → status pipeline → WhatsApp; profile → AEO KPIs |
| **Positioning** | AI Growth CRM vs generic CRM (`SALES_PLAYBOOK.md`) |
| **Pilot status** | Platform up; Tenant #1 execution **NOT CAPTURED**; READY WITH CONDITIONS |
| **Architecture** | Next.js + Mongo + n8n + Emergent LLM (§3) |
| **Maturity** | Pilot-core strong; GA gaps (§20) |
| **Current roadmap** | Sprint 19A billing done; NAV V2 deferred stubs; freeze active |
| **Future vision** | AI Business Growth Operating System (Phase 4–5) |

---

## Evidence gaps (explicit)

| Gap | Label |
|-----|-------|
| Tenant #1 CRM metrics | NOT CAPTURED |
| Live AEO in container | NOT VERIFIED FROM PRODUCTION |
| n8n active on VPS | NOT CAPTURED |
| Load/performance at scale | NOT VERIFIED FROM CODEBASE |
| Customer feedback / NPS | NOT CAPTURED |

---

**STOP** — Strategic assessment complete. Implementation requires PO lift of product freeze.
