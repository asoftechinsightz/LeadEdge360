# LeadEdge360 — Sales Playbook

**Version:** 1.0  
**Product:** LeadEdge360 v1.0 (Product Freeze)  
**Pricing reference:** `/pricing` marketing page · [MARKETING_ASSETS.md](./MARKETING_ASSETS.md)

---

## 1. Ideal Customer Profile (ICP)

| Attribute | Target |
|-----------|--------|
| **Segment** | Indian MSMEs — services, retail, distribution |
| **Size** | 5–200 employees; 1–20 person sales team |
| **Revenue** | ₹50L–₹50Cr annual |
| **Geography** | Tier 1–2 cities + expanding territories |
| **Pain** | Leads scattered across WhatsApp, Google, Facebook; no pipeline visibility; slow follow-up |
| **Tech** | Uses WhatsApp for sales; Google Business Profile; basic website or Instagram |
| **Buyer** | Owner, Sales Head, or Operations Manager |

**Strong fit:** Lead-heavy businesses (real estate brokers, clinics, education, local services, retail chains with expiry risk + RetailEdge360).

**Weak fit:** Pure enterprise with existing Salesforce deployment and no WhatsApp channel.

---

## 2. Buyer Personas

| Persona | Role | Goals | LeadEdge360 hook |
|---------|------|-------|------------------|
| **Raj — Owner** | Founder/CEO | Revenue, visibility, low IT burden | AI Growth Engine + one dashboard |
| **Priya — Sales Head** | VP Sales | Pipeline, conversion, team accountability | CRM KPIs, agent chart, Hot leads |
| **Amit — Ops Manager** | Operations | Lead capture, compliance, integrations | n8n ingest, DPDP consent, audit |
| **Sneha — Marketing** | Growth lead | Google, social, content | AEO, FAQs, GBP drafts |

---

## 3. Discovery Questions

**Pipeline & channels**

- Where do leads come from today? (WhatsApp, Google, walk-in, referrals)
- How fast do you respond to a new inquiry?
- What % of leads become paying customers?

**Visibility & search**

- Is your Google Business Profile complete and updated?
- Do customers find you on “near me” searches?

**Team & process**

- How many people handle sales? Territories?
- What CRM or spreadsheets do you use today?

**Retail (if applicable)**

- Do you lose revenue from expiring stock? SKUs tracked?

**Budget & timeline**

- Monthly spend on ads or lead tools?
- Pilot readiness in 30 days?

---

## 4. Objection Handling

| Objection | Response |
|-----------|----------|
| “We use Excel/WhatsApp only.” | LeadEdge360 connects WhatsApp + channels into one scored pipeline — no rip-and-replace ERP. |
| “AI is hype.” | Show live **AI score** and reasons on a test lead; Hybrid engine works without LLM key. |
| “Too expensive.” | Starter ₹1,499/mo vs cost of one lost lead; ROI story §6. |
| “We need Hindi/regional.” | WhatsApp messages in customer language; profile in English for search. |
| “Data security?” | DPDP consent, tenant isolation, TLS — `docs/SECURITY_HARDENING.md` |
| “Integration?” | n8n for Google, FB, WhatsApp; API for website leads. |
| “Billing self-serve?” | Marketing `/pricing` + checkout when Razorpay configured; CS-assisted pilot today. |

---

## 5. Competitor Positioning

| vs | LeadEdge360 advantage |
|----|-------------------------|
| **Spreadsheets** | Auto scoring, trends, territory charts |
| **Generic CRM (Zoho, HubSpot)** | India-first WhatsApp, AEO Growth Engine, MSME pricing |
| **Lead gen tools** | Full pipeline to Won, not just capture |
| **Retail POS only** | RetailEdge360 shelf-life AI + LeadEdge CRM bundle |

**Do not claim:** Full proposal PDF builder, native GBP posting, or team invite UI — not Phase-1 web features.

---

## 6. ROI Story

**Example (Growth plan, services MSME):**

| Metric | Before | After 90 days (target) |
|--------|--------|------------------------|
| Leads/month | 80 | 120 (+50%) |
| Response time | 48 h | &lt; 4 h (hot leads) |
| Conversion | 8% | 12% |
| Won deals/month | 6.4 | 14.4 |

**Value:** 8 extra wins × ₹25,000 average = **₹2,00,000/month** vs **₹4,999** subscription.

**Retail add-on:** Revenue Shield KPI — `savedSoFar` projection on expiring inventory.

---

## 7. Demo Flow (30 minutes)

| Min | Screen | Show |
|-----|--------|------|
| 0–5 | `/signin` → `/dashboard` | Workspace overview, 4 KPIs, product cards |
| 5–12 | AI Growth Engine | AEO row, Improve profile, recommendations |
| 12–20 | `/leadedge360` | 5 CRM KPIs, AEO strip, charts, lead table |
| 20–25 | Create lead | Score, Hot label, WhatsApp link, status change |
| 25–28 | Optional RetailEdge360 | SKU risk, Revenue Shielded |
| 28–30 | `/pricing` | Plans, CTA |

**Demo data:** Use realistic Indian names, +91 phones, territories.

**Pre-demo checklist:** Confirm AEO visible on tenant environment (`docs/operations/runtime-handover/03_AUTHENTICATED_VALIDATION_CHECKLIST.md`).

---

## 8. Closing Strategy

| Stage | Action |
|-------|--------|
| **Pilot offer** | 30-day guided onboarding with CS ([CUSTOMER_ONBOARDING_KIT.md](./CUSTOMER_ONBOARDING_KIT.md)) |
| **Success criteria** | Profile 80%, 50 leads, 1 Won in 30 days |
| **Commercial** | Growth plan default; Starter for solopreneurs |
| **Urgency** | Google AI search + WhatsApp commerce growth in India |
| **Close** | PO-approved pilot agreement + Tenant #1 kickoff date |

**Handoff:** Closed deal → CS onboarding kit + [COMMERCIAL_VALIDATION_TOOLKIT.md](./COMMERCIAL_VALIDATION_TOOLKIT.md)

---

## Related

- [MARKETING_ASSETS.md](./MARKETING_ASSETS.md)  
- [PO_CUSTOMER_READINESS_REPORT.md](./PO_CUSTOMER_READINESS_REPORT.md)
