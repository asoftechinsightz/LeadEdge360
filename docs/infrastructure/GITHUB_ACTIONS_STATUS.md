# GitHub Actions Status

**Date:** 3 August 2026  
**Workstation:** Operator PC — `gh` **not authenticated**  
**Repository remote (local):** Not a git repository on workstation  

---

## Summary

| Area | Status |
|------|--------|
| Workflow files reviewed | **YES** |
| P0 deploy path fix | **DONE** in local files (push pending) |
| Repository secrets | **NOT VERIFIED** — no API access |
| Recent workflow runs | **NOT VERIFIED** |
| CI deploy readiness | **CONDITIONAL** |

---

## Workflows reviewed

### `Deploy to VPS` (`.github/workflows/deploy.yml`)

| Attribute | Value |
|-----------|--------|
| Trigger | `push` to `main`, `workflow_dispatch` |
| Jobs | `test` → `build-and-deploy` |
| Test job | Mongo service, `yarn install`, `rc-ci-runner.mjs` |
| Deploy SSH action | `appleboy/ssh-action@v1.0.3` |
| Deploy directory | **`/opt/asoftech-insightz`** (P0 fix applied) |
| Git on VPS | `git reset --hard origin/main` |
| Post-deploy smoke | `curl PUBLIC_URL/api/` → `ok:true` |

**Gaps:**

- Resets to `origin/main` while production runs `feature/homepage-phase1` — branch policy must be agreed with PO.
- Smoke test hits `/api/`; production also exposes `/api/health` (pilot).
- Requires `sudo` for `.env` merge — deploy user needs passwordless sudo or write access without sudo.

### `RC-2 Validation` (`.github/workflows/rc-validation.yml`)

| Attribute | Value |
|-----------|--------|
| Trigger | PR/push `main`, `staging`, `workflow_dispatch` |
| Deploy to VPS | **No** — CI validation only |
| Mongo service | Yes (GitHub Actions service) |
| Env | JWT, webhook token, `ALLOW_PUBLIC_DEMO_ORG=true` for regression |
| Steps | RC runner, `yarn build`, Docker build, `backend_test.py` |
| VPS path reference | **None** — no change required |

---

## Required repository secrets

Documented in `deploy.yml` and `.github/DEPLOY_SETUP.md`:

| Secret | Used in | Workstation verification |
|--------|---------|--------------------------|
| `VPS_HOST` | SSH host | **NOT VERIFIED** |
| `VPS_USER` | SSH username | **NOT VERIFIED** |
| `VPS_SSH_KEY` | SSH private key | **NOT VERIFIED** |
| `VPS_PORT` | Optional SSH port (default 22) | **NOT VERIFIED** |
| `PUBLIC_URL` | Build env + smoke URL | **NOT VERIFIED** |

### How to verify (DevOps)

```bash
gh auth login
gh secret list
gh workflow list
gh run list --workflow=deploy.yml --limit 5
```

Or: GitHub → Repository → **Settings → Secrets and variables → Actions**.

### Expected values (non-secret)

| Secret | Expected value |
|--------|----------------|
| `VPS_HOST` | `187.127.179.138` (SSH management IP) |
| `PUBLIC_URL` | `https://app.asoftechinsightz.com` |
| `VPS_USER` | `asoftech` (per setup guide) |
| `VPS_PORT` | `22` |

**Note:** Public DNS resolves to `185.38.109.200`–`209`; SSH works to `187.127.179.138`. `VPS_HOST` must be SSH-reachable, not CDN pool only.

---

## CI SSH vs ops SSH

| Path | Status |
|------|--------|
| Ops: `root@187.127.179.138` + `asoftech_vps` key | **Works** |
| CI: `asoftech` + `asoftech_ci` key | **Not tested** |
| `asoftech@185.38.109.200` + ops key | **Permission denied** |

Deploy may fail if `VPS_SSH_KEY` is not authorized for `VPS_USER` on `VPS_HOST`.

---

## P0 remediation applied (workflow files)

| File | Change |
|------|--------|
| `.github/workflows/deploy.yml` | `cd /opt/asoftech-insightz` |
| `deploy.sh` | Default `APP_DIR=/opt/asoftech-insightz` |
| `.github/DEPLOY_SETUP.md` | Clone path `/opt/asoftech-insightz` |

**Push to GitHub required** for Actions to use updated workflow.

---

## Other deployment scripts verified

| Script | `/opt/asoftech` reference | Status |
|--------|---------------------------|--------|
| `scripts/rc/deployment.mjs` | None (static local checks) | OK |
| `scripts/rc-ci-runner.mjs` | None | OK |
| `.github/workflows/rc-validation.yml` | None | OK |

---

## Recommendations

1. `gh auth login` and confirm all five secrets exist.
2. Push P0 workflow fix to `main`.
3. Run `workflow_dispatch` Deploy after secrets + `.env` complete (PO approval).
4. Install `asoftech_ci` public key for `asoftech` on `187.127.179.138`.
5. Consider smoke test: `curl .../api/health` in addition to `/api/`.

---

## Verdict

| GitHub Actions ready for deploy | **UNKNOWN** — secrets not verified |
| Workflow path blocker | **RESOLVED** in local repo (pending push) |
