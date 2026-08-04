# Production Health Checks

## App (`asoftech-app`)

### Endpoint

`GET http://127.0.0.1:3000/api` → `{"ok":true,"name":"AsoftechInsightz API",...}`

Public health uses the same route via edge: `https://app.asoftechinsightz.com/api`.

### Dockerfile `HEALTHCHECK`

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
```

Uses Node (no `wget` in `node:20-alpine` runner).

### Compose `healthcheck`

Same probe as Dockerfile; visible in `docker compose ps` as `healthy`.

### `depends_on`

`app` waits for `mongo` with `condition: service_healthy`.

## Mongo (`asoftech-mongo`)

```yaml
healthcheck:
  test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping').ok"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 20s
```

## n8n (`asoftech-n8n`)

No container healthcheck in app compose (n8n image varies). Edge validates `n8n:5678` in `validate-production-stack.sh`.

## Edge nginx (`asoftech-edge-nginx`)

Reference `deploy/edge/docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget -qO- http://app:3000/api | grep -q '\"ok\":true'"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

Proves edge → app DNS path, not only local nginx process.

## Inspection commands

```bash
docker inspect --format='{{.State.Health.Status}}' asoftech-app
docker compose ps
docker exec asoftech-edge-nginx wget -qO- http://app:3000/api
```

## Failure modes

| Symptom | Likely cause |
|---------|----------------|
| App unhealthy, loopback fails | Missing `config/`, crash on boot |
| App unhealthy, loopback OK | Healthcheck misconfiguration |
| Edge unhealthy | `app` not on `asoftech_edge` or wrong `HOSTNAME` |
| Public 502, edge healthy | TLS/vhost mismatch (rare) |
