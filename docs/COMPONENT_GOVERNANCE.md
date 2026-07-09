# Component Governance — AsoftechInsightz Business Suite V2

> **Authority chain:** [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) → this document → `src/design-tokens/tokens.json` → [`COMPONENT_INVENTORY.md`](./COMPONENT_INVENTORY.md) (reference only)

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Established | 2026-06-21 |
| Applies to | All V2 frontend work (Phases 2–10) |
| Scope | `components/**`, `app/**/page.js` composition, `src/design-tokens/**` |

---

## 1. Purpose

This document defines **how components are organized, named, built, and reused** so the V2 redesign stays consistent, maintainable, and mobile-ready.

**Goals:**

- One composable layer on top of shadcn/ui — not 50 duplicate patterns
- No new inline monolith pages (400+ line `page.js` files)
- Marketing and Suite surfaces share primitives, not business logic
- Every new component traceable to a phase and folder

---

## 2. Component Layers (Canonical)

Components are organized in **strict layers**. Higher layers may import lower layers. **Never import upward.**

```
┌─────────────────────────────────────────────────────────┐
│  L4  Product domain    leadedge360/ retailedge360/ billing/ │
├─────────────────────────────────────────────────────────┤
│  L3  Application shell  suite/  site/  gix/                │
├─────────────────────────────────────────────────────────┤
│  L2  Design system      design-system/                     │
├─────────────────────────────────────────────────────────┤
│  L1  Primitives         ui/  (shadcn/ui — do not fork)     │
└─────────────────────────────────────────────────────────┘
```

| Layer | Path | Owns | Must not contain |
|-------|------|------|------------------|
| **L1 Primitives** | `components/ui/` | Buttons, inputs, dialogs, tables (shadcn) | API calls, product logic, page layout |
| **L2 Design system** | `components/design-system/` | KpiCard, DataGrid, EmptyState, FilterBar, PageHeader | Product-specific fields, route logic |
| **L3 Shell / marketing** | `components/suite/`, `site/`, `gix/` | AppShell, Navbar, homepage sections | Lead/opportunity/invoice domain rules |
| **L4 Product domain** | `components/leadedge360/`, `retailedge360/`, `billing/` | LeadTable, PipelineBoard, PlanCard | Generic reusable widgets (belong in L2) |

**Machine-readable paths:** `src/design-tokens/tokens.json` → `components`

---

## 3. Folder Rules

### 3.1 Where new files go

| If you are building… | Put it in… | Phase |
|---------------------|------------|-------|
| Themed KPI card, empty state, data grid | `components/design-system/` | 2 |
| AppShell, sidebar, breadcrumbs, global search | `components/suite/` | 3 |
| Navbar, footer, consent banner | `components/site/` | 4 |
| Homepage hero, product sections | `components/gix/sections/` | 4 |
| Lead list, pipeline, lead detail | `components/leadedge360/` | 6 |
| Product catalog, retail analytics | `components/retailedge360/` | 7 |
| Plans, invoices, payment history | `components/billing/` | 8 |
| New shadcn primitive (rare) | `components/ui/` via CLI only | Any |

### 3.2 Forbidden locations

| Do not… | Reason |
|---------|--------|
| Add domain components under `components/ui/` | Primitives stay generic |
| Add API logic under `components/ui/` | Separation of concerns |
| Create `components/shared/` or `components/common/` | Use `design-system/` instead |
| Create duplicate KPI/table/modal inline in `app/**/page.js` | Extract to L2 or L4 |
| Add components under `lib/` | `lib/` is backend — frozen |

### 3.3 Page files (`app/**/page.js`)

Pages are **thin composition roots** only.

| Allowed in `page.js` | Not allowed in `page.js` |
|----------------------|----------------------------|
| Layout wrapper import | 50+ lines of JSX for one feature |
| Data hook / fetch orchestration | Inline `KpiCard`, `LeadDialog` definitions |
| Route-level metadata | Hardcoded brand hex colors |
| Passing props to domain components | Direct Recharts configuration (use L2 chart wrapper) |

**Target:** `page.js` ≤ 150 lines after refactor (Phases 5–8).

---

## 4. Naming Conventions

### 4.1 Files

| Type | Convention | Example |
|------|------------|---------|
| React component | PascalCase, `.tsx` for new V2 work | `KpiCard.tsx` |
| Legacy (existing) | `.jsx` / `.js` — migrate on touch | `Navbar.jsx` |
| Barrel export | `index.ts` per folder (Phase 2+) | `design-system/index.ts` |
| Test (Phase 10+) | `ComponentName.test.tsx` | `KpiCard.test.tsx` |

### 4.2 Component names

| Pattern | Use for | Example |
|---------|---------|---------|
| `*Card` | Summary tiles | `KpiCard`, `PlanCard` |
| `*Table` / `*Grid` | Tabular data | `LeadTable`, `DataGrid` |
| `*Dialog` / `*Drawer` | Overlays | `LeadDialog`, `ProductDrawer` |
| `*State` | Empty / loading / error | `EmptyState`, `LoadingState` |
| `*Bar` | Toolbars | `FilterBar`, `PageHeader` |
| No `*Widget` suffix | Prefer domain name | `KpiCard` not `KpiWidget` |

### 4.3 Props

- Use `className` for layout overrides (Tailwind only)
- Boolean props: `isLoading`, `isEmpty`, `showTrend` — not `loading` alone
- Event handlers: `onSubmit`, `onRowClick`, `onStatusChange`
- Domain IDs: `leadId`, `productId`, `invoiceId` — not generic `id` when ambiguous

---

## 5. shadcn/ui Governance (L1)

`components/ui/` is managed by **shadcn CLI** (`components.json`). Treat it as vendor code.

### 5.1 Allowed

- Add new primitives via `npx shadcn@latest add <component>`
- Tailwind class adjustments inside primitive files **only** when syncing to design tokens (Phase 2)
- Import primitives from `@/components/ui/*`

### 5.2 Forbidden

- Copy-paste a primitive into `design-system/` or product folders
- Add business logic inside `components/ui/*`
- Add API `fetch()` inside `components/ui/*`
- Remove unused primitives before Phase 10 cleanup (may be needed in later phases)

### 5.3 Prefer design-system wrappers

| Instead of… | Create in L2… |
|-------------|---------------|
| Custom-styled `Button` in every page | `design-system/PrimaryButton.tsx` (if needed) |
| Raw `Table` + manual sort UI | `design-system/DataGrid.tsx` |
| Raw Recharts in pages | `design-system/ChartCard.tsx` using `ui/chart.jsx` |
| `"Loading..."` text | `design-system/LoadingState.tsx` using `ui/skeleton.jsx` |

---

## 6. Styling Governance

### 6.1 Token sources (precedence)

```
1. src/design-tokens/tokens.json     ← canonical hex / spacing / radius
2. app/globals.css CSS variables     ← migrate in Phase 2 to match tokens
3. tailwind.config.js                ← map tokens, do not invent new brand colors
4. Inline styles / arbitrary values  ← FORBIDDEN in new V2 components
```

### 6.2 Tailwind rules for new components

| Use | Do not use |
|-----|------------|
| `bg-background`, `text-foreground`, semantic tokens | `bg-[#020617]`, `bg-slate-950` |
| `text-brand-navy` (after Phase 2 token migration) | `brand.orange` legacy `#FF8A3D` |
| `cn()` from `@/lib/utils` | String concatenation for classes |
| Spacing from token scale (`p-6`, `gap-4`) | Random `p-[13px]` |

### 6.3 Theme surfaces

| Surface | Wrapper | Theme key |
|---------|---------|-----------|
| Marketing pages | `SiteShell` | `tokens.themes.marketing` |
| Business Suite | `AppShell` (Phase 3) | `tokens.themes.suite` |

Components in `design-system/` accept optional `variant="marketing" | "suite"` when visuals differ.

### 6.4 Deprecated utilities (do not use in new work)

| Utility | Replacement |
|---------|-------------|
| `.glow-orange` | Subtle shadow token (Phase 2) |
| `.glass` | Solid `card` background on suite |
| `.gradient-text` on suite pages | Solid `text-foreground` or brand accent |
| Green `--accent` | Electric Blue / Royal Blue per SOURCE_OF_TRUTH §3 |

---

## 7. Data & State Governance

### 7.1 Where data fetching lives

| Layer | May fetch API? | Pattern |
|-------|----------------|---------|
| L1 `ui/` | **No** | — |
| L2 `design-system/` | **No** | Presentational only |
| L3 `suite/`, `site/` | **Rare** | Auth user display, notifications count |
| L4 product folders | **Yes** | Via hooks in `src/hooks/` or page-level orchestration |
| `app/**/page.js` | **Yes** | Compose hooks; pass data down |

### 7.2 API client (Phase 2+)

All new fetch logic must use `src/api/client.js` (when introduced):

- Attach `Authorization: Bearer` from `localStorage.accessToken`
- Use paths from `docs/openapi.json` — no invented endpoints
- **No mock data, no hardcoded JSON fixtures**

### 7.3 State management

| Concern | Ruling |
|---------|--------|
| Server/async state | TanStack React Query via `app/providers.js` (mount in layout Phase 2+) |
| Auth session | Read `localStorage` in `suite/` shell only; pass user via context (Phase 3) |
| UI state (modal open, tab) | Local `useState` in component or page |
| Global UI state | React Context in `components/suite/` — not Redux/Zustand unless approved |
| Forms | `react-hook-form` + `zod` + `ui/form.jsx` for all new forms (Phase 2+) |

### 7.4 Notifications

| Type | Component | Use |
|------|-----------|-----|
| Transient feedback | Sonner (`ui/sonner`) | Save, delete, API success/error toast |
| Persistent inbox | `suite/NotificationBell.tsx` (Phase 3) | `/api/notifications` |

---

## 8. Composition Patterns

### 8.1 Standard page structure (Suite)

```tsx
// app/leadedge360/page.js (target pattern — Phase 6)
import { AppShell } from '@/components/suite/AppShell'
import { PageHeader } from '@/components/design-system/PageHeader'
import { LeadDashboard } from '@/components/leadedge360/LeadDashboard'

export default function LeadEdge360Page() {
  return (
    <AppShell product="leadedge360">
      <PageHeader title="Leads" />
      <LeadDashboard />
    </AppShell>
  )
}
```

### 8.2 Standard list screen

```
PageHeader
  → FilterBar (L2)
  → DataGrid | LeadTable (L4)
  → EmptyState | LoadingState | ErrorState (L2)
  → DetailDrawer (L4) — not Dialog for wide content
```

### 8.3 Standard KPI row

```
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  <KpiCard ... />  // L2 — same component on /dashboard and /leadedge360
</div>
```

**Rule:** If a widget appears on 2+ screens, it belongs in `design-system/`, not duplicated in product folders.

---

## 9. Accessibility & Responsive Rules

All new components (L2–L4) must:

| Requirement | Standard |
|-------------|----------|
| Keyboard | Focusable controls; Escape closes overlays |
| Labels | `Label` + `htmlFor` or `aria-label` on icon-only buttons |
| Loading | `aria-busy` on containers using `LoadingState` |
| Empty | Meaningful message + optional action in `EmptyState` |
| Tables | `<Table>` semantic markup; horizontal scroll on mobile |
| Breakpoints | Mobile-first; test `sm`, `md`, `lg`, `xl` |
| Motion | Respect `prefers-reduced-motion` for framer-motion (marketing only) |

Suite navigation below `lg` must use `suite/MobileNav.tsx` (Phase 3) — never hide nav without an alternative.

---

## 10. TypeScript Migration

| Rule | Detail |
|------|--------|
| New V2 components | **`.tsx` required** in `design-system/`, `suite/`, product folders |
| Existing `.jsx` | Migrate to `.tsx` only when file is touched for V2 |
| Shared types | `src/types/` mirroring `docs/openapi.json` (Phase 9) |
| Props | Export `interface FooProps` from same file |
| No `any` | Use `unknown` + zod parse for API responses until types exist |

---

## 11. Phase Delivery Map

Components approved per phase — **do not build ahead**.

### Phase 2 — Design System (`components/design-system/`)

| Component | Priority |
|-----------|----------|
| `KpiCard` | P0 |
| `EmptyState` | P0 |
| `LoadingState` | P0 |
| `ErrorState` | P0 |
| `PageHeader` | P0 |
| `FilterBar` | P1 |
| `DataGrid` | P1 |
| `ChartCard` | P1 |
| `StatusBadge` | P1 |
| `FormField` (wraps ui/form) | P1 |

### Phase 3 — Suite Shell (`components/suite/`)

| Component | Priority |
|-----------|----------|
| `AppShell` | P0 |
| `Sidebar` | P0 |
| `SuiteHeader` | P0 |
| `Breadcrumbs` | P0 |
| `MobileNav` | P0 |
| `ProductSwitcher` (migrate from `business-suite/`) | P0 |
| `GlobalSearch` | P1 |
| `NotificationBell` | P1 |
| `UserMenu` | P0 |

**Migrate:** `components/business-suite/*` → `components/suite/` then deprecate old folder.

### Phase 4 — Marketing (refine existing)

| Location | Action |
|----------|--------|
| `components/site/*` | Refine to tokens; no new folder |
| `components/gix/sections/*` | Refine; use L2 `KpiCard` only if metrics shown |
| Orphan: `ParticleNetwork`, `WireSphere`, `CountUp` | Integrate or remove (Phase 10) |

### Phase 5 — Dashboard (`components/suite/` or `design-system/`)

| Component | Notes |
|-----------|-------|
| `ExecutiveDashboard` | Composes L2 `KpiCard`, `ChartCard`, activity feed |
| APIs | `/api/dashboard/*` only |

### Phase 6 — LeadEdge360 (`components/leadedge360/`)

`LeadTable`, `LeadDetailDrawer`, `PipelineBoard`, `ActivityTimeline`, `TaskList`, `FollowupList`, `LeadAnalytics`

### Phase 7 — RetailEdge360 (`components/retailedge360/`)

`ProductCatalog`, `InventoryTable`, `RetailKpiRow`, `RetailAnalytics`

### Phase 8 — Billing (`components/billing/`)

`PlanCard`, `SubscriptionPanel`, `InvoiceList`, `PaymentHistory`

---

## 12. Anti-Patterns (Current Codebase — Do Not Repeat)

| Anti-pattern | Found in | Correct approach |
|--------------|----------|------------------|
| 400+ line `page.js` with inline subcomponents | `leadedge360/page.js` | Extract to L4 folder |
| Inline `KpiCard` function in page | LeadEdge360, RetailEdge360 | `design-system/KpiCard` |
| `"Loading..."` string | Multiple pages | `LoadingState` |
| No empty state when table has 0 rows | Suite pages | `EmptyState` |
| Hardcoded `bg-[#020617]` | `product-selection/page.js` | Semantic tokens |
| Marketing nav on suite pages | `proposals`, `invoices`, `revenue` | `AppShell` (Phase 3) |
| Raw `fetch()` without auth header | Retail/product calls | API client |
| Recharts config duplicated | Product pages | `ChartCard` wrapper |
| `components/ui/sidebar.jsx` unused | Installed shadcn | Wire in `suite/Sidebar` or remove Phase 10 |
| Two product switcher locations | `business-suite/` | Single `suite/ProductSwitcher` |

---

## 13. Import Aliases

From `components.json` and `jsconfig.json`:

```ts
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/design-system/KpiCard'
import { AppShell } from '@/components/suite/AppShell'
import { LeadTable } from '@/components/leadedge360/LeadTable'
import { cn } from '@/lib/utils'
import { colors } from '@/src/design-tokens'
```

**Do not** use relative imports that cross layer boundaries upward (e.g. `leadedge360/` importing from `retailedge360/`).

---

## 14. Review Checklist (Every Component PR)

- [ ] File is in the correct layer folder (§3)
- [ ] Name follows conventions (§4)
- [ ] No API calls in L1/L2
- [ ] No hardcoded brand hex (§6)
- [ ] No mock data
- [ ] Uses `cn()` for class merging
- [ ] Empty, loading, and error states considered
- [ ] Mobile layout verified
- [ ] Aligns with `SOURCE_OF_TRUTH.md` constraints (§2)
- [ ] Phase-appropriate — not building Phase 6 components during Phase 2

---

## 15. Deprecation & Cleanup

| Item | When | Action |
|------|------|--------|
| `components/business-suite/` | Phase 3 | Migrate to `suite/`; leave re-export shim one phase |
| Inline page subcomponents | Phases 5–8 | Delete from `page.js` after extraction |
| Legacy toast (`ui/toast`, `hooks/use-toast`) | Phase 10 | Remove if unused |
| `.bak` component files | Phase 10 | Delete |
| Unused shadcn primitives | Phase 10 | Audit before removal |

**Never delete** a component that production pages still import without updating consumers in the same commit.

---

## 16. Document Relationships

```
SOURCE_OF_TRUTH.md          ← what & why (constraints, brand, routes)
    ↓
COMPONENT_GOVERNANCE.md     ← how (this file — component rules)
    ↓
src/design-tokens/tokens.json ← values (colors, spacing, paths)
    ↓
COMPONENT_INVENTORY.md      ← as-is snapshot (Phase 1 audit)
```

---

## 17. Approval

Component governance is **active** upon publication. All Phase 2+ work must comply.

**Next:** Phase 2 creates `components/design-system/` per §11.
