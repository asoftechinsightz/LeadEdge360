# AsoftechInsightz — Sprint Plan (Phase 6)

**Date:** 3 July 2026  
**Status:** In progress — Sprints 0–2 complete; S3–S6 partial  
**Planning horizon:** 12 weeks (6 two-week sprints)  
**Team assumption:** 1–2 full-stack engineers + QA

---

## Approval Chain (complete)

| Step | Deliverable | Status |
|------|-------------|--------|
| 1 | Platform Audit | ✅ `PLATFORM_AUDIT_REPORT.md` |
| 2 | Gap Analysis | ✅ `GAP_ANALYSIS_REPORT.md` |
| 3 | Architecture Review | ✅ `ARCHITECTURE_REVIEW.md` |
| 4 | Database Review | ✅ `DATABASE_REVIEW.md` |
| 5 | API Review | ✅ `API_REVIEW.md` |
| 6 | Sprint Plan | ✅ This document |

**Implementation (Steps 7–12): in progress.**

---

## Implementation Status (as of 3 Jul 2026)

| Sprint | Status | Progress | Notes |
|--------|--------|----------|-------|
| **S0** Stabilization | ✅ Complete | ~95% | Indexes, tenant scripts, OpenAPI skeleton, `hasFeatureForOrg`, feature flags |
| **S1** Business Card | ✅ Complete | ~90% | CRUD, publish, public card API + UI; UAT/docs pending |
| **S2** QR Engine | ✅ Complete | ~85% | Generate, track, analytics, public redirect, growth UI |
| **S3** Reviews | 🟡 In progress | ~50% | `lib/growth/reviews/service.js` + page; campaigns/API retest TBD |
| **S4** WhatsApp + AI v1 | 🟡 In progress | ~35% | AI service scaffold, WhatsApp helpers; conversations wiring partial |
| **S5** Suite polish | 🟡 In progress | ~40% | `useFeatureFlag`, portal UI scaffold; mock removal incremental |
| **S6** Retail foundation | 🟡 In progress | ~45% | Inventory, sales, payments services; full POS deferred |

**Sibling product (separate repo):** **Observability360** — `Observability360` — Phases 1–4 complete; **not merged** into this Business Suite. Marketing link only; execution in `Observability360/SPRINT_PLAN.md`. Audit: `docs/observability360/`.

---

## Sprint Overview

| Sprint | Weeks | Theme | Ship goal | Status |
|--------|-------|-------|-----------|--------|
| **S0** | 1 | Stabilization | Indexes, security, tenant fixes — zero feature change | ✅ Done |
| **S1** | 2–3 | Business Card | Public card page + editor + API | ✅ Done |
| **S2** | 4–5 | QR Engine | QR generate, track, mobile scan | ✅ Done |
| **S3** | 6–7 | Reviews | Campaigns, requests, dashboard | 🟡 In progress |
| **S4** | 8–9 | WhatsApp + AI v1 | Conversations real + AI suggest/score | 🟡 In progress |
| **S5** | 10–11 | Suite polish | Feature flags in UI, portal UI, mock removal | 🟡 In progress |
| **S6** | 12+ | Retail MVP kickoff | POS schema + inventory API (foundation) | 🟡 In progress |

---

## Sprint 0 — Stabilization (Week 1) ✅

**Goal:** Harden platform without breaking certified modules.  
**Exit criteria:** `go-live-retest.mjs` 44/44 PASS; indexes applied; tenant script PASS.

### Tasks

| ID | Task | Status | Files |
|----|------|--------|-------|
| S0-01 | Create `scripts/mongo-indexes.mjs` | ✅ | `scripts/mongo-indexes.mjs` |
| S0-02 | Run indexes on dev/staging | 🟡 | Run on target env |
| S0-03 | Fix hardcoded `ORG_ID` in growth-audit, catalog | 🟡 | Partial — verify per route |
| S0-04 | Tenant-scope analytics routes | ✅ | `app/api/analytics/*` uses `guardCrmRequest` |
| S0-05 | Auth guard on outreach routes | 🟡 | Verify coverage |
| S0-06 | Rate limit `/api/auth/*` | 🟡 | `middleware.js` |
| S0-07 | Fix `httpClient.ts` mock leak when mock off | 🟡 | Adapters |
| S0-08 | Align `DB_NAME` in `.env.example` | ✅ | `.env.example` |
| S0-09 | `scripts/tenant-isolation-check.mjs` | ✅ | `scripts/tenant-isolation-check.mjs` |
| S0-10 | OpenAPI skeleton `docs/openapi.yaml` | ✅ | `docs/openapi.yaml` |
| S0-11 | Extend `plan-features.js` with new flags | ✅ | `lib/billing/` |
| S0-12 | `hasFeatureForOrg()` helper | ✅ | `lib/billing/check-feature.js` |
| S0-13 | Re-run go-live retest | 🟡 | Re-run before S5 merge |
| S0-14 | Update `PRODUCTION_READINESS_CHECKLIST.md` | 🟡 | docs |

### Sprint 0 — Do NOT

- Modify certified service business logic
- Remove catch-all routes
- Change UI layouts
- Deploy breaking API changes

---

## Sprint 1 — Digital Business Card (Weeks 2–3) ✅

**Goal:** SME can create, publish, and share a public business card.  
**Exit criteria:** Public URL live; mobile responsive; feature-flag gated; audit on mutations.  
**Status:** Shipped — `lib/growth/business-card/`, API routes, `app/growth/business-card/`, public slug flow.

### Backend

| ID | Task | Est. |
|----|------|------|
| S1-01 | `lib/growth/business-card/service.js` — CRUD, publish, slug | 8h |
| S1-02 | `lib/growth/api-helpers.js` — guard + feature check | 3h |
| S1-03 | `app/api/growth/business-card/route.js` | 4h |
| S1-04 | `app/api/growth/business-card/[id]/route.js` | 4h |
| S1-05 | `app/api/growth/business-card/[id]/publish/route.js` | 3h |
| S1-06 | `app/api/public/card/[slug]/route.js` | 4h |
| S1-07 | `lib/media/upload.js` + `app/api/media/upload/route.js` | 6h |
| S1-08 | Seed `business_cards` indexes | 1h |
| S1-09 | API tests in `scripts/business-card-retest.mjs` | 6h |

### Frontend

| ID | Task | Est. |
|----|------|------|
| S1-10 | `components/growth/BusinessCardEditor.tsx` | 12h |
| S1-11 | `app/growth/business-card/page.js` (suite page) | 4h |
| S1-12 | `app/c/[slug]/page.js` — public SSR card | 8h |
| S1-13 | Nav item in `nav-config.ts` (feature-flag hidden) | 2h |
| S1-14 | Link from onboarding branding | 3h |

### QA / Docs

| ID | Task | Est. |
|----|------|------|
| S1-15 | UAT: create → publish → share → view on mobile | 4h |
| S1-16 | `BUSINESS_CARD_TEST_REPORT.md` | 2h |

**Sprint 1 total:** ~74h

---

## Sprint 2 — QR Engine (Weeks 4–5) ✅

**Goal:** Generate QR for card, WhatsApp, reviews; track scans and conversions.  
**Depends on:** Sprint 1 (business card slugs)  
**Status:** Shipped — `lib/qr/`, `app/api/qr/`, `app/growth/qr/`, analytics + public redirect.

### Backend

| ID | Task | Est. |
|----|------|------|
| S2-01 | `lib/qr/service.js` — generate, types, PNG/SVG payload | 8h |
| S2-02 | `lib/qr/track.js` — events, stats aggregation | 6h |
| S2-03 | `app/api/qr/route.js`, `[id]/route.js`, `[id]/analytics/route.js` | 8h |
| S2-04 | `app/api/public/qr/[code]/route.js` — redirect + track | 4h |
| S2-05 | `app/q/[code]/route.js` or page redirect handler | 3h |
| S2-06 | `app/api/mobile/qr/scan/route.js` | 4h |
| S2-07 | `scripts/qr-retest.mjs` | 6h |

### Frontend

| ID | Task | Est. |
|----|------|------|
| S2-08 | `components/growth/QrManager.tsx` — create, download, analytics | 12h |
| S2-09 | `app/growth/qr/page.js` | 3h |
| S2-10 | QR widget on business card editor | 4h |
| S2-11 | Nav item + feature flag | 2h |

**Sprint 2 total:** ~60h

---

## Sprint 3 — Review & Reputation (Weeks 6–7) 🟡

**Goal:** Send review requests, dashboard, response templates, negative alerts.  
**Reuses:** Campaign execution pattern, email templates  
**Status:** Service + UI scaffolded; full campaigns, retest, negative alerts pending.

### Backend

| ID | Task | Est. |
|----|------|------|
| S3-01 | `lib/reviews/service.js` — campaigns, requests | 10h |
| S3-02 | `lib/reviews/analytics.js` | 6h |
| S3-03 | `lib/reviews/templates.js` | 4h |
| S3-04 | API routes under `app/api/reviews/` | 10h |
| S3-05 | Negative review alert → notifications | 4h |
| S3-06 | `scripts/reviews-retest.mjs` | 6h |

### Frontend

| ID | Task | Est. |
|----|------|------|
| S3-07 | `components/growth/ReviewDashboard.tsx` | 12h |
| S3-08 | `app/growth/reviews/page.js` | 4h |
| S3-09 | Review QR type in QR manager | 3h |

**Sprint 3 total:** ~59h

---

## Sprint 4 — WhatsApp + AI Growth Assistant v1 (Weeks 8–9) 🟡

**Goal:** Real conversations API; AI follow-up suggestions and opportunity scoring.  
**Status:** `lib/ai/service.js`, WhatsApp API helpers in place; full conversation wiring + retest pending.

### WhatsApp

| ID | Task | Est. |
|----|------|------|
| S4-01 | `lib/whatsapp/service.js` — consolidate send/receive | 8h |
| S4-02 | `lib/whatsapp/auto-rules.js` | 6h |
| S4-03 | Enhance webhook → lead capture | 6h |
| S4-04 | Wire `/leadedge360/conversations` to real API | 8h |
| S4-05 | Click-to-chat from public business card | 3h |

### AI

| ID | Task | Est. |
|----|------|------|
| S4-06 | `lib/ai/client.js` — unified LLM wrapper | 6h |
| S4-07 | Migrate `lib/scoring.js` → `lib/ai/lead-score.js` | 4h |
| S4-08 | `lib/ai/opportunity-score.js`, `followup-suggest.js` | 10h |
| S4-09 | API routes under `app/api/ai/` | 8h |
| S4-10 | AI insights panel in lead detail (suggest follow-up) | 8h |
| S4-11 | `scripts/ai-retest.mjs` | 6h |

**Sprint 4 total:** ~73h

---

## Sprint 5 — Suite Polish (Weeks 10–11) 🟡

**Goal:** Feature flags in UI; reduce mock dependency; portal admin surfaces.  
**Status:** `useFeatureFlag` hook, `app/portal/` scaffold; enterprise dashboard wiring ongoing.

| ID | Task | Est. |
|----|------|------|
| S5-01 | `useFeatureFlag()` hook + nav gating | 8h |
| S5-02 | Set staging `NEXT_PUBLIC_USE_MOCK_API=false` | 2h |
| S5-03 | Wire enterprise dashboards to real APIs (incremental) | 16h |
| S5-04 | Customer portal UI `app/portal/` (login, invoices, tickets) | 20h |
| S5-05 | Partner admin UI `app/partners/dashboard/` | 16h |
| S5-06 | Assignment agents from `users` collection | 8h |
| S5-07 | Task PATCH/complete endpoints | 6h |
| S5-08 | Full regression retest all modules | 8h |

**Sprint 5 total:** ~84h

---

## Sprint 6 — RetailEdge360 Foundation (Week 12+) 🟡

**Goal:** API-first retail domain scaffold — not full POS yet.  
**Parallel track** — does not block LeadEdge360 growth modules.  
**Status:** `lib/retail/inventory`, `sales`, `payments` services; POS UI foundation partial.

| ID | Task | Est. |
|----|------|------|
| S6-01 | `lib/retail/` domain scaffold | 8h |
| S6-02 | `retail_stores`, `retail_inventory` collections + indexes | 6h |
| S6-03 | `app/api/retail/inventory/route.js` | 8h |
| S6-04 | `app/api/retail/products/route.js` (migrate from catch-all) | 8h |
| S6-05 | Retail plan tiers in `plan-features.js` | 4h |
| S6-06 | Enhanced `RetailDashboard` wired to retail API | 12h |
| S6-07 | Retail architecture doc update | 4h |

**Sprint 6 total:** ~50h (foundation only; full POS is post–Sprint 6)

---

## Testing Strategy (all sprints)

| Layer | Tool | When |
|-------|------|------|
| API regression | `scripts/*-retest.mjs` | End of every sprint |
| Go-live suite | `scripts/go-live-retest.mjs` | S0, S5 |
| Tenant isolation | `scripts/tenant-isolation-check.mjs` | S0, each new module |
| Manual UAT | Checklist per module | S1–S4 |
| Build | `npm run build` | Every PR |

**Unit tests (Jest/Vitest):** Introduce in Sprint 1 for `lib/growth/` — target 60% coverage on new services by Sprint 4.

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| Catch-all regression | Dedicated routes only for new modules; retest every sprint |
| Mongo index build on prod | `background: true`; staging first |
| WhatsApp API approval delays | Ship with click-to-chat + webhook stub; Meta approval parallel |
| LLM cost/latency | Cache layer `ai_inference_cache`; rules fallback |
| Scope creep on Retail | S6 foundation only; POS deferred |
| Production CSS/static assets | Docker copy `.next/static` — documented in styling fix |

---

## Definition of Done (per sprint)

- [ ] `npm run build` PASS
- [ ] Module retest script PASS
- [ ] Go-live retest PASS (S0, S5 mandatory)
- [ ] Tenant isolation check PASS (new modules)
- [ ] Feature behind plan flag
- [ ] `writeAuditLog` on mutations
- [ ] Mobile-responsive UI (new pages)
- [ ] API documented in `docs/openapi.yaml`
- [ ] Test report markdown committed

---

## Immediate Next Actions

1. **S3** — Complete review campaigns API, `scripts/reviews-retest.mjs`, negative alerts
2. **S4** — Wire conversations to real WhatsApp API; ship AI suggest/score endpoints
3. **S0/S5** — Re-run `go-live-retest.mjs` (44/44) before GA polish merge
4. **Trinetra360** — Server deployment (SaaS/Hybrid/On-prem); see `Observability360/docs/PROJECT_STATUS.md`

**Current focus:** Sprint 3 (Reviews) completion, then Sprint 4 AI/WhatsApp.

---

## Document Index

| Document | Purpose |
|----------|---------|
| `PLATFORM_AUDIT_REPORT.md` | As-is state |
| `GAP_ANALYSIS_REPORT.md` | To-be gaps |
| `ARCHITECTURE_REVIEW.md` | How to build |
| `DATABASE_REVIEW.md` | Schema + indexes |
| `API_REVIEW.md` | Endpoints + standards |
| `SPRINT_PLAN.md` | When to build (this file) |
| `Observability360/docs/PROJECT_STATUS.md` | Trinetra360 platform status |

---

## Sign-Off

| Role | Approval |
|------|----------|
| Product (CPD) | ✅ Approved |
| Architecture | ✅ Approved |
| Engineering | ✅ S0–S2 delivered; S3–S6 in progress |
| QA | 🟡 Retest gates — run at S3/S5 milestones |

**Status: IN PROGRESS — Sprints 0–2 complete; S3 (Reviews) is current priority.**
