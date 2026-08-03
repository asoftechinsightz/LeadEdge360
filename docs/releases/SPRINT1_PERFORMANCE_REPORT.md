# Sprint 1 — Performance Report (RC-1)

**Date:** 3 August 2026  
**Note:** RC-1 did not run live load tests against staging. Measurements are **estimated** from architecture review and prior build artifacts.

---

## Targets vs RC-1 status

| Operation | Expected impact (Sprint 1) | Measured in RC-1 |
|-----------|---------------------------|------------------|
| Dashboard load | +1 `auth/me` when AEO flag ON | ⏳ Not profiled |
| Lead save | +1 entitlement DB read when ENFORCE ON | ⏳ Not profiled |
| AEO save | Debounced PATCH 800ms; client compute only | ⏳ Not profiled |
| Profile load | `auth/me` includes preferences (~2–5 KB) | ⏳ Not profiled |
| Profile update | Single `updateOne` + optional audit | ⏳ Not profiled |
| JWT bridge | +`resolveWebActor` DB read on cookie bridged routes | ⏳ Not profiled |
| Billing enforcement | +org lookup + count per guarded POST | ⏳ Not profiled |

---

## Bundle / memory (workstation)

| Metric | Value | Notes |
|--------|-------|-------|
| `.next` artifact total | ~245 MB | Prior partial build on disk |
| Fresh `npm run build` | Failed | Google Fonts TLS (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`) |
| Sprint 1 bundle delta | Not isolated | Changes are mostly server-side + small client hydrate |
| New client deps | None | Reused existing AEO components |

**Assessment:** Sprint 1 epics add **minimal client bundle growth** (profile hydrate + debounced fetch). Server handlers add one DB round-trip on guarded/bridged paths when flags ON.

---

## Performance risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Debounced AEO PATCH storm | Low | 800ms debounce; single user default |
| Double `mobileRoute` call on legacy paths | Low | Second call returns null quickly |
| Lead month count on every create | Medium when ENFORCE ON | Indexed `orgId` + `createdAt` — verify index on staging |
| Large `preferences.aeoProfile` on `auth/me` | Low | ~5 KB typical |

---

## Performance score

| Dimension | Score |
|-----------|-------|
| Architectural overhead | 85 |
| Empirical measurement | 40 |
| **Performance RC subscore** | **68** |

**Recommendation:** Run staging smoke with Lighthouse + `curl` timings for `auth/me`, `kpis`, PATCH `users/me` before prod flag enable.
