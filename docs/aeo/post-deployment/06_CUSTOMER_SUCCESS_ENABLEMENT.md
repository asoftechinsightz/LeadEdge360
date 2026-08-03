# Workstream 6 — Customer Success Enablement

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Audience:** Tenant #1 (MSME pilot) + Customer Success team  
**Date:** August 2026

> **Consolidated GTM pack:** `docs/customer-success/` — onboarding kit, CS playbook, KPI guide, marketing assets, and PO readiness report. This document retains the **30-day plan and weekly checklists**; avoid duplicating content from the new pack.

---

## 1. Purpose

Operational assets to help Tenant #1 achieve measurable growth using **existing** LeadEdge360 capabilities — no product changes.

---

## 2. Business Profile Completion Guide

Complete your profile on **Dashboard → AI Growth Engine → Improve profile**. Data saves in your browser session until mobile sync is available.

| Field | Why it matters | LeadEdge360 Phase-1 |
|-------|----------------|---------------------|
| **Business name** | Trust + AI answers | ✓ Profile field |
| **Logo** | Brand recognition | Document offline; upload to GBP/social manually |
| **GST** | B2B compliance, invoices | **Not in app** — keep in accounting; mention in long description if needed |
| **PAN** | Tax identity | **Not in app** — internal records only |
| **Website** | AEO + credibility | ✓ Profile + checklist |
| **WhatsApp** | India engagement channel | ✓ Opt-in toggle + lead `wa.me` links |
| **Service areas** | Local visibility score | ✓ Territory badges |
| **Products** | Describe in FAQs / long description | ✓ FAQs + keywords |
| **Working hours** | Local trust signals | ✓ `hours` field |

**Completeness target:** 80%+ Business Completeness KPI before Week 2 campaigns.

---

## 3. 30-Day Growth Plan (Tenant #1)

### Week 1 — Business setup

- [ ] Complete AI Growth Engine profile (all checklist items green)  
- [ ] Add 5 FAQs (use **Suggest FAQs** if LLM enabled)  
- [ ] Confirm phone, website, WhatsApp messaging ready  
- [ ] Register Google Business Profile (external) — paste reference URL in profile  
- [ ] Capture GST/PAN in your compliance folder (external to LeadEdge360)

### Week 2 — Lead generation

- [ ] Connect lead sources: website form, WhatsApp ingest, Google/Facebook n8n flows  
- [ ] Review **Growth scanner** recommendations weekly  
- [ ] Prioritize Google-sourced leads (n8n nurture sorts them first)  
- [ ] Target: +20% new leads vs Week 1 baseline

### Week 3 — Customer engagement

- [ ] Respond to all **Hot** leads within 24 h via WhatsApp deep links  
- [ ] Log pending review replies in Review Health panel  
- [ ] Use AI drafts for review replies — **verify before posting**  
- [ ] Re-score stale leads after updating messages

### Week 4 — Revenue optimization

- [ ] Move qualified leads to **Proposal** status in CRM  
- [ ] Track conversion KPI on dashboard  
- [ ] Run weekly pipeline review: cold → warm promotions  
- [ ] Monthly: compare AEO Score trend (screenshot each Monday)

---

## 4. Weekly Success Checklist

| Area | Actions |
|------|---------|
| **Business profile** | Completeness ≥ 80%; 5 FAQs; 3+ service areas |
| **Lead quality** | Avg score ↑; fewer cold leads |
| **Follow-ups** | Every hot lead contacted; n8n reminders cleared |
| **Proposal health** | Leads in Proposal status reviewed |
| **Conversion** | Won count vs prior week |
| **Customer retention** | Re-engage warm leads not contacted 7+ days |
| **Growth activities** | 1 local visibility action (GBP post, territory focus) |
| **AEO** | AEO Score recorded; act on top 3 recommendations |

---

## 5. AEO Best Practices Guide (using LeadEdge360)

### Improve Google visibility

- Complete **website**, **service areas**, and **long description** (150+ chars)  
- Add FAQs that match “near me” and pricing questions  
- Track **Local Visibility** KPI — aim for leads in every target city  
- Use **GBP post draft** → copy to Google Business Profile manually

### Improve AI discoverability

- Use **keywords** field + **Suggest FAQs**  
- Keep category accurate  
- Maintain consistent NAP (name, address, phone) across web + profile

### Improve lead quality

- Enable WhatsApp on capture forms  
- Re-score after enriching lead messages  
- Filter **Cold** leads in CRM and fix data gaps (company name, territory)

### Improve customer engagement

- WhatsApp follow-up within 4 h for hot leads  
- Use review reply drafts for pending reviews  
- Manual review metrics in Review Health panel

### Improve conversion

- Status discipline: New → Contacted → Qualified → Proposal → Won  
- Watch dashboard **Conversion** and **Hot leads** KPIs  
- Act on growth scanner “missing company” signals

---

## 6. CS escalation paths

| Issue | Escalate to |
|-------|-------------|
| Profile not saving across devices | PO — known sessionStorage limitation |
| LLM buttons fail | Ops — `EMERGENT_LLM_KEY` |
| n8n reminders not firing | Ops — JWT + workflow active state |
| `/leadedge360` errors | Engineering — only after PO lifts freeze |

---

## 7. Deliverable status

| Asset | Status |
|-------|--------|
| Business Profile Completion Guide | **Complete** (this doc §2) |
| 30-Day Growth Plan | **Complete** (§3) |
| Weekly Success Checklist | **Complete** (§4) |
| AEO Best Practices | **Complete** (§5) |

---

## Related

- [08_BUSINESS_GROWTH_PLAYBOOK.md](./08_BUSINESS_GROWTH_PLAYBOOK.md)  
- [AEO_USER_JOURNEY.md](../AEO_USER_JOURNEY.md)  
- [Customer Success GTM pack](../../customer-success/CUSTOMER_ONBOARDING_KIT.md)
