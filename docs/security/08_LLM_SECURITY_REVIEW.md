# LLM / AI Security Review

**Scope:** `lib/scoring.js`, `lib/aeo/compute.js`, `lib/aeo/prompts.js`, AEO UI components, Emergent LLM integration in route handlers.

---

## LLM integrations

| Use case | File | Endpoint | Key env |
|----------|------|----------|---------|
| Lead scoring | `lib/scoring.js` | `integrations.emergentagent.com` | `EMERGENT_LLM_KEY` |
| Shelf-life prediction | `app/api/.../route.js` (predictShelfLife) | Same pattern | `EMERGENT_LLM_KEY` |
| AEO prompts | Config JSON + `renderPromptTemplate` | Client/server calls | `EMERGENT_LLM_KEY` |

---

## Prompt injection

| Risk | Evidence | Severity |
|------|----------|----------|
| User lead fields in prompt | `JSON.stringify(lead)` in `aiScore` prompt | Medium |
| AEO template substitution | `renderPromptTemplate` replaces `{{key}}` from user profile | Medium |
| System prompt exposure | Prompts in `config/aeo/prompts/*.json` — not secret business logic | Low |

**Attack:** Malicious lead `message` or AEO profile fields instruct model to ignore policies or leak other context.

**Recommendation:** Strip/limit field length; structured output validation; never render LLM HTML without sanitization.

---

## Prompt leakage

- LLM API key sent server-side only (`EMERGENT_LLM_KEY`) — not in `NEXT_PUBLIC_*` — **Pass**.
- Prompt templates shipped in repo — acceptable for product; not tenant secrets.

---

## Output validation

| Check | Status |
|-------|--------|
| Lead score JSON parse | Partial — `JSON.parse` on model output; score clamped 0–100 |
| Invalid JSON fallback | Pass — falls back to `ruleScore` |
| HTML generation from LLM | Review UI components — no direct `dangerouslySetInnerHTML` on LLM text found |

---

## SSRF via LLM provider

Outbound fetch to fixed Emergent URL — not user-controlled URL — **low SSRF** from LLM path.

---

## Data sent to third party

Lead PII (name, phone, email, message) sent to Emergent when LLM scoring runs — **DPDP/privacy** consideration for PO and consent flows.

---

## lib/scoring.js vs lib/aeo/compute.js

| Module | Network call | Notes |
|--------|--------------|-------|
| `scoring.js` | Yes — LLM | Primary injection surface |
| `aeo/compute.js` | No — local checklist math | Lower risk |

---

## Recommendations

1. Document LLM data processing in privacy policy / DPDP consent.
2. Add max length on fields included in prompts.
3. Validate LLM JSON schema before use.
4. Monitor `EMERGENT_LLM_KEY` rotation and usage quotas.
