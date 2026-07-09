# Meta Geo Leads — Setup Guide (Facebook & Instagram Places)

**Goal:** Enable the **Meta** source in Geo Lead Finder (`/leadedge360/geo-finder`) alongside Google Maps and Google Places.

---

## What Meta source does

- Searches Facebook Graph API for **business places** matching industry + PIN code
- Dedupes with Google results by contact hash
- Appears in CRM as source `meta` when converted

**Requires:** `META_ACCESS_TOKEN` in server `.env` (never expose to browser).

---

## Step 1 — Meta Developer App (15 min)

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. **My Apps** → **Create App** → type: **Business**
3. Add products:
   - **Facebook Login** (if not present)
   - **Pages** / **Marketing API** (for page data)
4. **App Settings** → **Basic** — note **App ID** and **App Secret**

---

## Step 2 — Generate access token

### Option A — Graph API Explorer (quick test)

1. [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Permissions: `pages_read_engagement`, `pages_show_list` (add more if search fails)
4. **Generate Access Token** → copy token

⚠️ Explorer tokens expire in ~1–2 hours. Use for testing only.

### Option B — Long-lived Page token (production)

```bash
# 1. Short-lived user token from Graph API Explorer
# 2. Exchange for long-lived user token:
curl -s "https://graph.facebook.com/v21.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN" | jq -r .access_token

# 3. Get Page ID:
curl -s "https://graph.facebook.com/v21.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN" | jq

# 4. Page access token (does not expire if from long-lived user token):
# Use the "access_token" field from the page object in step 3
```

Use the **Page access token** as `META_ACCESS_TOKEN`.

---

## Step 3 — VPS `.env`

```bash
cd /opt/asoftech-insightz
nano .env
```

Add:

```env
META_ACCESS_TOKEN=your_page_or_user_access_token_here
```

Also accepted (fallback order in code):

```env
FACEBOOK_ACCESS_TOKEN=...
META_PAGE_ACCESS_TOKEN=...
```

Rebuild:

```bash
docker compose up -d app
```

---

## Step 4 — Verify

### API readiness (Google + Meta)

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"YOUR_PASSWORD"}' \
  | jq -r .accessToken)

# Google keys
curl -s http://127.0.0.1:3000/api/scanner/readiness \
  -H "Authorization: Bearer $TOKEN" | jq

# Meta scan (PIN + Real Estate, all sources)
curl -s -X POST http://127.0.0.1:3000/api/scanner/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "pinCode": "201306",
    "industry": "Real Estate",
    "radiusKm": 10,
    "sources": ["google_maps_nearby", "google_places_text", "meta_places"],
    "qualityOnly": true,
    "run": true
  }' | jq '{total, stats, warnings: .stats.warnings}'
```

Expected in stats:

- `bySource.meta_places` > 0 (if businesses exist in Meta for that query)
- No warning: `META_ACCESS_TOKEN not configured`

### UI

1. `/leadedge360/geo-finder`
2. Enter PIN → select **Real Estate**
3. Source: **All Sources (Combined)** or **Meta**
4. Run scan — **Source** column should show `Meta` for some rows

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Warning: `META_ACCESS_TOKEN not configured` | Add token to `.env`, rebuild app |
| Meta returns 0 places | Normal for some PIN/industry combos; Google may have more coverage |
| OAuth error 190 | Token expired — regenerate long-lived Page token |
| `(#200) Requires extended permission` | Add `pages_read_engagement` in App Review or use Page token |
| Duplicate leads | Expected — dedupe merges same phone/website across sources |

---

## Security

| Do | Don't |
|----|-------|
| Store token in `.env` on VPS only | Commit token to git |
| Use Page token scoped to your business | Share token in chat/email |
| Rotate if leaked | Use personal Facebook password in app |

---

## Related

- [GEO_LEAD_FINDER_QUALITY.md](./GEO_LEAD_FINDER_QUALITY.md)
- `.env.example` — `META_ACCESS_TOKEN` placeholder
- `lib/scanner/providers/meta.js` — implementation
