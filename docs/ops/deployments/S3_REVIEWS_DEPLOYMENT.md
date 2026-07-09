# S3 — Reviews VPS Deployment Record

**Sprint:** S3 — Reviews  
**VPS:** `root@187.127.179.138`  
**Path:** `/opt/asoftech`  
**Report:** [SPRINT_3_REPORT.md](../../SPRINT_3_REPORT.md)

## Deploy (when ready — batch with S2 if not yet deployed)

```bash
cd /opt/asoftech
git pull
npm install
docker compose up -d mongo
npm run deploy:s3
npm run dev -- --hostname 0.0.0.0 --port 3007   # separate terminal
```

## Database changes

- `review_campaigns` — campaign definitions + stats
- `review_requests` — per-customer review links + ratings

See [SPRINT_DATABASE_CHANGELOG.md](../SPRINT_DATABASE_CHANGELOG.md) § S3.

## Sign-off

| Item | Date | Operator | Result |
|------|------|----------|--------|
| Indexes applied | | | |
| `db:reviews-retest` PASS | | | |
| `/growth/reviews` UI | | | |
| `/review/{token}` public page | | | |
