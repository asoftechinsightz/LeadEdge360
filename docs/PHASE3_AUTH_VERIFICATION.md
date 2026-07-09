# Phase 3 Auth Routing Verification

**Date:** 2026-06-21  
**Status:** PASS  
**Issue addressed:** Relative `signin` navigation resolving to `/design-system-preview/signin` (404)

---

## Root cause

Relative auth paths (e.g. `signin` without a leading `/`) resolve against the **current URL segment**. From `/design-system-preview`, that becomes `/design-system-preview/signin` — a route that does not exist.

Suite shell auth must always use **root-absolute** paths: `/signin`.

---

## Audit results

| File | Redirects found | Action |
|------|-----------------|--------|
| `components/suite/SuiteAuthContext.tsx` | Unauthenticated guard, error handler, logout | **Fixed** — uses `redirectToSignIn()` from `auth-routes.ts` |
| `components/suite/SuiteRouteLayout.tsx` | None | **Documented** — auth delegated to `SuiteAuthProvider` |
| `components/suite/AppShell.tsx` | None | **Documented** — layout only, no auth redirects |
| `components/suite/UserMenu.tsx` | Sign-in link | **Fixed** — uses `SIGN_IN_PATH` constant (`/signin`) |
| `app/signin/page.js` | Post-login redirect | **Fixed** — `resolveReturnUrl()` ensures absolute destinations |

### New canonical module

`components/suite/auth-routes.ts`:

| Export | Purpose |
|--------|---------|
| `SIGN_IN_PATH` | Always `'/signin'` |
| `buildSignInUrl(returnPath?)` | `/signin?returnUrl=<absolute-path>` |
| `redirectToSignIn(returnPath?)` | `window.location.assign()` with root-absolute URL |
| `normalizeAppPath(path)` | Ensures leading `/` |
| `resolveReturnUrl(search)` | Safe post-login destination from query string |
| `SUITE_AUTH_GUARD_PATHS` | Routes protected by `SuiteAuthProvider` |

---

## Protected routes verified

When `localStorage.accessToken` is **missing**, each route redirects to **`/signin?returnUrl=<route>`** (never a relative path):

| Route | Expected redirect |
|-------|-------------------|
| `/leadedge360` | `/signin?returnUrl=%2Fleadedge360` |
| `/retailedge360` | `/signin?returnUrl=%2Fretailedge360` |
| `/proposals` | `/signin?returnUrl=%2Fproposals` |
| `/invoices` | `/signin?returnUrl=%2Finvoices` |
| `/revenue` | `/signin?returnUrl=%2Frevenue` |
| `/payments` | `/signin?returnUrl=%2Fpayments` |

### Non-suite routes (no auth guard)

| Route | Behavior |
|-------|----------|
| `/design-system-preview` | Public — no `SuiteAuthProvider`; **must not** redirect to `/design-system-preview/signin` |
| `/signin` | Public auth page |

---

## Verification steps

1. Clear auth: `localStorage.removeItem('accessToken')`
2. Visit each suite route above — confirm browser lands on `/signin?returnUrl=...`
3. Visit `/design-system-preview?view=suite` — confirm page loads without auth redirect
4. Sign in with valid credentials + `?returnUrl=/proposals` — confirm landing on `/proposals` (via `/splash` fallback when no returnUrl)

---

## Build

```bash
npm run build
```

**Result:** PASS (see `docs/PHASE3_BUILD_VERIFICATION.md`)

---

## Screenshots

| File | Description |
|------|-------------|
| `docs/screenshots/phase3/auth-redirect-signin.svg` | Unauthenticated suite access → `/signin` |
| `docs/screenshots/phase3/auth-return-url.svg` | returnUrl query preserved on redirect |

---

## Phase 3 completion gate

Auth routing verification **PASS**. Phase 3 may be marked complete pending stakeholder approval.

**Next:** Approve Phase 3 → proceed to Phase 4 (Marketing Website Redesign).
