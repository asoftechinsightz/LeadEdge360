# API Consumption Report

**Audit date:** 22 June 2026  
**Client libraries:** `src/lib/api.ts` (Axios), `components/suite/suite-api.ts` (fetch), raw `fetch`

**Base URL:** `NEXT_PUBLIC_API_BASE_URL || '/api'`

---

## 1. Infrastructure

| File | Role |
|------|------|
| `src/lib/api.ts` | Axios `api` + helpers; Bearer token; 401 → `POST /auth/refresh-token` |
| `components/suite/suite-api.ts` | `suiteFetch()` with explicit `/api/...` paths |
| `src/services/api/index.ts` | `leadEdgeApi` — mock or HTTP adapter |
| `src/services/api/config.ts` | `USE_MOCK_API` unless `NEXT_PUBLIC_USE_MOCK_API=false` |
| `src/services/api/adapters/httpClient.ts` | Enterprise module HTTP mappings |

**Stats:** ~55 unique REST endpoints from direct `api*` calls; 5 raw fetch paths; 12 enterprise methods via adapter.

---

## 2. Auth & Session

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/signin/page.js` | POST | `/auth/login-password` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `app/splash/page.js` | GET | `/auth/me` | — | User object |
| `components/suite/SettingsModule.js` | GET | `/auth/me` | — | `{ user }` |
| `src/lib/api.ts` | POST | `/auth/refresh-token` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `components/site/DpdpConsentBanner.jsx` | POST | `/api/auth/dpdp-consent` | `{ essential, analytics, marketing, acceptedAt, version }` | — |

---

## 3. Onboarding & Settings

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `SettingsModule.js` | GET | `/onboarding/status` | — | `{ companyProfile, branding, team, whatsapp, email }` |
| `SettingsModule.js` | GET | `/agents` | — | `{ agents: [] }` |
| `SettingsModule.js` | GET | `/admin/roles` | — | `{ roles: [] }` |
| `SettingsModule.js` | GET | `/users/subscription` | — | Subscription object |
| `SettingsModule.js` | GET | `/notifications/settings` | — | `{ push, email, whatsapp }` |
| `SettingsModule.js` | PATCH | `/notifications/settings` | Notification prefs | — |
| `LeadDetailTabs.js` | GET | `/agents` | — | `{ agents: [] }` |

---

## 4. Leads

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `src/hooks/useLeads.ts` | GET | `/leads` | Query params | `{ leads: [], meta? }` |
| `LeadDashboard.js` | GET | `/leads` | `{ territory?, status?, role? }` | `{ leads: [] }` |
| `LeadsManagement.js` | GET | `/sales/leads` | `{ page, limit, status?, label?, q? }` | `{ items, total, page, pages }` |
| `LeadCaptureDialog.js` | POST | `/leads` | `{ name, email, phone, company, message, source, territory, budget, whatsapp }` | `{ lead }` |
| `LeadDetailTabs.js` | GET | `/leads/:id` | — | Lead |
| `LeadOverview.js` | PATCH | `/leads/:id` | `{ name, email, phone, company, status }` | Updated lead |
| `LeadDetailTabs.js` | GET | `/leads/:id/timeline` | — | Timeline events |
| `LeadDetailTabs.js` | GET | `/leads/:id/notes` | — | Notes array |
| `LeadNotes.js` | POST | `/leads/:id/notes` | `{ note }` | Created note |
| `LeadDetailTabs.js` | GET | `/leads/:id/followups` | — | Followups |
| `FollowupList.js` | POST | `/leads/:id/followups` | `{ title, dueAt }` | Created followup |
| `LeadDetailTabs.js` | GET | `/leads/:id/assignments` | — | Assignments |
| `LeadAssignments.js` | POST | `/leads/:id/assign` | `{ assignedTo }` | Result |
| `TaskList.js` | GET | `/leads/:id/tasks` | — | Tasks |

---

## 5. Opportunities

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/opportunities/page.js` | GET | `/opportunities/dashboard` | — | `{ total, won, lost, pipelineValue }` |
| `app/opportunities/page.js` | GET | `/opportunities/pipeline` | — | `{ items: [] }` |
| `LeadDashboard.js` | GET | `/opportunities/dashboard` | — | Dashboard stats |
| `PipelineBoard.js` | POST | `/opportunities/move` | `{ leadId, status, reason }` | Stage update |

---

## 6. Scoring & KPIs

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `LeadDashboard.js` | GET | `/kpis` | Filters | KPI object |
| `LeadDashboard.js` | GET | `/lead-scoring/dashboard` | — | `{ hot, warm, cold }` |
| `AnalyticsDashboard.js` | GET | `/kpis` | — | KPI object |
| `httpClient.ts` | GET | `/lead-scoring/dashboard` | — | AI workspace scores |
| `httpClient.ts` | GET | `/lead-scoring/priority` | — | `{ items: [] }` |

---

## 7. Analytics & Dashboards

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `LeadDashboard.js` | GET | `/analytics/summary` | — | Summary metrics |
| `app/revenue/page.js` | GET | `/analytics/funnel` | — | Funnel stages |
| `app/revenue/page.js` | GET | `/analytics/summary` | — | Summary |
| `AnalyticsDashboard.js` | GET | `/analytics/sources` | — | Source breakdown |
| `AnalyticsDashboard.js` | GET | `/analytics/campaigns` | — | Campaign analytics |
| `ExecutiveDashboard.js` | GET | `/dashboard/kpis` | — | Executive KPIs |
| `ExecutiveDashboard.js` | GET | `/dashboard/followups-due` | — | Followups list |
| `ExecutiveDashboard.js` | GET | `/dashboard/revenue` | `{ range: '30d' }` | `{ series: [] }` |
| `ExecutiveDashboard.js` | GET | `/dashboard/sales-performance` | — | Performance |
| `ExecutiveDashboard.js` | GET | `/recent-activities` | — | `{ activities: [] }` |
| `ExecutiveDashboard.js` | GET | `/dashboard/proposals` | — | Proposal summary |
| `ExecutiveDashboard.js` | GET | `/dashboard/invoices` | — | Invoice summary |
| `AnalyticsDashboard.js` | GET | `/dashboard/revenue` | `{ range: '30d' }` | Revenue series |

---

## 8. Campaigns

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/campaigns/page.js` | GET | `/campaigns` | `{ page, limit: 20 }` | `{ items: [] }` |
| `app/campaigns/page.js` | GET | `/campaigns/summary` | — | `{ draft, running, completed, scheduled }` |

---

## 9. Proposals

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/proposals/page.js` | GET | `/proposals` | — | `{ proposals: [] }` |
| `app/proposals/[id]/page.js` | GET | `/proposals` | — | List (client filter) |
| `app/proposals/[id]/page.js` | POST | `/proposals/:id/email` | `{ email }` | Success |
| `app/proposals/[id]/page.js` | POST | `/proposals/:id/won` | — | Success |
| `app/proposals/[id]/page.js` | POST | `/proposals/:id/convert-to-invoice` | — | `{ invoiceNumber }` |
| `app/proposals/[id]/page.js` | GET | `/proposals/:id/pdf` | — | PDF Blob |

---

## 10. Revenue, Billing & Invoices

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/revenue/page.js` | GET | `/revenue/dashboard` | — | Revenue dashboard |
| `LeadDashboard.js` | GET | `/revenue/dashboard` | — | Same |
| `BillingCenter.js` | GET | `/revenue/dashboard` | — | Same |
| `PlansGrid.js` | GET | `/billing/plans` | — | `{ plans: [] }` |
| `useSubscribeCheckout.js` | POST | `/billing/checkout` | `{ planId }` | `{ order, key }` |
| `useSubscribeCheckout.js` | POST | `/billing/verify` | Razorpay fields + `{ planId }` | `{ ok }` |
| `PlansGrid.js` | GET | `/users/subscription` | — | Subscription |
| `BillingCenter.js` | GET | `/users/subscription` | — | Subscription |
| `app/invoices/page.js` | GET | `/invoices` | — | `{ invoices: [] }` |
| `BillingCenter.js` | GET | `/invoices` | — | Invoices |
| `BillingCenter.js` | GET | `/payments` | — | `{ payments: [] }` |

---

## 11. Products & RetailEdge360

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/product-selection/page.js` | GET | `/products` | — | `{ products: [] }` |
| `app/product-selection/page.js` | POST | `/products/switch` | `{ product }` | Switch result |
| `RetailDashboard.js` | GET | `/products` | — | `{ products: [] }` |
| `RetailDashboard.js` | GET | `/retail-kpis` | — | Retail KPIs |
| `RetailDashboard.js` | POST | `/products/:id/repredict` | — | `{ product }` |
| `RetailDashboard.js` | DELETE | `/products/:id` | — | Delete result |
| `ProductCaptureDialog.js` | POST | `/products` | `{ name, sku, category, price, stock, daysOnShelf, store }` | `{ product }` |

---

## 12. Growth (Business Card & Audit)

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `BusinessCardEditor.tsx` | GET | `/growth/business-card` | — | `{ items: [] }` |
| `BusinessCardEditor.tsx` | POST | `/growth/business-card` | `{ profile, slug }` | `{ data: BusinessCard }` |
| `BusinessCardEditor.tsx` | PATCH | `/growth/business-card/:id` | `{ profile, slug }` | `{ data: BusinessCard }` |
| `BusinessCardEditor.tsx` | POST | `/growth/business-card/:id/publish` | — | `{ data: BusinessCard }` |
| `BusinessCardEditor.tsx` | POST | `/api/media/upload` | `FormData { file }` | `{ url }` |
| `app/growth-audit/page.js` | GET | `/scanner/results` | — | `{ results: [] }` |
| `app/growth-audit/page.js` | POST | `/growth-audit` | `{ name, company, phone, email, industry, website, monthlyRevenue, challenge }` | Submission result |

---

## 13. Suite Utilities (suiteFetch)

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `NotificationBell.tsx` | GET | `/api/notifications` | — | `{ notifications: [], unread }` |
| `NotificationBell.tsx` | POST | `/api/notifications/:id/read` | — | Mark read |
| `GlobalSearch.tsx` | GET | `/api/lead-search?q=` | Query `q` | `{ leads: [] }` |

---

## 14. Public / Marketing

| Source | Method | Endpoint | Request | Response |
|--------|--------|----------|---------|----------|
| `app/contact/page.js` | POST | `/api/contact` | `{ name, email, company, message }` | HTTP 200 |

---

## 15. Enterprise Modules (`leadEdgeApi` → `httpClient.ts`)

Active when `NEXT_PUBLIC_USE_MOCK_API=false`:

| UI Component | API Method | HTTP Calls | Response Type |
|--------------|------------|------------|---------------|
| `AICommandCenter.tsx` | `commandCenter()` | GET `/kpis`, GET `/recent-activities` | CommandCenterData |
| `AICommandCenter.tsx` | `aiWorkspace()` | GET `/lead-scoring/dashboard` | AIWorkspaceData |
| `ExecutiveCommandCenter.tsx` | `executiveDashboard()` | Composite | ExecutiveDashboardData |
| `AIInsightsPage.tsx` | `aiInsights()` | GET `/kpis` | AIInsight[] |
| `GeoLeadFinder.tsx` | `geoLeads()` | GET `/scanner/results` | GeoLead[] |
| `TerritoryManagement.tsx` | `territories()` | GET `/kpis` | Territory[] |
| `GrowthAuditEngine.tsx` | `growthAudits()` | GET `/scanner/results` | GrowthAudit[] |
| `GrowthAuditEngine.tsx` | `growthScores()` | GET `/lead-scoring/priority` | GrowthAuditScore[] |
| `AutomationHub.tsx` | `automations()` | GET `/campaigns/summary` | AutomationWorkflow[] |
| `RevenueIntelligence.tsx` | `revenueIntelligence()` | GET `/revenue/dashboard`, GET `/dashboard/revenue` | RevenueIntelligenceData |
| `Conversations.tsx` | `conversations()` | GET `/notifications` | ConversationThread[] |
| `Reports.tsx` | `reports()` | GET `/reports/exports` | ReportItem[] |

**Default:** Mock adapter returns static data; no HTTP calls.

---

## 16. APIs With Backend But No Frontend UI

| API area | Routes | Missing UI |
|----------|--------|------------|
| Portal | `app/api/portal/*` (8 routes) | No `app/portal/` |
| Partners admin | `app/api/partners/*` | No `app/partners/dashboard/` |
| QR Engine | Planned Sprint 2 | No frontend |
| Reviews | Planned Sprint 3 | No frontend |
| Mobile | `app/api/mobile/*` | No mobile app |

---

## 17. Key Findings

1. **Single axios client** handles most authenticated traffic.
2. **Inconsistent paths:** Some calls use `/api/...` explicitly while others rely on base URL prefix.
3. **Enterprise is mock-first** — 8 AI Workspace screens do not hit real dedicated APIs.
4. **`apiPut` exported but unused** in application source.
5. **Typed contracts partial** — see `src/types/` for auth, billing, dashboard, lead.

---

*See [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md) for API-side auth gates.*
