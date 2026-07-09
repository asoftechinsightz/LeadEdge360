# UI Gap Report

**Audit date:** 22 June 2026  
**References:** `GAP_ANALYSIS_REPORT.md`, `SPRINT_PLAN.md`, `PLATFORM_AUDIT_REPORT.md`

---

## 1. Sprint Completion Overview

| Sprint | Theme | Status |
|--------|-------|--------|
| S0 | Stabilization (indexes, tenant, rate limit) | **Complete** |
| S1 | Digital Business Card | **Complete** |
| S2 | QR Engine | **Not started** |
| S3 | Reviews | **Not started** |
| S4 | WhatsApp + AI Assistant v1 | **Partial** |
| S5 | Suite polish (feature flags, portal UI) | **Not started** |
| S6 | Retail foundation | **Not started** |

---

## 2. Existing Screens (built & functional)

### 2.1 Business Suite — production-ready core

| Screen | Route | API-backed | Notes |
|--------|-------|------------|-------|
| Executive Dashboard | `/dashboard` | Yes | KPIs, revenue, activities |
| Leads list | `/leads` | Yes | Full CRUD |
| Lead detail | `/leads/[id]` | Yes | Notes, tasks, timeline |
| Opportunities | `/opportunities` | Yes | Pipeline board |
| Proposals list | `/proposals` | Yes | |
| Proposal detail | `/proposals/[id]` | Yes | PDF, email, convert |
| Invoices | `/invoices` | Yes | |
| Revenue | `/revenue` | Yes | Dashboard + funnel |
| Campaigns | `/campaigns` | Yes | |
| Analytics | `/analytics` | Yes | |
| Settings | `/settings` | Yes | Partial tabs static |
| Payments / Billing | `/payments` | Yes | Razorpay checkout |
| Onboarding | `/onboarding` | Yes | Company setup |
| Product selection | `/product-selection` | Yes | Post-login |
| Subscribe | `/subscribe` | Yes | Plans grid |

### 2.2 Growth — Sprint 1

| Screen | Route | Status |
|--------|-------|--------|
| Business Card Editor | `/growth/business-card` | **Built** |
| Public Business Card | `/c/[slug]` | **Built** |
| Growth Audit (public) | `/growth-audit` | **Built** |

### 2.3 LeadEdge360 — CRM core

| Screen | Route | Status |
|--------|-------|--------|
| Lead dashboard (alias routes) | `/leadedge360/leads` | Built (redirects to shared CRM) |
| Executive home | `/leadedge360` | Built |

### 2.4 RetailEdge360 — basic

| Screen | Route | Status |
|--------|-------|--------|
| Retail dashboard | `/retailedge360` | Built — catalog/inventory demo |

### 2.5 Marketing site

| Screen | Routes | Status |
|--------|--------|--------|
| GIX homepage + pages | `/`, `/about`, `/products`, etc. | Built |
| Contact | `/contact` | Built |
| Sign-in | `/signin` | Built |

---

## 3. Incomplete Screens

### 3.1 AI Workspace — mock by default

`NEXT_PUBLIC_USE_MOCK_API=true` (default) → static mock data.

| Screen | Route | Issue |
|--------|-------|-------|
| AI Command Center | `/leadedge360/command-center` | Mock data |
| AI Insights | `/leadedge360/insights` | Mock data |
| Automation Hub | `/leadedge360/automation` | Mock + "Workflow builder coming soon" |
| Geo Lead Finder | `/leadedge360/geo-finder` | Mock (partial scanner API mapping) |
| Territory Management | `/leadedge360/territories` | Mock data |
| Growth Audit Engine | `/leadedge360/growth-engine` | Mock data |
| Revenue Intelligence | `/leadedge360/revenue-intelligence` | Mock / partial real revenue API |
| Conversations | `/leadedge360/conversations` | Mock data |
| Reports | `/leadedge360/reports` | Mock + "Report scheduler coming soon" |

**Fix path:** Set `NEXT_PUBLIC_USE_MOCK_API=false` + wire dedicated APIs (Sprint 4–5).

### 3.2 Settings — static / placeholder tabs

| Tab | Issue |
|-----|-------|
| API Keys | Hardcoded fake keys (`le_live_••••`, `whsec_••••`) |
| Integrations | Zapier, Slack marked "Coming soon" |
| Generate new key | Button non-functional |

### 3.3 Marketing vs product mismatch

| Screen | Issue |
|--------|-------|
| `/products` | RetailEdge360 badge "Coming Soon" while `/retailedge360` exists |
| `/partners` | Marketing landing only — no partner admin dashboard |

### 3.4 Business Card — minor gaps

| Item | Sprint plan | Actual |
|------|-------------|--------|
| Nav feature-flag hidden | S1-13 | Shows with "new" badge; no plan gating in UI |
| QR widget on editor | S2-10 | Not built (deferred Sprint 2) |

---

## 4. Missing Screens (from sprint plan & gap analysis)

### 4.1 Sprint 2 — QR Engine

| Planned | Route | Status |
|---------|-------|--------|
| `QrManager.tsx` | `/growth/qr` | **Missing** |
| Public QR redirect | `/q/[code]` | **Missing** |
| QR API routes | `/api/qr/*` | **Missing** |

### 4.2 Sprint 3 — Reviews

| Planned | Route | Status |
|---------|-------|--------|
| `ReviewDashboard.tsx` | `/growth/reviews` | **Missing** |
| Review API | `/api/reviews/*` | **Missing** |

### 4.3 Sprint 4 — WhatsApp & AI

| Planned | Status |
|---------|--------|
| Real conversations UI wired to WhatsApp API | **Missing** |
| AI insights in lead detail | **Missing** |
| `app/api/ai/*` routes | **Missing** |
| Click-to-chat from public business card | **Partial** (wa.me link exists; no tracking) |

### 4.4 Sprint 5 — Suite polish

| Planned | Route | Status |
|---------|-------|--------|
| `useFeatureFlag()` hook + nav gating | — | **Missing** |
| Customer portal UI | `/portal/*` | **Missing** (API exists) |
| Partner admin dashboard | `/partners/dashboard` | **Missing** (API exists) |
| Onboarding branding → business card link | Settings company tab | **Built** (Sprint 1) |

### 4.5 Sprint 6 — Retail foundation

| Planned | Status |
|---------|--------|
| `lib/retail/` domain layer | **Missing** |
| `/api/retail/inventory` | **Missing** |
| Enhanced inventory UI | **Missing** |
| POS, GST billing, barcode, loyalty | **Missing** (gap analysis) |

### 4.6 Other missing from vision

| Module | Status |
|--------|--------|
| Native mobile apps | Not in repo (`/api/mobile/*` partial) |
| QR analytics dashboard | Not built |
| Review response templates UI | Not built |
| Multi-language public cards | Not built |

---

## 5. API Exists, UI Missing

| Backend | API path prefix | Missing frontend |
|---------|-----------------|------------------|
| Customer portal | `app/api/portal/*` | `app/portal/` entire tree |
| Partner program | `app/api/partners/*` | `app/partners/dashboard/` |
| Mobile API | `app/api/mobile/*` | Native client |

---

## 6. Screen Completeness Matrix

| Module | Screens planned (approx.) | Built | Complete | Mock/Partial | Missing |
|--------|---------------------------|------:|---------:|-------------:|--------:|
| Marketing | 13 | 13 | 13 | 0 | 0 |
| Business Suite CRM | 12 | 12 | 11 | 1 (settings) | 0 |
| Billing | 3 | 3 | 3 | 0 | 0 |
| Growth S1 | 2 | 2 | 2 | 0 | 0 |
| Growth S2–S3 | 4 | 0 | 0 | 0 | 4 |
| LeadEdge360 CRM | 4 | 4 | 4 | 0 | 0 |
| AI Workspace | 9 | 9 | 0 | 9 | 0 |
| RetailEdge360 | 8+ (vision) | 1 | 0 | 1 | 7+ |
| Portal | 5+ | 0 | 0 | 0 | 5+ |
| Partners admin | 3+ | 0 | 0 | 0 | 3+ |

---

## 7. Priority Gap Recommendations (documentation only)

| Priority | Gap | Sprint |
|----------|-----|--------|
| P0 | Disable mock for enterprise OR label screens "Demo" | S4/S5 |
| P0 | Portal UI for existing API | S5 |
| P1 | `useFeatureFlag` + nav gating | S5 |
| P1 | QR Engine screens | S2 |
| P1 | Reviews screens | S3 |
| P2 | Partner admin dashboard | S5 |
| P2 | Retail inventory foundation | S6 |
| P2 | Unify RBAC display in Settings | S5 |
| P3 | Settings API keys (real implementation) | Backlog |

---

## 8. Testing & Go-Live Readiness

| Area | UI ready for go-live? |
|------|----------------------|
| CRM core (leads, opps, proposals) | Yes |
| Revenue, invoices, payments | Yes |
| Campaigns, analytics | Yes |
| Business Card (Sprint 1) | Yes (with Mongo + plan) |
| AI Workspace | **No** — demo/mock |
| Retail MVP | **No** — catalog demo only |
| Portal / Partners | **No** — API only |
| QR / Reviews | **No** — not built |

**Certified modules (per go-live retest):** CRM, revenue, payments, portal API, partners — backend certified; portal/partner **UI** still missing.

---

*Index: [BUSINESS_SUITE_AUDIT_INDEX.md](./BUSINESS_SUITE_AUDIT_INDEX.md)*
