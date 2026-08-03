# WS5 — Operations Decision Log

**Program:** Pilot Runtime Investigation Handover  
**Date:** 2 August 2026 (Infrastructure execution update ~13:16 UTC)  
**Production changes by validation agent:** **None**

---

## 1. What has been verified (evidence-based)

| # | Finding | Source | Date |
|---|---------|--------|------|
| V-01 | Pilot URL serves HTTPS; nginx 1.27.5 | HTTP headers | 2 Aug 2026 |
| V-02 | `GET /api/health` returns pilot status; Mongo connected | API JSON | 2 Aug 2026 |
| V-03 | `GET /api/metrics` returns Prometheus-style metrics | API text | 2 Aug 2026 |
| V-04 | Live metrics include `opportunities_won_total`, `pos_transactions_total` | API text | 2 Aug 2026 |
| V-05 | `/dashboard`, `/leadedge360`, `/signin`, `/retailedge360` → 200 | HTTP probes | 2 Aug 2026 |
| V-06 | `/billing` → 404 (Next.js) | HTTP probe | 2 Aug 2026 |
| V-07 | Unauthenticated `/api/leads` → 401 | HTTP probe | 2 Aug 2026 |
| V-08 | Approved RC (local) contains full AEO Phase-1 tree | File audit | Pre-handover |
| V-09 | Local RC `route.js` lacks live `/api/health` pilot shape | Code vs API compare | 2 Aug 2026 |
| V-10 | SSH from validation environment to VPS **not achieved** | SSH logs | 2 Aug 2026 |
| V-14 | Infrastructure checklist executed; Phases 1–6 + 8 **blocked** on SSH | `02_INFRASTRUCTURE_CHECKLIST.md` | 2 Aug 2026 13:15 UTC |
| V-15 | External smoke re-run: health/metrics/HTTP codes match prior findings | curl 13:15–13:16 UTC | 2 Aug 2026 |
| V-16 | DNS A records `185.38.109.200`–`209` (variance vs `187.127.179.138`) | nslookup 13:15 UTC | 2 Aug 2026 |
| V-17 | Only `asoftech_vps` SSH key on validation host; no `asoftech_ci` | `~/.ssh` listing | 2 Aug 2026 |
| V-11 | CS playbooks and post-deploy docs **ready in repo** | `docs/aeo/post-deployment/` | Pre-handover |
| V-12 | Razorpay and SMTP **not configured** on live (health) | `/api/health` | 2 Aug 2026 |
| V-13 | `pilotMode: true` on live | `/api/health` | 2 Aug 2026 |

---

## 2. What remains unknown

| # | Unknown | Why |
|---|---------|-----|
| U-01 | VPS `git rev-parse HEAD` | No SSH |
| U-02 | Active git branch and dirty state | No SSH |
| U-03 | Docker image ID and image build timestamp | No SSH |
| U-04 | Container IDs for app/mongo/n8n | No SSH |
| U-05 | Whether `config/aeo`, `components/aeo`, `lib/aeo` exist **inside** running container | No SSH |
| U-06 | n8n AEO workflows imported/active on VPS | No SSH / n8n UI |
| U-07 | Full `.env` presence matrix (JWT, CERT_ADMIN, EMERGENT_LLM_KEY, etc.) | No SSH |
| U-08 | nginx config (root redirect port 3000 issue) | No SSH |
| U-09 | Application stack traces for historical `/leadedge360` 500 | No logs |
| U-10 | AEO UI visible to logged-in user | No authenticated session |
| U-11 | Lead CRUD, rescore, CRM charts under real tenant data | No authenticated session |
| U-12 | Opportunity UI vs metrics-only backend | No authenticated session |
| U-13 | PO-approved RC **commit SHA** (RC not in git locally) | Process gap |
| U-14 | Correct SSH key / firewall path for ops host | `asoftech_vps` rejected; `187.127.179.138` timeout |

---

## 3. Infrastructure execution outcome (2 Aug 2026)

| Task | Status |
|------|--------|
| WS2 Phase 0 SSH access | **FAIL** |
| WS2 Phases 1–6 (git, docker, env, volumes, AEO) | **NOT EXECUTED** |
| WS2 Phase 7 external smoke | **COMPLETE** |
| WS2 Phase 8 logs | **NOT COLLECTED** |
| WS3 authenticated validation | **NOT STARTED** — prerequisite failed |
| WS4 matrix infra rows | **OPEN** |
| WS6 PO infra success criteria | **NOT MET** |

**Escalation:** Run checklist from GitHub Actions runner (has `VPS_SSH_KEY`) or ops bastion with `asoftech_ci`; verify VPS firewall allows SSH from that host. Align DNS/SSH target (`185.38.109.x` vs `187.127.179.138`).

---

## 4. Why further verification requires VPS access

| Capability | External HTTP only | Requires VPS SSH |
|------------|--------------------|------------------|
| Git SHA / branch | ✗ | ✓ `git` in `/opt/asoftech` |
| Docker image/build time | ✗ | ✓ `docker images`, `docker inspect` |
| Files inside container | ✗ | ✓ `docker exec` |
| `.env` key presence (no values) | Partial infer from health | ✓ `grep ^KEY= .env` |
| nginx / Docker logs | ✗ | ✓ `tail`, `docker logs` |
| n8n workflow state | ✗ | ✓ n8n UI or host filesystem |

Authenticated browser session requires **credentials** (CS/Ops) — not replaceable by anonymous HTTP.

---

## 5. Risks of proceeding without verification

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tenant #1 onboarded on build **without AEO** | CS promises unmet; pilot failure perception | Complete WS2 §6 + WS3 AEO checks before kickoff |
| PO continues pilot on **wrong git SHA** | Engineering fixes never reach production | Ops records SHA; PO sign-off vs tag |
| Billing CS scripts hit **404** | Broken onboarding | Fix deploy or remove `/billing` from scripts |
| Opportunity metrics without UI | User confusion | CS documents actual modules after WS3 |
| Razorpay/SMTP missing | No checkout / email | Configure keys or disable flows in CS messaging |
| False "healthy" from `/api/health` | Hidden deploy drift | Full parity matrix closure |

---

## 6. Decisions recorded (validation phase — not PO final)

| Decision | Rationale |
|----------|-----------|
| Stop remote validation | SSH blocked; no authorized credentials for live login |
| Classify alignment **DIVERGED** | Live API/routes ≠ local RC fingerprint |
| Do **not** deploy or restart | PO freeze + handover scope |
| Hand off to Infrastructure | Only path to close U-01–U-09 |
| Infrastructure execution attempted | WS2 Phase 7 only; Phases 1–6 + 8 blocked on SSH 2 Aug 13:15 UTC |

---

## 7. Next decision owner

| Decision | Options | Owner |
|----------|---------|-------|
| Ops verification authorized | See `06_PO_DECISION_BRIEF.md` | **Product Owner** |
| Deploy RC after verification | Only after PO lift + explicit deploy auth | **Product Owner** |
| Tenant #1 CS kickoff | After WS2 + WS3 pass | **Product Owner** + CS |
| SSH remediation | Whitelist ops IP / provide `asoftech_ci` key | **Infrastructure** |

---

## Related
- [runtime-reconciliation/06_EXECUTIVE_RUNTIME_ASSESSMENT.md](../runtime-reconciliation/06_EXECUTIVE_RUNTIME_ASSESSMENT.md)
