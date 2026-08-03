# Workstream 9 — Executive Dashboard Review

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Date:** August 2026  
**Rule:** Reuse existing dashboards only — **no new KPIs** beyond Phase-1 AEO row

---

## 1. Dashboard surfaces

| Surface | Route | Purpose |
|---------|-------|---------|
| Workspace overview | `/dashboard` | Cross-product executive view |
| CRM command center | `/leadedge360` | Sales execution |
| Billing | `/billing` | Subscription status |
| RetailEdge360 | `/retailedge360` | Inventory KPIs (parallel product) |

---

## 2. KPI taxonomy validation

### Business KPIs

| KPI | Location | API | Phase-1 change |
|-----|----------|-----|----------------|
| Workspace plan badge | `/dashboard` header | `GET /api/auth/me` | None |
| Product adoption cards | `/dashboard` | kpis summary text | None |

### Sales KPIs

| KPI | Location | API | Phase-1 change |
|-----|----------|-----|----------------|
| Total leads | `/dashboard` row 1, CRM row | `GET /api/kpis` | None |
| Hot leads | Same | `total`, `hot` | None |
| Conversion % | Same | `conversion`, `won` | None |
| Qualified | CRM | `qualified` | None |
| Territory performance | CRM chart | `byTerritory` | None |
| Source mix | CRM chart | `bySource` | None |
| Agent leaderboard | CRM | `byAgent` | None |
| Trend (14d) | CRM | `trend` | None |

### Customer KPIs

| KPI | Location | Notes |
|-----|----------|-------|
| Review Health label | AEO row | Manual metrics in profile |
| Pending review count | Profile panel | Not from Google API |
| WhatsApp opt-in leads | CRM table | `lead.whatsapp` |

**Customer 360:** Not in product — N/A.

### AEO KPIs (Phase-1 additive row — same dashboards)

| KPI | Label | Source |
|-----|-------|--------|
| AEO Score | AEO SCORE | Client weighted blend |
| Profile completeness | BUSINESS COMPLETENESS | Checklist % |
| FAQ coverage | FAQ READINESS | faq count / 5 |
| Territory coverage | LOCAL VISIBILITY | kpis + service areas |
| Review responsiveness | REVIEW HEALTH | Manual + derived % |

### AI KPIs

| KPI | Location | Notes |
|-----|----------|-------|
| AI ENGINE (CRM) | `/leadedge360` | LLM vs Hybrid from lead engine |
| AI lead score | Lead detail | Per-lead score + reasons |
| AI Growth suggestions | Dashboard panel | Rule + optional LLM |
| Rescore | Lead actions | `POST /leads/{id}/rescore` unchanged |

### Operational KPIs

| KPI | Location |
|-----|----------|
| SKUs at risk | `/dashboard` row 1 |
| Retail totals | RetailEdge360 |

### Platform KPIs

| KPI | Source |
|-----|--------|
| API health | Ops (`GET /api/`) |
| n8n flow status | Ops console |
| LLM engine mode | New lead `engine` field |

---

## 3. “No new KPIs” compliance

| Check | Result |
|-------|--------|
| New routes for executive reporting | **None** |
| New API fields for KPIs | **None** |
| AEO metrics client-derived | **Yes** — compliant with freeze |
| Separate Business Health Score widget | **No** — AEO Score serves composite role |

---

## 4. Executive dashboard walkthrough (PO / Tenant #1)

```
☐ Row 1: Total leads, Hot, Conversion, SKUs at risk — values load
☐ Row 2 (AEO): Five cards align with KPI mapping doc
☐ Recommendations panel shows actionable bullets
☐ CRM: Original five KPI cards unchanged
☐ AEO strip on CRM (optional row) matches Dashboard AEO values (same session profile)
☐ No new sidebar items
```

---

## 5. Gaps vs aspirational executive taxonomy

| Aspirational KPI | Phase-1 |
|------------------|---------|
| Revenue forecast | Not on dashboard |
| Invoice aging | Not in CRM module |
| CAC / LTV | Not in product |
| NPS | Not in product |

Document as **future roadmap** — not pilot defects.

---

## 6. WS9 verdict

**PASS** — Executive KPI structure reuses existing dashboards with additive AEO row; taxonomy mapped and freeze-compliant.

---

## Related

- [AEO_EXECUTIVE_KPI_MAPPING.md](../AEO_EXECUTIVE_KPI_MAPPING.md)  
- [AEO_DASHBOARD_SPECIFICATION.md](../AEO_DASHBOARD_SPECIFICATION.md)
