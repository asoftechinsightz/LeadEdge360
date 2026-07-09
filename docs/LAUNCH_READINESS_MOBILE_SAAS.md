# Launch Readiness — LeadEdge360 & RetailEdge360 (Mobile + SaaS)

**Date:** 2026-06-22  
**Verdict:** ✅ **GO for controlled pilot** (5–10 customers) · ⛔ **NO GO for public GA** until load test + pen test

---

## Executive summary

Both **LeadEdge360** (CRM) and **RetailEdge360** (POS) are **feature-complete for pilot** on **web SaaS** and **Android mobile**. You should **not** wait for every optional enhancement before onboarding customers. Deploy to Hostinger VPS, achieve **`npm run production:acceptance` → PASSED**, then onboard pilots and convert to revenue.

| Channel | LeadEdge360 | RetailEdge360 |
|---------|-------------|---------------|
| **Web SaaS** | ✅ Pilot ready | ✅ Pilot ready |
| **Android mobile** | ✅ Pilot ready | ✅ Pilot ready |
| **iOS** | ❌ Not in scope | ❌ Not in scope |
| **Public GA** | ⛔ After pilot + load + pen test | ⛔ Same |

---

## Web SaaS readiness

| Capability | LeadEdge360 | RetailEdge360 | Status |
|------------|-------------|---------------|--------|
| Authentication (OTP + password) | ✅ | ✅ | Live-ready |
| Multi-tenant isolation | ✅ | ✅ | Tested (PAT + tenant retest) |
| Leads / pipeline / opportunities | ✅ | — | Live-ready |
| WhatsApp templates | ✅ | — | Web + mobile parity |
| Customers / invoices / revenue | ✅ | — | Live-ready |
| POS checkout (cash/UPI/card) | — | ✅ | Razorpay integrated |
| Barcode / SKU lookup | — | ✅ | Mobile scanner; web lookup |
| Subscriptions / Razorpay billing | ✅ | ✅ | Configure keys on VPS |
| File attachments | ✅ | — | Upload/download |
| OpenAPI / API docs | ✅ 237 paths | ✅ | `docs/openapi.yaml` |

**Deploy target:** `https://app.asoftechinsightz.com` (Hostinger VPS, Docker Compose)

**Pre-launch command on VPS:**

```bash
npm run production:acceptance   # must return PASSED
npm run launch:warroom        # daily during pilot
```

---

## Mobile (Android) readiness

| Capability | LeadEdge360 | RetailEdge360 | Status |
|------------|-------------|---------------|--------|
| Auth + biometrics | ✅ | ✅ | Flutter app v1.0.0+1 |
| CRM core (leads, opps, customers) | ✅ | — | 96%+ parity |
| WhatsApp template composer | ✅ | — | Thread screen |
| Retail POS + barcode | — | ✅ | `mobile_scanner` + Razorpay |
| Offline mode | partial | partial | Not a pilot blocker |
| Crash reporting (FCM) | 🟡 | 🟡 | Wire `google-services.json` |
| Play Store signed AAB | 🟡 | 🟡 | Run `build-android-release.sh` + keystore |

**Production API URL for mobile builds:**

```bash
flutter build apk --release \
  --dart-define=API_BASE_URL=https://app.asoftechinsightz.com/api
```

Or use `mobile/scripts/build-apk.ps1` with production URL.

**Pilot distribution:** Internal APK sideload or Play Console **internal testing track** (recommended).

---

## Environment matrix

| Environment | Purpose | Status |
|-------------|---------|--------|
| Development | Local Cursor | ✅ Active |
| Staging / UAT | Pre-prod on VPS :3007 | 🟡 Use for PAT dry-run |
| **Pilot production** | Hostinger VPS + domain | 🟡 **Deploy now** — scripts ready |
| Public GA | Open signup | ⛔ After 2–4 week pilot |

Both products share one **multi-tenant SaaS backend**. Mobile and web consume the same `/api` — when VPS is live, **both environments are live** against the same data plane.

---

## What is done (RC1 → RC3 + PAT)

- RC1: Feature audit, ~24% tests → baseline
- RC2: Security, web parity (WhatsApp + retail POS), 92% test surface, OpenAPI
- RC3: Deploy scripts, monitoring stack, load test tooling, DR runbook, Android pipeline
- **PAT:** Single post-deploy gate (`npm run production:acceptance`)
- **War room:** Unified KPI snapshot (`npm run launch:warroom`)

---

## What is intentionally deferred (not pilot blockers)

| Item | When |
|------|------|
| 1,000 VU load test evidence | Before public GA |
| External penetration test | Before public GA |
| iOS app | Post-GA roadmap |
| Web retail refunds UI | API exists; UI polish |
| Measured c8 90% coverage | CI hardening sprint |

---

## Final recommendation (aligned with your objective)

1. **Deploy** to Hostinger VPS using `scripts/ops/pilot-production-deploy.sh`
2. **Confirm** `npm run production:acceptance` → **PASSED**
3. **Onboard 5–10 pilot customers** — prioritize revenue and references
4. **Operate 2–4 weeks** — track war room KPIs daily
5. **Fix from real feedback** — not hypothetical features
6. **GA** only after pilot success + load test + pen test

> Your greatest opportunity is **recurring revenue and customer references**, not more pre-launch functionality.

---

## Sign-off

| Product | Mobile + SaaS pilot | Public GA |
|---------|---------------------|-----------|
| **LeadEdge360** | ✅ **GO** | ⛔ After pilot |
| **RetailEdge360** | ✅ **GO** | ⛔ After pilot |
| **Platform (auth, billing, tenancy)** | ✅ **GO** | ⛔ After pilot |

**Condition:** VPS deployed and PAT **PASSED** before first paying pilot.
