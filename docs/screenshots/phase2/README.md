# Phase 2 Screenshots

Visual artifacts for the Enterprise Design System foundation.

## Live capture (recommended)

```bash
yarn dev
```

| Screenshot | URL |
|------------|-----|
| Marketing Theme | http://localhost:3000/design-system-preview?view=marketing |
| Business Suite Theme | http://localhost:3000/design-system-preview?view=suite |
| Component Gallery | http://localhost:3000/design-system-preview?view=gallery |
| Mobile Responsive | http://localhost:3000/design-system-preview?view=mobile |

Capture at 1440×900 (desktop) and 390×844 (mobile) and save as PNG in this folder.

## Static previews

| File | Description |
|------|-------------|
| `01-marketing-theme-preview.svg` | Marketing theme layout mock |
| `02-suite-theme-preview.svg` | Business Suite dark theme mock |
| `03-component-gallery.svg` | Core component inventory visual |
| `04-mobile-responsive-preview.svg` | 390px mobile viewport mock |

These SVGs use canonical token colors from `src/design-tokens/tokens.json`.

## Phase 2 scope

- Foundations and themes only
- No product page redesigns
- Preview route: `/design-system-preview` (internal, `noindex`)
