# LeadEdge360 — Customer Journey Review

**Version:** 1.0  
**Scope:** End-to-end journey using **current product capabilities** (Phase-1 / pilot RC).  
**Tenant #1 journey evidence:** **NOT CAPTURED** — journey defined from product + docs, not live tenant telemetry.

**Related product docs:** `CUSTOMER_ONBOARDING_KIT.md` · `AI_BUSINESS_GROWTH_PLAYBOOK.md` · `docs/aeo/AEO_USER_JOURNEY.md`

---

## Journey map overview

```
Discovery → Lead → Qualification → Proposal → Customer (Won) → Expansion
```

---

## Stage 1 — Discovery

**Goal:** Business becomes visible to prospects (Google, AI search, WhatsApp, referrals).

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Google / local search | External GBP + website | AEO profile, FAQs, Local Visibility KPI | ≥ 1 Google-sourced lead (`bySource`) |
| Marketing site | `/`, `/products`, `/pricing` | Public marketing pages | Visitor reaches `/signin` |
| Pilot contact | Email | `contactEmail` on health API | Inquiry logged |
| AI discoverability | Search / AI Overviews | FAQ Readiness, keywords | ≥ 5 FAQs; completeness ≥ 80% |

**Tenant #1 evidence:** **NOT CAPTURED**

---

## Stage 2 — Lead

**Goal:** Inquiry captured and scored.

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Manual capture | Web | `/leadedge360` → **+ New lead** | Lead in table with score |
| WhatsApp ingest | n8n webhook | `POST /api/webhooks/whatsapp` | Source = whatsapp |
| Google / FB ads | n8n | Configured flows | Source = google / facebook |
| Website API | Integration | `POST /api/leads` | 201 + score |
| First response | WhatsApp | `wa.me` deep link on row | Contacted within 24h if Hot |

**Statuses:** **New**  
**Tenant #1 evidence:** **NOT CAPTURED**

---

## Stage 3 — Qualification

**Goal:** Determine fit and intent.

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Lead detail | Web | Score, label, reasons[] | Understand why Hot/Warm/Cold |
| Re-score | Web | **Re-score** button | Score updates after message edit |
| Status update | Web | New → **Contacted** → **Qualified** | In `kpis.qualified` |
| Territory / source | CRM filters | Filter + charts | Territory assigned |
| AI Growth recommendations | Dashboard | Growth scanner rules | Data gaps fixed (company, etc.) |

**Tenant #1 evidence:** **NOT CAPTURED**

---

## Stage 4 — Proposal

**Goal:** Commercial terms discussed; deal in pipeline.

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Pipeline status | Web | Status → **Proposal** | Visible in `byStatus` |
| Follow-up | WhatsApp | Templates in `AI_CONTENT_LIBRARY.md` | Proposal leads contacted |
| Pricing reference | Web | `/pricing` (not `/billing` on live pilot) | Customer aware of plan |
| Checkout | Razorpay | `/api/billing/checkout` when keys set | **Currently disabled** on pilot health |

**Tenant #1 evidence:** **NOT CAPTURED**

---

## Stage 5 — Customer (Won)

**Goal:** Deal closed; record as customer in CRM.

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Win recording | Web | Status → **Won** | `kpis.won` increments |
| Conversion KPI | Dashboard | CONVERSION % | Trend ↑ week-over-week |
| Review request | WhatsApp | External template | Review metrics updated in AEO profile |
| Outcome capture | CS | `COMMERCIAL_VALIDATION_TOOLKIT.md` | Business outcomes row filled |

**Tenant #1 evidence:** **NOT CAPTURED**

---

## Stage 6 — Expansion

**Goal:** Retention, upsell, referrals.

| Touchpoint | Channel | Product capability | Success checkpoint |
|------------|---------|------------------|-------------------|
| Referral leads | CRM | Source = **referral** | Referral count in `bySource` |
| Plan upgrade | Commercial | Growth / Scale plans | **NOT CAPTURED** |
| Retail module | Product | `/retailedge360` | SKU count &gt; 0 if retail |
| Renewal | CS | Commercial toolkit §8 | Renewal intent captured |
| Multi-user | Ops/API | User provisioning | **NOT CAPTURED** |

**Expansion readiness criteria:** `TENANT_EXPANSION_READINESS.md`

---

## Cross-stage enablers (always on)

| Enabler | Location | Checkpoint |
|---------|----------|------------|
| AI Growth Engine | `/dashboard` | AEO Score tracked weekly |
| DPDP consent | `/signin` | Consent on first login |
| CS weekly review | `WEEKLY_BUSINESS_REVIEW.md` | WBR completed |
| Health tier | `CUSTOMER_HEALTH_MODEL.md` | Healthy / At Risk / Critical |

---

## Journey gaps (documented — not invented)

| Gap | Impact | Documented mitigation |
|-----|--------|----------------------|
| No authenticated Tenant #1 run | Cannot validate journey | Execute `runtime-handover/03` |
| `/billing` 404 on live | Self-serve checkout broken | Use `/pricing`; CS-assisted |
| Profile sessionStorage | Multi-device profile | Document in kickoff |
| No web team-invite UI | Team scaling | Ops/API user creation |
| Opportunity UI | Metrics only | Do not promise Opportunity module |

---

## Tenant #1 journey scorecard

| Stage | Completed? | Evidence |
|-------|------------|----------|
| Discovery | **NOT CAPTURED** | |
| Lead | **NOT CAPTURED** | |
| Qualification | **NOT CAPTURED** | |
| Proposal | **NOT CAPTURED** | |
| Customer (Won) | **NOT CAPTURED** | |
| Expansion | **NOT CAPTURED** | |

**Related:** `TENANT1_SUCCESS_DASHBOARD.md` · `docs/CUSTOMER_JOURNEY_ASSESSMENT.md` (engineering assessment — cross-check capabilities)
