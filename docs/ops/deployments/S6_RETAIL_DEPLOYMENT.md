# S6 — Retail Foundation Deployment

**Sprint:** 6  
**Module:** Retail inventory API + dashboard

---

## Deploy

```bash
cd /opt/asoftech
npm run deploy:s6
```

Runs indexes for `retail_stores`, `retail_products`, `retail_inventory` + `retail-retest`.

---

## Smoke

1. Login with BUSINESS_GROWTH+ plan
2. Open `/retailedge360`
3. Add SKU → verify KPIs and table update
4. Re-predict and delete SKU

---

Sign off in `docs/ops/SPRINT_DATABASE_CHANGELOG.md` § S6.
