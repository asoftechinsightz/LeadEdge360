# Asoftech Business Suite — Mobile App Development Plan

**Status:** Phase 1 complete · Phase 2 pending approval  
**API Report:** [API_INTEGRATION_REPORT.md](./API_INTEGRATION_REPORT.md)

---

## Phase overview

| Phase | Deliverable | Status |
|-------|-------------|--------|
| **1** | API Integration Report | ✅ Complete |
| **2** | Flutter project + auth + shell | ✅ Complete |
| **3** | LeadEdge360 module | ✅ Complete |
| **4** | Offline sync + notifications | ✅ Complete |
| **5** | AI Assistant | ✅ Complete |
| **6** | RetailEdge360 (API + UI) | ✅ Complete |
| **7** | Security hardening + Play Store | ✅ Complete |

---

## v1.0 scope (recommended first release)

**In scope:**
- Android APK/AAB
- Login, forgot password, biometric unlock
- Product selection / switching
- LeadEdge360: dashboard, leads, detail, timeline, notes, follow-ups, tasks, pipeline, search
- Push notifications (FCM register)
- Offline lead list cache + sync
- AI suggest on lead detail

**Out of scope v1.0:**
- Retail POS (WebView fallback or v1.1)
- iOS (Android-first per directive)
- OAuth Google login (not in backend)

---

## Approval gate

Phase 2 complete. Phase 3 complete. Phase 4 complete. Phase 5 complete. Phase 6 complete. **Phase 7 complete — v1.0 mobile ready for Play Store internal testing.**

- [x] API Integration Report reviewed
- [x] v1.0 scope confirmed
- [x] Production API URL: `https://asoftechinsightz.com/api`
- [ ] FCM Firebase project created for push (Phase 4 — enable with `ENABLE_FCM=true`)
- [ ] Play Store developer account ready (Phase 7 — see `mobile/docs/PLAY_STORE_RELEASE.md`)

**Flutter project:** `mobile/` — see `mobile/README.md`

---

## Module → API mapping (quick reference)

| Flutter module | Primary APIs |
|----------------|--------------|
| Auth | `/auth/login-password`, `/auth/refresh-token`, `/auth/forgot-password` |
| Shell | `/products`, `/mobile/bootstrap`, `/notifications` |
| Lead list | `/mobile-leads`, `/sales/leads` |
| Lead detail | `/mobile/leads/:id` |
| Follow-ups | `/followups`, `/mobile/leads/:id/followup` |
| Pipeline | `/opportunities/pipeline`, `/opportunities/move` |
| Analytics | `/mobile/analytics`, `/dashboard/kpis` |
| AI | `/ai/suggest` |
| Sync | `/mobile/sync`, `/mobile/sync/changes` |
| Retail | `/retail/inventory`, `/retail/kpis` (+ new POS APIs) |

See full report for complete endpoint list.
