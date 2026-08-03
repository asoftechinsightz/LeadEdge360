# LeadEdge360 — Executive KPI Guide

**Version:** 1.0  
**Rule:** Every KPI below exists in the current product UI or `GET /api/kpis` / `GET /api/retail-kpis` responses. **No invented metrics.**

**API reference:** `app/api/[[...path]]/route.js` · **AEO formulas:** `docs/aeo/AEO_EXECUTIVE_KPI_MAPPING.md`

---

## Dashboard overview (`/dashboard`)

| KPI (UI label) | API / source | Meaning | Business impact | Decision guidance | Recommended actions |
|----------------|--------------|---------|-----------------|-------------------|---------------------|
| **Total leads** | `kpis.total` | Count of all leads in tenant | Pipeline volume | Flat or down → acquisition problem | Increase channels; review SOURCES chart |
| **Hot leads** | `kpis.hot` | Leads with label `Hot` | Immediate revenue opportunity | High hot count + low won → follow-up gap | WhatsApp all hot within 24h |
| **Conversion** | `kpis.conversion` (%), sub `won` | Won ÷ total × 100 | Sales effectiveness | Down → qualify better or improve close | Review Proposal-stage leads |
| **SKUs at risk** | `retail-kpis.byRisk[0].value` (High count) | High-risk SKU count | Retail waste exposure | High → expiry losses | Open RetailEdge360; repredict |

---

## AI Growth Engine (`/dashboard` — AEO row)

| KPI (UI label) | Derivation | Meaning | Business impact | Decision guidance | Recommended actions |
|----------------|------------|---------|-----------------|-------------------|---------------------|
| **AEO SCORE** | Weighted blend (35% completeness + 25% FAQ + 25% local + 15% review) | Answer-engine readiness | AI/Google discoverability | &lt; 60 → invisible in AI search | Complete profile checklist |
| **BUSINESS COMPLETENESS** | Checklist weighted % | Profile field coverage | Trust + snippet quality | &lt; 80% → weak listings | Improve profile panel |
| **FAQ READINESS** | `faqs.length` / target 5 | FAQ coverage | AI Overview eligibility | &lt; 5 FAQs → missed queries | Suggest FAQs (LLM) or manual |
| **LOCAL VISIBILITY** | Territories with leads ÷ target areas | Geographic pipeline presence | Local SEO signal | Low % → missing cities | Add service areas; run local campaigns |
| **REVIEW HEALTH** | Label + % from pending replies / rating | Google review responsiveness | Reputation + conversion | Pending &gt; 0 → trust risk | Reply to reviews; update metrics |

---

## LeadEdge360 CRM (`/leadedge360`)

| KPI (UI label) | API field | Meaning | Business impact | Decision guidance | Recommended actions |
|----------------|-----------|---------|-----------------|-------------------|---------------------|
| **TOTAL LEADS** | `total` | All leads (filtered view) | Volume | Filter by territory for local view | Compare to prior period |
| **QUALIFIED** | `qualified` | Status ∈ Qualified, Proposal, Won | Pipeline quality | Low % of total → weak qualification | Train on status discipline |
| **CONVERSION** | `conversion`, sub `won` | Win rate | Revenue outcome | Industry benchmark 10–20% services | Fix Proposal stuck leads |
| **HOT LEADS** | `hot`, sub `avgScore` | High-intent leads | Speed-to-lead driver | avgScore down → data quality | Re-score after message updates |
| **AI ENGINE** | Lead `engine` field | `llm` vs Hybrid scoring | Scoring quality | Hybrid only → LLM key missing | Ops: `EMERGENT_LLM_KEY` |

### AEO intelligence strip (same 5 AEO KPIs as dashboard, compact)

---

## Charts (LeadEdge360 — data from `GET /api/kpis`)

| Chart | API fields | Meaning | Actions |
|-------|------------|---------|---------|
| **Sales performance** (14-day line) | `trend[]` — `leads`, `won` per day | Momentum | Spike/dip investigation |
| **Sources** (pie) | `bySource[]` | Channel mix | Budget to top sources |
| **Territories** (bar) | `byTerritory[]` | Geographic distribution | Expand weak territories |
| **Agent performance** (table) | `byAgent[]` — `leads`, `won`, `conversion` | Team productivity | Coach low conversion agents |
| **Status breakdown** | `byStatus[]` | Pipeline stage mix | Too many New → engagement gap |

**Statuses:** New, Contacted, Qualified, Proposal, Won, Lost

---

## RetailEdge360 (`/retailedge360` — `GET /api/retail-kpis`)

| KPI (UI label) | API field | Meaning | Business impact | Actions |
|----------------|-----------|---------|-----------------|---------|
| **TOTAL SKUs** | `total`, sub high-risk count | Catalogue size + risk | Inventory scope | Add SKUs via Add SKU |
| **INVENTORY VALUE** | `inventoryValue` | ₹ on floor | Capital tied up | Reduce slow movers |
| **AT-RISK VALUE** | `atRiskValue` | ₹ in High-risk SKUs | Near-term write-off risk | Discount or move stock |
| **REVENUE SHIELDED** | `savedSoFar` | AI projection of saves | Prevented loss | Act on High-risk rows |
| **AI ENGINE** | Product `engine` | Shelf-life model | Prediction quality | Repredict after data change |

### Charts

| Chart | API | Meaning |
|-------|-----|---------|
| Inventory value by category | `byCategory[]` | Category capital concentration |
| Shelf-life risk split | `byRisk[]` | High / Medium / Low SKU counts |

---

## Lead-level metrics (table / detail dialog)

| Field | Meaning | Actions |
|-------|---------|---------|
| **Score** (0–100) | AI lead quality | Prioritize high scores |
| **Label** Hot/Warm/Cold | Intent tier | Hot first |
| **Reasons[]** | Scoring explanation | Fix gaps (company, message) |
| **Status** | Pipeline stage | Update after each touch |
| **Source** | Acquisition channel | Attribute ROI |
| **Territory** | Geography | Local campaigns |

---

## Mobile / metrics API (ops monitoring)

From `GET /api/metrics` (Prometheus text, when deployed):

| Metric | Meaning |
|--------|---------|
| `asoftech_leads_created_total` | Cumulative leads |
| `asoftech_opportunities_won_total` | Won counter |
| `asoftech_active_users_24h` | Recent activity |
| `asoftech_mrr_inr` | MRR tracking (when configured) |

---

## KPI review cadence

| Audience | Frequency | KPIs |
|----------|-----------|------|
| Owner | Weekly | AEO Score, Conversion, Hot leads |
| Sales Head | Daily | Hot leads, trend, agent table |
| Ops | Weekly | Health API, adoption |
| CS | Per tenant weekly | Completeness, recommendations acted |

**Playbook:** [AI_BUSINESS_GROWTH_PLAYBOOK.md](./AI_BUSINESS_GROWTH_PLAYBOOK.md)
