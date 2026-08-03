# WS2 — AEO Deployment Verification

**Approved Pilot RC:** Local workspace `asoftech-insightz` with AEO Phase-1 (`docs/aeo/AEO_PHASE1_RELEASE_VALIDATION_REPORT.md`)  
**Live target:** Pilot VPS application container (via `https://app.asoftechinsightz.com`)  
**Date:** 2 August 2026  
**Method:** Approved RC file manifest + external probes; **container inspection blocked** (no SSH)

---

## 1. Summary

| Check | Live container | Public HTTP probe |
|-------|----------------|-------------------|
| AEO tree present in running image | **NOT VERIFIED** | Indirect signals only |
| AEO publicly exposed | N/A | `/config/aeo/defaults.json` → **404** (expected if not static) |

**AEO deployment on live pilot:** **CANNOT BE CONFIRMED PRESENT** — strong evidence of **diverged** runtime vs approved RC (see §4).

---

## 2. Approved RC inventory (local — present)

### `config/aeo/`

| Path | Status in RC |
|------|--------------|
| `defaults.json` | **Present** |
| `readiness-checklist.json` | **Present** |
| `business-profile-fields.json` | **Present** |
| `rules/missing-keywords.json` | **Present** |
| `rules/missing-service-areas.json` | **Present** |
| `prompts/faq-suggestions.json` | **Present** |
| `prompts/description-improve.json` | **Present** |
| `prompts/review-reply.json` | **Present** |
| `prompts/gbp-post.json` | **Present** |
| `prompts/service-description.json` | **Present** |
| `prompts/local-page.json` | **Present** |
| `prompts/social-caption.json` | **Present** |
| `prompts/whatsapp-outreach.json` | **Present** |

### `components/aeo/`

| Path | Status in RC |
|------|--------------|
| `AeoGrowthEngine.jsx` | **Present** |

### `lib/aeo/`

| Path | Status in RC |
|------|--------------|
| `compute.js` | **Present** |
| `recommendations.js` | **Present** |
| `profile.js` | **Present** |
| `prompts.js` | **Present** |
| `actions.js` | **Present** |

### `lib/scoring.js` extension

| Item | Status in RC |
|------|--------------|
| `runAeoPrompt()` | **Present** (separate from `aiScore`) |

### n8n AEO workflows (repo — not container)

| File | Status in RC |
|------|--------------|
| `n8n/aeo-profile-reminder.json` | **Present** |
| `n8n/aeo-review-reminder.json` | **Present** |
| `n8n/aeo-faq-nudge.json` | **Present** |
| `n8n/whatsapp-followup-automation.json` (Google priority) | **Present** (modified) |

**RC checksum:** Local workspace is **not a git repository** — no commit SHA for RC; treat as **unversioned file tree**.

---

## 3. Live verification matrix

| Item | Container check | HTTP / runtime signal | Live status |
|------|-----------------|----------------------|-------------|
| `config/aeo/` | **Not run** (no SSH) | `/config/aeo/defaults.json` → 404 | **Unknown** in image |
| `components/aeo/` | **Not run** | Dashboard SSR HTML: no `AEO`/`GROWTH ENGINE` strings | **Not confirmed** in client bundle |
| `lib/aeo/` | **Not run** | — | **Unknown** |
| AEO prompt configuration | **Not run** | `/api/health` has no AEO fields | **Unknown** |
| n8n AEO workflows | **Not run** (n8n on VPS) | — | **Unknown** (import state) |

### SSH verification commands (ops)

```bash
docker exec asoftech-app sh -c '
  for p in config/aeo components/aeo lib/aeo; do
    if [ -d "$p" ]; then echo "PRESENT $p"; ls "$p" | head -5; else echo "MISSING $p"; fi
  done
  test -f lib/scoring.js && grep -q runAeoPrompt lib/scoring.js && echo "PRESENT runAeoPrompt" || echo "MISSING runAeoPrompt"
'
ls -la /opt/asoftech/n8n/aeo-*.json 2>/dev/null || echo "MISSING n8n aeo json on host"
```

---

## 4. Divergence indicators (live ≠ approved RC)

| Signal | Approved RC | Live pilot (2 Aug 2026) |
|--------|-------------|-------------------------|
| `GET /api/health` pilot JSON | **Not in RC** `route.js` | **Present** on live |
| `GET /api/metrics` Prometheus | **Not in RC** | **Present** — includes `opportunities_won_total`, `pos_transactions_total` |
| `GET /billing` | **Present** in RC (`app/(application)/billing`) | **404** on live |
| `GET /api/leads` without auth | Cookie session in RC web path | **401** on live (auth enforced) |
| Git commit for RC | **None** (local not git) | **Unknown** on VPS |

**Assessment:** Live binary exhibits **extended pilot platform** features while **missing Phase-1 routes** present in RC — **not a clean AEO Phase-1 deploy**.

---

## 5. WS2 verdict

| Classification | Detail |
|----------------|--------|
| AEO files in **approved RC** | **Present** |
| AEO files on **live container** | **Unverified** — treat as **Missing until SSH proves Present** |
| **Overall** | **INVESTIGATION BLOCKED** |

---

## Related

- [05_DEPLOYMENT_ALIGNMENT.md](./05_DEPLOYMENT_ALIGNMENT.md)  
- [02_AEO_DEPLOYMENT_VERIFICATION.md](./02_AEO_DEPLOYMENT_VERIFICATION.md) — this document
