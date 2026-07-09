# AsoftechInsightz Website v4.0 — Audit & Delivery Status

**Date:** July 2026  
**Scope:** Master Cursor Prompt v4.0 — Digital Experience Platform

---

## Executive summary

v4.0 delivers Razorpay-ready SME pricing, clear Business Suite vs Trinetra360 separation, premium device mockups from real product screenshots, and a redesigned authentication experience. Marketing site remains on `asoftechinsightz.com`; apps on `app.asoftechinsightz.com` and observability on `app.observability360.asoftechinsightz.com`.

---

## Gap audit (before v4.0)

| Area | Gap | v4.0 status |
|------|-----|-------------|
| **Pricing** | Old tiers (₹9,999 / ₹49,999) not SME-aligned | ✅ `PRICING_V4` + `/pricing` rebuild |
| **Razorpay** | Missing affordable INR tiers, bundle clarity | ✅ Starter ₹499–₹4,999 tiers, bundle ₹2,999, legal links |
| **Product separation** | Trinetra mixed with SMB suite visually | ✅ `SuiteVsEnterpriseSection` on homepage |
| **Screenshots** | Flat SVG placeholders | ✅ Real PNG dashboards in device frames |
| **Auth UX** | Basic card layout | ✅ `AuthShell` — signin, signup, forgot-password, splash |
| **3D** | Hero + product scenes (Phase 2) | ✅ Retained; ecosystem hub still 2D |
| **Microsoft login** | Not implemented backend | ⏳ UI placeholder (disabled) |
| **Onboarding tour** | Not built | ⏳ Future — splash routes to product-selection |
| **Startup India badge** | Must not show until approved | ✅ No badge displayed |
| **Fake social proof** | Prior fake testimonials | ✅ Outcome scenarios (honest) |

---

## v4.0 deliverables shipped

### Content & compliance
- `lib/marketing-content.js` — `PRICING_V4`, `SUITE_VS_ENTERPRISE`, `PRODUCT_GALLERY`
- Pricing page with product tabs, bundles, Trinetra note, policy links
- Homepage pricing teaser section

### Visual & UX
- `components/marketing/DeviceMockup.jsx` — laptop / tablet / mobile glass frames
- `components/marketing/PricingShowcase.jsx` — reusable pricing UI
- `components/gix/sections/enterprise/SuiteVsEnterpriseSection.jsx`
- `components/gix/sections/enterprise/DashboardPreviewSection.jsx` — gallery + devices
- `components/auth/AuthShell.jsx` — premium auth layout

### Assets
- `public/images/products/dashboards/` — LeadEdge360, RetailEdge360, Trinetra360 screenshots
- `public/images/brand/asoftechinsightz-logo-full.png`

### Auth pages updated
- `/signin`, `/signup`, `/forgot-password`, `/splash`

---

## Pricing model (production copy)

| Product | Tiers |
|---------|-------|
| **RetailEdge360** | Starter ₹499 · Professional ₹999 · Business ₹2,499 · Enterprise Custom |
| **LeadEdge360** | Starter ₹999 · Growth ₹2,499 · Professional ₹4,999 · Enterprise Custom |
| **Bundle** | Business Growth Suite ₹2,999/mo (Retail Pro + Lead Starter) |
| **Trinetra360** | Enterprise custom — **not** in Business Suite bundles |

---

## Remaining roadmap (v4.2+)

1. **Razorpay Subscription API** — migrate from one-time orders to recurring `plan_id` subscriptions when plan IDs are provisioned in Razorpay dashboard
2. **Product marketing** — additional screenshot galleries as features ship
3. **EcosystemHubSection** — Upgrade to R3F (Phase 2b)
4. **Lighthouse** — Image optimization, lazy R3F below fold

---

## v4.1 deliverables (shipped)

| Item | Status |
|------|--------|
| `PRICING_V4` → Razorpay checkout plans (`lib/billing/subscription-plans.js`) | ✅ |
| `/subscribe` product tabs (Retail / Lead / Bundle) | ✅ |
| Plan features & org product provisioning on payment verify | ✅ |
| Microsoft OAuth login (`/api/auth/microsoft`) | ✅ |
| Auth providers API + enabled Microsoft button on sign-in | ✅ |
| Welcome tour on `/product-selection` | ✅ |
| `AuthShell` on `/signin/otp` | ✅ |
| Device mockups on `/products/*` marketing pages | ✅ |

---

## Deploy checklist (VPS)

```bash
cd /opt/asoftech-insightz
npm install
docker compose build app --no-cache
docker compose up -d app
docker network connect observability360_default asoftech-app
```

Sync via SCP if `git pull` unavailable.

---

## Razorpay reviewer checklist

- [x] Company name, tagline, contact on site
- [x] Product descriptions (RetailEdge360, LeadEdge360, Trinetra360)
- [x] Pricing in INR with subscription model
- [x] Refund, cancellation, shipping/delivery, privacy, terms pages
- [x] No fake logos, testimonials, or revenue claims
- [ ] Live Razorpay plan IDs mapped to tiers (in-app)
