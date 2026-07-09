# Phase 3 Build Verification

**Date:** 2026-06-21  
**Result:** PASS

## Commands

| Command | Result |
|---------|--------|
| `npm run build` | PASS (exit 0) |

## Notes

- Mongo `ECONNREFUSED localhost:27017` warnings during SSG are expected when MongoDB is not running locally — non-blocking; build completed successfully.
- New route `/payments` included in build output.
- Suite routes compile with shared `SuiteRouteLayout` (AppShell + suite theme + auth guard).

## Auth routing (Phase 3 gate)

See **`docs/PHASE3_AUTH_VERIFICATION.md`** for full audit.

| Check | Result |
|-------|--------|
| Centralized absolute paths (`auth-routes.ts`) | PASS |
| `buildSignInUrl('/leadedge360')` → `/signin?returnUrl=%2Fleadedge360` | PASS |
| Relative `returnUrl=signin` rejected (falls back to `/splash`) | PASS |
| `npm run build` after auth fix | PASS |

Manual smoke: clear `localStorage.accessToken`, visit each suite route — browser must land on `/signin?returnUrl=...` (never `/design-system-preview/signin`).

---

## Manual smoke test

1. `npm run dev`
2. Sign in at `/signin` (stores `accessToken` + `currentUser`)
3. Visit `/leadedge360` — sidebar, header, breadcrumbs visible; no marketing nav/footer
4. Visit `/proposals`, `/invoices`, `/revenue` — same AppShell
5. Visit `/payments` — placeholder loads; nav link no longer 404
6. Sign out via user menu — redirects to `/signin`
7. Visit `/leadedge360` without token — redirects to `/signin?returnUrl=...`
