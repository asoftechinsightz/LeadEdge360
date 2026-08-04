# Network Topology

## Overview

```
                    Internet
                        │
                        ▼
              ┌─────────────────────┐
              │ asoftech-edge-nginx │  :80 / :443
              │  (asoftech_edge +    │
              │   opsedge360_default)│
              └─────────┬───────────┘
                        │ Docker DNS (no hardcoded IPs)
        ┌───────────────┼───────────────┬─────────────────┐
        ▼               ▼               ▼                 ▼
   app:3000      asoftech-marketing   api-gateway:4000   n8n:5678
 (asoftech-app)      :3010         (other stack)    (asoftech-n8n)
        │
        │ default network
        ▼
     mongo:27017
   (asoftech-mongo)
```

## External network: `asoftech_edge`

Created once per host:

```bash
docker network create asoftech_edge
```

| Member | DNS aliases on `asoftech_edge` | Upstream in edge nginx |
|--------|----------------------------------|------------------------|
| `asoftech-app` | `app`, `asoftech-app` | `edge_app → app:3000` |
| `asoftech-n8n` | `n8n` | `edge_n8n → n8n:5678` |
| `asoftech-edge-nginx` | container name | — |
| `asoftech-marketing` | service name (other compose) | `edge_marketing → asoftech-marketing:3010` |
| `api-gateway` | service name (other compose) | `edge_api → api-gateway:4000` |

**No IP addresses in nginx.** All upstreams use Docker embedded DNS on shared networks.

## Default project network

Compose project `asoftech-insightz` creates `asoftech-insightz_default`:

- `app` → `mongo` via `mongodb://mongo:27017`
- `n8n` internal UI on host `:5678`

## `opsedge360_default`

Used by edge nginx for OpsEdge routes (`edge_opsedge_web → opsedge360-web-1:3000`). Managed outside this repository.

## Bind address requirement

Next.js standalone uses `process.env.HOSTNAME` for `server.listen()`. Docker injects `HOSTNAME=<container id>` unless compose overrides with `0.0.0.0`. Without override, the process binds only to the first `/etc/hosts` IP on the default network, breaking reachability from `asoftech_edge`.

See `docs/infrastructure/EDGE_502_ROOT_CAUSE_AND_FIX.md`.

## Fresh deploy checklist

1. `docker network create asoftech_edge` (if missing)
2. `docker compose up -d` in `/opt/asoftech-insightz` (joins network + aliases)
3. `docker compose up -d` in `/opt/asoftech-edge`
4. `scripts/validate-production-stack.sh`

No `docker network connect` required.
