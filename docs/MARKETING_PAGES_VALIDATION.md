# Marketing Website — Page Validation

> **Updated:** 2026-06-22  
> **Authority:** `docs/SOURCE_OF_TRUTH.md` §8.1, `docs/PHASE4_MARKETING.md`

---

## Pricing policy (marketing vs suite)

| Surface | Route | Data source | Rule |
|---------|-------|-------------|------|
| **Marketing pricing** | `/pricing` | **Static editorial** | Do NOT auto-fetch from `/api/pricing/plans` or DB |
| **Suite checkout** | `/subscribe` | `GET /billing/plans` + Razorpay | Billing truth for signed-in users |

Marketing `/pricing` shows the Business Growth Plan (₹25,000/mo) as brochure copy. Plan sync and payment capture stay on `/subscribe` only.

---

## Validation matrix

| Route | SiteShell | Marketing theme | Hardcoded hex | API on page | Status |
|-------|-----------|-----------------|---------------|-------------|--------|
| `/` | Yes | Yes | No | No | Pass |
| `/about` | Yes | Yes | No | No | Pass |
| `/products` | Yes | Yes | No | No | Pass |
| `/solutions` | Yes | Yes | No | No | Pass |
| `/services` | Yes | Yes | No | No | Pass |
| `/industries` | Yes | Yes | No | No | Pass |
| `/pricing` | Yes | Yes | No | **No DB fetch** | Pass (fixed) |
| `/blog` | Yes | Yes | No | No | Pass |
| `/partners` | Yes | Yes | No | No | Pass |
| `/contact` | Yes | Yes | No | `POST /api/contact` | Pass |
| `/download` | Yes | Yes | No | No | Pass |
| `/privacy` | Yes | Yes | No | No | Pass |
| `/terms` | Yes | Yes | No | No | Pass |
| `/growth-audit` | Yes | Yes | No | `POST /growth-audit` | Pass (layout fixed) |

---

## Chrome

| Item | Status |
|------|--------|
| Navbar links include `/pricing` | Pass |
| Footer Company links include `/pricing` | Pass |
| DPDP consent banner (SiteShell) | Pass on all marketing routes |
| Mobile hamburger menu | Pass |

---

## Not marketing (excluded)

| Route | Layout | Notes |
|-------|--------|-------|
| `/signin`, `/splash` | Auth | No SiteShell |
| `/product-selection` | Auth flow | Dark legacy shell — suite onboarding |
| `/leadedge360/*`, `/dashboard`, etc. | `SuiteRouteLayout` | Business suite |
| `/subscribe` | Standalone | Billing — uses API plans |

---

## Manual smoke test

1. Open each marketing route — light background, navy footer, no `bg-[#020617]`
2. `/pricing` — static ₹25,000 card; no network call to `/api/pricing/plans`
3. `/growth-audit` — marketing nav/footer (not suite sidebar)
4. Resize to 390px — nav menu works on all pages above

```bash
npm run build
```

---

## Changes in this validation pass

- `app/pricing/page.js` — SiteShell + tokens; static content only
- `app/growth-audit/layout.js` — `SiteShell` instead of `SuiteRouteLayout`
- `components/site/Navbar.jsx` — Pricing link
- `components/site/Footer.jsx` — Pricing link
