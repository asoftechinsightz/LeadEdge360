# Marketing Engine — Validation & Pending Queue

**Org:** `asoftechinsightz` · **VPS path:** `/opt/asoftech-insightz`  
**Dashboard:** `/marketing-engine` · **Growth Audit:** `/growth-audit`

Use this runbook after deploy, nginx changes, or when validating Week 1 dogfood.

---

## 1. Quick health check (VPS)

```bash
cd /opt/asoftech-insightz
npm run marketing-engine:diagnose
```

**Expected:**

- Admin `admin@asoftechinsightz.com` → `orgId=asoftechinsightz`
- Marketing content under `asoftechinsightz` (not only under a UUID org)
- `✓ Admin orgId matches marketing content.`

Full API retest:

```bash
export CERT_ADMIN_EMAIL=admin@asoftechinsightz.com
export CERT_ADMIN_PASSWORD='Asoftech@2026'
export RETEST_API_BASE=http://127.0.0.1:3000/api
npm run marketing-engine:retest
```

**Expected:** 10/10 PASS (includes daily pipeline quick mode).

---

## 2. Validate Growth Audit (lead capture)

### Browser

1. Open `https://asoftechinsightz.com/growth-audit`
2. Submit the form
3. **Expected:** green toast “Growth Audit Request Submitted”
4. **Expected:** “Recent audits” counter increments (e.g. 4 → 5)

### VPS API

```bash
cd /opt/asoftech-insightz

TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"Asoftech@2026"}' \
  | jq -r .accessToken)

curl -s http://127.0.0.1:3000/api/growth-audit | jq .

curl -s http://127.0.0.1:3000/api/leads?limit=3 \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.items[0] | {name, source, label, orgId}'
```

**Expected:** `source: "website-growth-audit"`, `orgId: "asoftechinsightz"`.

---

## 3. Validate daily pipeline (Marketing Engine)

### Browser

1. Log in as `admin@asoftechinsightz.com`
2. Open `/marketing-engine`
3. Click **Run Today's Pipeline**
4. **Expected:** toast “Daily pipeline: 7 steps completed” (not a 500 error)
5. Scroll down — **Content Calendar**, **CEO Daily Report**, **Today's Research** should populate

### VPS API

```bash
curl -s -X POST http://127.0.0.1:3000/api/marketing-engine/daily/run \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"full":true,"quick":true}' \
  | jq '{success, steps: .result.steps | length, ok: .result.ok, errors: .result.errors}'
```

**Expected:**

```json
{ "success": true, "steps": 7, "ok": true, "errors": null }
```

**Note:** Manual button uses `quick: true` (template content, finishes in seconds). Cron can pass `quick: false` for full LLM after nginx timeout is configured.

---

## 4. Dashboard metrics — what is normal (Week 1)

| Metric | Often shows | Why |
|--------|-------------|-----|
| Leads (30d) | Your audit count | Growth Audit leads in CRM |
| Hot Leads | 0 | Audit leads are labeled **Warm**, not Hot |
| Content Published | 0 | Counts `published` only; seed is `draft`/`scheduled` |
| Revenue (30d) | ₹0 | No payments yet |

**Zeros at the top do not mean failure.** Use CEO report, calendar, and pipeline toast to confirm the engine ran.

---

## 5. Pending queue — what it means

**CEO report line:** `Pending queue: N`

Counted in `lib/marketing-engine/ceo-marketing-agent.js` as all `marketing_content` for your org with:

- `status: "draft"` **or**
- `status: "scheduled"`

| Status | Meaning |
|--------|---------|
| `draft` | Created (usually weekly planner batch), not on publish calendar |
| `scheduled` | On calendar, waiting for publish time + n8n |
| `published` | Already sent — **not** in pending count |

**Typical Week 1 shape:**

- ~185 `draft` — Sunday planner batch (LinkedIn, Instagram, Facebook, Twitter, blog)
- ~3–4 `scheduled` — today's daily pipeline posts
- Pending total ≈ draft + scheduled (e.g. 188)

Report date in CEO card (e.g. `2026-06-27`) is when that report was generated; pending count grows as more content is created.

---

## 6. Check pending queue (API on VPS)

```bash
cd /opt/asoftech-insightz

TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/auth/login-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@asoftechinsightz.com","password":"Asoftech@2026"}' \
  | jq -r .accessToken)

# Scheduled content (on calendar path to publish)
curl -s "http://127.0.0.1:3000/api/marketing-engine/content?status=scheduled&limit=5" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{total: .meta.total, sample: [.items[] | {platform, title, status, scheduledAt}]}'

# Draft only (planner backlog)
curl -s "http://127.0.0.1:3000/api/marketing-engine/content?status=draft&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta.total'

# Calendar entries (publish schedule)
curl -s "http://127.0.0.1:3000/api/marketing-engine/calendar" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '[.items[] | {platform, scheduledAt, status}] | .[0:10]'
```

---

## 7. Check pending queue (MongoDB)

Connect (use credentials from VPS `.env`):

```bash
docker exec -it asoftech-mongo mongosh \
  "mongodb://USER:PASS@localhost:27017/asoftech_saas?authSource=admin"
```

Run **one query at a time** (do not paste `#` comments into mongosh).

```javascript
db.marketing_content.aggregate([
  { $match: { orgId: "asoftechinsightz", status: { $in: ["draft", "scheduled"] } } },
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

```javascript
db.marketing_content.aggregate([
  { $match: { orgId: "asoftechinsightz", status: { $in: ["draft", "scheduled"] } } },
  { $group: { _id: "$platform", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

```javascript
db.marketing_content.find(
  { orgId: "asoftechinsightz", status: "scheduled" },
  { platform: 1, title: 1, scheduledAt: 1, status: 1, _id: 0 }
).sort({ scheduledAt: 1 }).limit(5)
```

```javascript
db.marketing_content.aggregate([
  { $match: { orgId: "asoftechinsightz" } },
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

**Example platform breakdown (Week 1 seed):**

| Platform | Typical pending |
|----------|-----------------|
| Instagram | ~64 |
| LinkedIn | ~61 |
| Facebook | ~30 |
| Twitter | ~20 |
| Blog | ~13 |

---

## 8. Publish actions

| Action | Where | Effect |
|--------|-------|--------|
| **Run Today's Pipeline** | `/marketing-engine` | Research + 4 posts + graphics + reel + CEO report |
| **Publish Due Posts** | `/marketing-engine` | Sends calendar items past `scheduledAt` via n8n |
| **Campaigns** | `/campaigns` | Nurture email drafts (separate from social queue) |

Until **Week 2** (n8n + LinkedIn OAuth + cron), **Publish Due Posts** will not reduce pending counts on live social — see `docs/marketing/SOCIAL_AUTOPILOT_SETUP.md`.

---

## 9. Nginx — safe recovery (VPS)

**Do not** copy full `docs/nginx.conf` if `flows.asoftechinsightz.com` cert does not exist. n8n uses a separate vhost: `n8n.asoftechinsightz.com`.

Golden backup (after a working apply):

```bash
sudo cp /etc/nginx/sites-available/asoftech /etc/nginx/sites-available/asoftech.working-marketing
```

Restore:

```bash
sudo cp /etc/nginx/sites-available/asoftech.working-marketing /etc/nginx/sites-available/asoftech
sudo nginx -t && sudo systemctl reload nginx
```

First-time marketing timeout block (restore backup, then patch):

```bash
sudo cp /etc/nginx/sites-available/asoftech.bak.2026-06-28-0110 /etc/nginx/sites-available/asoftech

sudo sed -i '/location \/ {/i\
    location /api/marketing-engine/daily/run {\
        proxy_pass http://127.0.0.1:3000;\
        proxy_http_version 1.1;\
        proxy_set_header Host              $host;\
        proxy_set_header X-Real-IP         $remote_addr;\
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
        proxy_read_timeout 300s;\
        proxy_send_timeout 300s;\
    }\
' /etc/nginx/sites-available/asoftech

sudo nginx -t && sudo systemctl reload nginx
curl -sI https://asoftechinsightz.com | head -3
```

**Expected:** `HTTP/2 200`

If `limit_req_zone` error appears:

```bash
sudo sed -i '/limit_req_zone/d; /limit_req zone=/d' /etc/nginx/sites-available/asoftech
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Deploy bundle (Windows → VPS)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pack-marketing-launch.ps1
scp marketing-launch-bundle.tar.gz root@leadedge360:/opt/asoftech-insightz/
```

On VPS:

```bash
cd /opt/asoftech-insightz
tar xzf marketing-launch-bundle.tar.gz
bash scripts/vps-apply-marketing-launch.sh
```

---

## 11. Troubleshooting

| Symptom | Check |
|---------|--------|
| Daily pipeline 500 | `docker compose logs app --tail 50`; ensure `quick: true` for manual run |
| Daily pipeline 504 | nginx `proxy_read_timeout` for `/api/marketing-engine/daily/run` |
| Pending queue high | Normal — 185 drafts from planner; only ~4 scheduled until approval/cron |
| Calendar empty in UI | Run pipeline; check `GET /api/marketing-engine/calendar` with token |
| Growth Audit counter 0 | `GROWTH_AUDIT_ORG_ID=asoftechinsightz` in `.env` |
| Content under UUID org | `npm run pilot:align-org -- --from-email` |

---

## Related docs

- `docs/marketing/SOCIAL_AUTOPILOT_SETUP.md` — Week 2 n8n + OAuth + cron
- `docs/platform/AI_DIGITAL_MARKETING_EMPLOYEE.md` — agents & schedule
- `docs/platform/ASOFTECHINSIGHTZ_AUTONOMOUS_MARKETING_IMPLEMENTATION.md` — full roadmap
