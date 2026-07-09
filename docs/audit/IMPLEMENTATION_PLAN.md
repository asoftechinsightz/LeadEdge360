# Business Suite — Implementation Plan (Post-Audit)

**Date:** 22 June 2026  
**Based on:** [BUSINESS_SUITE_AUDIT_INDEX.md](./BUSINESS_SUITE_AUDIT_INDEX.md)  
**Status:** Approved for execution — follows completed S0 + S1  
**Rule:** Do not break certified modules (CRM, revenue, payments, portal API, partners)

---

## 1. Current position

| Sprint | Status | Evidence |
|--------|--------|----------|
| S0 Stabilization | ✅ Done | `SPRINT_0_REPORT.md`, indexes, tenant fixes |
| S1 Business Card | ✅ Done | API, editor, `/c/[slug]`, bootstrap scripts |
| S2 QR Engine | ✅ Done | `SPRINT_2_REPORT.md` — VPS sign-off pending |
| S3 Reviews | ✅ Done | `SPRINT_3_REPORT.md` — VPS deploy deferred |
| S4–S6 | 🔲 Pending | See gaps in [UI_GAP_REPORT.md](./UI_GAP_REPORT.md) |

**Audit headline:** CRM/revenue core is go-live capable. Growth modules S2+, AI Workspace (mock), Portal/Partner UI, and Retail MVP remain.

---

## 2. Implementation principles

1. **Backend before UI** for new modules (QR, Reviews, AI APIs).
2. **Feature flags in API first**, then `useFeatureFlag()` in nav (S5).
3. **Retest after each sprint** — `go-live-retest.mjs` must stay 44/44 PASS.
4. **No certified module regressions** — proposals, revenue, payments unchanged unless bugfix.
5. **VPS staging** before production go-live (develop on `187.127.179.138`, deploy `main` to prod URL).

---

## 3. Phase map (12 weeks)

```
Week 1        [DONE] S0 — Stabilization
Week 2–3      [DONE] S1 — Business Card
Week 4–5      [DONE] S2 — QR Engine
Week 6–7      [DONE] S3 — Reviews
Week 8–9      [NEXT] S4 — WhatsApp + AI v1
Week 10–11         S5 — Suite polish + Portal UI
Week 12+           S6 — Retail foundation
```

**Parallel track (any sprint):** Permission/RBAC alignment (low risk, doc-driven).

---

## 4. Sprint 2 — QR Engine (DONE)

**Goal:** Generate QR codes linked to business cards; track scans.  
**Depends on:** S1 business card slugs ✅  
**Report:** `SPRINT_2_REPORT.md`

### Backend tasks

| ID | Task | Files | Est. |
|----|------|-------|------|
| S2-01 | `lib/qr/service.js` — CRUD, code generation, stats | new | 8h |
| S2-02 | `lib/growth/api-helpers.js` — reuse + `qr_engine` feature | existing | 1h |
| S2-03 | `app/api/qr/route.js` — list, create | new | 4h |
| S2-04 | `app/api/qr/[id]/route.js` — get, update, delete | new | 4h |
| S2-05 | `app/api/public/q/[code]/route.js` — redirect + track | new | 4h |
| S2-06 | `qr_codes`, `qr_events` indexes in `mongo-indexes.mjs` | script | 1h |
| S2-07 | `scripts/qr-retest.mjs` | new | 4h |

### Frontend tasks

| ID | Task | Files | Est. |
|----|------|-------|------|
| S2-08 | `components/growth/QrManager.tsx` | new | 8h |
| S2-09 | `app/growth/qr/page.js` | new | 3h |
| S2-10 | QR widget on `BusinessCardEditor.tsx` | modify | 4h |
| S2-11 | `app/q/[code]/page.js` — redirect handler | new | 3h |
| S2-12 | Nav item under Marketing (feature-gated API only until S5) | `nav-config.ts` | 1h |

### Exit criteria

- [x] Create QR from business card editor
- [x] Scan `/q/{code}` → redirects to `/c/{slug}` or WhatsApp
- [x] Scan count increments in dashboard
- [x] `npm run build` PASS
- [ ] `qr-retest.mjs` PASS (requires dev server + Mongo on VPS)
- [ ] `go-live-retest.mjs` 44/44 PASS

---

## 5. Sprint 3 — Reviews (DONE)

**Goal:** Send review requests; collect ratings; dashboard.  
**Report:** `SPRINT_3_REPORT.md`

### Exit criteria

- [x] Create campaign → send request → record rating
- [x] Feature flag `reviews` enforced on API
- [x] `npm run build` PASS (local)
- [ ] VPS batch deploy S2+S3 + `reviews-retest` (deferred)
- [ ] `go-live-retest.mjs` 44/44 PASS on VPS

---

## 6. Sprint 4 — WhatsApp + AI v1 (DONE)

**Goal:** Real conversations UI; AI scoring/suggestions on leads.  
**Report:** `SPRINT_4_REPORT.md`

### Exit criteria

- [x] Conversations loads real threads (or empty state, not mock)
- [x] AI suggest returns text on lead detail
- [x] `leadEdgeApi` httpClient paths verified with mock off
- [x] Public card WhatsApp click tracking
- [x] `npm run build` PASS (local)
- [ ] VPS batch deploy S2+S3+S4 + `sprint4-retest` (deferred)

---

## 7. Sprint 5 — Suite polish (DONE)

**Goal:** Feature flags in UI; Portal UI; RBAC visibility; remove demo confusion.  
**Report:** `SPRINT_5_REPORT.md`

### Exit criteria

- [x] Nav hides Business Card / QR / Reviews when plan lacks feature
- [x] Portal customer can log in and view invoices
- [x] Partner role sees partner dashboard only (route guard)
- [x] Finance role blocked from leads UI (nav + redirect)
- [x] `npm run build` PASS (local)
- [ ] VPS batch deploy (deferred)

---

## 8. Sprint 6 — Retail foundation (DONE)

**Goal:** Inventory API + enhanced dashboard (not full POS).  
**Report:** `SPRINT_6_REPORT.md`

### Exit criteria

- [x] `lib/retail/inventory/service.js`
- [x] `app/api/retail/inventory/route.js` + related routes
- [x] `RetailDashboard.js` wired to `/api/retail/*`
- [x] Product schema alignment (`retail_stores`, `retail_products`, `retail_inventory`)
- [x] `scripts/retail-retest.mjs`
- [x] `npm run build` PASS (local)
- [ ] VPS batch deploy (deferred)

---

## 9. Cross-cutting fixes (insert between sprints)

| Priority | Item | Source audit | Effort |
|----------|------|--------------|--------|
| P0 | VPS Mongo bootstrap on `asoftech_saas` | Ops | 2h |
| P0 | Staging env on VPS (`DEV_AUTH_BYPASS=false` on prod) | Ops | 4h |
| P1 | Unify RBAC permission strings | PERMISSION_MATRIX | 8h |
| P1 | Server-side auth middleware for suite routes (optional) | ROUTE_INVENTORY | 12h |
| P2 | Remove `business-suite/` legacy duplicates | COMPONENT_INVENTORY | 2h |
| P2 | Consolidate `ui/` → `design-system/` gradually | COMPONENT_INVENTORY | ongoing |

---

## 10. VPS development workflow

| Step | Action |
|------|--------|
| 1 | Cursor Remote SSH → `root@187.127.179.138` |
| 2 | Open `/opt/asoftech` |
| 3 | `git pull` + `npm install` (if needed) |
| 4 | `npm run deploy:s2` (or `deploy:s0` / `deploy:s1` per sprint) |
| 5 | `npm run dev -- --hostname 0.0.0.0 --port 3007` (staging) |
| 6 | Sign off in `docs/ops/SPRINT_DATABASE_CHANGELOG.md` |
| 7 | `git push main` → GitHub Actions deploy production |
| 8 | Smoke: `curl https://app.asoftechinsightz.com/api/` |

**Runbook:** [docs/ops/VPS_SPRINT_RUNBOOK.md](../ops/VPS_SPRINT_RUNBOOK.md)  
**DB changelog:** [docs/ops/SPRINT_DATABASE_CHANGELOG.md](../ops/SPRINT_DATABASE_CHANGELOG.md)

**Database:** `MONGO_URL=mongodb://asofadmin:***@mongo:27017/?authSource=admin`, `DB_NAME=asoftech_saas`

---

## 11. Test matrix per sprint

| Sprint | Automated script | Manual UAT |
|--------|------------------|------------|
| S2 | `scripts/qr-retest.mjs` | Scan QR on mobile |
| S3 | `scripts/reviews-retest.mjs` | Send test review link |
| S4 | `scripts/sprint4-retest.mjs` | WhatsApp thread + AI suggest |
| S5 | `scripts/sprint5-retest.mjs` | Portal login + roles API |
| S6 | `scripts/retail-retest.mjs` | Add SKU, KPIs |

**Always run:** `npm run build`, `node scripts/go-live-retest.mjs`

---

## 12. Go-live readiness gates

| Gate | Requirement |
|------|-------------|
| G1 | `go-live-retest.mjs` 44/44 PASS |
| G2 | `DEV_AUTH_BYPASS=false` on production |
| G3 | `REQUIRE_AUTH=true` on production |
| G4 | Mongo indexes applied (`npm run db:bootstrap` or indexes script) |
| G5 | No mock enterprise data on production (`NEXT_PUBLIC_USE_MOCK_API=false`) |
| G6 | `PRODUCTION_READINESS_CHECKLIST.md` signed off |
| G7 | Razorpay live keys (if accepting payments) |

**Safe to go-live today (CRM only):** Dashboard, leads, opportunities, proposals, invoices, revenue, campaigns, analytics, payments, business card (with Mongo + plan).

**Not ready for customer-facing promise:** AI Workspace (demo), Retail MVP, Portal UI, Partners UI.

**VPS deploy pending (batch):** S2 QR + S3 Reviews — see `docs/ops/VPS_SPRINT_RUNBOOK.md`.

---

## 13. Recommended execution order

```
1. S2 QR Engine          [DONE]
2. S3 Reviews            [DONE]
3. S4 WhatsApp + AI      [DONE]
4. S5 Suite polish       [DONE]
5. S6 Retail foundation  ← START HERE
7. Cross-cutting RBAC    ← parallel anytime after S5-02
```

---

## 14. Approval checkpoint

Before coding each sprint:

1. Review sprint section in this plan
2. Confirm no overlap with certified module changes
3. Run baseline `go-live-retest.mjs`
4. Implement sprint
5. Run sprint retest + build
6. Update sprint report markdown

**Next action:** Batch **VPS deploy** (`deploy:s2` through `deploy:s6`) or cross-cutting RBAC polish.

---

*Derived from audit docs in `docs/audit/`. Aligns with `SPRINT_PLAN.md`.*
