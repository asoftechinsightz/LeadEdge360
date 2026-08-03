# WS4 — Runtime Reconciliation Matrix

**Date:** 2 August 2026 (updated after Infrastructure execution session, ~13:16 UTC)  
**Status:** Infrastructure items **open** — SSH blocked; CS items **pending**  
**Evidence sources:** `runtime-reconciliation/`, `live-validation/`, `runtime-handover/02_INFRASTRUCTURE_CHECKLIST.md`

---

## Unresolved items

| Item | Current State | Evidence | Owner | Blocking? |
|------|---------------|----------|-------|-----------|
| **Git SHA** | Unknown on VPS | SSH failed 2 Aug 13:15 UTC (timeout + permission denied); RC local has **no git SHA** | **Infrastructure** | **Yes** |
| **Running branch** | Unknown | SSH not completed | **Infrastructure** | **Yes** |
| **Docker image** | Unknown ID/timestamp | SSH not completed | **Infrastructure** | **Yes** |
| **Container IDs** | Unknown | SSH not completed | **Infrastructure** | **Yes** |
| **Docker Compose version** | Unknown | SSH not completed | **Infrastructure** | **Yes** |
| **AEO deployment** | Unconfirmed on live; **present in RC** | RC: 13 `config/aeo` files, `AeoGrowthEngine.jsx`, `lib/aeo/*`; Live: no `docker exec` proof | **Infrastructure** | **Yes** (for AEO pilot) |
| **Billing route** | **404** on live | `GET /billing` → 404 (13:15 UTC); RC has `app/(application)/billing` | **Infrastructure** + **PO** | **Yes** (billing flows) |
| **Metrics mismatch** | Live has `/api/metrics` + `opportunities_won_total`; RC `route.js` lacks these | `GET /api/metrics` 13:15 UTC; local code grep | **Infrastructure** + **PO** | **Yes** (parity) |
| **Runtime parity** | **Diverged** | 30 differences in `runtime-reconciliation/05_DEPLOYMENT_ALIGNMENT.md` | **PO** + **Infrastructure** | **Yes** |
| **SSH access** | Validation host blocked | 4 failed attempts 2 Aug 13:15 UTC in `02_INFRASTRUCTURE_CHECKLIST.md` | **Infrastructure** | **Yes** |
| **Authenticated smoke** | Not executed | AUTHENTICATED VALIDATION PENDING — CS blocked until WS2 complete | **Customer Success** | **Yes** (Tenant #1) |
| **nginx / app logs** | Not collected | SSH required | **Infrastructure** | Partial |
| **Screenshots** | None | WS3 pending | **Customer Success** | Partial |
| **Env: MONGO_URL** | `.env` presence **not verified** | Mongo `connected` in `/api/health` 13:15 UTC — does not prove `.env` key | **Infrastructure** | **Yes** |
| **Env: JWT_SECRET** | Unknown | SSH required for `.env` grep | **Infrastructure** | Partial (mobile JWT) |
| **Env: CERT_ADMIN_EMAIL** | Unknown | SSH required | **Infrastructure** | Partial |
| **Env: CERT_ADMIN_PASSWORD** | Unknown | SSH required | **Infrastructure** | Partial |
| **Env: EMERGENT_LLM_KEY** | Unknown | SSH required | **Infrastructure** | Partial (AI buttons) |
| **Env: PILOT_MODE** | `.env` **not verified** | `/api/health` `pilotMode: true` 13:15 UTC | **Infrastructure** | Partial |
| **Env: REQUIRE_AUTH** | Unknown | SSH required; unauthenticated APIs return 401 | **Infrastructure** | Partial |
| **Razorpay / SMTP** | **Missing** (effective) | `/api/health` checks false 13:15 UTC | **Infrastructure** | Partial (checkout/email) |
| **`/leadedge360` 500** | Not reproduced | **200** at 13:15 UTC | **Infrastructure** | Monitor |
| **RC git tag** | RC not committed | Local workspace not a git repo | **Engineering** (post-freeze) / **PO** | **Yes** (traceability) |
| **VPS_SSH_KEY on ops host** | Missing on validation workstation | Only `asoftech_vps` key present; deploy uses `asoftech_ci` | **Infrastructure** | **Yes** |

---

## Resolved items (no further action unless regression)

| Item | State | Evidence | Owner | Blocking? |
|------|-------|----------|-------|-----------|
| HTTPS / TLS | Working | 200 on app URLs; HSTS | Infrastructure | No |
| Mongo connectivity | Connected | `/api/health` `database.ok: true` 13:15 UTC | Infrastructure | No |
| `/api/health` pilot endpoint | Working | JSON captured 2 Aug 13:15 UTC | — | No |
| `/signin` | 200 | HTTP probe 13:15 UTC | — | No |
| `/dashboard` | 200 | HTTP probe 13:15 UTC; nginx 1.27.5 | — | No |
| `/leadedge360` | 200 | HTTP probe 13:15 UTC | — | No |
| `/retailedge360` | 200 | HTTP probe (prior session) | — | No |
| Unauthenticated API guard | 401 | `/api/leads`, `/api/kpis` 13:16 UTC | — | No |
| CS documentation | Ready in repo | `docs/aeo/post-deployment/` | Customer Success | No |
| No production changes by validation | Confirmed | Read-only probes only | — | No |
| Infrastructure Phase 7 external smoke | Executed | `02_INFRASTRUCTURE_CHECKLIST.md` § Phase 7 | Infrastructure | No |

---

## Closure criteria (per row)

| Item | Closed when |
|------|-------------|
| Git SHA | Ops records SHA; PO confirms match to approved tag |
| Docker image | Ops records image ID + CreatedAt |
| AEO deployment | `docker exec` shows `config/aeo`, `components/aeo`, `lib/aeo` **Present** + CS WS3 AEO PASS |
| Billing route | `/billing` → 200 or PO removes from CS scripts |
| Metrics mismatch | PO documents which build is canonical; SHA aligned |
| Runtime parity | `05_DEPLOYMENT_ALIGNMENT` → Fully or Partially aligned |
| Authenticated smoke | `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` signed |
| SSH access | Successful login from authorized ops host; Phases 1–6 + 8 recorded |

---

## Reference (no duplicate narrative)

- Full difference list: `runtime-reconciliation/05_DEPLOYMENT_ALIGNMENT.md`  
- SSH commands: `runtime-handover/02_INFRASTRUCTURE_CHECKLIST.md`  
- Infrastructure execution log: `02_INFRASTRUCTURE_CHECKLIST.md` (session 2 Aug 13:15 UTC)
