# LeadEdge360 — Customer Success Playbook

**Version:** 1.0  
**Audience:** Customer Success, Operations  
**Onboarding kit:** [CUSTOMER_ONBOARDING_KIT.md](./CUSTOMER_ONBOARDING_KIT.md)

---

## 1. Onboarding SOP

| Step | Owner | SLA | Evidence |
|------|-------|-----|----------|
| 1. Tenant provisioned | Ops | Day 0 | Admin credentials delivered securely |
| 2. Infra + auth validation | Ops/CS | Day 0–2 | `runtime-handover/03_AUTHENTICATED_VALIDATION_CHECKLIST.md` |
| 3. Kickoff call | CS | Day 1 | Agenda: First Login + Profile |
| 4. Profile ≥ 80% | Customer | Day 7 | Screenshot AEO completeness |
| 5. First lead + Won path trained | Customer | Day 14 | CRM screenshot |
| 6. n8n channels live | Ops | Day 14 | Webhook test lead |
| 7. 30-day review | CS | Day 30 | [COMMERCIAL_VALIDATION_TOOLKIT.md](./COMMERCIAL_VALIDATION_TOOLKIT.md) |

**Escalation:** Profile not saving cross-device → document sessionStorage limitation; PO for server sync.

---

## 2. Weekly Reviews

**Cadence:** 30-minute call or async Loom + checklist.

| Review item | Data source | Target |
|-------------|-------------|--------|
| AEO Score trend | Dashboard | ↑ or stable |
| New leads | `/api/kpis` `total` / trend | vs prior week |
| Hot leads contacted | CRM audit | 100% within 24h |
| Conversion % | KPI card | ↑ |
| Top 3 recommendations acted | Growth panel | ≥ 1 action |
| Review Health | AEO row | Pending → 0 |

**Template email:** See [MARKETING_ASSETS.md](./MARKETING_ASSETS.md) § Email Campaign.

---

## 3. Health Checks

| Signal | Green | Yellow | Red |
|--------|-------|--------|-----|
| `/api/health` | `ok: true`, Mongo connected | SMTP/Razorpay warnings only | App down |
| Login | Success | Intermittent | Blocked |
| AEO section | Visible | Partial | Missing → deploy mismatch |
| LLM buttons | Work | Rules-only fallback | Errors |
| Lead create | 201 + score | Slow | 4xx/5xx |
| `/billing` | 200 (when configured) | — | 404 on live pilot |

**Ops runbook:** `docs/POST_DEPLOY_CHECKLIST.md` · `docs/operations/runtime-handover/`

---

## 4. Adoption Monitoring

| Metric | How to measure | Adoption threshold |
|--------|----------------|-------------------|
| Weekly active login | CS calendar / audit | ≥ 1 login/week per user |
| Leads created | `leads_created_total` metrics or KPI `total` | ≥ 10/week by Week 2 |
| Profile completeness | AEO KPI | ≥ 80% |
| CRM status updates | % leads not stuck in New &gt; 7d | &lt; 30% stale |
| WhatsApp outreach | CS spot-check | Hot leads contacted |
| Retail SKUs (if licensed) | `retail-kpis` `total` | &gt; 0 if retail customer |

**Low adoption playbook:** Extra training session ([TRAINING_ACADEMY.md](./TRAINING_ACADEMY.md)) + simplified weekly checklist.

---

## 5. Escalation

| Severity | Example | Path | SLA |
|----------|---------|------|-----|
| P1 | Production down | Ops → Engineering (PO approval) | 1 h |
| P2 | CRM 500, auth broken | Ops | 4 h |
| P3 | LLM key missing | Ops env config | 24 h |
| P4 | CS how-to | CS self-serve docs | 48 h |
| P5 | Feature request | Log in Commercial Validation | Backlog |

**CS → Ops:** n8n, SSH, keys, deploy parity  
**CS → PO:** Scope, billing route, freeze lift  
**CS → Engineering:** Only after PO authorizes post-freeze

---

## 6. Renewal

| Timeline | Action |
|----------|--------|
| T-60 | Health review + ROI snapshot |
| T-30 | NPS + renewal intent survey |
| T-14 | Pricing feedback template |
| T-7 | Renewal quote / plan confirmation |
| T-0 | Razorpay subscription or manual invoice |

**Data pack:** Conversion trend, won count, AEO progress, testimonial if available.

---

## 7. Expansion

| Trigger | Expansion motion |
|---------|------------------|
| Hit Starter lead cap (500/mo) | Upgrade to Growth |
| Need RetailEdge360 | Add retail module demo |
| &gt; 5 users | Growth or Scale plan |
| Multi-location | Territory training + Scale conversation |

**Expansion KPI:** MRR growth, seat count, modules active.

---

## 8. Success Metrics

| Category | KPI | Source |
|----------|-----|--------|
| **Onboarding** | Time to first Won | CRM |
| **Engagement** | Weekly active users | CS tracking |
| **Growth** | Lead volume trend | `GET /api/kpis` `trend` |
| **Conversion** | `conversion` % | KPI API |
| **AEO** | AEO Score | Dashboard |
| **Retention** | Renewal rate | Commercial toolkit |
| **Satisfaction** | NPS | Survey template |
| **Support** | Escalation count | CS ticket log |

**Executive rollup:** [PO_CUSTOMER_READINESS_REPORT.md](./PO_CUSTOMER_READINESS_REPORT.md) · [EXECUTIVE_KPI_GUIDE.md](./EXECUTIVE_KPI_GUIDE.md)

---

## Related

- `docs/aeo/post-deployment/06_CUSTOMER_SUCCESS_ENABLEMENT.md`  
- `docs/operations/live-validation/05_CUSTOMER_SUCCESS_READINESS.md`
