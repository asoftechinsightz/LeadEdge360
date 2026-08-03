# Sprint 1 — Feature Flag Matrix (RC-1)

**Date:** 3 August 2026  
**Flags:** `ENFORCE_PLAN_LIMITS` · `WEB_JWT_BRIDGE` · `AEO_SERVER_PROFILE`  

All flags default **OFF** in `.env.example`.

---

## Combination matrix

| # | ENFORCE | BRIDGE | AEO | Intended behavior | Automated validation | Live staging |
|---|---------|--------|-----|-------------------|----------------------|--------------|
| 1 | OFF | OFF | OFF | **Baseline (prod default)** — no plan blocks; JWT-only mobile roots 404 for cookie; AEO sessionStorage only | ✅ Dispatch/unit logic | ⏳ Pending |
| 2 | ON | OFF | OFF | Plan limits on leads/products/webhooks/admin users; cookie cannot hit bridged mobile APIs | ⏳ `test:billing` needs Mongo | ⏳ Pending |
| 3 | ON | ON | OFF | Limits + cookie bridge to followups/dashboard/WA/admin/users; AEO load from `auth/me` but save local | ⏳ Bridge dispatch ✅; billing ⏳ | ⏳ Pending |
| 4 | ON | ON | ON | **Full Sprint 1** — limits + bridge + server AEO PATCH | ⏳ Partial | ⏳ Pending |

---

## Per-flag behavior

### `ENFORCE_PLAN_LIMITS`

| State | Lead POST | Product POST | Webhook ingest | Admin user POST |
|-------|-----------|--------------|----------------|-----------------|
| OFF | Allowed | Allowed | Allowed | Allowed |
| ON | 402/403 at cap | 403 if retail disabled | 402 at cap | 402 at user cap |

Exempt: `demo-org`, `GRANDFATHER_ORG_IDS`.

### `WEB_JWT_BRIDGE`

| State | Cookie on `/api/followups` | Cookie on `/api/leads` | Bearer JWT mobile |
|-------|---------------------------|------------------------|-------------------|
| OFF | 404 | 200 (legacy handler) | 200 |
| ON | 200 via shared handler | 200 (unchanged) | 200 (JWT first) |

### `AEO_SERVER_PROFILE`

| State | Profile load | Profile save |
|-------|--------------|----------------|
| OFF | sessionStorage | sessionStorage |
| ON | `GET /api/auth/me` → `preferences.aeoProfile` | PATCH `/api/users/me` **only if** `WEB_JWT_BRIDGE=ON`; else local + UI notice |

---

## Rollback (instant)

Set all three to `false` and redeploy. No data migration required.

---

## RC-1 verdict on matrix

| Item | Status |
|------|--------|
| Code paths for all 4 combinations | ✅ Implemented |
| Unit/dispatch tests for flags | ✅ `test:bridge` (8), `test:aeo` merge (9) |
| Live HTTP matrix on staging | ❌ Not executed in RC-1 workstation run |
