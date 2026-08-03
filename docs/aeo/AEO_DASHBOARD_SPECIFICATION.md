# AEO Dashboard Specification — LeadEdge360

**Version:** 1.0  
**Constraint:** Reuse existing `KpiCard` component and API fetches — **no new routes or navigation**  

---

## 1. Surfaces

| Page | Route | Change type |
|------|-------|-------------|
| Workspace overview | `/dashboard` | Add second KPI row OR replace one retail card when LeadEdge-only |
| CRM command center | `/leadedge360` | Optional third KPI row below existing 5 cards |

**Forbidden:** `/aeo`, `/growth-hub`, sidebar links, marketing nav entries.

---

## 2. Component reuse

Source component from `app/(application)/leadedge360/page.js`:

```text
KpiCard({ icon, label, value, sub, accent })
  └── Card + CardContent pattern
  └── grid-cols-2 md:grid-cols-4 lg:grid-cols-5
```

Workspace dashboard (`app/(application)/dashboard/page.js`) uses the same Card grid pattern.

**Implementation:** Import shared `KpiCard` or duplicate styling — composition only.

---

## 3. AEO KPI row layout

### 3.1 `/dashboard` — Row 2 (AEO Intelligence)

Insert below existing Row 1 (`Total leads`, `Hot leads`, `Conversion`, `SKUs at risk`):

| Position | Card label | Value source | Subtitle | Accent |
|----------|------------|--------------|----------|--------|
| 1 | AEO SCORE | `computeAeoScore()` 0–100 | “answer readiness” | primary |
| 2 | BUSINESS COMPLETENESS | `checklistCompletePct()` % | “profile fields” | primary |
| 3 | FAQ READINESS | `faqCount / faqTarget` | e.g. “3 of 5 FAQs” | accent |
| 4 | LOCAL VISIBILITY | `territoryCoveragePct()` % | “territories active” | accent |
| 5 | REVIEW HEALTH | `reviewHealthLabel()` | e.g. “2 pending replies” | primary or rose if pending |

**Grid:** `grid-cols-2 lg:grid-cols-5 gap-4` — matches LeadEdge360 KPI row.

### 3.2 Section header

```text
AEO INTELLIGENCE · answer engine readiness
[optional] Improve profile → expands inline panel
```

No link to new route — expand/collapse on same page.

---

## 4. Computation formulas (client-side)

All scores derived **without new API fields**.

### 4.1 AEO Score (0–100)

Weighted blend:

| Component | Weight | Source |
|-----------|--------|--------|
| Business Completeness | 35% | Checklist % |
| FAQ Readiness | 25% | min(faqCount/target, 1) × 100 |
| Local Visibility | 25% | territories with leads / target territories |
| Review Health | 15% | 100 if pendingReplies=0 and rating≥4; else scaled |

```text
aeoScore = round(0.35*completeness + 0.25*faqPct + 0.25*localPct + 0.15*reviewPct)
```

### 4.2 Business Completeness

From `config/aeo/readiness-checklist.json` weights applied to `preferences.aeoProfile` + checklist toggles.

### 4.3 FAQ Readiness

```text
faqCount = preferences.aeoProfile.faqs?.length ?? 0
faqTarget = config.aeo.faqTarget ?? 5
display = `${faqCount} of ${faqTarget}`
```

### 4.4 Local Visibility Readiness

```text
targetAreas = preferences.aeoProfile.serviceAreas ?? TERRITORIES constant
activeAreas = kpis.byTerritory.filter(t => t.leads > 0).map(t => t.name)
coveragePct = activeAreas.length / targetAreas.length * 100
```

Data: `GET /api/kpis` response fields `byTerritory`.

### 4.5 Review Health

```text
pending = preferences.aeoProfile.reviews?.pendingReplies ?? 0
rating = preferences.aeoProfile.reviews?.averageRating ?? 0
label = pending > 0 ? `${pending} pending` : rating >= 4 ? 'Healthy' : 'Needs attention'
```

Supplement: count open follow-ups with `channel=whatsapp` from `GET /api/dashboard/followups-due`.

---

## 5. API fetch plan (no new endpoints)

Single dashboard load:

```text
Promise.all([
  fetch('/api/kpis'),
  fetch('/api/auth/me'),          // user + billing; preferences if included in user
  fetch('/api/dashboard/followups-due'),  // optional JWT path; cookie: use followups
])
```

For cookie-auth web: `GET /api/kpis` + `GET /api/auth/me`.  
Preferences: require `PATCH /users/me` round-trip or embed in user if extended in future — **today** load preferences from last PATCH response stored client state after profile edit.

**Mobile JWT:** `GET /dashboard/kpis`, `GET /users/me`, `GET /dashboard/followups-due`.

---

## 6. Inline AEO profile panel (dashboard)

Collapsed by default. Expands below AEO row.

| Section | Fields | Save |
|---------|--------|------|
| Business identity | name, category, description | PATCH preferences |
| Service areas | multi-select territories | PATCH preferences |
| Keywords | tag input | PATCH preferences |
| FAQs | list editor | PATCH preferences |
| Reviews | count, rating, pending | PATCH preferences |
| Checklist | toggles from config | PATCH preferences.checklistState |

**Actions:**

- “Generate FAQ suggestions” → AI catalog prompt
- “Improve description” → AI catalog prompt
- “Generate GBP post” → content prompt → clipboard

---

## 7. `/leadedge360` optional AEO strip

Below existing KPI row (TOTAL LEADS … AI ENGINE), add compact strip:

| Mini-card | Value |
|-----------|-------|
| AEO | `aeoScore` |
| FAQs | `faqCount` |
| Local | `coveragePct%` |

Click opens same inline panel (shared state) or scrolls to panel on `/dashboard` — **cross-page state via sessionStorage** optional, no new route.

---

## 8. States

| State | UI |
|-------|-----|
| Loading | Skeleton cards (same as KPI loading) |
| No preferences | Defaults; completeness 0% |
| Demo org | Show config sample profile |
| LLM unavailable | AI buttons disabled with tooltip |
| Error on KPI fetch | “—” values + retry |

---

## 9. Role visibility

| Role | AEO row |
|------|---------|
| admin | Full edit + all cards |
| manager | Full view + edit profile |
| agent | View cards; edit limited fields (optional config) |

Gate edit panel with `user.role` from `GET /api/auth/me`.

---

## 10. Backward compatibility

- Existing KPI row unchanged (Row 1 on `/dashboard`, 5 cards on `/leadedge360`)
- No API response shape changes
- AEO row additive only

---

## Related

- [AEO_EXECUTIVE_KPI_MAPPING.md](./AEO_EXECUTIVE_KPI_MAPPING.md)
- [AEO_FUNCTIONAL_SPECIFICATION.md](./AEO_FUNCTIONAL_SPECIFICATION.md)
