# S5 — Suite Polish Deployment

**Sprint:** 5  
**Module:** Feature flags, portal UI, partner dashboard, RBAC

---

## Deploy

```bash
cd /opt/asoftech
npm run deploy:s5
```

No new Mongo indexes required for S5.

---

## Env

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_USE_MOCK_API=false` | Shows **Live** badge on AI Workspace; routes enterprise APIs |

---

## Smoke

1. Login → sidebar hides QR/Reviews on STARTER plan
2. `/portal/login` → customer invoices
3. Partner user → `/partners/dashboard` only
4. Finance user → no Leads in nav; invoice APIs work

---

Sign off in `docs/ops/SPRINT_DATABASE_CHANGELOG.md` § S5.
