# Marketing Rebrand Deploy — July 2026

Premium 3D hero, compliance updates, About page rewrite.

## Quick deploy (VPS — you already use `root@leadedge360`)

```bash
cd /opt/asoftech-insightz

# Option A: git pull (if pushed to remote)
git pull origin main

# Option B: extract bundle from dev machine
# (on Windows after scripts/ops/create-deploy-bundle.ps1)
# scp asoftech-insightz-deploy.tar.gz root@<vps-ip>:/opt/
# cd /opt/asoftech-insightz && tar -xzf ../asoftech-insightz-deploy.tar.gz

bash scripts/ops/vps-deploy-website.sh
```

## Manual steps

```bash
docker compose build app --no-cache
docker compose up -d app
docker network connect observability360_default asoftech-app
curl -fsS http://127.0.0.1:3000/api/health/live
```

## Verify

- https://www.asoftechinsightz.com — 3D hero, dark theme
- https://www.asoftechinsightz.com/about — new About page
- Hard refresh: Ctrl+Shift+R

## Rollback

```bash
docker compose down app
git checkout HEAD~1   # or previous tag
docker compose build app && docker compose up -d app
```
