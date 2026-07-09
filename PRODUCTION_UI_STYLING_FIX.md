# Production UI Styling Failure — Root Cause & Fix

**Date:** 23 June 2026  
**Status:** **RESOLVED**  
**Build:** `npm run build` — **PASS**

---

## Symptom

Pages rendered as plain HTML with browser default styling. React components mounted correctly, but Tailwind/theme classes had no effect — AppShell sidebar, dark theme, cards, and layout utilities were missing.

---

## Root Cause

### Primary: Tailwind `content` paths excluded TypeScript files

`tailwind.config.js` only scanned `*.{js,jsx}`:

```js
// BEFORE (broken)
content: [
  './components/**/*.{js,jsx}',
  './app/**/*.{js,jsx}',
  ...
]
```

**66+ UI files are `.tsx` / `.ts`**, including the entire certified shell:

| Critical TSX (not scanned) | Role |
|---------------------------|------|
| `components/suite/AppShell.tsx` | Page chrome |
| `components/suite/Sidebar.tsx` | Navigation |
| `components/suite/SuiteHeader.tsx` | Header / search |
| `components/suite/SuiteRouteLayout.tsx` | Auth + layout wrapper |
| `components/design-system/core/*.tsx` | Buttons, cards, inputs |
| `components/brand/BrandLogo.tsx` | Branding |

Tailwind JIT never generated utilities used only in those files (`flex`, `min-h-screen`, `bg-background`, `border-border`, `lg:flex`, etc.). Suite pages depend almost entirely on TSX for layout → **unstyled shell**.

**Evidence:** Production CSS grew **72,382 → 88,813 bytes (+23%)** after adding `ts`/`tsx` to content paths, confirming missing rules were generated.

### Secondary: `@import` order in `globals.css`

Theme imports were placed **after** `@tailwind` directives. PostCSS can hoist them, but this violates Tailwind/CSS spec (`@import` must precede other rules) and can break processing in some pipelines.

### Tertiary: Stale dev server (operational)

A running dev instance on port 3007 returned **404** for `/_next/static/css/app/layout.css` until restarted. Fresh server on 3008 returned **200** with **116 KB** CSS.

---

## Investigation Checklist

| Check | Result |
|-------|--------|
| `app/layout.js` imports `globals.css` | ✅ Line 1 |
| `globals.css` has `@tailwind` directives | ✅ (reordered) |
| `tailwind.config.js` content paths | ❌ **Fixed** — added `ts`, `tsx`, `mdx` |
| `postcss.config.js` Tailwind plugin | ✅ |
| `.next/static/css/*.css` generated | ✅ 88,813 bytes post-fix |
| Browser network CSS load | ✅ 200 on fresh dev server |

---

## Fixes Applied

### 1. `tailwind.config.js`

```js
content: [
  './pages/**/*.{js,jsx,ts,tsx,mdx}',
  './components/**/*.{js,jsx,ts,tsx,mdx}',
  './app/**/*.{js,jsx,ts,tsx,mdx}',
  './src/**/*.{js,jsx,ts,tsx,mdx}',
],
```

### 2. `app/globals.css`

Moved theme `@import` statements **before** `@tailwind base/components/utilities`.

### 3. `app/layout.js`

- Fixed malformed `</body>` / `</html>` indentation
- Added `min-h-screen bg-background text-foreground antialiased` on `<body>` as baseline (from `@layer base` + explicit utilities)
- Added `suppressHydrationWarning` on `<html>`

---

## Files Changed

| File | Change |
|------|--------|
| `tailwind.config.js` | Include `ts`, `tsx`, `mdx` in content globs |
| `app/globals.css` | `@import` before `@tailwind` |
| `app/layout.js` | Body baseline classes + HTML fix |

---

## Before / After

| Metric | Before | After |
|--------|--------|-------|
| Tailwind content coverage | `.js` / `.jsx` only | `.js` / `.jsx` / `.ts` / `.tsx` / `.mdx` |
| Production CSS bundle | 72,382 B | 88,813 B (+23%) |
| Dev CSS (`layout.css`) | 404 on stale server | 200, 116,554 B |
| AppShell layout classes | Missing | Present |
| Theme variables (`data-theme`) | Partial | Full |
| `npm run build` | PASS | PASS |

### Visual expectation

| Page | Before | After |
|------|--------|-------|
| `/dashboard` | Unstyled HTML, no sidebar | Dark theme + AppShell sidebar + ExecutiveDashboard KPIs |
| `/opportunities` | Plain pipeline list | Styled KPI cards + kanban board in AppShell |
| `/revenue` | Unstyled tables/charts | Themed cards + charts in AppShell |

> Restart dev server after pulling: `npm run dev -- --port 3007`  
> Hard-refresh browser (Ctrl+Shift+R) to clear cached 404 CSS responses.

---

## Verification Commands

```powershell
# Production build
npm run build

# Dev server (restart required after tailwind.config change)
npm run dev -- --port 3008

# Confirm CSS loads (expect status 200, size > 80KB)
# Open /dashboard → DevTools → Network → filter "layout.css"
```

---

## Production Deployment Note

`Dockerfile` already copies `.next/static` correctly for standalone mode:

```dockerfile
COPY --from=builder /app/.next/static ./.next/static
```

No Docker changes required. Rebuild image after this fix.

---

## Sign-Off

**Production UI styling: FIXED.** Root cause was Tailwind not scanning TypeScript components that power AppShell and the design system.
