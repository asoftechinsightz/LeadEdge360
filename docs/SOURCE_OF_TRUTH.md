# SOURCE OF TRUTH — AsoftechInsightz Business Suite V2

> **This is the single authoritative reference for all V2 frontend work.**  
> If any document, comment, backup file, or inline style conflicts with this file, **this file wins**.

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Established | 2026-06-21 |
| Current Phase | 3 complete → awaiting Phase 3 approval |
| Scope | Frontend modernization only |

---

## 1. How to Use This Document

| Role | Read first | Then use |
|------|------------|----------|
| Designers / UX | §3 Brand, §4 Themes, §5 Layout | `src/design-tokens/tokens.json` |
| Frontend engineers | §2 Constraints, §6 Architecture, §8 Routes, §9 APIs | `src/design-tokens/index.js` |
| Mobile engineers | §9 APIs | `docs/openapi.json` |
| DevOps / deploy | §7 Domains | `docs/nginx.conf` |
| Phase leads | §10 Phases, §11 Module rules | Phase gate checklist (§12) |
| Component authors | [`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md) | `src/design-tokens/tokens.json` |

**Supporting inventories (reference only — not authoritative):**

| Document | Purpose |
|----------|---------|
| [`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md) | **How** to build and organize components (V2 rules) |
| `docs/API_INVENTORY.md` | Detailed endpoint list |
| `docs/ROUTE_INVENTORY.md` | Detailed route map |
| `docs/COMPONENT_INVENTORY.md` | Detailed component list |
| `docs/MOBILE_READINESS_ASSESSMENT.md` | Mobile gap analysis |
| `docs/UI_GAP_ANALYSIS.md` | UI gap analysis |
| `docs/RISK_REGISTER.md` | Risk tracking |
| `docs/FRONTEND_V2_MASTER_PLAN.md` | Phase 1 audit archive |

---

## 2. Non-Negotiable Constraints

These rules apply to **every phase** without exception:

1. **Do not modify** MongoDB collections, database schema, or backend architecture
2. **Do not modify** `app/api/**`, `lib/**`, `models/**`, authentication, multi-tenant logic, Razorpay, lead scoring, or billing logic
3. **Do not change** API contracts or introduce mock data
4. **Use real APIs only** in all V2 screens
5. **Evolution, not revolution** — preserve existing business functionality
6. **Stop after each phase** — commit, screenshots, wait for approval
7. **One source of truth** — brand, routes, and tokens come from this doc + `src/design-tokens/tokens.json`

**Frozen paths (never edit during V2):**

```
lib/
models/
app/api/
n8n/
scripts/migrate-*
```

---

## 3. Brand System (Canonical)

**Reference:** AsoftechInsightz official brochure  
**Machine-readable:** `src/design-tokens/tokens.json` → `brand.colors`

### 3.1 Official Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Navy Blue | `#071B4D` | Suite background, sidebar, primary dark |
| Royal Blue | `#0D47A1` | Primary actions, navigation active state |
| Electric Blue | `#1976D2` | Links, charts, interactive highlights |
| Orange Accent | `#FF7A00` | CTAs, KPI accents, conversion elements |
| White | `#FFFFFF` | Text on dark, card foreground |
| Light Gray | `#F5F7FA` | Marketing page backgrounds |

### 3.2 Legacy Colors — Do Not Extend

These exist in `app/globals.css` and `tailwind.config.js` today. **Phase 2 replaces them** with §3.1 values. Do not add new usages of:

| Legacy | Location | Replace with |
|--------|----------|--------------|
| `#FF8A3D` | `--primary`, `brand.orange` | `#FF7A00` |
| `#22C55E` | `--accent`, `brand.green` | `#1976D2` or `#0D47A1` |
| `#070B14` | `brand.navy` | `#071B4D` |

### 3.3 Typography

| Role | Font | Source |
|------|------|--------|
| Body | Inter | `app/layout.js` (keep) |
| Display / headings | Space Grotesk | `app/layout.js` (keep) |

### 3.4 Brand Personality

Enterprise · Trusted · Professional · AI-Powered · Growth-Focused · Technology-Driven

---

## 4. Theme Rules (Two Surfaces)

### 4.1 Marketing Website (`www`)

- **Style:** Premium, modern, conversion-focused
- **Inspiration:** Salesforce, HubSpot, Datadog, IBM, Dynatrace
- **Palette:** Light Gray backgrounds, Navy text, Orange CTAs, Royal/Electric Blue accents
- **Avoid:** Gaming UI, neon, cartoon illustrations, heavy glassmorphism

### 4.2 Business Suite (`app`)

- **Style:** Enterprise dark theme
- **Inspiration:** Salesforce, ServiceNow, Dynatrace, Monday.com
- **Palette:** Navy background (`#071B4D`), dark surfaces, White text, Orange accents
- **Characteristics:** Executive dashboards, premium tables, clean navigation, professional spacing
- **Avoid:** Gaming UI, neon, cartoon illustrations, excessive glassmorphism, excessive gradients

---

## 5. Layout & Component Standards

### 5.1 Folder Convention (Target — implement per phase)

See **[`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md)** for layer rules, naming, and phase delivery map.

### 5.2 Spacing & Radius

Canonical values: `src/design-tokens/tokens.json` → `spacing`, `radius`

- Page padding: `1.5rem` horizontal, `2rem` vertical
- Section gap: `4rem`
- Card padding: `1.5rem`
- Suite sidebar width: `16rem`
- Suite header height: `4rem`
- Default border radius: `0.85rem`

### 5.3 Required Design System Components (build in Phase 2)

Cards · KPI Widgets · Tables · Data Grids · Forms · Filters · Charts · Drawers · Modals · Notifications · Empty States · Loading States

---

## 6. Architecture Decisions (Canonical)

| Decision | Ruling |
|----------|--------|
| App structure | Single Next.js 14 app — **not** a monorepo |
| Router | App Router only (`app/**/page.js`) |
| UI library | shadcn/ui (New York) on Radix — **keep**, extend via `design-system/` |
| Styling | Tailwind CSS — tokens from `src/design-tokens/` in Phase 2+ |
| Data fetching | Migrate to React Query via `app/providers.js` — **same API URLs** |
| API client | Create `src/api/client.js` — JWT from `localStorage`, no contract changes |
| TypeScript | New V2 components in `.tsx`; shared types in `src/types/` (Phase 9) |
| Auth (frontend) | Keep existing localStorage JWT flow — **do not change auth backend** |
| Route protection | Client-side AppShell guard (Phase 3) — redirect to `/signin` |
| Payments UI | Keep `/api/billing/checkout` + `/api/billing/verify` pattern from `subscribe/page.js` |

---

## 7. Domain & URL Map (Canonical)

See **`docs/DOMAIN_ARCHITECTURE.md`** for full nginx, SSL, and env setup.

| Surface | Domain | App Route |
|---------|--------|-----------|
| **Marketing** | `asoftechinsightz.com` | `/`, `/about`, `/products`, legal pages, … |
| **Business Suite** | `app.asoftechinsightz.com` | `/dashboard`, `/leadedge360`, `/retailedge360`, CRM, billing |
| **Suite API** | `api.asoftechinsightz.com` | `/api/*` (nginx rewrites to Next.js) |
| **Observability360 UI** | `app.observability360.asoftechinsightz.com` | Trinetra360 stack (separate deploy) |
| **Observability360 API** | `api-observability360.asoftechinsightz.com` | Gateway `:4000` |

`www.asoftechinsightz.com` → 301 → `asoftechinsightz.com`

Subdomain routing is **nginx + middleware** (`lib/domains.js`, `docs/nginx.conf`).

---

## 8. Route Map (Canonical)

### 8.1 Marketing Routes

`/ ` · `/about` · `/products` · `/solutions` · `/industries` · `/pricing` · `/blog` · `/contact` · `/growth-audit` · `/download` · `/privacy` · `/terms` · `/partners` · `/services`

### 8.2 Auth & Onboarding

`/signin` · `/splash` · `/product-selection` · `/onboarding`

### 8.3 Business Suite Routes (all share AppShell from Phase 3)

| Route | Product | Phase |
|-------|---------|-------|
| `/dashboard` | Executive Command Center | **5 — not built yet** |
| `/leadedge360` | LeadEdge360 | 6 |
| `/retailedge360` | RetailEdge360 | 7 |
| `/proposals` | LeadEdge360 ops | 6 |
| `/invoices` | Billing | 8 |
| `/revenue` | LeadEdge360 ops | 6 |
| `/payments` | Billing | **3 — placeholder; full UI Phase 8** |
| `/onboarding` | Suite onboarding | 3 |

### 8.4 Billing Routes

`/subscribe` (Razorpay checkout) · `/pricing` (plan display)

### 8.5 Post-Login Routing (unchanged)

```
/signin → /splash → (product logic) → /leadedge360 | /retailedge360 | /product-selection
/subscribe (success) → /onboarding
```

---

## 9. API Authority (Canonical)

| Concern | Authority | Rule |
|---------|-----------|------|
| API contracts | `docs/openapi.json` | Do not change |
| Endpoint inventory | `docs/API_INVENTORY.md` | Reference only |
| Postman / testing | `docs/postman-collection.json` | Reference only |
| Mobile integration | `docs/MOBILE_API_GUIDE.md` | Reference only |
| Billing features (backend) | `lib/billing/plan-features.js` | **Do not modify** |
| Frontend plan display | Read from `/api/pricing/plans` or `/api/billing/plans` | Do not duplicate hardcoded plans in new UI |

### 9.1 Known API Facts (work around — do not fix in backend)

| Issue | Frontend workaround |
|-------|---------------------|
| `/api/products` serves both mobile product list and retail inventory | Always send `Authorization: Bearer` on retail calls |
| Dual payment paths (`/api/billing/*` vs `/api/payments/*`) | Billing UI uses `/api/billing/*` (match `subscribe/page.js`) |
| Demo tenant fallback without JWT | AppShell must require token before rendering suite data |

### 9.2 Product → Primary APIs

| Product | APIs for V2 UI |
|---------|----------------|
| Dashboard | `/api/dashboard/kpis`, `/api/dashboard/revenue`, `/api/dashboard/sales-performance`, `/api/dashboard/followups-due` |
| LeadEdge360 | `/api/leads/*`, `/api/kpis`, `/api/agents`, `/api/followups/*`, `/api/opportunities/*`, `/api/lead-scoring/*` |
| RetailEdge360 | `/api/products`, `/api/retail-kpis`, `/api/catalog` |
| Billing | `/api/billing/*`, `/api/invoices`, `/api/revenue/dashboard`, `/api/users/subscription` |

---

## 10. Phase Sequence (Canonical)

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1** | Audit + source of truth | **Complete** |
| **2** | Enterprise Design System | **Complete** |
| **3** | Business Suite AppShell | **Complete** |
| **4** | Marketing Website Redesign | **Complete** |
| **5** | Dashboard V2 | **Complete** |
| **6** | LeadEdge360 V2 | **Complete** |
| **7** | RetailEdge360 V2 | **Complete** |
| **8** | Billing Center V2 | **Complete** |
| **9** | Mobile Readiness Hardening | **Complete** |
| **10** | Enterprise QA & Production Readiness | **Complete — awaiting approval** |

**Every phase:** real APIs · screenshots · git commit · stop for approval.

---

## 11. Module Classification (Canonical)

| Class | Rule |
|-------|------|
| **KEEP** | Backend (`lib/`, `models/`, `app/api/`), shadcn `components/ui/`, working business flows, n8n, OpenAPI |
| **REFINE** | Existing pages and shells — visual/UX only, same APIs |
| **REFACTOR** | Page monoliths → component folders; mount providers; add route groups — **no behavior change** |
| **REMOVE** | `solutions-backup-*` route, `.bak` files, unused orphan components — **Phase 10 cleanup only** |

---

## 12. Phase Gate Checklist

Before marking any phase complete:

- [ ] Changes align with §2 Constraints
- [ ] Colors/spacing from `src/design-tokens/tokens.json` only (Phase 2+)
- [ ] No edits to frozen paths
- [ ] Real APIs wired (no mocks)
- [ ] Screenshots captured
- [ ] Git commit created
- [ ] Stopped — awaiting approval

---

## 13. Conflict Resolution

When sources disagree, precedence is:

```
1. docs/SOURCE_OF_TRUTH.md          ← this file
2. docs/COMPONENT_GOVERNANCE.md     ← component structure & rules
3. src/design-tokens/tokens.json    ← design implementation
4. docs/openapi.json                ← API contracts
5. lib/billing/plan-features.js     ← billing feature flags (backend)
6. Phase 1 inventory docs           ← reference detail only
7. app/globals.css / tailwind.config.js  ← LEGACY until Phase 2 migrates
8. .bak files / backup folders      ← IGNORE
```

**Deprecated duplicates (do not use for new work):**

| File | Use instead |
|------|-------------|
| `src/config/planFeatures.js` | `/api/pricing/plans` or `lib/billing/plan-features.js` (read-only) |
| Inline hex in pages (`#020617`, `#FF8A3D`) | `src/design-tokens/index.js` |
| `tailwind.config.js` → `brand.*` | `tokens.json` → `brand.colors` (Phase 2) |

---

## 14. Approval

| Milestone | Status |
|-----------|--------|
| Phase 1 audit | Complete |
| Source of truth established | **Complete** |
| Phase 2 authorized | **Complete** |
| Phase 3 authorized | **Complete — auth routing verified; awaiting approval** |

**Next action:** Review Phase 3 deliverables (`docs/PHASE3_APPSHELL.md`, `docs/PHASE3_AUTH_VERIFICATION.md`). Approve Phase 4 (Marketing Website Redesign) to proceed.
