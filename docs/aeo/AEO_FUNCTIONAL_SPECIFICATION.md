# AEO Functional Specification — LeadEdge360

**Version:** 1.0  
**Status:** Documentation only — product freeze active  
**Scope:** Enable AEO without new APIs, DB collections, navigation, or architecture changes  

---

## 1. Purpose

Answer Engine Optimization (AEO) helps businesses appear in AI-powered search and answer engines (Google AI Overviews, Perplexity, voice assistants) by improving **structured business identity**, **FAQ coverage**, **local visibility signals**, and **review responsiveness**.

LeadEdge360 already captures leads, scores intent, automates WhatsApp follow-ups, and displays executive KPIs. This program **reuses** those capabilities to surface AEO readiness without inventing new backend domains.

---

## 2. In-scope workstreams

### WS1 — Business Profile Optimization

**Objective:** Track and improve the tenant’s public business identity used for AEO.

**Metadata extension (no schema migration):**

Store AEO profile fields in existing JSON surfaces:

| Store | Field path | API write path |
|-------|------------|----------------|
| Mongo `users` | `preferences.aeoProfile` | `PATCH /api/users/me` (mobile JWT) |
| Postgres canonical | `tenants.settings.aeoProfile` | Future sync; document structure now |
| Client config | `config/aeo/business-profile-fields.json` | Static field definitions |

**Profile fields (configuration-defined):**

- Business name, category, description (short + long)
- Service areas (cities / pincodes) — align with `territory` list on leads
- Phone, website, hours
- Google Business Profile URL (reference only)
- Keywords (tag list)
- FAQ entries (question + answer pairs) — stored in preferences until published

**AEO readiness checklist:**

Configurable checklist in `config/aeo/readiness-checklist.json` with weighted items:

- Description ≥ 150 characters
- ≥ 3 service areas defined
- ≥ 5 FAQ pairs
- Phone + website present
- WhatsApp opt-in messaging configured
- ≥ 1 lead from `google` source (local intent signal)

**Business completeness score:**

Client-computed 0–100 from checklist weights + filled profile fields. **Not a new API field** — computed in UI from `preferences.aeoProfile` + checklist config.

---

### WS2 — Executive Dashboard

Reuse existing dashboard card pattern (`KpiCard`) on **existing routes only**:

- `/dashboard` (workspace overview)
- `/leadedge360` (CRM command center — optional second row)

**New card labels (composition only):**

| Card | Source |
|------|--------|
| AEO Score | Derived from completeness + KPI heuristics |
| Business Completeness | Checklist % complete |
| FAQ Readiness | FAQ count / target from preferences |
| Local Visibility Readiness | Territory coverage from `GET /api/kpis` `byTerritory` |
| Review Health | Derived from `preferences.aeoProfile.reviews` manual metrics |

No new routes. No sidebar items.

---

### WS3 — AI Recommendations

Reuse **`lib/scoring.js` LLM framework** (Emergent OpenAI-compatible API) with **alternate prompt templates** loaded from configuration:

| Recommendation type | Prompt template file | Trigger |
|--------------------|----------------------|---------|
| FAQ suggestions | `config/aeo/prompts/faq-suggestions.json` | User action on profile screen |
| Business description improvements | `config/aeo/prompts/description-improve.json` | User action |
| Missing service areas | Rule-based + `byTerritory` gap analysis | Automatic on dashboard load |
| Missing keywords | Rule-based on description text | Automatic |
| Review response suggestions | `config/aeo/prompts/review-reply.json` | User enters review text in preferences UI |

**Implementation constraint:** Same LLM endpoint and env `EMERGENT_LLM_KEY` as lead scoring — **prompt string changes only**, no new API route.

Fallback: `ruleScore` pattern extended with AEO keyword rules in config (no LLM).

Display recommendations in existing lead detail dialog pattern (reasons list UI) — composition reuse.

---

### WS4 — Content Generation

Reuse AI content framework (LLM call pattern from `scoring.js` / `retail-ai.js`) with dedicated prompt templates. Generated content is **copied or sent via existing channels**:

| Content type | Generation | Delivery API (existing) |
|--------------|------------|-------------------------|
| FAQs | LLM prompt template | Stored in `preferences.aeoProfile.faqs`; manual publish |
| Google Business posts | LLM prompt | Copy to clipboard; optional `POST /whatsapp/send` as draft |
| Service descriptions | LLM prompt | Update `preferences.aeoProfile.description` |
| Local pages | LLM prompt per territory | Copy; link territories from KPI `byTerritory` |
| Social captions | LLM prompt | Copy / WhatsApp |
| WhatsApp messages | Template + LLM | `POST /whatsapp/send` or `wa.me` link pattern in leadedge360 |

No `POST /aeo/generate` endpoint — generation runs through **configured prompt invocation** in existing client+server scoring path or copy-only UI.

---

### WS5 — Review Intelligence

**v1.0 has no reviews collection.** Review intelligence is **metadata-driven**:

| Metric | Source |
|--------|--------|
| Review count | `preferences.aeoProfile.reviews.count` (manual or imported) |
| Average rating | `preferences.aeoProfile.reviews.averageRating` |
| Pending replies | Count of open `follow_ups` with `channel=whatsapp` OR `preferences.aeoProfile.reviews.pendingReplies` |
| AI reply suggestions | Prompt template `review-reply.json` on pending review text |

Display on dashboard **Review Health** card and optional panel on `/leadedge360` (existing card grid — no new page).

---

### WS6 — Growth Intelligence (Lead Scanner)

Reuse **lead list + KPI analytics** as “digital optimization scanner”:

| Signal | Existing data |
|--------|---------------|
| Businesses needing optimization | Leads with empty `company`, low `score`, Cold `label` |
| Weak local presence | Territories in KPI `byTerritory` with zero leads |
| Google channel gap | Low count in `bySource` for `google` |
| Stale pipeline | `GET /dashboard/followups-due` overdue count |

Present as filtered view on existing **Leads table** (`GET /api/leads?q=&label=Cold`) — not a new scanner module.

---

### WS7 — Automation

Reuse **n8n workflows** + **follow-ups** + **notifications**:

| Automation | Mechanism |
|------------|-----------|
| Profile completion reminders | n8n cron → `GET /followups/reminders` → create follow-up titled “Complete AEO profile” |
| Review response reminders | n8n + open follow-ups; local notification via mobile |
| FAQ generation prompt | Scheduled n8n HTTP to internal admin trigger **not allowed** — use in-app user trigger only |
| Business profile improvement suggestions | Weekly n8n → notification payload (when writer exists) OR email via existing contact flow |

Extend `n8n/whatsapp-followup-automation.json` pattern with additional filters — **workflow JSON config only**.

---

## 3. Functional requirements summary

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Business profile metadata in `preferences.aeoProfile` | P0 |
| FR-02 | Config-driven AEO checklist | P0 |
| FR-03 | Completeness score (client computed) | P0 |
| FR-04 | Five AEO KPI cards on existing dashboard | P0 |
| FR-05 | AI recommendations via prompt templates | P1 |
| FR-06 | Content generation copy/send via WhatsApp API | P1 |
| FR-07 | Review metrics in preferences | P1 |
| FR-08 | Lead scanner filters on existing leads API | P1 |
| FR-09 | n8n automation rules for reminders | P2 |

---

## 4. Non-functional requirements

| NFR | Target |
|-----|--------|
| Backward compatibility | All existing API responses unchanged |
| Performance | AEO cards load from same KPI fetch — no extra round trips required |
| Security | AEO profile in user preferences — tenant-scoped via JWT |
| DPDP | Business data in preferences follows existing consent model |

---

## 5. Out of scope

- New REST endpoints
- Reviews ingestion from Google API
- Automatic GBP posting
- Navigation / route additions
- RetailEdge360 AEO (LeadEdge360 only)
- Mongo collection or SQL table creation

---

## 6. Dependencies

- `EMERGENT_LLM_KEY` for AI recommendations and content prompts
- `MSG91_AUTH_KEY` for OTP (unchanged)
- n8n instance for automation workflows
- WhatsApp Cloud API for outbound messages

---

## Related documents

- [AEO_DASHBOARD_SPECIFICATION.md](./AEO_DASHBOARD_SPECIFICATION.md)
- [AEO_AI_RECOMMENDATION_CATALOG.md](./AEO_AI_RECOMMENDATION_CATALOG.md)
- [AEO_IMPLEMENTATION_READINESS_REPORT.md](./AEO_IMPLEMENTATION_READINESS_REPORT.md)
