# Component Inventory

**Audit date:** 22 June 2026  
**Root:** `components/` (~187 active files)

---

## 1. Summary by Category

| Category | Approx. files | Primary paths |
|----------|---------------|---------------|
| Shared | ~130 | `ui/`, `design-system/`, `suite/` shell, `site/`, `gix/`, `brand/` |
| Business Suite | ~20 | `suite/` modules, `billing/`, `growth/`, `business-suite/` |
| LeadEdge360 | ~30 | `leadedge360/`, `leadedge360/enterprise/` |
| RetailEdge360 | 7 | `retailedge360/` |

**App-local UI:** `app/design-system-preview/PreviewClient.jsx` only.

---

## 2. Shared Components

### 2.1 `components/ui/` — shadcn/Radix primitives (48 files)

Accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle-group, toggle, tooltip.

**Used by:** Growth editor, billing, legacy pages. Newer suite code prefers `design-system`.

### 2.2 `components/design-system/` — Enterprise design system (37 files)

| Subfolder | Contents |
|-----------|----------|
| `core/` | Button, Card, KPICard, Badge, Input, Select, Checkbox, Radio, Toggle, Tabs, Table, DataCard, DataGrid, Modal, Drawer, Tooltip, Dropdown, EmptyState, LoadingState, PageHeader |
| `foundations/` | typography, spacing, radius, shadows, elevation, animation, breakpoints, focus, accessibility tokens |
| `themes/` | ThemeProvider (`marketing` \| `suite`), marketing.css, suite.css |
| Root | `DesignSystemPreview.tsx`, `index.ts` |

### 2.3 `components/suite/` — Application shell (19 files)

| File | Purpose |
|------|---------|
| `AppShell.tsx` | Main authenticated layout (sidebar + header + content) |
| `SuiteRouteLayout.tsx` | Theme + auth guard + AppShell wrapper |
| `Sidebar.tsx` | Collapsible navigation rail |
| `SuiteHeader.tsx` | Top bar (search, notifications, user) |
| `MobileNav.tsx` | Mobile drawer navigation |
| `Breadcrumbs.tsx` | Route breadcrumb trail |
| `GlobalSearch.tsx` | Suite-wide lead search |
| `NotificationBell.tsx` | Notification dropdown |
| `UserMenu.tsx` | User avatar menu |
| `ProductSwitcher.tsx` | LeadEdge360 ↔ RetailEdge360 switcher |
| `SuiteAuthContext.tsx` | Auth state provider |
| `nav-config.ts` | Navigation groups, route labels, product list |
| `suite-api.ts` | Authenticated fetch helper |
| `auth-routes.ts` | Sign-in paths and guard route list |
| `index.ts` | Barrel exports |

### 2.4 `components/brand/`

| File | Purpose |
|------|---------|
| `BrandLogo.tsx` | Logo variants (icon, compact, sidebar) |

### 2.5 `components/site/` — Public marketing shell

| File | Purpose |
|------|---------|
| `SiteShell.jsx` | Marketing layout wrapper |
| `Navbar.jsx` | Public navigation |
| `Footer.jsx` | Site footer |
| `DpdpConsentBanner.jsx` | Privacy consent banner |
| `CountUp.jsx` | Animated stat counter |
| `Reveal.jsx` | Scroll-reveal animation |
| `WireSphere.jsx` | Hero decorative visual |
| `ParticleNetwork.jsx` | Particle background |

### 2.6 `components/gix/` — Growth Intelligence Experience (marketing)

| File | Purpose |
|------|---------|
| `layout/GIXContainer.jsx` | Section container |
| `sections/HeroSection.jsx` | Landing hero |
| `sections/GrowthJourneySection.jsx` | Journey narrative |
| `sections/GrowthEcosystemSection.jsx` | Ecosystem overview |
| `sections/GrowthAuditSection.jsx` | Growth audit pitch |
| `sections/LeadEdge360Section.jsx` | LeadEdge360 marketing |
| `sections/RetailEdge360Section.jsx` | RetailEdge360 marketing |
| `sections/IndustriesSection.jsx` | Industries showcase |
| `sections/WhyGrowthFailsSection.jsx` | Problem/solution |
| `sections/FinalCTASection.jsx` | Bottom CTA |

---

## 3. Business Suite Components

### 3.1 Suite domain modules (`components/suite/`)

| File | Route | Purpose |
|------|-------|---------|
| `ExecutiveDashboard.js` | `/dashboard` | Executive KPIs, charts, activity |
| `AnalyticsDashboard.js` | `/analytics` | Funnel, sources, campaigns |
| `CampaignTable.js` | `/campaigns` | Campaign list table |
| `ProposalTable.js` | `/proposals` | Proposal list table |
| `SettingsModule.js` | `/settings` | Profile, company, users, roles, billing tabs |

### 3.2 Billing (`components/billing/` — 11 files)

| File | Purpose |
|------|---------|
| `BillingCenter.js` | Unified billing hub |
| `PlansGrid.js` | Plan selection grid |
| `PlanCard.js` | Individual plan card |
| `SubscriptionPanel.js` | Current subscription status |
| `SubscriptionBadge.js` | Plan tier badge |
| `InvoiceList.js` | Invoice list with KPIs |
| `PaymentHistory.js` | Payment transactions |
| `PaymentStatus.js` | Status badge |
| `useSubscribeCheckout.js` | Razorpay checkout hook |
| `constants.js` | Formatters and status maps |
| `index.js` | Barrel exports |

### 3.3 Growth (`components/growth/` — 2 files)

| File | Route | Purpose |
|------|-------|---------|
| `BusinessCardEditor.tsx` | `/growth/business-card` | Card CRUD, publish, logo upload |
| `PublicBusinessCard.tsx` | `/c/[slug]` | Public card renderer |

### 3.4 Legacy (`components/business-suite/`)

| File | Status |
|------|--------|
| `DashboardHeader.tsx` | Deprecated — use AppShell |
| `ProductSwitcher.tsx` | Duplicate — use `suite/ProductSwitcher.tsx` |

---

## 4. LeadEdge360 Components

### 4.1 Core CRM (`components/leadedge360/` — 16 files)

| File | Purpose |
|------|---------|
| `LeadDashboard.js` | Pipeline KPIs dashboard |
| `LeadsManagement.js` | Full leads management page |
| `LeadTable.js` | Sortable leads table |
| `LeadFilterBar.js` | Territory/status filters |
| `LeadCaptureDialog.js` | New lead modal |
| `LeadDetailTabs.js` | Lead detail container |
| `LeadOverview.js` | Profile summary / edit |
| `LeadNotes.js` | Notes list and add |
| `LeadAssignments.js` | Agent assignment |
| `FollowupList.js` | Scheduled follow-ups |
| `TaskList.js` | Task checklist |
| `ActivityTimeline.js` | Activity feed |
| `PipelineBoard.js` | Kanban opportunity board |
| `LeadAnalytics.js` | Funnel/source charts |
| `constants.js` | Territories, statuses, colors |
| `index.js` | Barrel exports |

### 4.2 AI Workspace / Enterprise (`components/leadedge360/enterprise/` — 13 files)

| File | Route |
|------|-------|
| `ExecutiveCommandCenter.tsx` | `/leadedge360` |
| `AICommandCenter.tsx` | `/leadedge360/command-center` |
| `AIInsightsPage.tsx` | `/leadedge360/insights` |
| `AIInsightsPanel.tsx` | Embedded widget |
| `AutomationHub.tsx` | `/leadedge360/automation` |
| `GeoLeadFinder.tsx` | `/leadedge360/geo-finder` |
| `TerritoryManagement.tsx` | `/leadedge360/territories` |
| `GrowthAuditEngine.tsx` | `/leadedge360/growth-engine` |
| `RevenueIntelligence.tsx` | `/leadedge360/revenue-intelligence` |
| `Conversations.tsx` | `/leadedge360/conversations` |
| `Reports.tsx` | `/leadedge360/reports` |
| `LeadEdgeBrand.tsx` | Sidebar branding |
| `enterprise-ui.tsx` | Shared executive UI primitives |
| `index.js` | Barrel exports |

**Data source:** `leadEdgeApi` → mock adapter by default (`NEXT_PUBLIC_USE_MOCK_API=true`).

---

## 5. RetailEdge360 Components

### `components/retailedge360/` (7 files)

| File | Purpose |
|------|---------|
| `RetailDashboard.js` | Main hub — KPIs, inventory, AI actions |
| `RetailAnalytics.js` | Charts and trends |
| `InventoryTable.js` | Product inventory table |
| `ProductCaptureDialog.js` | Add product modal |
| `ProductDetailDialog.js` | Product detail + AI repredict |
| `constants.js` | Categories, risk styles, currency |
| `index.js` | Barrel exports |

---

## 6. Service Layer (non-visual, API-facing)

| Path | Role |
|------|------|
| `src/lib/api.ts` | Axios client + `apiGet`/`apiPost`/etc. |
| `src/services/api/index.ts` | `leadEdgeApi` facade |
| `src/services/api/adapters/httpClient.ts` | HTTP adapter for enterprise modules |
| `src/services/api/adapters/mockClient.ts` | Mock data for enterprise |
| `src/hooks/useLeads.ts` | Leads React Query hook |

---

## 7. Architecture Notes

| Observation | Impact |
|-------------|--------|
| Dual UI libraries | `ui/` + `design-system/` coexist; inconsistent styling risk |
| Unified shell | Single `AppShell` + `nav-config` for all products |
| Empty `components/enterprise/` | Enterprise code lives under `leadedge360/enterprise/` |
| Legacy duplicates | `business-suite/ProductSwitcher` vs `suite/ProductSwitcher` |
| Backup artifacts | `.bak` files in `site/`, `business-suite/` — not active |

---

*See [FRONTEND_ROUTE_INVENTORY.md](./FRONTEND_ROUTE_INVENTORY.md) for route mapping.*
