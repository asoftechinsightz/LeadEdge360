# Workstream 1 — Dashboard Validation

**Program:** LeadEdge360 AI Growth Engine Phase-1  
**Pilot environment:** `https://app.asoftechinsightz.com`  
**Validation date:** August 2026  
**Method:** Live HTTP probe (unauthenticated) + authenticated checklist + local codebase audit  
**Validator:** Post-deployment validation (documentation only)

---

## 1. Executive summary

| Area | Pilot result | Notes |
|------|--------------|-------|
| AI Growth Engine widget | **NOT VERIFIED LIVE** | Pilot returns sign-in gate on `/dashboard`; AEO build not confirmed on production revision |
| Executive KPI cards | **NOT VERIFIED LIVE** | Present in codebase; requires authenticated session on deployed revision |
| Business Profile Completeness | **CODEBASE PASS** | Checklist + `%` on AEO KPI row |
| AEO Score | **CODEBASE PASS** | Weighted client-side score |
| Growth Recommendation Panel | **CODEBASE PASS** | Rule groups + optional LLM output panel |
| Business Health Score | **N/A (product scope)** | No separate widget in Phase-1; **AEO Score** is the composite health indicator |
| Responsiveness | **CODEBASE PASS** | Tailwind grid `grid-cols-2 lg:grid-cols-5` |
| Console errors | **NOT VERIFIED LIVE** | Requires authenticated browser session |
| Browser compatibility | **DESIGN-TIME PASS** | Standard React 18 / Next 14 client components |

**Overall WS1:** **CONDITIONAL** — validation blocked until Tenant #1 pilot revision with AEO Phase-1 is confirmed deployed and accessible.

---

## 2. Pilot environment probes (2 August 2026)

| URL | HTTP result | Observation |
|-----|-------------|-------------|
| `https://app.asoftechinsightz.com/dashboard` | 200 (sign-in page) | No workspace shell or AEO widget without auth |
| `https://app.asoftechinsightz.com/leadedge360` | **500** | Server error on unauthenticated/cookie probe — regression risk on live host |

**Screenshot status:** Screenshots **not captured** — sign-in gate and 500 on `/leadedge360` prevent dashboard capture without Tenant #1 credentials and confirmed deploy revision.

**Recommended capture list (CS / PO with pilot login):**

1. `/dashboard` — workspace overview row + AI Growth Engine section  
2. `/dashboard` — expanded profile panel + checklist  
3. `/dashboard` — growth recommendations panel  
4. `/leadedge360` — CRM KPI row + AEO intelligence strip  
5. Mobile viewport (390×844) — AEO KPI row collapse behavior  

Store under internal CS folder (not product repo) per data policy.

---

## 3. Widget validation matrix (codebase + expected pilot behavior)

| Widget | Location | Data source | Pilot check |
|--------|----------|-------------|-------------|
| AI Growth Engine | `/dashboard` — `AeoGrowthEngine` | `GET /api/kpis`, `GET /api/leads`, sessionStorage profile | ☐ PO sign-off after deploy |
| Executive row (workspace) | `/dashboard` row 1 | `GET /api/kpis`, `GET /api/retail-kpis` | ☐ Unchanged baseline |
| AEO SCORE | AEO KPI row | Client `computeAeoScore()` | ☐ Displays 0–100 |
| BUSINESS COMPLETENESS | AEO KPI row | Checklist weights | ☐ Displays % |
| FAQ READINESS | AEO KPI row | `faqs.length / 5` | ☐ Displays count |
| LOCAL VISIBILITY | AEO KPI row | `kpis.byTerritory` vs service areas | ☐ Displays % |
| REVIEW HEALTH | AEO KPI row | Manual `reviews.*` in profile | ☐ Displays label |
| Growth recommendations | Panel below KPIs | `buildRuleRecommendations()` | ☐ Lists categories |
| Profile panel | Collapsible on `/dashboard` | sessionStorage `leadedge_aeoProfile` | ☐ Persists per browser tab |
| AEO strip (CRM) | `/leadedge360` optional row | Same profile + kpis | ☐ Visible below CRM KPIs |

---

## 4. Business Health Score clarification

Phase-1 does **not** ship a standalone “Business Health Score” card. PO checklist item maps to:

- **Primary:** AEO Score (35% completeness + 25% FAQ + 25% local + 15% review)  
- **Secondary:** Business Completeness % on checklist  

Customer Success should **not** promise a separate Business Health KPI until a future release defines it.

---

## 5. Responsiveness & UX

| Breakpoint | Expected behavior | Codebase |
|------------|-------------------|----------|
| Mobile (`grid-cols-2`) | 2-column KPI grid | ✓ |
| Desktop (`lg:grid-cols-5`) | 5-column AEO row | ✓ |
| Profile panel | Full-width form, stacked fields | ✓ |
| Collapse “Improve profile” | Toggles panel without navigation | ✓ |

---

## 6. Console & browser compatibility (checklist)

Run with Tenant #1 admin after confirmed deploy:

| Browser | Version target | Console clean? | AEO widgets render? |
|---------|----------------|----------------|---------------------|
| Chrome | Latest | ☐ | ☐ |
| Edge | Latest | ☐ | ☐ |
| Firefox | Latest | ☐ | ☐ |
| Safari (iOS) | 16+ | ☐ | ☐ |

**Expected console noise (acceptable):** none from AEO module if APIs return 200.  
**Watch for:** 401 on `/api/kpis` if session expired; sessionStorage quota errors (unlikely).

---

## 7. Findings & conditions

| ID | Finding | Severity |
|----|---------|----------|
| F-01 | AEO Phase-1 not confirmed on production pilot revision (see `docs/PHASE1_DEPLOYMENT_VERIFICATION.md`) | **High** |
| F-02 | `/leadedge360` returned 500 on external probe | **High** |
| F-03 | No Business Health Score widget (scope N/A) | **Low** |
| F-04 | Profile persists in sessionStorage only on web | **Medium** |

---

## 8. WS1 verdict

**CONDITIONAL PASS** — Codebase implementation meets Phase-1 dashboard specification; **live pilot validation incomplete** pending deploy parity and authenticated test session.

---

## Related

- [AEO_PHASE1_RELEASE_VALIDATION_REPORT.md](../AEO_PHASE1_RELEASE_VALIDATION_REPORT.md)  
- [PHASE1_DEPLOYMENT_VERIFICATION.md](../../PHASE1_DEPLOYMENT_VERIFICATION.md)
