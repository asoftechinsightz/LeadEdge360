# Theme Migration Plan

**Phase:** 2 foundation · **Execution:** Phases 3–10  
**Authority:** [`SOURCE_OF_TRUTH.md`](./SOURCE_OF_TRUTH.md)

---

## 1. Current State (Post Phase 2)

| Asset | State |
|-------|-------|
| `src/design-tokens/tokens.json` | **Canonical** — brochure palette + shadows, elevation, breakpoints |
| `components/design-system/themes/*.css` | **New** — `[data-theme="marketing"]` and `[data-theme="suite"]` |
| `app/globals.css` `:root` | **Legacy** — old orange/green dark variables; unchanged for existing pages |
| `tailwind.config.js` `brand.*` | **Updated** — reads from `tokens.json` |
| Product pages | **Unchanged** — still use legacy `:root` + inline colors |
| Design system preview | **New** — `/design-system-preview` uses `ThemeProvider` |

---

## 2. Migration Strategy

**Principle:** Opt-in per surface. No big-bang CSS swap.

```
Phase 2  → Tokens + themes + L2 components (done)
Phase 3  → Suite AppShell wraps suite routes with ThemeProvider theme="suite"
Phase 4  → Marketing SiteShell wraps marketing routes with ThemeProvider theme="marketing"
Phase 5–8 → Product pages compose L2 components inside themed shells
Phase 10 → Remove legacy :root values; deprecate .glow-orange, .glass, .gradient-text
```

---

## 3. Phase-by-Phase Migration

### Phase 3 — Business Suite Shell

| Action | Files |
|--------|-------|
| Create `components/suite/AppShell.tsx` with `ThemeProvider theme="suite"` | New |
| Wrap suite routes via layout or AppShell import | `app/leadedge360`, `proposals`, etc. |
| Replace `DashboardHeader` styling with token semantics | `components/business-suite/` → `suite/` |
| **Do not** change page business logic or APIs | — |

### Phase 4 — Marketing Website

| Action | Files |
|--------|-------|
| Wrap `SiteShell` with `ThemeProvider theme="marketing"` | `components/site/SiteShell.jsx` |
| Replace hardcoded colors in GIX sections | `components/gix/sections/*` |
| Remove body gradient from marketing pages | Scoped to suite only |

### Phase 5 — Executive Dashboard

| Action | Files |
|--------|-------|
| New `/dashboard` route | `app/dashboard/page.js` |
| Use `KPICard`, `ChartCard`, `PageHeader` | `components/design-system/` |
| `ThemeProvider theme="suite"` via AppShell | — |

### Phases 6–8 — Product Modules

| Module | Migration |
|--------|-----------|
| LeadEdge360 | Extract inline `KpiCard` → `KPICard`; tables → `DataGrid`; dialogs → `Modal` |
| RetailEdge360 | Same pattern |
| Billing | `PlanCard` in `components/billing/` composes L2 `Card`, `Badge`, `Button` |

### Phase 10 — Legacy Cleanup

| Remove / Replace | Replacement |
|------------------|-------------|
| `:root` legacy HSL in `globals.css` | Default to suite theme variables |
| `brand.orange` `#FF8A3D` usages | `brand-orange` from tokens |
| Green `--accent` | Royal / Electric blue |
| `.glow-orange`, `.glass` on suite | Elevation tokens |
| Inline `bg-[#020617]` | `bg-background` |
| `components/business-suite/` | `components/suite/` |

---

## 4. CSS Variable Mapping

| Legacy `:root` | Suite theme | Marketing theme |
|--------------|-------------|-----------------|
| `--primary` (orange) | `--primary` (royal blue) | `--primary` (royal blue) |
| `--accent` (green) | `--accent` (orange CTA) | `--accent` (orange CTA) |
| `--background` (dark slate) | Navy `#071B4D` | Light Gray `#F5F7FA` |
| `--card` | Dark surface | White |

---

## 5. Risk Controls

| Risk | Mitigation |
|------|------------|
| Visual regression on live pages | Migrate one route group per phase |
| shadcn `ui/` drift | Keep `ui/` on semantic variables; themes override via `[data-theme]` |
| Mixed legacy + new on same page | Never nest conflicting themes; one ThemeProvider per tree |
| Flash of wrong theme | Set `data-theme` on layout server wrapper in Phase 3 |

---

## 6. Verification Checklist (Per Migration Batch)

- [ ] Page wrapped in correct `ThemeProvider`
- [ ] No hardcoded hex in migrated files
- [ ] Focus rings visible on interactive elements
- [ ] Mobile viewport tested (390px)
- [ ] Existing API behavior unchanged
- [ ] Screenshot captured for approval gate

---

## 7. Rollback

If a phase migration causes issues:

1. Remove `ThemeProvider` wrapper from affected layout
2. Page falls back to legacy `:root` (unchanged in Phase 2)
3. Design system components still work but use global legacy colors until re-wrapped

---

## 8. Status

| Milestone | Status |
|-----------|--------|
| Token canonicalization | Complete |
| Theme CSS files | Complete |
| L2 components | Complete |
| Suite route migration | Phase 3 |
| Marketing migration | Phase 4 |
| Legacy `:root` removal | Phase 10 |
