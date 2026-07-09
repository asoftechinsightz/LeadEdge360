# Component Inventory — AsoftechInsightz

> **Reference inventory only.** Canonical component rules: [`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md) · structure: [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) §5 · `src/design-tokens/tokens.json` → `components`

**Phase:** 1 — Audit Only  
**Date:** 2026-06-21  
**Stack:** Next.js 14 · React 18 · Tailwind CSS · shadcn/ui (New York) · Radix UI · Recharts · Framer Motion

---

## 1. Component Library Structure

| Layer | Path | Count | Role |
|-------|------|-------|------|
| Shared primitives | `components/ui/` | 50 | shadcn/ui design system foundation |
| Marketing shell | `components/site/` | 8 | Navbar, Footer, consent, motion |
| Marketing sections | `components/gix/` | 10 | Homepage landing blocks |
| Business suite shell | `components/business-suite/` | 2 | Header + product switcher |
| Product dashboards | `app/*/page.js` | 6+ | Monolithic inline components |
| Hooks | `hooks/` | 2 | Mobile breakpoint, legacy toast |
| Utils | `lib/utils.js` | 1 | `cn()` class merge helper |

**Total component files:** 68 (excluding `.bak` snapshots)

**Key finding:** Strong primitive inventory, thin composition layer. Product logic lives in 400+ line page files, not reusable domain components.

---

## 2. Shared UI Primitives (`components/ui/`)

shadcn/ui components installed via `components.json` (style: New York, base: slate, CSS variables: enabled).

### 2.1 Actions & Inputs

| Component | File | Used in App |
|-----------|------|-------------|
| Button | `button.jsx` | Yes |
| Input | `input.jsx` | Yes |
| Textarea | `textarea.jsx` | Yes |
| Label | `label.jsx` | Yes |
| Select | `select.jsx` | Yes |
| Switch | `switch.jsx` | Yes (LeadEdge360) |
| Checkbox | `checkbox.jsx` | No |
| Radio Group | `radio-group.jsx` | No |
| Slider | `slider.jsx` | No |
| Input OTP | `input-otp.jsx` | No |
| Toggle | `toggle.jsx` | Internal only |
| Toggle Group | `toggle-group.jsx` | Internal only |

### 2.2 Layout & Structure

| Component | File | Used in App |
|-----------|------|-------------|
| Card | `card.jsx` | Yes |
| Separator | `separator.jsx` | Yes (signin) |
| Scroll Area | `scroll-area.jsx` | No |
| Aspect Ratio | `aspect-ratio.jsx` | No |
| Resizable | `resizable.jsx` | No |
| Collapsible | `collapsible.jsx` | No |
| Accordion | `accordion.jsx` | No |

### 2.3 Overlays & Navigation

| Component | File | Used in App |
|-----------|------|-------------|
| Dialog | `dialog.jsx` | Yes |
| Alert Dialog | `alert-dialog.jsx` | Internal only |
| Drawer | `drawer.jsx` | **No** |
| Sheet | `sheet.jsx` | Internal (sidebar dep) |
| Popover | `popover.jsx` | No |
| Hover Card | `hover-card.jsx` | No |
| Dropdown Menu | `dropdown-menu.jsx` | Yes (Navbar) |
| Context Menu | `context-menu.jsx` | No |
| Menubar | `menubar.jsx` | No |
| Navigation Menu | `navigation-menu.jsx` | No |
| Breadcrumb | `breadcrumb.jsx` | **No** |
| Command | `command.jsx` | Internal only |
| Sidebar | `sidebar.jsx` | **No** (~630 lines, full system) |

### 2.4 Data Display

| Component | File | Used in App |
|-----------|------|-------------|
| Table | `table.jsx` | Yes |
| Badge | `badge.jsx` | Yes |
| Avatar | `avatar.jsx` | No |
| Calendar | `calendar.jsx` | Internal only |
| Pagination | `pagination.jsx` | Internal only |
| Progress | `progress.jsx` | No |
| Skeleton | `skeleton.jsx` | Internal (sidebar only) |
| Chart | `chart.jsx` | **No** (pages use Recharts directly) |
| Carousel | `carousel.jsx` | Internal only |

### 2.5 Feedback

| Component | File | Used in App |
|-----------|------|-------------|
| Alert | `alert.jsx` | No |
| Sonner | `sonner.jsx` | Yes (root layout) |
| Toast | `toast.jsx` | No (legacy) |
| Toaster | `toaster.jsx` | No (legacy) |
| Tooltip | `tooltip.jsx` | Internal (sidebar only) |
| Tabs | `tabs.jsx` | Yes |

### 2.6 Forms

| Component | File | Used in App |
|-----------|------|-------------|
| Form | `form.jsx` | **No** (react-hook-form + zod integration unused) |

### 2.7 Primitive Utilization Summary

| Status | Count | Percentage |
|--------|-------|------------|
| Used in pages | ~15 | ~30% |
| Internal/dependency only | ~10 | ~20% |
| Unused inventory | ~25 | ~50% |

---

## 3. Layout Components

| Component | File | Description | Classification |
|-----------|------|-------------|----------------|
| SiteShell | `components/site/SiteShell.jsx` | Marketing wrapper: Navbar + main + Footer + DPDP | REFINE |
| Navbar | `components/site/Navbar.jsx` | Sticky marketing nav; switches to DashboardHeader on product paths | REFINE |
| Footer | `components/site/Footer.jsx` | 4-column marketing footer | REFINE |
| DashboardHeader | `components/business-suite/DashboardHeader.tsx` | Suite top bar with horizontal nav | REFINE → extend to AppShell |
| ProductSwitcher | `components/business-suite/ProductSwitcher.tsx` | Button → `/product-selection` | REFINE |
| GIXContainer | `components/gix/layout/GIXContainer.jsx` | Homepage gradient background wrapper | REFINE |
| Root Layout | `app/layout.js` | Fonts, dark mode, Sonner, Razorpay script | REFINE |

### Missing Layout Patterns (vs Enterprise Requirements)

| Pattern | Status |
|---------|--------|
| AppShell with persistent sidebar | Missing — `sidebar.jsx` installed but unused |
| Route-aware dashboard layout | Missing — no `app/(suite)/layout.js` |
| Breadcrumbs | Missing — component installed, unused |
| Global search | Missing |
| Notification center | Missing — API exists, no UI |
| Command palette | Missing — component installed, unused |

---

## 4. Marketing Website Components

### 4.1 Site Chrome

| Component | File | Used | Classification |
|-----------|------|------|----------------|
| SiteShell | `site/SiteShell.jsx` | Yes | KEEP |
| Navbar | `site/Navbar.jsx` | Yes | REFINE |
| Footer | `site/Footer.jsx` | Yes | REFINE |
| DpdpConsentBanner | `site/DpdpConsentBanner.jsx` | Yes | KEEP |
| Reveal | `site/Reveal.jsx` | Yes | KEEP |

### 4.2 Visual Effects (Orphan — Not Imported)

| Component | File | Classification |
|-----------|------|----------------|
| ParticleNetwork | `site/ParticleNetwork.jsx` | REMOVE or integrate in Phase 4 |
| WireSphere | `site/WireSphere.jsx` | REMOVE or integrate in Phase 4 |
| CountUp | `site/CountUp.jsx` | REMOVE or integrate in Phase 4 |

### 4.3 GIX Homepage Sections (`components/gix/sections/`)

| Section | File | Classification |
|---------|------|----------------|
| Hero | `HeroSection.jsx` | REFINE |
| Growth Audit | `GrowthAuditSection.jsx` | REFINE |
| Why Growth Fails | `WhyGrowthFailsSection.jsx` | REFINE |
| Industries | `IndustriesSection.jsx` | REFINE |
| Growth Ecosystem | `GrowthEcosystemSection.jsx` | REFINE |
| Growth Journey | `GrowthJourneySection.jsx` | REFINE |
| LeadEdge360 | `LeadEdge360Section.jsx` | REFINE |
| RetailEdge360 | `RetailEdge360Section.jsx` | REFINE |
| Final CTA | `FinalCTASection.jsx` | REFINE |

---

## 5. Dashboard & Product Components

**No shared dashboard component folder exists.** All product UI is inline in page files.

### 5.1 LeadEdge360 (`app/leadedge360/page.js` — ~429 lines)

| Inline Component | Description |
|------------------|-------------|
| `KpiCard` | KPI metric display with icon |
| `LeadDialog` | Add-lead form dialog |
| Charts | Bar, pie, line charts (Recharts) |
| Leads table | Filterable table with status badges |
| Filters | Territory, status, agent role switcher |

**APIs:** `/api/leads`, `/api/kpis`, `/api/agents`

**Classification:** REFACTOR — extract to `components/leadedge360/`

### 5.2 RetailEdge360 (`app/retailedge360/page.js`)

| Inline Component | Description |
|------------------|-------------|
| `Kpi` | Retail KPI cards |
| `ProductDialog` | Add product form |
| Inventory table | Product list with risk badges |
| Charts | Recharts visualizations |

**APIs:** `/api/products`, `/api/retail-kpis`

**Classification:** REFACTOR — extract to `components/retailedge360/`

### 5.3 Business Suite Ops Pages

| Page | File | Components Used | Classification |
|------|------|---------------|----------------|
| Proposals | `app/proposals/page.js` | Card, Table, Badge (4 stat cards + table) | REFINE |
| Invoices | `app/invoices/page.js` | Card, Table, Badge (3 stat cards + table) | REFINE |
| Revenue | `app/revenue/page.js` | Card only (4 stat cards) | REFINE |
| Onboarding | `app/onboarding/page.js` | Plain HTML progress bar | REFINE |
| Product Selection | `app/product-selection/page.js` | Plain HTML product cards | REFINE |
| Splash | `app/splash/page.js` | Loading/redirect screen | KEEP |
| Subscribe | `app/subscribe/page.js` | Standalone HTML plan cards + Razorpay | REFINE |
| Pricing | `app/pricing/page.js` | Standalone HTML | REFINE |
| Sign-in | `app/signin/page.js` | Card, Input, Button, Separator, Tabs | REFINE |

---

## 6. Billing Components

**No reusable billing UI components exist.**

| Area | Location | UI State |
|------|----------|----------|
| Plan display | `app/pricing/page.js` | Raw HTML, no shadcn |
| Checkout | `app/subscribe/page.js` | Raw HTML + Razorpay |
| Invoices | `app/invoices/page.js` | Basic table |
| Revenue | `app/revenue/page.js` | Basic stat cards |
| Proposals | `app/proposals/page.js` | Basic table |
| Backend logic | `lib/billing/*`, `lib/razorpay.js` | Not UI |

**Phase 8 will create:** PlanCard, SubscriptionBadge, InvoiceRow, PaymentStatus, UsageMeter components.

---

## 7. Theme & Styling Files

| File | Purpose |
|------|---------|
| `app/globals.css` | CSS variables (dark theme), utility classes (`.gradient-text`, `.glass`, `.glow-orange`, `.grid-bg`) |
| `tailwind.config.js` | shadcn tokens, brand colors, fonts, animations |
| `postcss.config.js` | Tailwind + autoprefixer pipeline |
| `components.json` | shadcn registry config |
| `app/layout.js` | Inter + Space Grotesk fonts; hardcoded `dark` class on `<html>` |

### Current Brand Tokens vs Official

| Token | Current | Official (Brochure) |
|-------|---------|---------------------|
| Primary | Orange `#FF8A3D` (HSL) | Orange `#FF7A00` |
| Accent | Green `#22C55E` | Blue family |
| Navy | `#070B14` | `#071B4D` |
| Royal Blue | — | `#0D47A1` |
| Electric Blue | — | `#1976D2` |

### Theme Gaps

- `next-themes` installed but `ThemeProvider` not mounted
- Theme fixed to dark via `className="dark"` on `<html>`
- Several pages bypass design tokens with inline colors (`bg-[#020617]`, `bg-slate-950`)

---

## 8. State Management

| Mechanism | Status | Location |
|-----------|--------|----------|
| `useState` + `useEffect` | **Primary** | All dashboard/marketing pages |
| `fetch()` | **Primary** data fetching | Pages call `/api/*` directly |
| `localStorage` | Auth session | `currentUser`, `accessToken`, `refreshToken`, `dpdp_consent_v1` |
| Sonner toasts | User feedback | LeadEdge360, RetailEdge360, contact |
| React Query | Installed, **not wired** | `app/providers.js` exists, not in layout |
| SWR | Installed, **unused** | — |
| react-hook-form + zod | Installed, **unused in pages** | `form.jsx` only |
| @tanstack/react-table | Installed, **unused** | Plain `<Table>` used |
| Context API | Component-scoped | Form, Sidebar, Chart internals |
| Global auth context | **Missing** | Navbar/DashboardHeader read localStorage directly |
| Redux / Zustand / Jotai | Not present | — |

---

## 9. Hooks

| Hook | File | Used |
|------|------|------|
| `useIsMobile` | `hooks/use-mobile.jsx` | Sidebar dependency only |
| `useToast` | `hooks/use-toast.js` | Legacy toaster only |

---

## 10. Enterprise Design System — Gap vs Requirements

| Required Component | Current State | Phase |
|--------------------|---------------|-------|
| Cards | shadcn Card — used | Phase 2 — standardize |
| KPI Widgets | Inline only, no shared component | Phase 2 |
| Tables | Basic shadcn Table | Phase 2 — add data grid |
| Data Grids | Not implemented | Phase 2 |
| Forms | `form.jsx` unused | Phase 2 |
| Filters | Ad-hoc on LeadEdge360 | Phase 2 |
| Charts | Recharts direct (no wrapper) | Phase 2 — use `chart.jsx` |
| Drawers | Installed, unused | Phase 3 |
| Modals | Dialog — used | Phase 2 — standardize |
| Notifications | Sonner toasts only | Phase 3 — add inbox |
| Empty States | Not implemented | Phase 2 |
| Loading States | `"Loading..."` text; Skeleton unused | Phase 2 |
| Error States | Not implemented | Phase 2 |
| Breadcrumbs | Installed, unused | Phase 3 |
| Sidebar / AppShell | Installed, unused | Phase 3 |
| Command palette / Search | Installed, unused | Phase 3 |
| Date pickers | Calendar unused | Phase 6+ |
| File upload | Not implemented | Future |
| Billing UI kit | Not implemented | Phase 8 |
| Storybook / docs | Not implemented | Phase 10 |

---

## 11. Proposed Component Architecture (Phase 2+)

```
components/
├── ui/                    # shadcn primitives (existing)
├── design-system/         # Phase 2 — themed wrappers
│   ├── KpiCard.tsx
│   ├── DataGrid.tsx
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   ├── FilterBar.tsx
│   └── PageHeader.tsx
├── suite/                 # Phase 3 — AppShell
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── SuiteHeader.tsx
│   ├── Breadcrumbs.tsx
│   ├── GlobalSearch.tsx
│   └── NotificationBell.tsx
├── leadedge360/           # Phase 6
│   ├── LeadTable.tsx
│   ├── LeadDetail.tsx
│   ├── PipelineBoard.tsx
│   └── LeadAnalytics.tsx
├── retailedge360/         # Phase 7
│   ├── ProductCatalog.tsx
│   ├── InventoryTable.tsx
│   └── RetailAnalytics.tsx
├── billing/               # Phase 8
│   ├── PlanCard.tsx
│   ├── InvoiceList.tsx
│   └── PaymentHistory.tsx
├── site/                  # Phase 4 — marketing (existing, refined)
└── gix/                   # Phase 4 — homepage sections (existing, refined)
```

---

## 12. Summary

The repository has invested in a **comprehensive shadcn/ui primitive library** (~50 components) but uses only ~30% in production pages. Product dashboards are **monolithic page files** rather than composable domain components. The Business Suite shell is **minimal** (2 TypeScript files). Phase 2–3 will build the composition layer on top of this existing foundation without removing primitives.
