# Sprint 1 — Security Report (RC-1)

**Date:** 3 August 2026  
**Scope:** Tenant/org isolation, auth surfaces, bridge, plan enforcement, webhooks, audit  

---

## Controls verified (code review)

| Control | Implementation | RC-1 |
|---------|----------------|------|
| Tenant isolation (CRM) | `orgId` on all lead/product queries | ✅ |
| Org isolation (mobile handlers) | `user.orgId` on followups/WA/admin | ✅ |
| Cookie authentication | Emergent `emergent_session` via `resolveTenant` | ✅ Unchanged |
| JWT authentication | `verifyAccessToken` + `requireAuth` | ✅ Unchanged |
| Bridge authentication | `resolveWebActor` — no JWT issued to browser | ✅ |
| JWT before bridge | `resolveAuthDispatch` Bearer-first | ✅ |
| PATCH `users/me` scope | `updateOne({ id, orgId })` | ✅ E-003 |
| Cross-tenant PATCH | orgId in filter | ✅ |
| Admin role enforcement | `admin` / `superadmin` in `handleAdmin` | ✅ |
| Plan bypass | Flag OFF = no enforcement; grandfather env | ✅ |
| Demo exempt (E-004) | `demo-org` exempt | ✅ |
| Webhook protection | `x-webhook-token` / dev mode | ✅ `ingestWebhookAllowed` |
| n8n ingest orgId | Body `orgId` + entitlement when ON | ✅ |
| Billing verify org | `pending.orgId !== orgId` → 403 | ✅ |
| AEO profile audit | `aeo.profile.updated` audit log | ✅ E-003 |
| AEO PATCH PII logging | Audit stores field keys only | ✅ |
| Bridge disabled cookie | 404 on bridged roots (no auth leak) | ✅ |

---

## Security tests

| Test | Method | Result |
|------|--------|--------|
| JWT cross-tenant followups | `test:bridge` integration | ⏳ Skipped (no Mongo) |
| Cookie bridge cross-tenant | `test:bridge` integration | ⏳ Skipped |
| Agent denied admin | `test:bridge` integration | ⏳ Skipped |
| Dispatch policy (no Bearer bypass) | Unit | ✅ PASS |
| Invalid AEO URL on PATCH | `test:aeo` merge | ✅ PASS |

---

## Findings

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| SEC-01 | **Medium** | Mongo integration security tests not executed on RC workstation | Run `test:bridge` + `test:billing` on staging CI with Mongo |
| SEC-02 | **Low** | `N8N_WEBHOOK_TOKEN=change-me` allows dev-mode open ingest | Ensure prod token set before enforcement ON |
| SEC-03 | **Low** | Webhook ingest accepts `body.orgId` — intentional for n8n | Document allowed orgIds per tenant in ops |
| SEC-04 | **Info** | Last-write-wins on AEO PATCH | Acceptable for MSME single-user default |

**Critical security issues:** **0**  
**Cross-tenant issues confirmed:** **0** (none observed; live isolation tests pending)

---

## Security score

| Dimension | Score |
|-----------|-------|
| Design alignment | 92 |
| Implementation hygiene | 88 |
| Test evidence | 58 |
| **Security RC subscore** | **82** |

Authentication regression: **None identified** in code review. Live JWT/cookie matrix on staging still required.
