# AsoftechInsightz Enterprise Website v2.0 — Audit & Roadmap

**Date:** July 2026  
**Scope:** Public marketing site (`/`, `/products`, legal, contact)  
**Stack:** Next.js 14 App Router (upgrade to 15 planned), JavaScript, Tailwind, Framer Motion  
**Constraint:** Honest claims only — no fake logos, testimonials, or certifications

---

## 1. Executive Summary

The marketing site is **~75% complete** for enterprise SaaS positioning. Core routes, GIX design system, product landings (LeadEdge360, RetailEdge360), DPDP privacy, CRM lead capture, and SEO foundations exist.

**v2.0 gaps:** Trinetra360 product presence, full Razorpay legal pack, cinematic 3D hero (R3F), removal of placeholder testimonials, Startup India section (pre-recognition), and metadata parity across all routes.

---

## 2. Gap Audit

### Critical (blocks Razorpay / compliance onboarding)

| Gap | Status | Action |
|-----|--------|--------|
| Refund policy page | Was missing | `app/refund-policy/page.js` |
| Cancellation policy | Was missing | `app/cancellation-policy/page.js` |
| Cookie policy | Was missing | `app/cookie-policy/page.js` |
| Digital delivery / shipping policy | Was missing | `app/shipping-delivery/page.js` |
| Acceptable use policy | Was missing | `app/acceptable-use/page.js` |
| Footer legal links | Incomplete | Updated `Footer.jsx` |
| Fake testimonials | Present | Replaced with `OutcomeScenariosSection`; `TestimonialsSection` re-exports scenarios |
| Build: `Server is not defined` | Fixed | Added missing `Server` import in `components/suite/nav-config.ts` |
| Trinetra360 product page | Missing | `app/products/trinetra360/page.js` |

### High (enterprise / investor readiness)

| Gap | Status | Action |
|-----|--------|--------|
| Ecosystem narrative (3 products) | Partial | `EcosystemHubSection`, `FlagshipProductsSection` |
| SMB transformation journey | Missing | `SMBTransformationSection` |
| Startup India readiness (no false claims) | Missing | `StartupIndiaSection` |
| Hero copy aligned to v2 brief | Partial | `lib/marketing-content.js` + `PremiumHero` |
| Traditional vs platform comparison | Missing | `TraditionalVsPlatformSection` |
| Per-page SEO metadata | Partial | Contact layout + legal metadata |
| Sitemap completeness | Partial | Added legal + Trinetra routes |

### Medium (premium experience)

| Gap | Status | Action |
|-----|--------|--------|
| React Three Fiber hero | Not installed | Phase 2 — add `three`, `@react-three/fiber`, `@react-three/drei` |
| GSAP scroll choreography | Not installed | Phase 2 — use Framer Motion first |
| Trinetra NOC 3D visualization | Missing | Phase 2 — `TrinetraNocScene.jsx` |
| Retail 3D store walkthrough | Missing | Phase 2 |
| Blog with real slugs | Stub only | Wire to marketing-engine content |
| Industry sub-pages `/solutions/[slug]` | Missing | Phase 3 |

### Low (polish)

| Gap | Status | Action |
|-----|--------|--------|
| Design token drift (hex vs tokens.json) | Partial | Migrate marketing CSS to tokens |
| Unused GIX legacy sections | Orphan files | Archive or wire |
| Marketing E2E tests | Missing | `e2e/marketing/homepage.spec.js` |
| Lighthouse 95+ on 3D hero | TBD | Lazy-load R3F, `prefers-reduced-motion` |

---

## 3. What Already Works

- 15-section enterprise homepage with `PremiumHero`, product screenshots
- LeadEdge360 + RetailEdge360 marketing pages with real dashboard images
- `/book-demo`, `/growth-audit`, `/api/marketing/leads` lead capture
- Privacy + Terms (DPDP-aligned)
- `sitemap.xml`, `robots.txt`, JSON-LD organization schema
- GA4 + optional GTM via `AnalyticsScripts`
- DPDP consent banner
- Contact: enquiry@asoftechinsightz.com, +91 7307911405
- Framer Motion animations, glassmorphism GIX theme

---

## 4. Implementation Phases

### Phase 1 — Compliance & ecosystem (this sprint) ✅

- Legal pages (refund, cancellation, cookie, shipping, AUP)
- Trinetra360 marketing page
- Homepage: ecosystem hub, SMB journey, Startup India, flagship products
- Remove fake testimonials → outcome scenarios
- Footer + sitemap updates
- Hero copy + CTAs per v2 brief

### Phase 2 — 3D & cinematic ✅ (initial)

- Installed `three`, `@react-three/fiber`, `@react-three/drei`
- `HeroEcosystemScene` on homepage `PremiumHero`
- `RetailStoreScene`, `CrmPipelineScene`, `TrinetraNocScene` on `/products/*`
- `ProductExperienceSection` reusable block
- `prefers-reduced-motion` → aurora CSS fallback
- See `components/gix/three/README.md`

### Phase 2b — polish (optional)

- Upgrade `EcosystemHubSection` to optional R3F
- Lighthouse mobile pass + lower star count on slow devices
- GSAP scroll (only if Framer Motion insufficient)

### Phase 3 — SEO & content (1–2 weeks)

- Metadata on all marketing routes
- Blog slugs from CMS/marketing-engine
- Industry solution pages
- Extended JSON-LD (Product, FAQ, LocalBusiness)
- `hreflang` if multi-region

### Phase 4 — QA & launch (1 week)

- WCAG AA audit (axe-playwright)
- Razorpay merchant checklist sign-off
- Startup India application content pack (post-approval badge only)
- Performance regression on mobile 4G

---

## 5. Razorpay Merchant Checklist Mapping

| Razorpay requirement | Site location |
|---------------------|---------------|
| Company name & description | `/`, `/about` |
| Products & SaaS model | `/products`, `/pricing` |
| Refund process | `/refund-policy` |
| Privacy | `/privacy` |
| Terms | `/terms` |
| Contact & support | `/contact`, footer |
| Digital delivery | `/shipping-delivery` |
| Pricing transparency | `/pricing` |

---

## 6. Honesty Policy

**Do not claim:** ISO 27001, SOC 2, Startup India recognition, fake client logos, invented ROI stats, fake awards.

**Do claim:** Implemented security controls (RBAC, encryption, audit logs), pilot-ready platform, DPDP-ready privacy framework, real product screenshots, documented certifications (go-live retest 44/44).

---

## 7. File Map (Phase 1)

| File | Purpose |
|------|---------|
| `lib/marketing-content.js` | Hero, products, ecosystem copy |
| `lib/legal-content.js` | Legal page bodies |
| `components/legal/LegalDocument.jsx` | Shared legal layout |
| `components/gix/sections/enterprise/EcosystemHubSection.jsx` | Network visualization |
| `components/gix/sections/enterprise/SMBTransformationSection.jsx` | SMB journey |
| `components/gix/sections/enterprise/StartupIndiaSection.jsx` | Innovation narrative |
| `components/gix/sections/enterprise/FlagshipProductsSection.jsx` | 3 product deep cards |
| `components/gix/sections/enterprise/TraditionalVsPlatformSection.jsx` | Comparison |
| `components/gix/sections/enterprise/OutcomeScenariosSection.jsx` | Replaces fake testimonials |
| `app/products/trinetra360/page.js` | Trinetra product landing |

---

*Next: Phase 2 R3F hero — see `components/gix/three/README.md` (to be created).*
