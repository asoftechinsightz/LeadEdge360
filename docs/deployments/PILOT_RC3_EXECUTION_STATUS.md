# Pilot RC3 Deployment — Execution Status

**Tag:** `v1.0.0-rc3-pilot`  
**Target:** Hostinger VPS `187.127.179.138` · `/opt/asoftech`  
**Public URL:** `https://app.asoftechinsightz.com`

---

## Execution from Cursor workstation

| Step | Status | Notes |
|------|--------|-------|
| 1 Environment validation | ⏸ Blocked | Requires VPS SSH — run on server |
| 2 MongoDB backup | ⏸ Blocked | Requires Docker on VPS |
| 3 Migrations | ⏸ Blocked | Requires Mongo on VPS |
| 4 Deploy + rollback | ⏸ Blocked | SSH: Permission denied from workstation |
| 5 Monitoring stack | ⏸ Blocked | Deploy on VPS |
| 6 Smoke tests | ⏸ Blocked | Needs running app + `CERT_ADMIN_*` |
| 7 SSL/HSTS/CSP | 🟡 Partial | Run `SECURITY_CHECK_URL=https://app.asoftechinsightz.com node scripts/security/headers-check.mjs` after deploy |
| 8 Backup cron | ⏸ Blocked | Requires root on VPS |
| 9 Publish reports | ✅ Ready | `node scripts/ops/publish-pilot-reports.mjs --version v1.0.0-rc3-pilot` |
| 10 Version tag | ✅ Local | `.deploy-version` = `v1.0.0-rc3-pilot` |

**Blocker:** SSH to `root@187.127.179.138` returned `Permission denied (publickey,password)` from this Cursor workstation.

**Remote probe:** `https://app.asoftechinsightz.com` could not be verified from this environment (TLS/network). Run health check from VPS: `curl -fsS http://127.0.0.1:3000/api/health/ready`.

---

## Execute on VPS (recommended)

### Option A — Cursor Remote SSH

1. Connect: **Remote SSH → `root@187.127.179.138`**
2. Open terminal in `/opt/asoftech`
3. Pull/sync latest code (or extract from deploy bundle)
4. Run:

```bash
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='your-secure-password'
export PUBLIC_URL=https://app.asoftechinsightz.com
export PILOT_VERSION=v1.0.0-rc3-pilot

bash scripts/ops/pilot-production-deploy.sh
```

### Option B — Windows sync script (requires SSH key)

```powershell
$env:CERT_ADMIN_EMAIL = "admin@asoftechinsightz.com"
$env:CERT_ADMIN_PASSWORD = "your-secure-password"
$env:PUBLIC_URL = "https://app.asoftechinsightz.com"
powershell -ExecutionPolicy Bypass -File scripts/vps-pilot-rc3-deploy.ps1
```

### Option C — GitHub Actions

Push to `main` with secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `PUBLIC_URL` configured, then extend deploy workflow or run pilot script via SSH action.

---

## Rollback readiness (maintain ≥ 2 weeks)

- Keep previous Docker image before `docker compose build`
- Verified backup in `/opt/asoftech/backups/daily/`
- Do **not** delete pre-pilot backup until pilot stable

```bash
# Emergency rollback
docker compose stop app
docker tag asoftech-app:<previous> asoftech-app:latest
docker compose up -d app
```

---

## Reports (generated after successful VPS run)

| Artifact | Path |
|----------|------|
| Master report | `docs/deployments/PILOT_RC3_DEPLOYMENT_REPORT.md` |
| Smoke matrix | `docs/deployments/pilot-smoke-report.json` |
| Backup proof | `docs/deployments/pilot-backup-verification.json` |
| Monitoring | `docs/deployments/pilot-monitoring-report.json` |
| Migration | `docs/deployments/pilot-migration-report.json` |

---

## Post-deploy verification (from any machine)

```bash
curl -fsS https://app.asoftechinsightz.com/api/health/ready
SECURITY_CHECK_URL=https://app.asoftechinsightz.com node scripts/security/headers-check.mjs
```
