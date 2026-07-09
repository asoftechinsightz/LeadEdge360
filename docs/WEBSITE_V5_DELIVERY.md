# AsoftechInsightz Website v5.0 — Delivery Notes

**Theme:** Existing GIX design language preserved — no visual theme overhaul.

## v5.0 changes

### Pricing (single source: `PRICING_V5`)
| Product | Plans |
|---------|-------|
| RetailEdge360 | Business ₹2,999/mo + ₹9,999 setup · Enterprise ₹7,999/mo |
| LeadEdge360 | Business ₹14,999/mo + ₹39,999 setup (Most Popular) · Enterprise ₹24,999/mo |
| Business Suite | ₹16,999/mo + ₹49,999 setup (Best Overall Value) · Enterprise Custom |
| Trinetra360 | Separate enterprise pricing — not bundled |

### DPDP Act 2023
- Mandatory + optional consent on `/signup` (`DpdpSignupConsent`)
- Consent audit: version, privacy/terms versions, timestamp, registration method, marketing flag, IP, UA
- `consent_log` collection on registration
- Settings → **Privacy & Data**: export, deletion request, marketing withdraw, consent history
- Cookie banner v2: Essential / Analytics / Performance / Marketing with reject non-essential default

### Story & positioning
- Homepage transformation journey updated (`SMB_TRANSFORMATION_STEPS`)
- Business Suite vs Trinetra360 separation unchanged in `SuiteVsEnterpriseSection`

### Razorpay
- Checkout plans rebuilt in `lib/billing/subscription-plans.js` from `PRICING_V5`
- Setup fees displayed on marketing + `/subscribe` (billed separately in future v5.2)

## Validation checklist
- [x] No fake testimonials / logos / revenue claims
- [x] Startup India disclaimer (no false recognition)
- [x] Legal pages linked from footer, pricing, signup
- [x] Trinetra360 not in Business Suite bundle pricing
- [ ] Razorpay recurring subscription API (v5.2)
- [ ] Lighthouse ≥95 audit (performance pass separate)
