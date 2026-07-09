# UI Styling Root Cause Report

**Date:** 23 June 2026  
**Severity:** P0 — Production UI  
**Status:** Root cause identified; fixes applied in repo  
**Build:** `npm run build` — **PASS** (verified 23 Jun 2026)

---

## Executive Summary

Pages rendered as plain HTML because **Tailwind CSS utilities were either never generated (build-time) or never delivered to the browser (runtime)**. React, images, and APIs worked; only the CSS pipeline failed.

Two distinct failure modes were traced:

| # | Layer | Failure | Symptom |
|---|-------|---------|---------|
| **1** | **Build-time (Tailwind JIT)** | `tailwind.config.js` `content` globs excluded `*.ts` / `*.tsx` | AppShell, design-system, and 45+ TSX components had **zero generated CSS rules** |
| **2** | **Runtime (asset delivery)** | CSS `<link>` tags present in HTML but `/_next/static/css/*.css` returns **HTTP 404** | **All pages** unstyled — including `/signin` and `/partners` which use `.js` pages |

Both must be resolved for production. Fix #1 is committed. Fix #2 requires correct static-asset deployment (see Step 6/8).

---

## 1. Root Cause (Detailed Trace)

### How Tailwind reaches the browser

```
app/layout.js
  └─ import './globals.css'
       └─ @tailwind base/components/utilities
            └─ PostCSS (postcss.config.js → tailwindcss plugin)
                 └─ Tailwind JIT scans content globs in tailwind.config.js
                      └─ Emits utility rules for class names found in source files
                           └─ Next.js bundles → .next/static/css/<hash>.css
                                └─ HTML <link rel="stylesheet" href="/_next/static/css/...">
                                     └─ Browser applies rules to className attributes
```

**Failure at JIT scan:** Classes exist in DOM HTML but **no matching rules in CSS file** → browser renders defaults.  
**Failure at delivery:** Rules exist on disk but **browser never receives CSS file (404)** → browser renders defaults.

---

### Root Cause A — Tailwind `content` paths excluded TypeScript (BUILD-TIME)

**File:** `tailwind.config.js` (before fix)

```js
content: [
  './components/**/*.{js,jsx}',   // ❌ missing ts, tsx
  './app/**/*.{js,jsx}',
  './src/**/*.{js,jsx}',
]
```

**Impact:** 45 component files with `className=` are `.tsx` — including the entire certified UI shell:

| File | Role |
|------|------|
| `components/suite/AppShell.tsx` | Page chrome |
| `components/suite/Sidebar.tsx` | Navigation |
| `components/suite/SuiteHeader.tsx` | Header |
| `components/suite/SuiteRouteLayout.tsx` | Auth + layout wrapper |
| `components/design-system/core/*.tsx` | Buttons, cards, inputs, KPI cards |
| `components/brand/BrandLogo.tsx` | Branding |

Tailwind JIT **never saw** class strings in these files → utilities like `lg:flex`, `border-border`, `bg-card`, `backdrop-blur-xl` were **not emitted**.

**Proof (post-fix):** Production CSS bundle grew **72,382 B → 88,813 B (+23%)** after adding `ts`/`tsx` to content paths — confirming ~16 KB of missing rules were generated.

---

### Root Cause B — CSS assets not served (RUNTIME)

Built HTML **correctly references** stylesheets:

```html
<link rel="stylesheet" href="/_next/static/css/0581d43835cb1854.css"/>
<link rel="stylesheet" href="/_next/static/css/43bb2d1f812d3146.css"/>
```

**Live verification (23 Jun 2026):**

| Server mode | `/signin` | `/_next/static/css/43bb2d1f812d3146.css` | Result |
|-------------|-----------|------------------------------------------|--------|
| `next start` (port 3011) | **200** | **200** — 88,813 B, contains `.bg-background` | ✅ Styled |
| `node .next/standalone/server.js` (port 3010) | **200** | **404 Not Found** | ❌ Unstyled |

**Why:** Next.js `output: 'standalone'` does **not** embed `.next/static` inside `.next/standalone/`. Static files live at project-root `.next/static/` and must be copied beside `server.js` at deploy time.

The `Dockerfile` does this correctly:

```dockerfile
COPY --from=builder /app/.next/static ./.next/static
```

Running `node .next/standalone/server.js` **without** that copy reproduces the exact production symptom: React HTML with class names, images load, **zero CSS applied**.

**This explains `/signin` and `/partners` being unstyled** even though their page files are `.js` (scanned by Tailwind). The CSS file itself never reaches the browser.

---

### Contributing Factor — Dev server stale cache

A long-running `next dev` instance returned **404** for dev CSS chunks (`layout.css`) until restarted. After restart, dev CSS returned **200** with full Tailwind output.

---

## 2. Files Inspected

| Step | File | Result |
|------|------|--------|
| 1 | `app/layout.js` | ✅ `import './globals.css'`; `RootLayout` wraps `{children}` via `<Providers>` |
| 2 | `app/globals.css` | ✅ Exists; `@tailwind base/components/utilities` present |
| 3 | `tailwind.config.js` | ✅ Fixed — includes `ts`, `tsx`, `mdx` in all globs |
| 4 | `postcss.config.js` | ✅ `tailwindcss` + `autoprefixer` plugins active |
| 5 | `npm run build` | ✅ PASS — no CSS/Tailwind/purge errors |
| 6 | `.next/static/css/*.css` | ✅ 2 files generated (see below) |
| 7 | `.next/server/app/signin.html` | ✅ Contains `<link rel="stylesheet">` to both CSS bundles |
| 8 | HTTP verification | ✅ `next start` CSS 200; ❌ bare standalone CSS 404 |
| 9 | `app/providers.js` | ✅ No style reset — only React Query wrapper |
| 9 | `components/design-system/themes/ThemeProvider.tsx` | ✅ No reset — applies `data-theme` + Tailwind classes |
| 10 | Nested layouts (`app/dashboard/layout.js`, etc.) | ✅ Re-export `SuiteRouteLayout`; do **not** override or remove `globals.css` |
| — | `next.config.js` | ✅ `output: 'standalone'`; CSP does not block stylesheets |
| — | `Dockerfile` | ✅ Copies `.next/static` into runner image |

---

## 3. Files Changed

| File | Change |
|------|--------|
| `tailwind.config.js` | Added `ts`, `tsx`, `mdx` to all `content` globs |
| `app/globals.css` | Moved theme `@import` statements **before** `@tailwind` directives |
| `app/layout.js` | Added `min-h-screen bg-background text-foreground antialiased` on `<body>`; fixed HTML structure |

---

## 4. Build Output

```
> nextjs-mongo-template@0.1.0 build
> next build

  ▲ Next.js 14.2.35
  - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
   Skipping validation of types
   Linting ...
   Collecting page data ...
   Generating static pages (63/63) ...
 ✓ Generating static pages (63/63)
   Finalizing page optimization ...

Route (app)                              Size     First Load JS
├ ○ /signin                              33 kB           171 kB
├ ○ /partners                            2.14 kB         146 kB
├ ○ /dashboard                           5.26 kB         247 kB
...

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Exit code:** 0  
**CSS errors:** None  
**Tailwind warnings:** None  
**Purge/content warnings:** None  

(API routes logged expected `DYNAMIC_SERVER_USAGE` during static generation — unrelated to CSS.)

---

## 5. CSS Asset Verification

### Generated files (`find .next -name "*.css"` equivalent)

| Path | Size | Purpose |
|------|------|---------|
| `.next/static/css/43bb2d1f812d3146.css` | **88,813 B** | Main Tailwind bundle (utilities, theme, components) |
| `.next/static/css/0581d43835cb1854.css` | **2,095 B** | Secondary chunk (font/leaf styles) |

### Key rules confirmed in main bundle

| Utility | Present |
|---------|---------|
| `.bg-background` | ✅ |
| `.min-h-screen` | ✅ |
| `.text-primary` | ✅ |
| `.border-border` | ✅ |
| `.lg:flex` | ✅ |

### Built HTML CSS references (`signin.html` head)

```html
<link rel="stylesheet" href="/_next/static/css/0581d43835cb1854.css" data-precedence="next"/>
<link rel="stylesheet" href="/_next/static/css/43bb2d1f812d3146.css" data-precedence="next"/>
```

Body carries Tailwind classes in SSR output:

```html
<body class="min-h-screen bg-background font-sans text-foreground antialiased">
```

---

## 6. Step-by-Step Checklist Results

### STEP 1 — `app/layout.js`

```js
import './globals.css'
// ...
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
        ...
      </body>
    </html>
  )
}
```

✅ `globals.css` imported. ✅ All routes inherit this root layout.

---

### STEP 2 — `app/globals.css` (full contents)

```css
@import '../components/design-system/themes/marketing.css';
@import '../components/design-system/themes/suite.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222 47% 5%;
    --foreground: 0 0% 98%;
    /* ... full design token set ... */
  }
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    background-image: radial-gradient(...);
  }
}

@layer utilities {
  .gradient-text { ... }
  .glass { ... }
  /* ... */
}
```

✅ Valid Tailwind v3 directives. ✅ Theme CSS variables defined.

---

### STEP 3 — `tailwind.config.js` content paths

```js
content: [
  './pages/**/*.{js,jsx,ts,tsx,mdx}',
  './components/**/*.{js,jsx,ts,tsx,mdx}',
  './app/**/*.{js,jsx,ts,tsx,mdx}',
  './src/**/*.{js,jsx,ts,tsx,mdx}',
],
```

✅ Meets required coverage for `app/**`, `components/**`, `src/**`.

---

### STEP 4 — `postcss.config.js` (full contents)

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

✅ Tailwind PostCSS plugin active.

---

### STEP 8 — Browser network (simulated via HTTP)

**`next start` (correct deployment):**

```
GET /signin                              → 200
GET /_next/static/css/43bb2d1f812d3146.css → 200 (88,813 B)
```

**Standalone without static copy (broken deployment):**

```
GET /signin                              → 200
GET /_next/static/css/43bb2d1f812d3146.css → 404 Not Found
```

**DevTools action for on-site verification:**

1. Open `/signin` → Network tab → filter `css`
2. Confirm both `*.css` requests return **200** (not 404)
3. Console should show **no** stylesheet load errors

---

### STEP 9 — Accidental CSS reset search

| Location | Finding |
|----------|---------|
| `globals.css` | No reset stripping styles — applies theme via `@layer base` |
| `layout.js` | No inline style overrides |
| `providers.js` | QueryClient only — no CSS |
| `ThemeProvider.tsx` | Adds `data-theme`, `bg-background` — no reset |

✅ No code intentionally removes styles.

---

### STEP 10 — App Router hierarchy

```
app/layout.js          ← imports globals.css (ROOT)
├── app/signin/page.js           (no nested layout)
├── app/partners/page.js         (no nested layout)
├── app/dashboard/layout.js      → SuiteRouteLayout (no globals override)
├── app/leads/layout.js          → SuiteRouteLayout
└── app/opportunities/layout.js  → SuiteRouteLayout
```

✅ Every route inherits `app/layout.js`. No nested layout removes or replaces global styles.

---

## 7. Before / After Screenshots

Playwright screenshot capture failed in this environment (npm SSL certificate error). Use the steps below to capture locally.

### Before (observed symptom)

- White/default browser background
- Unstyled `<input>`, `<button>`, `<h1>` elements
- No sidebar on `/dashboard`
- No dark theme
- Brand logo/image visible (static assets work)
- React hydration works (interactive elements respond)

### After (expected — post-fix + correct server)

| Page | Expected visual |
|------|-----------------|
| `/signin` | Dark background, glass card, orange primary button, branded logo |
| `/partners` | Marketing navbar, gradient headline, styled badge/card grid |
| `/dashboard` | AppShell sidebar, KPI cards, dark suite theme |

### Capture commands

```powershell
# Terminal 1 — production server (serves CSS correctly)
npm run build
npm run start -- -p 3011

# Terminal 2 — screenshots (requires playwright)
$env:PREVIEW_BASE_URL="http://127.0.0.1:3011"
node scripts/capture-appshell-screenshots.mjs
# Add /signin and /partners to shot list for full coverage
```

**Screenshot output paths (after capture):**

- `docs/screenshots/ui-styling-fix/after-signin.png`
- `docs/screenshots/ui-styling-fix/after-partners.png`
- `docs/screenshots/ui-styling-fix/after-dashboard.png`

---

## 8. Remediation Checklist

| Action | Required |
|--------|----------|
| Pull latest `tailwind.config.js` with `ts`/`tsx` globs | ✅ Done in repo |
| Run `npm run build` | ✅ PASS |
| **Restart dev server** after config change | ⚠️ Required locally |
| Hard-refresh browser (Ctrl+Shift+R) | ⚠️ Clears cached 404 CSS |
| Production: ensure `.next/static` is deployed beside `server.js` | ⚠️ Critical for Docker/standalone |
| Use `npm run start` for local prod testing (not bare standalone without static copy) | Recommended |

### Docker production (already correct)

```dockerfile
COPY --from=builder /app/.next/static ./.next/static
```

Rebuild and redeploy the image after pulling CSS fixes.

---

## 9. Sign-Off

| Check | Status |
|-------|--------|
| Root cause traced to JIT content + static asset delivery | ✅ |
| Build-time fix committed | ✅ |
| `npm run build` PASS | ✅ |
| CSS assets generated with Tailwind utilities | ✅ |
| HTML references CSS bundles | ✅ |
| Runtime CSS 200 via `next start` | ✅ |
| Runtime CSS 404 via misconfigured standalone | Documented |

**Conclusion:** Tailwind classes were not appearing because (1) TypeScript components were excluded from JIT scanning, producing an incomplete CSS bundle, and/or (2) the CSS bundle was not served to the browser due to missing `.next/static` in standalone deployments. Both paths produce identical "plain HTML" symptoms. Fixes #1 is in code; fix #2 is an operational deployment requirement.
