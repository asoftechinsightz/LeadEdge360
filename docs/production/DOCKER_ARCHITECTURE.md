# Docker Architecture

## Image build (`Dockerfile`)

| Stage | Purpose |
|-------|---------|
| `deps` | `yarn install --frozen-lockfile` |
| `builder` | `yarn build` (Next.js standalone) |
| `runner` | Production runtime only |

### Runtime image contents

| Path | Source | Required |
|------|--------|----------|
| `/app/server.js` | `.next/standalone` | Yes |
| `/app/.next/static` | build output | Yes |
| `/app/node_modules` | standalone bundle | Yes |
| `/app/public` | `public/` | Yes |
| `/app/config` | `config/` (AEO JSON) | Yes |

No runtime `docker cp` hotfixes.

### Process

- **User:** `app` (non-root)
- **CMD:** `node server.js`
- **Bind:** `HOSTNAME=0.0.0.0`, `PORT=3000` (set in compose; overrides Docker-injected hostname)
- **HEALTHCHECK:** HTTP GET `http://127.0.0.1:3000/api` → status 200

## Compose project (`docker-compose.yml`)

| Service | Container | Image | Networks |
|---------|-----------|-------|----------|
| `app` | `asoftech-app` | `asoftech-insightz-app` (build) | `default`, `asoftech_edge` (alias `app`) |
| `mongo` | `asoftech-mongo` | `mongo:7` | `default` |
| `n8n` | `asoftech-n8n` | `n8nio/n8n:latest` | `default`, `asoftech_edge` (alias `n8n`) |

### Dependencies

- `app` → `mongo` with `condition: service_healthy`

## Edge stack (`deploy/edge/`)

Reference copy of `/opt/asoftech-edge`:

| Service | Container | Role |
|---------|-----------|------|
| `edge-nginx` | `asoftech-edge-nginx` | TLS termination, routing |

Published ports: **80**, **443** (host).

## Data volumes

| Volume | Service |
|--------|---------|
| `mongo-data` | MongoDB |
| `n8n-data` | n8n workflows |

## CI vs production

| Environment | Edge proxy | Networks |
|-------------|------------|----------|
| RC-2 GitHub Actions | None | Single bridge |
| Production VPS | `asoftech-edge-nginx` | `asoftech_edge` + per-stack defaults |

RC-2 does not exercise multi-homed bind or edge DNS; production compose must enforce `HOSTNAME=0.0.0.0` and `asoftech_edge` attachment.
