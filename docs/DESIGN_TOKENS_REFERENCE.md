# Design Tokens Reference

**Canonical file:** `src/design-tokens/tokens.json`  
**Import:** `import tokens, { colors } from '@/src/design-tokens'`

---

## Brand Colors

| Token | Hex | CSS variable (themed) | Tailwind |
|-------|-----|----------------------|----------|
| navy | `#071B4D` | `--brand-navy` | `bg-brand-navy` |
| royalBlue | `#0D47A1` | `--primary` (themed) | `bg-brand-royal`, `bg-ds-royal` |
| electricBlue | `#1976D2` | `--ring`, charts | `bg-brand-electric`, `bg-ds-electric` |
| orange | `#FF7A00` | `--accent` (themed) | `bg-brand-orange`, `bg-ds-orange` |
| white | `#FFFFFF` | `--foreground` (suite) | `bg-brand-white` |
| lightGray | `#F5F7FA` | `--background` (marketing) | `bg-brand-gray` |

### Legacy (do not use in new code)

| Hex | Was used for |
|-----|--------------|
| `#FF8A3D` | Old primary orange |
| `#22C55E` | Old green accent |
| `#070B14` | Old navy |

---

## Typography

| Token | Value |
|-------|-------|
| `typography.fontFamily.sans` | Inter |
| `typography.fontFamily.display` | Space Grotesk |
| `typography.scale.xs` → `6xl` | 0.75rem → 3.75rem |
| `typography.weight.normal` → `bold` | 400 → 700 |

---

## Spacing

| Token | Value |
|-------|-------|
| `spacing.unit` | 4 (px base grid) |
| `spacing.scale.1` | 0.25rem (4px) |
| `spacing.scale.4` | 1rem (16px) |
| `spacing.layout.pagePaddingX` | 1.5rem |
| `spacing.layout.pagePaddingY` | 2rem |
| `spacing.layout.sectionGap` | 4rem |
| `spacing.layout.cardPadding` | 1.5rem |
| `spacing.layout.sidebarWidth` | 16rem |
| `spacing.layout.headerHeight` | 4rem |

---

## Border Radius

| Token | Value |
|-------|-------|
| `radius.sm` | 0.375rem |
| `radius.md` | 0.5rem |
| `radius.lg` | 0.75rem |
| `radius.xl` | 1rem |
| `radius.default` | 0.85rem |
| `radius.full` | 9999px |

---

## Shadows

| Token | Value |
|-------|-------|
| `shadows.xs` | Subtle 1px |
| `shadows.sm` | Card default |
| `shadows.md` | Raised card |
| `shadows.lg` | Dropdown / popover |
| `shadows.xl` | Modal |
| `shadows.focus` | Focus ring glow (electric blue) |

---

## Elevation

| Level | Shadow | z-index |
|-------|--------|---------|
| 0 | none | 0 |
| 1 | sm | 10 |
| 2 | md | 20 |
| 3 | lg | 30 |
| 4 | xl | 40 |

Used by `Card` component via `elevationLevel` prop.

---

## Animation

| Token | Value |
|-------|-------|
| `animation.duration.fast` | 150ms |
| `animation.duration.normal` | 250ms |
| `animation.duration.slow` | 400ms |
| `animation.easing.default` | cubic-bezier(0.4, 0, 0.2, 1) |

Respect `prefers-reduced-motion: reduce` in marketing animations.

---

## Breakpoints

| Token | Width |
|-------|-------|
| `breakpoints.sm` | 640px |
| `breakpoints.md` | 768px |
| `breakpoints.lg` | 1024px |
| `breakpoints.xl` | 1280px |
| `breakpoints.2xl` | 1400px |

Aligns with Tailwind `screens` and `container.2xl`.

---

## Focus

| Token | Value |
|-------|-------|
| `focus.ringWidth` | 3px |
| `focus.ringOffset` | 2px |
| `focus.ringColor` | electricBlue |

Applied in L2 components as `focus-visible:ring-[3px] focus-visible:ring-ring`.

---

## Accessibility

| Token | Value |
|-------|-------|
| `accessibility.minTouchTarget` | 44px |
| `accessibility.minContrastRatio` | 4.5:1 |
| `accessibility.reducedMotion` | prefers-reduced-motion: reduce |

---

## Theme Semantic Variables

Applied via `[data-theme]` (see `themes/marketing.css`, `themes/suite.css`):

| Variable | Purpose |
|----------|---------|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` | Card surface |
| `--primary` | Primary actions |
| `--accent` | CTA / highlights |
| `--muted` | Subtle backgrounds |
| `--border` | Borders |
| `--ring` | Focus ring color |
| `--chart-1` … `--chart-5` | Chart series |

---

## Programmatic Access

```js
import tokens, { colors, themes } from '@/src/design-tokens';

colors.navy;        // #071B4D
colors.orange;      // #FF7A00
themes.marketing;   // theme config object
```

```js
import { spacing, shadows, breakpoints } from '@/components/design-system/foundations';
```

---

## Change Process

1. Edit `src/design-tokens/tokens.json` only
2. Update `themes/*.css` HSL values if semantic colors change
3. Run design system preview to verify
4. Update this reference doc
5. Do **not** duplicate values in `tailwind.config.js` — use `require('./src/design-tokens/tokens.json')`
