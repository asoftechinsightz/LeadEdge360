# Docker Security Report

**Files:** `Dockerfile`, `docker-compose.yml`

---

## Dockerfile

| Check | Status | Evidence |
|-------|--------|----------|
| Multi-stage build | Pass | deps → builder → runner |
| Base image | Pass | `node:20-alpine` |
| Non-root user | Pass | `USER app` in runner |
| Secrets in image | Pass | No ENV secrets baked in |
| .dockerignore | **Review** | Ensure `.env` not copied in build context |
| HEALTHCHECK | **Missing** | No container health probe |

---

## docker-compose.yml

| Service | Risk | Detail |
|---------|------|--------|
| app | Medium | `env_file: .env` — file permissions must be 600 |
| mongo | High | No authentication; volume `mongo-data` |
| n8n | High | Default password `changeme`; port 5678 published |

| Check | Status |
|-------|--------|
| restart policy | `always` on all services |
| depends_on | app → mongo (no health condition) |
| capabilities | Default — no explicit drop |
| read_only rootfs | Not set |
| secrets management | Plain `.env` not Docker secrets |

---

## Network isolation

- Mongo port not published to host — **Good**.
- App `3000` published — expected behind nginx.
- n8n `5678` published — **restrict to internal network or remove publish**.

---

## Recommendations

1. Change n8n credentials before deploy (H-06).
2. Add `healthcheck` to app service (curl `/api/`).
3. Enable Mongo authentication for production.
4. Use `docker compose` secrets or external secret manager for sensitive env.
5. Verify `.dockerignore` excludes `.env`, `.git`, `node_modules` from build where appropriate.
6. Run `docker scan` on built image when available.

---

## Volumes

| Volume | Data | Backup |
|--------|------|--------|
| mongo-data | All tenant data | **Required** |
| n8n-data | Workflows/credentials | Required |
