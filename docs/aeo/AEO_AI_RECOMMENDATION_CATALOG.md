# AEO AI Recommendation Catalog — LeadEdge360

**Version:** 1.0  
**Framework:** Reuses `lib/scoring.js` Emergent LLM integration pattern  
**Constraint:** Prompt template + rule configuration only — **no new API routes**  

---

## 1. AI framework reuse

| Existing module | Pattern | AEO reuse |
|---------------|---------|-----------|
| `lib/scoring.js` | `fetch(Emergent LLM)` + JSON response | All generative recommendations |
| `lib/scoring.js` | `ruleScore()` keyword weights | Missing keywords, service area gaps |
| `lib/retail-ai.js` | Structured JSON prompt + fallback | Content generation templates |
| Lead detail UI | `reasons[]` bullet list | Display recommendation output |

**Env:** `EMERGENT_LLM_KEY` (same as lead scoring)  
**Model:** `gpt-4o-mini` (match scoring.js)  
**Timeout:** 9s with rules fallback  

---

## 2. Configuration file layout

```text
config/aeo/
  readiness-checklist.json
  business-profile-fields.json
  prompts/
    faq-suggestions.json
    description-improve.json
    review-reply.json
    gbp-post.json
    service-description.json
    local-page.json
    social-caption.json
    whatsapp-outreach.json
  rules/
    missing-keywords.json
    missing-service-areas.json
```

Allowed implementation: import JSON at build time or read from `config/aeo` in server modules that **already call LLM** (prompt string substitution only).

---

## 3. Recommendation catalog

### R-01 — FAQ suggestions

| Attribute | Value |
|-----------|-------|
| ID | `aeo.faq.suggest` |
| Trigger | User clicks “Suggest FAQs” on profile panel |
| Input | `preferences.aeoProfile` (description, category, serviceAreas, keywords) |
| Prompt template | `prompts/faq-suggestions.json` |
| Output schema | `{ "faqs": [{ "question": "", "answer": "" }] }` |
| Display | Append to FAQ editor; user approves before save |
| Fallback | Static FAQ list from config for category |

**Prompt skeleton:**

```text
You are an AEO specialist for Indian SMBs. Given this business profile, suggest 5 FAQ pairs optimized for Google AI Overviews and voice search. Return JSON: {"faqs":[{"question":"","answer":""}]}. Keep answers under 80 words.
Business: {{profile}}
```

---

### R-02 — Business description improvements

| Attribute | Value |
|-----------|-------|
| ID | `aeo.description.improve` |
| Trigger | “Improve description” button |
| Input | Current description + category + keywords |
| Prompt | `prompts/description-improve.json` |
| Output | `{ "short": "", "long": "", "changes": ["..."] }` |
| Action | User replaces description fields |

---

### R-03 — Missing service areas

| Attribute | Value |
|-----------|-------|
| ID | `aeo.areas.gap` |
| Trigger | Dashboard load / manual refresh |
| Type | **Rule-based** (no LLM required) |
| Input | `preferences.aeoProfile.serviceAreas`, `GET /api/kpis` `byTerritory` |
| Logic | `rules/missing-service-areas.json` |
| Output | `{ "recommendations": ["Add Hyderabad — 0 leads in pipeline"] }` |

**Rule example:**

```json
{
  "compare": "serviceAreas vs kpis.byTerritory",
  "recommendWhen": "serviceArea not in byTerritory OR byTerritory.leads === 0"
}
```

---

### R-04 — Missing keywords

| Attribute | Value |
|-----------|-------|
| ID | `aeo.keywords.gap` |
| Trigger | Profile save or dashboard load |
| Type | Rule + optional LLM |
| Input | description text, `KEYWORD_WEIGHTS` from scoring.js |
| Rule file | `rules/missing-keywords.json` |
| Output | Suggested keywords not present in description |

Reuse `KEYWORD_WEIGHTS` from `lib/scoring.js` as seed list for B2B intent keywords.

---

### R-05 — Review response recommendations

| Attribute | Value |
|-----------|-------|
| ID | `aeo.review.reply` |
| Trigger | User selects pending review |
| Input | Review text, rating, business tone from profile |
| Prompt | `prompts/review-reply.json` |
| Output | `{ "reply": "", "tone": "professional" }` |
| Delivery | Copy, or `POST /api/whatsapp/send` if review tied to lead |

---

## 4. Content generation catalog (WS4)

| ID | Content type | Prompt file | Delivery |
|----|--------------|-------------|----------|
| C-01 | FAQs | `faq-suggestions.json` | Save to preferences |
| C-02 | Google Business post | `gbp-post.json` | Clipboard |
| C-03 | Service description | `service-description.json` | Profile field |
| C-04 | Local page copy | `local-page.json` | Clipboard per territory |
| C-05 | Social caption | `social-caption.json` | Clipboard / WhatsApp |
| C-06 | WhatsApp message | `whatsapp-outreach.json` | `POST /whatsapp/send` |

All prompts share:

```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.3,
  "response_format": "json_object",
  "system": "...",
  "userTemplate": "... with {{variables}}"
}
```

---

## 5. UI presentation (reuse)

| Pattern | Source |
|---------|--------|
| Bullet recommendations | Lead detail `reasons` list |
| Toast on generate | `sonner` toast (leadedge360) |
| Loading | “Generating…” same as rescore toast |
| Error | LLM fallback message in first bullet |

---

## 6. Safety & quality

| Rule | Implementation |
|------|----------------|
| Human approval | No auto-publish to GBP; copy/save only |
| DPDP | No PII in prompts beyond business profile |
| Hallucination guard | “Verify before publishing” disclaimer on all AI output |
| Rate limit | Max 10 LLM calls/user/hour client-side throttle |

---

## 7. Mapping to lead scoring (optional cross-signal)

When viewing a **lead** with rich `message` field:

| Signal | Recommendation |
|--------|----------------|
| Lead `reasons` | Show parallel “AEO tip” if company matches profile |
| Rescore | Existing `POST /leads/{id}/rescore` — **do not change** scoring prompt for AEO |

Keep lead scoring and AEO prompts **separate files**.

---

## 8. Testing recommendations

| Test | Pass criteria |
|------|---------------|
| No LLM key | Rule-based R-03, R-04 still work |
| Valid JSON from LLM | Parser handles faqs array |
| Empty profile | Graceful “Add description first” |
| Hindi business names | UTF-8 in prompts |

---

## Related

- [AEO_FUNCTIONAL_SPECIFICATION.md](./AEO_FUNCTIONAL_SPECIFICATION.md)
- [AEO_DASHBOARD_SPECIFICATION.md](./AEO_DASHBOARD_SPECIFICATION.md)
- `lib/scoring.js` — reference implementation
