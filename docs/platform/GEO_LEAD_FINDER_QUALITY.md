# Geo Lead Finder — Multi-Source & Quality Validation

**Route:** `/leadedge360/geo-finder`  
**API:** `POST /api/scanner/jobs`

---

## What changed

| Before | After |
|--------|-------|
| Google Nearby only | **Google Maps (Nearby)** + **Google Places (Text)** combined |
| No junk filter | **Quality filter** — requires phone OR website |
| All scores = 50 | **Real AI lead score** at scan time |
| Weak CRM dedupe (company name only) | Dedupe on **phone + website + company** hash |
| Closed businesses included | **Permanently closed** listings rejected |

---

## PIN code first (location auto-fill)

1. User enters **6-digit PIN** → `GET /api/scanner/pincode/{pin}`
2. City, district, state auto-fill from India Post data (read-only in UI)
3. Geocode and all provider searches use **PIN only** (`201306, India`) — not manual city text

Example: PIN `201306` → Noida, Gautam Buddha Nagar, Uttar Pradesh

---

| Source | Provider ID | How it works |
|--------|-------------|--------------|
| All Sources (Combined) | `google_maps_nearby` + `google_places_text` + `meta_places` | Default — deduped |
| Google Maps (Nearby) | `google_maps_nearby` | Radius search from geocoded city/pin |
| Google Places (Text) | `google_places_text` | Keyword search e.g. "Real Estate 226001 Lucknow" |
| Meta (Facebook & Instagram) | `meta_places` | Facebook Graph place search |

**Future:** IndiaMART, JustDial native APIs (requires partner keys).

---

## Critical sectors (dropdown — 10 only)

| Sector | Lead weight |
|--------|-------------|
| Real Estate | 20 |
| Healthcare & Hospitals | 17 |
| Dental Clinic | 16 |
| Restaurant & Cafe | 14 |
| Retail Store | 10 |
| Gym & Fitness | 14 |
| Salon & Beauty | 12 |
| Interior Design | 18 |
| Education & Coaching | 12 |
| Manufacturing | 11 |

Defined in `lib/scanner/constants.js` → `GEO_CRITICAL_INDUSTRIES`.

---

## Quality validation rules

When **Quality leads only** is checked (default ON):

- Reject if **no phone AND no website**
- Reject if **permanently closed**
- Reject if company name missing

Quality tiers stored on each result:

| Tier | Meaning |
|------|---------|
| `verified` | Phone + website |
| `partial` | Phone or website |

---

## Uniqueness

1. **Across sources** — same Google `place_id` merged in one scan
2. **Across scans** — Mongo unique index `{ orgId, dedupeHash }`
3. **CRM convert** — blocks duplicate phone, website, or company

---

## API example

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"YOUR_PASSWORD"}' \
  | jq -r .accessToken)

curl -s -X POST http://127.0.0.1:3000/api/scanner/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "pinCode": "226001",
    "industry": "Real Estate",
    "radiusKm": 10,
    "sources": ["google_maps_nearby", "google_places_text"],
    "qualityOnly": true,
    "run": true
  }' | jq '{total: .total, stats}'
```

**Response stats:**

```json
{
  "totalFound": 40,
  "totalStored": 12,
  "totalRejected": 25,
  "totalDuplicates": 3
}
```

---

## Required env vars

```env
GOOGLE_MAPS_API_KEY=...      # Geocoding
GOOGLE_PLACES_API_KEY=...    # Nearby + Text search + details
META_ACCESS_TOKEN=...        # Meta Graph API — see docs/platform/META_GEO_LEADS_SETUP.md
```

---

## Key files

- `lib/scanner/runner.js` — orchestration
- `lib/scanner/validate.js` — quality rules
- `lib/scanner/providers/google.js` — Google APIs
- `lib/scanner/providers/index.js` — multi-source merge
- `lib/scanner/convert.js` — CRM dedupe on convert
- `components/leadedge360/enterprise/GeoLeadFinder.tsx` — UI
