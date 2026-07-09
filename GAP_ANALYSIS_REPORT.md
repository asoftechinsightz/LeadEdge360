# AsoftechInsightz Business Suite — Gap Analysis Report

**Phase:** 2 — Gap Analysis  
**Date:** 23 June 2026  
**Prerequisite:** `PLATFORM_AUDIT_REPORT.md`  
**Rule:** No implementation until this document is approved

---

## Executive Summary

The platform has a **strong certified CRM/revenue core** suitable for early paying customers in professional services and B2B segments. Gaps concentrate in:

1. **Five new LeadEdge360 growth modules** (business card, QR, reviews, WhatsApp depth, AI assistant) — all **missing**
2. **RetailEdge360 MVP** (POS, inventory, GST, loyalty) — **mostly missing**; only product catalog + KPIs exist
3. **Mobile-native apps** — API partial, **no Android/iOS**
4. **Feature-flag-driven subscriptions** — plan features exist but **not fully enforced** across UI/API
5. **Enterprise mock layer** — LeadEdge360 AI screens default to mock; must wire to real APIs without breaking production

**Strategy alignment:** LeadEdge360 is primary revenue product. RetailEdge360 shares suite services but must remain **loosely coupled** via shared auth, billing, notifications, QR, reporting — not shared CRM schema.

---

## Classification Legend

| Class | Meaning |
|-------|---------|
| ✅ **Already Complete** | Production-ready; do not redesign |
| ♻️ **Reusable** | Exists; extend for new modules |
| 🔧 **Needs Enhancement** | Partial; harden or complete |
| ❌ **Missing** | Net-new build required |
| ⚠️ **Technical Debt** | Works but risky; schedule remediation |
| 🔒 **Security Risk** | Must fix before scale |
| ⚡ **Performance Risk** | Must fix before scale |

---

## 1. LeadEdge360 — MVP Priority Features

| Feature | Classification | Current state | Gap / action |
|---------|----------------|---------------|--------------|
| Lead Management | ✅ Complete | Full CRUD, search, filters, UI | None — preserve |
| Lead Assignment | 🔧 Needs Enhancement | Works; hardcoded agents | Wire to `users` collection; RBAC on assign |
| Lead Timeline | ✅ Complete | `lead_timeline` + UI | None |
| Notes | ✅ Complete | GET/POST | None |
| Tasks | 🔧 Needs Enhancement | Create/read only | Add PATCH/complete/delete; mobile parity |
| Follow-ups | 🔧 Needs Enhancement | Partial REST + mobile | Unify API surface |
| Opportunity Management | ✅ Complete | Pipeline, stages, auto-create | None — preserve |
| Proposal Management | ✅ Complete | PDF, email, invoice conversion | None — preserve |

**Directive:** Do not redesign working CRM modules.

---

## 2. LeadEdge360 — New Modules (Target vs Current)

### Module 1: Digital Business Card — ❌ Missing

| Requirement | Status |
|-------------|--------|
| Business profile (logo, details) | ❌ No public card page or schema |
| Call / WhatsApp / Email buttons | ❌ |
| Google Maps / website link | ❌ |
| Public shareable URL | ❌ |
| Mobile responsive | ♻️ Design system reusable |

**Reusable assets:** `BrandLogo`, `lib/brand.js`, onboarding branding API (`/api/onboarding/branding`), `orgs` collection

**Proposed collections:** `business_cards` (`orgId`, `slug`, `profile`, `socialLinks`, `published`)

---

### Module 2: QR Engine — ❌ Missing

| Requirement | Status |
|-------------|--------|
| Business card QR | ❌ |
| WhatsApp QR | ❌ |
| Review QR | ❌ |
| Scan / click / conversion tracking | ❌ |

**Reusable assets:** None dedicated; campaign analytics pattern in `lib/campaigns/analytics.js` for event tracking model

**Proposed collections:** `qr_codes`, `qr_events` (scan, click, convert) — tenant-scoped, API-first

**Business Suite sharing:** Single QR service consumed by LeadEdge360 + RetailEdge360 (loose coupling via API)

---

### Module 3: Review & Reputation Management — ❌ Missing

| Requirement | Status |
|-------------|--------|
| Review campaigns | ❌ |
| Review requests | ❌ |
| Review dashboard | ❌ |
| Review analytics | ❌ |
| Response templates | ❌ |
| Negative review alerts | ❌ |

**Reusable assets:** Campaign engine (`lib/campaigns/`), email templates, notification infrastructure (partial)

**Gap:** No Google/Facebook review API integration; no `reviews` domain model

---

### Module 4: WhatsApp Integration — 🔧 Needs Enhancement

| Requirement | Status |
|-------------|--------|
| Click-to-Chat | ⚠️ Partial — links possible; no card integration |
| Lead capture | ♻️ Webhook ingest exists (`/api/webhooks/whatsapp`) |
| Auto response | ❌ |
| Campaign messaging | ♻️ Campaign execute path; WhatsApp channel incomplete |
| Conversation tracking | 🔧 Partial — `whatsapp_messages`, `/leadedge360/conversations` (mock UI) |

**Reusable:** `lib/mobile-routes.js` WhatsApp send, `whatsapp_messages` collection, Conversations UI shell (mock)

---

### Module 5: AI Growth Assistant — 🔧 Needs Enhancement

| Requirement | Status |
|-------------|--------|
| AI Lead Score | ✅ `lib/scoring.js` — LLM + rules |
| AI Opportunity Score | ❌ Dedicated model missing |
| AI Follow-up Suggestions | ❌ |
| AI Marketing Content | ❌ |
| AI Sales Forecast | 🔧 Partial — `lib/revenue/service.js` forecast |

**Reusable:** LLM integration pattern (`EMERGENT_LLM_KEY`), scoring pipeline, enterprise UI components (currently mock)

**Gap:** Consolidate into shared **AI Engine** service; wire enterprise screens to real inference endpoints

---

## 3. RetailEdge360 — MVP Features

| Feature | Classification | Current state |
|---------|----------------|---------------|
| POS Billing | ❌ Missing | No POS UI or transactions |
| Inventory | 🔧 Partial | `products` CRUD only |
| GST Billing | ❌ Missing | Invoices exist for CRM, not retail GST |
| Barcode Scanning | ❌ Missing | |
| Customer Ledger | ❌ Missing | `customers` is B2B CRM, not retail ledger |
| Supplier Management | ❌ Missing | |
| Customer Database | 🔧 Partial | CRM customers ≠ retail shoppers |
| Loyalty Program | ❌ Missing | |
| Store Analytics | 🔧 Partial | `retail-kpis` endpoint + `RetailDashboard` |
| WhatsApp Catalog | ❌ Missing | |
| Mobile App Support | ❌ Missing | |
| Offline Mode | ❌ Missing | |
| Sync Engine | ❌ Missing | |

**RetailEdge360 positioning gap:** Current implementation is a **product catalog demo**, not a retail growth platform. Requires separate domain module (`lib/retail/`) with API-first design, **not** extension of lead CRM collections.

**Subscription tiers (target):** Basic, Growth, Premium, Enterprise — **not defined** in `plan-features.js` (only LeadEdge360-style STARTER/GROWTH/ENTERPRISE for org plan)

---

## 4. Business Suite — Shared Services

| Capability | Classification | Gap |
|------------|----------------|-----|
| Single login | ✅ Complete | JWT auth across products |
| Product entitlements | 🔧 Needs Enhancement | `users.products[]` — not tied to subscription SKUs |
| Subscription management | 🔧 Partial | Dual subscription models; Retail plans missing |
| Product switching | ✅ Complete | API + UI |
| Tenant isolation | 🔧 Needs Enhancement | Core works; hardcoded org bypasses |
| Shared notification engine | 🔧 Partial | In-app only; no push delivery |
| Shared AI engine | ❌ Missing | Scattered LLM calls; no unified service |
| Shared QR engine | ❌ Missing | New build |
| Shared reporting engine | 🔧 Partial | Revenue + campaign reports; no unified layer |

**Coupling rule:** Shared services expose REST APIs; products consume via HTTP — **no cross-product DB joins**.

---

## 5. SaaS & Multi-Tenant Requirements

| Requirement | Status | Gap |
|-------------|--------|-----|
| API-first architecture | 🔧 Partial | Dual API surface; catch-all debt |
| Web support | ✅ Complete | |
| Android / iOS | ❌ Missing | Mobile API exists; no native apps |
| Tablet | 🔧 Partial | Responsive web only |
| Future API integrations | 🔧 Partial | Webhooks exist; no public API docs/keys UI |
| `orgId` on every record | 🔧 Partial | Convention, not enforced |
| `createdBy` / `updatedBy` | ❌ Missing | Inconsistent |
| `auditTrail` on records | 🔧 Partial | Separate `audit_logs` |
| Tenant-scoped queries | 🔧 Partial | Some global analytics routes |
| No cross-tenant access | 🔒 Risk | Hardcoded org IDs; unauthenticated routes |

---

## 6. Mobile First Requirements

### LeadEdge360 Mobile (target)

| Screen | Status |
|--------|--------|
| Dashboard | ♻️ `/api/mobile/home`, `/dashboard` web |
| Leads | ✅ Mobile lead routes |
| Tasks | 🔧 Partial |
| Follow-ups | ✅ Mobile CRUD |
| Opportunities | ❌ No dedicated mobile API |
| Proposals | ❌ |
| Notifications | 🔧 In-app API |
| QR Scanner | ❌ |
| Business card sharing | ❌ |

### RetailEdge360 Mobile (target)

| Screen | Status |
|--------|--------|
| POS | ❌ |
| Inventory | ❌ |
| Customer search | ❌ |
| Barcode scan | ❌ |
| Reports | ❌ |
| Offline mode | ❌ |
| Sync engine | ❌ |

**Gap:** Need **mobile API v2** contract (OpenAPI) before native app build; current `/api/mobile/*` is lead-centric.

---

## 7. Subscription Model

### LeadEdge360 (target)

| Tier | Platform mapping | Feature flags |
|------|------------------|---------------|
| Starter | `STARTER` | Exists in `plan-features.js` |
| Growth | `BUSINESS_GROWTH` | Exists |
| Professional | — | **Missing tier** (between Growth and Enterprise) |
| Enterprise | `ENTERPRISE` | Exists |

### RetailEdge360 (target)

| Tier | Status |
|------|--------|
| Basic / Growth / Premium / Enterprise | ❌ **Not in codebase** |

### Feature flags (directive: no hard-coded plan logic)

| Current | Gap |
|---------|-----|
| `PLAN_FEATURES` map in `lib/billing/plan-features.js` | Good foundation |
| `requirePlan()` on some API guards | Not applied to all routes or UI |
| No `feature_flags` collection or env-based flags | Need centralized `checkFeature(orgId, flag)` |
| UI ignores plan features | Nav shows all modules regardless of plan |

**Action:** Extend `plan-features.js` with new module flags (`business_card`, `qr_engine`, `reviews`, `whatsapp_pro`, `ai_assistant`, retail SKUs) — **config-driven, not inline if/else in pages**.

---

## 8. Security Requirements

| Requirement | Status | Classification |
|-------------|--------|----------------|
| RBAC | 🔧 Partial | API guards exist; UI + inconsistent routes |
| Audit logs | 🔧 Partial | Service exists; inconsistent writes |
| Rate limiting | ❌ Missing | |
| Input validation | 🔧 Partial | Zod on some forms; not all APIs |
| OWASP Top 10 | 🔧 Partial | See `SECURITY_AUDIT_REPORT.md` |
| Secure file upload | ❌ Missing | No upload pipeline for logos/cards |
| Tenant isolation testing | ❌ Missing | No automated tests |
| Dev auth bypass | 🔒 Risk | Disabled in prod — verify deployment |
| Default JWT secret | 🔒 Risk | Must be overridden in production |
| Unauthenticated analytics | 🔒 Risk | Global counts without `orgId` |

---

## 9. Performance Requirements

| Requirement | Status | Classification |
|-------------|--------|----------------|
| Pagination | ✅ Most list APIs | |
| Index optimization | ❌ Missing | ⚡ **Critical** — no Mongo indexes |
| Caching | ❌ Missing | |
| Lazy loading | 🔧 Partial | React code-splitting default |
| API response monitoring | ❌ Missing | Health checks only |

---

## 10. Testing Requirements

| Requirement | Status |
|-------------|--------|
| Unit tests | ❌ |
| API tests | ♻️ Retest scripts only |
| Integration tests | ❌ |
| UAT scenarios | ♻️ Documented per module |
| Regression tests | ♻️ Manual retest scripts |
| Rollback validation | ♻️ DR report exists |

---

## 11. Technical Debt Register

| ID | Item | Impact | Priority |
|----|------|--------|----------|
| TD-01 | Monolithic catch-all API (~2,500 lines) | Auth drift, regression risk | P1 |
| TD-02 | Default mock enterprise UI | Sales demos mislead; prod disconnect | P1 |
| TD-03 | No MongoDB indexes | Scale failure | P0 |
| TD-04 | Hardcoded assignment agents | Wrong assignee in multi-user orgs | P2 |
| TD-05 | Hardcoded org in growth-audit/catalog | Tenant leak | P1 |
| TD-06 | Dual subscription models | Billing confusion | P2 |
| TD-07 | No automated test suite | Regression on every sprint | P1 |
| TD-08 | Portal + partner APIs without UI | Incomplete product surface | P2 |
| TD-09 | HTTP adapter returns mock when mock off | False "real mode" | P1 |
| TD-10 | `pg` dependency unused | Confusion | P3 |

---

## 12. Security & Performance Risk Summary

### P0 (before scale)

- Add MongoDB indexes on `orgId`, `users.email`, `leads.id`, `opportunities.id`
- Close unauthenticated / global analytics routes
- Remove hardcoded `ORG_ID` bypasses

### P1 (before new module launch)

- Centralize feature flags
- Wire enterprise UI off mock adapter
- Rate limiting on auth endpoints
- Tenant isolation integration tests

### P2 (ongoing)

- Split catch-all router incrementally (strangler pattern — **no big-bang rewrite**)
- Portal UI + partner admin UI
- Push notification delivery

---

## 13. Product Strategy Alignment

| Principle | Audit finding | Gap action |
|-----------|---------------|------------|
| LeadEdge360 = primary revenue | CRM core certified | Ship new growth modules on LeadEdge360 first |
| RetailEdge360 independent | Only catalog today | New `lib/retail/` domain; separate plans |
| Never tightly couple products | `users.products[]` decoupling works | Keep shared services as APIs only |
| Acquire paying customers quickly | Payments + subscriptions work | Business card + QR = fast SME value prop |
| API-first | Partial | Every new module: API route → service → UI |
| Mobile-ready | Web responsive only | API contracts before native apps |

### Target verticals readiness

| Vertical | LeadEdge360 | Blockers |
|----------|-------------|----------|
| Real Estate | 🔧 Medium | Geo scanner ♻️; reviews ❌ |
| Healthcare | 🔧 Medium | Compliance ♻️ DPDP; appointments ❌ |
| Education | 🔧 Medium | Campaigns ✅; parent comms ❌ |
| Professional Services | ✅ High | Core CRM ready |
| SMEs | 🔧 Medium | Business card + QR ❌ (high impact) |

| Vertical | RetailEdge360 | Blockers |
|----------|---------------|----------|
| Medical stores | ❌ Low | POS, GST, inventory |
| Kirana / garment / hardware / electronics | ❌ Low | Full retail MVP missing |

---

## 14. Implementation Order (Approved Sequence)

Per directive — **no coding until Phases 1–2 complete**. Proposed sprint plan:

| Step | Deliverable | Type | Depends on |
|------|-------------|------|------------|
| 1 | Platform Audit Report | ✅ Done | — |
| 2 | Gap Analysis Report | ✅ Done | Step 1 |
| 3 | Architecture Review | Doc | Define shared services boundaries |
| 4 | Database Review | Doc + indexes | P0 index migration script |
| 5 | API Review | Doc | Strangler plan for catch-all |
| 6 | Sprint Plan | Doc | Prioritized backlog |
| 7 | Digital Business Card | Build | Steps 3–6 |
| 8 | QR Engine | Build | Step 7 (slug URLs) |
| 9 | Review Management | Build | Campaigns ♻️ |
| 10 | WhatsApp Integration | Build | Messages ♻️ |
| 11 | AI Growth Assistant | Build | Scoring ♻️ |
| 12 | RetailEdge360 Enhancements | Build | Separate retail domain |

### Recommended Sprint 0 (stabilization — no feature work)

1. MongoDB index migration (non-breaking)
2. Fix hardcoded org IDs
3. Add `checkFeature()` to UI nav (hide, not delete, gated items)
4. Set `NEXT_PUBLIC_USE_MOCK_API=false` path validation in staging
5. Document mobile API OpenAPI spec

### Sprint 1–2: Digital Business Card + QR Engine

Highest SME acquisition value; shares slug/QR infrastructure; API-first; mobile-responsive public page.

### Sprint 3–4: Reviews + WhatsApp depth

Reuses campaign + notification patterns.

### Sprint 5: AI Growth Assistant

Wire existing scoring + forecast into unified assistant API; replace mock enterprise panels incrementally.

### Sprint 6+: RetailEdge360

POS + inventory as **new product vertical** — do not block LeadEdge360 revenue path.

---

## 15. Summary Matrix

| Area | Complete | Reusable | Enhance | Missing | Debt/Risk |
|------|----------|----------|---------|---------|-----------|
| CRM core | 6 | 2 | 3 | 0 | 2 |
| New LE modules (5) | 0 | 3 | 1 | 4 | 0 |
| RetailEdge360 MVP | 0 | 1 | 2 | 9 | 0 |
| Business Suite | 3 | 4 | 5 | 2 | 1 |
| Mobile | 0 | 2 | 3 | 8 | 0 |
| Subscriptions | 2 | 1 | 3 | 2 | 1 |
| Security | 1 | 2 | 4 | 3 | 4 |
| Performance | 1 | 0 | 1 | 3 | 1 |
| Testing | 0 | 1 | 0 | 4 | 1 |

---

## 16. Success Criteria Mapping

| Criterion | Current | Gap to close |
|-----------|---------|--------------|
| LeadEdge360 sellable to 5 verticals | Professional services ready | Business card, QR, reviews for SMEs |
| RetailEdge360 sellable to 5 store types | Not sellable | Full retail MVP |
| Preserve production functionality | Certified | Strangler migrations only |
| API-first | Partial | New modules API → UI |
| Feature flags | Partial | Plan-driven flags everywhere |
| Multi-tenant audit fields | Partial | Middleware to inject `createdBy`/`updatedBy` |

---

## 17. Sign-Off

| Phase | Status |
|-------|--------|
| Phase 1 — Platform Audit | ✅ `PLATFORM_AUDIT_REPORT.md` |
| Phase 2 — Gap Analysis | ✅ This document |
| Phase 3 — Architecture Review | ⏳ Pending approval |
| Implementation (Steps 7+) | 🚫 **Blocked until Steps 3–6 approved** |

**No code has been written for new modules.** Existing production paths remain untouched.

---

## 18. Recommended Immediate Actions (User Decision)

1. **Approve** Phase 1–2 reports
2. **Choose** Sprint 0 stabilization (indexes + security fixes) — recommended before feature work
3. **Confirm** LeadEdge360 tier naming: add **Professional** between Growth and Enterprise?
4. **Confirm** RetailEdge360 timeline: parallel track or post-LeadEdge360 modules?
5. **Authorize** Phase 3 Architecture Review document
