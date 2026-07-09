# UI Gap Analysis — AsoftechInsightz Business Suite V2

> **Reference analysis only.** Canonical brand, themes, and gaps to close: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §3–§5 · `src/design-tokens/tokens.json`

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Reference:** Master Directive brand system, design requirements, and product structure

---

## 1. Executive Summary

The current UI is **functional but not enterprise-grade**. A comprehensive shadcn/ui primitive library exists, but only ~30% is used. Product dashboards are monolithic page files. The Business Suite lacks a unified AppShell. Brand colors deviate from the official brochure palette. Several master directive screens and modules have backend APIs but no frontend UI.

**Overall UI maturity:** ~35% of enterprise target

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| Design system | Primitives only | Full themed component library | Large |
| Brand alignment | Orange/green dark theme | Navy/Royal/Electric blue + orange | Medium |
| Business Suite shell | 2-file header | Full AppShell with sidebar | Large |
| Executive dashboard | None | Command center with KPIs | Large |
| LeadEdge360 | Basic leads table | Full CRM modules | Large |
| RetailEdge360 | Basic inventory | Full retail suite | Medium |
| Billing Center | Scattered pages | Unified billing hub | Medium |
| Marketing site | GIX homepage | Premium conversion-focused | Medium |
| Mobile responsive | Partial | Mobile-ready all screens | Medium |

---

## 2. Brand System Gaps

### 2.1 Color Palette

| Token | Official (Brochure) | Current Implementation | Gap |
|-------|--------------------|-----------------------|-----|
| Navy Blue | `#071B4D` | `#070B14` (brand.navy) | Slight deviation |
| Royal Blue | `#0D47A1` | Not defined | **Missing** |
| Electric Blue | `#1976D2` | Not defined | **Missing** |
| Orange Accent | `#FF7A00` | `#FF8A3D` (primary CSS var) | Deviation |
| White | `#FFFFFF` | Used | OK |
| Light Gray | `#F5F7FA` | Not used (dark-only theme) | Missing light mode |
| Accent | Orange (brand) | Green `#22C55E` (CSS `--accent`) | **Wrong accent color** |

### 2.2 Typography

| Requirement | Current | Gap |
|-------------|---------|-----|
| Consistent enterprise typography | Inter + Space Grotesk | OK foundation |
| Typography scale documentation | None | Missing |
| Heading hierarchy standards | Ad-hoc per page | Needs system |

### 2.3 Visual Style

| Requirement | Current | Gap |
|-------------|---------|-----|
| Enterprise dark theme | Dark forced globally | OK direction |
| Salesforce/ServiceNow aesthetic | Gaming-adjacent glow effects (`.glow-orange`, `.glass`) | **Too decorative** |
| Minimal gradients | Radial gradients on body background | Reduce in V2 |
| No glassmorphism excess | `.glass` utility exists | Moderate use |
| Professional spacing | Inconsistent across pages | Needs layout standards |
| Blue + Orange branding | Orange-primary, green-accent | **Misaligned** |

---

## 3. Design System Component Gaps

| Required Component | Current State | Priority |
|--------------------|---------------|----------|
| **Cards** | shadcn Card used ad-hoc | P2 — standardize variants |
| **KPI Widgets** | Inline `KpiCard` in pages only | P2 — shared component with trend/sparkline |
| **Tables** | Basic shadcn Table | P2 — add sorting indicators |
| **Data Grids** | Not implemented | P2 — wire @tanstack/react-table |
| **Forms** | Raw inputs; `form.jsx` unused | P2 — validated form patterns |
| **Filters** | Ad-hoc selects on LeadEdge360 | P2 — reusable FilterBar |
| **Charts** | Recharts direct; `chart.jsx` unused | P2 — themed chart wrapper |
| **Drawers** | Installed, unused | P3 — lead/product detail panels |
| **Modals** | Dialog used | P2 — standardize sizes/variants |
| **Notifications** | Sonner toasts only | P3 — notification center |
| **Empty States** | None — blank tables when empty | P2 |
| **Loading States** | `"Loading..."` text | P2 — Skeleton components |
| **Error States** | None — failed fetches silent or console | P2 — retry UI |
| **Breadcrumbs** | Installed, unused | P3 |
| **Sidebar** | 630-line component installed, unused | P3 |
| **Command palette / Search** | Installed, unused | P3 |
| **Date pickers** | Calendar unused | P6 |
| **File upload** | Not implemented | Future |
| **Pagination** | Not used in tables | P2 |

---

## 4. Marketing Website Gaps

### 4.1 Page Coverage

| Required Page | Route | Status | Gap |
|---------------|-------|--------|-----|
| Home | `/` | Exists (GIX) | Visual refresh needed |
| About | `/about` | Exists | Rebrand |
| Products | `/products` | Exists | Rebrand |
| Solutions | `/solutions` | Exists | Rebrand |
| Industries | `/industries` | Exists | Rebrand |
| Pricing | `/pricing` | Exists (static) | Connect to `/api/pricing/plans` |
| Blog | `/blog` | Exists | Content/design refresh |
| Contact | `/contact` | Exists | OK foundation |
| Book Demo | — | **Missing dedicated route** | Add or clarify CTA path |

### 4.2 Visual & UX Gaps

| Gap | Detail | Phase |
|-----|--------|-------|
| Inspiration alignment | Current GIX style vs Salesforce/HubSpot/Datadog premium feel | Phase 4 |
| Conversion optimization | CTAs exist but no A/B structure | Phase 4 |
| Professional imagery | SVG product images only | Phase 4 |
| Orphan components | ParticleNetwork, WireSphere, CountUp unused | Integrate or remove |
| Services page | Exists but not in master directive list | KEEP or merge |
| Partners page | Exists | KEEP |
| Growth Audit | Exists as lead gen | KEEP |
| Pricing → Subscribe flow | Pricing page has no Razorpay CTA | Phase 4 |

---

## 5. Business Suite Gaps

### 5.1 AppShell & Navigation

| Requirement | Current | Gap |
|-------------|---------|-----|
| Sidebar navigation | Not implemented | **Critical** |
| Header with user menu | DashboardHeader (2 products only) | Partial |
| Product Switcher | Basic button → product-selection | Needs dropdown in sidebar |
| Global search | Not implemented | **Missing** |
| Notifications | API exists, no UI | **Missing** |
| Breadcrumbs | Not implemented | **Missing** |
| Consistent shell across suite pages | Only leadedge360/retailedge360 get DashboardHeader | **Critical** — proposals/invoices/revenue use marketing nav |
| Mobile navigation | Nav hidden below lg, no alternative | **Critical** |

### 5.2 Broken Navigation

| Link | Target | Issue |
|------|--------|-------|
| Payments | `/payments` | **Page does not exist** |

---

## 6. Dashboard (Executive Command Center) Gaps

**No `/dashboard` route exists.** APIs are ready but unused by frontend.

| Required Feature | API Available | UI Status |
|------------------|--------------|-----------|
| KPI Cards | `/api/dashboard/kpis` | **No UI** |
| Revenue Metrics | `/api/dashboard/revenue` | **No UI** |
| Lead Metrics | `/api/kpis`, `/api/lead-dashboard` | Partial (in leadedge360 only) |
| Opportunity Metrics | `/api/opportunities/dashboard` | **No UI** |
| Activity Feed | `/api/recent-activities` | **No UI** |
| Quick Actions | — | **No UI** |
| Subscription Overview | `/api/users/subscription` | **No UI** |

**Phase 5 deliverable:** New `/dashboard` route with Executive Command Center.

---

## 7. LeadEdge360 Gaps

### 7.1 Module Coverage

| Required Module | API Available | UI Status |
|-----------------|--------------|-----------|
| Leads (list) | `/api/leads` | Basic table on `/leadedge360` |
| Lead Details | `/api/leads/[id]`, timeline, notes, tasks | **No detail page** |
| Opportunities | `/api/opportunities/*` | **No UI** |
| Activities | `/api/leads/[id]/activity`, `/api/recent-activities` | **No UI** |
| Tasks | `/api/leads/[id]/tasks`, `/api/task-dashboard` | **No UI** |
| Notes | `/api/leads/[id]/notes` | **No UI** |
| Followups | `/api/followups/*`, `/api/leads/[id]/followups` | **No UI** |
| Timeline | `/api/leads/[id]/timeline` | **No UI** |
| Analytics | `/api/analytics/*`, `/api/lead-scoring/dashboard` | Partial charts only |
| Kanban Pipeline | `/api/opportunities/update-stage` | **No UI** |
| Lead Analytics | `/api/analytics/conversion`, sources, agents | **No UI** |
| Revenue Attribution | `/api/revenue/dashboard` | Separate page only |
| Scanner | `/api/scanner/*` | **No UI** |
| Sales Queue | `/api/sales/queue`, `/api/sales/workload` | **No UI** |

### 7.2 UX Gaps

| Gap | Detail |
|-----|--------|
| No lead detail drawer/page | Table-only view |
| No pipeline/kanban board | Critical CRM feature missing |
| No bulk actions | Single-lead operations only |
| No advanced search | Basic filters only |
| Charts not using design system wrapper | Direct Recharts |
| 400+ line monolithic page | Unmaintainable |

---

## 8. RetailEdge360 Gaps

| Required Module | API Available | UI Status |
|-----------------|--------------|-----------|
| Revenue Dashboard | `/api/retail-kpis` | Basic KPIs |
| Product Catalog | `/api/products`, `/api/catalog` | Basic table |
| Inventory | `/api/products` | Combined with catalog |
| Analytics | `/api/mobile/analytics` | **No dedicated UI** |
| Performance | — | **No UI** |
| Billing Overview | Billing APIs | **No UI in retail context** |
| AI Shelf-life | `/api/products/[id]/repredict` | Button only |

**Note:** Product selection page marks RetailEdge360 as "Coming Soon" but `/retailedge360` is implemented.

---

## 9. Billing Center Gaps

| Required Module | API Available | UI Status |
|-----------------|--------------|-----------|
| Subscription | `/api/users/subscription`, `/api/subscriptions/create` | **No UI** |
| Plans | `/api/billing/plans`, `/api/pricing/plans` | Static pricing page only |
| Invoices | `/api/invoices` | Basic list page |
| Payments | `/api/payments` | **No page** (broken nav link) |
| Usage | Plan feature APIs | **No UI** |

| Gap | Detail |
|-----|--------|
| No unified Billing Center route | Scattered across subscribe/pricing/invoices |
| Subscribe uses `/api/billing/*` | Dedicated `/api/payments/*` unused by frontend |
| No subscription status badge in suite | Missing |
| Pricing page disconnected from checkout | CTA goes to demo, not subscribe |

---

## 10. Cross-Cutting UX Gaps

### 10.1 Authentication & Session

| Gap | Detail |
|-----|--------|
| No route protection | Pages accessible without login |
| No auth context provider | localStorage read in multiple components |
| No token refresh on web | Mobile guide documents pattern; web doesn't implement |
| No session timeout UI | Silent expiry |

### 10.2 Data Fetching & State

| Gap | Detail |
|-----|--------|
| React Query not mounted | `providers.js` orphaned |
| No loading skeletons | Text-only loading |
| No error boundaries | Crashes possible |
| No optimistic updates | Full refetch after mutations |
| No pagination in tables | All data loaded at once |

### 10.3 Accessibility

| Gap | Detail |
|-----|--------|
| No skip links | Missing |
| Focus management in dialogs | Not verified |
| ARIA labels on icon buttons | Incomplete |
| Color contrast with orange on dark | Needs audit |
| Keyboard navigation in tables | Not implemented |

### 10.4 Performance

| Gap | Detail |
|-----|--------|
| Monolithic page bundles | Large JS per product page |
| No code splitting by product | Single app bundle |
| Images unoptimized flag | `next.config.js` sets `unoptimized: true` |
| No lazy loading for charts | Recharts loaded eagerly |

---

## 11. Gap Priority Matrix

### Critical (Phase 2–3)

1. Brand color realignment to brochure palette
2. Enterprise design system components (KPI, empty, loading, error states)
3. Unified AppShell with sidebar for all suite pages
4. Fix broken `/payments` navigation
5. Consistent suite navigation across proposals/invoices/revenue

### High (Phase 4–6)

6. Marketing website visual redesign
7. Executive dashboard (`/dashboard`)
8. LeadEdge360 lead detail, pipeline, activities, tasks, followups
9. Data grid with sorting/filtering/pagination
10. Shared API client + React Query

### Medium (Phase 7–8)

11. RetailEdge360 analytics and performance views
12. Unified Billing Center
13. Opportunities and scanner UI
14. Campaign/marketing admin UI (API exists)

### Low (Phase 9–10)

15. PWA support
16. Light mode theme
17. Storybook component docs
18. Orphan component cleanup

---

## 12. What Is Working Well (Preserve)

| Strength | Detail |
|----------|--------|
| shadcn/ui foundation | 50 primitives ready for composition |
| LeadEdge360 basic CRM | Functional leads table with AI scoring |
| RetailEdge360 inventory | Working product management with AI repredict |
| Auth flows | OTP + password signin working |
| Razorpay checkout | Subscribe page functional |
| Marketing homepage | GIX sections provide content structure |
| DPDP consent | Compliance banner implemented |
| Toast feedback | Sonner integrated |
| API depth | Backend far ahead — frontend can evolve without API changes |

---

## 13. Conclusion

The gap between current UI and the enterprise vision defined in the master directive is **substantial but bridgeable through incremental phases**. The existing shadcn/ui inventory and working product pages provide a foundation — Phase 2 (design system) and Phase 3 (AppShell) are the highest-leverage starting points. No backend changes are required to close these gaps.
