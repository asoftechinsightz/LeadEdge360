# LeadEdge360 — Weekly Business Review (WBR)

**Version:** 1.0 (template)  
**Cadence:** Weekly (Monday recommended)  
**Audience:** Product Owner, CS, Sales, Ops  
**Pilot:** Tenant #1 + platform health  

**Rule:** Record only observed evidence. Use **NOT CAPTURED** when data is unavailable. Do not invent feedback, ROI, NPS, or revenue.

---

## Meeting metadata

| Field | Value |
|-------|-------|
| Week of | _______________ |
| Facilitator | _______________ |
| Attendees | _______________ |
| Tenant #1 dashboard | `TENANT1_SUCCESS_DASHBOARD.md` (updated?) ☐ |

---

## 1. Wins

| # | Win | Evidence source | Verified |
|---|-----|-----------------|----------|
| 1 | | | ☐ |
| 2 | | | ☐ |
| 3 | | | ☐ |

**Platform wins (if any this week):**

| Win | Evidence |
|-----|----------|
| Example: HTTPS / app up | `/api/health` `ok: true` |
| | |

---

## 2. Risks

| # | Risk | Severity | Evidence | Owner |
|---|------|----------|----------|-------|
| 1 | | H / M / L | | |
| 2 | | | | |
| 3 | | | | |

**Standing risks (from ops — update status only):**

| Risk | Last known state | This week |
|------|------------------|-----------|
| SSH / infra checklist incomplete | Open (2 Aug) | |
| Authenticated validation pending | Open | |
| AEO unconfirmed on live | Open | |
| `/billing` 404 | Observed 2 Aug | |
| Razorpay/SMTP missing | `/api/health` | |

---

## 3. Customer Feedback

| Type | Content | Source |
|------|---------|--------|
| Verbatim quote | **NOT CAPTURED** | |
| Support tickets | **NOT CAPTURED** | |
| CS call notes | **NOT CAPTURED** | |
| Feature requests logged | **NOT CAPTURED** | `COMMERCIAL_VALIDATION_TOOLKIT.md` §6 |

**Do not invent testimonials or NPS.**

---

## 4. Business Outcomes

| Metric | Prior week | This week | Δ | Source |
|--------|------------|-----------|---|--------|
| Total leads | | | | `kpis.total` or **NOT CAPTURED** |
| Qualified | | | | `kpis.qualified` |
| Won | | | | `kpis.won` |
| Conversion % | | | | `kpis.conversion` |
| Hot leads | | | | `kpis.hot` |
| AEO Score | | | | Dashboard or **NOT CAPTURED** |
| MRR (platform) | | | | `/api/metrics` `mrr_inr` |

**ROI / revenue narrative:** **NOT CAPTURED** unless from `COMMERCIAL_VALIDATION_TOOLKIT.md` worksheet with real numbers.

---

## 5. AI Adoption

| Signal | This week | Evidence |
|--------|-----------|----------|
| Scoring engine | LLM / Hybrid / **NOT CAPTURED** | Lead `engine` field |
| AEO profile completeness % | | Dashboard or **NOT CAPTURED** |
| FAQs count | | Profile or **NOT CAPTURED** |
| LLM drafts generated | | **NOT CAPTURED** |
| Re-score actions | | **NOT CAPTURED** |
| Retail repredicts | | **NOT CAPTURED** |

---

## 6. Commercial Readiness

| Item | Status | Notes |
|------|--------|-------|
| Pilot kickoff (Tenant #1) | | |
| Authenticated validation | PENDING / PASS / FAIL | |
| Expansion criteria progress | | `TENANT_EXPANSION_READINESS.md` |
| Pricing checkout | | `/api/health` billing flags |
| Renewal intent | **NOT CAPTURED** | |

---

## 7. Decisions Required

| # | Decision | Options | PO decision | Date |
|---|----------|---------|-------------|------|
| 1 | | | | |
| 2 | | | | |

**Standing decisions (if still open):**

| Decision | Options from prior packs |
|----------|--------------------------|
| Authorize Tenant #1 guided kickoff | After WS2 + WS3 pass |
| Lift freeze for deploy/billing fix | PO only |

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Product Owner | | |
| Customer Success | | |
| Operations | | |

**Next WBR:** _______________
