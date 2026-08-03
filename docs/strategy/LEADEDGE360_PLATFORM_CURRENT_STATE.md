# LeadEdge360 — Platform Current State (Repository Inventory)

**Version:** 1.0  
**Date:** 3 August 2026  
**Purpose:** Evidence-based understanding of the **existing** product — no recommendations, no roadmap, no code changes.  
**Package:** `nextjs-mongo-template` v0.1.0 (`package.json`)  
**Product name in UI/docs:** LeadEdge360 / Asoftech Insightz  

**Classification legend:**  
- ✅ **Fully Implemented** — working code path in repository  
- 🟡 **Partially Implemented** — exists but incomplete, JWT-only, stub, or not enforced  
- 🔵 **Documentation Only** — described in docs; no matching production code  
- ❌ **Missing** — not found in repo  
- **NOT VERIFIED** — could not confirm from static review  

---

## 1. Repository Overview

| Area | Path | Notes |
|------|------|-------|
| Application (Next.js) | `app/` | App Router: marketing, application, API, signin |
| Components | `components/` | aeo, dashboard, layout, site, ui (48 shadcn files) |
| Business logic | `lib/` | scoring, aeo, billing, mobile-routes, auth, mongo |
| Configuration | `config/aeo/` | 13 JSON files (prompts, rules, checklist) |
| Automation | `n8n/` | 7 workflow JSON files |
| Scripts | `scripts/` | `test-aeo-compute.mjs`, `simulate-billing-flow.mjs` |
| Hooks | `hooks/` | 2 files — **orphaned** (see §23) |
| Documentation | `docs/` | **91** markdown files + openapi/postman |
| Docker | `docker-compose.yml`, `Dockerfile` | app + mongo + n8n |
| **services/** | — | ❌ **Missing** — no `services/` directory |
| **database/** (runtime) | — | ❌ Mongo only; `docs/sql/` is PostgreSQL reference |
| **public/** (project) | — | ❌ No project `public/` folder (only node_modules) |
| **mobile/** (app code) | — | ❌ No native app; `docs/mobile/` only |

**Build output:** `.next/` present after build.  
**Tests:** `npm run test:aeo`, `npm run test:billing` — no full Jest/Playwright suite in `package.json`.

---

## 2. Architecture Overview

| Layer | Implementation | Evidence |
|-------|----------------|----------|
| **Frontend** | Next.js 14 App Router, React 18, client components on dashboards | `app/`, `package.json` |
| **API** | Single catch-all handler + mobile router | `app/api/[[...path]]/route.js`, `lib/mobile-routes.js` |
| **Auth (web)** | Emergent OAuth → session cookie | `lib/auth.js`, `lib/tenant.js` |
| **Auth (mobile)** | JWT + OTP + password | `lib/jwt.js`, `lib/otp.js`, `lib/password.js` |
| **Data** | MongoDB 6.6, tenant `orgId` scoping | `lib/mongo.js`, queries in `route.js` |
| **AI** | Emergent OpenAI proxy (`gpt-4o-mini`) | `lib/scoring.js` |
| **Automation** | External n8n → webhook APIs | `n8n/`, `POST /api/webhooks/*` |
| **Payments** | Razorpay orders (one-time) | `lib/razorpay.js`, `lib/billing/` |
| **Deploy** | Docker Compose: app, mongo, n8n | `docker-compose.yml` |

**Pattern:** Monolith — **not** microservices. **Do not replace** per product freeze (`docs/aeo/README.md`, `docs/mobile/README.md`).

---

## 3. Technology Stack

| Technology | In repo | Role |
|------------|---------|------|
| Next.js 14.2.3 | ✅ | App framework |
| React 18.3.1 | ✅ | UI |
| MongoDB 6.6 | ✅ | Primary database |
| Node.js | ✅ | API runtime |
| JWT (`jsonwebtoken`) | ✅ | Mobile auth |
| bcryptjs | ✅ | Password hashing |
| Emergent LLM | ✅ | `lib/scoring.js` → OpenAI-compatible proxy |
| n8n | ✅ | `docker-compose.yml` + JSON workflows |
| Razorpay | ✅ | `lib/razorpay.js` |
| WhatsApp Cloud API | 🟡 | `lib/whatsapp.js` — env-dependent |
| Google APIs (direct) | ❌ | Google **OAuth** (Emergent) + **lead webhook** only; no GBP API client |
| Recharts | ✅ | Dashboard charts |
| Tailwind + shadcn/ui | ✅ | UI primitives |
| Docker | ✅ | `Dockerfile`, compose |
| TanStack Query | 🟡 | Dependency + `app/providers.js` **not wired** |
| PostgreSQL runtime | ❌ | `docs/sql/` reference only |

---

## 4. Product Modules

| Module | Route / entry | Status |
|--------|---------------|--------|
| **Marketing site** | `/`, `/about`, `/products`, `/pricing`, `/solutions`, `/contact`, `/blog` | ✅ |
| **Workspace dashboard** | `/dashboard` | ✅ |
| **LeadEdge360 CRM** | `/leadedge360` | ✅ |
| **RetailEdge360** | `/retailedge360` | ✅ |
| **AI Growth Engine (AEO)** | `/dashboard` (embedded) | ✅ |
| **Billing status** | `/billing`, `/billing/success` | ✅ |
| **Sign-in** | `/signin` | ✅ |
| **App download / API promo** | `/download` | ✅ |
| **Legal** | `/privacy`, `/terms` | ✅ |
| **Legacy `/app/*`** | `/app`, `/app/crm`, etc. | 🟡 Redirects only (`next.config.js`) |
| **Opportunities / Partners / Commissions** | — | ❌ |
| **Native mobile app** | — | ❌ |

---

## 5. APIs

### 5.1 Web + cookie auth (`app/api/[[...path]]/route.js`)

| Root | Methods | Status |
|------|---------|--------|
| `/api` | GET | ✅ Health name/time |
| `auth` | login, callback, me, logout, dpdp-consent | ✅ |
| `agents` | GET | ✅ Hardcoded `AGENTS` array |
| `leads` | GET, POST, PATCH, DELETE, status, assign, rescore | ✅ |
| `kpis` | GET | ✅ |
| `products` | GET, POST, DELETE, repredict | ✅ |
| `retail-kpis` | GET | ✅ |
| `billing` | plans, checkout, verify, status, simulate | ✅ |
| `webhooks` | razorpay, whatsapp, facebook, google | ✅ |
| `contact` | POST | ✅ |
| `seed-reset` | POST | 🟡 Demo/dev reseed |

### 5.2 Mobile JWT (`lib/mobile-routes.js` — invoked from same catch-all)

| Root | Key endpoints | Status |
|------|---------------|--------|
| `auth` | register, verify-otp, login-password, refresh-token, logout, etc. | ✅ |
| `users` | me, PATCH me, change-password, subscription | ✅ |
| `followups` | CRUD, reminders, close | ✅ **JWT only** |
| `dashboard` | kpis, followups-due, revenue, sales-performance | ✅ **JWT only** |
| `whatsapp` | send, send-template, conversation/:leadId | ✅ **JWT only** |
| `notifications` | list, read, devices, settings | ✅ **JWT only** |
| `admin` | users, roles, subscriptions, product-access | 🟡 Partial — some OpenAPI paths missing |

**Documented but NOT VERIFIED in handler grep:** `POST /api/leads/sources`, `POST /api/admin/roles`, `POST /api/admin/subscriptions` (`TECHNICAL_DEBT_REPORT.md`).

---

## 6. Components

| Folder | Files | Used in app | Status |
|--------|-------|-------------|--------|
| `components/aeo/` | `AeoGrowthEngine.jsx` | `/dashboard`, `/leadedge360` | ✅ |
| `components/dashboard/` | `KpiCard.jsx` | Dashboards | ✅ |
| `components/layout/` | AppShell, DashboardHeader, ProductSwitcher, nav configs | Application layout | ✅ |
| `components/site/` | SiteShell, Navbar, Footer, DPDP, effects | Marketing | ✅ |
| `components/ui/` | 48 shadcn files | **13 used**, 36 unused | 🟡 Debt |

**Orphaned:** `WorkspacePlaceholder.jsx` — not used by current `/app/*` redirects.

---

## 7. Database (MongoDB collections)

| Collection | Written by | Status |
|------------|------------|--------|
| `leads` | `route.js`, webhooks | ✅ |
| `products` | `route.js` | ✅ |
| `lead_activities` | `route.js` | ✅ |
| `users` | tenant, mobile auth | ✅ |
| `orgs` | tenant, billing | ✅ |
| `payments` | billing checkout/verify | ✅ |
| `subscriptions` | `activate-payment.js` | ✅ |
| `audit_logs` | `billing/audit.js` | ✅ |
| `consent_log` | auth dpdp | ✅ |
| `contact_requests` | contact form | ✅ |
| `follow_ups` | `mobile-routes.js` | ✅ (no web UI) |
| `auth_otps` | `otp.js` | ✅ |
| `auth_refresh_tokens` | `jwt.js` | ✅ |
| `whatsapp_messages` | mobile WA handlers | ✅ |
| `notifications` | mobile | ✅ |
| `push_devices` | mobile | ✅ |

**SQL schemas in `docs/sql/`:** 🔵 Documentation Only — not used at runtime.

---

## 8. AI Capabilities

| Capability | Location | Status |
|------------|----------|--------|
| Lead AI scoring (LLM) | `lib/scoring.js` `aiScore()` | ✅ |
| Rule-based lead scoring fallback | `lib/scoring.js` `ruleScore()` | ✅ |
| AEO composite scoring | `lib/aeo/compute.js` | ✅ |
| Rule recommendations | `lib/aeo/recommendations.js` | ✅ |
| LLM content (8 prompts) | `config/aeo/prompts/*.json` → `runAeoPrompt()` | ✅ |
| Retail shelf-life LLM | `lib/retail-ai.js` | ✅ |
| AI agents orchestration | — | ❌ |
| Deal/revenue prediction ML | — | ❌ |
| Autonomous consultant loop | — | ❌ |

**LLM endpoint:** `https://integrations.emergentagent.com/llm/openai/v1/chat/completions` (`lib/scoring.js`).  
**Requires:** `EMERGENT_LLM_KEY` — without it, hybrid/rule fallback.

---

## 9. Automation

| Automation | Location | Status |
|------------|----------|--------|
| WhatsApp lead ingest | `n8n/whatsapp-lead-ingest.json` → webhook | ✅ JSON |
| Facebook Lead Ads ingest | `n8n/facebook-lead-ingest.json` | ✅ JSON |
| Google Lead Form ingest | `n8n/google-lead-ingest.json` | ✅ JSON |
| WhatsApp follow-up (stale leads) | `n8n/whatsapp-followup-automation.json` | ✅ JSON |
| AEO profile reminder | `n8n/aeo-profile-reminder.json` | ✅ JSON |
| AEO FAQ nudge | `n8n/aeo-faq-nudge.json` | ✅ JSON |
| AEO review reminder | `n8n/aeo-review-reminder.json` | ✅ JSON |
| In-app workflow builder | — | ❌ |
| Email campaign automation | — | ❌ (SMTP env only) |

**Production active state:** NOT VERIFIED — requires ops import (`POST_DEPLOY_CHECKLIST.md`).

---

## 10. Customer Journey (product touchpoints)

| Stage | Touchpoint | Status |
|-------|------------|--------|
| Discovery | Marketing pages, `/pricing` | ✅ |
| Sign-up / auth | `/signin`, Emergent Google OAuth | ✅ |
| DPDP consent | Sign-in + banner | ✅ |
| Onboarding | Dashboard, AEO profile panel | 🟡 Profile sessionStorage only |
| Lead capture | CRM dialog, webhooks | ✅ |
| Qualification | Status + AI score | ✅ |
| Proposal | Status `Proposal` | 🟡 No proposal document |
| Customer (Won) | Status `Won` | ✅ |
| Billing | `/pricing` checkout, `/billing` status | 🟡 Recurring not implemented |
| Expansion | Plan entitlements | 🟡 Limits not enforced in API |

**Journey docs:** 🔵 `docs/customer-success/CUSTOMER_JOURNEY_REVIEW.md` (comprehensive); Tenant #1 live evidence NOT CAPTURED.

---

## 11. Business Workflow (implemented)

| Workflow | Status | Evidence |
|----------|--------|----------|
| Lead create → auto score → label | ✅ | `POST /api/leads`, `aiScore` |
| Status update + activity log | ✅ | PATCH status, `lead_activities` |
| Rescore lead | ✅ | `POST .../rescore` |
| Assign agent (territory pool) | ✅ | `assignAgent()`, assign API |
| WhatsApp outreach (manual) | ✅ | `wa.me` on lead row |
| WhatsApp ingest → lead | ✅ | webhook + n8n |
| Retail SKU create → AI shelf-life | ✅ | `POST /api/products` |
| Retail repredict | ✅ | `POST .../repredict` |
| Subscribe (one-time Razorpay) | ✅ | checkout + verify + `activatePaymentSuccess` |
| Follow-up task (mobile) | ✅ | `follow_ups` — JWT only |
| AEO profile edit → KPI update | 🟡 Client-only persistence |
| Team user admin | 🟡 JWT admin API only |

**Statuses:** `New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost` (`route.js` line 31).

---

## 12. Existing Dashboard

| Dashboard | Route | KPIs / widgets | Status |
|-----------|-------|----------------|--------|
| **Workspace overview** | `/dashboard` | Total leads, hot, conversion, SKUs at risk; AEO full; product cards | ✅ |
| **LeadEdge CRM** | `/leadedge360` | 5 KPIs, AEO strip, 4 charts, agent table, lead table | ✅ |
| **Retail inventory** | `/retailedge360` | 5 KPIs, 2 charts, SKU table | ✅ |
| Marketing dashboard | — | ❌ |
| Revenue dashboard (web) | — | 🟡 `dashboard/revenue` JWT API only |
| `/app` executive modules | redirects | 🟡 |

---

## 13. Existing Marketing Features

| Feature | Status | Evidence |
|---------|--------|----------|
| Landing page | ✅ | `app/(marketing)/page.js` |
| About, products, solutions, blog | ✅ | marketing routes |
| Pricing page + Razorpay CTA | ✅ | `pricing/page.js` |
| Contact form | ✅ | `POST /api/contact` |
| DPDP banner | ✅ | `DpdpConsentBanner.jsx` |
| GTM copy pack | 🔵 | `docs/customer-success/MARKETING_ASSETS.md` |
| SEO site audit | ❌ | |
| Email campaigns | ❌ | |
| Social scheduler | ❌ | |
| Blog CMS | 🟡 Static blog page — NOT VERIFIED for dynamic posts |
| Landing page generator | ❌ | |

---

## 14. Existing CRM Features

| Feature | Status | Evidence |
|---------|--------|----------|
| Lead list + filters (territory, status, role) | ✅ | `leadedge360/page.js` |
| Create lead dialog | ✅ | |
| Lead detail dialog (score, reasons, status) | ✅ | |
| AI score + Hot/Warm/Cold | ✅ | `scoring.js` |
| Pipeline statuses | ✅ | 6 statuses |
| KPI API + charts | ✅ | `GET /api/kpis` |
| Agent performance chart | ✅ | `byAgent` |
| Source / territory charts | ✅ | |
| 14-day trend | ✅ | `trend[]` |
| WhatsApp deep link | ✅ | |
| Contact entity | 🟡 Fields on lead (name, phone, email) |
| Company entity | 🟡 `company` on lead |
| Opportunity module | ❌ | metrics counter only on live deploy |
| Quotation / invoice | ❌ | |
| Customer 360 | ❌ | |
| Bulk CSV import | ❌ | |
| Dedicated lead URL `/leads/[id]` | ❌ | Dialog only |
| Web follow-ups UI | ❌ | |

---

## 15. Existing AEO Features

| Feature | Status | Evidence |
|---------|--------|----------|
| AEO Score (weighted) | ✅ | `compute.js` |
| Business Completeness % | ✅ | checklist |
| FAQ Readiness | ✅ | target 5 FAQs |
| Local Visibility % | ✅ | territories vs `kpis.byTerritory` |
| Review Health | ✅ | profile review fields |
| Improve profile panel | ✅ | `AeoGrowthEngine.jsx` |
| Growth recommendations (rules) | ✅ | `recommendations.js` |
| LLM: FAQ, description, GBP, review, local, social, WA outreach | ✅ | 8 prompt JSON files |
| Readiness checklist | ✅ | `readiness-checklist.json` |
| Server profile sync | 🟡 | `sessionStorage` via `lib/aeo/profile.js` |
| SEO score (separate) | ❌ | |
| Website health audit | ❌ | |
| Daily growth plan (in-app) | 🔵 | Docs/playbooks only |
| n8n AEO reminders | ✅ | 3 workflow JSON files |

---

## 16. Existing AI Features (beyond AEO)

| Feature | Status | Evidence |
|---------|--------|----------|
| Lead scoring LLM + rules | ✅ | `aiScore`, `ruleScore` |
| Scoring reasons array | ✅ | Returned on lead |
| Re-score on demand | ✅ | rescore endpoint |
| Retail shelf-life LLM + heuristic | ✅ | `predictShelfLife` |
| Engine indicator (LLM vs Hybrid) | ✅ | UI KPI cards |
| Cross-product “Copilot” | 🔵 | Mentioned in marketing/signin copy — no dedicated module |
| AI agents | ❌ | |

---

## 17. Existing Customer Success Features

| Feature | Status | Evidence |
|---------|--------|----------|
| CS documentation (18+ files) | 🔵 | `docs/customer-success/` |
| Onboarding kit | 🔵 | Not in-app |
| Health scoring model | 🔵 | `CUSTOMER_HEALTH_MODEL.md` — external rules |
| Weekly business review template | 🔵 | `WEEKLY_BUSINESS_REVIEW.md` |
| Training academy docs | 🔵 | `TRAINING_ACADEMY.md` |
| Commercial validation templates | 🔵 | `COMMERCIAL_VALIDATION_TOOLKIT.md` |
| In-app health widget | ❌ | |
| In-app NPS | ❌ | |
| Automated CS playbooks in product | ❌ | |

---

## 18. Existing Billing

| Feature | Status | Evidence |
|---------|--------|----------|
| Plans Starter/Growth/Scale | ✅ | `lib/razorpay.js` PLANS + pricing page |
| Razorpay checkout (order) | ✅ | `POST /api/billing/checkout` |
| Payment verify + webhook | ✅ | verify + `webhooks/razorpay` |
| `activatePaymentSuccess` | ✅ | subscriptions + org entitlements |
| `GET /api/billing/status` | ✅ | |
| Billing on `auth/me` | ✅ | `org-billing.js` |
| `/billing` UI page | ✅ | `billing/page.js` |
| Recurring subscriptions | ❌ | `BILLING_GAP_ANALYSIS.md`, `CHANGELOG_SPRINT19A` |
| Trial periods | ❌ | |
| Invoice PDF | ❌ | |
| Plan limit enforcement | 🟡 | `plan-entitlements.js` limits **not checked** on lead create |
| Product gating in UI | 🟡 | Flags on org; soft enforcement |

---

## 19. Existing Mobile APIs

| Area | Status | Web UI |
|------|--------|--------|
| JWT auth (register, OTP, password, refresh) | ✅ | ❌ |
| Users me / PATCH / subscription | ✅ | ❌ |
| Follow-ups CRUD | ✅ | ❌ |
| Dashboard kpis, followups-due, revenue, sales-performance | ✅ | ❌ |
| WhatsApp send, template, conversation | ✅ | ❌ |
| Notifications + push devices | ✅ | ❌ |
| Admin users CRUD | ✅ | ❌ |
| OpenAPI 3.1 spec | 🔵 | `docs/openapi.json` |
| Native mobile application | ❌ | `docs/mobile/` program only |

**Mobile program freeze:** 🔵 `docs/mobile/README.md` — documentation only for backend changes.

---

## 20. Existing Security

| Control | Status | Evidence |
|---------|--------|----------|
| TLS / HSTS (deploy) | ✅ | `SECURITY_HARDENING.md`, live probes |
| Tenant isolation `orgId` | ✅ | All lead/product queries |
| DPDP consent logging | ✅ | `consent_log` |
| JWT access/refresh | ✅ | `lib/jwt.js` |
| Webhook token (`N8N_WEBHOOK_TOKEN`) | ✅ | n8n + route |
| Razorpay signature verify | ✅ | `razorpay.js` |
| bcrypt passwords | ✅ | mobile auth |
| `.env` secrets | ✅ | `.env.example` |
| Rate limiting | 🟡 | nginx docs — NOT VERIFIED in app code |
| RBAC web UI | ❌ | |
| SSO | ❌ | Scale marketing only |

---

## 21. Existing Deployment

| Item | Status | Evidence |
|------|--------|----------|
| Docker Compose (app, mongo, n8n) | ✅ | `docker-compose.yml` |
| Multi-stage Dockerfile | ✅ | `Dockerfile` |
| GitHub Actions deploy | ✅ | `.github/workflows/deploy.yml` |
| POST_DEPLOY checklist | 🔵 | `docs/POST_DEPLOY_CHECKLIST.md` |
| nginx config doc | 🔵 | `docs/nginx.conf` |
| Postgres deploy doc | 🔵 | Not runtime |
| Production pilot validation | 🟡 | Open items in `runtime-handover/` |

---

## 22. Existing Documentation

| Category | Count / location | Status |
|----------|----------------|--------|
| Strategy | 3 files | `docs/strategy/` |
| AEO program | 16+ files | `docs/aeo/` |
| Customer success / GTM | 18 files | `docs/customer-success/` |
| Mobile program | 12 files | `docs/mobile/` |
| Operations / pilot | 19 files | `live-validation`, `runtime-reconciliation`, `runtime-handover` |
| Sprint / enterprise plans | 10+ files | SPRINT19*, ENTERPRISE_* |
| API | openapi, postman, MOBILE_API_GUIDE, auth-flow, error-codes | ✅ |
| Security / deploy | POST_DEPLOY, SECURITY_HARDENING, POSTGRES_DEPLOYMENT | ✅ |
| Engineering handbook (single file) | NOT VERIFIED | No `ENGINEERING_HANDBOOK.md` found |
| PRD (single file) | 🟡 | `docs/mobile/MOBILE_PRD.md` (mobile only) |
| Product freeze | 🔵 | `docs/aeo/README.md`, CS reports — active v1.0 |
| Release notes | 🟡 | `CHANGELOG_SPRINT19A.md` only |

---

## 23. Existing Reusable Components

| Component | Reuse for |
|-----------|-----------|
| `KpiCard.jsx` | Any KPI row |
| `AeoGrowthEngine.jsx` | Growth panels |
| `AppShell.jsx` + `DashboardHeader.jsx` | All app pages |
| `ProductSwitcher.jsx` | Multi-product nav |
| shadcn subset (13) | Forms, tables, dialogs |
| Inline `Kpi` in retailedge360 | 🟡 Duplicate of KpiCard pattern |

---

## 24. Existing Reusable Services (lib modules)

| Module | Function |
|--------|----------|
| `lib/mongo.js` | DB connection |
| `lib/tenant.js` | Org resolution, Emergent user |
| `lib/scoring.js` | `aiScore`, `runAeoPrompt` |
| `lib/retail-ai.js` | `predictShelfLife` |
| `lib/razorpay.js` | Payments |
| `lib/whatsapp.js` | WA Cloud send |
| `lib/billing/*` | Entitlements, activation, audit |
| `lib/aeo/*` | compute, profile, prompts, recommendations, actions |
| `lib/mobile-routes.js` | Full JWT API surface |
| `lib/auth.js` | Emergent OAuth |
| `lib/jwt.js`, `otp.js`, `password.js` | Mobile auth stack |

**No `services/` layer** — logic lives in `lib/` + route handlers.

---

## 25. Existing Reusable AI

| Asset | Path |
|-------|------|
| LLM gateway | `lib/scoring.js` |
| Prompt loader | `lib/aeo/prompts.js` |
| Prompt templates | `config/aeo/prompts/*.json` (8) |
| Rule configs | `config/aeo/rules/*.json` (2) |
| Checklist weights | `config/aeo/readiness-checklist.json` |
| Defaults (territories, FAQ target, LLM rate) | `config/aeo/defaults.json` |
| Field definitions | `config/aeo/business-profile-fields.json` |
| Server action wrapper | `lib/aeo/actions.js` → `invokeAeoPrompt` |

---

## 26. Existing Reusable Automation

| Asset | Reuse |
|-------|-------|
| Webhook ingest pattern | `POST /api/webhooks/{channel}` |
| n8n → app token header | `X-Webhook-Token` / `N8N_WEBHOOK_TOKEN` |
| 7 workflow JSON templates | Import to n8n |
| Follow-up collection schema | `follow_ups` (mobile) |
| Stale lead selection logic | `whatsapp-followup-automation.json` |
| AEO reminder patterns | `aeo-*-reminder.json` |

---

## Master capability classification table

| Capability | Class |
|------------|-------|
| LeadEdge360 CRM core | ✅ |
| AI lead scoring | ✅ |
| KPI dashboards + charts | ✅ |
| RetailEdge360 + shelf-life AI | ✅ |
| AEO Growth Engine UI | ✅ |
| AEO LLM prompts (8) | ✅ |
| AEO rule recommendations | ✅ |
| Executive `/dashboard` | ✅ |
| Marketing website | ✅ |
| Razorpay one-time checkout | ✅ |
| Subscription records + entitlements | ✅ |
| Mongo multi-tenant | ✅ |
| n8n workflow JSON (7) | ✅ |
| Webhook lead ingest (WA/FB/Google) | ✅ |
| Mobile JWT API suite | ✅ |
| Emergent Google sign-in (web) | ✅ |
| DPDP consent | ✅ |
| Docker deploy stack | ✅ |
| CS/GTM documentation | 🔵 |
| Mobile PRD + architecture docs | 🔵 |
| AEO program specs | 🔵 |
| Pilot ops documentation | 🔵 |
| PostgreSQL SQL schemas | 🔵 |
| Product freeze governance | 🔵 |
| AEO server profile persistence | 🟡 |
| Web access to follow-ups/admin/WA | 🟡 |
| Plan limit enforcement | 🟡 |
| Billing recurring / invoices | 🟡 / ❌ |
| `/app/*` workspace modules | 🟡 redirects |
| Hardcoded sales agents | 🟡 |
| Opportunity UI | ❌ |
| Proposal/quote/invoice docs | ❌ |
| Customer 360 | ❌ |
| Email/SMS campaigns | ❌ |
| SEO/AEO/site audits in-app | ❌ |
| Landing page / blog CMS | ❌ |
| AI agents | ❌ |
| Native mobile app | ❌ |
| Partner/commission module | ❌ |
| SSO / enterprise RBAC web | ❌ |
| In-app CS health/NPS | ❌ |
| Google Business Profile API | ❌ |
| Instagram lead ingest | ❌ |
| `services/` abstraction layer | ❌ |
| Project `public/` assets folder | ❌ |

---

## Product freeze (current governance)

| Source | Statement |
|--------|-----------|
| `docs/aeo/README.md` | Active — no new APIs, collections, navigation, architecture changes |
| `docs/mobile/README.md` | Mobile v2 — documentation only for backend |
| `docs/customer-success/PO_CUSTOMER_READINESS_REPORT.md` | LeadEdge360 v1.0 freeze; eng frozen |
| `docs/aeo/post-deployment/10_PO_DECISION_PACK.md` | Pilot validation governance |

**Engineering handbook:** NOT VERIFIED as standalone file — practices scattered across SPRINT19*, TECHNICAL_DEBT, SECURITY_HARDENING.

---

## Pilot / production state (documentation evidence)

| Item | State |
|------|-------|
| Tenant #1 CRM metrics | NOT CAPTURED |
| Authenticated validation WS3 | PENDING |
| Infra SSH checklist | INCOMPLETE (2 Aug 2026) |
| Live AEO in container | NOT VERIFIED |
| Platform metrics probe (03 Aug) | `active_tenants: 0`, `active_users_24h: 0` |

This does **not** change code classifications — it reflects **operational validation** status documented in `docs/operations/` and `docs/customer-success/TENANT1_SUCCESS_DASHBOARD.md`.

---

## Understanding complete — next step

This document records **current state only**.  

**No roadmap. No enhancements. No code.**  

Await Product Owner instruction before suggesting or implementing changes.

**Primary references for deep dives:**  
- API: `app/api/[[...path]]/route.js`, `lib/mobile-routes.js`  
- UI: `app/(application)/`, `components/aeo/AeoGrowthEngine.jsx`  
- Strategy context (separate): `docs/strategy/LEADEDGE360_STRATEGIC_ASSESSMENT.md`
