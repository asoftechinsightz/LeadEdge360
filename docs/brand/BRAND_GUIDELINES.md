# AsoftechInsightz Brand Guidelines

**Version:** 1.0 · **Date:** June 2026  
**Parent:** AsoftechInsightz · **Products:** LeadEdge360 · RetailEdge360

---

## 1. Brand architecture

| Level | Brand | Usage |
|-------|-------|-------|
| **L1 — Master** | AsoftechInsightz | Website, proposals, tenders, LinkedIn, corporate |
| **L2 — Product** | LeadEdge360 · Powered by AsoftechInsightz | CRM, leads, campaigns, growth |
| **L3 — Product** | RetailEdge360 · Powered by AsoftechInsightz | Retail, inventory, POS, analytics |

All product logos share the **circular swoosh** structure from the parent AI monogram.

---

## 2. Logo assets (in repo)

| Asset | Path |
|-------|------|
| Master logo | `public/images/brand/asoftechinsightz-logo.png` |
| LeadEdge360 | `public/images/brand/leadedge360-logo.png` |
| RetailEdge360 | `public/images/brand/retailedge360-logo.png` |

### React components

```tsx
import { BrandLogo, LeadEdgeBrandLogo, RetailEdgeBrandLogo, SuiteBrandLogo } from '@/components/brand/BrandLogo';

// Auto product by route
<SuiteBrandLogo />

// Explicit
<LeadEdgeBrandLogo showPoweredBy />
<RetailEdgeBrandLogo />
<BrandLogo variant="sidebar" showText />
```

---

## 3. Color palette

### Master (enterprise)

| Name | Hex | CSS variable | Role |
|------|-----|--------------|------|
| Primary Blue | `#0066FF` | `--brand-royal` | Actions, links |
| Deep Navy | `#0A1F44` | `--brand-navy` | Headers, sidebar |
| Cyan | `#00C6FF` | `--brand-electric` | Highlights, Insightz accent |
| White | `#FFFFFF` | — | Text on dark |
| Light Gray | `#F5F7FA` | — | Marketing backgrounds |

### LeadEdge360 accents

| Name | Hex | CSS |
|------|-----|-----|
| Growth Green | `#22C55E` | `--brand-growth` / `data-product="leadedge360"` |

### RetailEdge360 accents

| Name | Hex | CSS |
|------|-----|-----|
| Retail Orange | `#FF7A00` | `--brand-orange` / `data-product="retailedge360"` |

---

## 4. Typography

| Role | Font | Weight |
|------|------|--------|
| UI / body | Inter | 400–600 |
| Display / headings | Space Grotesk | 600–700 |

Scale: 12px labels · 14px body · 16–24px section titles · 32–48px hero.

---

## 5. Taglines

| Brand | Tagline |
|-------|---------|
| **AsoftechInsightz** | End-to-End Digital Transformation Partner |
| **Promise** | Innovate • Integrate • Deliver • Satisfy |
| **LeadEdge360** | Capture. Engage. Convert. |
| **RetailEdge360** | Smart Retail. Simplified Growth. |

---

## 6. SaaS dashboard theme

- **Header:** Dark navy → blue gradient, glass blur (`brand-header-glass`)
- **Sidebar:** Minimal enterprise nav; product logo via `SuiteBrandLogo`
- **Cards:** 16px radius, glassmorphism (`brand-glass-card`)
- **Product accent:** `data-product` on suite layout switches green (LeadEdge) / orange (Retail)

---

## 7. Logo usage rules

**Do**

- Use official PNG assets from `public/images/brand/`
- Keep “Powered by AsoftechInsightz” on product lockups
- Maintain clear space equal to the swoosh height around logos
- Use master logo on white or navy backgrounds

**Don’t**

- Stretch, rotate, or recolor logo elements
- Replace product icons with generic clip art
- Remove “Powered by” from product materials
- Use low-contrast backgrounds that hide the swoosh

---

## 8. Marketing deliverables checklist

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Master brand logo | Done | PNG in repo |
| LeadEdge360 logo | Done | PNG in repo |
| RetailEdge360 logo | Done | PNG in repo |
| Brand guidelines | Done | This document |
| Color palette | Done | `lib/brand.js` + `suite.css` |
| Typography guide | Done | §4 above |
| Website theme | Partial | `marketing.css` |
| SaaS dashboard theme | Done | `suite.css` + `brand-products.css` |
| Mobile app kit | Planned | Reuse `ProductBrandLogo` + accent tokens |
| Social / email kit | Planned | Export logos at 1200×628, 400×400 icon |
| Brand guidelines PDF | Export | Print this doc or use design tool |

---

## 9. Code reference

- Tokens: `lib/brand.js`
- Design tokens: `src/design-tokens/tokens.json`
- Themes: `components/design-system/themes/`
- Product routing: `getProductBrandFromPath()` in `lib/brand.js`

---

*Design language: Microsoft · Salesforce · ServiceNow · Datadog inspired — enterprise, trusted, innovative.*
