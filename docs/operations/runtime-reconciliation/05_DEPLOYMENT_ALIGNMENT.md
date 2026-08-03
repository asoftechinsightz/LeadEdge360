# WS5 — Deployment Alignment

**Date:** 2 August 2026  
**Comparison bases:**

| Label | Definition |
|-------|------------|
| **Approved Pilot RC** | Local workspace `C:\Users\ARNAV\Downloads\asoftech-insightz-v1.2.0\asoftech-insightz` — Phase-1 + AEO Phase-1 implemented; **not a git commit** |
| **Live VPS runtime** | `https://app.asoftechinsightz.com` — external probes + blocked SSH |
| **Pilot documentation** | `docs/aeo/*`, `docs/operations/live-validation/*`, `docs/PHASE1_DEPLOYMENT_VERIFICATION.md` |

---

## 1. Classification

# **DIVERGED**

Live pilot runtime fingerprint **does not match** approved Pilot RC file tree and documented Phase-1 routes. Authoritative git/Docker parity **not proven** (SSH blocked).

| Tier | Classification |
|------|----------------|
| Git / Docker identity | **Unknown** — cannot classify Fully/Partial without SHA |
| Application behavior | **Diverged** |
| AEO Phase-1 | **Unverified on live** — likely **not deployed** with RC |
| Documentation vs live | **Partially aligned** — docs describe RC; live differs |

---

## 2. Difference register (every item found)

### 2.1 Source control & deploy pipeline

| # | Aspect | Approved Pilot RC | Live VPS | Docs expectation |
|---|--------|-------------------|----------|------------------|
| D-01 | Git repository | Local folder **not a git repo** | `/opt/asoftech` git clone (per deploy.yml) — **not inspected** | GitHub `main` deploy |
| D-02 | Commit SHA | **None** | **Unknown** | Should match deployed `origin/main` |
| D-03 | Branch | **None** | **Unknown** | `main` per CI |
| D-04 | CI deploy artifact | AEO + Phase-1 files in local tree | **Unknown** image contents | Post-push docker compose build |

### 2.2 API surface

| # | Aspect | Approved RC | Live | Notes |
|---|--------|-------------|------|-------|
| D-05 | `GET /api/` | Simple `ok` JSON | `ok` JSON (after redirect) | Aligned |
| D-06 | `GET /api/health` | **Not implemented** in RC `route.js` | **Full pilot health JSON** | **Diverged** |
| D-07 | `GET /api/metrics` | **Not implemented** in RC | Prometheus metrics + opportunities counters | **Diverged** |
| D-08 | `GET /api/leads` (no cookie) | Works in RC web demo path | **401** | **Diverged** — stricter auth on live |
| D-09 | `GET /api/version` etc. | N/A | **401** | Live has gated meta routes |

### 2.3 Application routes (Next.js)

| # | Route | Approved RC | Live (2 Aug) | Docs |
|---|-------|-------------|--------------|------|
| D-10 | `/dashboard` | `app/(application)/dashboard` + AEO | 200 | Phase-1 doc |
| D-11 | `/leadedge360` | CRM + AEO strip | 200 | Aligned route |
| D-12 | `/billing` | `app/(application)/billing` | **404** | Phase-1 doc — **missing live** |
| D-13 | `/retailedge360` | Present | 200 | Aligned |
| D-14 | `AppShell` / `(application)` group | Present in RC | **Unverified** in HTML without auth | Phase-1 doc |

### 2.4 AEO Phase-1 artifacts

| # | Artifact | Approved RC | Live container | Live HTTP |
|---|----------|-------------|----------------|-----------|
| D-15 | `config/aeo/` (13 files) | **Present** | **Not verified** | `/config/aeo/defaults.json` → 404 |
| D-16 | `components/aeo/AeoGrowthEngine.jsx` | **Present** | **Not verified** | No SSR AEO strings |
| D-17 | `lib/aeo/*` (5 modules) | **Present** | **Not verified** | — |
| D-18 | `runAeoPrompt()` in `lib/scoring.js` | **Present** | **Not verified** | — |
| D-19 | n8n `aeo-*.json` (3 files) | **Present** in repo | **Not verified** on VPS | — |
| D-20 | Dashboard AEO UI integration | `dashboard/page.js` imports AEO | **Not confirmed** live | AEO post-deploy docs |

### 2.5 Platform / pilot configuration

| # | Aspect | Approved RC `.env.example` | Live `/api/health` |
|---|--------|---------------------------|-------------------|
| D-21 | `PILOT_MODE` | Not in RC example | `pilotMode: true` on live |
| D-22 | Razorpay keys | Listed in example | `keysConfigured: false` |
| D-23 | SMTP | Not in RC health | Missing — dry_run |
| D-24 | Opportunities / POS metrics | **Not in RC** | **Present** in `/api/metrics` |

### 2.6 CRM product scope (documentation alignment)

| # | Module | Pilot docs | RC | Live |
|---|--------|------------|-----|------|
| D-25 | Opportunity module UI | WS3 asks validation | **Not in RC CRM** | Metrics suggest backend counters |
| D-26 | Customer 360 | WS3 asks validation | **Not in RC** | **Unknown** |
| D-27 | Proposal | Status in CRM | Status `Proposal` | **Unknown** UI without auth |

### 2.7 Operations / access

| # | Aspect | Expected | Actual |
|---|--------|----------|--------|
| D-28 | SSH inventory | WS1 complete | **Blocked** — timeout / auth failure |
| D-29 | Authenticated smoke | WS3 complete | **AUTHENTICATED VALIDATION PENDING** |
| D-30 | Screenshots | Captured | **None** |

---

## 3. Alignment summary table

| Dimension | Fully aligned | Partially aligned | Diverged |
|-----------|---------------|-------------------|----------|
| Git SHA / image ID | — | — | **Cannot assess** |
| Core HTTPS + Mongo | ✓ | | |
| CRM routes `/leadedge360` | ✓ | | |
| Phase-1 `/billing` | | | ✓ |
| AEO Phase-1 bundle | | | ✓ (likely) |
| API health/metrics | | | ✓ |
| Auth policy | | | ✓ |
| CS documentation vs live | | ✓ | |

---

## 4. WS5 verdict

**DIVERGED** — Approved Pilot RC (local AEO Phase-1 tree) is **not demonstrated** on live pilot. Live host runs a **different pilot platform build** (health/metrics/opportunities) with **missing Phase-1 routes** and **unconfirmed AEO**.

**Remediation path (ops only — not executed):** Deploy PO-approved commit containing RC tree; re-run WS1–WS3 with SSH + auth.

---

## Related

- [02_AEO_DEPLOYMENT_VERIFICATION.md](./02_AEO_DEPLOYMENT_VERIFICATION.md)  
- [06_EXECUTIVE_RUNTIME_ASSESSMENT.md](./06_EXECUTIVE_RUNTIME_ASSESSMENT.md)
