# Operations — Sprint VPS Deployments

| Doc | Purpose |
|-----|---------|
| [VPS_SPRINT_RUNBOOK.md](./VPS_SPRINT_RUNBOOK.md) | Master runbook — run every sprint on VPS |
| [SPRINT_DATABASE_CHANGELOG.md](./SPRINT_DATABASE_CHANGELOG.md) | Cumulative MongoDB changes + sign-off |
| [deployments/](./deployments/) | Per-sprint deployment records |

## Quick commands (on VPS)

```bash
cd /opt/asoftech
npm run deploy:s0   # Stabilization + go-live retest
npm run deploy:s1   # Business card bootstrap + indexes
npm run deploy:s2   # QR Engine
npm run deploy:s3   # Reviews
```

**Rule:** After each deploy, fill the sign-off table in `SPRINT_DATABASE_CHANGELOG.md` and the matching `deployments/S{n}_*.md` file.
