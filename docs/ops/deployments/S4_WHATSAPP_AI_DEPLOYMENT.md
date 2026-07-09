# S4 — WhatsApp + AI Deployment

**Sprint:** 4  
**Module:** WhatsApp threads, AI suggest/score, card click tracking

---

## Pre-deploy

- [ ] `git pull` on VPS `/opt/asoftech`
- [ ] `npm install` if dependencies changed
- [ ] `docker compose up -d mongo`
- [ ] Dev server on port 3007 for retest

---

## Deploy

```bash
cd /opt/asoftech
npm run deploy:s4
```

This runs:

1. `npm run db:indexes` — `whatsapp_threads`, `whatsapp_messages` indexes
2. `npm run db:sprint4-retest` — API smoke (requires dev server)
3. `npm run build`
4. Optional `go-live-retest.mjs`

---

## Env

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_USE_MOCK_API=false` | Required on staging/prod for live Conversations |
| `EMERGENT_LLM_KEY` | Optional — enables LLM suggest/score; falls back to rules/templates |

---

## Sign-off

Record in `docs/ops/SPRINT_DATABASE_CHANGELOG.md` § S4.

---

## Smoke

1. Login → LeadEdge360 → Conversations (empty or threads)
2. Open a lead → AI Assistant → Suggest + Score
3. Public card `/c/{slug}` → click WhatsApp → stats increment
