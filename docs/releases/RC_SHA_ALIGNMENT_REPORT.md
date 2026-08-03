# RC SHA Alignment Report

**Date:** 4 August 2026  
**Purpose:** Compare approved Sprint-1 RC vs production VPS — **no deploy performed**  

---

## Summary

| Question | Answer |
|----------|--------|
| Approved Sprint-1 RC SHA on GitHub? | **NOT PUBLISHED** — certified artifact has no remote SHA |
| Running VPS SHA (pre-infra intervention) | `0e1b7e826f60926e2f98ac529cf77dd468a9bcfc` |
| Running VPS branch | `feature/homepage-phase1` |
| Aligned? | **NO** |

---

## SHA reference table

| Ref | SHA | Branch / tag | Sprint-1 parity |
|-----|-----|--------------|-----------------|
| **Production (running container)** | `0e1b7e8` | `feature/homepage-phase1` | No `security-config.js`, no E-002/E-004 libs |
| **VPS `main` (remote)** | `5cb6f18` | `main` — CRM Phase 1-6 stable | No Sprint-1 RC files |
| **VPS `main` (local only)** | `d96e63d` | infra path fix commit | Path fix only; **not pushed** |
| **Tag `v1.2.0`** | `6f4fea1` | tag | Phase 7C download — not Sprint-1 RC |
| **Certified RC workspace** | **N/A** | Local `asoftech-insightz-v1.2.0` — **not a git repo** | E-002/E-003/E-004 + Phase 0 security **present** |
| **deploy.yml default** | `origin/main` | After push: would be `d96e63d` | Does not include Sprint-1 code |

---

## Approved Sprint-1 RC determination

RC-3 certification (3 Aug 2026) validated Sprint-1 on a **workstation workspace** with:

- `npm run test:aeo` / `test:bridge` / `test:billing` PASS  
- Security suite 5/5  
- Epics E-002, E-003, E-004 implementation reports in `docs/releases/`  

**No git commit SHA** was recorded because the certified tree was **not pushed** to `arnav02champ/AsoftechLeadEdge360`.

### Authoritative RC artifact (engineering)

| Attribute | Value |
|-----------|-------|
| Location | Local package `asoftech-insightz-v1.2.0/asoftech-insightz` |
| Version label | `package.json` → `0.1.0` |
| Sprint-1 markers | `lib/request-actor.js`, `lib/security-config.js`, `lib/billing/plan-entitlements.js` |
| Git SHA | **None** — directory is not a git repository |

**PO action required:** Tag and push certified Sprint-1 tree to GitHub; record SHA as **Approved RC SHA**.

---

## GitHub repository (`AsoftechLeadEdge360`)

| Item | Detail |
|------|--------|
| Remote on VPS | `git@github.com:arnav02champ/AsoftechLeadEdge360.git` |
| SSH auth | `asoftechinsightz` user — SSH OK |
| `git push origin main` | **FAILED** — `Repository not found` (4 Aug 2026) |
| Public API | Repo **404** (private or renamed) |

Path-fix commit on VPS **main** (local):

```
d96e63d infra: align deploy path to /opt/asoftech-insightz (P0)
```

Files changed: `deploy.yml`, `deploy.sh`, `DEPLOY_SETUP.md`.

---

## Alignment analysis

| Criterion | Met? |
|-----------|------|
| Running SHA = certified Sprint-1 SHA | **NO** — certified SHA does not exist on GitHub |
| Running tree contains E-002/E-003/E-004 | **NO** on `0e1b7e8` |
| `deploy.yml` path matches VPS layout | **YES** on local `d96e63d` (not on remote) |
| `origin/main` suitable for Sprint-1 deploy | **NO** — missing RC code |

---

## Planned alignment (do not execute without PO GO)

1. PO publishes certified Sprint-1 artifact → GitHub; records **`APPROVED_RC_SHA`**.
2. Fix GitHub push access (`Repository not found` / deploy key / repo name).
3. Push `d96e63d` (or cherry-pick path fix onto approved branch).
4. On VPS (after backup):

```bash
cd /opt/asoftech-insightz
git fetch --all
git checkout main   # or approved branch
git reset --hard <APPROVED_RC_SHA>
# merge or cherry-pick d96e63d if path fix not in approved SHA
```

5. Verify files: `lib/security-config.js`, `lib/request-actor.js`, `lib/billing/plan-entitlements.js`.
6. Complete secrets ([PRODUCTION_SECRET_AUDIT.md](./PRODUCTION_SECRET_AUDIT.md)).
7. PO authorizes deploy.

---

## Verdict

| RC SHA aligned? | **NO** |
| Ready to deploy RC? | **NO** |

**STOP** — await PO-approved SHA publication and secret completion.
