# LeadEdge360 — Customer Health Model

**Version:** 1.0  
**Scope:** Tenant health using **existing KPIs and metrics only** — no invented scores for live tenants.  
**KPI reference:** `EXECUTIVE_KPI_GUIDE.md` · `GET /api/kpis` · `GET /api/retail-kpis` · `/api/metrics`

---

## Health levels

| Level | Definition |
|-------|------------|
| **Healthy** | Adoption + activity thresholds met; funnel moving; AEO baseline met |
| **At Risk** | One or more dimensions below threshold for 2 consecutive weeks |
| **Critical** | No login 14d, or zero leads with active subscription, or open P1 escalation |

**Tenant #1 current tier:** **NOT CAPTURED** (no authenticated KPI snapshot).

---

## Scoring dimensions (reuse platform metrics)

### 1. Adoption

| Signal | Source | Healthy | At Risk | Critical |
|--------|--------|---------|---------|----------|
| Weekly active login (any user) | CS audit / `active_users_24h` | ≥ 1 user/week | 0 logins 7d | 0 logins 14d |
| Onboarding steps complete | Onboarding kit checklist | ≥ 6/8 sign-off | 3–5 | &lt; 3 |
| Profile completeness | AEO **BUSINESS COMPLETENESS** | ≥ 80% | 50–79% | &lt; 50% |
| Modules used | CRM + AEO minimum | Both opened weekly | One only | Neither 14d |

### 2. Activity

| Signal | Source | Healthy | At Risk | Critical |
|--------|--------|---------|---------|----------|
| New leads (weekly) | `trend[]` or week-over-week `total` | ≥ prior week or ≥ 5 | Flat 2 weeks | 0 leads 2 weeks |
| Status updates | CRM audit | &gt; 50% leads not stuck in New &gt; 7d | 30–50% stale | &gt; 70% stale |
| Hot leads contacted | CS spot-check | 100% within 24h | &lt; 80% | &lt; 50% |

### 3. Follow-ups

| Signal | Source | Healthy | At Risk | Critical |
|--------|--------|---------|---------|----------|
| Pending review replies | AEO Review Health / profile | 0 pending | 1–2 pending | ≥ 3 pending |
| n8n reminders cleared | Ops / CS | All cleared weekly | 1–2 overdue | &gt; 2 overdue |
| WhatsApp opt-in outreach | Lead `whatsapp` + CS log | Hot leads contacted | Partial | None 14d |

**Note:** `GET /api/dashboard/followups-due` (mobile JWT) — web CS may track manually until bridged.

### 4. Business outcomes

| Signal | Source | Healthy | At Risk | Critical |
|--------|--------|---------|---------|----------|
| Conversion % | `kpis.conversion` | Stable or ↑ | ↓ 2 weeks | 0% with leads &gt; 20 |
| Won count (monthly) | `kpis.won` | ≥ 1/month pilot | 0 with active pipeline | 0 with Proposal &gt; 0 |
| Qualified pipeline | `kpis.qualified` | Growing | Flat | Declining 2 months |

**Revenue / ROI:** **NOT CAPTURED** in health score unless entered in `COMMERCIAL_VALIDATION_TOOLKIT.md` with evidence.

### 5. AI usage

| Signal | Source | Healthy | At Risk | Critical |
|--------|--------|---------|---------|----------|
| AI scoring active | Leads have `score` | All new leads scored | Partial | No scores on new leads |
| Engine mode | `engine` on leads | LLM if key promised | Hybrid only (acceptable if documented) | Scoring errors |
| AEO recommendations acted | CS weekly log | ≥ 1 action/week | 0 actions 2 weeks | AEO section missing (deploy issue) |
| FAQ readiness | FAQ KPI | ≥ 5 FAQs | 3–4 | &lt; 3 |

---

## Composite health rule

| Tier | Rule |
|------|------|
| **Critical** | Any Critical threshold OR open P1 + no login 14d |
| **At Risk** | ≥ 2 At Risk dimensions OR any Critical in single dimension |
| **Healthy** | No At Risk/Critical; ≥ 4 dimensions Healthy |

Document tier in `TENANT1_SUCCESS_DASHBOARD.md` § Customer Health.

---

## Platform health (non-tenant)

For ops monitoring when tenant KPIs unavailable:

| Signal | Source | 03 Aug 2026 observed |
|--------|--------|----------------------|
| App up | `/api/health` `ok` | `true` |
| Mongo | `checks.database.ok` | `true` |
| Active tenants | `/api/metrics` | `0` |
| Active users 24h | `/api/metrics` | `0` |

Platform availability ≠ tenant health.

---

## Related

- `CUSTOMER_SUCCESS_PLAYBOOK.md` § Adoption Monitoring  
- `TENANT1_SUCCESS_DASHBOARD.md`
