# S2 — QR Engine VPS Deployment Record

**Sprint:** S2 — QR Engine  
**VPS:** `root@187.127.179.138`  
**Path:** `/opt/asoftech`  
**Report:** [SPRINT_2_REPORT.md](../../SPRINT_2_REPORT.md)  
**DB changelog:** [SPRINT_DATABASE_CHANGELOG.md](../SPRINT_DATABASE_CHANGELOG.md)

---

## Pre-deploy checklist

- [ ] Code merged / pulled on VPS (`git pull`)
- [ ] `docker compose ps` — mongo healthy
- [ ] `.env` has `DB_NAME=asoftech_saas` and valid `MONGO_URL`
- [ ] S1 business card seeded (`/c/asoftech-demo` works)
- [ ] Subscription `BUSINESS_GROWTH` for `demo-org` (includes `qr_engine`)

---

## Deploy steps (run on VPS)

```bash
cd /opt/asoftech
git pull origin main
npm install
docker compose up -d mongo
sleep 3
npm run db:indexes
npm run build
```

Start staging server (separate terminal or background):

```bash
npm run dev -- --hostname 0.0.0.0 --port 3007
```

Run tests:

```bash
RETEST_API_BASE=http://127.0.0.1:3007/api npm run db:qr-retest
node scripts/go-live-retest.mjs
```

Or use the automated script:

```bash
node scripts/vps-sprint-deploy.mjs s2
```

---

## Database changes this sprint

### New collections
- `qr_codes`
- `qr_events`
- `qr_conversions`

### Indexes (10 new on QR collections)
See [SPRINT_DATABASE_CHANGELOG.md § S2](../SPRINT_DATABASE_CHANGELOG.md#s2--qr-engine)

### Verify on VPS
```bash
docker exec -it asoftech-mongo mongosh -u asofadmin -p --authenticationDatabase admin
use asoftech_saas
db.qr_codes.getIndexes()
db.qr_events.getIndexes()
db.qr_conversions.getIndexes()
```

---

## Post-deploy smoke

| Test | Command / URL | Expected |
|------|---------------|----------|
| API health | `curl http://127.0.0.1:3007/api/` | 200 |
| QR list | `curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3007/api/qr` | 200 + items |
| Public redirect | `curl -I http://127.0.0.1:3007/q/{code}` | 302 |
| UI | `http://187.127.179.138:3007/growth/qr` | QR Engine dashboard |
| Feature gate | Starter plan org | Nav hides QR Engine |

---

## Sign-off

| Item | Date | Operator | Result | Notes |
|------|------|----------|--------|-------|
| Code deployed | | | | |
| Indexes applied | | | | |
| `db:qr-retest` | | | | |
| `go-live-retest` | | | | |
| DB changelog updated | | | | |
| Production docker rebuild | | | | Optional after staging PASS |

---

## Rollback

QR module is additive. Rollback = revert git commit; collections can remain (no CRM impact).

```bash
git checkout <previous-commit>
docker compose up -d --build
```

---

*Fill sign-off table after VPS deploy. Do not start S3 until S2 sign-off is complete.*
