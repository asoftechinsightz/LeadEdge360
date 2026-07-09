# AsoftechInsightz Enterprise Design System — Guide

**Phase:** 2  
**Authority:** [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md) · [`COMPONENT_GOVERNANCE.md`](./COMPONENT_GOVERNANCE.md) · `src/design-tokens/tokens.json`

---

## 1. Overview

Phase 2 establishes the **Enterprise Design System foundation** for AsoftechInsightz V2. No product pages were redesigned. All new work lives under `components/design-system/`.

| Deliverable | Location |
|-------------|----------|
| Design tokens (extended) | `src/design-tokens/tokens.json` |
| Foundations | `components/design-system/foundations/` |
| Themes | `components/design-system/themes/` |
| Core components | `components/design-system/core/` |
| Live preview | `/design-system-preview?view=marketing\|suite\|gallery\|mobile` |
| Screenshots | `docs/screenshots/phase2/` |

---

## 2. Design Principles

1. **Token-driven** — All colors, spacing, radius, shadows from `tokens.json`
2. **Two surfaces** — Marketing (light-leaning) and Suite (enterprise dark)
3. **Layered architecture** — L1 shadcn `ui/` → L2 `design-system/` → L3 shell (Phase 3) → L4 products (Phases 6–8)
4. **No product logic** — Generic components only (`KPICard`, not `LeadCard`)
5. **Mobile-ready** — 44px touch targets, responsive grids, drawer on mobile
6. **Accessible** — Focus rings, `aria-*`, `sr-only`, semantic tables

---

## 3. Themes

### Marketing (`data-theme="marketing"`)

- **Domain:** `asoftechinsightz.com` (marketing website)
- **Background:** Light Gray `#F5F7FA`
- **Text:** Navy `#071B4D`
- **Primary actions:** Royal Blue `#0D47A1`
- **CTAs:** Orange `#FF7A00`
- **CSS:** `components/design-system/themes/marketing.css`

```tsx
import { ThemeProvider } from '@/components/design-system';

<ThemeProvider theme="marketing">
  {children}
</ThemeProvider>
```

### Business Suite (`data-theme="suite"`)

- **Domain:** `app.asoftechinsightz.com` (business suite) · API: `api.asoftechinsightz.com`
- **Background:** Navy `#071B4D`
- **Surfaces:** Dark card `#0B1220` equivalent via `--card`
- **Accent:** Orange `#FF7A00`
- **CSS:** `components/design-system/themes/suite.css`

```tsx
<ThemeProvider theme="suite">
  {children}
</ThemeProvider>
```

**Note:** Global `:root` in `app/globals.css` remains **legacy** for existing pages until migration (see `THEME_MIGRATION_PLAN.md`).

---

## 4. Foundations

| Foundation | File | Token key |
|------------|------|-----------|
| Typography | `foundations/typography.ts` | `typography` |
| Spacing | `foundations/spacing.ts` | `spacing` |
| Border radius | `foundations/radius.ts` | `radius` |
| Shadows | `foundations/shadows.ts` | `shadows` |
| Elevation | `foundations/elevation.ts` | `elevation` |
| Animation | `foundations/animation.ts` | `animation` |
| Breakpoints | `foundations/breakpoints.ts` | `breakpoints` |
| Focus | `foundations/focus.ts` | `focus` |
| Accessibility | `foundations/accessibility.ts` | `accessibility` |

Import collectively:

```ts
import { typography, spacing, shadows } from '@/components/design-system/foundations';
```

---

## 5. Core Components

Import from `@/components/design-system`:

| Category | Components |
|----------|------------|
| Actions | `Button` (variants: primary, accent, secondary, outline, ghost, destructive, link) |
| Layout | `Card`, `PageHeader`, `SectionHeader` |
| Metrics | `KPICard`, `MetricCard`, `StatCard` |
| Forms | `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Toggle` |
| Navigation | `Tabs` |
| Data | `Table`, `DataGrid` |
| Feedback | `Badge`, `EmptyState`, `LoadingState`, `LoadingSpinner` |
| Overlays | `Modal`, `Drawer`, `Tooltip`, `Dropdown` |

See [`COMPONENT_LIBRARY.md`](./COMPONENT_LIBRARY.md) for props and examples.

---

## 6. Usage Rules

### Do

- Wrap new V2 UI in `ThemeProvider`
- Use semantic Tailwind tokens (`bg-background`, `text-primary`, `border-border`)
- Use `cn()` from `@/lib/utils` for class merging
- Compose product UIs from L2 components in Phase 6+

### Do not

- Hardcode hex colors in components or pages
- Add product-specific components to `design-system/`
- Modify `components/ui/` except via shadcn CLI
- Change existing product page layouts in Phase 2

---

## 7. Tailwind Integration

`tailwind.config.js` reads brand colors from `tokens.json`:

- `bg-brand-navy`, `text-brand-orange`, `bg-brand-royal`, etc.
- `ds-*` alias colors for explicit brand usage

Theme CSS variables apply when `[data-theme]` is set on an ancestor.

---

## 8. Preview & Screenshots

**Live preview (recommended):**

```bash
yarn dev
# Open:
# http://localhost:3000/design-system-preview?view=marketing
# http://localhost:3000/design-system-preview?view=suite
# http://localhost:3000/design-system-preview?view=gallery
# http://localhost:3000/design-system-preview?view=mobile
```

**Static HTML previews:** `docs/screenshots/phase2/*.html` (for offline review)

---

## 9. Phase 3 Handoff

Phase 3 will build `components/suite/` (AppShell) using:

- `ThemeProvider theme="suite"`
- `PageHeader`, `KPICard`, `DataGrid` from this design system
- Sidebar patterns from shadcn `ui/sidebar.jsx`

**Awaiting approval before Phase 3.**
