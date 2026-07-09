# Phase 3 — Enterprise AppShell

**Status:** Complete — awaiting approval  
**Authority:** `docs/SOURCE_OF_TRUTH.md` §10

## Summary

Phase 3 delivers a unified Business Suite shell using the Phase 2 design system and `suite` theme. All canonical suite routes now share sidebar navigation, header utilities, client-side auth guard, and mobile navigation.

## Components (`components/suite/`)

| Component | Role |
|-----------|------|
| `AppShell` | Layout orchestrator — sidebar + header + main + mobile nav |
| `SuiteRouteLayout` | Shared Next.js layout (theme + auth + AppShell) |
| `Sidebar` | Desktop nav with collapse |
| `SuiteHeader` | Top bar — search, product switcher, notifications, user menu |
| `MobileNav` | Full-screen drawer nav below `lg` |
| `Breadcrumbs` | Path-based breadcrumb trail |
| `ProductSwitcher` | LeadEdge360 / RetailEdge360 / product selection |
| `GlobalSearch` | Lead search via `GET /api/lead-search` |
| `NotificationBell` | Inbox via `GET /api/notifications`, mark read via `POST /api/notifications/[id]/read` |
| `UserMenu` | Account dropdown + sign out |
| `SuiteAuthContext` | JWT guard — redirects via `redirectToSignIn()` in `auth-routes.ts` |
| `auth-routes.ts` | Canonical `/signin` paths — prevents relative redirect 404s |
| `nav-config.ts` | Shared routes, labels, `isSuitePath()` |

Legacy shims remain in `components/business-suite/` (deprecated).

## Wired Routes

Each route has `layout.js` → `SuiteRouteLayout`:

| Route | Notes |
|-------|-------|
| `/leadedge360` | SiteShell removed |
| `/retailedge360` | SiteShell removed |
| `/proposals` | SiteShell removed — no more marketing nav |
| `/invoices` | SiteShell removed |
| `/revenue` | SiteShell removed |
| `/onboarding` | Wrapped by AppShell |
| `/payments` | **New** placeholder — fixes broken nav link; full billing UI is Phase 8 |

## Auth Guard

- Requires `localStorage.accessToken` before rendering suite content
- Redirects via `components/suite/auth-routes.ts` — always root-absolute `/signin`
- Redirects to `/signin?returnUrl=<current path>` when missing token
- User profile read from `localStorage.currentUser`
- API calls from shell use `suiteFetch()` with `Authorization: Bearer`

## Marketing Nav

`components/site/Navbar.jsx` returns `null` on all suite paths (`isSuitePath`) so marketing header/footer never stack on suite pages.

## Preview & Screenshots

- SVG mock: `docs/screenshots/phase3/appshell-desktop.svg`
- Mobile mock: `docs/screenshots/phase3/appshell-mobile.svg`
- Live: sign in, then visit any suite route (e.g. `/leadedge360`)

## Build Verification

```bash
npm run build
```

See `docs/PHASE3_BUILD_VERIFICATION.md` for results.

## Out of Scope (later phases)

- `/dashboard` executive command center — Phase 5
- Full billing / payments UI — Phase 8
- Page-level V2 refactors (LeadEdge360, tables, KPI cards) — Phases 6–8

## Next Step

Approve Phase 3 to proceed to **Phase 4 — Marketing Website Redesign**.
