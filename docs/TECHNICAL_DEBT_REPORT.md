# Technical Debt Report — AsoftechInsightz v1.2.0

**Generated:** June 2026  
**Scope:** Full repository static analysis (read-only)  
**Action taken:** None — no files deleted or modified  
**Method:** Import-graph tracing, dependency usage scan, cross-file pattern comparison, API/doc parity review

---

## Executive Summary

| Category | Count | Severity |
|----------|-------|----------|
| Unused files (never imported / orphaned) | **42** | High |
| Unused npm dependencies | **11** | High |
| Duplicate UI patterns / constants | **12** | Medium |
| Dead imports & unreachable symbols | **8** | Low |
| Backup / temp files (`*.bak`, `*~`, etc.) | **0** | — |
| Documented-but-unimplemented API paths | **3** | Medium |
| Runtime collections with no write path | **2** | Medium |
| Missing static assets (broken UI links) | **2** | High |
| Orphaned test / agent artifacts | **3** | Low |

**Headline finding:** ~**75% of shadcn/ui components** (36 of 48) are installed but never reached from application code. The bundle still pays the cost of maintaining them in the repo, and several heavy dependencies (`axios`, `lodash`, `@tanstack/react-table`, `swr`, `dayjs`, `date-fns`, `zod`) are listed in `package.json` but never imported.

---

## 1. Unused Files

Files that exist in the repo but are **not imported or executed** by the running Next.js application.

### 1.1 Application code — never wired

| File | Purpose (intended) | Why unused |
|------|-------------------|------------|
| `app/providers.js` | TanStack Query `QueryClientProvider` wrapper | Not imported in `app/layout.js` |
| `lib/constants/testIds/index.js` | Central `data-testid` registry for E2E | Zero imports across codebase |
| `lib/constants/testIds/auth.js` | Auth test IDs (`LOGIN`, `REGISTER`, `LOGOUT`) | Never referenced in JSX |
| `lib/constants/testIds/home.js` | Home test IDs (`HOME.emergentLink`) | Never referenced in JSX |
| `hooks/use-toast.js` | shadcn toast state hook | Only consumed by unused `toaster.jsx` |
| `hooks/use-mobile.jsx` | Mobile breakpoint hook | Only consumed by unused `sidebar.jsx` |
| `components/ui/toaster.jsx` | shadcn toast renderer | App uses `sonner` via `layout.js` instead |

### 1.2 shadcn/ui components — installed but not in import graph

These 36 files under `components/ui/` are **not imported** from any `app/`, `components/site/`, or `app/layout.js` file. Several form a dead cluster (e.g. `sidebar.jsx` → `sheet`, `skeleton`, `separator`, `tooltip`).

| # | File | Notes |
|---|------|-------|
| 1 | `accordion.jsx` | — |
| 2 | `alert-dialog.jsx` | — |
| 3 | `alert.jsx` | — |
| 4 | `aspect-ratio.jsx` | — |
| 5 | `avatar.jsx` | — |
| 6 | `breadcrumb.jsx` | Planned in Sprint 19, not used today |
| 7 | `calendar.jsx` | Pulls `react-day-picker` |
| 8 | `carousel.jsx` | Pulls `embla-carousel-react` |
| 9 | `chart.jsx` | Recharts wrapper; dashboards use Recharts directly |
| 10 | `collapsible.jsx` | — |
| 11 | `command.jsx` | Pulls `cmdk` |
| 12 | `context-menu.jsx` | — |
| 13 | `drawer.jsx` | Pulls `vaul` |
| 14 | `form.jsx` | Pulls `react-hook-form`; never used in pages |
| 15 | `hover-card.jsx` | — |
| 16 | `input-otp.jsx` | Pulls `input-otp` |
| 17 | `menubar.jsx` | — |
| 18 | `navigation-menu.jsx` | — |
| 19 | `pagination.jsx` | — |
| 20 | `popover.jsx` | — |
| 21 | `progress.jsx` | — |
| 22 | `radio-group.jsx` | — |
| 23 | `resizable.jsx` | Pulls `react-resizable-panels` |
| 24 | `scroll-area.jsx` | — |
| 25 | `separator.jsx` | Only used by unused `sidebar.jsx` |
| 26 | `sheet.jsx` | Only used by unused `sidebar.jsx` |
| 27 | `sidebar.jsx` | 630+ lines; Sprint 19 target, currently dead |
| 28 | `skeleton.jsx` | Only used by unused `sidebar.jsx` |
| 29 | `slider.jsx` | — |
| 30 | `tabs.jsx` | Imported in `leadedge360/page.js` but **never rendered** (dead import) |
| 31 | `toast.jsx` | Part of unused shadcn toast stack |
| 32 | `toggle.jsx` | Only used by unused `toggle-group.jsx` |
| 33 | `toggle-group.jsx` | — |
| 34 | `tooltip.jsx` | Only used by unused `sidebar.jsx` |
| 35 | `toaster.jsx` | See §1.1 |
| 36 | *(partial)* `sonner.jsx` | **Used**, but see §5.3 for broken `next-themes` integration |

**Actively used shadcn/ui components (13):**  
`badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `select`, `sonner`, `switch`, `table`, `textarea`

### 1.3 Orphaned scripts & agent artifacts

| File | Type | Status |
|------|------|--------|
| `backend_test.py` | Python API test suite (~669 lines) | Reads `/app/.env` (Emergent container path); **not referenced** in `package.json` scripts or CI |
| `test_result.md` | Emergent agent testing protocol + YAML state | Operational artifact; not consumed by app |
| `memory/test_credentials.md` | Empty stub for agent auth tests | No content; never read by app |

### 1.4 Documentation & schema — unused at MongoDB runtime

These are valid reference material but **not executed** by the current MongoDB-based app:

| Path | Notes |
|------|-------|
| `docs/sql/01_schema.sql` | PostgreSQL target schema |
| `docs/sql/02_indexes.sql` | PostgreSQL indexes |
| `docs/sql/03_seed.sql` | PostgreSQL seed |
| `docs/sql/init-db.sh` | Postgres init script |
| `docs/sql/utility-queries.sql` | Ops queries |
| `docs/POSTGRES_DEPLOYMENT.md` | Migration guide for alternate DB |

### 1.5 Platform / infra files (not app code)

| File | Notes |
|------|-------|
| `.emergent/emergent.yml` | Emergent Cloud image pin; not imported by app |
| `n8n/*.json` (4 files) | Workflow templates; deployed separately, not bundled |

### 1.6 Missing directory — implied but absent

| Expected path | Referenced by | Impact |
|---------------|---------------|--------|
| `public/downloads/asoftech-insightz-v1.2.0.tar.gz` | `app/download/page.js` | **404** at runtime |
| `public/downloads/asoftech-insightz-v1.2.0.zip` | `app/download/page.js` | **404** at runtime |

No `public/` directory exists in the repository.

---

## 2. Backup Files

**Result: none found.**

Searched for extensions and patterns: `*.bak`, `*.old`, `*.backup`, `*copy*`, `*.tmp`, `*.orig`

The repo contains no conventional backup or editor-swap files. Closest equivalents:

| File | Classification |
|------|----------------|
| `test_result.md` | Agent session state (not a code backup) |
| `memory/test_credentials.md` | Empty credentials placeholder |

---

## 3. Duplicate Components & Patterns

### 3.1 Near-identical React components (copy-paste)

| Duplicate A | Duplicate B | Shared pattern |
|-------------|-------------|----------------|
| `KpiCard` in `app/leadedge360/page.js` (L48–60) | `Kpi` in `app/retailedge360/page.js` (L32–44) | Card + blur orb + icon + label + value + sub; differs only in prop names |
| `LeadDialog` in `app/leadedge360/page.js` (L369–426) | `ProductDialog` in `app/retailedge360/page.js` (L243–289) | Dialog + form grid + Select fields + submit + toast loading pattern |
| Lead detail `Dialog` | Product detail `Dialog` | Grid metadata + AI insight panel + action buttons |

**Recommendation (future):** Extract `components/workspace/KpiStrip.jsx`, `EntityDrawer.jsx`, `CaptureDialog.jsx` per Sprint 19 plan.

### 3.2 Duplicated constants

| Constant | Locations | Drift risk |
|----------|-----------|------------|
| `LOGO` URL | `components/site/Navbar.jsx` L10, `Footer.jsx` L4 | Single URL change needs two edits |
| `plans` pricing tiers | `app/pricing/page.js` L12–19 | Duplicates `PLANS` in `lib/razorpay.js` L38–42 (prices must match manually) |
| `TERRITORIES` | `app/leadedge360/page.js` L25 | Overlaps seed territories in `route.js` L43 |
| `STATUSES` | `app/leadedge360/page.js` L27 | Duplicates `route.js` L29 `STATUSES` array |
| `SOURCES` | `app/leadedge360/page.js` L26 | Duplicates `route.js` L42 webhook seed sources |
| `PIE_COLORS` | `leadedge360/page.js` L46, `retailedge360/page.js` L28 | Same palette, two definitions |
| Chart `Tooltip contentStyle` | Both dashboard pages, 4+ inline copies | Identical `{ background: '#0B1220', ... }` object |

### 3.3 Duplicated navigation definitions

| Structure | Locations |
|-----------|-----------|
| Marketing nav links (8 items) | `components/site/Navbar.jsx` L12–21 |
| Footer product/company links | `components/site/Footer.jsx` L23–40 |
| User dropdown product links | `Navbar.jsx` L80–81 |

Three separate link lists with overlapping targets (`/leadedge360`, `/retailedge360`, `/pricing`).

### 3.4 Dual toast systems

| Stack | Files | Used? |
|-------|-------|-------|
| **Sonner** | `sonner` pkg, `components/ui/sonner.jsx`, `app/layout.js` | ✅ All pages |
| **shadcn Toast** | `toast.jsx`, `toaster.jsx`, `hooks/use-toast.js` | ❌ Dead |

---

## 4. Dead Code

### 4.1 Dead imports (symbols imported, never used)

| File | Dead import |
|------|-------------|
| `app/leadedge360/page.js` | `useMemo` from React |
| `app/leadedge360/page.js` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs` |
| `components/site/Navbar.jsx` | `User` from `lucide-react` |
| `app/signin/page.js` | `Mail` from `lucide-react` |

### 4.2 Unreachable routes & fallbacks

| Code | Location | Issue |
|------|----------|-------|
| `loginUrl()` returns `'/auth/setup'` | `lib/auth.js` L9 | No `/auth/setup` page exists; `route.js` redirects to `/signin?auth_error=not_configured` instead |
| `POST /api/leads/sources` | `docs/openapi.json` L377 | **Not implemented** — only `GET /api/leads/sources` exists in `route.js` |
| `POST /api/admin/roles` | `docs/openapi.json` | **Not implemented** — only `GET /admin/roles` in `mobile-routes.js` |
| `POST /api/admin/subscriptions` | `docs/openapi.json` | **Not implemented** — only `GET /admin/subscriptions` |

### 4.3 Dead API surface (implemented but never written to)

| Collection / endpoint | Read path | Write path |
|----------------------|-----------|------------|
| `subscriptions` | `GET /users/subscription`, `GET /admin/subscriptions` | **None** — Razorpay flow updates `orgs.plan` only |
| `notifications` | `GET /notifications`, mark read | **No `insertOne`** anywhere in codebase |

### 4.4 Dev-only / unreachable from UI

| Endpoint | Usage |
|----------|-------|
| `POST /api/seed-reset` | Documented in README; no UI button; curl-only dev utility |

### 4.5 Broken Tailwind dynamic classes

Both dashboard pages use invalid dynamic class construction:

```jsx
// leadedge360/page.js L50, L54 — retailedge360/page.js L34, L38
className={`... bg-${accent}/20 ...`}
className={`... text-${accent}`}
```

Tailwind JIT cannot generate `bg-primary/20` or `text-accent` from template literals at build time. Visual accents may silently fail.

### 4.6 Partially dead dependency integration

| Package | Imported where | Problem |
|---------|----------------|---------|
| `next-themes` | `components/ui/sonner.jsx` | `useTheme()` called but **no `ThemeProvider`** in `layout.js`; theme sync is a no-op |
| `@tanstack/react-query` | `app/providers.js` only | Provider never mounted |

### 4.7 In-memory module state (fragile, not dead but debt)

| Symbol | File | Risk |
|--------|------|------|
| `migrationDone = false` | `route.js` L102 | Legacy orgId migration runs once per server process, not per deployment |
| `let Razorpay = null` + `try/require` | `lib/razorpay.js` L5–6 | Silent catch hides import failures |

---

## 5. Unused npm Dependencies

Dependencies in `package.json` with **zero imports** in `app/`, `components/`, `lib/`, or `hooks/`:

| Package | Version | Notes |
|---------|---------|-------|
| `axios` | 1.10.0 | Only mentioned in `docs/MOBILE_API_GUIDE.md` |
| `lodash` | 4.18.1 | — |
| `dayjs` | 1.11.13 | — |
| `date-fns` | 4.1.0 | — |
| `swr` | 2.3.8 | — |
| `@tanstack/react-table` | 8.21.3 | — |
| `@hookform/resolvers` | 5.1.1 | — |
| `zod` | 3.25.67 | — |
| `react-hook-form` | 7.58.1 | Only in unused `form.jsx` |
| `@tanstack/react-query` | 5.56.2 | Only in unwired `providers.js` |

**Transitive-only usage** (dependency of unused UI components):

| Package | Pulled in by |
|---------|--------------|
| `cmdk` | Unused `command.jsx` |
| `vaul` | Unused `drawer.jsx` |
| `embla-carousel-react` | Unused `carousel.jsx` |
| `react-day-picker` | Unused `calendar.jsx` |
| `input-otp` | Unused `input-otp.jsx` |
| `react-resizable-panels` | Unused `resizable.jsx` |

**DevDependency unused:**

| Package | Notes |
|---------|-------|
| `globals` | No import in project |

**Duplicate date libraries:** Both `dayjs` and `date-fns` are installed; neither is used (native `Date` + ISO strings throughout).

---

## 6. Documentation Debt & Stale References

| Document | Stale claim | Reality |
|----------|-------------|---------|
| `README.md` L26 | `retailedge360/page.js` — "Coming-soon page" | Full retail dashboard implemented |
| `README.md` L257 | Multi-tenant "Roadmap" unchecked | `lib/tenant.js` implements org scoping |
| `app/products/page.js` L26 | RetailEdge360 badge "Coming Soon" | Product is live at `/retailedge360` |
| `docs/auth-flow.md` | PostgreSQL as runtime DB | MongoDB is actual store |
| `Dockerfile` L187 | `COPY --from=builder /app/public ./public` | `public/` does not exist in repo |

---

## 7. File Inventory Summary

```
Total repository files (excl. yarn.lock):  ~131

Application source (app + components + lib + hooks):  ~75
  ├── Actively used in runtime graph:              ~33
  ├── shadcn/ui dead weight:                       36
  ├── Unwired app files:                            7
  └── Orphaned hooks:                               2

Documentation / ops:                                 ~25
n8n / platform / CI:                                ~8
Test / agent artifacts:                             3
```

---

## 8. Prioritized Remediation Roadmap

*Recommendations only — nothing deleted in this audit.*

### P0 — Quick wins (low risk)

| # | Action | Files affected | Est. effort |
|---|--------|----------------|-------------|
| 1 | Remove dead imports (`useMemo`, `Tabs`, `User`, `Mail`) | 3 pages, 1 component | 15 min |
| 2 | Delete or wire `app/providers.js` into `layout.js` | 2 files | 15 min |
| 3 | Remove unused npm deps (`axios`, `lodash`, `dayjs`, `date-fns`, `swr`, `@tanstack/react-table`, `zod`, `@hookform/resolvers`) | `package.json` | 30 min |
| 4 | Add `public/downloads/` assets or remove broken download links | `public/`, `download/page.js` | 1 hr |

### P1 — Consolidation (Sprint 19 alignment)

| # | Action | Impact |
|---|--------|--------|
| 5 | Extract shared `KpiCard`, `ChartCard`, `EntityDrawer` | Removes largest duplicate block |
| 6 | Centralize `PLANS` — pricing page imports from `lib/razorpay.js` | Single billing source of truth |
| 7 | Create `lib/constants/branding.js` for `LOGO`, territories, statuses | Stops constant drift |
| 8 | Fix dynamic Tailwind classes with static maps | Correct KPI accent rendering |
| 9 | Remove shadcn toast stack OR migrate from Sonner (pick one) | `toast.jsx`, `toaster.jsx`, `use-toast.js` |

### P2 — Prune shadcn inventory

| # | Action | Notes |
|---|--------|-------|
| 10 | Remove 30+ unused `components/ui/*` files | Keep only the 13 active + `sidebar` if Sprint 19 proceeds |
| 11 | Remove associated Radix peers from `package.json` after prune | Reduces install size |

### P3 — Structural / platform

| # | Action | Notes |
|---|--------|-------|
| 12 | Integrate `backend_test.py` into CI or delete | Currently orphaned |
| 13 | Wire `testIds` into JSX or remove `lib/constants/testIds/` | E2E readiness |
| 14 | Align OpenAPI with implementation (remove phantom POST routes) | Doc accuracy |
| 15 | Add `ThemeProvider` or remove `next-themes` from `sonner.jsx` | Fix half-integration |
| 16 | Populate or gitignore `memory/test_credentials.md` | Agent hygiene |

---

## 9. What Is NOT Technical Debt

These appear redundant but are **intentionally kept**:

| Item | Reason |
|------|--------|
| `docs/sql/*` | Forward-looking PostgreSQL migration path |
| `n8n/*.json` | External automation templates |
| `lib/whatsapp.js` | Used by `mobile-routes.js` (mobile JWT API) |
| `POST /api/seed-reset` | Documented dev utility |
| Hardcoded `AGENTS` in `route.js` | MVP design; not DB-backed by choice |
| `test_result.md` | Required by Emergent testing protocol |

---

## 10. Appendix — Used vs Unused Component Matrix

| Component / module | Status |
|--------------------|--------|
| `SiteShell`, `Navbar`, `Footer`, `DpdpConsentBanner` | ✅ Used |
| `ParticleNetwork`, `WireSphere`, `CountUp`, `Reveal` | ✅ Used (`app/page.js`) |
| `lib/mongo`, `scoring`, `retail-ai`, `auth`, `tenant`, `jwt`, `razorpay`, `mobile-routes`, `otp`, `password` | ✅ Used (API layer) |
| `lib/utils` (`cn`) | ✅ Used (all shadcn components) |
| `lib/whatsapp` | ✅ Used (mobile API only) |
| `recharts`, `framer-motion`, `lucide-react`, `uuid`, `bcryptjs`, `jsonwebtoken`, `razorpay` | ✅ Used |
| All 36 unused `components/ui/*` listed in §1.2 | ❌ Unused |
| `app/providers.js`, `hooks/*`, `lib/constants/testIds/*` | ❌ Unused |
| `backend_test.py`, `test_result.md`, `memory/test_credentials.md` | ⚠️ Orphaned artifacts |

---

*End of report. No files were modified or deleted during this audit.*
