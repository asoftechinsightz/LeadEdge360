# Edge stack reference

Canonical production path: **`/opt/asoftech-edge`** on the leadedge360 VPS.

This directory is a **reference copy** for version control. After changes:

```bash
# On VPS
cd /opt/asoftech-edge
# Sync docker-compose.yml healthcheck from deploy/edge/docker-compose.yml if updated
docker compose up -d
```

`nginx.conf` and `map.conf` live only on the VPS (267+ lines, TLS vhosts). Upstreams use Docker DNS:

| Upstream | Target |
|----------|--------|
| `edge_app` | `app:3000` |
| `edge_marketing` | `asoftech-marketing:3010` |
| `edge_api` | `api-gateway:4000` |
| `edge_n8n` | `n8n:5678` |

App stack must attach `asoftech-app` and `asoftech-n8n` to `asoftech_edge` with aliases `app` and `n8n` (see root `docker-compose.yml`).
