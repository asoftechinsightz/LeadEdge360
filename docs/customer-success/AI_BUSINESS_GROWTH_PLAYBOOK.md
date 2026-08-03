# AI Business Growth Playbook — LeadEdge360 for MSMEs

**Version:** 1.0  
**Audience:** MSME owners, managers, and CS coaches  
**Scope:** Existing platform capabilities only  

**Extended MSME walkthrough:** `docs/aeo/post-deployment/08_BUSINESS_GROWTH_PLAYBOOK.md`  
**AEO specs:** `docs/aeo/AEO_FUNCTIONAL_SPECIFICATION.md`

---

## Executive summary

LeadEdge360 helps Indian MSMEs grow by combining **CRM intelligence**, **AI lead scoring**, and the **AI Growth Engine (AEO)** — answer-engine optimization for visibility in Google, AI search, and WhatsApp-led engagement. No new engineering required; follow dashboards and playbooks.

---

## 1. Business Visibility

| Lever | In LeadEdge360 | Action |
|-------|----------------|--------|
| Unified pipeline | `/leadedge360` | One view of all channels |
| Source analytics | SOURCES chart (`bySource`) | Invest in top channels |
| Territory coverage | TERRITORY chart + Local Visibility KPI | Expand under-served cities |
| Executive snapshot | `/dashboard` Row 1 KPIs | Weekly review with leadership |

**KPI:** Total leads, conversion % — [EXECUTIVE_KPI_GUIDE.md](./EXECUTIVE_KPI_GUIDE.md)

---

## 2. AI Search Optimization (AEO)

| Component | Location | Goal |
|-----------|----------|------|
| AEO Score | Dashboard AEO row | Composite readiness 0–100 |
| Business Completeness | Profile checklist | Structured business data |
| FAQ Readiness | Profile FAQs | AI Overview–friendly Q&A |
| Growth recommendations | Rule + optional LLM | Prioritized actions |
| AI drafts | Suggest FAQs, GBP post, review reply | Copy → publish externally |

**Formula reference:** `docs/aeo/AEO_EXECUTIVE_KPI_MAPPING.md`

---

## 3. Local SEO

1. Complete **website**, **service areas** (3+), **long description** (150+ chars)
2. Add location FAQs (“Do you serve [city]?”, “Near me” queries)
3. Track **Local Visibility** % — territories with at least one lead
4. Use **local-page** AI draft → publish on website manually
5. Align NAP (name, address, phone) across profile and GBP

---

## 4. Google Business Profile

LeadEdge360 does **not** post to GBP directly in Phase-1.

| Step | Tool |
|------|------|
| Store GBP URL | Profile field `gbpUrl` |
| Generate post copy | **GBP post draft** (AI) |
| Publish | Copy to Google Business Profile app |
| Track reviews | Review count, rating, pending replies in profile |
| Review replies | **Review reply** AI draft → verify → post on Google |

**n8n:** `aeo-review-reminder.json` can nudge pending replies (ops-enabled).

---

## 5. WhatsApp Marketing

| Feature | How |
|---------|-----|
| Lead capture | n8n WhatsApp ingest webhook |
| Per-lead outreach | WhatsApp icon on lead row (`wa.me` deep link) |
| Opt-in | Lead **WhatsApp opt-in** toggle |
| Templates | [AI_CONTENT_LIBRARY.md](./AI_CONTENT_LIBRARY.md) |
| Automation | n8n follow-up flows (stale leads, Google priority) |

**Compliance:** Only message opted-in leads; include business identity in first message.

---

## 6. Lead Generation

| Channel | Integration |
|---------|-------------|
| Website | `POST /api/leads` or form |
| Google | n8n Google Lead Form |
| Facebook | n8n FB Lead Ads |
| WhatsApp | n8n webhook |
| Referral | Manual source `referral` |

**AI scoring:** New leads auto-scored; prioritize **Hot** and **google** source.  
**Growth scanner:** Dashboard recommendations flag cold pipeline and missing company fields.

---

## 7. Customer Engagement

- Respond to Hot leads within 24 hours (WhatsApp)
- Re-score after enriching lead message
- Status progression: New → Contacted → Qualified
- Review Health panel — clear pending Google replies
- Agent performance chart — balance workload

---

## 8. Proposal Conversion

- Move qualified opportunities to **Proposal** status
- Watch **Conversion** KPI and 14-day **trend** chart (leads + wins)
- Re-score when budget/timeline added to message
- Follow up Proposal-stage leads stuck &gt; 14 days
- Use proposal follow-up prompts from AI Content Library

---

## 9. Customer Retention

- Re-engage **Warm** leads not contacted 7+ days
- n8n nurture for stale **New** leads (opt-in WhatsApp)
- Track repeat wins via **won** count on trend chart
- Monthly: compare conversion % month-over-month

---

## 10. Referral Growth

- Capture leads with source **referral**
- Ask won customers for referrals via WhatsApp template
- Add referral FAQs to profile (“Do you offer referral discounts?”)
- Track referral volume in SOURCES pie chart

---

## 11. Review Management

| Metric | Profile field | KPI |
|--------|---------------|-----|
| Review count | `reviewCount` | Review Health |
| Average rating | `averageRating` | Review Health |
| Pending replies | `pendingReviewReplies` | Review Health |

**Workflow:** Update metrics weekly → AI review reply draft → post on Google → decrement pending count.

---

## 90-day growth rhythm

| Month | Focus |
|-------|-------|
| 1 | Profile + AEO baseline + first 50 leads |
| 2 | Channel optimization + WhatsApp cadence |
| 3 | Conversion lift + case study capture |

**CS enablement:** `docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md`
