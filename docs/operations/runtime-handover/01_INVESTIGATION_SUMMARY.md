# WS1 — Investigation Summary

**Program:** LeadEdge360 Pilot Runtime Investigation Handover  
**Date:** 2 August 2026  
**Pilot URL:** `https://app.asoftechinsightz.com`  
**Prior packs:** `docs/operations/live-validation/`, `docs/operations/runtime-reconciliation/`  
**Production modified:** **No**

---

## Objective

Resolve deployment uncertainty between the **approved Pilot RC** (LeadEdge360 Phase-1 + AEO Phase-1) and the **live Pilot VPS**, and determine readiness for continued Tenant #1 pilot observation—using evidence only, without engineering changes.

---

## Scope

| In scope | Out of scope |
|----------|--------------|
| External HTTP/runtime probes | Deployments, restarts, git operations |
| SSH attempts from validation host | Code, API, DB, UI changes |
| Comparison: RC vs live vs documentation | Commercial GA, Tenant #2 |
| CS handover checklists | Further remote validation from this agent |

**Approved Pilot RC reference:** Local workspace `asoftech-insightz` with AEO Phase-1 (`docs/aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md`). **Note:** RC is **not a git repository** on the validation machine—no commit SHA exists for RC until ops commits/tags it.

---

## Activities completed

1. **Live deployment verification** — HTTP probes, health/metrics API (`docs/operations/live-validation/`)  
2. **Post-deployment CS enablement** — playbooks and validation docs (`docs/aeo/post-deployment/`)  
3. **Runtime reconciliation** — SSH attempts, alignment matrix, executive assessment (`docs/operations/runtime-reconciliation/`)  
4. **AEO Phase-1 implementation** (local RC only) — frozen; not re-validated in this handover  

**Not completed:** VPS SSH inventory, container file inspection, authenticated UI smoke, nginx/app log collection.

---

## Infrastructure execution (2 Aug 2026, ~13:15 UTC)

PO-authorized Infrastructure checklist execution attempted from validation workstation.

| Action | Result |
|--------|--------|
| SSH `asoftech-vps` (`187.127.179.138:22`, key `asoftech_vps`) | **Connection timed out** |
| SSH `root@185.38.109.200:22` | **Permission denied (publickey,password)** |
| SSH `asoftech@185.38.109.200:22` | **Permission denied (publickey,password)** |
| SSH `root@185.38.109.200:2222` | **Connection timed out** |
| `git rev-parse HEAD` / `docker compose ps` / container AEO paths | **Not executed** — no SSH |
| External HTTP smoke (Phase 7) | **Executed** — see evidence table below |
| nginx / application logs | **Not collected** — SSH required |

**Keys on validation host:** `C:\Users\ARNAV\.ssh\asoftech_vps` only. GitHub Actions `VPS_SSH_KEY` (`asoftech_ci`) **not present**.

**Handover to Customer Success:** **BLOCKED** — Infrastructure cannot confirm Git SHA, Docker image, or AEO container paths.

---

## Evidence collected (facts only)

| Source | Finding |
|--------|---------|
| `GET /api/health` (13:15 UTC) | `status: "pilot"`, `pilotMode: true`, Mongo `connected`; SMTP/Razorpay checks **false** |
| `GET /api/metrics` (13:15 UTC) | `asoftech_process_uptime_seconds 100479`; counters include `opportunities_won_total`, `pos_transactions_total` |
| `GET /dashboard`, `/leadedge360`, `/signin` | HTTP 200 |
| `GET /billing` | HTTP **404** (Next.js) |
| `GET /api/leads`, `/api/kpis` (no session) | HTTP **401** |
| `GET /config/aeo/defaults.json` | HTTP **404** (not publicly served) |
| DNS `app.asoftechinsightz.com` (13:15 UTC) | A `185.38.109.200`–`209` (prior probe: `187.127.179.138`) |
| SSH (infra session) | **Failed** — timeout to `187.127.179.138`; permission denied to `185.38.109.200`; timeout port 2222 |
| Response headers `/dashboard` | `Server: nginx/1.27.5`, HTTP 200 |
| Approved RC file tree | `config/aeo/`, `components/aeo/`, `lib/aeo/`, n8n AEO JSON — **present locally** |
| Local RC `route.js` | No `/api/health` pilot JSON, no `/api/metrics` — **differs from live** |

---

## Evidence missing (requires VPS access)

| Item | Why missing |
|------|-------------|
| Git commit SHA / branch / `git status` | SSH blocked |
| Docker image ID, build date, container IDs | SSH blocked |
| `docker compose ps` | SSH blocked |
| AEO directories inside container | SSH blocked |
| `.env` key presence (full PO list) | SSH blocked |
| nginx / application logs | SSH blocked |
| Authenticated UI (AEO widgets, CRM smoke) | Credentials not used; session not provided |
| Screenshots | Pending authenticated validation |

---

## Final status

| Layer | Status |
|-------|--------|
| External runtime | **Partially healthy** — app serves HTTPS; Mongo up |
| Infrastructure checklist (WS2) | **INCOMPLETE** — SSH blocked 2 Aug 13:15 UTC |
| Deploy parity (RC vs live) | **DIVERGED** — see `runtime-reconciliation/05_DEPLOYMENT_ALIGNMENT.md` |
| AEO on live | **Unconfirmed** (container not inspected) |
| Reconciliation completeness | **Incomplete** — blocked on SSH + auth |
| Authenticated validation (WS3) | **BLOCKED** — awaiting Infrastructure closure |
| Prior executive decision | **OPERATIONS INVESTIGATION REQUIRED** |

**Handover:** Ops must complete `02_INFRASTRUCTURE_CHECKLIST.md` from host with `VPS_SSH_KEY` or firewall-whitelisted IP. Customer Success executes `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` only after Infrastructure sign-off.

---

## Document map (this package)

| # | File | Purpose |
|---|------|---------|
| 01 | This summary | Context |
| 02 | `02_INFRASTRUCTURE_CHECKLIST.md` | VPS execution steps |
| 03 | `03_AUTHENTICATED_VALIDATION_CHECKLIST.md` | CS smoke + screenshots |
| 04 | `04_RUNTIME_RECONCILIATION_MATRIX.md` | Open items + owners |
| 05 | `05_OPERATIONS_DECISION_LOG.md` | Verified vs unknown |
| 06 | `06_PO_DECISION_BRIEF.md` | Executive one-page |

---

**STOP** — No further remote validation from prior agent. Ops owns next steps.
