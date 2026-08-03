# RC Source of Truth

**Date:** 4 August 2026  
**Purpose:** Single reference for Git alignment — **no merge, no deploy**  

---

## Source-of-truth hierarchy

| Priority | Source | Role |
|----------|--------|------|
| **1 (target)** | Certified Sprint-1 workstation tree | Engineering-complete RC per [SPRINT1_RC_INVENTORY.md](./SPRINT1_RC_INVENTORY.md) |
| **2 (pending)** | GitHub `arnav02champ/AsoftechLeadEdge360` | Must receive RC publication + SHA |
| **3 (runtime)** | VPS `/opt/asoftech-insightz` | Production disk + containers |
| **4 (automation)** | `.github/workflows/deploy.yml` | Resets to `origin/main` on deploy |

Until **Priority 2** matches **Priority 1**, Git is **not** source of truth for Sprint-1 RC.

---

## Current state snapshot

### VPS production (runtime)

| Field | Value |
|-------|-------|
| **Host** | `leadedge360` (`187.127.179.138`) |
| **Running container image** | `asoftech-insightz-app` |
| **Container created** | `2026-08-03T12:03:52Z` |
| **Built from (logical)** | `feature/homepage-phase1` @ `0e1b7e8` (pre-intervention) |
| **Public URL** | `https://app.asoftechinsightz.com` |

### VPS Git (disk — 4 Aug 2026)

| Field | Value |
|-------|-------|
| **Current branch** | `main` |
| **Current SHA** | `d96e63d4800bd5e9b750c848e47ac6b8f7fbf196` |
| **Commit message** | `infra: align deploy path to /opt/asoftech-insightz (P0)` |
| **Remote** | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |
| **Push status** | Local commit **not pushed** (`Repository not found`) |

### VPS reference branches

| Branch / ref | SHA | Notes |
|--------------|-----|-------|
| `feature/homepage-phase1` | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` | Sprint17 homepage — **matches running container era** |
| `main` (remote baseline) | `5cb6f189e15de610b50c9a3d184850a882d019b4` | CRM Phase 1-6 stable |
| `main` (local + path fix) | `d96e63d` | Deploy path only |
| Tag `v1.2.0` | `6f4fea1dc68e7c6353f79ade020c09df575397b4` | Legacy tag — not Sprint-1 RC |

---

## Approved RC (publication target)

| Field | Value |
|-------|-------|
| **Release name** | Sprint-1 RC — R1.1 Foundation GA |
| **Logical ID** | `SPRINT1-RC-2026-08-03` |
| **Approved RC SHA** | **TBD** — assign on Git push |
| **Approved RC branch** | **`main`** (recommended) or PO-named release branch |
| **Workstation path** | `asoftech-insightz-v1.2.0/asoftech-insightz` |
| **Certification** | RC-3 overall score 82/100 — Commercial GA **not** authorized |

**Provisional SHA after publication:** PO records in [SPRINT1_RELEASE_MANIFEST.md](./SPRINT1_RELEASE_MANIFEST.md).

---

## Alignment matrix

| Comparison | Aligned? |
|------------|----------|
| Approved RC tree ↔ VPS `feature/homepage-phase1` | **NO** — Sprint-1 files missing on VPS |
| Approved RC tree ↔ VPS `main` (5cb6f18) | **NO** |
| Approved RC tree ↔ VPS `main` (d96e63d) | **NO** — only path-fix delta |
| VPS disk ↔ running container | **MISALIGNED** — disk on `main`/`d96e63d`; container from `0e1b7e8` era |
| `deploy.yml` target ↔ VPS app path | **YES** on local `d96e63d` (not on remote) |

---

## Material file differences (certified RC vs VPS `feature/homepage-phase1`)

**Present only in certified RC tree (not in VPS Git):**

| Path | Epic / area |
|------|-------------|
| `lib/security-config.js` | Security Phase-0 |
| `lib/request-actor.js` | E-002 |
| `lib/billing/plan-entitlements.js` | E-004 |
| `lib/billing/org-billing.js`, `audit.js` (as integrated in RC) | E-004 |
| `lib/aeo/*` (full server-profile integration) | E-003 |
| Security-hardened `app/api/[[...path]]/route.js` | E-002 + security |
| `scripts/rc/*`, `scripts/rc-ci-runner.mjs` | RC validation |
| `docs/security/SECURITY_REMEDIATION_*` | Security |
| `.github/workflows/rc-validation.yml` (Sprint-1 env) | CI |

**Present on VPS `feature/homepage-phase1` but not in Sprint-1 RC scope:**

| Area | Examples |
|------|----------|
| Sprint17 homepage | `app/page.js`, industries, marketing routes |
| Extended API surface | campaigns, scanner, opportunities, phase7 routes |
| Ops scripts on VPS `main` | `scripts/ops/post-deploy-smoke.sh` (VPS `main` only) |

**Do not merge** branches without PO release plan — RC publication should be a **clean commit/tag** of certified tree, not merge of `feature/homepage-phase1`.

---

## Publication steps (document only — not executed)

1. Initialize git on certified tree OR export to `AsoftechLeadEdge360` clean branch.
2. Commit with message: `release: Sprint-1 RC (E-002, E-003, E-004, security Phase-0)`.
3. Tag: `sprint1-rc-2026-08-03`.
4. Push to GitHub (fix `Repository not found` / access).
5. Record SHA in manifest; cherry-pick or include `d96e63d` deploy-path fix if not already in tree.
6. Run RC-2 Validation on published SHA.
7. PO approves SHA as **Approved RC SHA**.

---

## Verdict

| RC source of truth established? | **NO** — pending Git publication |
| Safe to deploy from current VPS Git? | **NO** |
