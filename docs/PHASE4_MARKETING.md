# Phase 4 — Marketing Website Redesign

| Field | Value |
|-------|-------|
| Status | Complete — awaiting approval |
| Scope | Frontend only — marketing surface |
| Authority | `docs/SOURCE_OF_TRUTH.md` §4.1, `docs/THEME_MIGRATION_PLAN.md` |

---

## Summary

Phase 4 applies the **marketing design token theme** to the public website (`www` surface). All marketing routes that use `SiteShell` now render inside `ThemeProvider theme="marketing"` with brochure-aligned colors, light backgrounds, royal blue primary actions, and orange accent CTAs.

**No backend, API, or route structure changes.**

---

## Deliverables

### 1. Marketing theme shell

| File | Change |
|------|--------|
| `components/site/SiteShell.jsx` | Wraps children in `ThemeProvider theme="marketing"` |
| `components/design-system/themes/marketing.css` | Marketing-scoped `.glass`, `.gradient-text`, `.glow-orange` overrides |

### 2. Site chrome

| File | Change |
|------|--------|
| `components/site/Navbar.jsx` | Token-based logo, foreground text, orange accent CTA |
| `components/site/Footer.jsx` | Navy footer via `--brand-navy`, accent brand mark |

### 3. Homepage GIX sections

All sections under `components/gix/sections/` migrated from hardcoded `slate-*` / `bg-white` to semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `text-primary`, `text-accent`).

| Section | Notes |
|---------|-------|
| `HeroSection` | Light hero, accent primary CTA |
| `GrowthAuditSection` | Linked CTA → `/growth-audit` |
| `WhyGrowthFailsSection` | Card tokens |
| `IndustriesSection` | `bg-secondary/60` band |
| `GrowthEcosystemSection` | Card tokens |
| `GrowthJourneySection` | Step cards on `bg-card` |
| `LeadEdge360Section` | Replaced dark glass with bordered card |
| `RetailEdge360Section` | Accent label, token typography |
| `FinalCTASection` | Accent CTA |

### 4. Layout

| File | Change |
|------|--------|
| `components/gix/layout/GIXContainer.jsx` | Subtle primary/electric/accent ambient blurs (no neon) |

---

## Routes affected

Any page importing `SiteShell` automatically receives the marketing theme:

- `/` (homepage)
- `/about`, `/solutions`, `/services`, `/industries`, `/products`
- `/blog`, `/partners`, `/contact`, `/download`
- `/privacy`, `/terms`

**Not affected** (suite or auth surfaces):

- `/leadedge360/*`, `/proposals`, `/invoices`, `/revenue`, `/campaigns`, `/onboarding`, `/growth-audit` (suite layout)
- `/signin`, `/splash`, `/product-selection`

---

## Brand alignment

| Token | Marketing usage |
|-------|-------------------|
| Royal Blue (`--primary`) | Nav links, headings, product CTAs |
| Orange (`--accent`) | Growth Audit CTAs, conversion buttons |
| Navy (`--brand-navy`) | Footer background |
| Light Gray (`--background`) | Page backgrounds |

---

## Verification

```bash
npm run build   # PASS
```

Manual checks:

1. Open `/` — light background, navy footer, orange “Get Free Growth Audit” CTA
2. Navigate About / Solutions — consistent marketing theme (no dark body gradient)
3. Open `/leadedge360` — suite dark theme unchanged (separate `ThemeProvider theme="suite"`)

---

## Phase gate checklist

- [x] Aligns with §2 Constraints (frontend only)
- [x] Colors from `marketing.css` / `tokens.json`
- [x] No frozen path edits
- [x] Real links and routes (no mocks)
- [x] Build passes
- [ ] Screenshots (capture locally after `npm run dev`)
- [ ] Git commit (on request)

---

## Next phase

**Phase 5 — Executive Dashboard V2** (`/dashboard` route with L2 design-system components).

Approve Phase 4 to proceed.
