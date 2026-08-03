# LeadEdge360 — Commercial Validation Toolkit

**Version:** 1.0  
**Purpose:** Collect pilot and GA commercial evidence for Product Owner decisions.  
**Storage:** Internal CS folder / CRM — **do not commit customer PII to git.**

---

## 1. Business outcomes template

**Tenant:** _______________ **Period:** _______________

| Outcome metric | Baseline (pre) | Current | Target | Source |
|----------------|----------------|---------|--------|--------|
| Leads per month | | | | `/api/kpis` `total` / trend |
| Hot leads | | | | `kpis.hot` |
| Conversion % | | | | `kpis.conversion` |
| Won deals/month | | | | `kpis.won` |
| AEO Score | | | | Dashboard |
| Response time (hot) | | | | CS observation |
| Google-sourced leads | | | | `bySource` google |
| Retail revenue shielded (if retail) | | | | `retail-kpis.savedSoFar` |

**Narrative (3 bullets):** What changed? What drove it? What blocked progress?

---

## 2. ROI worksheet

| Line | Value (INR) |
|------|-------------|
| Additional wins per month | |
| Average deal value | |
| **Gross monthly gain** | wins × deal value |
| Subscription cost (plan) | |
| Implementation / CS time (optional) | |
| **Net monthly ROI** | gain − cost |
| **ROI %** | (net ÷ cost) × 100 |

**Payback period:** First month if net &gt; 0.

**Sales reference:** [SALES_PLAYBOOK.md](./SALES_PLAYBOOK.md) § ROI Story

---

## 3. Testimonial request template

**Subject:** Quick favor — 2 sentences about LeadEdge360?

```
Hi [Name],

Your results this quarter ([metric improvement]) are exactly what we hoped for with the pilot.

Could you share 2–3 sentences on how LeadEdge360 helped [specific outcome]?

We may use it on our website with your approval.

Thank you,
[CS name]
```

**Capture:** Quote · Name · Role · Company · City · Permission (Y/N) · Date

---

## 4. Case study outline

| Section | Prompt |
|---------|--------|
| **Customer** | Industry, size, city |
| **Challenge** | Lead chaos, visibility, retail waste, etc. |
| **Solution** | Modules used (CRM, AEO, Retail) |
| **Implementation** | Onboarding timeline |
| **Results** | Quantified outcomes table (§1) |
| **Quote** | Testimonial |
| **Next steps** | Expansion, renewal |

**Publish approval:** Customer sign-off required.

---

## 5. Pricing feedback form

| Question | Response |
|----------|----------|
| Current plan | Starter / Growth / Scale |
| Price feels | Too low / Fair / Too high |
| Would pay more for | [feature or service] |
| Comparison vs alternatives | |
| Preferred billing | Monthly / Annual |
| Checkout experience | Razorpay / manual / blocked |

**Aggregate for PO:** Median willingness-to-pay, plan skew.

---

## 6. Feature request log

| Date | Tenant | Request | Category | Priority (customer) | PO status |
|------|--------|---------|----------|---------------------|-----------|
| | | | UI / API / Integration | | Backlog / Freeze |

**Rule:** Product freeze — log only; no commitment without PO.

---

## 7. NPS survey

**Question:** How likely are you to recommend LeadEdge360 to a peer MSME? (0–10)

| Score | Segment |
|-------|---------|
| 9–10 | Promoter |
| 7–8 | Passive |
| 0–6 | Detractor |

**Follow-up:** What is the primary reason for your score? _______________

**NPS:** % Promoters − % Detractors

**Cadence:** Day 30 pilot, pre-renewal (T-30).

---

## 8. Renewal intent

| Field | Value |
|-------|-------|
| Tenant | |
| Renewal date | |
| Intent | Renew / Upgrade / Downgrade / Churn |
| Blockers | |
| Expansion interest | Retail / more seats / Scale |
| CS confidence | High / Medium / Low |

**Churn risk signals:** No login 14d, conversion down 2 months, open P2 escalations.

---

## Pilot close-out package (submit to PO)

- [ ] Business outcomes table (§1)  
- [ ] ROI worksheet (§2)  
- [ ] Testimonial or case study draft (§3–4)  
- [ ] Pricing feedback summary (§5)  
- [ ] Feature request export (§6)  
- [ ] NPS score (§7)  
- [ ] Renewal intent (§8)  

**Route to:** [PO_CUSTOMER_READINESS_REPORT.md](./PO_CUSTOMER_READINESS_REPORT.md) update cycle.
