# Sprint 1 — Technical Design Overview

**Version:** 1.0  
**Date:** 3 August 2026  
**Status:** Design only — **no implementation** (Product Freeze v1.0 until PO lift)  
**Release target:** R1.1 (Foundation GA)  

**Design packages:**

| Epic | Document |
|------|----------|
| E-002 Cookie ↔ JWT Bridge | [E-002_COOKIE_JWT_BRIDGE_DESIGN.md](./E-002_COOKIE_JWT_BRIDGE_DESIGN.md) |
| E-003 Server AEO Profile | [E-003_SERVER_AEO_PROFILE_DESIGN.md](./E-003_SERVER_AEO_PROFILE_DESIGN.md) |
| E-004 Plan Limit Enforcement | [E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md](./E-004_PLAN_LIMIT_ENFORCEMENT_DESIGN.md) |

**Authoritative inputs:** Sprint 0 engineering docs + strategy execution program.

---

## Sprint 1 scope

| Epic | Tag | In R1.1 |
|------|-----|---------|
| E-001 Production validation | Ops (no code) | Prerequisite — parallel to eng |
| **E-002** Cookie ↔ JWT bridge | Enhancement | ✅ |
| **E-003** Server AEO profile | Enhancement | ✅ |
| **E-004** Plan limit enforcement | Enhancement | ✅ |

**Out of scope:** E-005–E-017, new collections, agent layer, UI epics E-006–E-008 (enabled *after* E-002 but not Sprint 1 deliverables unless PO expands scope).

---

## Implementation planning summary

| Epic | Story points | Sprint days (est.) | Dependencies | Can parallel? |
|------|--------------|-------------------|----------------|-------------|
| E-004 | **10** | 2–3 | Freeze lift; accurate `orgs.plan` | Yes — with E-002 start |
| E-002 | **21** | 5–7 | Freeze lift; E-001 recommended | Yes — with E-004 |
| E-003 | **13** | 3–4 | Freeze lift; E-002 recommended for PATCH | After E-002 partial |

**Total eng points (E-002–E-004):** **44** (~2-week sprint for one full-stack + review, or 1 sprint with 2 engineers).

### Merge order (recommended)

```
1. E-004  (isolated billing guard — lowest coupling)
2. E-002  (auth bridge — unlocks future web UIs)
3. E-003  (profile — depends on PATCH path from E-002 or cookie-safe PATCH on auth/me)
```

### Parallel work

| Track A | Track B |
|---------|---------|
| E-004 `checkEntitlement` + route guards | E-002 handler extraction |
| E-004 billing tests | E-002 security tests |
| E-001 ops validation (CS/Ops) | Documentation updates |

### Validation gates

| Gate | Criteria | Owner |
|------|----------|-------|
| **G0** | PO freeze lift for R1.1 | PO |
| **G1** | E-001 WS3 PASS on staging/prod | CS |
| **G2** | `npm run test:billing` green (E-004) | Eng |
| **G3** | Cross-tenant isolation tests PASS (E-002) | Eng |
| **G4** | `npm run test:aeo` green (E-003) | Eng |
| **G5** | WS3 subset for profile + limits | CS |
| **RC** | All gates + PO sign-off R1.1 | PO + TPM |

### Release candidate gate (R1.1)

- E-002–E-004 merged to `staging`  
- Feature flags default **off** in prod until PO enables  
- E-001 complete or documented exceptions  
- No P1 regressions on mobile JWT paths  
- CHANGELOG + release notes drafted  

---

## Architecture extension principle

All three epics **extend** the existing monolith:

- Same `app/api/[[...path]]/route.js` catch-all  
- Same `lib/mobile-routes.js` handler logic (extracted, not duplicated)  
- Same `lib/tenant.js` / `lib/jwt.js` auth stack  
- Same Mongo collections — **E-003 adds fields on existing `users` documents only** (no new collection)  
- No new services layer, no microservices, no auth vendor change  

---

## Cross-epic interactions

| Interaction | Detail |
|-------------|--------|
| E-004 + E-002 | Admin user create guard runs in shared mobile handler — bridge must pass same `orgId` |
| E-003 + E-002 | Profile PATCH via bridged `users/me` or extended `auth/me` PATCH |
| E-003 + E-004 | No direct conflict |
| E-003 + n8n | Ops doc update — reminders read server profile (future HTTP; not code in E-003) |

---

## Sprint 1 readiness (design-complete)

**Score: 72 / 100** (up from 55 pre-design — technical approach locked; execution still blocked on gates).

| Dimension | Score | Note |
|-----------|-------|------|
| Design completeness | 90 | Three epic packages complete |
| Codebase extendability | 78 | Sprint 0 architecture validation |
| Ops / E-001 | 40 | SSH, WS3 still open |
| PO authorization | 0 until lift | Freeze active |
| Test infrastructure | 55 | Scripts exist; CI wiring partial |

---

## Remaining blockers

| ID | Blocker |
|----|---------|
| B-01 | Product Freeze v1.0 — no merge until PO lift |
| B-02 | E-001 — OPS-01–03, CS-01 incomplete |
| B-03 | Tenant #1 credentials for WS3 |
| B-04 | PO decisions on schema fields + grandfather policy (see below) |

---

## Risks (program level)

| Risk | Mitigation in design |
|------|----------------------|
| Cross-tenant leak (E-002) | Shared actor type; mandatory isolation tests |
| Profile/KPI drift (E-003) | Server-first load; single compute path |
| Tenant blocked at cap (E-004) | Feature flag + grandfather env |
| Mobile regression | JWT path unchanged; shared handlers |
| Scope creep into E-006–E-008 UI | Explicit out of scope in epic docs |

---

## Open design decisions (PO approval required)

| ID | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| **PO-D1** | E-003 profile PATCH surface | (A) Extend `PATCH /api/auth/me` (B) Bridge `PATCH /api/users/me` | **B** via E-002 — reuses mobile contract |
| **PO-D2** | E-003 sessionStorage on rollout | (A) Server-only immediately (B) Merge local→server once (C) Dual-write period | **B** one-time merge on first load |
| **PO-D3** | E-004 grandfather Tenant #1 | (A) Enforce immediately (B) `GRANDFATHER_ORG_IDS` env (C) Delay enforcement 30d | **B** for pilot |
| **PO-D4** | E-004 HTTP status for limit | (A) 403 (B) 402 Payment Required | **402** for commercial clarity |
| **PO-D5** | E-002 flag default in prod | (A) Off until CS ready (B) On for pilot only | **A** — enable after WS3 |
| **PO-D6** | E-003 `aeoChecklistState` storage | (A) Inside `preferences` (B) Derive from profile only | **A** if checklist toggles differ from profile fields |

---

## Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 3 Aug 2026 | Initial Sprint 1 technical design program |

**STOP** — Design complete. Implementation awaits PO freeze lift.
