# Sprint 4 — WhatsApp + AI v1 Delivery Report

**Date:** 22 June 2026  
**Status:** Code complete — VPS deploy deferred (batch with S2 + S3)

---

## Summary

WhatsApp conversation threads, AI reply suggestions, CRM lead scoring, and public card click tracking.

| Area | Status |
|------|--------|
| `lib/whatsapp/service.js` | Done |
| `lib/ai/service.js` | Done |
| APIs `/api/whatsapp/*`, `/api/ai/*` | Done |
| Public card click tracking | Done |
| `Conversations.tsx` → real API | Done |
| `LeadAiPanel` on lead detail | Done |
| `httpClient` conversations path | Done |
| Indexes | Done |
| `scripts/sprint4-retest.mjs` | Done |
| `npm run build` | **PASS** |

---

## Flow

1. **WhatsApp:** List threads → select → view messages → send outbound message
2. **AI suggest:** On lead detail, generate follow-up or proposal reply (LLM or template fallback)
3. **AI score:** Rescore CRM lead via `/api/ai/score` → updates `leads` + `lead_scores`
4. **Card clicks:** Public business card actions fire `POST /api/public/card/{slug}/click`

---

## APIs

| Method | Path |
|--------|------|
| GET/POST | `/api/whatsapp/threads` |
| GET | `/api/whatsapp/threads/{id}` |
| GET/POST | `/api/whatsapp/threads/{id}/messages` |
| POST | `/api/ai/suggest` |
| POST | `/api/ai/score` |
| POST | `/api/public/card/{slug}/click` |

**Feature flags:** `whatsapp_pro`, `ai_assistant`, `ai_scoring`

---

## Collections

| Collection | Purpose |
|------------|---------|
| `whatsapp_threads` | Per-org conversation threads |
| `whatsapp_messages` | Inbound/outbound messages |

---

## Staging config

Set `NEXT_PUBLIC_USE_MOCK_API=false` to route enterprise Conversations UI through live APIs.

---

## VPS deploy (later)

```bash
npm run deploy:s2   # if not yet deployed
npm run deploy:s3
npm run deploy:s4
```

Docs: `docs/ops/VPS_SPRINT_RUNBOOK.md`, `docs/ops/SPRINT_DATABASE_CHANGELOG.md` § S4.

---

## Next

Sprint 5 — Suite polish (feature flags, Portal UI, Partners).
