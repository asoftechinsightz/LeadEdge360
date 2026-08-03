# AEO Executive KPI Mapping — LeadEdge360

**Version:** 1.0  
**Purpose:** Map executive AEO dashboard cards to **existing API fields** and client derivations  

---

## 1. Executive KPI summary table

| Executive KPI | Dashboard label | Primary API | Response fields | Computation |
|---------------|-----------------|-------------|-----------------|-------------|
| AEO Score | AEO SCORE | Derived | — | Weighted blend (see §2) |
| Business Completeness | BUSINESS COMPLETENESS | `PATCH/GET users/me` | `preferences.aeoProfile`, `preferences.checklistState` | Checklist weighted % |
| FAQ Readiness | FAQ READINESS | `users/me` preferences | `preferences.aeoProfile.faqs[]` | `length / target` |
| Local Visibility Readiness | LOCAL VISIBILITY | `GET /api/kpis` | `byTerritory[]` | §2.4 |
| Review Health | REVIEW HEALTH | `users/me` + optional follow-ups | `reviews.*`, followups | §2.5 |

**No new API fields required on server responses.**

---

## 2. Formula reference

### 2.1 AEO Score

```text
aeoScore = clamp(0, 100,
  0.35 * businessCompletenessPct
  + 0.25 * faqReadinessPct
  + 0.25 * localVisibilityPct
  + 0.15 * reviewHealthPct
)
```

### 2.2 Business Completeness

```text
completenessPct = sum(checklist.item.weight for item if item.done) / sum(weights) * 100
```

Checklist items from `config/aeo/readiness-checklist.json`.

### 2.3 FAQ Readiness

```text
faqReadinessPct = min(100, (faqCount / faqTarget) * 100)
faqCount = preferences.aeoProfile.faqs.length
faqTarget = config default 5
```

### 2.4 Local Visibility Readiness

```text
targetAreas = preferences.aeoProfile.serviceAreas (or default TERRITORIES)
activeCount = count(t in kpis.byTerritory where t.leads > 0)
localVisibilityPct = activeCount / targetAreas.length * 100
```

**API call:**

```http
GET /api/kpis
```

**Response excerpt:**

```json
{
  "byTerritory": [{ "name": "Bengaluru", "leads": 12 }, ...],
  "bySource": [...],
  "total": 42
}
```

### 2.5 Review Health

```text
if pendingReplies > 0:
  reviewHealthPct = max(0, 100 - pendingReplies * 20)
else if averageRating >= 4.0:
  reviewHealthPct = 100
else:
  reviewHealthPct = averageRating / 5 * 100
```

Optional supplement:

```http
GET /api/dashboard/followups-due
```

Count follow-ups with `title` containing `review` or `channel=whatsapp`.

---

## 3. Supporting CRM KPIs (existing row — unchanged)

| KPI | API | Fields |
|-----|-----|--------|
| Total leads | `GET /api/kpis` | `total` |
| Qualified | `GET /api/kpis` | `qualified` |
| Conversion | `GET /api/kpis` | `conversion`, `won` |
| Hot leads | `GET /api/kpis` | `hot` |
| Avg score | `GET /api/kpis` | `avgScore` |
| Sales trend | `GET /api/kpis` | `trend[]` |

Mobile equivalent: `GET /api/dashboard/kpis` returns `totalLeads`, `hotLeads`, `conversion`, etc.

---

## 4. Growth intelligence KPIs (Phase 3)

| KPI | API | Fields |
|-----|-----|--------|
| Revenue trend | `GET /api/dashboard/revenue` | `series[]`, `total` |
| Agent performance | `GET /api/dashboard/sales-performance` | `byAgent[]` |
| Territory wins | `GET /api/dashboard/sales-performance` | `byTerritory[]` |

Used for Growth Hub composition — not AEO row but same dashboard fetch batch.

---

## 5. Lead Scanner signals

| Signal | API query | Field |
|--------|-----------|-------|
| Cold pipeline | `GET /api/leads?label=Cold` | `leads[]` |
| Missing company | Client filter `!lead.company` | — |
| Low score | `GET /api/leads?sort=score` | `score` |
| Google gap | `GET /api/kpis` | `bySource` google count |

---

## 6. API authentication matrix

| Endpoint | Web (cookie) | Mobile (JWT) |
|----------|--------------|--------------|
| `/api/kpis` | ✓ `resolveTenant` | ✓ Bearer |
| `/api/auth/me` | ✓ | — |
| `/api/users/me` | — | ✓ Bearer |
| `/api/dashboard/kpis` | — | ✓ Bearer |
| `/api/dashboard/followups-due` | — | ✓ Bearer |
| `/api/followups` | ✓ via mobileRoute if JWT | ✓ |

Web AEO profile edit: may require bridging `PATCH /users/me` for cookie users — **implementation note:** extend `GET /api/auth/me` to include `preferences` read-only without new route (optional small field addition to existing response — document as metadata exposure only if PO approves). **For freeze:** use mobile JWT path or client-only session after explicit `PATCH /users/me` from a thin bridge — document in readiness report.

Actually user said no API changes - so web must use PATCH users/me only available through mobile route with JWT. For web cookie users, store aeo profile in sessionStorage until API bridge approved - document in readiness.

---

## 7. KPI refresh cadence

| Surface | Refresh |
|---------|---------|
| Dashboard load | Once on mount |
| Pull-to-refresh | Re-fetch kpis + preferences |
| After profile save | Recompute client scores |
| n8n automations | Weekly batch |

---

## 8. Executive reporting export (client-only)

Export PDF/CSV of AEO KPI row from client state — no export API.

---

## Related

- [AEO_DASHBOARD_SPECIFICATION.md](./AEO_DASHBOARD_SPECIFICATION.md)
- [MOBILE_API_MAPPING.md](../mobile/MOBILE_API_MAPPING.md) — dashboard endpoints
