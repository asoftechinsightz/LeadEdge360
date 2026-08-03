# Workstream 2 — AI Growth Engine / Recommendation Validation

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Validation date:** August 2026  
**Scope:** Rule engine paths + LLM paths (code audit + pilot checklist)

---

## 1. Summary

| Engine | Pilot live test | Codebase audit |
|--------|-----------------|----------------|
| Rule-based recommendations | **NOT VERIFIED LIVE** | **PASS** for implemented rules |
| LLM (`EMERGENT_LLM_KEY`) | **NOT VERIFIED LIVE** | **PASS** with graceful fallback |

---

## 2. Rule engine — PO checklist mapping

| PO validation item | Implemented in Phase-1? | Rule / signal | Result |
|--------------------|---------------------------|---------------|--------|
| Missing Business Profile | **Yes** | Short description, checklist gaps, empty profile fields | **PASS** |
| Missing GST | **No** | Not in `business-profile-fields.json` or checklist | **N/A** — document in CS guide as external compliance field |
| Missing Website | **Yes** | Checklist item `website` required | **PASS** |
| Missing WhatsApp | **Yes** | `whatsappConfigured` toggle + checklist | **PASS** |
| Missing Business Category | **Yes** | Checklist `category` required | **PASS** |
| Low Lead Volume | **Partial** | Growth scanner does not threshold `total < N`; cold/empty territory signals | **CONDITIONAL** |
| Low Proposal Conversion | **Partial** | `Proposal` is lead **status**, not conversion KPI rule | **CONDITIONAL** — use CRM status `Proposal` count manually |
| Inactive Pipeline | **Partial** | Cold leads + zero-lead territories | **CONDITIONAL** |
| No Follow-ups | **No** | Follow-up APIs JWT-only; not in rule engine | **FAIL (scope gap)** — not a regression; never implemented in AEO rules |
| Weak Customer Engagement | **Partial** | Cold/low-score lead count in growth scanner | **CONDITIONAL** |

### Rule categories emitted by `buildRuleRecommendations()`

| Category | Trigger examples |
|----------|------------------|
| Service areas | Territory in profile with 0 leads in `byTerritory` |
| Keywords | Seed keywords absent from description |
| Growth scanner | Cold leads, missing company, no Google leads, empty territories |
| Profile | `descriptionLong` &lt; 150 chars |
| FAQs | Fewer than 5 FAQ pairs |

---

## 3. LLM validation

### Configuration

| Prompt ID | Purpose | PO mapping |
|-----------|---------|------------|
| `faq-suggestions` | FAQ pairs | AEO Suggestions |
| `description-improve` | Short/long description | Business Growth / SEO |
| `gbp-post` | GBP post draft | Marketing Content |
| `service-description` | Service copy | SEO Suggestions |
| `local-page` | Territory landing copy | SEO / Local |
| `social-caption` | Social caption | Marketing Content |
| `whatsapp-outreach` | WhatsApp draft | WhatsApp Campaign Suggestions |
| `review-reply` | Review reply draft | Customer engagement |

**Invocation path:** Next.js server action `invokeAeoPrompt` → `lib/scoring.js` `runAeoPrompt()` — **no new REST API**.

### If `EMERGENT_LLM_KEY` is set (pilot checklist)

| LLM output type | Button in UI | Expected behavior |
|-----------------|--------------|-------------------|
| Business Growth Suggestions | Improve description | JSON `{ short, long, changes }` |
| Marketing Content | GBP post draft | JSON `{ post, hashtags }` |
| SEO Suggestions | Keywords + description rules; service/local prompts available via LLM | Mixed rule + LLM |
| AEO Suggestions | Suggest FAQs | JSON `{ faqs: [...] }` + Apply FAQs |
| WhatsApp Campaign | `whatsapp-outreach` prompt exists; UI button for full campaign not exposed | **PARTIAL** — playbook covers `wa.me` + copy |

**Tenant #1 live test steps:**

1. Open `/dashboard` → expand profile → fill category + short description  
2. Click **Suggest FAQs** → expect toast “Generated — verify before publishing”  
3. Click **Improve description** → expect JSON panel  
4. Throttle: max 10 LLM calls/hour client-side  

### If `EMERGENT_LLM_KEY` is missing

| Behavior | Result |
|----------|--------|
| LLM buttons | Toast error: “LLM key not configured — use rule-based recommendations” |
| Rule panel | **Still functional** |
| Lead scoring | Falls back to `ruleScore()` (unchanged) |

**Graceful fallback:** **PASS** (code-verified).

---

## 4. Pilot LLM status

| Check | Status |
|-------|--------|
| `EMERGENT_LLM_KEY` on pilot VPS | **NOT VERIFIED** (no shell access in this validation) |
| New lead `engine === 'llm'` | Use `POST_DEPLOY_CHECKLIST.md` §5 smoke test |

---

## 5. Gaps vs PO checklist (not defects — scope)

| Item | Handling for Tenant #1 |
|------|------------------------|
| GST / PAN | Capture in CS onboarding worksheet; not stored in LeadEdge360 Phase-1 profile |
| No follow-ups rule | Use CRM follow-ups manually; n8n AR-01–AR-03 when JWT + server profile exist |
| Proposal conversion % | Use LeadEdge360 status funnel + existing conversion KPI |

---

## 6. WS2 verdict

**CONDITIONAL PASS** — Implemented rule and LLM paths match Phase-1 catalog; several PO checklist items are **CS/process** or **future scope**, not Phase-1 product gaps requiring engineering.

---

## Related

- [AEO_AI_RECOMMENDATION_CATALOG.md](../AEO_AI_RECOMMENDATION_CATALOG.md)  
- `lib/aeo/recommendations.js`, `lib/scoring.js` `runAeoPrompt()`
